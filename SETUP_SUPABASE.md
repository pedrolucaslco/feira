# Setup Supabase — Feira

Guia completo para configurar o backend Supabase necessário para sincronia, compartilhamento de espaços e autenticação.

---

## 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta.
2. Crie um novo projeto.
3. Defina a **Database Region** mais próxima de você.
4 Após criar, vá em **Project Settings > API** e anote:
   - **Project URL**
   - **anon public key**

---

## 2. Configurar autenticação

### Email/Password (já habilitado por padrão)

Vá em **Authentication > Providers** e confirme que **Email** está ativado.

### Magic Link (OTP)

No mesmo **Email** provider, ative "Confirm email" e "Secure email change". O magic link usa `signInWithOtp`.

### Anonymous sign-in

Em **Authentication > Settings**, ative **Allow anonymous sign-ins**.

### Google OAuth (opcional)

1. Em **Authentication > Providers**, ative **Google**.
2. Siga as instruções para criar um Client ID no Google Cloud Console.
3. Configure a redirect URI fornecida pelo Supabase.

---

## 3. Executar o SQL no banco

Vá em **SQL Editor**, crie uma **New Query** e cole o script abaixo. Ele cria todo o schema de uma vez:

```sql
-- ============================================================
-- SCHEMA COMPLETO — FEIRA
-- ============================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------
-- Tabela: spaces
-- -----------------------------------------------------------
create table if not exists public.spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Novo espaço',
  invite_code text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------
-- Tabela: space_members
-- -----------------------------------------------------------
create table if not exists public.space_members (
  space_id uuid not null references public.spaces(id) on delete cascade,
  user_id uuid not null default auth.uid(),
  role text not null default 'editor',
  created_at timestamptz not null default now(),
  primary key (space_id, user_id)
);

-- -----------------------------------------------------------
-- Tabela: space_records
-- -----------------------------------------------------------
create table if not exists public.space_records (
  space_id uuid not null references public.spaces(id) on delete cascade,
  entity_type text not null,
  entity_id text not null,
  data jsonb,
  version integer not null default 1,
  deleted_at timestamptz,
  updated_by uuid not null default auth.uid(),
  updated_at timestamptz not null default now(),
  primary key (space_id, entity_type, entity_id)
);

-- -----------------------------------------------------------
-- Check constraint para entity_type
-- -----------------------------------------------------------
alter table public.space_records
drop constraint if exists space_records_entity_type_check;

alter table public.space_records
add constraint space_records_entity_type_check
check (entity_type in ('item', 'category', 'purchase', 'purchase_session', 'meal', 'settings'));

-- -----------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------
alter table public.spaces enable row level security;
alter table public.space_members enable row level security;
alter table public.space_records enable row level security;

-- Spaces: leitura apenas para membros
drop policy if exists "Members can read spaces" on public.spaces;
create policy "Members can read spaces"
on public.spaces for select to authenticated
using (
  exists (
    select 1 from public.space_members
    where space_members.space_id = spaces.id
      and space_members.user_id = auth.uid()
  )
);

-- Spaces: update apenas para membros
drop policy if exists "Members can update spaces" on public.spaces;
create policy "Members can update spaces"
on public.spaces for update to authenticated
using (
  exists (
    select 1 from public.space_members
    where space_members.space_id = spaces.id
      and space_members.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.space_members
    where space_members.space_id = spaces.id
      and space_members.user_id = auth.uid()
  )
);

-- Space members: cada um vê sua própria entrada
drop policy if exists "Members can read memberships" on public.space_members;
create policy "Members can read memberships"
on public.space_members for select to authenticated
using (user_id = auth.uid());

-- Space records: leitura para membros do espaço
drop policy if exists "Members can read records" on public.space_records;
create policy "Members can read records"
on public.space_records for select to authenticated
using (
  exists (
    select 1 from public.space_members
    where space_members.space_id = space_records.space_id
      and space_members.user_id = auth.uid()
  )
);

-- Space records: escrita para membros do espaço
drop policy if exists "Members can write records" on public.space_records;
create policy "Members can write records"
on public.space_records for all to authenticated
using (
  exists (
    select 1 from public.space_members
    where space_members.space_id = space_records.space_id
      and space_members.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.space_members
    where space_members.space_id = space_records.space_id
      and space_members.user_id = auth.uid()
  )
);

-- -----------------------------------------------------------
-- RPC: create_space
-- -----------------------------------------------------------
create or replace function public.create_space(space_name text)
returns table (id uuid, name text, invite_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  created_space public.spaces;
begin
  insert into public.spaces (name, created_by)
  values (coalesce(nullif(trim(space_name), ''), 'Novo espaço'), auth.uid())
  returning * into created_space;

  insert into public.space_members (space_id, user_id, role)
  values (created_space.id, auth.uid(), 'editor');

  return query
  select created_space.id, created_space.name, created_space.invite_code;
end;
$$;

-- -----------------------------------------------------------
-- RPC: join_space
-- -----------------------------------------------------------
create or replace function public.join_space(invite_code_input text)
returns table (id uuid, name text, invite_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_space public.spaces;
begin
  select *
  into target_space
  from public.spaces as spaces_table
  where spaces_table.invite_code = upper(trim(invite_code_input));

  if target_space.id is null then
    raise exception 'invalid invite code';
  end if;

  insert into public.space_members (space_id, user_id, role)
  values (target_space.id, auth.uid(), 'editor')
  on conflict (space_id, user_id) do nothing;

  return query
  select target_space.id, target_space.name, target_space.invite_code;
end;
$$;

-- -----------------------------------------------------------
-- RPC: apply_space_change
-- -----------------------------------------------------------
create or replace function public.apply_space_change(
  target_space_id uuid,
  target_entity_type text,
  target_entity_id text,
  change_data jsonb,
  base_version integer,
  is_deleted boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_record public.space_records;
  next_version integer;
begin
  if not exists (
    select 1 from public.space_members
    where space_id = target_space_id
      and user_id = auth.uid()
  ) then
    raise exception 'not a member';
  end if;

  select *
  into current_record
  from public.space_records
  where space_id = target_space_id
    and entity_type = target_entity_type
    and entity_id = target_entity_id;

  if current_record.space_id is not null and current_record.version <> base_version then
    return jsonb_build_object('status', 'conflict', 'remote_record', to_jsonb(current_record));
  end if;

  next_version := coalesce(current_record.version, 0) + 1;

  insert into public.space_records (
    space_id, entity_type, entity_id, data, version, deleted_at, updated_by, updated_at
  )
  values (
    target_space_id,
    target_entity_type,
    target_entity_id,
    case when is_deleted then current_record.data else change_data end,
    next_version,
    case when is_deleted then now() else null end,
    auth.uid(),
    now()
  )
  on conflict (space_id, entity_type, entity_id)
  do update set
    data = excluded.data,
    version = excluded.version,
    deleted_at = excluded.deleted_at,
    updated_by = excluded.updated_by,
    updated_at = excluded.updated_at;

  return jsonb_build_object('status', 'ok', 'version', next_version);
end;
$$;

-- -----------------------------------------------------------
-- Grants
-- -----------------------------------------------------------
grant execute on function public.create_space(text) to authenticated;
grant execute on function public.join_space(text) to authenticated;
grant execute on function public.apply_space_change(uuid, text, text, jsonb, integer, boolean) to authenticated;

-- -----------------------------------------------------------
-- Realtime
-- -----------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.space_records;
exception
  when duplicate_object then null;
end;
$$;
```

