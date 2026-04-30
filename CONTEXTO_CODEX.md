# Feira - Contexto para Sessões do Codex

Use este arquivo como ponto de partida em novas sessões do Codex. Ele resume como o projeto está organizado, quais arquivos normalmente mudam em cada tipo de alteração e o que precisa ser atualizado quando uma funcionalidade nova entra no app.

## Leitura Inicial Recomendada

Antes de alterar código, leia nesta ordem:

1. `CONTEXTO_PROJETO.md`: estado atual do produto, decisões técnicas, fluxo e último marco.
2. `ideia.md`: ideia original e limites do MVP.
3. `README.md`: descrição pública do projeto e lista de funcionalidades atuais.
4. `app.js`, `index.html`, `styles.css` e `sw.js`: implementação real.

O projeto é um PWA estático, sem build:

- HTML puro.
- CSS puro.
- JavaScript puro.
- IndexedDB nativo.
- Service worker com cache offline.
- Lucide Icons via CDN.

## Arquivos Principais

- `index.html`: estrutura das telas, modais, botões, navegação e textos visíveis.
- `styles.css`: layout mobile-first, tema claro/escuro, accent colors, cards, modais, lista, gráficos e responsividade.
- `app.js`: estado, IndexedDB, regras de negócio, renderização manual, eventos, formulários, modais, drag and drop e PWA refresh.
- `sw.js`: service worker, lista de assets cacheados e versão do cache.
- `supabase-config.js`: configuração pública opcional do Supabase (`url` e `anonKey`).
- `supabase.sql`: schema, RLS, Realtime e RPCs para espaços compartilhados.
- `manifest.webmanifest`: metadados PWA, nome, cores e ícones.
- `icon.svg`: ícone do app.
- `README.md`: documentação pública.
- `CONTEXTO_PROJETO.md`: memória detalhada do desenvolvimento.
- `ideia.md`: escopo e fluxo original do POC.

## Versão do Projeto

Hoje não existe `package.json`, tag semântica ou versão de app centralizada. A versão operacional usada pelo navegador é a versão do cache no service worker.

Arquivo obrigatório:

- `sw.js`
  - Atualizar `CACHE_NAME`, por exemplo de `feira-v30` para `feira-v31`.
  - Fazer isso sempre que mudar qualquer asset cacheado: `index.html`, `styles.css`, `app.js`, `supabase-config.js`, `manifest.webmanifest` ou `icon.svg`.
  - Este projeto deve sempre incrementar o cache nessas mudanças.

Arquivo de contexto que também deve acompanhar:

- `CONTEXTO_PROJETO.md`
  - Atualizar a seção **PWA e Cache** com a nova versão, por exemplo `feira-v31`.
  - Explicar em uma frase por que o cache foi incrementado.
  - Atualizar **Último Marco** com a funcionalidade entregue e a lista de arquivos alterados.

Quando houver mudança pública relevante:

- `README.md`
  - Atualizar **Funcionalidades atuais**.
  - Atualizar **Próximos passos** removendo itens já concluídos.
  - Ajustar **Modelo de dados** se a estrutura persistida mudar.

Quando houver mudança de schema do IndexedDB:

- `app.js`
  - Incrementar `DB_VERSION`.
  - Atualizar `openDatabase()` com criação ou migração de stores/campos.
  - Garantir compatibilidade com dados antigos, porque usuários podem ter IndexedDB persistido.
- `CONTEXTO_PROJETO.md`
  - Atualizar a seção **Persistência** e o modelo dos dados.
- `README.md`
  - Atualizar **Modelo de dados** se a mudança for relevante para documentação pública.

## Checklist por Tipo de Mudança

### Nova funcionalidade de interface

Arquivos mais prováveis:

- `index.html`: adicionar controles, seções, modais ou elementos semânticos.
- `styles.css`: criar estilos e estados responsivos.
- `app.js`: conectar eventos, estado e renderização.
- `sw.js`: incrementar `CACHE_NAME`.
- `CONTEXTO_PROJETO.md`: registrar a funcionalidade e o novo cache.
- `README.md`: adicionar à lista de funcionalidades se for algo visível ao usuário.

### Nova regra de negócio

Arquivos mais prováveis:

- `app.js`: implementar cálculo, validação, persistência ou renderização derivada.
- `CONTEXTO_PROJETO.md`: explicar regra e impacto no fluxo.
- `README.md`: documentar se alterar o comportamento esperado pelo usuário.
- `sw.js`: incrementar `CACHE_NAME` se `app.js` mudou.

### Mudança visual ou UX

Arquivos mais prováveis:

- `styles.css`: layout, cores, espaçamento, modais, estados e animações.
- `index.html`: apenas se a estrutura ou textos mudarem.
- `app.js`: apenas se houver estado/evento novo.
- `CONTEXTO_PROJETO.md`: atualizar **Particularidades de UX** quando a direção visual mudar.
- `README.md`: atualizar se for uma funcionalidade de UX relevante.
- `sw.js`: incrementar `CACHE_NAME`.

