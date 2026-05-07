function createShoppingList(category, items, hasInlineNewItem, isCollapsed) {
  const list = document.createElement("ul");
  list.className = "list shopping-list";
  list.dataset.categoryId = category.id;
  list.hidden = isCollapsed;

  if (state.inlineItemEditor && !state.inlineItemEditor.id && itemCategoryId({ categoryId: state.inlineItemEditor.categoryId }) === category.id) {
    list.append(createItemInlineEditor(null, category.id));
  }

  items.forEach((item) => {
    if (state.inlineItemEditor?.id === item.id) {
      list.append(createItemInlineEditor(item, category.id));
      return;
    }
    list.append(createItemRow(item, { removable: true }));
  });

  if (!items.length && !hasInlineNewItem) {
    const empty = document.createElement("li");
    empty.className = "section-empty";
    empty.textContent = "Adicione itens nesta seção pelo menu.";
    list.append(empty);
  }

  return list;
}

function createCategorySection(category, items) {
  const hasInlineNewItem = state.inlineItemEditor && !state.inlineItemEditor.id && itemCategoryId({ categoryId: state.inlineItemEditor.categoryId }) === category.id;
  if (category.locked && !items.length && state.categories.length && !hasInlineNewItem) return null;

  const section = document.createElement("section");
  section.className = "market-section";
  section.dataset.categoryId = category.id;

  const isCollapsed = state.collapsedCategoryIds.has(category.id);
  const canManage = !category.locked;
  section.innerHTML = `
    <div class="section-label">
      <button class="section-toggle" type="button" aria-expanded="${isCollapsed ? "false" : "true"}">
        <span>${escapeHtml(category.name)}</span>
        <small>${items.length} ${items.length === 1 ? "item" : "itens"}</small>
      </button>
      <div class="section-label-actions">
        <div class="dropdown dropdown-end section-actions-dropdown">
          <button class="btn btn-ghost btn-square btn-sm section-menu-button" type="button" tabindex="0" aria-label="Abrir opções de ${escapeHtml(category.name)}">
            <i data-lucide="ellipsis" aria-hidden="true"></i>
          </button>
          <ul class="dropdown-content menu section-actions-menu z-10 mt-2 w-56 rounded-box border border-base-300 bg-base-100 p-2 shadow">
            <li>
              <button type="button" data-action="add-item">
                <i data-lucide="plus" aria-hidden="true"></i>
                Adicionar item
              </button>
            </li>
            ${canManage ? `
              <li>
                <button type="button" data-action="edit-category">
                  <i data-lucide="pencil" aria-hidden="true"></i>
                  Editar seção
                </button>
              </li>
              <li>
                <button type="button" data-action="reorder-category">
                  <i data-lucide="arrow-up-down" aria-hidden="true"></i>
                  Reordenar seção
                </button>
              </li>
              <li>
                <button type="button" data-action="delete-category" class="text-error">
                  <i data-lucide="trash-2" aria-hidden="true"></i>
                  Apagar seção
                </button>
              </li>
            ` : ""}
          </ul>
        </div>
        <button class="btn btn-ghost btn-square btn-sm section-collapse-button" type="button" aria-label="${isCollapsed ? "Expandir" : "Recolher"} ${escapeHtml(category.name)}">
          <i data-lucide="${isCollapsed ? "chevron-down" : "chevron-up"}" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  `;

  section.append(createShoppingList(category, items, hasInlineNewItem, isCollapsed));

  const toggleSection = () => {
    toggleCategory(category.id);
    renderItems();
    renderIcons();
  };

  section.querySelector(".section-toggle").addEventListener("click", toggleSection);
  section.querySelector(".section-collapse-button").addEventListener("click", toggleSection);
  section.querySelector(".section-menu-button").addEventListener("click", (event) => event.stopPropagation());
  section.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const action = button.dataset.action;
      if (action === "add-item") openItemEditor(null, category.id);
      if (action === "edit-category") openCategoryDialogForEdit(category.id);
      if (action === "reorder-category") openCategoryReorderDialog();
      if (action === "delete-category") openCategoryDeleteDialog(category.id);
    });
  });

  return section;
}

function renderCategorySections() {
  const categories = [{ id: UNCATEGORIZED_ID, name: "Sem seção", locked: true }, ...state.categories];
  categories.forEach((category) => {
    const items = state.items.filter((item) => itemCategoryId(item) === category.id);
    const section = createCategorySection(category, items);
    if (section) {
      el.itemList.append(section);
    }
  });
}
