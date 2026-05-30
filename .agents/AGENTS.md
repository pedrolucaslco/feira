# Feira — Estado Atual

## O Que Foi Feito
- Vite configurado com multi-page: `/` → `index.html` (landing page), `/app/*` → `app.html` (SPA)
- Middleware SPA no `vite.config.js` faz rewrite de `/app/*` para `app.html`
- `src/router.js`: roteamento por History API com guard de autenticação
- `src/auth.js`: Supabase Auth (email/senha, magic link, Google OAuth, anônimo + guest mode)
- `app.html`: shell do app com todas as views (lista, compras, refeições, config) + view de login
- Landing page `index.html` com links e manifesto PWA
- Pre-commit hook auto-bumps `sw.js` cache version

## Modularização (Fases 1-4)
`app.js` reduzido de ~3792 → ~1618 linhas via extrações em fases:

### Fase 1 — Utilitários
- `src/constants.js` — constantes, defaults, storage keys
- `src/utils.js` — 19 funções puras (createId, formatCurrency, escapeHtml, etc.)
- `src/theme.js` — tema (dark/light) com toggle
- `src/profile.js` — perfil local (localStorage)
- `src/db.js` — wrapper IndexedDB (open, getAll, putOne, deleteOne, bulkPut, clearStore)
- `src/dates.js` — monthBounds, billingPeriodBounds

### Fase 2 — Dados
- `src/normalizers.js` — normalização de entidades (items, categories, meals, purchases, etc.)
- `src/state.js` — variável global `state` + loadState/seedData/migrateLocalRecords/reloadAndRender

### Fase 3 — Sincronização
- `src/sync.js` — enqueue, pull, resolveConflict, saveRecord, deleteRecord, syncNow, subscribe

### Fase 4 — CRUD (extraído de app.js)
- `src/spaces.js` — criar/entrar/renomear/trocar espaços, menu de espaços
- `src/settings.js` — `saveBudget`, `saveProfile`, `changeEditorMode`, `resetDatabase`, `editorMode`
- `src/shopping.js` — CRUD de itens + CRUD de categorias (abrir/salvar/remover/ordenar/recolher)
- `src/meals.js` — CRUD de refeições + `addMealToCurrentList`
- `src/purchases.js` — CRUD de compras + sessões de compra (iniciar/cancelar/checkout inline e modal)

## Atalhos/Hooks
- `sw.js` — service worker com cache version auto-bumpada por pre-commit hook
- `.git/hooks/pre-commit` — incrementa versão do cache do SW a cada commit

## Próximos Passos (Fase 5+)
1. **`src/rendering.js`** — extrair todas as funções render de `app.js`:
   - `renderFinancialState`, `renderPurchasePeriod`, `renderPurchaseChart`
   - `updatePurchaseSessionTimer`, `syncPurchaseSessionTimer`, `renderPurchaseSessionBar`
   - `renderWeeklyBudget`, `renderProfile`, `renderItems`, `renderMeals`
   - `renderNavigation`, `renderChangelog`, `renderSettings`, `renderIcons`
   - `render`, `setView`, `renderConflicts`, `renderQuickNote`
2. **`src/drag.js`** — extrair funções de drag-and-drop:
   - `bindItemLongPressDrag`, `updateItemDropTarget`, `moveDraggedItemToTarget`
   - `clearItemDropIndicators`, `bindItemLongPressDrag`, `animateCategoryList`
3. **`src/conflicts.js`** — extrair resolução de conflitos:
   - `openConflictDialog`, `closeConflictDialog`, `applySandboxConflictResolution`
   - `renderSyncTestRows`, `renderSyncTestSummary`, `runSyncDiagnostics`
4. **Refatorar `app.js`** para bootstrap puro:
   - `preventIOSZoomGestures`, `bindEvents`, `bindLoginEvents`
   - `registerServiceWorker`, `setupRouter`, `init`
   - `handleFabButton`, `toggleListMenu`, `closeListMenu`
   - `showToast`, quick note functions (`loadQuickNote`, `saveQuickNote`, etc.)
   - `showOnboarding`, `transformNoteToItems`
   - `waitForControllerChange`, `waitForWorkerState`, `updateServiceWorkers`, `refreshApp`

## Script Loading Order
```html
<script src="./src/router.js" defer></script>
<script src="./src/auth.js" defer></script>
<script src="./src/constants.js" defer></script>
<script src="./src/utils.js" defer></script>
<script src="./src/theme.js" defer></script>
<script src="./src/profile.js" defer></script>
<script src="./src/db.js" defer></script>
<script src="./src/dates.js" defer></script>
<script src="./src/normalizers.js" defer></script>
<script src="./src/state.js" defer></script>
<script src="./src/sync.js" defer></script>
<script src="./src/spaces.js" defer></script>
<script src="./src/settings.js" defer></script>
<script src="./src/shopping.js" defer></script>
<script src="./src/meals.js" defer></script>
<script src="./src/purchases.js" defer></script>
<script src="./app.js" defer></script>
<script src="./components/items.js" defer></script>
<script src="./components/meals.js" defer></script>
<script src="./components/purchases.js" defer></script>
<script src="./components/categories.js" defer></script>
```
