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

function createItemCheckbox(item) {
  const checkInput = document.createElement("input");
  checkInput.className = "checkbox checkbox-primary checkbox-md check-button";
  checkInput.type = "checkbox";
  checkInput.setAttribute("aria-label", `Marcar ${item.name}`);
  checkInput.checked = item.checked === true;
  checkInput.addEventListener("click", (event) => event.stopPropagation());
  checkInput.addEventListener("pointerdown", (event) => event.stopPropagation());
  checkInput.addEventListener("change", () => {
    toggleItem(item.id);
  });
  return checkInput;
}

function createItemRow(item) {
  const row = document.createElement("li");
  row.className = `list-row item-row${item.checked ? " is-checked" : ""}`;
  row.dataset.itemId = item.id;
  row.dataset.categoryId = itemCategoryId(item);

  const quantity = item.quantity ? `<span class="item-quantity">${escapeHtml(item.quantity)}</span>` : "";
  row.innerHTML = `
    <span class="item-check-cell"></span>
    <button class="item-edit-target" type="button" aria-label="Editar ${escapeHtml(item.name)}">
      <strong>${escapeHtml(item.name)}</strong>
      ${quantity}
    </button>
  `;

  row.querySelector(".item-check-cell").append(createItemCheckbox(item));
  row.querySelector(".item-edit-target").addEventListener("click", () => {
    if (shouldSuppressItemClick(item.id)) return;
    openItemEditor(item.id, itemCategoryId(item));
  });
  row.querySelector(".item-edit-target").addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openItemEditor(item.id, itemCategoryId(item));
    }
  });
  bindItemLongPressDrag(row, item);
  return row;
}

function createEditingItemRow(item, categoryId = "") {
  const row = document.createElement("li");
  row.className = `list-row item-row item-natural-editor${item.checked ? " is-checked" : ""}`;
  row.dataset.itemId = item.id;
  row.dataset.categoryId = itemCategoryId(item);

  const form = document.createElement("form");
  form.className = "item-natural-form";
  form.innerHTML = `
    <span class="item-check-cell"></span>
    <span class="item-name-wrap">
      <input class="item-natural-name" name="name" autocomplete="off" required value="${escapeHtml(item.name || "")}" />
      <input class="item-natural-quantity" name="quantity" autocomplete="off" placeholder="Qtd." value="${escapeHtml(item.quantity || "")}" />
    </span>
  `;
  form.querySelector(".item-check-cell").append(createItemCheckbox(item));

  let saved = false;
  const saveNaturalEdit = async () => {
    if (saved) return;
    const name = form.elements.name.value.trim();
    const quantity = form.elements.quantity.value.trim();
    if (!name) {
      showToast("Informe o nome do item.");
      return;
    }
    saved = true;
    await saveInlineItem({ preventDefault() {}, currentTarget: form }, item.id, categoryId);
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    saveNaturalEdit();
  });
  form.addEventListener("focusout", (event) => {
    if (form.contains(event.relatedTarget)) return;
    saveNaturalEdit();
  });
  form.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeInlineItemEditor();
    }
  });

  row.append(form);
  requestAnimationFrame(() => {
    const input = form.elements.name;
    input.focus({ preventScroll: true });
    input.setSelectionRange(input.value.length, input.value.length);
  });
  return row;
}

function createItemInlineEditor(item = null, categoryId = "") {
  if (item) return createEditingItemRow(item, categoryId);

  const row = document.createElement("li");
  row.className = "list-row bg-base-200 rounded-box inline-editor-row item-inline-editor";
  const form = document.createElement("form");
  form.className = "inline-editor-form";
  form.innerHTML = `
    <input class="input input-sm" name="name" autocomplete="off" placeholder="Item" required value="" />
    <input class="input input-sm" name="quantity" autocomplete="off" placeholder="Quantidade" value="" />
    <select class="select select-sm" name="categoryId"></select>
    <div class="inline-editor-actions"></div>
  `;
  populateCategorySelect(form.elements.categoryId, categoryId || "");

  const actions = form.querySelector(".inline-editor-actions");
  const cancelButton = createInlineActionButton("Cancelar");
  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.className = "btn btn-primary";
  saveButton.textContent = "Adicionar";
  actions.append(cancelButton);
  actions.append(saveButton);

  cancelButton.addEventListener("click", closeInlineItemEditor);
  form.addEventListener("submit", (event) => saveInlineItem(event, null, categoryId));

  row.append(form);
  return row;
}
