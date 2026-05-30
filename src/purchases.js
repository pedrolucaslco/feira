async function startPurchaseSession() {
  if (activePurchaseSession()) {
    showToast("Já existe uma compra em andamento.");
    return;
  }
  const now = Date.now();
  await saveRecord("purchaseSessions", {
    id: createId(),
    status: "active",
    startedAt: now,
    updatedAt: now,
    checkedItems: [],
  });
  await reloadAndRender();
  showToast("Compra iniciada.");
}

async function cancelPurchaseSession() {
  const session = activePurchaseSession();
  if (!session) return;
  const confirmed = window.confirm("Cancelar esta compra? Os itens marcados nela serão desmarcados.");
  if (!confirmed) return;

  const sessionItemIds = new Set((session.checkedItems || []).map((item) => item.itemId));
  const markedSessionItems = state.items.filter((item) => sessionItemIds.has(item.id) && item.checked);
  await Promise.all(markedSessionItems.map((item) => saveRecord("items", { ...item, checked: false })));
  await saveRecord("purchaseSessions", {
    ...session,
    status: "cancelled",
    completedAt: Date.now(),
    updatedAt: Date.now(),
  });
  await reloadAndRender();
  showToast("Compra cancelada.");
}

function openPurchaseEditor(id = null) {
  if (editorMode() !== "inline") {
    openCheckout(id);
    return;
  }

  if (state.activeView !== "purchaseView") {
    setView("purchaseView");
  }
  state.inlineItemEditor = null;
  state.inlinePurchaseEditor = { id };
  renderFinancialState();
  renderIcons();
  focusInlineEditor();
}

function openActivePurchaseCheckout() {
  const session = activePurchaseSession();
  if (!session) {
    showToast("Comece uma compra primeiro.");
    return;
  }
  if (!checkedItemsForSession(session).length) {
    showToast("Marque pelo menos um item nesta compra.");
    return;
  }
  openCheckout(null, { mode: "session", sessionId: session.id });
}

