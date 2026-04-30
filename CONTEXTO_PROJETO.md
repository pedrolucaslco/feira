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
- Tela inicial minimalista.
- Indicador de planejamento semanal baseado no fechamento do cartão.
- Tela Compras para histórico e métricas.
- Perfil local com nome, avatar e saudação.
- Resumo da lista de mercado na tela inicial.
- Tela de lista completa.
- Modal compartilhado para adicionar e editar itens.
- Saldo restante no topo ao lado da saudação.
- Adição inline acima da lista.
- Total gasto no mês.
- Saldo restante.
- Número de compras feitas.
- Lista de mercado com nome, quantidade e marcado/desmarcado.
- Registro de compra pelo menu flutuante.
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
purchases
settings
```

Modelo atual dos dados:

```js
items: {
  id: string,
  name: string,
  quantity: string,
  checked: boolean,
  createdAt: number
}

purchases: {
  id: string,
  total: number,
  date: number
}

settings: {
  id: "main",
  monthlyBudget: number,
  cardClosingDay: number | "",
  userName: string,
  userGender: "neutral" | "male" | "female"
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

### Dashboard

Mostra:

- Saldo restante.
- Planejamento semanal.
- Resumo com os 3 últimos itens da lista de mercado.
- Resumo com as 3 últimas compras.
- Botões **Adicionar** nos resumos para abrir os modais de item e compra.
- Botões **Ver mais** no final de cada resumo para ir para Lista e Compras.

O planejamento semanal usa o dia de fechamento do cartão configurado em **Ajustes**:

```txt
saldo sugerido por semana = saldo restante / semanas até o fechamento
```

Se o fechamento estiver configurado para um dia que não existe no mês atual, como 31 em fevereiro, o app usa o último dia válido daquele mês.

### Compras

Mostra:

- Planejamento semanal.
- Gasto do mês e budget no mesmo indicador.
- Gráfico simples de barras para variação das compras, com linha de mediana.
- Quantidade de compras no cabeçalho do histórico.
- Histórico de compras do mês.
- Edição de compra ao clicar na linha.
- Remoção de compra apenas dentro do modal de edição.

O saldo é calculado assim:

```txt
saldo = monthlyBudget - soma das compras do mês atual
```

O histórico exibido no dashboard considera apenas o mês atual.

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
5. Volta para a tela de resumo.

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

### Lista de Mercado

O usuário pode:

- Adicionar item.
- Informar quantidade opcional.
- Marcar/desmarcar item.
- Remover item.
- Editar item.

A tela inicial mostra um resumo com os 3 últimos itens e permite marcar, editar e excluir por ali. A tela **Lista** mostra todos os itens e inclui a adição inline no topo. Cada item tem:

- Botão circular de check.
- Nome e quantidade na mesma linha quando houver quantidade.
- Botão de remover com confirmação inline antes de excluir.

O clique no fundo ou no texto de qualquer item abre o modal de edição. O botão de editar separado foi removido para reduzir ruído visual.

O botão flutuante e a linha inline acima da lista abrem o modal de novo item. Ao editar, o mesmo modal é reutilizado com os dados do item.

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

### Registrar Compra

Ao registrar:

1. O usuário abre o menu flutuante.
2. Escolhe **Registrar compra**.
3. O app abre um modal pedindo o total da compra.
4. Salva uma entrada em `purchases`.
5. Desmarca todos os itens da lista.
6. Atualiza dashboard, compras e saldo.
7. Leva o usuário para a tela Compras.

Os itens permanecem na lista após a compra. Apenas os checks são resetados.

Ao editar uma compra existente, o app reaproveita o modal de compra, altera apenas o valor total e preserva a data original. A edição não altera os checks da lista. A exclusão não aparece inline no histórico; ela fica disponível apenas dentro do modal de edição para reduzir exclusões acidentais.

## PWA e Cache

O app tem:

- `manifest.webmanifest`.
- `sw.js`.
- Ícone SVG.
- Cache offline básico.

Versão atual do cache:

```txt
feira-v28
```

O cache foi atualizado para `feira-v28` depois de adicionar separadores muted abaixo do widget semanal.

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
- Navegação inferior fixa.
- Transição animada ao trocar de aba, respeitando `prefers-reduced-motion`.
- Modais em estilo bottom sheet com animação de subida.
- Botões com feedback sutil ao toque.
- Cards simples com raio de 8px.
- Modo escuro AMOLED com base neutral e accent emerald.
- Accent configurável para modo claro e escuro.
- Saldo sempre visível no topo.
- Resumo inicial com indicadores e atalhos para telas completas.
- FAB com menu para novo item ou nova compra.

O app evita uma landing page e abre direto na experiência funcional.

## Pontos de Atenção

- O app usa renderização manual no DOM.
- Não há testes automatizados.
- Não há lint/build por falta de Node.
- Service worker pode manter cache antigo se a versão não for incrementada.
- IndexedDB guarda dados por origem do navegador; mudar porta pode criar outro contexto de dados dependendo do navegador.

## Próximos Passos Possíveis

Melhorias pequenas e naturais:

- Editar compras do histórico.
- Remover compras do histórico.
- Mostrar compras de meses anteriores.
- Configurar troca de mês/fechamento mensal.
- Adicionar campo de observação em compra.
- Adicionar confirmação antes de remover item.
- Melhorar estados vazios das telas de lista e compras.

Evolução técnica:

- Instalar Node.
- Migrar para Vite + React + TypeScript.
- Trocar IndexedDB manual por Dexie.
- Separar camadas de banco, estado e UI.
- Adicionar testes.
- Inicializar Git.

Evolução de produto:

- Compartilhamento com esposa/família.
- Backend e sync.
- Sugestão automática de compras recorrentes.
- Divisão semanal do budget.
- Alertas ao se aproximar ou passar do limite.
- Preço médio por item.

## Último Marco

Última funcionalidade implementada:

```txt
Separadores muted abaixo do widget semanal nas telas principais.
```

Arquivos alterados nesse marco:

- `index.html`
- `app.js`
- `styles.css`
- `sw.js`
