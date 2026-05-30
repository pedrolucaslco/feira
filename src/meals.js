function addMealItemEditorRow(item = {}) {
  if (!el.mealItemsEditor) return;
  el.mealItemsEditor.append(createMealItemEditorRow(item));
  renderIcons();
}

function openMealEditor(id = null) {
  closeListMenu();
  state.editingMealId = id;
  const meal = state.meals.find((current) => current.id === id);

  el.mealForm.reset();
  el.mealItemsEditor.innerHTML = "";
  el.mealDialogTitle.textContent = meal ? "Editar refeição" : "Nova refeição";
  el.saveMealButton.textContent = meal ? "Salvar" : "Adicionar";
  el.deleteMealButton.hidden = !meal;
  el.mealName.value = meal?.name || "";

  const mealItems = Array.isArray(meal?.items) ? meal.items : [];
  if (mealItems.length) {
    mealItems.forEach((item) => addMealItemEditorRow(item));
  } else {
    addMealItemEditorRow();
  }

  if (typeof el.mealDialog.showModal === "function") {
    el.mealDialog.showModal();
  } else {
    el.mealDialog.setAttribute("open", "");
  }
  focusDialogInputForCreate(el.mealName, Boolean(meal));
}

function closeMealDialog() {
  state.editingMealId = null;
  el.deleteMealButton.hidden = true;
  if (typeof el.mealDialog.close === "function") {
    el.mealDialog.close();
  } else {
    el.mealDialog.removeAttribute("open");
  }
}

function mealItemsFromForm() {
  return [...el.mealItemsEditor.querySelectorAll(".meal-item-editor-row")]
    .map((row) => ({
      id: row.dataset.itemId || createId(),
      name: row.querySelector("[name='mealItemName']").value.trim(),
      quantity: row.querySelector("[name='mealItemQuantity']").value.trim(),
      createdAt: Number(row.dataset.createdAt) || Date.now(),
    }))
    .filter((item) => item.name);
}

async function saveMeal(event) {
  event.preventDefault();
  const name = el.mealName.value.trim();
  const items = mealItemsFromForm();
  if (!name) {
    showToast("Informe o nome da refeição.");
    return;
  }
  if (!items.length) {
    showToast("Adicione pelo menos um item.");
    return;
  }

  const meal = state.meals.find((current) => current.id === state.editingMealId);
  const now = Date.now();
  if (meal) {
    await saveRecord("meals", normalizeMeal({ ...meal, name, items, updatedAt: now }));
  } else {
    await saveRecord("meals", normalizeMeal({
      id: createId(),
      name,
      items,
      createdAt: now,
      updatedAt: now,
    }));
  }

  closeMealDialog();
  await reloadAndRender();
  showToast(meal ? "Refeição atualizada." : "Refeição adicionada.");
}

async function removeMeal(id) {
  if (!id) return;
  const confirmed = window.confirm("Excluir esta refeição?");
  if (!confirmed) return;

  await deleteRecord("meals", id);
  if (state.editingMealId === id) {
    state.editingMealId = null;
  }
  if (el.mealDialog.open) {
    closeMealDialog();
  }
  await reloadAndRender();
  showToast("Refeição removida.");
}

async function addMealToCurrentList(id) {
  const meal = state.meals.find((current) => current.id === id);
  const mealItems = (meal?.items || []).filter((item) => item.name?.trim());
  if (!mealItems.length) {
    showToast("Esta refeição não tem itens.");
    return;
  }

  const itemsByName = new Map(state.items.map((item) => [normalizeItemName(item.name), item]));
  let addedCount = 0;
  let updatedCount = 0;

  for (const mealItem of mealItems) {
    const key = normalizeItemName(mealItem.name);
    const existing = itemsByName.get(key);
    if (existing) {
      const updatedItem = {
        ...existing,
        quantity: mergeQuantity(existing.quantity, mealItem.quantity),
        checked: false,
      };
      await saveRecord("items", updatedItem);
      itemsByName.set(key, updatedItem);
      updatedCount += 1;
      continue;
    }

    const createdAt = Date.now() + addedCount;
    const newItem = {
      id: createId(),
      name: mealItem.name.trim(),
      quantity: mealItem.quantity || "",
      categoryId: "",
      checked: false,
      createdAt,
      sortOrder: createdAt,
    };
    await saveRecord("items", newItem);
    itemsByName.set(key, newItem);
    addedCount += 1;
  }

  await reloadAndRender();
  const parts = [];
  if (addedCount) parts.push(`${addedCount} ${addedCount === 1 ? "item adicionado" : "itens adicionados"}`);
  if (updatedCount) parts.push(`${updatedCount} ${updatedCount === 1 ? "item atualizado" : "itens atualizados"}`);
  showToast(`${parts.join(" e ")} na lista.`);
}
