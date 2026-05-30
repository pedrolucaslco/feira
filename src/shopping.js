function focusDialogInput(input) {
  if (!input) return;
  input.focus({ preventScroll: true });
  requestAnimationFrame(() => input.focus({ preventScroll: true }));
}

function focusDialogInputForCreate(input, isEditing = false) {
  if (isEditing) return;
  focusDialogInput(input);
}

function focusInlineEditor() {
  requestAnimationFrame(() => {
    document.querySelector(".inline-editor-form input")?.focus({ preventScroll: true });
  });
}

function populateCategorySelect(select, selectedCategoryId = "") {
  if (!select) return;
  const normalized = selectedCategoryId === UNCATEGORIZED_ID ? "" : selectedCategoryId;
  const options = [{ id: "", name: "Seção" }, ...state.categories];
  select.innerHTML = options.map((category) => `<option value="${escapeHtml(category.id)}">${escapeHtml(category.name)}</option>`).join("");
  select.value = normalized;
}

async function saveItem(event) {
  event.preventDefault();
  const name = el.itemName.value.trim();
  const quantity = el.itemQuantity.value.trim();
  const categoryId = el.itemCategory.value.trim();
  if (!name) {
    showToast("Informe o nome do item.");
    return;
  }

  const item = state.items.find((current) => current.id === state.editingItemId);
  if (item) {
    await saveRecord("items", { ...item, name, quantity, categoryId: categoryId === UNCATEGORIZED_ID ? "" : categoryId });
  } else {
    const createdAt = Date.now();
    await saveRecord("items", {
      id: createId(),
      name,
      quantity,
      categoryId: categoryId === UNCATEGORIZED_ID ? "" : categoryId || (state.pendingItemCategoryId === UNCATEGORIZED_ID ? "" : state.pendingItemCategoryId),
      checked: false,
      createdAt,
      sortOrder: createdAt,
    });
  }

  closeItemDialog();
  await reloadAndRender();
  showToast(item ? "Item atualizado." : "Item adicionado.");
}

function openItemEditor(id = null, categoryId = "") {
  closeListMenu();
  const normalizedCategoryId = categoryId === UNCATEGORIZED_ID ? "" : categoryId;

  if (editorMode() === "inline") {
    if (id !== null) return;
    if (state.activeView !== "listView") setView("listView");
    state.inlinePurchaseEditor = null;
    state.inlineItemEditor = { id: null, categoryId: normalizedCategoryId };
    renderItems();
    renderIcons();
    focusInlineEditor();
    return;
  }

  openItemDialog(id, normalizedCategoryId);
}

function closeInlineItemEditor() {
  state.inlineItemEditor = null;
  renderItems();
  renderIcons();
}

async function saveInlineItem(event, id = null, categoryId = "") {
  event.preventDefault();
  const form = event.currentTarget;
  const name = form.elements.name.value.trim();
  const quantity = form.elements.quantity.value.trim();
  if (!name) {
    showToast("Informe o nome do item.");
    return;
  }

  const item = state.items.find((current) => current.id === id);
  const selectedCategoryId = form.elements.categoryId?.value.trim() ?? categoryId;
  if (item) {
    await saveRecord("items", { ...item, name, quantity, categoryId: storeCategoryId(selectedCategoryId) });
  } else {
    const createdAt = Date.now();
    await saveRecord("items", {
      id: createId(),
      name,
      quantity,
      categoryId: storeCategoryId(selectedCategoryId || categoryId),
      checked: false,
      createdAt,
      sortOrder: createdAt,
    });
  }

  state.inlineItemEditor = null;
  await reloadAndRender();
  showToast(item ? "Item atualizado." : "Item adicionado.");
}

async function toggleItem(id) {
  const item = state.items.find((current) => current.id === id);
  if (!item) return;

  const session = activePurchaseSession();
  const nextChecked = !item.checked;
  await saveRecord("items", { ...item, checked: nextChecked });
  if (session) {
    const checkedItems = (session.checkedItems || []).filter((checkedItem) => checkedItem.itemId !== id);
    if (nextChecked) {
      checkedItems.push({ itemId: id, checkedAt: Date.now() });
    }
    await saveRecord("purchaseSessions", {
      ...session,
      checkedItems,
      updatedAt: Date.now(),
    });
  }
  await reloadAndRender();
}

