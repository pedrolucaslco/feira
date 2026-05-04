function createMealRow(meal) {
  const row = document.createElement("article");
  row.className = "card bg-base-100 border border-base-300 shadow-sm meal-row";
  const itemCount = Array.isArray(meal.items) ? meal.items.length : 0;
  const preview = (meal.items || [])
    .slice(0, 3)
    .map((item) => item.quantity ? `${item.name} (${item.quantity})` : item.name)
    .join(", ");
  row.innerHTML = `
    <div class="card-body">
      <button class="meal-main" type="button" aria-label="Editar ${escapeHtml(meal.name)}">
        <strong class="card-title">${escapeHtml(meal.name)}</strong>
        <span>${itemCount} ${itemCount === 1 ? "item" : "itens"}${preview ? ` - ${escapeHtml(preview)}` : ""}</span>
      </button>
      <div class="meal-actions">
        <button class="btn btn-soft meal-copy-button" type="button">
          <i data-lucide="list-plus" aria-hidden="true"></i>
          Adicionar à lista de compras atual
        </button>
      </div>
    </div>
  `;

  row.querySelector(".meal-main").addEventListener("click", () => openMealEditor(meal.id));
  row.querySelector(".meal-copy-button").addEventListener("click", () => addMealToCurrentList(meal.id));
  return row;
}

function createMealItemEditorRow(item = {}) {
  const row = document.createElement("div");
  row.className = "meal-item-editor-row";
  row.dataset.itemId = item.id || createId();
  row.dataset.createdAt = item.createdAt || Date.now();
  row.innerHTML = `
    <input class="input input-sm" name="mealItemName" autocomplete="off" placeholder="Item" value="${escapeHtml(item.name || "")}" />
    <input class="input input-sm" name="mealItemQuantity" autocomplete="off" placeholder="Quantidade" value="${escapeHtml(item.quantity || "")}" />
    <button class="btn btn-ghost btn-square meal-item-remove-button" type="button" aria-label="Remover item">
      <i data-lucide="trash-2" aria-hidden="true"></i>
    </button>
  `;
  row.querySelector(".meal-item-remove-button").addEventListener("click", () => {
    row.remove();
    if (!el.mealItemsEditor.querySelector(".meal-item-editor-row")) {
      addMealItemEditorRow();
    }
  });
  return row;
}
