// constants moved to src/constants.js

function preventIOSZoomGestures() {
  const preventDefault = (event) => event.preventDefault();

  ["gesturestart", "gesturechange", "gestureend"].forEach((eventName) => {
    document.addEventListener(eventName, preventDefault, { passive: false });
  });

  document.addEventListener("dblclick", preventDefault, { passive: false });
}

preventIOSZoomGestures();

applyDaisyTheme(getInitialTheme());

function animateCategoryList(list, shouldExpand) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finishPreviousTransition = list.categoryTransitionCleanup;
  if (typeof finishPreviousTransition === "function") {
    finishPreviousTransition();
  }

  let transitionFrame = 0;
  let transitionTimeout = 0;

  const finish = () => {
    cancelAnimationFrame(transitionFrame);
    clearTimeout(transitionTimeout);
    list.removeEventListener("transitionend", handleTransitionEnd);
    list.categoryTransitionCleanup = null;
    list.style.height = shouldExpand ? "" : "0px";
    list.style.willChange = "";
  };

  const handleTransitionEnd = (event) => {
    if (event.propertyName === "height") {
      finish();
    }
  };

  if (prefersReducedMotion) {
    list.dataset.collapsed = String(!shouldExpand);
    list.setAttribute("aria-hidden", String(!shouldExpand));
    list.style.height = shouldExpand ? "" : "0px";
    return;
  }

  list.categoryTransitionCleanup = finish;
  list.style.willChange = "height";
  list.addEventListener("transitionend", handleTransitionEnd);

  if (shouldExpand) {
    list.dataset.collapsed = "false";
    list.setAttribute("aria-hidden", "false");
    list.style.height = "0px";
    transitionFrame = requestAnimationFrame(() => {
      list.style.height = `${list.scrollHeight}px`;
      transitionTimeout = setTimeout(finish, 320);
    });
  } else {
    list.style.height = `${list.scrollHeight}px`;
    transitionFrame = requestAnimationFrame(() => {
      list.dataset.collapsed = "true";
      list.setAttribute("aria-hidden", "true");
      list.style.height = "0px";
      transitionTimeout = setTimeout(finish, 320);
    });
  }
}

var el = {
  views: [...document.querySelectorAll(".view")],
  navButtons: [...document.querySelectorAll("[data-nav-button]")],
  remainingBalance: document.querySelector("#remainingBalance"),
  spentBudgetRatio: document.querySelector("#spentBudgetRatio"),
  spentBudgetSpent: document.querySelector("#spentBudgetSpent"),
  spentBudgetTotal: document.querySelector("#spentBudgetTotal"),
  purchaseCountLabel: document.querySelector("#purchaseCountLabel"),
  purchasePeriodTitle: document.querySelector("#purchasePeriodTitle"),
  purchasePeriodRange: document.querySelector("#purchasePeriodRange"),
  purchasePeriodRule: document.querySelector("#purchasePeriodRule"),
  topbarWeeklyBudget: document.querySelector("#topbarWeeklyBudget"),
  topbarWeeklyLabel: document.querySelector("#topbarWeeklyLabel"),
  topbarRefreshButton: document.querySelector("#topbarRefreshButton"),
  itemCountLabel: document.querySelector("#itemCountLabel"),
  activeSpaceName: document.querySelector("#activeSpaceName"),
  spaceSwitcherButton: document.querySelector("#spaceSwitcherButton"),
  spaceMenu: document.querySelector("#spaceMenu"),
  spaceMenuList: document.querySelector("#spaceMenuList"),
  syncStatusLabel: document.querySelector("#syncStatusLabel"),
  conflictBanner: document.querySelector("#conflictBanner"),
  openConflictsButton: document.querySelector("#openConflictsButton"),
  purchaseList: document.querySelector("#purchaseList"),
  emptyPurchases: document.querySelector("#emptyPurchases"),
  purchaseChart: document.querySelector("#purchaseChart"),
  purchaseMedianLabel: document.querySelector("#purchaseMedianLabel"),
  emptyPurchaseChart: document.querySelector("#emptyPurchaseChart"),
  budgetForm: document.querySelector("#budgetForm"),
  budgetInput: document.querySelector("#budgetInput"),
  cardClosingDayInput: document.querySelector("#cardClosingDayInput"),
  profileForm: document.querySelector("#profileForm"),
  userNameInput: document.querySelector("#userNameInput"),
  itemForm: document.querySelector("#itemForm"),
  itemName: document.querySelector("#itemName"),
  itemQuantity: document.querySelector("#itemQuantity"),
  itemCategory: document.querySelector("#itemCategory"),
  categoryForm: document.querySelector("#categoryForm"),
  categoryDialogTitle: document.querySelector("#categoryDialogTitle"),
  categoryNameInput: document.querySelector("#categoryNameInput"),
  categoryPresetInputs: [...document.querySelectorAll("input[name='categoryPreset']")],
  categoryPresetGrid: document.querySelector("#categoryPresetGrid"),
  saveCategoryButton: document.querySelector("#saveCategoryButton"),
  itemDialog: document.querySelector("#itemDialog"),
  itemDialogTitle: document.querySelector("#itemDialogTitle"),
  saveItemButton: document.querySelector("#saveItemButton"),
  deleteItemButton: document.querySelector("#deleteItemButton"),
  closeItemDialogButton: document.querySelector("#closeItemDialogButton"),
  cancelItemDialogButton: document.querySelector("#cancelItemDialogButton"),
  categoryDialog: document.querySelector("#categoryDialog"),
  closeCategoryDialogButton: document.querySelector("#closeCategoryDialogButton"),
  cancelCategoryDialogButton: document.querySelector("#cancelCategoryDialogButton"),
  reorderCategoryDialog: document.querySelector("#reorderCategoryDialog"),
  reorderCategoryList: document.querySelector("#reorderCategoryList"),
  closeReorderCategoryDialogButton: document.querySelector("#closeReorderCategoryDialogButton"),
  confirmReorderCategoriesButton: document.querySelector("#confirmReorderCategoriesButton"),
  deleteCategoryDialog: document.querySelector("#deleteCategoryDialog"),
  deleteCategoryMessage: document.querySelector("#deleteCategoryMessage"),
  closeDeleteCategoryDialogButton: document.querySelector("#closeDeleteCategoryDialogButton"),
  cancelDeleteCategoryDialogButton: document.querySelector("#cancelDeleteCategoryDialogButton"),
  confirmDeleteCategoryButton: document.querySelector("#confirmDeleteCategoryButton"),
  itemList: document.querySelector("#itemList"),
  emptyItems: document.querySelector("#emptyItems"),
  purchaseSessionBar: document.querySelector("#purchaseSessionBar"),
  purchaseSessionTitle: document.querySelector("#purchaseSessionTitle"),
  purchaseSessionTimer: document.querySelector("#purchaseSessionTimer"),
  purchaseSessionMeta: document.querySelector("#purchaseSessionMeta"),
  startPurchaseSessionButton: document.querySelector("#startPurchaseSessionButton"),
  finishPurchaseSessionButton: document.querySelector("#finishPurchaseSessionButton"),
  cancelPurchaseSessionButton: document.querySelector("#cancelPurchaseSessionButton"),
  clearRecentItemsButton: document.querySelector("#clearRecentItemsButton"),
  mealCountLabel: document.querySelector("#mealCountLabel"),
  mealList: document.querySelector("#mealList"),
  emptyMeals: document.querySelector("#emptyMeals"),
  createFirstMealButton: document.querySelector("#createFirstMealButton"),
  resetDatabaseButton: document.querySelector("#resetDatabaseButton"),
  manualRefreshButton: document.querySelector("#manualRefreshButton"),
  themeToggle: document.querySelector("#themeToggle"),
  editorModeInput: document.querySelector("#editorModeInput"),
  createSpaceForm: document.querySelector("#createSpaceForm"),
  createSpaceNameInput: document.querySelector("#createSpaceNameInput"),
  joinSpaceForm: document.querySelector("#joinSpaceForm"),
  joinSpaceCodeInput: document.querySelector("#joinSpaceCodeInput"),
  shareSpaceCard: document.querySelector("#shareSpaceCard"),
  currentSpaceNameInput: document.querySelector("#currentSpaceNameInput"),
  renameSpaceButton: document.querySelector("#renameSpaceButton"),
  inviteCodeInput: document.querySelector("#inviteCodeInput"),
  copyInviteButton: document.querySelector("#copyInviteButton"),
  quickAddButton: document.querySelector("#quickAddButton"),
  listMenuButton: document.querySelector("#listMenuButton"),
  listMenu: document.querySelector("#listMenu"),
  openCategoryDialogButton: document.querySelector("#openCategoryDialogButton"),
  clearMarketListButton: document.querySelector("#clearMarketListButton"),
  refreshButton: document.querySelector("#refreshButton"),
  purchaseInlineEditorMount: document.querySelector("#purchaseInlineEditorMount"),
  checkoutDialog: document.querySelector("#checkoutDialog"),
  checkoutDialogTitle: document.querySelector("#checkoutDialogTitle"),
  checkoutForm: document.querySelector("#checkoutForm"),
  purchaseName: document.querySelector("#purchaseName"),
  purchaseDate: document.querySelector("#purchaseDate"),
  purchaseTotal: document.querySelector("#purchaseTotal"),
  purchaseReceipt: document.querySelector("#purchaseReceipt"),
  purchaseReceiptCount: document.querySelector("#purchaseReceiptCount"),
  purchaseReceiptList: document.querySelector("#purchaseReceiptList"),
  savePurchaseButton: document.querySelector("#savePurchaseButton"),
  deletePurchaseButton: document.querySelector("#deletePurchaseButton"),
  closeCheckoutButton: document.querySelector("#closeCheckoutButton"),
  cancelCheckoutButton: document.querySelector("#cancelCheckoutButton"),
  mealDialog: document.querySelector("#mealDialog"),
  mealForm: document.querySelector("#mealForm"),
  mealDialogTitle: document.querySelector("#mealDialogTitle"),
  mealName: document.querySelector("#mealName"),
  mealItemsEditor: document.querySelector("#mealItemsEditor"),
  addMealItemButton: document.querySelector("#addMealItemButton"),
  saveMealButton: document.querySelector("#saveMealButton"),
  deleteMealButton: document.querySelector("#deleteMealButton"),
  closeMealDialogButton: document.querySelector("#closeMealDialogButton"),
  cancelMealDialogButton: document.querySelector("#cancelMealDialogButton"),
  conflictDialog: document.querySelector("#conflictDialog"),
  conflictList: document.querySelector("#conflictList"),
  closeConflictDialogButton: document.querySelector("#closeConflictDialogButton"),
  runSyncTestsButton: document.querySelector("#runSyncTestsButton"),
  syncTestSummary: document.querySelector("#syncTestSummary"),
  syncTestList: document.querySelector("#syncTestList"),
  toast: document.querySelector("#toast"),
};

console.log("[SPACE MENU] Elements initialized:");
console.log("[SPACE MENU]   spaceSwitcherButton:", el.spaceSwitcherButton);
console.log("[SPACE MENU]   spaceMenu:", el.spaceMenu);
console.log("[SPACE MENU]   spaceMenuList:", el.spaceMenuList);

function syncMetaId(spaceId, entityType, entityId) {
  return `${spaceId}:${entityType}:${entityId}`;
}

function outboxId() {
  return `op:${Date.now()}:${createId()}`;
}