async function clearRecentItems() {
  const recentItems = recentCheckedItems();
  if (!recentItems.length) return;
  const confirmed = window.confirm("Limpar comprados recentemente?");
  if (!confirmed) return;

  await Promise.all(recentItems.map((item) => saveRecord("items", { ...item, checked: false })));
  await reloadAndRender();
  showToast("Comprados recentes limpos.");
}

async function clearMarketList() {
  const hasItems = state.items.length > 0;
  const hasSections = state.categories.length > 0;
  if (!hasItems && !hasSections) {
    showToast("A lista já está vazia.");
    return;
  }

  const confirmed = window.confirm("Zerar lista e apagar todas as seções?");
  if (!confirmed) return;

  closeListMenu();
  await Promise.all([
    ...state.items.map((item) => deleteRecord("items", item.id)),
    ...state.categories.map((category) => deleteRecord("categories", category.id)),
  ]);
  state.collapsedCategoryIds.clear();
  state.manuallyToggledCategoryIds.clear();
  state.inlineItemEditor = null;
  await reloadAndRender();
  showToast("Lista e seções limpas.");
}

async function removeItem(id) {
  if (!id) return;
  const confirmed = window.confirm("Excluir este item?");
  if (!confirmed) return;

  await deleteRecord("items", id);
  if (state.editingItemId === id) {
    state.editingItemId = null;
  }
  if (state.inlineItemEditor?.id === id) {
    state.inlineItemEditor = null;
  }
  await reloadAndRender();
  showToast("Item removido.");
}

function openItemDialog(id = null, categoryId = "") {
  state.inlineItemEditor = null;
  state.editingItemId = id;
  state.pendingItemCategoryId = categoryId === UNCATEGORIZED_ID ? "" : categoryId;
  const item = state.items.find((current) => current.id === id);

  el.itemForm.reset();
  el.itemDialogTitle.textContent = item ? "Editar item" : "Novo item";
  el.saveItemButton.innerHTML = item
    ? `<i data-lucide="check" aria-hidden="true"></i>`
    : `<i data-lucide="check" aria-hidden="true"></i>`;
  el.saveItemButton.setAttribute("aria-label", item ? "Salvar item" : "Adicionar item");
  el.saveItemButton.setAttribute("title", item ? "Salvar item" : "Adicionar item");
  el.deleteItemButton.hidden = !item;
  if (item) {
    el.itemName.value = item.name;
    el.itemQuantity.value = item.quantity || "";
  }
  populateCategorySelect(el.itemCategory, item?.categoryId || state.pendingItemCategoryId || "");

  if (typeof el.itemDialog.showModal === "function") {
    el.itemDialog.showModal();
  } else {
    el.itemDialog.setAttribute("open", "");
  }
  renderIcons();
  focusDialogInputForCreate(el.itemName, Boolean(item));
}

function closeItemDialog() {
  state.editingItemId = null;
  state.pendingItemCategoryId = "";
  el.deleteItemButton.hidden = true;
  if (typeof el.itemDialog.close === "function") {
    el.itemDialog.close();
  } else {
    el.itemDialog.removeAttribute("open");
  }
}

async function saveCategory(event) {
  event.preventDefault();
  const editingCategory = state.categories.find((category) => category.id === state.editingCategoryId);
  if (editingCategory) {
    const name = el.categoryNameInput.value.trim();
    if (!name) {
      showToast("Informe o nome da seção.");
      return;
    }
    const duplicate = state.categories.some((category) => category.id !== editingCategory.id && category.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      showToast("Já existe uma seção com esse nome.");
      return;
    }

    await saveRecord("categories", { ...editingCategory, name });
    closeCategoryDialog();
    await reloadAndRender();
    showToast("Seção atualizada.");
    return;
  }

  const names = [
    el.categoryNameInput.value.trim(),
    ...el.categoryPresetInputs.filter((input) => input.checked).map((input) => input.value.trim()),
  ].filter(Boolean);

  const uniqueNames = [...new Set(names)];
  if (!uniqueNames.length) {
    showToast("Informe ou selecione uma seção.");
    return;
  }

  const existingNames = new Set(state.categories.map((category) => category.name.toLowerCase()));
  const categories = uniqueNames.filter((name) => !existingNames.has(name.toLowerCase()));

  if (!categories.length) {
    showToast("Essas seções já existem.");
    return;
  }

  await Promise.all(
    categories.map((name, index) => saveRecord("categories", {
      id: createId(),
      name,
      createdAt: Date.now() + index,
    })),
  );

  closeCategoryDialog();
  await reloadAndRender();
  showToast(categories.length === 1 ? "Seção adicionada." : "Seções adicionadas.");
}

