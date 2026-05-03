# Feira - Contexto do Projeto

Este arquivo registra onde paramos no desenvolvimento do projeto **Feira**, para facilitar futuras consultas e continuidade.

## Ideia Original

O projeto nasceu do arquivo `ideia.md`.

Conceito:

```txt
Lista de mercado + controle de saldo mensal
```

Fluxo principal:

```txt
Adicionar itens -> Ir ao mercado -> Dar check -> Finalizar compra -> Inserir total -> Atualizar saldo
```

O objetivo inicial era criar um **POC em 1 dia** de um app de compras com controle de budget mensal.

## Escopo do MVP

Funcionalidades do MVP:

- Budget mensal.
- Aba de ajustes.
- Modo escuro com preferência local.
- Navegação inferior com Lucide Icons via CDN.
- Tela inicial na lista de mercado.
- Indicador de planejamento semanal baseado no fechamento do cartão.
- Tela Compras para histórico e métricas.
- Perfil local com nome, avatar e saudação.
- Tela de lista completa.
- Modal compartilhado para adicionar e editar itens.
- Saldo restante no topo ao lado da saudação.
- Adição inline acima da lista.
- Total gasto no mês.
- Saldo restante.
- Número de compras feitas.
- Lista de mercado com nome, quantidade e marcado/desmarcado.
- Registro de compra pelo botão flutuante na tela Compras.
- Modal de compra com valor total.
- Histórico simples das compras do mês.
- Reset dos dados locais.
- Persistência offline local.

Fora do escopo neste momento:

- Login.
- Backend.
- Sincronização em tempo real.
- Multiusuário.
- Categorias complexas.
- Preço por item.

## Decisões Técnicas

A ideia inicial mencionava **Vite + React + Dexie**, mas o ambiente local não tinha `node` nem `npm` disponíveis no momento da implementação.

Por isso, a primeira versão foi implementada como app estático:

- HTML puro.
- CSS puro.
- JavaScript puro.
- IndexedDB nativo no lugar de Dexie.
- PWA básico com `manifest.webmanifest` e `sw.js`.

Essa decisão foi tomada para não bloquear o desenvolvimento. A migração para React/Dexie continua possível quando Node estiver disponível.

## Estrutura Atual

Arquivos principais:

- `index.html`: estrutura da interface.
- `styles.css`: estilos responsivos do app.
- `app.js`: lógica de estado, IndexedDB, renderização e eventos.
- `manifest.webmanifest`: configuração PWA.
- `sw.js`: service worker e cache offline.
- `supabase-config.js`: configuração pública opcional do Supabase.
- `supabase.sql`: schema/RLS/RPCs para espaços compartilhados.
- `icon.svg`: ícone do app.
- `ideia.md`: documento original da ideia.
- `CONTEXTO_PROJETO.md`: este arquivo.

## Persistência

O app usa IndexedDB com o banco:

```txt
feira-db
```

Stores:

```txt
items
categories
purchases
meals
settings
spaces
syncOutbox
syncMeta
syncConflicts
```

Modelo atual dos dados:

```js
items: {
  id: string,
  spaceId: string,
  name: string,
  quantity: string,
  categoryId: string,
  checked: boolean, // sincronizado em espaços compartilhados
  createdAt: number
}

categories: {
  id: string,
  spaceId: string,
  name: string,
  createdAt: number
}

purchases: {
  id: string,
  spaceId: string,
  name: string,
  total: number,
  date: number
}

meals: {
  id: string,
  spaceId: string,
  name: string,
  items: Array<{
    id: string,
    name: string,
    quantity: string,
    createdAt: number
  }>,
  createdAt: number,
  updatedAt: number
}

settings: {
  id: `${spaceId}:main`,
  spaceId: string,
  monthlyBudget: number,
  cardClosingDay: number | ""
}

preferências locais:
{
  userName: string,
  userGender: "neutral" | "male" | "female",
  editorMode: "modal" | "inline"
}

spaces: {
  id: "local" | string,
  name: string,
  type: "local" | "shared",
  inviteCode?: string,
  createdAt: number
}
```

Budget padrão inicial:

```txt
R$ 1200,00
```

Itens padrão iniciais:

```txt
Arroz - 1 pacote
Feijão - 1 kg
Leite - 2 un
Café
```

## Funcionalidades Implementadas

### Topbar financeira

A topbar fixa mostra:

- Saldo restante.
- Planejamento semanal.

O planejamento semanal usa o dia de fechamento do cartão configurado em **Ajustes**:

```txt
saldo sugerido por semana = saldo restante / semanas até o fechamento
```

Se o fechamento estiver configurado para um dia que não existe no mês atual, como 31 em fevereiro, o app usa o último dia válido daquele mês.

### Refeições

Mostra:

