# Feira

**Feira** é um PWA simples para organizar a lista de mercado e acompanhar o orçamento mensal de compras.

O projeto ainda está em desenvolvimento, mas já possui um POC funcional com persistência local offline.

🔗 Acesse a versão publicada:

[feira-flame.vercel.app](https://feira-flame.vercel.app)

## Ideia

A proposta é resolver um fluxo bem comum:

```txt
Adicionar itens -> Ir ao mercado -> Dar check -> Finalizar compra -> Atualizar saldo
```

Além de ser uma lista de compras, o app ajuda a responder uma pergunta prática:

> Quanto ainda posso gastar no mercado este mês?

## Funcionalidades atuais

- Dashboard com resumo do mês.
- Tela inicial com saldo no topo e lista de mercado.
- Adição inline acima da lista e botão flutuante de atalho.
- Modal compartilhado para adicionar e editar itens.
- Tela de compras com histórico, budget, total gasto e quantidade de compras.
- Controle de budget mensal.
- Aba de ajustes.
- Perfil local com nome, avatar e saudação no topo.
- Modo escuro com preferência salva no dispositivo.
- Navegação inferior com Lucide Icons via CDN.
- Cálculo de saldo restante.
- Total gasto no mês.
- Número de compras realizadas.
- Média por compra.
- Lista de mercado offline na tela inicial.
- Adição de itens com quantidade opcional.
- Edição de nome e quantidade dos itens.
- Remoção de itens.
- Checklist para marcar itens já comprados.
- Registro de compra pelo menu flutuante.
- Modal de compra com valor total.
- Histórico simples das compras do mês.
- Reset dos dados locais para começar do zero.
- PWA com manifest e service worker básico.

## Status

```txt
Em desenvolvimento
```

Este repositório começou como um POC rápido e está evoluindo aos poucos. A versão atual prioriza simplicidade, uso offline e validação do fluxo principal.

## Stack atual

Por enquanto, o app foi implementado sem dependências externas:

- HTML
- CSS
- JavaScript
- IndexedDB
- Service Worker
- Vercel

A ideia inicial considera uma futura migração para:

- Vite
- React
- TypeScript
- Dexie

## Como rodar localmente

Clone o projeto e rode um servidor estático na pasta:

```bash
python3 -m http.server 5174
```

Depois acesse:

```txt
http://localhost:5174/
```

Também é possível abrir o `index.html` diretamente, mas o servidor local é recomendado para testar melhor o comportamento de PWA/service worker.

## Modelo de dados

O app usa IndexedDB local com três coleções principais:

```txt
items
purchases
settings
```

Estrutura conceitual:

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

## Próximos passos

- Melhorar o histórico de compras.
- Permitir editar ou remover compras.
- Visualizar meses anteriores.
- Adicionar confirmação antes de remover itens.
- Melhorar o comportamento offline/cache.
- Migrar para React + Dexie.
- Adicionar backend e sincronização no futuro.
- Permitir compartilhamento da lista.

## Visão futura

A longo prazo, o Feira pode evoluir para uma lista compartilhável para casa/família, com sincronização, sugestões automáticas baseadas no histórico e alertas quando o orçamento estiver perto do limite.

## Licença

Ainda não definida.
