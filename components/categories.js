function renderCategorySections() {
  const categories = [{ id: UNCATEGORIZED_ID, name: "Sem seção", locked: true }, ...state.categories];
  categories.forEach((category) => {
    const items = state.items.filter((item) => itemCategoryId(item) === category.id);
    const hasInlineNewItem = state.inlineItemEditor && !state.inlineItemEditor.id && itemCategoryId({ categoryId: state.inlineItemEditor.categoryId }) === category.id;
    if (category.locked && !items.length && state.categories.length && !hasInlineNewItem) return;

    const section = document.createElement("section");
    section.className = "category-section";
    section.dataset.categoryId = category.id;

    const isCollapsed = state.collapsedCategoryIds.has(category.id);
    const listId = `category-list-${category.id}`;
    section.innerHTML = `
      <div class="collapse collapse-arrow bg-base-100 category-collapse border border-base-300">
        <input type="checkbox" ${isCollapsed ? "" : "checked"} />
        <div class="collapse-title category-head after:start-5 after:end-auto">
          <div class="category-head-main">
            <span>${escapeHtml(category.name)}</span>
            <small>${items.length} ${items.length === 1 ? "item" : "itens"}</small>
          </div>
          <button class="btn btn-ghost btn-square btn-sm category-add-button" type="button" aria-label="Adicionar item em ${escapeHtml(category.name)}">
            <i data-lucide="plus" aria-hidden="true"></i>
          </button>
        </div>
        <div class="collapse-content">
          <ul class="list category-items" id="${listId}"></ul>
        </div>
      </div>
    `;

    const list = section.querySelector(".category-items");

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
      empty.className = "category-empty";
      empty.textContent = "Use o botão + para adicionar itens nesta seção.";
      list.append(empty);
    }

    const collapseToggle = section.querySelector(".category-collapse input");
    collapseToggle?.addEventListener("change", () => toggleCategory(category.id));
    section.querySelector(".category-add-button").addEventListener("click", () => openItemEditor(null, category.id));
    el.itemList.append(section);
  });
}
