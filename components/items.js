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
  checkInput.className = "checkbox checkbox-md check-button";
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

function createItemRow(item, options = {}) {
  const row = document.createElement("li");
  row.className = `list-row item-row${item.checked ? " is-checked" : ""}`;
  row.dataset.itemId = item.id;
  row.dataset.categoryId = itemCategoryId(item);

  const canDrag = options.draggable !== false;
  const dragHandleHtml = canDrag
    ? '<span class="drag-handle" aria-label="Arrastar para reordenar"><i data-lucide="grip-vertical" aria-hidden="true"></i></span>'
    : "";

  const isInline = editorMode() === "inline" && !options.originLabel;

  if (!isInline) {
    const quantity = item.quantity ? `<span class="item-quantity">${escapeHtml(item.quantity)}</span>` : "";
    const origin = options.originLabel ? `<span class="item-origin">${escapeHtml(options.originLabel)}</span>` : "";
    row.innerHTML = `
      <span class="item-check-cell"></span>
      <button class="item-edit-target" type="button" aria-label="Editar ${escapeHtml(item.name)}">
        <strong>${escapeHtml(item.name)}</strong>
        ${quantity}
        ${origin}
      </button>
      ${dragHandleHtml}
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
  } else {
    const origin = options.originLabel ? `<span class="item-origin">${escapeHtml(options.originLabel)}</span>` : "";
    row.innerHTML = `
      <span class="item-check-cell"></span>
      <div class="item-body">
        <div class="item-name-area">
          <strong class="item-name-text">${escapeHtml(item.name)}</strong>
          <input class="item-name-input" value="${escapeHtml(item.name)}" autocomplete="off" hidden />
        </div>
        <input class="item-qty-input" value="${escapeHtml(item.quantity || "")}" placeholder="Qtd" autocomplete="off" />
        ${origin}
      </div>
      ${dragHandleHtml}
    `;

    row.querySelector(".item-check-cell").append(createItemCheckbox(item));

    const nameText = row.querySelector(".item-name-text");
    const nameInput = row.querySelector(".item-name-input");
    const qtyInput = row.querySelector(".item-qty-input");

    const commitEdit = () => {
      const newName = nameInput.value.trim();
      if (!newName) {
        nameInput.value = item.name;
        nameText.textContent = item.name;
        nameInput.hidden = true;
        nameText.hidden = false;
        showToast("Informe o nome do item.");
        return;
      }
      const newQty = qtyInput.value.trim();
      nameText.textContent = newName;
      nameInput.hidden = true;
      nameText.hidden = false;
      if (newName !== item.name || newQty !== (item.quantity || "")) {
        saveRecord("items", { ...item, name: newName, quantity: newQty });
      }
    };

    nameText.addEventListener("click", () => {
      if (shouldSuppressItemClick(item.id)) return;
      nameText.hidden = true;
      nameInput.hidden = false;
      nameInput.focus();
      nameInput.setSelectionRange(nameInput.value.length, nameInput.value.length);
    });

    nameInput.addEventListener("blur", commitEdit);
    nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        nameInput.blur();
      }
      if (e.key === "Escape") {
        nameInput.value = item.name;
        nameInput.blur();
      }
    });

    qtyInput.addEventListener("blur", () => {
      const newQty = qtyInput.value.trim();
      const newName = nameInput.value.trim();
      if (!newName) return;
      if (newQty !== (item.quantity || "")) {
        saveRecord("items", { ...item, name: newName, quantity: newQty });
      }
    });
  }

  if (canDrag) {
    bindItemLongPressDrag(row, item);
  }
  return row;
}

function createItemInlineEditor(categoryId = "") {
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