function publicRecordData(storeName, value) {
  const { id, spaceId, syncStatus, pendingSync, ...data } = value;
  if (storeName === "settings") {
    return {
      monthlyBudget: data.monthlyBudget,
      cardClosingDay: data.cardClosingDay,
    };
  }
  return data;
}

function canonicalSyncData(storeName, value, spaceId = state.activeSpaceId) {
  if (!value) return null;
  const normalized = normalizeStoreRecord(storeName, { ...value, spaceId }, spaceId);
  return sortObjectKeys(publicRecordData(storeName, normalized));
}

function syncRecordsEquivalent(storeName, localValue, remoteValue, spaceId = state.activeSpaceId) {
  return JSON.stringify(canonicalSyncData(storeName, localValue, spaceId)) === JSON.stringify(canonicalSyncData(storeName, remoteValue, spaceId));
}

function syncPayloadEquivalent(storeName, payload, value, spaceId = state.activeSpaceId) {
  return JSON.stringify(sortObjectKeys(payload || null)) === JSON.stringify(canonicalSyncData(storeName, value, spaceId));
}

function shouldCreateSyncConflict(storeName, localValue, remoteValue, pendingOperations = [], spaceId = state.activeSpaceId) {
  if (!pendingOperations.length) return false;
  if (syncRecordsEquivalent(storeName, localValue, remoteValue, spaceId)) return false;
  const sortedOperations = pendingOperations.slice().sort((a, b) => a.createdAt - b.createdAt);
  const latestOperation = sortedOperations[sortedOperations.length - 1];
  return !(latestOperation?.action !== "delete" && syncPayloadEquivalent(storeName, latestOperation.data, remoteValue, spaceId));
}

function deriveSyncStatus({ isShared = true, isRunning = false, outbox = [], conflicts = [], failed = false } = {}) {
  if (!isShared) return "local";
  if (conflicts.length) return "conflict";
  if (isRunning || outbox.length) return "syncing";
  if (failed) return "offline";
  return "synced";
}

function isEntityTypeConstraintError(error) {
  const message = `${error?.message || ""} ${error?.details || ""} ${error?.hint || ""}`;
  return /space_records_entity_type_check|entity_type|check constraint/i.test(message);
}

function syncErrorMessage(error, operation) {
  if (isEntityTypeConstraintError(error) && ["meal", "purchase_session"].includes(operation?.entityType)) {
    return operation.entityType === "purchase_session"
      ? "Atualize o SQL do Supabase para aceitar sessões de compra na sincronização."
      : "Atualize o SQL do Supabase para aceitar refeições na sincronização.";
  }
  return "Erro ao sincronizar operação.";
}

async function enqueueSync(storeName, value, action = "upsert") {
  const space = activeSpace();
  if (!isSharedSpace(space) || !STORE_TO_ENTITY[storeName]) return;

  const entityType = STORE_TO_ENTITY[storeName];
  const entityId = storeName === "settings" ? SETTINGS_ID : value.id;
  const meta = await getOne("syncMeta", syncMetaId(space.id, entityType, entityId));
  await putOne("syncOutbox", {
    id: outboxId(),
    spaceId: space.id,
    entityType,
    entityId,
    action,
    data: action === "delete" ? null : publicRecordData(storeName, value),
    baseVersion: meta?.version || 0,
    createdAt: Date.now(),
  });
}

async function saveRecord(storeName, value, { sync = true } = {}) {
  const record = normalizeStoreRecord(storeName, withSpace(value));
  await putOne(storeName, record);
  if (sync) {
    await enqueueSync(storeName, record);
    syncNow();
  }
  return record;
}

async function deleteRecord(storeName, id, { sync = true } = {}) {
  const value = await getOne(storeName, id);
  await deleteOne(storeName, id);
  if (sync && value) {
    await enqueueSync(storeName, value, "delete");
    syncNow();
  }
}

function currentMonthPurchases() {
  const { start, end } = billingPeriodBounds();
  return state.purchases.filter((purchase) => purchase.date >= start && purchase.date < end);
}

function activePurchaseSession() {
  return state.purchaseSessions.find((session) => session.status === "active") || null;
}

function checkedItemsForSession(session = activePurchaseSession()) {
  if (!session) return [];
  const checkedIds = new Set((session.checkedItems || []).map((item) => item.itemId));
  return state.items.filter((item) => checkedIds.has(item.id) && item.checked);
}

function recentCheckedItems() {
  return state.items.filter((item) => item.checked === true);
}

function sessionHasItem(session, itemId) {
  return Boolean(session?.checkedItems?.some((item) => item.itemId === itemId));
}

function categoryNameForItem(item) {
  if (!item?.categoryId) return "Sem seção";
  return state.categories.find((category) => category.id === item.categoryId)?.name || "Sem seção";
}

function checkedItemsSnapshot(session) {
  return (session?.checkedItems || [])
    .map((checkedItem) => {
      const item = state.items.find((current) => current.id === checkedItem.itemId);
      if (!item || !item.checked) return null;
      return {
        itemId: item.id,
        name: item.name,
        quantity: item.quantity || "",
        categoryId: item.categoryId || "",
        categoryName: categoryNameForItem(item),
        checkedAt: checkedItem.checkedAt,
      };
    })
    .filter(Boolean);
}

function purchaseTitle(purchase, index) {
  const name = (purchase.name || "").trim();
  return name || `Compra #${state.purchases.length - index}`;
}

function itemCategoryId(item) {
  return item.categoryId || UNCATEGORIZED_ID;
}

function storeCategoryId(categoryId = "") {
  return categoryId === UNCATEGORIZED_ID ? "" : categoryId;
}

function shouldSuppressItemClick(id) {
  if (state.suppressItemClickId !== id) return false;
  state.suppressItemClickId = "";
  return true;
}

function sectionItems(categoryId, excludedItemId = "") {
  return state.items.filter((item) => item.id !== excludedItemId && item.checked !== true && itemCategoryId(item) === categoryId);
}

function clearItemDropIndicators() {
  document.querySelectorAll(".item-row.is-drop-before, .item-row.is-drop-after, .shopping-list.is-drop-target, .market-section.is-drag-over-section").forEach((element) => {
    element.classList.remove("is-drop-before", "is-drop-after", "is-drop-target", "is-drag-over-section");
  });
}

function updateItemDropTarget(clientX, clientY) {
  clearItemDropIndicators();
  const target = document.elementFromPoint(clientX, clientY);
  const targetRow = target?.closest?.(".item-row");
  const targetList = target?.closest?.(".shopping-list");
  const targetSection = target?.closest?.(".market-section");
  const targetEmpty = target?.closest?.(".section-empty");
  const draggedItem = state.items.find((item) => item.id === state.draggingItemId);
  const fallbackCategoryId = draggedItem ? itemCategoryId(draggedItem) : UNCATEGORIZED_ID;
  const categoryId = targetList?.dataset.categoryId || targetRow?.dataset.categoryId || targetSection?.dataset.categoryId || fallbackCategoryId;

  var skipSection = categoryId === RECENTLY_PURCHASED_SECTION_ID;
  state.dragTargetCategoryId = skipSection ? fallbackCategoryId : categoryId;
  state.dragTargetItemId = "";
  state.dragTargetPlacement = "after";

  if (skipSection) return;

  if (targetSection && categoryId !== fallbackCategoryId) {
    targetSection.classList.add("is-drag-over-section");
  }

  if (targetRow && targetRow.dataset.itemId !== state.draggingItemId) {
    const rect = targetRow.getBoundingClientRect();
    const placement = clientY < rect.top + rect.height / 2 ? "before" : "after";
    targetRow.classList.add(placement === "before" ? "is-drop-before" : "is-drop-after");
    state.dragTargetItemId = targetRow.dataset.itemId;
    state.dragTargetPlacement = placement;
    return;
  }

  if (targetEmpty && targetSection) {
    targetEmpty.classList.add("is-drop-target");
    return;
  }

  targetList?.classList.add("is-drop-target");
}

async function moveDraggedItemToTarget() {
  const item = state.items.find((current) => current.id === state.draggingItemId);
  if (!item) return;

  var targetCategoryId = state.dragTargetCategoryId || itemCategoryId(item);
  if (targetCategoryId === RECENTLY_PURCHASED_SECTION_ID) targetCategoryId = itemCategoryId(item);
  const items = sectionItems(targetCategoryId, item.id);
  const targetItemIndex = items.findIndex((current) => current.id === state.dragTargetItemId);
  const targetIndex = targetItemIndex === -1
    ? items.length
    : targetItemIndex + (state.dragTargetPlacement === "after" ? 1 : 0);
  const nextSortOrder = sortOrderForItemPosition(items, targetIndex);
  const nextCategoryId = storeCategoryId(targetCategoryId);
  const changedCategory = (item.categoryId || "") !== nextCategoryId;
  const changedPosition = itemSortOrder(item) !== nextSortOrder;

  if (!changedCategory && !changedPosition) return;
  await saveRecord("items", {
    ...item,
    categoryId: nextCategoryId,
    sortOrder: nextSortOrder,
  });
}

function bindItemLongPressDrag(row, item) {
  let longPressTimer = 0;
  let isDragging = false;
  let scrollRAF = 0;
  let currentClientY = 0;
  const longPressDelay = 420;

  const cleanup = () => {
    window.clearTimeout(longPressTimer);
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("pointercancel", handlePointerCancel);
    if (scrollRAF) {
      window.cancelAnimationFrame(scrollRAF);
      scrollRAF = 0;
    }
  };

  const startDrag = (event) => {
    isDragging = true;
    state.draggingItemId = item.id;
    state.dragTargetCategoryId = itemCategoryId(item);
    state.dragTargetItemId = "";
    state.dragTargetPlacement = "after";
    row.classList.add("is-dragging");
    document.body.classList.add("is-dragging-item");
    currentClientY = event.clientY;
    updateItemDropTarget(event.clientX, event.clientY);
    event.preventDefault();

    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  function autoScroll() {
    function tick() {
      if (!isDragging) return;
      var y = currentClientY;
      var margin = 40;
      var maxSpeed = 10;
      var viewH = window.innerHeight;
      if (y < margin) {
        window.scrollBy(0, -(margin - y) / margin * maxSpeed);
      } else if (y > viewH - margin) {
        window.scrollBy(0, (y - (viewH - margin)) / margin * maxSpeed);
      }
      scrollRAF = window.requestAnimationFrame(tick);
    }
    scrollRAF = window.requestAnimationFrame(tick);
  }

  function handlePointerMove(event) {
    if (!isDragging) return;
    event.preventDefault();
    currentClientY = event.clientY;
    updateItemDropTarget(event.clientX, event.clientY);
  }

  async function handlePointerUp(event) {
    cleanup();
    if (!isDragging) return;
    event.preventDefault();
    state.suppressItemClickId = item.id;
    row.classList.remove("is-dragging");
    document.body.classList.remove("is-dragging-item");
    clearItemDropIndicators();
    await moveDraggedItemToTarget();
    state.draggingItemId = null;
    state.dragTargetCategoryId = "";
    state.dragTargetItemId = "";
    await reloadAndRender();
  }

  function handlePointerCancel() {
    cleanup();
    row.classList.remove("is-dragging");
    document.body.classList.remove("is-dragging-item");
    clearItemDropIndicators();
    state.draggingItemId = null;
    state.dragTargetCategoryId = "";
    state.dragTargetItemId = "";
  }

  row.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    var handle = event.target.closest(".drag-handle");
    if (!handle && event.target.closest("input, select, textarea, .check-button")) return;
    window.clearTimeout(longPressTimer);
    currentClientY = event.clientY;
    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp, { passive: false });
    window.addEventListener("pointercancel", handlePointerCancel, { passive: false });
    if (handle) {
      autoScroll();
      startDrag(event);
    } else {
      autoScroll();
      longPressTimer = window.setTimeout(() => startDrag(event), longPressDelay);
    }
  });

  row.addEventListener("pointermove", (event) => {
    currentClientY = event.clientY;
    if (isDragging) return;
    if (Math.abs(event.movementX) > 8 || Math.abs(event.movementY) > 8) {
      cleanup();
    }
  });
}

