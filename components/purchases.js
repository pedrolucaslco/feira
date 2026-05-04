function createPurchaseRow(purchase, index) {
  const row = document.createElement("li");
  row.className = "list-row purchase-row";
  row.setAttribute("role", "button");
  row.setAttribute("tabindex", "0");
  row.setAttribute("aria-label", `Editar compra de ${formatCurrency(purchase.total)}`);
  row.innerHTML = `
    <div class="purchase-main">
      <strong>${escapeHtml(purchaseTitle(purchase, index))}</strong>
      <span>${formatDate(purchase.date)}</span>
    </div>
    <strong>${formatCurrency(purchase.total)}</strong>
  `;

  row.addEventListener("click", () => openPurchaseEditor(purchase.id));
  row.addEventListener("keydown", (event) => {
    if (event.target !== row) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPurchaseEditor(purchase.id);
    }
  });

  return row;
}

function createPurchaseInlineEditor(purchase = null) {
  const row = document.createElement("li");
  row.className = "list-row bg-base-200 rounded-box inline-editor-row purchase-inline-editor";
  const form = document.createElement("form");
  form.className = "inline-editor-form purchase-inline-form";
  form.innerHTML = `
    <input class="input input-sm" name="name" autocomplete="off" placeholder="Nome da compra" value="${escapeHtml(purchase?.name || "")}" />
    <input class="input input-sm" name="date" type="date" required value="${formatDateInput(purchase?.date || Date.now())}" />
    <input class="input input-sm" name="total" inputmode="decimal" autocomplete="off" placeholder="Valor pago" required value="${purchase ? escapeHtml(String(purchase.total).replace(".", ",")) : ""}" />
    <div class="inline-editor-actions"></div>
  `;

  const actions = form.querySelector(".inline-editor-actions");
  const cancelButton = createInlineActionButton("Cancelar");
  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.className = "btn btn-primary";
  saveButton.textContent = purchase ? "Salvar" : "Registrar";
  actions.append(cancelButton);
  if (purchase) {
    const deleteButton = createInlineActionButton("Excluir", "danger");
    deleteButton.classList.add("inline-delete-button");
    deleteButton.addEventListener("click", () => removePurchase(purchase.id));
    actions.append(deleteButton);
  }
  actions.append(saveButton);

  cancelButton.addEventListener("click", closeInlinePurchaseEditor);
  form.addEventListener("submit", (event) => saveInlinePurchase(event, purchase?.id || null));

  row.append(form);
  return row;
}