> **Nota:** Este SQL é a versão consolidada e final. Se você já rodou versões anteriores, ele é seguro rodar novamente (usa `create if not exists`, `drop policy if exists`, `create or replace`).

---

## 4. Configurar o cliente

Edite o arquivo `supabase-config.js` na raiz do projeto com os dados do seu projeto:

```js
window.FEIRA_SUPABASE = {
  url: "https://SEU_PROJECT.supabase.co",
  anonKey: "sua_anon_key_aqui",
};
```

---

## 5. Realtime

O SQL já ativa a publicação Realtime para a tabela `space_records`. Para verificar:

1. Vá em **Database > Replication**.
2. Confirme que a tabela `public.space_records` está na publicação `supabase_realtime`.

---

## 6. (Opcional) Deploy no Vercel

Não precisa de configuração extra de ambiente — o `supabase-config.js` já é incluído no build como arquivo estático. Basta fazer deploy normalmente.

---

## Entities sincronizadas

| Store (IndexedDB)     | entity_type        |
|-----------------------|--------------------|
| `items`               | `item`             |
| `categories`          | `category`         |
| `purchases`           | `purchase`         |
| `purchaseSessions`    | `purchase_session` |
| `meals`               | `meal`             |
| `settings`            | `settings`         |

Todas as 6 entidades são sincronizadas via `apply_space_change` e replicadas entre os membros do espaço via Realtime.