function renderFinancialState() {
  const monthPurchases = currentMonthPurchases();
  const period = billingPeriodBounds();
  const spent = monthPurchases.reduce((sum, purchase) => sum + purchase.total, 0);
  const budget = state.settings.monthlyBudget;
  const remaining = budget - spent;
  const weeksLeft = weeksUntilClosing(state.settings.cardClosingDay);

  el.remainingBalance.textContent = formatCurrency(remaining);
  if (el.spentBudgetRatio && el.spentBudgetSpent && el.spentBudgetTotal) {
    el.spentBudgetSpent.textContent = formatCurrency(spent);
    el.spentBudgetTotal.textContent = formatCurrency(budget);
  }
  if (el.purchaseCountLabel) {
    el.purchaseCountLabel.textContent = `${monthPurchases.length} ${monthPurchases.length === 1 ? "compra" : "compras"}`;
  }
  renderPurchasePeriod(period);
  el.budgetInput.value = budget ? String(budget).replace(".", ",") : "";
  el.cardClosingDayInput.value = state.settings.cardClosingDay || "";
  el.userNameInput.value = state.settings.userName || "";
  renderWeeklyBudget(remaining, weeksLeft);
  renderProfile();

  el.purchaseList.innerHTML = "";
  if (el.purchaseInlineEditorMount) {
    el.purchaseInlineEditorMount.innerHTML = "";
    if (state.inlinePurchaseEditor && !state.inlinePurchaseEditor.id) {
      el.purchaseInlineEditorMount.append(createPurchaseInlineEditor());
    }
  }
  monthPurchases.forEach((purchase, index) => {
    if (state.inlinePurchaseEditor?.id === purchase.id) {
      el.purchaseList.append(createPurchaseInlineEditor(purchase));
      return;
    }
    el.purchaseList.append(createPurchaseRow(purchase, index));
  });

  el.emptyPurchases.classList.toggle("is-visible", monthPurchases.length === 0 && !state.inlinePurchaseEditor);
  renderPurchaseChart(monthPurchases);
}

function renderPurchasePeriod(period) {
  if (!el.purchasePeriodTitle || !el.purchasePeriodRange || !el.purchasePeriodRule) return;

  const endInclusive = period.end - 1;
  const cycleName = formatLongMonth(period.labelDate);
  el.purchasePeriodTitle.textContent = period.usesClosingDay ? `Ciclo de ${cycleName}` : `Mês de ${cycleName}`;
  el.purchasePeriodRange.textContent = `${formatDate(period.start)} a ${formatDate(endInclusive)}`;
  el.purchasePeriodRule.textContent = period.usesClosingDay
    ? `Fechamento dia ${state.settings.cardClosingDay}: compras a partir desse dia entram no ciclo seguinte.`
    : "Sem dia de fechamento: o app usa o mês do calendário.";
}

function renderPurchaseChart(periodPurchases = currentMonthPurchases()) {
  if (!el.purchaseChart || !el.purchaseMedianLabel || !el.emptyPurchaseChart) return;

  const purchases = periodPurchases.slice(0, 8).reverse();
  const totals = purchases.map((purchase) => purchase.total);
  const max = Math.max(...totals, 0);
  const medianValue = median(totals);

  el.purchaseChart.innerHTML = "";
  el.purchaseMedianLabel.textContent = `Mediana ${formatCurrency(medianValue)}`;
  el.emptyPurchaseChart.classList.toggle("is-visible", purchases.length === 0);

  if (!purchases.length) return;

  const medianLine = document.createElement("span");
  medianLine.className = "median-line";
  medianLine.style.bottom = `${Math.max(8, Math.min(94, (medianValue / max) * 100))}%`;
  el.purchaseChart.append(medianLine);

  purchases.forEach((purchase, index) => {
    const bar = document.createElement("span");
    bar.className = "purchase-bar";
    bar.style.height = `${Math.max(12, (purchase.total / max) * 100)}%`;
    bar.title = `${formatDate(purchase.date)} - ${formatCurrency(purchase.total)}`;
    bar.setAttribute("aria-label", `Compra ${index + 1}: ${formatCurrency(purchase.total)}`);
    el.purchaseChart.append(bar);
  });
}

function updatePurchaseSessionTimer() {
  if (!el.purchaseSessionTimer) return;
  const session = activePurchaseSession();
  if (!session) {
    el.purchaseSessionTimer.textContent = "00:00";
    return;
  }
  el.purchaseSessionTimer.textContent = formatDuration(Date.now() - session.startedAt);
}

function syncPurchaseSessionTimer() {
  const session = activePurchaseSession();
  if (state.purchaseTimerId && !session) {
    clearInterval(state.purchaseTimerId);
    state.purchaseTimerId = 0;
  }
  if (session && !state.purchaseTimerId) {
    state.purchaseTimerId = setInterval(updatePurchaseSessionTimer, 1000);
  }
  updatePurchaseSessionTimer();
}

function renderPurchaseSessionBar() {
  const session = activePurchaseSession();
  const recentCount = recentCheckedItems().length;
  const sessionCount = checkedItemsForSession(session).length;

  if (el.purchaseSessionBar) {
    el.purchaseSessionBar.hidden = !session;
  }
  if (el.purchaseSessionTitle) {
    el.purchaseSessionTitle.textContent = session ? "Compra em andamento" : "Compra";
  }
  if (el.purchaseSessionMeta) {
    el.purchaseSessionMeta.textContent = session
      ? `${sessionCount} ${sessionCount === 1 ? "item marcado" : "itens marcados"} nesta compra`
      : "";
  }
  if (el.startPurchaseSessionButton) {
    el.startPurchaseSessionButton.hidden = Boolean(session);
  }
  if (el.finishPurchaseSessionButton) {
    el.finishPurchaseSessionButton.hidden = !session;
    el.finishPurchaseSessionButton.disabled = sessionCount === 0;
  }
  if (el.cancelPurchaseSessionButton) {
    el.cancelPurchaseSessionButton.hidden = !session;
  }
  if (el.clearRecentItemsButton) {
    el.clearRecentItemsButton.hidden = recentCount === 0 || Boolean(session);
  }
  syncPurchaseSessionTimer();
}

function renderWeeklyBudget(remaining, weeksLeft) {
  if (!el.topbarWeeklyBudget || !el.topbarWeeklyLabel) return;

  if (!weeksLeft) {
    el.topbarWeeklyBudget.textContent = "--";
    el.topbarWeeklyLabel.textContent = "Semana";
    return;
  }

  el.topbarWeeklyBudget.textContent = formatCurrency(remaining / weeksLeft);
  el.topbarWeeklyLabel.textContent = "Semana";
}

function renderProfile() {
  if (el.activeSpaceName) {
    el.activeSpaceName.textContent = activeSpace().name;
  }
}

function renderSpaces() {
  console.log("[SPACE MENU] renderSpaces called");
  const space = activeSpace();
  const pendingCount = state.syncOutbox.length;
  const conflictCount = state.syncConflicts.length;
  if (el.spaceSwitcherButton) {
    el.spaceSwitcherButton.setAttribute("aria-expanded", String(el.spaceMenu?.open || false));
  }
  if (el.spaceMenuList) {
    el.spaceMenuList.innerHTML = "";
    state.spaces.forEach((current) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = current.id === state.activeSpaceId ? "active" : "";
      button.innerHTML = `
        <span class="space-menu-label">
          <strong>${escapeHtml(current.name)}</strong>
          <small>${current.type === "shared" ? "Compartilhado" : "Local"}</small>
        </span>
      `;
      button.addEventListener("click", () => switchSpace(current.id));
      item.append(button);
      el.spaceMenuList.append(item);
    });
  }
  if (el.syncStatusLabel) {
    // Remove old classes
    el.syncStatusLabel.className = "sync-status-icon";
    let iconName = "server";
    let statusClass = "is-local";
    let title = "Local";

    if (!isSharedSpace(space)) {
      iconName = "server";
      statusClass = "is-local";
      title = "Espaço local";
    } else if (conflictCount) {
      iconName = "alert-circle";
      statusClass = "is-conflict";
      title = `${conflictCount} conflito${conflictCount === 1 ? "" : "s"}`;
    } else if (pendingCount) {
      iconName = "refresh-cw";
      statusClass = "is-syncing";
      title = "Sincronizando";
    } else if (state.syncStatus === "offline") {
      iconName = "wifi-off";
      statusClass = "is-offline";
      title = "Offline";
    } else {
      iconName = "check-circle-2";
      statusClass = "is-synced";
      title = "Sincronizado";
    }

    el.syncStatusLabel.className = `sync-status-icon ${statusClass}`;
    el.syncStatusLabel.setAttribute("title", title);
    
    const icon = el.syncStatusLabel.querySelector("[data-lucide]");
    if (icon) {
      icon.setAttribute("data-lucide", iconName);
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
  }
  if (el.conflictBanner) {
    el.conflictBanner.hidden = conflictCount === 0;
    const label = el.conflictBanner.querySelector("strong");
    if (label) {
      label.textContent = `${conflictCount} conflito${conflictCount === 1 ? "" : "s"} de sincronização`;
    }
  }
}



function renderItems() {
  el.itemList.innerHTML = "";

  renderPurchaseSessionBar();
  renderCategorySections();

  el.emptyItems.classList.toggle("is-visible", state.items.length === 0 && !state.inlineItemEditor);
  if (el.itemCountLabel) {
    const recentCount = recentCheckedItems().length;
    const suffix = recentCount ? `, ${recentCount} comprados` : "";
    el.itemCountLabel.textContent = `${state.items.length} ${state.items.length === 1 ? "item" : "itens"}${suffix}`;
  }
}

function renderMeals() {
  if (!el.mealList || !el.emptyMeals) return;

  el.mealList.innerHTML = "";
  state.meals.forEach((meal) => {
    el.mealList.append(createMealRow(meal));
  });

  el.emptyMeals.classList.toggle("is-visible", state.meals.length === 0);
  if (el.mealCountLabel) {
    el.mealCountLabel.textContent = `${state.meals.length} ${state.meals.length === 1 ? "refeição" : "refeições"}`;
  }
}



function renderNavigation() {
  var isLoginView = state.activeView === "loginView";
  el.views.forEach((view) => view.classList.toggle("is-active", view.id === state.activeView));
  el.navButtons.forEach((button) => {
    const isActive = button.dataset.view === state.activeView;
    button.classList.toggle("dock-active", isActive);
  });
  var dock = document.getElementById("mainNav");
  if (dock) dock.hidden = isLoginView;
  var topbar = document.querySelector(".topbar");
  if (topbar) topbar.hidden = isLoginView;
  if (el.quickAddButton) {
    el.quickAddButton.hidden = isLoginView || state.activeView === "settingsView" || state.activeView === "changelogView";
    const quickAddIcon = el.quickAddButton.querySelector("[data-lucide]");
    if (state.activeView === "listView") {
      el.quickAddButton.setAttribute("aria-label", "Adicionar item");
      quickAddIcon?.setAttribute("data-lucide", "plus");
    } else {
      el.quickAddButton.setAttribute("aria-label", "Adicionar");
      quickAddIcon?.setAttribute("data-lucide", "plus");
    }
  }
}