function openCategoryEditor(id = null) {
  closeListMenu();
  state.editingCategoryId = id;
  el.categoryForm.reset();
  el.categoryPresetInputs.forEach((input) => { input.checked = false; });

  const category = state.categories.find((current) => current.id === id);
  const isEditing = Boolean(category);
  if (el.categoryDialogTitle) {
    el.categoryDialogTitle.textContent = isEditing ? "Editar seção" : "Adicionar seção";
  }
  if (el.saveCategoryButton) {
    el.saveCategoryButton.textContent = isEditing ? "Salvar" : "Adicionar";
  }
  if (el.categoryPresetGrid) {
    el.categoryPresetGrid.hidden = isEditing;
  }
  if (isEditing) {
    el.categoryNameInput.value = category.name;
  }

  if (typeof el.categoryDialog.showModal === "function") {
    el.categoryDialog.showModal();
  } else {
    el.categoryDialog.setAttribute("open", "");
  }
  focusDialogInputForCreate(el.categoryNameInput, isEditing);
}

function openDeleteCategoryDialog(categoryId) {
  const category = state.categories.find((current) => current.id === categoryId);
  if (!category) return;
  state.pendingDeleteCategoryId = categoryId;
  const itemCount = state.items.filter((item) => itemCategoryId(item) === categoryId).length;
  if (el.deleteCategoryMessage) {
    el.deleteCategoryMessage.textContent = itemCount
      ? `Apagar "${category.name}"? Os ${itemCount} ${itemCount === 1 ? "item será movido" : "itens serão movidos"} para Sem seção.`
      : `Apagar "${category.name}"?`;
  }
  if (typeof el.deleteCategoryDialog.showModal === "function") {
    el.deleteCategoryDialog.showModal();
  } else {
    el.deleteCategoryDialog.setAttribute("open", "");
  }
}

function closeDeleteCategoryDialog() {
  state.pendingDeleteCategoryId = "";
  if (typeof el.deleteCategoryDialog.close === "function") {
    el.deleteCategoryDialog.close();
  } else {
    el.deleteCategoryDialog.removeAttribute("open");
  }
}

async function confirmDeleteCategory() {
  const categoryId = state.pendingDeleteCategoryId;
  const category = state.categories.find((current) => current.id === categoryId);
  if (!category) {
    closeDeleteCategoryDialog();
    return;
  }

  const affectedItems = state.items.filter((item) => itemCategoryId(item) === categoryId);
  if (affectedItems.length) {
    await Promise.all(affectedItems.map((item) => saveRecord("items", { ...item, categoryId: "" })));
  }
  await deleteRecord("categories", categoryId);
  closeDeleteCategoryDialog();
  await reloadAndRender();
  showToast("Seção apagada.");
}

function renderReorderCategoryList() {
  if (!el.reorderCategoryList) return;
  el.reorderCategoryList.innerHTML = "";
  state.reorderCategoryIds.forEach((categoryId, index) => {
    const category = state.categories.find((current) => current.id === categoryId);
    if (!category) return;
    const row = document.createElement("div");
    row.className = "reorder-section-row";
    row.innerHTML = `
      <div class="reorder-section-main">
        <strong>${escapeHtml(category.name)}</strong>
        <span>${index + 1}</span>
      </div>
      <div class="reorder-section-controls">
        <button class="btn btn-ghost btn-square btn-sm" type="button" data-move="up" aria-label="Subir ${escapeHtml(category.name)}" ${index === 0 ? "disabled" : ""}>
          <i data-lucide="chevron-up" aria-hidden="true"></i>
        </button>
        <button class="btn btn-ghost btn-square btn-sm" type="button" data-move="down" aria-label="Descer ${escapeHtml(category.name)}" ${index === state.reorderCategoryIds.length - 1 ? "disabled" : ""}>
          <i data-lucide="chevron-down" aria-hidden="true"></i>
        </button>
      </div>
    `;
    row.querySelectorAll("[data-move]").forEach((button) => {
      button.addEventListener("click", () => moveReorderCategory(categoryId, button.dataset.move));
    });
    el.reorderCategoryList.append(row);
  });
}

