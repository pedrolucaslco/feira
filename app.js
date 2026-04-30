const DB_NAME = "feira-db";
const DB_VERSION = 2;
const SETTINGS_ID = "main";
const THEME_STORAGE_KEY = "feira:theme";
const ACCENT_STORAGE_KEY = "feira:accent";
const VALID_ACCENTS = ["emerald", "green", "sky", "blue", "purple", "fuchsia", "rose", "amber", "teal", "cyan"];
const VIEW_ORDER = ["dashboardView", "listView", "purchaseView", "settingsView"];
const DEFAULT_ITEMS = [
  { name: "Arroz", quantity: "1 pacote" },
  { name: "Feijão", quantity: "1 kg" },
  { name: "Leite", quantity: "2 un" },
  { name: "Café", quantity: "" },
];
const UNCATEGORIZED_ID = "uncategorized";

function preventIOSZoomGestures() {
  const preventDefault = (event) => event.preventDefault();

  ["gesturestart", "gesturechange", "gestureend"].forEach((eventName) => {
    document.addEventListener(eventName, preventDefault, { passive: false });
  });

  document.addEventListener("dblclick", preventDefault, { passive: false });
}

preventIOSZoomGestures();

function getInitialTheme() {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  updateThemeColor();
}

function getInitialAccent() {
  const storedAccent = localStorage.getItem(ACCENT_STORAGE_KEY);
  return VALID_ACCENTS.includes(storedAccent) ? storedAccent : "emerald";
}

function applyAccent(accent) {
  const safeAccent = VALID_ACCENTS.includes(accent) ? accent : "emerald";
  document.documentElement.dataset.accent = safeAccent;
  localStorage.setItem(ACCENT_STORAGE_KEY, safeAccent);
  updateThemeColor();
}

function updateThemeColor() {
  const theme = document.documentElement.dataset.theme;
  const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  document.querySelector("#themeColorMeta")?.setAttribute("content", theme === "dark" ? "#000000" : accent || "#059669");
}

applyTheme(getInitialTheme());
applyAccent(getInitialAccent());

const state = {
  db: null,
  items: [],
  categories: [],
  purchases: [],
  settings: { id: SETTINGS_ID, monthlyBudget: 1200, cardClosingDay: "", userName: "", userGender: "neutral" },
  activeView: "dashboardView",
  editingItemId: null,
  editingPurchaseId: null,
  pendingItemCategoryId: "",
  collapsedCategoryIds: new Set(),
  draggingItemId: null,
};