function renderChangelog() {
  var list = document.getElementById("changelogList");
  if (!list) return;
  list.innerHTML = "";
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "/changelog.json");
  xhr.onload = function () {
    if (xhr.status !== 200) {
      list.innerHTML = '<p class="empty-state">Não foi possível carregar as novidades.</p>';
      return;
    }
    try {
      var entries = JSON.parse(xhr.responseText);
      if (!entries.length) {
        list.innerHTML = '<p class="empty-state">Nenhuma novidade por enquanto.</p>';
        return;
      }
      entries.forEach(function (entry) {
        var card = document.createElement("div");
        card.className = "changelog-entry card bg-base-100 border border-base-300 mb-3";
        var dateObj = new Date(entry.date + "T12:00:00");
        var dateStr = dateObj.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
        card.innerHTML =
          '<div class="card-body">' +
            '<div class="changelog-head">' +
              '<span class="changelog-version badge badge-primary">' + (entry.version || "") + '</span>' +
              '<span class="changelog-date text-sm text-base-content/60">' + dateStr + '</span>' +
            '</div>' +
            '<ul class="changelog-changes">' +
              entry.changes.map(function (c) {
                var badgeClass = c.type === "new" ? "badge-success" : c.type === "fixed" ? "badge-warning" : "badge-info";
                var label = c.type === "new" ? "Novo" : c.type === "fixed" ? "Corrigido" : "Melhorado";
                return '<li>' +
                  '<span class="badge ' + badgeClass + ' badge-sm changelog-badge">' + label + '</span> ' +
                  '<span>' + c.text + '</span>' +
                '</li>';
              }).join("") +
            '</ul>' +
          '</div>';
        list.appendChild(card);
      });
    } catch (e) {
      list.innerHTML = '<p class="empty-state">Erro ao carregar novidades.</p>';
    }
  };
  xhr.onerror = function () {
    list.innerHTML = '<p class="empty-state">Sem conexão para carregar novidades.</p>';
  };
  xhr.send();
}

function renderSettings() {
  var summaryEl = document.getElementById("changelogSummary");
  if (summaryEl && !summaryEl.dataset.loaded) {
    summaryEl.dataset.loaded = "1";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/changelog.json");
    xhr.onload = function () {
      if (xhr.status !== 200) return;
      try {
        var entries = JSON.parse(xhr.responseText);
        if (entries.length) {
          var latest = entries[0];
          var dateObj = new Date(latest.date + "T12:00:00");
          var dateStr = dateObj.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
          summaryEl.innerHTML =
            '<span class="font-semibold">v' + (latest.version || "") + '</span> &middot; ' + dateStr + ' &middot; ' +
            latest.changes.map(function (c) { return c.text; }).join(", ") + '.';
        }
      } catch (e) {}
    };
    xhr.send();
  }

  el.themeToggle.checked = document.documentElement.dataset.mode === "dark";
  if (el.editorModeInput) {
    el.editorModeInput.value = editorMode();
  }
  const space = activeSpace();
  if (el.shareSpaceCard) {
    el.shareSpaceCard.hidden = !isSharedSpace(space);
  }
  if (el.currentSpaceNameInput) {
    el.currentSpaceNameInput.value = space.name;
  }
  if (el.inviteCodeInput) {
    el.inviteCodeInput.value = space.inviteCode || "";
  }

  var accountLabel = document.getElementById("accountStatusLabel");
  var accountButton = document.getElementById("accountActionButton");
  if (accountLabel && accountButton) {
    if (FeiraAuth.isAuthenticated()) {
      var email = FeiraAuth.getSession()?.user?.email || "conectado";
      accountLabel.textContent = email;
      accountButton.textContent = "Sair";
    } else if (FeiraAuth.getSession()) {
      accountLabel.textContent = "Modo anônimo";
      accountButton.textContent = "Entrar";
    } else {
      accountLabel.textContent = "Modo local";
      accountButton.textContent = "Entrar";
    }
  }
}

function renderIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function render() {
  renderFinancialState();
  renderItems();
  renderMeals();
  renderNavigation();
  renderSettings();
  renderSpaces();
  renderQuickNote();
  renderIcons();
}

function setView(viewId) {
  if (state.activeView === viewId) {
    closeListMenu();
    return;
  }

  const currentIndex = VIEW_ORDER.indexOf(state.activeView);
  const nextIndex = VIEW_ORDER.indexOf(viewId);
  document.documentElement.dataset.navDirection = nextIndex > currentIndex ? "forward" : "back";
  state.activeView = viewId;
  renderNavigation();
  closeListMenu();

  if (viewId !== "loginView" && VIEW_TO_PATH[viewId] && window.FeiraRouter) {
    var currentPath = window.location.pathname;
    if (currentPath !== VIEW_TO_PATH[viewId]) {
      history.replaceState(null, "", VIEW_TO_PATH[viewId]);
    }
  }
}

function toggleSpaceMenu() {
  console.log("[SPACE MENU] toggleSpaceMenu called");
  if (!el.spaceMenu) {
    console.error("[SPACE MENU] spaceMenu element not found!");
    return;
  }
  renderSpaces(); // Garante que o menu esteja populado antes de mostrar
  console.log("[SPACE MENU] Opening modal");
  el.spaceMenu.showModal();
}

function closeSpaceMenu() {
  console.log("[SPACE MENU] closeSpaceMenu called");
  if (!el.spaceMenu) {
    console.error("[SPACE MENU] spaceMenu element not found!");
    return;
  }
  el.spaceMenu.close();
  console.log("[SPACE MENU] Modal closed");
}

async function switchSpace(spaceId) {
  // if (spaceId === state.activeSpaceId) {
  //   closeSpaceMenu();
  //   return;
  // }
  state.activeSpaceId = spaceId;
  localStorage.setItem(ACTIVE_SPACE_STORAGE_KEY, spaceId);
  state.editingItemId = null;
  state.editingPurchaseId = null;
  state.inlineItemEditor = null;
  state.inlinePurchaseEditor = null;
  state.pendingItemCategoryId = "";
  state.collapsedCategoryIds.clear();
  state.manuallyToggledCategoryIds.clear();
  closeSpaceMenu();
  await reloadAndRender();
  await pullSpaceRecords();
  subscribeToSpace();
  syncNow();
}

function supabaseConfigured() {
  return Boolean(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey && window.supabase);
}

async function ensureSupabase() {
  if (state.supabase) return state.supabase;
  if (!supabaseConfigured()) {
    showToast("Configure o Supabase para usar espaços compartilhados.");
    return null;
  }

  state.supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  var session = FeiraAuth.getSession();
  if (!session) {
    showToast("Não foi possível conectar ao compartilhamento.");
    return null;
  }
  return state.supabase;
}

async function createSharedSpace(event) {
  event.preventDefault();
  const name = el.createSpaceNameInput.value.trim() || "Novo espaço";
  const client = await ensureSupabase();
  if (!client) return;

  const { data, error } = await client.rpc("create_space", { space_name: name });
  if (error) {
    console.info("Erro ao criar espaço.", error);
    showToast("Não foi possível criar o espaço.");
    return;
  }

  const space = Array.isArray(data) ? data[0] : data;
  await putOne("spaces", {
    id: space.id,
    name: space.name || name,
    type: "shared",
    inviteCode: space.invite_code || space.inviteCode || "",
    createdAt: Date.now(),
  });
  el.createSpaceForm.reset();
  await switchSpace(space.id);
  showToast("Espaço criado.");
}

async function joinSharedSpace(event) {
  event.preventDefault();
  const code = el.joinSpaceCodeInput.value.trim().toUpperCase();
  if (!code) {
    showToast("Informe o código do espaço.");
    return;
  }
  const client = await ensureSupabase();
  if (!client) return;

  const { data, error } = await client.rpc("join_space", { invite_code_input: code });
  if (error) {
    console.info("Erro ao entrar no espaço.", error);
    showToast("Código inválido ou indisponível.");
    return;
  }

  const space = Array.isArray(data) ? data[0] : data;
  await putOne("spaces", {
    id: space.id,
    name: space.name || "Espaço compartilhado",
    type: "shared",
    inviteCode: space.invite_code || space.inviteCode || code,
    createdAt: Date.now(),
  });
  el.joinSpaceForm.reset();
  await switchSpace(space.id);
  showToast("Espaço adicionado.");
}

async function renameCurrentSpace() {
  const space = activeSpace();
  if (!isSharedSpace(space)) return;
  const name = el.currentSpaceNameInput.value.trim();
  if (!name) {
    showToast("Informe o nome do espaço.");
    return;
  }
  await putOne("spaces", { ...space, name });
  const client = await ensureSupabase();
  if (client) {
    const { error } = await client.from("spaces").update({ name }).eq("id", space.id);
    if (error) {
      console.info("Erro ao renomear espaço na nuvem.", error);
    }
  }
  await reloadAndRender();
  showToast("Espaço atualizado.");
}

async function copyInviteCode() {
  const code = el.inviteCodeInput.value.trim();
  if (!code) return;
  try {
    await navigator.clipboard.writeText(code);
    showToast("Código copiado.");
  } catch (error) {
    el.inviteCodeInput.select();
    showToast("Selecione e copie o código.");
  }
}

function entityRecordId(entityType, entityId, spaceId = state.activeSpaceId) {
  if (entityType === "settings") return activeSettingsId(spaceId);
  return entityId;
}

function fromRemoteRecord(record) {
  const storeName = ENTITY_TO_STORE[record.entity_type];
  if (!storeName) return null;
  const id = entityRecordId(record.entity_type, record.entity_id, record.space_id);
  const value = {
    ...(record.data || {}),
    id,
    spaceId: record.space_id,
  };
  return {
    storeName,
    value: normalizeStoreRecord(storeName, value, record.space_id),
  };
}

async function pullSpaceRecords() {
  const space = activeSpace();
  if (!isSharedSpace(space)) return;
  const client = await ensureSupabase();
  if (!client) return;

  const { data, error } = await client.from("space_records").select("*").eq("space_id", space.id);
  if (error) {
    console.info("Erro ao buscar registros do espaço.", error);
    state.syncStatus = "offline";
    renderSpaces();
    return;
  }

  await Promise.all((data || []).map((record) => applyRemoteRecord(record)));
  await reloadAndRender();
}

async function applyRemoteRecord(record) {
  const mapped = fromRemoteRecord(record);
  if (!mapped) return;
  const metaId = syncMetaId(record.space_id, record.entity_type, record.entity_id);
  const pendingOperations = (await getAll("syncOutbox")).filter((operation) => operation.spaceId === record.space_id && operation.entityType === record.entity_type && operation.entityId === record.entity_id);
  const current = await getOne(mapped.storeName, mapped.value.id);
  if (shouldCreateSyncConflict(mapped.storeName, current, mapped.value, pendingOperations, record.space_id)) {
    await createConflict(record, mapped.value);
    return;
  }
  await Promise.all(
    pendingOperations
      .filter((operation) => operation.action !== "delete" && syncPayloadEquivalent(mapped.storeName, operation.data, mapped.value, record.space_id))
      .map((operation) => deleteOne("syncOutbox", operation.id)),
  );

  if (record.deleted_at) {
    await deleteOne(mapped.storeName, mapped.value.id);
  } else {
    if (mapped.storeName === "settings") {
      await putOne("settings", normalizeSettings({ ...(current || {}), ...mapped.value }, record.space_id));
    } else {
      await putOne(mapped.storeName, normalizeStoreRecord(mapped.storeName, mapped.value, record.space_id));
    }
  }
  await putOne("syncMeta", {
    id: metaId,
    spaceId: record.space_id,
    entityType: record.entity_type,
    entityId: record.entity_id,
    version: record.version || 0,
    updatedAt: Date.now(),
  });
}

