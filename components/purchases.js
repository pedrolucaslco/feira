function createPurchaseCard(purchase, index) {
  const card = document.createElement("article");
  card.className = "card bg-base-100 border border-base-300 shadow-sm purchase-card";
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.setAttribute("aria-label", `Editar compra de ${formatCurrency(purchase.total)}`);

  const previewDate = formatDate(purchase.date);
  const title = purchaseTitle(purchase, index);

  card.innerHTML = `
    <div class="card-body">
      <div class="flex items-center justify-between gap-4">
        <div class="min-w-0">
          <h3 class="card-title text-base">${escapeHtml(title)}</h3>
          <span class="text-sm text-base-content/60">${previewDate}</span>
        </div>
        <strong class="text-lg whitespace-nowrap">${formatCurrency(purchase.total)}</strong>
      </div>
    </div>
  `;

  card.addEventListener("click", () => openPurchaseEditor(purchase.id));
  card.addEventListener("keydown", (event) => {
    if (event.target !== card) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPurchaseEditor(purchase.id);
    }
  });

  return card;
}

function createPurchaseInlineEditor(purchase = null) {
  const card = document.createElement("article");
  card.className = "card bg-base-200 shadow-sm purchase-inline-editor";
  const form = document.createElement("form");
  form.className = "card-body inline-editor-form purchase-inline-form";
  form.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="form-control">
        <label class="label"><span class="label-text">Nome da compra</span></label>
        <input class="input input-sm" name="name" autocomplete="off" placeholder="Nome da compra" value="${escapeHtml(purchase?.name || "")}" />
      </div>
      <div class="form-control">
        <label class="label"><span class="label-text">Data</span></label>
        <input class="input input-sm" name="date" type="date" required value="${formatDateInput(purchase?.date || Date.now())}" />
      </div>
      <div class="form-control">
        <label class="label"><span class="label-text">Valor pago</span></label>
        <input class="input input-sm" name="total" inputmode="decimal" autocomplete="off" placeholder="Valor pago" required value="${purchase ? escapeHtml(String(purchase.total).replace(".", ",")) : ""}" />
      </div>
    </div>
    <div class="inline-editor-actions mt-3 flex gap-2 justify-end"></div>
  `;

  const actions = form.querySelector(".inline-editor-actions");
  const cancelButton = createInlineActionButton("Cancelar", "secondary");
  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.className = "btn btn-primary btn-sm";
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

  card.append(form);
  return card;
}