function createId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const el = {
  views: [...document.querySelectorAll(".view")],
  navButtons: [...document.querySelectorAll(".nav-button")],
  remainingBalance: document.querySelector("#remainingBalance"),
  spentBudgetRatio: document.querySelector("#spentBudgetRatio"),
  purchaseCountLabel: document.querySelector("#purchaseCountLabel"),
  weeklyBudgetValues: [...document.querySelectorAll(".weeklyBudgetValue")],
  weeksUntilClosingLabels: [...document.querySelectorAll(".weeksUntilClosingLabel")],
  itemCountLabel: document.querySelector("#itemCountLabel"),
  welcomeTitle: document.querySelector("#welcomeTitle"),
  userAvatar: document.querySelector("#userAvatar"),
  summaryItemList: document.querySelector("#summaryItemList"),
  emptySummaryItems: document.querySelector("#emptySummaryItems"),
  summaryPurchaseList: document.querySelector("#summaryPurchaseList"),
  emptySummaryPurchases: document.querySelector("#emptySummaryPurchases"),
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
  userGenderInput: document.querySelector("#userGenderInput"),
  itemForm: document.querySelector("#itemForm"),
  itemName: document.querySelector("#itemName"),
  itemQuantity: document.querySelector("#itemQuantity"),
  categoryForm: document.querySelector("#categoryForm"),
  categoryNameInput: document.querySelector("#categoryNameInput"),
  categoryPresetInputs: [...document.querySelectorAll("input[name='categoryPreset']")],
  itemDialog: document.querySelector("#itemDialog"),
  itemDialogTitle: document.querySelector("#itemDialogTitle"),
  saveItemButton: document.querySelector("#saveItemButton"),
  deleteItemButton: document.querySelector("#deleteItemButton"),
  closeItemDialogButton: document.querySelector("#closeItemDialogButton"),
  cancelItemDialogButton: document.querySelector("#cancelItemDialogButton"),
  categoryDialog: document.querySelector("#categoryDialog"),
  closeCategoryDialogButton: document.querySelector("#closeCategoryDialogButton"),
  cancelCategoryDialogButton: document.querySelector("#cancelCategoryDialogButton"),
  itemList: document.querySelector("#itemList"),
  emptyItems: document.querySelector("#emptyItems"),
  resetDatabaseButton: document.querySelector("#resetDatabaseButton"),
  manualRefreshButton: document.querySelector("#manualRefreshButton"),
  themeToggle: document.querySelector("#themeToggle"),
  accentColorInput: document.querySelector("#accentColorInput"),
  quickAddButton: document.querySelector("#quickAddButton"),
  fabMenu: document.querySelector("#fabMenu"),
  quickAddItemButton: document.querySelector("#quickAddItemButton"),
  quickAddPurchaseButton: document.querySelector("#quickAddPurchaseButton"),
  inlineAddButton: document.querySelector("#inlineAddButton"),
  listMenuButton: document.querySelector("#listMenuButton"),
  listMenu: document.querySelector("#listMenu"),
  openCategoryDialogButton: document.querySelector("#openCategoryDialogButton"),
  addSummaryItemButton: document.querySelector("#addSummaryItemButton"),
  addSummaryPurchaseButton: document.querySelector("#addSummaryPurchaseButton"),
  viewFullListButton: document.querySelector("#viewFullListButton"),
  viewPurchasesButton: document.querySelector("#viewPurchasesButton"),
  refreshButton: document.querySelector("#refreshButton"),
  checkoutDialog: document.querySelector("#checkoutDialog"),
  checkoutDialogTitle: document.querySelector("#checkoutDialogTitle"),
  checkoutForm: document.querySelector("#checkoutForm"),
  purchaseName: document.querySelector("#purchaseName"),
  purchaseDate: document.querySelector("#purchaseDate"),
  purchaseTotal: document.querySelector("#purchaseTotal"),
  savePurchaseButton: document.querySelector("#savePurchaseButton"),
  deletePurchaseButton: document.querySelector("#deletePurchaseButton"),
  closeCheckoutButton: document.querySelector("#closeCheckoutButton"),
  cancelCheckoutButton: document.querySelector("#cancelCheckoutButton"),
  toast: document.querySelector("#toast"),
};

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("items")) {
        db.createObjectStore("items", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("purchases")) {
        db.createObjectStore("purchases", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("categories")) {
        db.createObjectStore("categories", { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function store(name, mode = "readonly") {
  return state.db.transaction(name, mode).objectStore(name);
}

function getAll(name) {
  return new Promise((resolve, reject) => {
    const request = store(name).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getOne(name, id) {
  return new Promise((resolve, reject) => {
    const request = store(name).get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function putOne(name, value) {
  return new Promise((resolve, reject) => {
    const request = store(name, "readwrite").put(value);
    request.onsuccess = () => resolve(value);
    request.onerror = () => reject(request.error);
  });
}

function deleteOne(name, id) {
  return new Promise((resolve, reject) => {
    const request = store(name, "readwrite").delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function clearStore(name) {
  return new Promise((resolve, reject) => {
    const request = store(name, "readwrite").clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function bulkPut(name, values) {
  return new Promise((resolve, reject) => {
    const transaction = state.db.transaction(name, "readwrite");
    const objectStore = transaction.objectStore(name);
    values.forEach((value) => objectStore.put(value));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

async function seedData() {
  const settings = await getOne("settings", SETTINGS_ID);
  const isFirstRun = !settings;

  if (isFirstRun) {
    await putOne("settings", state.settings);
  }

  const items = await getAll("items");
  if (isFirstRun && !items.length) {
    await bulkPut(
      "items",
      DEFAULT_ITEMS.map((item) => ({
        id: createId(),
        name: item.name,
        quantity: item.quantity,
        checked: false,
        createdAt: Date.now(),
      })),
    );
  }
}

async function loadState() {
  const [items, categories, purchases, settings] = await Promise.all([
    getAll("items"),
    getAll("categories"),
    getAll("purchases"),
    getOne("settings", SETTINGS_ID),
  ]);

  state.items = items.sort((a, b) => b.createdAt - a.createdAt);
  state.categories = categories.sort((a, b) => a.createdAt - b.createdAt);
  state.purchases = purchases.sort((a, b) => b.date - a.date);
  state.settings = { ...state.settings, ...(settings || {}) };
}

function monthBounds(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1).getTime();
  return { start, end };
}

function currentMonthPurchases() {
  const { start, end } = monthBounds();
  return state.purchases.filter((purchase) => purchase.date >= start && purchase.date < end);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatDate(timestamp) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(timestamp));
}

function formatDateInput(timestamp = Date.now()) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateInput(value) {
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return NaN;
  }
  return date.getTime();
}

function purchaseTitle(purchase, index) {
  const name = (purchase.name || "").trim();
  return name || `Compra #${state.purchases.length - index}`;
}

function itemCategoryId(item) {
  return item.categoryId || UNCATEGORIZED_ID;
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function parseCurrency(value) {
  const normalized = String(value)
    .trim()
    .replace(/\s/g, "")
    .replace(/[R$r$]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function closingDateForMonth(day, year, month) {
  const safeDay = Math.min(Math.max(Number(day), 1), 31);
  return new Date(year, month, Math.min(safeDay, daysInMonth(year, month)));
}

function nextClosingDate(day, date = new Date()) {
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const candidate = closingDateForMonth(day, date.getFullYear(), date.getMonth());
  if (candidate < today) {
    return closingDateForMonth(day, date.getFullYear(), date.getMonth() + 1);
  }
  return candidate;
}

function weeksUntilClosing(day) {
  if (!day) return null;
  const now = new Date();
  const closing = nextClosingDate(day, now);
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.max(1, Math.ceil((closing - now) / msPerWeek));
}

function renderDashboard() {
  const monthPurchases = currentMonthPurchases();
  const spent = monthPurchases.reduce((sum, purchase) => sum + purchase.total, 0);
  const budget = state.settings.monthlyBudget;
  const remaining = budget - spent;
  const weeksLeft = weeksUntilClosing(state.settings.cardClosingDay);

  el.remainingBalance.textContent = formatCurrency(remaining);
  if (el.spentBudgetRatio) {
    el.spentBudgetRatio.textContent = `${formatCurrency(spent)} / ${formatCurrency(budget)}`;
  }
  if (el.purchaseCountLabel) {
    el.purchaseCountLabel.textContent = `${monthPurchases.length} ${monthPurchases.length === 1 ? "compra" : "compras"}`;
  }
  el.budgetInput.value = budget ? String(budget).replace(".", ",") : "";
  el.cardClosingDayInput.value = state.settings.cardClosingDay || "";
  el.userNameInput.value = state.settings.userName || "";
  el.userGenderInput.value = state.settings.userGender || "neutral";
  renderWeeklyBudget(remaining, weeksLeft);
  renderProfile();

  el.purchaseList.innerHTML = "";
  state.purchases.forEach((purchase, index) => {
    el.purchaseList.append(createPurchaseRow(purchase, index));
  });

  el.emptyPurchases.classList.toggle("is-visible", state.purchases.length === 0);
  renderPurchaseSummary();
  renderPurchaseChart();
}

function renderPurchaseChart() {
  if (!el.purchaseChart || !el.purchaseMedianLabel || !el.emptyPurchaseChart) return;

  const purchases = state.purchases.slice(0, 8).reverse();
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

function renderWeeklyBudget(remaining, weeksLeft) {
  if (!el.weeklyBudgetValues.length || !el.weeksUntilClosingLabels.length) return;

  if (!weeksLeft) {
    el.weeklyBudgetValues.forEach((value) => {
      value.textContent = formatCurrency(remaining);
    });
    el.weeksUntilClosingLabels.forEach((label) => {
      label.textContent = "Informe o dia de fechamento em Ajustes.";
    });
    return;
  }

  el.weeklyBudgetValues.forEach((value) => {
    value.textContent = formatCurrency(remaining / weeksLeft);
  });
  el.weeksUntilClosingLabels.forEach((label) => {
    label.textContent = `${weeksLeft} ${weeksLeft === 1 ? "semana restante" : "semanas restantes"} até o fechamento.`;
  });
}

function renderProfile() {
  const name = (state.settings.userName || "").trim();
  const gender = state.settings.userGender || "neutral";
  el.welcomeTitle.textContent = name ? `Olá, ${name}` : "Boas-vindas";
  el.userAvatar.textContent = gender === "female" ? "♀" : gender === "male" ? "♂" : "F";
  el.userAvatar.dataset.gender = gender;
}

function createItemRow(item, { removable, draggable = false } = {}) {
  const row = document.createElement("li");
  row.className = `item-row${item.checked ? " is-checked" : ""}`;
  row.setAttribute("role", "button");
  row.setAttribute("tabindex", "0");
  row.setAttribute("aria-label", `Editar ${item.name}`);
  if (draggable) {
    row.draggable = true;
    row.dataset.itemId = item.id;
    row.addEventListener("dragstart", (event) => {
      if (!event.target.closest(".drag-handle")) {
        event.preventDefault();
        return;
      }
      event.stopPropagation();
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", item.id);
      row.classList.add("is-dragging");
    });
    row.addEventListener("dragend", () => row.classList.remove("is-dragging"));
  }

  const quantity = item.quantity ? `<span class="item-quantity">${escapeHtml(item.quantity)}</span>` : "";
  row.innerHTML = `
    <button class="check-button" type="button" aria-label="Marcar ${escapeHtml(item.name)}">✓</button>
    <div class="item-main">
      <strong>${escapeHtml(item.name)}</strong>
      ${quantity}
    </div>
    ${draggable ? `<button class="drag-handle" type="button" aria-label="Mover item"><i data-lucide="grip-vertical" aria-hidden="true"></i></button>` : ""}
  `;

  const dragHandle = row.querySelector(".drag-handle");
  if (dragHandle) {
    dragHandle.addEventListener("click", (event) => event.stopPropagation());
    dragHandle.addEventListener("pointerdown", (event) => beginItemPointerDrag(event, item.id, row));
  }

  row.addEventListener("click", () => openItemDialog(item.id));
  row.addEventListener("keydown", (event) => {
    if (event.target !== row) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openItemDialog(item.id);
    }
  });

  row.querySelector(".check-button").addEventListener("click", (event) => {
    event.stopPropagation();
    toggleItem(item.id);
  });
  return row;
}

function renderItems() {
  el.itemList.innerHTML = "";
  el.summaryItemList.innerHTML = "";

  renderCategorySections();

  state.items.slice(0, 3).forEach((item) => {
    el.summaryItemList.append(createItemRow(item, { removable: true }));
  });

  el.emptyItems.classList.toggle("is-visible", state.items.length === 0);
  el.emptySummaryItems.classList.toggle("is-visible", state.items.length === 0);
  if (el.itemCountLabel) {
    el.itemCountLabel.textContent = `${state.items.length} ${state.items.length === 1 ? "item" : "itens"}`;
  }
}

function renderCategorySections() {
  const categories = [{ id: UNCATEGORIZED_ID, name: "Sem seção", locked: true }, ...state.categories];
  categories.forEach((category) => {
    const items = state.items.filter((item) => itemCategoryId(item) === category.id);
    if (category.locked && !items.length && state.categories.length) return;

    const section = document.createElement("section");
    section.className = "category-section";
    section.dataset.categoryId = category.id;

    const isCollapsed = state.collapsedCategoryIds.has(category.id);
    const listId = `category-list-${category.id}`;
    section.innerHTML = `
      <div class="category-head">
        <button class="category-toggle" type="button" aria-expanded="${!isCollapsed}" aria-controls="${listId}">
          <i data-lucide="${isCollapsed ? "chevron-right" : "chevron-down"}" aria-hidden="true"></i>
          <span>${escapeHtml(category.name)}</span>
          <small>${items.length}</small>
        </button>
        <button class="category-add-button" type="button" aria-label="Adicionar item em ${escapeHtml(category.name)}">
          <i data-lucide="plus" aria-hidden="true"></i>
        </button>
      </div>
      <ul class="item-list category-items" id="${listId}" ${isCollapsed ? "hidden" : ""}></ul>
    `;

    const list = section.querySelector(".category-items");
    list.addEventListener("dragover", (event) => {
      event.preventDefault();
      list.classList.add("is-drop-target");
    });
    list.addEventListener("dragleave", () => list.classList.remove("is-drop-target"));
    list.addEventListener("drop", (event) => {
      event.preventDefault();
      list.classList.remove("is-drop-target");
      moveItemToCategory(event.dataTransfer.getData("text/plain"), category.id);
    });

    items.forEach((item) => {
      list.append(createItemRow(item, { removable: true, draggable: true }));
    });

    if (!items.length) {
      const empty = document.createElement("li");
      empty.className = "category-empty";
      empty.textContent = "Arraste itens para esta seção.";
      list.append(empty);
    }

    section.querySelector(".category-toggle").addEventListener("click", () => toggleCategory(category.id));
    section.querySelector(".category-add-button").addEventListener("click", () => openItemDialog(null, category.id));
    el.itemList.append(section);
  });
}

function renderNavigation() {
  el.views.forEach((view) => view.classList.toggle("is-active", view.id === state.activeView));
  el.navButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.view === state.activeView));
}

function renderSettings() {
  el.themeToggle.checked = document.documentElement.dataset.theme === "dark";
  if (el.accentColorInput) {
    el.accentColorInput.value = document.documentElement.dataset.accent || "emerald";
  }
}

function renderIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function render() {
  renderDashboard();
  renderItems();
  renderNavigation();
  renderSettings();
  renderIcons();
}

function setView(viewId) {
  if (state.activeView === viewId) {
    closeFabMenu();
    closeListMenu();
    return;
  }

  const currentIndex = VIEW_ORDER.indexOf(state.activeView);
  const nextIndex = VIEW_ORDER.indexOf(viewId);
  document.documentElement.dataset.navDirection = nextIndex > currentIndex ? "forward" : "back";
  state.activeView = viewId;
  renderNavigation();
  closeFabMenu();
  closeListMenu();
}

function renderPurchaseSummary() {
  el.summaryPurchaseList.innerHTML = "";
  state.purchases.slice(0, 3).forEach((purchase, index) => {
    el.summaryPurchaseList.append(createPurchaseRow(purchase, index, { summary: true }));
  });
  el.emptySummaryPurchases.classList.toggle("is-visible", state.purchases.length === 0);
}

function createPurchaseRow(purchase, index, { summary = false } = {}) {
  const row = document.createElement("li");
  row.className = `purchase-row${summary ? " summary-row" : ""}`;
  row.setAttribute("role", "button");
  row.setAttribute("tabindex", "0");
  row.setAttribute("aria-label", `Editar compra de ${formatCurrency(purchase.total)}`);
  row.innerHTML = `
    <div class="purchase-main">
      <strong>${escapeHtml(purchaseTitle(purchase, index))}</strong>
      <span>${formatDate(purchase.date)}</span>
    </div>
    <strong>${formatCurrency(purchase.total)}</strong>
  `;

  row.addEventListener("click", () => openCheckout(purchase.id));
  row.addEventListener("keydown", (event) => {
    if (event.target !== row) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openCheckout(purchase.id);
    }
  });

  return row;
}

function focusDialogInput(input) {
  return;
  if (!input) return;
  input.focus({ preventScroll: true });
  requestAnimationFrame(() => input.focus({ preventScroll: true }));
}

async function saveItem(event) {
  event.preventDefault();
  const name = el.itemName.value.trim();
  const quantity = el.itemQuantity.value.trim();
  if (!name) {
    showToast("Informe o nome do item.");
    return;
  }

  const item = state.items.find((current) => current.id === state.editingItemId);
  if (item) {
    await putOne("items", { ...item, name, quantity });
  } else {
    await putOne("items", {
      id: createId(),
      name,
      quantity,
      categoryId: state.pendingItemCategoryId === UNCATEGORIZED_ID ? "" : state.pendingItemCategoryId,
      checked: false,
      createdAt: Date.now(),
    });
  }

  closeItemDialog();
  await reloadAndRender();
  showToast(item ? "Item atualizado." : "Item adicionado.");
}

function openItemDialog(id = null, categoryId = "") {
  state.editingItemId = id;
  state.pendingItemCategoryId = categoryId === UNCATEGORIZED_ID ? "" : categoryId;
  const item = state.items.find((current) => current.id === id);

  el.itemForm.reset();
  el.itemDialogTitle.textContent = item ? "Editar item" : "Novo item";
  el.saveItemButton.textContent = item ? "Salvar" : "Adicionar";
  el.deleteItemButton.hidden = !item;
  if (item) {
    el.itemName.value = item.name;
    el.itemQuantity.value = item.quantity || "";
  }

  if (typeof el.itemDialog.showModal === "function") {
    el.itemDialog.showModal();
  } else {
    el.itemDialog.setAttribute("open", "");
  }
  focusDialogInput(el.itemName);
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

  await bulkPut(
    "categories",
    categories.map((name, index) => ({
      id: createId(),
      name,
      createdAt: Date.now() + index,
    })),
  );

  closeCategoryDialog();
  await reloadAndRender();
  showToast(categories.length === 1 ? "Seção adicionada." : "Seções adicionadas.");
}

function openCategoryDialog() {
  closeListMenu();
  el.categoryForm.reset();
  if (typeof el.categoryDialog.showModal === "function") {
    el.categoryDialog.showModal();
  } else {
    el.categoryDialog.setAttribute("open", "");
  }
  focusDialogInput(el.categoryNameInput);
}

function closeCategoryDialog() {
  if (typeof el.categoryDialog.close === "function") {
    el.categoryDialog.close();
  } else {
    el.categoryDialog.removeAttribute("open");
  }
}

function toggleCategory(id) {
  if (state.collapsedCategoryIds.has(id)) {
    state.collapsedCategoryIds.delete(id);
  } else {
    state.collapsedCategoryIds.add(id);
  }
  renderItems();
  renderIcons();
}

function beginItemPointerDrag(event, itemId, row) {
  event.preventDefault();
  event.stopPropagation();
  state.draggingItemId = itemId;
  row.classList.add("is-dragging");
  event.currentTarget.setPointerCapture?.(event.pointerId);

  const move = (moveEvent) => {
    document.querySelectorAll(".category-items.is-drop-target").forEach((target) => {
      target.classList.remove("is-drop-target");
    });
    const target = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY)?.closest(".category-section");
    target?.querySelector(".category-items:not([hidden])")?.classList.add("is-drop-target");
  };

  const finish = async (finishEvent) => {
    document.removeEventListener("pointermove", move);
    document.removeEventListener("pointerup", finish);
    document.querySelectorAll(".category-items.is-drop-target").forEach((target) => {
      target.classList.remove("is-drop-target");
    });
    row.classList.remove("is-dragging");

    const target = document.elementFromPoint(finishEvent.clientX, finishEvent.clientY)?.closest(".category-section");
    const categoryId = target?.dataset.categoryId;
    state.draggingItemId = null;
    if (categoryId) {
      await moveItemToCategory(itemId, categoryId);
    }
  };

  document.addEventListener("pointermove", move);
  document.addEventListener("pointerup", finish, { once: true });
}

async function moveItemToCategory(itemId, categoryId) {
  const item = state.items.find((current) => current.id === itemId);
  if (!item) return;

  const normalizedCategoryId = categoryId === UNCATEGORIZED_ID ? "" : categoryId;
  if ((item.categoryId || "") === normalizedCategoryId) return;

  await putOne("items", { ...item, categoryId: normalizedCategoryId });
  await reloadAndRender();
  showToast("Item movido.");
}

async function toggleItem(id) {
  const item = state.items.find((current) => current.id === id);
  if (!item) return;

  await putOne("items", { ...item, checked: !item.checked });
  await reloadAndRender();
}

async function removeItem(id) {
  if (!id) return;
  const confirmed = window.confirm("Excluir este item?");
  if (!confirmed) return;

  if (state.editingItemId === id) {
    state.editingItemId = null;
  }
  await deleteOne("items", id);
  if (el.itemDialog.open) {
    closeItemDialog();
  }
  await reloadAndRender();
  showToast("Item removido.");
}

async function saveBudget(event) {
  event.preventDefault();
  const value = parseCurrency(el.budgetInput.value);
  const cardClosingDay = el.cardClosingDayInput.value ? Number(el.cardClosingDayInput.value) : "";
  if (!Number.isFinite(value) || value < 0) {
    showToast("Informe um budget válido.");
    return;
  }
  if (cardClosingDay && (cardClosingDay < 1 || cardClosingDay > 31)) {
    showToast("Informe um dia de fechamento entre 1 e 31.");
    return;
  }

  await putOne("settings", { ...state.settings, id: SETTINGS_ID, monthlyBudget: value, cardClosingDay });
  await reloadAndRender();
  showToast("Budget atualizado.");
}

async function saveProfile(event) {
  event.preventDefault();
  const userName = el.userNameInput.value.trim();
  const userGender = el.userGenderInput.value;

  await putOne("settings", { ...state.settings, id: SETTINGS_ID, userName, userGender });
  await reloadAndRender();
  showToast("Perfil atualizado.");
}

async function resetDatabase() {
  const confirmed = window.confirm("Tem certeza que deseja apagar todos os dados e começar do zero?");
  if (!confirmed) return;

  await Promise.all([clearStore("items"), clearStore("categories"), clearStore("purchases"), clearStore("settings")]);
  await putOne("settings", { id: SETTINGS_ID, monthlyBudget: 1200, cardClosingDay: "", userName: "", userGender: "neutral" });

  state.editingItemId = null;
  state.editingPurchaseId = null;
  state.pendingItemCategoryId = "";
  state.collapsedCategoryIds.clear();

  await reloadAndRender();
  setView("dashboardView");
  showToast("Dados resetados.");
}

function toggleTheme(event) {
  const theme = event.currentTarget.checked ? "dark" : "light";
  applyTheme(theme);
}

function changeAccent(event) {
  applyAccent(event.currentTarget.value);
}

function openQuickAdd() {
  openItemDialog();
}

function toggleFabMenu() {
  if (!el.fabMenu) return;
  const isOpen = !el.fabMenu.hidden;
  el.fabMenu.hidden = isOpen;
  el.quickAddButton.setAttribute("aria-expanded", String(!isOpen));
}

function closeFabMenu() {
  if (!el.fabMenu) return;
  el.fabMenu.hidden = true;
  el.quickAddButton.setAttribute("aria-expanded", "false");
}

function toggleListMenu() {
  if (!el.listMenu) return;
  const isOpen = !el.listMenu.hidden;
  el.listMenu.hidden = isOpen;
  el.listMenuButton.setAttribute("aria-expanded", String(!isOpen));
}

function closeListMenu() {
  if (!el.listMenu) return;
  el.listMenu.hidden = true;
  el.listMenuButton.setAttribute("aria-expanded", "false");
}

function openQuickItem() {
  closeFabMenu();
  openItemDialog();
}

function openQuickPurchase() {
  closeFabMenu();
  openCheckout();
}

function openCheckout(id = null) {
  state.editingPurchaseId = id;
  const purchase = state.purchases.find((current) => current.id === id);

  el.checkoutDialogTitle.textContent = purchase ? "Editar compra" : "Registrar compra";
  el.savePurchaseButton.textContent = purchase ? "Salvar" : "Salvar";
  el.deletePurchaseButton.hidden = !purchase;
  el.purchaseName.value = purchase?.name || "";
  el.purchaseDate.value = formatDateInput(purchase?.date || Date.now());
  el.purchaseTotal.value = purchase ? String(purchase.total).replace(".", ",") : "";
  if (typeof el.checkoutDialog.showModal === "function") {
    el.checkoutDialog.showModal();
  } else {
    el.checkoutDialog.setAttribute("open", "");
  }
  focusDialogInput(el.purchaseTotal);
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

  const purchase = state.purchases.find((current) => current.id === state.editingPurchaseId);
  if (purchase) {
    await putOne("purchases", { ...purchase, name, date, total });
  } else {
    await putOne("purchases", {
      id: createId(),
      name,
      total,
      date,
    });

    await bulkPut(
      "items",
      state.items.map((item) => ({ ...item, checked: false })),
    );
  }

  closeCheckout();
  await reloadAndRender();
  setView("purchaseView");
  showToast(purchase ? "Compra atualizada." : "Compra registrada.");
}

function closeCheckout() {
  state.editingPurchaseId = null;
  el.deletePurchaseButton.hidden = true;
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

  await deleteOne("purchases", id);
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function reloadAndRender() {
  await loadState();
  render();
}

async function refreshApp() {
  showToast("Atualizando app...");
  await reloadAndRender();

  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.update()));
    }
  } catch (error) {
    console.info("Não foi possível atualizar o service worker antes do reload.", error);
  }

  window.setTimeout(() => window.location.reload(), 250);
}

function bindEvents() {
  el.navButtons.forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });
  el.itemForm.addEventListener("submit", saveItem);
  el.categoryForm?.addEventListener("submit", saveCategory);
  el.deleteItemButton?.addEventListener("click", () => removeItem(state.editingItemId));
  el.closeItemDialogButton.addEventListener("click", closeItemDialog);
  el.cancelItemDialogButton.addEventListener("click", closeItemDialog);
  el.closeCategoryDialogButton?.addEventListener("click", closeCategoryDialog);
  el.cancelCategoryDialogButton?.addEventListener("click", closeCategoryDialog);
  el.budgetForm.addEventListener("submit", saveBudget);
  el.profileForm.addEventListener("submit", saveProfile);
  el.resetDatabaseButton.addEventListener("click", resetDatabase);
  el.manualRefreshButton?.addEventListener("click", refreshApp);
  el.themeToggle.addEventListener("change", toggleTheme);
  el.accentColorInput?.addEventListener("change", changeAccent);
  el.quickAddButton.addEventListener("click", toggleFabMenu);
  el.quickAddItemButton?.addEventListener("click", openQuickItem);
  el.quickAddPurchaseButton?.addEventListener("click", openQuickPurchase);
  el.inlineAddButton.addEventListener("click", openQuickAdd);
  el.listMenuButton?.addEventListener("click", toggleListMenu);
  el.openCategoryDialogButton?.addEventListener("click", openCategoryDialog);
  document.addEventListener("click", (event) => {
    if (!el.listMenu || el.listMenu.hidden) return;
    if (event.target.closest(".list-menu-wrap")) return;
    closeListMenu();
  });
  el.addSummaryItemButton?.addEventListener("click", openQuickItem);
  el.addSummaryPurchaseButton?.addEventListener("click", openQuickPurchase);
  el.viewFullListButton?.addEventListener("click", () => setView("listView"));
  el.viewPurchasesButton?.addEventListener("click", () => setView("purchaseView"));
  el.checkoutForm.addEventListener("submit", finishPurchase);
  el.deletePurchaseButton?.addEventListener("click", () => removePurchase(state.editingPurchaseId));
  el.closeCheckoutButton.addEventListener("click", closeCheckout);
  el.cancelCheckoutButton.addEventListener("click", closeCheckout);
  el.refreshButton.addEventListener("click", reloadAndRender);
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("./sw.js");
  } catch (error) {
    console.info("Service worker indisponível neste contexto.", error);
  }
}

async function init() {
  try {
    state.db = await openDatabase();
    await seedData();
    await loadState();
    bindEvents();
    render();
    registerServiceWorker();
  } catch (error) {
    console.error(error);
    showToast("Não foi possível iniciar o app.");
  }
}

init();