async function createConflict(remoteRecord, remoteValue) {
  const storeName = ENTITY_TO_STORE[remoteRecord.entity_type];
  if (!storeName) return;
  const recordId = remoteValue?.id || entityRecordId(remoteRecord.entity_type, remoteRecord.entity_id, remoteRecord.space_id);
  const current = await getOne(storeName, recordId);
  await putOne("syncConflicts", {
    id: syncMetaId(remoteRecord.space_id, remoteRecord.entity_type, remoteRecord.entity_id),
    spaceId: remoteRecord.space_id,
    entityType: remoteRecord.entity_type,
    entityId: remoteRecord.entity_id,
    local: current || null,
    remote: remoteValue,
    remoteVersion: remoteRecord.version || 0,
    createdAt: Date.now(),
  });
}

async function syncNow() {
  const space = activeSpace();
  if (!isSharedSpace(space) || syncNow.running) return;
  const client = await ensureSupabase();
  if (!client) return;

  syncNow.running = true;
  state.syncStatus = "syncing";
  renderSpaces();
  try {
    let failed = false;
    const operations = (await getAll("syncOutbox")).filter((operation) => operation.spaceId === space.id).sort((a, b) => a.createdAt - b.createdAt);
    for (const operation of operations) {
      const { data, error } = await client.rpc("apply_space_change", {
        target_space_id: operation.spaceId,
        target_entity_type: operation.entityType,
        target_entity_id: operation.entityId,
        change_data: operation.data,
        base_version: operation.baseVersion,
        is_deleted: operation.action === "delete",
      });
      if (error) {
        console.info("Erro ao sincronizar operação.", error);
        showToast(syncErrorMessage(error, operation));
        state.syncStatus = navigator.onLine ? "offline" : "offline";
        failed = true;
        break;
      }

      const result = Array.isArray(data) ? data[0] : data;
      if (result?.status === "conflict") {
        const remoteRecord = result.remote_record || result.record;
        if (remoteRecord) {
          const mapped = fromRemoteRecord(remoteRecord);
          const current = mapped ? await getOne(mapped.storeName, mapped.value.id) : null;
          if (mapped && !shouldCreateSyncConflict(mapped.storeName, current, mapped.value, [operation], operation.spaceId)) {
            await putOne("syncMeta", {
              id: syncMetaId(operation.spaceId, operation.entityType, operation.entityId),
              spaceId: operation.spaceId,
              entityType: operation.entityType,
              entityId: operation.entityId,
              version: remoteRecord.version || operation.baseVersion,
              updatedAt: Date.now(),
            });
          } else {
            await createConflict(remoteRecord, mapped?.value || null);
          }
        }
        await deleteOne("syncOutbox", operation.id);
        continue;
      }

      await putOne("syncMeta", {
        id: syncMetaId(operation.spaceId, operation.entityType, operation.entityId),
        spaceId: operation.spaceId,
        entityType: operation.entityType,
        entityId: operation.entityId,
        version: result?.version || operation.baseVersion + 1,
        updatedAt: Date.now(),
      });
      await deleteOne("syncOutbox", operation.id);
    }
    if (!failed) {
      state.syncStatus = "synced";
    }
  } finally {
    syncNow.running = false;
    await loadState();
    renderSpaces();
  }
}

