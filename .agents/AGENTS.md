# Feira — Estado Atual

## O Que Foi Feito
- Vite configurado com multi-page: `/` → `index.html` (landing page), `/app/*` → `app.html` (SPA)
- Middleware SPA no `vite.config.js` faz rewrite de `/app/*` para `app.html`
- `src/router.js`: roteamento por History API com guard de autenticação
- `src/auth.js`: Supabase Auth (email/senha, magic link, Google OAuth, anônimo + guest mode)
- `app.html`: shell do app com todas as views (lista, compras, refeições, config) + view de login
- `app.js` integrado com router e auth:
  - `init()` chama `FeiraAuth.init()` → `setupRouter()` → `render()`
  - Nav buttons usam `FeiraRouter.navigate()` em vez de `setView()` direto
  - Guard redireciona para `/app/login` quando não há sessão nem guest mode
  - Login view com abas "Entrar" / "Criar conta", Google, "Continuar sem login"
  - Seção de conta nos ajustes mostra status e botão Entrar/Sair
- Landing page `index.html` com links e manifesto PWA

## Status Atual
- ✅ Vite dev server serve corretamente todas as URLs
- ✅ Build de produção funciona
- ✅ App funcional com navegação por URL
- ✅ Loading state com overlay e spinner enquanto `init()` carrega (desaparece após `render()`)
- ✅ Onboarding sheet iOS-style (3 páginas: Lista, Gastos, Refeições/Sincronia) com dots, botões Anterior/Próximo/Pular, e flag `feira:onboarding-seen` no localStorage
- ✅ Nota Rápida — nova view `/app/nota` com editor WYSIWYG (`contenteditable`), checkboxes visuais em linhas `- `, salva automaticamente no localStorage, botão "Transferir para lista" que parseia linhas `- nome, qtd` e adiciona como itens

## Próximos Passos
1. **Modularizar `app.js`** (~3600 linhas) em arquivos menores:
   - `src/db.js` — operações IndexedDB
   - `src/state.js` — estado global e init
   - `src/sync.js` — sincronização Supabase
   - `src/views/` — renderização por view
2. **Google OAuth** — configurar provedor no dashboard do Supabase
3. **WhatsApp link** — substituir `SEU_NUMERO` na landing page
4. **Testar fluxo offline/auth** completo
