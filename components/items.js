function createInlineActionButton(label, variant = "secondary") {
  const button = document.createElement("button");
  button.type = "button";
  const classes = {
    primary: "btn btn-primary",
    secondary: "btn btn-soft",
    danger: "btn btn-error btn-ghost",
  };
  button.className = classes[variant] || classes.secondary;
  button.textContent = label;
  return button;
}

function createItemRow(item, { removable } = {}) {
  const row = document.createElement("li");
  row.className = `list-row item-row${item.checked ? " is-checked" : ""}`;
  row.setAttribute("role", "button");
  row.setAttribute("tabindex", "0");
  row.setAttribute("aria-label", `Editar ${item.name}`);

  const quantity = item.quantity ? `<span class="item-quantity">${escapeHtml(item.quantity)}</span>` : "";
  row.innerHTML = `
    <input class="checkbox checkbox-primary checkbox-md check-button" type="checkbox" aria-label="Marcar ${escapeHtml(item.name)}" ${item.checked ? "checked" : ""} />
    <div class="item-main">
      <strong>${escapeHtml(item.name)}</strong>
      ${quantity}
    </div>
  `;

  row.addEventListener("click", () => openItemEditor(item.id, itemCategoryId(item)));
  row.addEventListener("keydown", (event) => {
    if (event.target !== row) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openItemEditor(item.id, itemCategoryId(item));
    }
  });

  const checkInput = row.querySelector(".check-button");
  checkInput.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  checkInput.addEventListener("change", () => {
    toggleItem(item.id);
  });
  return row;
}

function createItemInlineEditor(item = null, categoryId = "") {
  const row = document.createElement("li");
  row.className = "list-row bg-base-200 rounded-box inline-editor-row item-inline-editor";
  const form = document.createElement("form");
  form.className = "inline-editor-form";
  form.innerHTML = `
    <input class="input input-sm" name="name" autocomplete="off" placeholder="Item" required value="${escapeHtml(item?.name || "")}" />
    <input class="input input-sm" name="quantity" autocomplete="off" placeholder="Quantidade" value="${escapeHtml(item?.quantity || "")}" />
    <select class="select select-sm" name="categoryId"></select>
    <div class="inline-editor-actions"></div>
  `;
  populateCategorySelect(form.elements.categoryId, item?.categoryId || categoryId || "");

  const actions = form.querySelector(".inline-editor-actions");
  const cancelButton = createInlineActionButton("Cancelar");
  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.className = "btn btn-primary";
  saveButton.textContent = item ? "Salvar" : "Adicionar";
  actions.append(cancelButton);
  if (item) {
    const deleteButton = createInlineActionButton("Excluir", "danger");
    deleteButton.classList.add("inline-delete-button");
    deleteButton.addEventListener("click", () => removeItem(item.id));
    actions.append(deleteButton);
  }
  actions.append(saveButton);

  cancelButton.addEventListener("click", closeInlineItemEditor);
  form.addEventListener("submit", (event) => saveInlineItem(event, item?.id || null, categoryId));

  row.append(form);
  return row;
}
