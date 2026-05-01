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
- Tela inicial com saldo total e saldo semanal no topo, além de resumos rápidos.
- Campo de fechamento do cartão para calcular semanas restantes e saldo sugerido por semana.
- Atalhos para adicionar item e compra direto pelos resumos da tela inicial.
- Botão flutuante contextual: dropdown no resumo, novo item na lista e nova compra em compras.
- Tela de lista completa com adição inline e botão flutuante de atalho.
- Modal compartilhado para adicionar e editar itens.
- Tela de compras com histórico, período financeiro, gasto/budget, gráfico de variação e planejamento semanal.
- Preferência para criar e editar itens/compras em modal ou inline.
- Controle de budget mensal.
- Aba de ajustes.
- Perfil local com nome, avatar e saudação no topo.
- Seletor de Espaços na topbar, com `Espaço local` e espaços compartilhados.
- Criação de espaço compartilhado vazio e entrada por código.
- Base offline-first para sincronização com Supabase, outbox local, Realtime e resolução inicial de conflitos.
- Modo escuro com preferência salva no dispositivo.
- Modo escuro AMOLED com accent emerald.
- Cor de destaque configurável com opções inspiradas no Tailwind.
- Navegação inferior com Lucide Icons via CDN.
- Topbar fixa com saudação, saldo total e saldo semanal sempre visíveis.
- Animações leves ao trocar de tela.
- Feedback sutil ao tocar em botões e modais em estilo bottom sheet.
- Gráfico simples de variação das compras com linha de mediana.
- Edição de compras registradas, incluindo nome, data e valor.
- Remoção de compras apenas pelo modal de edição.
- Cálculo de saldo restante pelo período financeiro atual.
- Total gasto no período financeiro atual.
- Número de compras realizadas no cabeçalho do histórico.
- Lista de mercado offline na tela inicial.
- Seções personalizadas na lista, com modal de criação, sugestões rápidas e acordeon.
- Arrastar itens entre seções na tela de lista.
- Aba de refeições com listas isoladas de itens.
- Cópia de itens de uma refeição para a lista de compras atual, mesclando quantidades por nome.
- Adição de itens com quantidade opcional.
- Edição de nome e quantidade dos itens.
- Remoção de itens apenas pelo modal de edição.
- Checklist para marcar itens já comprados, inclusive no resumo da tela inicial.
- Registro de compra pelo menu flutuante.
- Modal de compra com valor total.
- Histórico simples das compras do mês.
- Reset dos dados locais para começar do zero.
- Atualização manual do app pela tela de ajustes.
- PWA com manifest e service worker básico.

## Status

```txt
Em desenvolvimento
```

Este repositório começou como um POC rápido e está evoluindo aos poucos. A versão atual prioriza simplicidade, uso offline e validação do fluxo principal.

## Stack atual

Por enquanto, o app segue sem build e usa dependências via CDN quando necessário:

- HTML
- CSS
- JavaScript
- IndexedDB
- Service Worker
- Supabase opcional para compartilhamento
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

O app usa IndexedDB local com coleções por espaço:

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

Estrutura conceitual:

```js
items: {
  id: string,
  spaceId: string,
  name: string,
  quantity: string,
  categoryId: string,
  checked: boolean,
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
```

Preferências pessoais ficam locais no dispositivo:

```js
profile: {
  userName: string,
  userGender: "neutral" | "male" | "female",
  editorMode: "modal" | "inline"
}
```

## Compartilhamento com Supabase

O compartilhamento é opcional. Sem configuração, o app continua funcionando com o `Espaço local`.

Para ativar:

1. Crie um projeto Supabase.
2. Habilite Auth anônimo.
3. Execute o SQL de `supabase.sql`.
4. Preencha `supabase-config.js` com a URL e a anon/publishable key pública do projeto.

## Próximos passos

- Melhorar o histórico de compras.
- Visualizar meses anteriores.
- Adicionar confirmação antes de remover itens.
- Melhorar o comportamento offline/cache.
- Migrar para React + Dexie.
- Melhorar a resolução visual de conflitos.
- Adicionar login por email para recuperar espaços em outros dispositivos.

## Visão futura

A longo prazo, o Feira pode evoluir para uma lista compartilhável para casa/família, com sincronização, sugestões automáticas baseadas no histórico e alertas quando o orçamento estiver perto do limite.

## Licença

Ainda não definida.