### Mudança PWA, cache ou instalação

Arquivos mais prováveis:

- `sw.js`: cache, assets, estratégia de fetch e `CACHE_NAME`.
- `manifest.webmanifest`: nome, cores, ícones, start URL ou display.
- `index.html`: meta tags, manifest, theme-color.
- `README.md`: instruções de uso/instalação se mudarem.
- `CONTEXTO_PROJETO.md`: atualizar **PWA e Cache**.

### Mudança de dados persistidos

Arquivos mais prováveis:

- `app.js`: `DB_VERSION`, `openDatabase()`, seed, leitura, escrita e migração.
- `CONTEXTO_PROJETO.md`: modelo atualizado em **Persistência**.
- `README.md`: modelo atualizado se relevante.
- `sw.js`: incrementar `CACHE_NAME`.

## Funcionalidades Já Descritas nos Contextos

Ao implementar algo citado em `ideia.md` ou `CONTEXTO_PROJETO.md`, confira se já não existe no app. Alguns itens do plano original já foram implementados e alguns próximos passos ficaram desatualizados.

Já existem no app:

- Dashboard com saldo, planejamento semanal, lista resumida e últimas compras.
- Lista de mercado com itens, quantidade, check, edição e remoção via modal.
- Seções personalizadas na lista, sugestões rápidas, acordeon e drag and drop.
- Registro, edição e remoção de compras via modal.
- Histórico e gráfico simples de compras.
- Budget mensal e dia de fechamento do cartão.
- Perfil local, avatar, saudação, modo escuro e accent configurável.
- Reset local e atualização manual do app.
- PWA com service worker e cache.

Antes de adicionar uma funcionalidade nova:

1. Verificar se ela está no **MVP**, em **Próximos Passos Possíveis** ou em **Evolução de produto** no `CONTEXTO_PROJETO.md`.
2. Implementar primeiro no menor conjunto de arquivos possível.
3. Atualizar documentação somente no nível compatível com a entrega.
4. Incrementar o cache quando qualquer asset do PWA mudar.

## Padrão Observado nos Commits

O histórico usa Conventional Commits simples:

- `feat: ...` para funcionalidade.
- `fix: ...` para correção.
- `refactor: ...` para ajustes internos ou simplificação.
- Commits iniciais usam `Create ...` e `first commit`.

Commits grandes de funcionalidade normalmente alteram:

- `CONTEXTO_PROJETO.md`
- `README.md`
- `app.js`
- `index.html`
- `styles.css`
- `sw.js`

Exemplos observados:

- `feat: sections on list` alterou contexto, README, app, HTML, CSS e service worker.
- `feat: optimizations` alterou contexto, README, app, HTML, CSS e service worker.
- `feat: dark mode` alterou contexto, README, app, HTML, CSS e service worker.
- `fix: button foreground contrast` alterou CSS, contexto e service worker.
- `refactor: remove dialog input focus` alterou apenas `app.js`, sem atualizar cache no commit mais recente.

Regra prática:

- Se a mudança afeta o que o usuário vê ou baixa no PWA, incluir `sw.js` com cache incrementado.
- Se a mudança envolver compartilhamento, conferir `supabase.sql`, `supabase-config.js`, stores de sync e isolamento por `spaceId`.
- Se a mudança é interna e pequena, como um ajuste pontual em JS, pode não exigir README, mas ainda pode exigir cache se o objetivo for publicar a alteração para usuários com PWA/cache.
- Se a mudança muda escopo, fluxo, tela, persistência ou comportamento documentável, atualizar `CONTEXTO_PROJETO.md`.

## Fluxo Seguro para Novas Sessões

1. Rodar `git status --short` e preservar mudanças existentes.
2. Ler os arquivos de contexto e confirmar o último cache em `sw.js`.
3. Implementar a funcionalidade nos arquivos do app.
4. Se `index.html`, `styles.css`, `app.js`, `manifest.webmanifest` ou `icon.svg` mudarem, incrementar `CACHE_NAME` em `sw.js`.
5. Atualizar `CONTEXTO_PROJETO.md` com:
   - funcionalidade implementada;
   - cache atual;
   - último marco;
   - arquivos alterados.
6. Atualizar `README.md` se a funcionalidade for visível, pública ou remover um próximo passo.
7. Rodar um servidor estático somente quando for necessário ou quando o usuário pedir:

```bash
python3 -m http.server 5174
```

URL esperada:

```txt
http://localhost:5174/
```

8. Fazer verificação manual no navegador quando possível e solicitado, especialmente em alterações de UI/PWA.

## Observações Importantes

- Não há testes automatizados.
- Não há lint/build configurado.
- Evitar dependências novas enquanto o projeto seguir sem Node/npm.
- O app é mobile-first; validar telas pequenas antes de considerar pronto.
- IndexedDB e service worker podem manter dados/cache antigos por origem.
- Mudar porta no servidor local pode alterar o contexto de dados no navegador.
- Textos e documentação estão em português do Brasil.