function subscribeToSpace() {
  if (state.syncChannel) {
    state.supabase?.removeChannel(state.syncChannel);
    state.syncChannel = null;
  }
  const space = activeSpace();
  if (!state.supabase || !isSharedSpace(space)) return;

  state.syncChannel = state.supabase
    .channel(`space-records-${space.id}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "space_records",
        filter: `space_id=eq.${space.id}`,
      },
      async (payload) => {
        const record = payload.new || payload.old;
        if (!record) return;
        await applyRemoteRecord(record);
        await reloadAndRender();
      },
    )
    .subscribe();
}

function renderConflicts() {
  if (!el.conflictList) return;
  el.conflictList.innerHTML = "";
  if (!state.syncConflicts.length) {
    el.conflictList.innerHTML = `<p class="empty-state is-visible">Nenhum conflito pendente.</p>`;
    return;
  }

  state.syncConflicts.forEach((conflict) => {
    const card = document.createElement("article");
    card.className = "card bg-base-100 border border-base-300 conflict-card";
    card.innerHTML = `
      <div class="card-body">
        <h3 class="card-title">${escapeHtml(conflict.entityType)} ${escapeHtml(conflict.entityId)}</h3>
        <div class="conflict-versions">
          <div class="bg-base-200 rounded-box border border-base-300 p-3">
            <span class="text-base-content/60 text-sm font-bold">Local</span>
            <pre>${escapeHtml(JSON.stringify(conflict.local, null, 2))}</pre>
          </div>
          <div class="bg-base-200 rounded-box border border-base-300 p-3">
            <span class="text-base-content/60 text-sm font-bold">Nuvem</span>
            <pre>${escapeHtml(JSON.stringify(conflict.remote, null, 2))}</pre>
          </div>
        </div>
        <div class="card-actions conflict-actions">
          <button class="btn btn-soft" type="button" data-resolution="cloud">Usar nuvem</button>
          <button class="btn btn-primary" type="button" data-resolution="local">Usar local</button>
        </div>
      </div>
    `;
    card.querySelector("[data-resolution='cloud']").addEventListener("click", () => resolveConflict(conflict.id, "cloud"));
    card.querySelector("[data-resolution='local']").addEventListener("click", () => resolveConflict(conflict.id, "local"));
    el.conflictList.append(card);
  });
}

function openConflictDialog() {
  renderConflicts();
  if (typeof el.conflictDialog.showModal === "function") {
    el.conflictDialog.showModal();
  } else {
    el.conflictDialog.setAttribute("open", "");
  }
}

function closeConflictDialog() {
  if (typeof el.conflictDialog.close === "function") {
    el.conflictDialog.close();
  } else {
    el.conflictDialog.removeAttribute("open");
  }
}

async function resolveConflict(conflictId, resolution) {
  const conflict = await getOne("syncConflicts", conflictId);
  if (!conflict) return;
  const storeName = ENTITY_TO_STORE[conflict.entityType];
  if (!storeName) return;

  if (resolution === "cloud") {
    if (conflict.remote) {
      if (storeName === "settings") {
        const currentSettings = await getOne("settings", conflict.remote.id);
        await putOne("settings", normalizeSettings({ ...(currentSettings || {}), ...conflict.remote }, conflict.spaceId));
      } else {
        await putOne(storeName, normalizeStoreRecord(storeName, conflict.remote, conflict.spaceId));
      }
    } else {
      await deleteOne(storeName, entityRecordId(conflict.entityType, conflict.entityId, conflict.spaceId));
    }
    await putOne("syncMeta", {
      id: conflict.id,
      spaceId: conflict.spaceId,
      entityType: conflict.entityType,
      entityId: conflict.entityId,
      version: conflict.remoteVersion,
      updatedAt: Date.now(),
    });
  } else if (conflict.local) {
    await putOne("syncMeta", {
      id: conflict.id,
      spaceId: conflict.spaceId,
      entityType: conflict.entityType,
      entityId: conflict.entityId,
      version: conflict.remoteVersion,
      updatedAt: Date.now(),
    });
    await enqueueSync(storeName, conflict.local);
  }

  await deleteOne("syncConflicts", conflict.id);
  await reloadAndRender();
  renderConflicts();
  syncNow();
  showToast("Conflito resolvido.");
}

function cloneTestValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertSyncTest(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function applySandboxConflictResolution(sandbox, conflictId, resolution) {
  const next = cloneTestValue(sandbox);
  const conflict = next.conflicts.find((current) => current.id === conflictId);
  if (!conflict) throw new Error("Conflito de teste não encontrado.");
  const storeName = ENTITY_TO_STORE[conflict.entityType];
  if (!storeName) throw new Error("Tipo de entidade inválido.");
  const storeRecords = next.stores[storeName] || {};
  const recordId = conflict.remote?.id || conflict.local?.id || entityRecordId(conflict.entityType, conflict.entityId, conflict.spaceId);

  if (resolution === "cloud") {
    if (conflict.remote) {
      storeRecords[recordId] = normalizeStoreRecord(storeName, conflict.remote, conflict.spaceId);
    } else {
      delete storeRecords[recordId];
    }
    next.outbox = next.outbox.filter((operation) => !(operation.spaceId === conflict.spaceId && operation.entityType === conflict.entityType && operation.entityId === conflict.entityId));
  } else if (resolution === "local" && conflict.local) {
    const localRecord = normalizeStoreRecord(storeName, conflict.local, conflict.spaceId);
    storeRecords[recordId] = localRecord;
    next.outbox.push({
      id: `test:${conflict.id}`,
      spaceId: conflict.spaceId,
      entityType: conflict.entityType,
      entityId: conflict.entityId,
      action: "upsert",
      data: publicRecordData(storeName, localRecord),
      baseVersion: conflict.remoteVersion,
      createdAt: Date.now(),
    });
  }

  next.stores[storeName] = storeRecords;
  next.meta[conflict.id] = {
    id: conflict.id,
    spaceId: conflict.spaceId,
    entityType: conflict.entityType,
    entityId: conflict.entityId,
    version: conflict.remoteVersion,
  };
  next.conflicts = next.conflicts.filter((current) => current.id !== conflictId);
  return next;
}

const syncDiagnosticTests = [
  {
    name: "Ignora falso conflito com dados equivalentes",
    run() {
      const local = { id: "item-1", spaceId: "space-1", name: "Arroz", quantity: "1 kg", checked: true, createdAt: 10 };
      const remote = { ...local, spaceId: "space-1" };
      const pending = [{ action: "upsert", data: publicRecordData("items", local), createdAt: 1 }];
      assertSyncTest(!shouldCreateSyncConflict("items", local, remote, pending, "space-1"), "Dados equivalentes foram tratados como conflito.");
    },
  },
  {
    name: "Detecta conflito quando dados divergem",
    run() {
      const local = { id: "item-1", spaceId: "space-1", name: "Arroz", quantity: "1 kg", checked: true, createdAt: 10 };
      const remote = { ...local, checked: false };
      const pending = [{ action: "upsert", data: publicRecordData("items", local), createdAt: 1 }];
      assertSyncTest(shouldCreateSyncConflict("items", local, remote, pending, "space-1"), "Divergência real não gerou conflito.");
    },
  },
  {
    name: "Resolver usando nuvem limpa conflito e outbox",
    run() {
      const conflict = {
        id: "space-1:item:item-1",
        spaceId: "space-1",
        entityType: "item",
        entityId: "item-1",
        local: { id: "item-1", spaceId: "space-1", name: "Arroz", quantity: "1 kg", checked: true, createdAt: 10 },
        remote: { id: "item-1", spaceId: "space-1", name: "Arroz", quantity: "1 kg", checked: false, createdAt: 10 },
        remoteVersion: 4,
      };
      const sandbox = {
        stores: { items: { "item-1": conflict.local } },
        outbox: [{ id: "op-1", spaceId: "space-1", entityType: "item", entityId: "item-1", action: "upsert", data: publicRecordData("items", conflict.local), createdAt: 1 }],
        conflicts: [conflict],
        meta: {},
      };
      const result = applySandboxConflictResolution(sandbox, conflict.id, "cloud");
      assertSyncTest(result.conflicts.length === 0, "Conflito não foi removido.");
      assertSyncTest(result.outbox.length === 0, "Outbox equivalente não foi limpa.");
      assertSyncTest(result.stores.items["item-1"].checked === false, "Valor da nuvem não foi aplicado.");
      assertSyncTest(result.meta[conflict.id].version === 4, "Meta não recebeu versão remota.");
    },
  },
  {
    name: "Resolver usando local cria envio coerente",
    run() {
      const conflict = {
        id: "space-1:item:item-1",
        spaceId: "space-1",
        entityType: "item",
        entityId: "item-1",
        local: { id: "item-1", spaceId: "space-1", name: "Arroz", quantity: "1 kg", checked: true, createdAt: 10 },
        remote: { id: "item-1", spaceId: "space-1", name: "Arroz", quantity: "1 kg", checked: false, createdAt: 10 },
        remoteVersion: 7,
      };
      const result = applySandboxConflictResolution({ stores: { items: {} }, outbox: [], conflicts: [conflict], meta: {} }, conflict.id, "local");
      assertSyncTest(result.conflicts.length === 0, "Conflito local não foi removido.");
      assertSyncTest(result.outbox.length === 1, "Resolução local não criou envio.");
      assertSyncTest(result.outbox[0].baseVersion === 7, "Envio local não usa a versão remota como base.");
      assertSyncTest(result.outbox[0].data.checked === true, "Payload local perdeu o checked.");
    },
  },
  {
    name: "Status não fica sincronizando sem pendências",
    run() {
      const status = deriveSyncStatus({ isShared: true, isRunning: false, outbox: [], conflicts: [], failed: false });
      assertSyncTest(status === "synced", `Status esperado sincronizado, recebido ${status}.`);
    },
  },
  {
    name: "checked participa do payload sincronizado",
    run() {
      const checkedPayload = publicRecordData("items", normalizeStoreRecord("items", { id: "item-1", spaceId: "space-1", name: "Arroz", checked: true, createdAt: 1 }, "space-1"));
      const uncheckedPayload = publicRecordData("items", normalizeStoreRecord("items", { id: "item-1", spaceId: "space-1", name: "Arroz", checked: false, createdAt: 1 }, "space-1"));
      assertSyncTest(checkedPayload.checked === true, "Payload não inclui checked=true.");
      assertSyncTest(JSON.stringify(sortObjectKeys(checkedPayload)) !== JSON.stringify(sortObjectKeys(uncheckedPayload)), "checked não altera a assinatura sincronizável.");
    },
  },
  {
    name: "Campos internos não geram divergência",
    run() {
      const local = { id: "local-id", spaceId: "space-1", name: "Café", quantity: "", checked: false, createdAt: 5 };
      const remote = { id: "remote-id", spaceId: "space-2", name: "Café", quantity: "", checked: false, createdAt: 5 };
      assertSyncTest(syncRecordsEquivalent("items", local, remote, "space-1"), "id ou spaceId interferiram na comparação pública.");
    },
  },
];

function renderSyncTestRows(results = []) {
  if (!el.syncTestList) return;
  el.syncTestList.innerHTML = "";
  results.forEach((result) => {
    const row = document.createElement("div");
    row.className = `alert sync-test-row is-${result.status}`;
    row.innerHTML = `
      <span>${escapeHtml(result.name)}</span>
      <strong>${escapeHtml(result.label)}</strong>
      ${result.error ? `<small>${escapeHtml(result.error)}</small>` : ""}
    `;
    el.syncTestList.append(row);
  });
}

function renderSyncTestSummary(results = []) {
  if (!el.syncTestSummary) return;
  const passed = results.filter((result) => result.status === "passed").length;
  const failed = results.filter((result) => result.status === "failed").length;
  const running = results.filter((result) => result.status === "running").length;
  el.syncTestSummary.textContent = `${passed}/${results.length} passaram${failed ? `, ${failed} falharam` : ""}${running ? ", rodando..." : ""}.`;
}

function waitForNextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

async function runSyncDiagnostics() {
  if (!el.syncTestList || !el.syncTestSummary || !el.runSyncTestsButton) return;
  el.runSyncTestsButton.disabled = true;
  const results = syncDiagnosticTests.map((test) => ({ name: test.name, status: "pending", label: "Aguardando" }));
  renderSyncTestRows(results);
  renderSyncTestSummary(results);

  for (let index = 0; index < syncDiagnosticTests.length; index += 1) {
    results[index] = { ...results[index], status: "running", label: "Rodando" };
    renderSyncTestRows(results);
    renderSyncTestSummary(results);
    await waitForNextFrame();
    try {
      await syncDiagnosticTests[index].run();
      results[index] = { ...results[index], status: "passed", label: "Passou" };
    } catch (error) {
      results[index] = { ...results[index], status: "failed", label: "Falhou", error: error?.message || "Erro inesperado." };
    }
    renderSyncTestRows(results);
    renderSyncTestSummary(results);
    await waitForNextFrame();
  }

  el.runSyncTestsButton.disabled = false;
  showToast(results.some((result) => result.status === "failed") ? "Testes de sincronização falharam." : "Testes de sincronização passaram.");
}



function addMealItemEditorRow(item = {}) {
  if (!el.mealItemsEditor) return;
  el.mealItemsEditor.append(createMealItemEditorRow(item));
  renderIcons();
}

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

async function startPurchaseSession() {
  if (activePurchaseSession()) {
    showToast("Já existe uma compra em andamento.");
    return;
  }
  const now = Date.now();
  await saveRecord("purchaseSessions", {
    id: createId(),
    status: "active",
    startedAt: now,
    updatedAt: now,
    checkedItems: [],
  });
  await reloadAndRender();
  showToast("Compra iniciada.");
}

async function cancelPurchaseSession() {
  const session = activePurchaseSession();
  if (!session) return;
  const confirmed = window.confirm("Cancelar esta compra? Os itens marcados nela serão desmarcados.");
  if (!confirmed) return;

  const sessionItemIds = new Set((session.checkedItems || []).map((item) => item.itemId));
  const markedSessionItems = state.items.filter((item) => sessionItemIds.has(item.id) && item.checked);
  await Promise.all(markedSessionItems.map((item) => saveRecord("items", { ...item, checked: false })));
  await saveRecord("purchaseSessions", {
    ...session,
    status: "cancelled",
    completedAt: Date.now(),
    updatedAt: Date.now(),
  });
  await reloadAndRender();
  showToast("Compra cancelada.");
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

async function saveBudget(event) {
  event.preventDefault();
  const monthlyBudget = parseCurrency(el.budgetInput?.value || "");
  const cardClosingDayRaw = (el.cardClosingDayInput?.value || "").trim();
  const cardClosingDay = cardClosingDayRaw ? Number.parseInt(cardClosingDayRaw, 10) : "";

  if (!Number.isFinite(monthlyBudget) || monthlyBudget < 0) {
    showToast("Informe um orçamento mensal válido.");
    return;
  }

  if (cardClosingDay !== "" && (!Number.isInteger(cardClosingDay) || cardClosingDay < 1 || cardClosingDay > 31)) {
    showToast("Informe um dia de fechamento entre 1 e 31.");
    return;
  }

  await saveRecord("settings", {
    ...state.settings,
    monthlyBudget,
    cardClosingDay,
  });

  await reloadAndRender();
  showToast("Orçamento atualizado.");
}

async function saveProfile(event) {
  event.preventDefault();
  const userName = (el.userNameInput?.value || "").trim();
  const userGender = el.userGenderInput?.value || "neutral";

  await saveRecord("settings", {
    ...state.settings,
    userName,
    userGender,
  });

  saveLocalProfile(userName, userGender);
  await reloadAndRender();
  showToast("Perfil atualizado.");
}

function changeEditorMode(event) {
  const editorMode = event.currentTarget.value === "inline" ? "inline" : "modal";
  localStorage.setItem(EDITOR_MODE_STORAGE_KEY, editorMode);
  saveRecord("settings", { ...state.settings, editorMode }).then(() => reloadAndRender());
}

async function resetDatabase() {
  const confirmed = window.confirm("Tem certeza? Isso vai apagar os dados deste espaço.");
  if (!confirmed) return;

  const stores = ["items", "categories", "purchases", "purchaseSessions", "meals", "settings"];
  for (const storeName of stores) {
    const records = await getAll(storeName);
    for (const record of records) {
      const belongsToActiveSpace = storeName === "settings"
        ? record.id === activeSettingsId()
        : (record.spaceId || LOCAL_SPACE_ID) === state.activeSpaceId;
      if (belongsToActiveSpace) {
        await deleteOne(storeName, record.id);
      }
    }
  }
  await seedLocalDataIfNeeded();
  await reloadAndRender();
  showToast("Dados redefinidos.");
}

function editorMode() {
  return state.settings.editorMode === "inline" ? "inline" : "modal";
}

function changeEditorMode(event) {
  const editorMode = event.currentTarget.value === "inline" ? "inline" : "modal";
  localStorage.setItem(EDITOR_MODE_STORAGE_KEY, editorMode);
  saveRecord("settings", { ...state.settings, editorMode }).then(() => reloadAndRender());
}

function handleFabButton() {
  if (state.activeView === "listView") {
    openItemEditor();
    return;
  }
  if (state.activeView === "purchaseView") {
    openPurchaseEditor();
    return;
  }
  if (state.activeView === "mealsView") {
    openMealEditor();
    return;
  }
}

function toggleListMenu() {
  if (!el.listMenu) return;
  var wrap = el.listMenu.closest(".dropdown");
  if (!wrap) return;
  var isOpen = wrap.classList.contains("dropdown-open");
  wrap.classList.toggle("dropdown-open");
  el.listMenu.hidden = isOpen;
  el.listMenuButton.setAttribute("aria-expanded", String(!isOpen));
}

function closeListMenu() {
  if (!el.listMenu) return;
  var wrap = el.listMenu.closest(".dropdown");
  if (wrap) wrap.classList.remove("dropdown-open");
  el.listMenu.hidden = true;
  el.listMenuButton.setAttribute("aria-expanded", "false");
}

function openPurchaseEditor(id = null) {
  if (editorMode() !== "inline") {
    openCheckout(id);
    return;
  }

  if (state.activeView !== "purchaseView") {
    setView("purchaseView");
  }
  state.inlineItemEditor = null;
  state.inlinePurchaseEditor = { id };
  renderFinancialState();
  renderIcons();
  focusInlineEditor();
}

function openActivePurchaseCheckout() {
  const session = activePurchaseSession();
  if (!session) {
    showToast("Comece uma compra primeiro.");
    return;
  }
  if (!checkedItemsForSession(session).length) {
    showToast("Marque pelo menos um item nesta compra.");
    return;
  }
  openCheckout(null, { mode: "session", sessionId: session.id });
}

function renderPurchaseReceipt(purchase = null) {
  if (!el.purchaseReceipt || !el.purchaseReceiptList || !el.purchaseReceiptCount) return;
  const items = Array.isArray(purchase?.items) ? purchase.items : [];
  el.purchaseReceipt.hidden = items.length === 0;
  el.purchaseReceiptList.innerHTML = "";
  el.purchaseReceiptCount.textContent = `${items.length} ${items.length === 1 ? "item" : "itens"}`;
  items.forEach((item) => {
    const row = document.createElement("li");
    row.className = "receipt-item";
    const quantity = item.quantity ? `<span>${escapeHtml(item.quantity)}</span>` : "";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        ${quantity}
      </div>
      <small>${escapeHtml(item.categoryName || "Sem seção")}</small>
    `;
    el.purchaseReceiptList.append(row);
  });
}