- Refeições salvas com listas isoladas de itens.
- Modal para criar, editar e excluir refeições.
- Botão para adicionar os itens de uma refeição à lista de compras atual.
- Mesclagem por nome ao copiar, somando quantidades como texto quando forem diferentes.

### Compras

Mostra:

- Planejamento semanal.
- Período financeiro atual, com data inicial e final.
- Gasto do período e budget no mesmo indicador.
- Gráfico simples de barras para variação das compras, com linha de mediana.
- Quantidade de compras no cabeçalho do histórico.
- Histórico de compras do período.
- Edição de compra ao clicar na linha.
- Remoção de compra apenas dentro do modal de edição.

O saldo é calculado assim:

```txt
saldo = monthlyBudget - soma das compras do período financeiro atual
```

Se houver dia de fechamento, o período começa nesse dia e termina no dia anterior ao próximo fechamento. Ex.: com fechamento dia 24, o ciclo de maio vai de 24/04 a 23/05; compras em 24/04 já entram em maio.

Sem dia de fechamento, o app usa o mês do calendário.

### Ajustes

O usuário pode editar o budget mensal e o dia de fechamento do cartão na aba **Ajustes**.

O campo aceita valores em formato brasileiro, por exemplo:

```txt
1200,00
1.200,00
R$ 1200,00
```

A aba também tem a função de resetar os dados locais. O reset:

1. Apaga os itens.
2. Apaga as compras.
3. Restaura o budget padrão e limpa o dia de fechamento do cartão.
4. Deixa a lista vazia.
5. Volta para a tela de lista.

Também existe um switch de modo escuro. A preferência é salva em `localStorage`, com a chave:

```txt
feira:theme
```

O valor pode ser:

```txt
light
dark
```

O reset do banco não apaga essa preferência visual.

A aba também permite escolher a cor de destaque. A preferência é salva em `localStorage`, com a chave:

```txt
feira:accent
```

As opções usam cores inspiradas no Tailwind, como emerald, green, sky, blue, purple, fuchsia, rose, amber, teal e cyan. O accent afeta tanto o modo claro quanto o modo escuro.

A aba também permite salvar um perfil local:

```js
settings: {
  userName: string,
  userGender: "neutral" | "male" | "female"
}
```

Esses dados são usados para exibir a saudação no topo do app e o avatar.

A aba também tem a ação **Atualizar app**, pensada para uso em PWA instalado. Ela recarrega o estado, pede atualização do service worker quando disponível e força reload da janela.

A aba também permite escolher o modo de edição para itens da lista e compras:

```txt
modal
inline
```

No modo `modal`, criar ou editar abre os modais existentes. No modo `inline`, criar ou editar insere um formulário direto na lista ou no histórico.

### Lista de Mercado

O usuário pode:

- Adicionar item.
- Informar quantidade opcional.
- Marcar/desmarcar item.
- Remover item.
- Editar item.
- Criar seções personalizadas.
- Adicionar seções por modal aberto pelo menu de três pontos da tela Lista.
- Marcar sugestões rápidas de seções via checkboxes no modal.
- Expandir/contrair seções em acordeon.
- Adicionar item diretamente em uma seção.
- Arrastar itens entre seções.

A tela inicial é a **Lista**, que mostra todos os itens e inclui a adição inline no topo. Cada item tem:

- Botão circular de check.
- Nome e quantidade na mesma linha quando houver quantidade.
- Remoção apenas dentro do modal de edição.

O clique no fundo ou no texto de qualquer item abre o modal de edição. O botão de editar separado foi removido para reduzir ruído visual.

O botão flutuante abre um novo item diretamente quando o usuário está na tela **Lista**. A linha inline acima da lista também inicia a criação de item. No modo `modal`, o modal de item é reutilizado; no modo `inline`, o formulário aparece dentro da seção correspondente.

A tela **Lista** organiza itens por seções criadas pelo usuário. Há uma seção automática **Sem seção** para itens antigos ou itens adicionados sem categoria. A criação de seções fica em um modal aberto pelo menu de três pontos, mantendo a tela principal mais minimalista.

- Campo de nome.
- Campo de quantidade.
- Botão cancelar.
- Botão salvar.

### Compras

A aba **Compras** mostra o histórico e os indicadores do mês.

Nessa tela:

- O usuário vê total gasto no mês.
- O usuário vê budget mensal.
- O usuário vê quantidade de compras.
- O usuário vê o histórico completo de compras registradas.
- O usuário pode nomear a compra para substituir o título automático no histórico.
- O botão de ação no topo da tela registra uma nova compra.

### Registrar Compra

Ao registrar:

1. O usuário usa o botão de adicionar na tela Compras.
2. O app abre um modal ou formulário inline pedindo nome opcional, data e total da compra, conforme a preferência de edição.
3. Salva uma entrada em `purchases`.
4. Desmarca todos os itens da lista.
5. Atualiza compras e saldo.
6. Leva o usuário para a tela Compras.

