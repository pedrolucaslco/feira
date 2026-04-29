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
- Total gasto no mês.
- Saldo restante.
- Número de compras feitas.
- Média por compra.
- Lista de mercado com nome, quantidade e marcado/desmarcado.
- Modo de compra ativa.
- Finalização de compra com valor total.
- Histórico simples das compras do mês.
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
  monthlyBudget: number
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
- Gasto no mês.
- Budget mensal.
- Quantidade de compras no mês.
- Média por compra.
- Últimas compras do mês.

O saldo é calculado assim:

```txt
saldo = monthlyBudget - soma das compras do mês atual
```

O histórico exibido no dashboard considera apenas o mês atual.

### Budget

O usuário pode editar o budget mensal direto no dashboard.

O campo aceita valores em formato brasileiro, por exemplo:

```txt
1200,00
1.200,00
R$ 1200,00
```

### Lista de Mercado

O usuário pode:

- Adicionar item.
- Informar quantidade opcional.
- Marcar/desmarcar item.
- Remover item.
- Editar item.

A edição de item foi a última funcionalidade implementada nesta conversa.

Na tela de lista, cada item tem:

- Botão de check.
- Nome.
- Quantidade.
- Botão de editar.
- Botão de remover.

Ao clicar em editar, a linha vira um formulário inline com:

- Campo de nome.
- Campo de quantidade.
- Botão cancelar.
- Botão salvar.

### Compra Ativa

O botão **Começar compra** leva para o modo de compra ativa.

Nesse modo:

- A interface fica mais focada no checklist.
- Os itens podem ser marcados/desmarcados.
- O usuário pode finalizar compra.
- O usuário pode sair da compra ativa.

### Finalizar Compra

Ao finalizar:

1. O app abre um modal pedindo o total da compra.
2. Salva uma entrada em `purchases`.
3. Desmarca todos os itens da lista.
4. Atualiza dashboard e saldo.
5. Retorna para o dashboard.

Os itens permanecem na lista após a compra. Apenas os checks são resetados.

## PWA e Cache

O app tem:

- `manifest.webmanifest`.
- `sw.js`.
- Ícone SVG.
- Cache offline básico.

Versão atual do cache:

```txt
feira-v2
```

O cache foi atualizado para `feira-v2` depois da implementação da edição de itens, para evitar que o navegador segurasse arquivos antigos.

Se alguma alteração não aparecer no navegador, fazer reload forte ou limpar o service worker/cache do site.

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
- Cards simples com raio de 8px.
- Botão grande para começar/finalizar compra.
- Saldo sempre visível no topo.
- Modo compra separado para foco.

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
- Melhorar estado vazio da compra ativa.

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
Editar item da lista de compras, permitindo alterar nome e quantidade.
```

Arquivos alterados nesse marco:

- `app.js`
- `styles.css`
- `sw.js`