function moveReorderCategory(categoryId, direction) {
  const index = state.reorderCategoryIds.indexOf(categoryId);
  if (index === -1) return;
  const nextIndex = direction === "up" ? index - 1 : index + 1;
  if (nextIndex < 0 || nextIndex >= state.reorderCategoryIds.length) return;
  const updated = state.reorderCategoryIds.slice();
  const [moved] = updated.splice(index, 1);
  updated.splice(nextIndex, 0, moved);
  state.reorderCategoryIds = updated;
  renderReorderCategoryList();
  renderIcons();
}

function openReorderCategoryDialog() {
  if (!state.categories.length) {
    showToast("Crie uma seção para reordenar.");
    return;
  }
  state.reorderCategoryIds = state.categories.map((category) => category.id);
  renderReorderCategoryList();
  if (typeof el.reorderCategoryDialog.showModal === "function") {
    el.reorderCategoryDialog.showModal();
  } else {
    el.reorderCategoryDialog.setAttribute("open", "");
  }
  renderIcons();
}

function closeReorderCategoryDialog() {
  state.reorderCategoryIds = [];
  if (typeof el.reorderCategoryDialog.close === "function") {
    el.reorderCategoryDialog.close();
  } else {
    el.reorderCategoryDialog.removeAttribute("open");
  }
}

async function confirmReorderCategories() {
  if (!state.reorderCategoryIds.length) {
    closeReorderCategoryDialog();
    return;
  }
  const base = Date.now();
  await Promise.all(
    state.reorderCategoryIds.map((categoryId, index) => {
      const category = state.categories.find((current) => current.id === categoryId);
      return category ? saveRecord("categories", { ...category, createdAt: base + index }) : Promise.resolve();
    }),
  );
  closeReorderCategoryDialog();
  await reloadAndRender();
  showToast("Ordem das seções atualizada.");
}

function openCategoryDialog() {
  openCategoryEditor();
}

function openCategoryDialogForEdit(id) {
  openCategoryEditor(id);
}

function openCategoryReorderDialog() {
  openReorderCategoryDialog();
}

function openCategoryDeleteDialog(id) {
  openDeleteCategoryDialog(id);
}

function closeCategoryDialog() {
  state.editingCategoryId = null;
  if (el.categoryDialogTitle) {
    el.categoryDialogTitle.textContent = "Adicionar seção";
  }
  if (el.saveCategoryButton) {
    el.saveCategoryButton.textContent = "Adicionar";
  }
  if (el.categoryPresetGrid) {
    el.categoryPresetGrid.hidden = false;
  }
  el.categoryForm.reset();
  el.categoryPresetInputs.forEach((input) => { input.checked = false; });
  if (typeof el.categoryDialog.close === "function") {
    el.categoryDialog.close();
  } else {
    el.categoryDialog.removeAttribute("open");
  }
}

function isCategoryCollapsed(category) {
  if (category?.recent && !state.manuallyToggledCategoryIds.has(category.id)) {
    return true;
  }
  return state.collapsedCategoryIds.has(category.id);
}

function toggleCategory(id) {
  const isCollapsed = id === RECENTLY_PURCHASED_SECTION_ID && !state.manuallyToggledCategoryIds.has(id)
    ? true
    : state.collapsedCategoryIds.has(id);
  state.manuallyToggledCategoryIds.add(id);
  if (isCollapsed) {
    state.collapsedCategoryIds.delete(id);
  } else {
    state.collapsedCategoryIds.add(id);
  }
}
