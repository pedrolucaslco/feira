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