function closeInlinePurchaseEditor() {
  state.inlinePurchaseEditor = null;
  renderFinancialState();
  renderIcons();
}

async function saveInlinePurchase(event, id = null) {
  event.preventDefault();
  const form = event.currentTarget;
  const name = form.elements.name.value.trim();
  const date = parseDateInput(form.elements.date.value);
  const total = parseCurrency(form.elements.total.value);
  if (!Number.isFinite(date)) {
    showToast("Informe a data da compra.");
    return;
  }
  if (!Number.isFinite(total) || total <= 0) {
    showToast("Informe o total da compra.");
    return;
  }

  const purchase = state.purchases.find((current) => current.id === id);
  if (purchase) {
    await saveRecord("purchases", { ...purchase, name, date, total });
  } else {
    await saveRecord("purchases", {
      id: createId(),
      name,
      total,
      date,
    });

    await Promise.all(state.items.map((item) => saveRecord("items", { ...item, checked: false })));
  }

  state.inlinePurchaseEditor = null;
  await reloadAndRender();
  setView("purchaseView");
  showToast(purchase ? "Compra atualizada." : "Compra registrada.");
}

function openCheckout(id = null, options = {}) {
  state.inlinePurchaseEditor = null;
  state.finishingPurchaseSessionId = options.mode === "session" ? options.sessionId : null;
  state.editingPurchaseId = id;
  const purchase = state.purchases.find((current) => current.id === id);
  const isSessionCheckout = Boolean(state.finishingPurchaseSessionId);

  el.checkoutDialogTitle.textContent = isSessionCheckout ? "Finalizar compra" : (purchase ? "Editar compra" : "Registrar compra");
  el.savePurchaseButton.textContent = purchase ? "Salvar" : "Salvar";
  el.deletePurchaseButton.hidden = !purchase;
  el.purchaseName.value = purchase?.name || (isSessionCheckout ? "Compra do mercado" : "");
  el.purchaseDate.value = formatDateInput(purchase?.date || Date.now());
  el.purchaseTotal.value = purchase ? String(purchase.total).replace(".", ",") : "";
  renderPurchaseReceipt(purchase);
  if (typeof el.checkoutDialog.showModal === "function") {
    el.checkoutDialog.showModal();
  } else {
    el.checkoutDialog.setAttribute("open", "");
  }
  focusDialogInputForCreate(el.purchaseTotal, Boolean(purchase));
}

async function finishPurchase(event) {
  event.preventDefault();
  const name = el.purchaseName.value.trim();
  const date = parseDateInput(el.purchaseDate.value);
  const total = parseCurrency(el.purchaseTotal.value);
  if (!Number.isFinite(date)) {
    showToast("Informe a data da compra.");
    return;
  }
  if (!Number.isFinite(total) || total <= 0) {
    showToast("Informe o total da compra.");
    return;
  }

  const session = state.finishingPurchaseSessionId
    ? state.purchaseSessions.find((current) => current.id === state.finishingPurchaseSessionId && current.status === "active")
    : null;
  const snapshot = session ? checkedItemsSnapshot(session) : [];
  if (session && !snapshot.length) {
    showToast("Marque pelo menos um item nesta compra.");
    return;
  }

  const purchase = state.purchases.find((current) => current.id === state.editingPurchaseId);
  if (purchase) {
    await saveRecord("purchases", { ...purchase, name, date, total });
  } else if (session) {
    const completedAt = Date.now();
    await saveRecord("purchases", {
      id: createId(),
      name,
      total,
      date,
      createdAt: completedAt,
      startedAt: session.startedAt,
      completedAt,
      durationMs: completedAt - session.startedAt,
      items: snapshot,
    });
    await saveRecord("purchaseSessions", {
      ...session,
      status: "completed",
      completedAt,
      updatedAt: completedAt,
    });
  } else {
    await saveRecord("purchases", {
      id: createId(),
      name,
      total,
      date,
    });

    await Promise.all(state.items.map((item) => saveRecord("items", { ...item, checked: false })));
  }

  closeCheckout();
  await reloadAndRender();
  setView("purchaseView");
  showToast(purchase ? "Compra atualizada." : "Compra registrada.");
}

function closeCheckout() {
  state.editingPurchaseId = null;
  state.finishingPurchaseSessionId = null;
  el.deletePurchaseButton.hidden = true;
  renderPurchaseReceipt(null);
  if (typeof el.checkoutDialog.close === "function") {
    el.checkoutDialog.close();
  } else {
    el.checkoutDialog.removeAttribute("open");
  }
}

async function removePurchase(id) {
  if (!id) return;
  const confirmed = window.confirm("Excluir esta compra?");
  if (!confirmed) return;

  await deleteRecord("purchases", id);
  if (state.inlinePurchaseEditor?.id === id) {
    state.inlinePurchaseEditor = null;
  }
  closeCheckout();
  await reloadAndRender();
  showToast("Compra removida.");
}

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => el.toast.classList.remove("is-visible"), 2200);
}

function waitForControllerChange(timeout = 2500) {
  if (!("serviceWorker" in navigator)) return Promise.resolve(false);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (changed) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      resolve(changed);
    };
    const onControllerChange = () => finish(true);
    const timer = window.setTimeout(() => finish(false), timeout);

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
  });
}

function waitForWorkerState(worker, expectedStates = ["activated"], timeout = 2500) {
  if (!worker) return Promise.resolve(false);
  if (expectedStates.includes(worker.state)) return Promise.resolve(true);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (matched) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      worker.removeEventListener("statechange", onStateChange);
      resolve(matched);
    };
    const onStateChange = () => {
      if (expectedStates.includes(worker.state)) finish(true);
    };
    const timer = window.setTimeout(() => finish(false), timeout);

    worker.addEventListener("statechange", onStateChange);
  });
}

async function updateServiceWorkers() {
  if (!("serviceWorker" in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations.map(async (registration) => {
      const controllerChange = waitForControllerChange();
      await registration.update();

      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
        await controllerChange;
        return;
      }

      if (registration.installing) {
        await Promise.race([waitForWorkerState(registration.installing), controllerChange]);
      }
    }),
  );
}

async function refreshApp() {
  showToast("Atualizando app...");
  await reloadAndRender();

  try {
    await updateServiceWorkers();
  } catch (error) {
    console.info("Não foi possível atualizar o service worker antes do reload.", error);
  }

  window.setTimeout(() => window.location.reload(), 100);
}

function bindEvents() {
  el.navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      var path = VIEW_TO_PATH[button.dataset.view];
      if (path && window.FeiraRouter) {
        FeiraRouter.navigate(path);
      } else {
        setView(button.dataset.view);
      }
    });
  });
  el.itemForm.addEventListener("submit", saveItem);
  el.categoryForm?.addEventListener("submit", saveCategory);
  el.deleteItemButton?.addEventListener("click", () => removeItem(state.editingItemId));
  el.closeItemDialogButton.addEventListener("click", closeItemDialog);
  el.cancelItemDialogButton.addEventListener("click", closeItemDialog);
  el.closeCategoryDialogButton?.addEventListener("click", closeCategoryDialog);
  el.cancelCategoryDialogButton?.addEventListener("click", closeCategoryDialog);
  el.closeReorderCategoryDialogButton?.addEventListener("click", closeReorderCategoryDialog);
  el.confirmReorderCategoriesButton?.addEventListener("click", confirmReorderCategories);
  el.closeDeleteCategoryDialogButton?.addEventListener("click", closeDeleteCategoryDialog);
  el.cancelDeleteCategoryDialogButton?.addEventListener("click", closeDeleteCategoryDialog);
  el.confirmDeleteCategoryButton?.addEventListener("click", confirmDeleteCategory);
  el.budgetForm.addEventListener("submit", saveBudget);
  el.profileForm.addEventListener("submit", saveProfile);
  el.resetDatabaseButton.addEventListener("click", resetDatabase);
  el.manualRefreshButton?.addEventListener("click", refreshApp);
  el.runSyncTestsButton?.addEventListener("click", runSyncDiagnostics);
  el.topbarRefreshButton?.addEventListener("click", refreshApp);
  el.themeToggle.addEventListener("change", toggleTheme);
  el.editorModeInput?.addEventListener("change", changeEditorMode);
  el.createSpaceForm?.addEventListener("submit", createSharedSpace);
  el.joinSpaceForm?.addEventListener("submit", joinSharedSpace);
  el.renameSpaceButton?.addEventListener("click", renameCurrentSpace);
  el.copyInviteButton?.addEventListener("click", copyInviteCode);
  el.openConflictsButton?.addEventListener("click", openConflictDialog);
  el.closeConflictDialogButton?.addEventListener("click", closeConflictDialog);
  window.addEventListener("online", () => syncNow());
  el.quickAddButton.addEventListener("click", handleFabButton);
  el.startPurchaseSessionButton?.addEventListener("click", startPurchaseSession);
  el.finishPurchaseSessionButton?.addEventListener("click", openActivePurchaseCheckout);
  el.cancelPurchaseSessionButton?.addEventListener("click", cancelPurchaseSession);
  el.clearRecentItemsButton?.addEventListener("click", clearRecentItems);
  el.clearMarketListButton?.addEventListener("click", clearMarketList);
  el.listMenuButton?.addEventListener("click", toggleListMenu);
  el.spaceSwitcherButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    console.log("[SPACE MENU] Space switcher button clicked");
    toggleSpaceMenu();
  });
  if (el.openCategoryDialogButton) {
    el.openCategoryDialogButton.addEventListener("click", openCategoryDialog);
  } else {
    el.listMenu?.addEventListener("click", (event) => {
      if (event.target.closest("#openCategoryDialogButton")) {
        openCategoryDialog();
      }
    });
  }
  document.addEventListener("click", (event) => {
    var wrap = el.listMenu?.closest(".dropdown");
    if (!wrap || !wrap.classList.contains("dropdown-open")) return;
    if (event.target.closest(".list-menu-wrap")) return;
    closeListMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && el.spaceMenu && !el.spaceMenu.hidden) {
      closeSpaceMenu();
    }
  });
  el.checkoutForm.addEventListener("submit", finishPurchase);
  el.deletePurchaseButton?.addEventListener("click", () => removePurchase(state.editingPurchaseId));
  el.closeCheckoutButton.addEventListener("click", closeCheckout);
  el.cancelCheckoutButton.addEventListener("click", closeCheckout);
  el.refreshButton.addEventListener("click", () => openPurchaseEditor());
  el.createFirstMealButton?.addEventListener("click", () => openMealEditor());
  var accountButton = document.getElementById("accountActionButton");
  if (accountButton) {
    accountButton.addEventListener("click", function () {
      if (FeiraAuth.isAuthenticated()) {
        FeiraAuth.signOut();
        showToast("Você saiu da conta.");
        renderSettings();
      } else {
        FeiraRouter.navigate("/app/login");
      }
    });
  }

  FeiraAuth.onAuthStateChange(function () {
    renderSettings();
  });

  el.mealForm?.addEventListener("submit", saveMeal);
  el.addMealItemButton?.addEventListener("click", () => addMealItemEditorRow());
  el.deleteMealButton?.addEventListener("click", () => removeMeal(state.editingMealId));
  el.closeMealDialogButton?.addEventListener("click", closeMealDialog);
  el.cancelMealDialogButton?.addEventListener("click", closeMealDialog);

  bindLoginEvents();
}