Os itens permanecem na lista após a compra. Apenas os checks são resetados.

Ao editar uma compra existente, o app reaproveita o modal de compra e permite alterar nome, data e valor total. A edição não altera os checks da lista. A exclusão não aparece inline no histórico; ela fica disponível apenas dentro do modal de edição para reduzir exclusões acidentais.

## PWA e Cache

O app tem:

- `manifest.webmanifest`.
- `sw.js`.
- Ícone SVG.
- Cache offline básico.

Versão atual do cache:

```txt
feira-v48.9
```

O cache foi atualizado para `feira-v48.9` após ajustes no tema claro com tokens personalizados do DaisyUI em `styles.css`.

Se alguma alteração não aparecer no navegador, usar **Ajustes > Atualizar app**. Em último caso, fazer reload forte ou limpar o service worker/cache do site.

## Como Rodar

Como não há Node no ambiente atual, o app roda com servidor estático via Python:

```bash
python3 -m http.server 5174
```

URL usada mais recentemente:

```txt
http://localhost:5174/
```

Observação:

- A porta `5173` ficou ocupada em uma tentativa anterior.
- A porta `5174` foi usada depois e respondeu com HTTP 200.

Também é possível abrir `index.html` diretamente, mas para PWA/service worker o ideal é usar servidor local.

## Estado do Ambiente

No momento da implementação:

- `node` não estava disponível.
- `npm` não estava disponível.
- `python3` estava disponível.
- Não havia repositório Git inicializado nesta pasta.

Comandos relevantes observados:

```txt
node: command not found
npm: command not found
Python 3.14.4
fatal: not a git repository
```

## Particularidades de UX

Direção visual atual:

- Interface mobile-first.
- Topbar fixa com saudação e saldo sempre visíveis.
- Navegação inferior fixa usando DaisyUI `dock` padrão via CDN, com tema claro/escuro acompanhando o app.
- Transição animada ao trocar de aba, respeitando `prefers-reduced-motion`.
- Modais em estilo bottom sheet com animação de subida.
- Botões com feedback sutil ao toque.
- Cards simples com raio de 8px.
- Modo escuro AMOLED com base neutral e accent emerald.
- Tema claro com fundo branco suave e accent configurável para modo claro e escuro.
- Saldo sempre visível no topo.
- Lista de mercado como tela inicial, com saldo e planejamento semanal sempre visíveis no topo.
- FAB contextual: novo item na lista, nova refeição em refeições e nova compra em compras.
- Preferência para criar e editar itens/compras em modal ou inline.
- Textos da interface não ficam selecionáveis durante o uso.
- Topbar exibe o seletor de Espaço atual, mantendo o saldo e o indicador semanal.
- Espaços compartilhados usam código de convite e continuam com escrita local instantânea.
- Itens, seções, compras, refeições e ajustes financeiros são sincronizáveis no espaço compartilhado.
- O estado marcado/desmarcado de cada item (`checked`) é normalizado e sincronizado no registro do item para refletir entre usuários do mesmo espaço.
- Ajustes inclui diagnóstico de sincronização com testes unitários em sandbox isolado, sem alterar IndexedDB ou chamar Supabase.

O app evita uma landing page e abre direto na experiência funcional.

## Pontos de Atenção

- O app usa renderização manual no DOM.
- Não há testes automatizados.
- Não há lint/build por falta de Node.
- Service worker pode manter cache antigo se a versão não for incrementada.
- IndexedDB guarda dados por origem do navegador; mudar porta pode criar outro contexto de dados dependendo do navegador.

## Próximos Passos Possíveis

Melhorias pequenas e naturais:

- Mostrar compras de meses anteriores.
- Configurar troca de mês/fechamento mensal.
- Adicionar campo de observação em compra.
- Adicionar confirmação antes de remover item.
- Melhorar estados vazios das telas de lista e compras.
- Refinar tela de conflitos com comparação mais amigável por campo.

Evolução técnica:

- Instalar Node.
- Migrar para Vite + React + TypeScript.
- Trocar IndexedDB manual por Dexie.
- Separar camadas de banco, estado e UI.
- Adicionar testes.
- Inicializar Git.
- Validar o SQL `supabase.sql` no projeto Supabase de produção e habilitar Auth anônimo.

Evolução de produto:

- Login por email para recuperar espaços em outros dispositivos.
- Sugestão automática de compras recorrentes.
- Divisão semanal do budget.
- Alertas ao se aproximar ou passar do limite.
- Preço médio por item.

## Último Marco

Última funcionalidade implementada:

```txt
Aplicação de tokens personalizados do tema light do DaisyUI no CSS global para alinhar o visual base do app.
```

Arquivos alterados nesse marco:

- `index.html`
- `app.js`
- `styles.css`
- `sw.js`
- `README.md`
- `CONTEXTO_PROJETO.md`
