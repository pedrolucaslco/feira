Plano direto para um **POC em 1 dia** do app de compras com controle de budget.

---

## Conceito

**Lista de mercado + controle de saldo mensal**

Fluxo principal:

```txt
Adicionar itens → Ir ao mercado → Dar check → Finalizar compra → Inserir total → Atualizar saldo
```

---

## MVP (escopo fechado)

### 1. Núcleo (budget mensal)

```txt
Budget mensal (ex: R$1200)
Total gasto no mês
Saldo restante
Número de compras feitas
Média por compra (opcional)
```

**Regra simples:**

```txt
saldo = budget - soma das compras
```

---

### 2. Lista de mercado (compartilhável no futuro)

```txt
[ ] Arroz
[ ] Feijão
[ ] Leite
[ ] Frango
```

Campos:

* nome
* quantidade (opcional)
* marcado (true/false)

---

### 3. Sessão de compra

Botões:

```txt
[ Começar compra ]
[ Finalizar compra ]
```

Durante a compra:

* usuário marca itens

Ao finalizar:

* input: valor total da compra

---

### 4. Histórico simples

```txt
Compra #1 - R$230 - 02/04
Compra #2 - R$180 - 08/04
```

Sem edição no POC

---

## Telas (mínimo viável)

### Tela 1 — Dashboard

```txt
Saldo restante: R$720
Gasto no mês: R$480
Budget: R$1200

[ Começar compra ]

Últimas compras:
- R$230
- R$180
```

---

### Tela 2 — Lista

```txt
Lista de mercado

[ ] Arroz
[ ] Leite
[ ] Café

[ + Adicionar item ]
```

---

### Tela 3 — Compra ativa

```txt
Comprando...

[x] Arroz
[ ] Leite
[x] Café

[ Finalizar compra ]
```

---

### Tela 4 — Finalizar

```txt
Total da compra: [ R$ ___ ]

[ Confirmar ]
```

---

## Modelagem (Dexie)

```ts
// db.ts

items: {
  id: string
  name: string
  checked: boolean
  createdAt: number
}

purchases: {
  id: string
  total: number
  date: number
}

settings: {
  id: "main"
  monthlyBudget: number
}
```

---

## Lógica principal

### Calcular saldo

```ts
saldo = monthlyBudget - sum(purchases.total)
```

---

### Ao finalizar compra

```ts
1. salvar purchase
2. limpar checked dos itens (reset lista)
3. atualizar UI
```

---

## UX importante (diferencial)

* Botão grande “Começar compra”
* Modo “compra ativa” (UI mais limpa, foco em checklist)
* Feedback visual rápido (check animado)
* Saldo sempre visível

---

## O que NÃO fazer no POC

* Login
* Sync em tempo real
* Multi usuário real
* Categorias complexas
* Preço por item

---

## Evolução (fase 2)

* Compartilhamento com esposa (sync via backend)
* Sugestão automática de compra baseada em histórico
* Divisão automática do budget por semana
* Notificação quando passar do limite
* Preço médio por item

---

## Nome da ideia

* Feira
* Lista+
* BudgetMarket
* CasaMarket
* FeiraSimples

---

## Resumo

Você vai construir:

```txt
PWA offline
Lista compartilhável (futuramente)
Controle de budget mensal
Fluxo simples de compra
```

---

Se quiser, posso:

* já gerar estrutura base (Vite + React + Dexie)
* montar os componentes principais
* ou escrever o fluxo completo em código (hooks + store)