function renderPurchaseReceipt(purchase = null) {
  if (!el.purchaseReceipt || !el.purchaseReceiptList || !el.purchaseReceiptCount) return;
  const items = Array.isArray(purchase?.items) ? purchase.items : [];
  el.purchaseReceipt.hidden = items.length === 0;
  el.purchaseReceiptList.innerHTML = "";
  el.purchaseReceiptCount.textContent = `${items.length} ${items.length === 1 ? "item" : "itens"}`;
  items.forEach((item) => {
    const row = document.createElement("li");
    row.className = "receipt-item";
    const quantity = item.quantity ? `<span>${escapeHtml(item.quantity)}</span>` : "";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        ${quantity}
      </div>
      <small>${escapeHtml(item.categoryName || "Sem seção")}</small>
    `;
    el.purchaseReceiptList.append(row);
  });
}

function closeInlinePurchaseEditor() {
  state.inlinePurchaseEditor = null;
  renderFinancialState();
  renderIcons();
}

async function saveInlinePurchase(event, id = null) {
  event.preventDefault();
  const form = event.currentTarget;
  const name = form.elements.name.value.trim();
  const date = parseDateInput(form.elements.date.value);
  const total = parseCurrency(form.elements.total.value);
  if (!Number.isFinite(date)) {
    showToast("Informe a data da compra.");
    return;
  }
  if (!Number.isFinite(total) || total <= 0) {
    showToast("Informe o total da compra.");
    return;
  }

  const purchase = state.purchases.find((current) => current.id === id);
  if (purchase) {
    await saveRecord("purchases", { ...purchase, name, date, total });
  } else {
    await saveRecord("purchases", {
      id: createId(),
      name,
      total,
      date,
    });

    await Promise.all(state.items.map((item) => saveRecord("items", { ...item, checked: false })));
  }

  state.inlinePurchaseEditor = null;
  await reloadAndRender();
  setView("purchaseView");
  showToast(purchase ? "Compra atualizada." : "Compra registrada.");
}

function openCheckout(id = null, options = {}) {
  state.inlinePurchaseEditor = null;
  state.finishingPurchaseSessionId = options.mode === "session" ? options.sessionId : null;
  state.editingPurchaseId = id;
  const purchase = state.purchases.find((current) => current.id === id);
  const isSessionCheckout = Boolean(state.finishingPurchaseSessionId);

  el.checkoutDialogTitle.textContent = isSessionCheckout ? "Finalizar compra" : (purchase ? "Editar compra" : "Registrar compra");
  el.savePurchaseButton.textContent = purchase ? "Salvar" : "Salvar";
  el.deletePurchaseButton.hidden = !purchase;
  el.purchaseName.value = purchase?.name || (isSessionCheckout ? "Compra do mercado" : "");
  el.purchaseDate.value = formatDateInput(purchase?.date || Date.now());
  el.purchaseTotal.value = purchase ? String(purchase.total).replace(".", ",") : "";
  renderPurchaseReceipt(purchase);
  if (typeof el.checkoutDialog.showModal === "function") {
    el.checkoutDialog.showModal();
  } else {
    el.checkoutDialog.setAttribute("open", "");
  }
  focusDialogInputForCreate(el.purchaseTotal, Boolean(purchase));
}

async function finishPurchase(event) {
  event.preventDefault();
  const name = el.purchaseName.value.trim();
  const date = parseDateInput(el.purchaseDate.value);
  const total = parseCurrency(el.purchaseTotal.value);
  if (!Number.isFinite(date)) {
    showToast("Informe a data da compra.");
    return;
  }
  if (!Number.isFinite(total) || total <= 0) {
    showToast("Informe o total da compra.");
    return;
  }

  const session = state.finishingPurchaseSessionId
    ? state.purchaseSessions.find((current) => current.id === state.finishingPurchaseSessionId && current.status === "active")
    : null;
  const snapshot = session ? checkedItemsSnapshot(session) : [];
  if (session && !snapshot.length) {
    showToast("Marque pelo menos um item nesta compra.");
    return;
  }

  const purchase = state.purchases.find((current) => current.id === state.editingPurchaseId);
  if (purchase) {
    await saveRecord("purchases", { ...purchase, name, date, total });
  } else if (session) {
    const completedAt = Date.now();
    await saveRecord("purchases", {
      id: createId(),
      name,
      total,
      date,
      createdAt: completedAt,
      startedAt: session.startedAt,
      completedAt,
      durationMs: completedAt - session.startedAt,
      items: snapshot,
    });
    await saveRecord("purchaseSessions", {
      ...session,
      status: "completed",
      completedAt,
      updatedAt: completedAt,
    });
  } else {
    await saveRecord("purchases", {
      id: createId(),
      name,
      total,
      date,
    });

    await Promise.all(state.items.map((item) => saveRecord("items", { ...item, checked: false })));
  }

  closeCheckout();
  await reloadAndRender();
  setView("purchaseView");
  showToast(purchase ? "Compra atualizada." : "Compra registrada.");
}

function closeCheckout() {
  state.editingPurchaseId = null;
  state.finishingPurchaseSessionId = null;
  el.deletePurchaseButton.hidden = true;
  renderPurchaseReceipt(null);
  if (typeof el.checkoutDialog.close === "function") {
    el.checkoutDialog.close();
  } else {
    el.checkoutDialog.removeAttribute("open");
  }
}

async function removePurchase(id) {
  if (!id) return;
  const confirmed = window.confirm("Excluir esta compra?");
  if (!confirmed) return;

  await deleteRecord("purchases", id);
  if (state.inlinePurchaseEditor?.id === id) {
    state.inlinePurchaseEditor = null;
  }
  closeCheckout();
  await reloadAndRender();
  showToast("Compra removida.");
}