function bindLoginEvents() {
  var loginEmailForm = document.getElementById("loginEmailForm");
  var loginRegisterForm = document.getElementById("loginRegisterForm");
  var loginSubmitButton = document.getElementById("loginSubmitButton");
  var loginMagicLinkButton = document.getElementById("loginMagicLinkButton");
  var registerSubmitButton = document.getElementById("registerSubmitButton");
  var loginGoogleButton = document.getElementById("loginGoogleButton");
  var loginAnonymousButton = document.getElementById("loginAnonymousButton");

  document.querySelectorAll("[data-login-tab]").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll("[data-login-tab]").forEach(function (t) { t.classList.remove("is-active"); });
      tab.classList.add("is-active");
      var isRegister = tab.dataset.loginTab === "register";
      if (loginEmailForm) loginEmailForm.hidden = isRegister;
      if (loginRegisterForm) loginRegisterForm.hidden = !isRegister;
    });
  });

  if (loginEmailForm) {
    loginEmailForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      var email = document.getElementById("loginEmail").value.trim();
      var password = document.getElementById("loginPassword").value;
      if (!email || !password) { showToast("Preencha email e senha."); return; }
      loginSubmitButton.disabled = true;
      loginSubmitButton.textContent = "Entrando...";
      var result = await FeiraAuth.signIn(email, password);
      loginSubmitButton.disabled = false;
      loginSubmitButton.textContent = "Entrar";
      if (result.error) {
        showToast(result.error.message || "Erro ao entrar.");
        return;
      }
      showToast("Bem-vindo de volta!");
      FeiraRouter.navigate("/app/lista");
    });
  }

  if (loginRegisterForm) {
    loginRegisterForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      var email = document.getElementById("registerEmail").value.trim();
      var password = document.getElementById("registerPassword").value;
      if (!email || !password) { showToast("Preencha email e senha."); return; }
      if (password.length < 6) { showToast("A senha deve ter pelo menos 6 caracteres."); return; }
      registerSubmitButton.disabled = true;
      registerSubmitButton.textContent = "Criando...";
      var result = await FeiraAuth.signUp(email, password);
      registerSubmitButton.disabled = false;
      registerSubmitButton.textContent = "Criar conta";
      if (result.error) {
        showToast(result.error.message || "Erro ao criar conta.");
        return;
      }
      if (result.data.session) {
        showToast("Conta criada!");
        FeiraRouter.navigate("/app/lista");
      } else {
        showToast("Verifique seu email para confirmar o cadastro.");
      }
    });
  }

  if (loginMagicLinkButton) {
    loginMagicLinkButton.addEventListener("click", async function () {
      var email = document.getElementById("loginEmail").value.trim();
      if (!email) { showToast("Informe seu email primeiro."); return; }
      loginMagicLinkButton.disabled = true;
      loginMagicLinkButton.textContent = "Enviando...";
      var result = await FeiraAuth.sendMagicLink(email);
      loginMagicLinkButton.disabled = false;
      loginMagicLinkButton.textContent = "Enviar link mágico";
      if (result.error) {
        showToast(result.error.message || "Erro ao enviar link.");
        return;
      }
      showToast("Link mágico enviado! Verifique seu email.");
    });
  }

  if (loginGoogleButton) {
    loginGoogleButton.addEventListener("click", async function () {
      var result = await FeiraAuth.signInWithGoogle();
      if (result.error) {
        showToast(result.error.message || "Erro ao entrar com Google.");
      }
    });
  }

  if (loginAnonymousButton) {
    loginAnonymousButton.addEventListener("click", async function () {
      await FeiraAuth.continueAsGuest();
      showToast("Usando modo local.");
      FeiraRouter.navigate("/app/lista");
    });
  }

  var noteEditor = document.getElementById("noteEditor");
  var noteTransferButton = document.getElementById("noteTransferButton");

  if (noteEditor) {
    var noteSaveTimer = null;
    noteEditor.addEventListener("input", function () {
      Array.from(noteEditor.children).forEach(function (child) {
        if (child.tagName === "DIV") {
          child.classList.toggle("note-line-checked", child.textContent.startsWith("- "));
        }
      });
      clearTimeout(noteSaveTimer);
      noteSaveTimer = setTimeout(function () {
        saveQuickNote(noteEditor.textContent);
        updateNoteTransferButton();
      }, 500);
    });
  }

  if (noteTransferButton) {
    noteTransferButton.addEventListener("click", transformNoteToItems);
  }
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (window.__FEIRA_DEV__) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
    return;
  }

  try {
    await navigator.serviceWorker.register("./sw.js");
  } catch (error) {
    console.info("Service worker indisponível neste contexto.", error);
  }
}

var VIEW_TO_PATH = {
  quickNoteView: "/app/nota",
  listView: "/app/lista",
  mealsView: "/app/refeicoes",
  purchaseView: "/app/compras",
  changelogView: "/app/changelog",
  settingsView: "/app/config",
};

var PATH_TO_VIEW = {
  "/app/nota": "quickNoteView",
  "/app/lista": "listView",
  "/app/refeicoes": "mealsView",
  "/app/compras": "purchaseView",
  "/app/changelog": "changelogView",
  "/app/config": "settingsView",
  "/app": "listView",
};

function setupRouter() {
  FeiraRouter.setGuard(function (path) {
    if (path === "/app/login") return true;
    if (path.startsWith("/app")) {
      var session = FeiraAuth.getSession();
      if (!session && !FeiraAuth.isGuestMode()) {
        FeiraRouter.navigate("/app/login?redirect=" + encodeURIComponent(path), true);
        return false;
      }
    }
    return true;
  });

  FeiraRouter.add("/app/login", function () {
    var loginView = document.getElementById("loginView");
    if (loginView) {
      setView("loginView");
    }
  });

  FeiraRouter.add("/app/nota", function () { setView("quickNoteView"); });
  FeiraRouter.add("/app/lista", function () { setView("listView"); showOnboarding(); });
  FeiraRouter.add("/app/refeicoes", function () { setView("mealsView"); });
  FeiraRouter.add("/app/compras", function () { setView("purchaseView"); });
  FeiraRouter.add("/app/changelog", function () { setView("changelogView"); renderChangelog(); });
  FeiraRouter.add("/app/config", function () { setView("settingsView"); });
  FeiraRouter.add("/app", function () { setView("listView"); });
  FeiraRouter.add("/app/", function () { setView("listView"); });

  FeiraRouter.start();
}

function loadQuickNote() {
  return localStorage.getItem(QUICK_NOTE_KEY) || "";
}

function saveQuickNote(text) {
  localStorage.setItem(QUICK_NOTE_KEY, text);
}

function updateNoteTransferButton() {
  var btn = document.getElementById("noteTransferButton");
  var editor = document.getElementById("noteEditor");
  if (!btn || !editor) return;
  var hasItems = editor.textContent.split("\n").some(function (line) {
    return line.trim().startsWith("- ");
  });
  btn.disabled = !hasItems;
}

function renderQuickNote() {
  var editor = document.getElementById("noteEditor");
  if (!editor) return;
  try { document.execCommand("defaultParagraphSeparator", false, "div"); } catch (_) {}
  var text = loadQuickNote();
  var lines = text.split("\n");
  editor.innerHTML = lines.map(function (line) {
    var esc = line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return '<div class="note-line' + (line.startsWith("- ") ? " note-line-checked" : "") + '">' + esc + '</div>';
  }).join("");
  updateNoteTransferButton();
}

async function transformNoteToItems() {
  var editor = document.getElementById("noteEditor");
  if (!editor) return;
  var lines = editor.textContent.split("\n");
  var itemLines = lines.filter(function (line) { return line.trim().startsWith("- "); });

  if (itemLines.length === 0) {
    showToast("Nenhum item encontrado. Use - na frente dos itens.");
    return;
  }

  var items = itemLines.map(function (line) {
    var content = line.substring(2).trim();
    var name = content;
    var quantity = "";
    var commaIdx = content.indexOf(",");
    if (commaIdx !== -1) {
      name = content.substring(0, commaIdx).trim();
      quantity = content.substring(commaIdx + 1).trim();
    }
    return { name: name, quantity: quantity };
  });

  for (var i = 0; i < items.length; i++) {
    await putOne("items", normalizeItem(items[i]));
  }

  await reloadAndRender();
  showToast(itemLines.length + " " + (itemLines.length === 1 ? "item adicionado" : "itens adicionados") + " à lista.");
  FeiraRouter.navigate("/app/lista");
}

var ONBOARDING_SEEN_KEY = "feira:onboarding-seen";

function showOnboarding() {
  if (localStorage.getItem(ONBOARDING_SEEN_KEY)) return;
  var dialog = document.getElementById("onboardingDialog");
  if (!dialog) return;
  var currentPage = 0;
  var totalPages = 3;

  function updatePage(index) {
    currentPage = index;
    document.querySelectorAll("[data-onboarding-page]").forEach(function (el) {
      el.classList.toggle("is-active", Number(el.dataset.onboardingPage) === index);
    });
    document.querySelectorAll("[data-dot]").forEach(function (dot) {
      dot.classList.toggle("is-active", Number(dot.dataset.dot) === index);
    });
    document.getElementById("onboardingPrevButton").disabled = index === 0;
    var nextBtn = document.getElementById("onboardingNextButton");
    if (index === totalPages - 1) {
      nextBtn.textContent = "Começar";
    } else {
      nextBtn.textContent = "Próximo";
    }
  }

  function close() {
    localStorage.setItem(ONBOARDING_SEEN_KEY, "true");
    dialog.close();
  }

  dialog.addEventListener("close", function () {
    localStorage.setItem(ONBOARDING_SEEN_KEY, "true");
  });

  document.getElementById("onboardingPrevButton").addEventListener("click", function () {
    if (currentPage > 0) updatePage(currentPage - 1);
  });

  document.getElementById("onboardingNextButton").addEventListener("click", function () {
    if (currentPage < totalPages - 1) {
      updatePage(currentPage + 1);
    } else {
      close();
    }
  });

  document.getElementById("onboardingSkipButton").addEventListener("click", close);

  updatePage(0);
  dialog.showModal();
}

async function init() {
  try {
    state.db = await openDatabase();
    await seedData();
    await loadState();

    await FeiraAuth.init();
    bindEvents();
    setupRouter();
    render();

    document.getElementById("loadingOverlay")?.classList.add("is-hidden");

    if (supabaseConfigured() && FeiraAuth.getSession()) {
      await ensureSupabase();
      await pullSpaceRecords();
      subscribeToSpace();
      syncNow();
    }
    registerServiceWorker();
  } catch (error) {
    console.error(error);
    document.getElementById("loadingOverlay")?.classList.add("is-hidden");
    showToast("Não foi possível iniciar o app.");
  }
}

window.addEventListener("load", () => {
  init();
});
