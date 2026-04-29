const DB_NAME = "feira-db";
const DB_VERSION = 1;
const SETTINGS_ID = "main";
const THEME_STORAGE_KEY = "feira:theme";
const DEFAULT_ITEMS = [
  { name: "Arroz", quantity: "1 pacote" },
  { name: "Feijão", quantity: "1 kg" },
  { name: "Leite", quantity: "2 un" },
  { name: "Café", quantity: "" },
];

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
  document.querySelector("#themeColorMeta")?.setAttribute("content", theme === "dark" ? "#0e1615" : "#145c58");
}

applyTheme(getInitialTheme());

const state = {
  db: null,
  items: [],
  purchases: [],
  settings: { id: SETTINGS_ID, monthlyBudget: 1200, userName: "", userGender: "neutral" },
  activeView: "dashboardView",
  editingItemId: null,
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
  monthLabel: document.querySelector("#monthLabel"),
  remainingBalance: document.querySelector("#remainingBalance"),
  spentMonth: document.querySelector("#spentMonth"),
  monthlyBudget: document.querySelector("#monthlyBudget"),
  purchaseCount: document.querySelector("#purchaseCount"),
  averagePurchase: document.querySelector("#averagePurchase"),
  itemCountLabel: document.querySelector("#itemCountLabel"),
  welcomeTitle: document.querySelector("#welcomeTitle"),
  userAvatar: document.querySelector("#userAvatar"),
  summaryItemList: document.querySelector("#summaryItemList"),
  emptySummaryItems: document.querySelector("#emptySummaryItems"),
  summaryPurchaseList: document.querySelector("#summaryPurchaseList"),
  emptySummaryPurchases: document.querySelector("#emptySummaryPurchases"),
  purchaseList: document.querySelector("#purchaseList"),
  emptyPurchases: document.querySelector("#emptyPurchases"),
  budgetForm: document.querySelector("#budgetForm"),
  budgetInput: document.querySelector("#budgetInput"),
  profileForm: document.querySelector("#profileForm"),
  userNameInput: document.querySelector("#userNameInput"),
  userGenderInput: document.querySelector("#userGenderInput"),
  itemForm: document.querySelector("#itemForm"),
  itemName: document.querySelector("#itemName"),
  itemQuantity: document.querySelector("#itemQuantity"),
  itemDialog: document.querySelector("#itemDialog"),
  itemDialogTitle: document.querySelector("#itemDialogTitle"),
  saveItemButton: document.querySelector("#saveItemButton"),
  closeItemDialogButton: document.querySelector("#closeItemDialogButton"),
  cancelItemDialogButton: document.querySelector("#cancelItemDialogButton"),
  itemList: document.querySelector("#itemList"),
  emptyItems: document.querySelector("#emptyItems"),
  resetDatabaseButton: document.querySelector("#resetDatabaseButton"),
  themeToggle: document.querySelector("#themeToggle"),
  quickAddButton: document.querySelector("#quickAddButton"),
  fabMenu: document.querySelector("#fabMenu"),
  quickAddItemButton: document.querySelector("#quickAddItemButton"),
  quickAddPurchaseButton: document.querySelector("#quickAddPurchaseButton"),
  inlineAddButton: document.querySelector("#inlineAddButton"),
  viewFullListButton: document.querySelector("#viewFullListButton"),
  viewPurchasesButton: document.querySelector("#viewPurchasesButton"),
  refreshButton: document.querySelector("#refreshButton"),
  checkoutDialog: document.querySelector("#checkoutDialog"),
  checkoutForm: document.querySelector("#checkoutForm"),
  purchaseTotal: document.querySelector("#purchaseTotal"),
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
  const [items, purchases, settings] = await Promise.all([
    getAll("items"),
    getAll("purchases"),
    getOne("settings", SETTINGS_ID),
  ]);

  state.items = items.sort((a, b) => b.createdAt - a.createdAt);
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

function renderDashboard() {
  const monthPurchases = currentMonthPurchases();
  const spent = monthPurchases.reduce((sum, purchase) => sum + purchase.total, 0);
  const budget = state.settings.monthlyBudget;
  const remaining = budget - spent;
  const average = monthPurchases.length ? spent / monthPurchases.length : 0;
  const monthName = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date());

  el.monthLabel.textContent = monthName;
  el.remainingBalance.textContent = formatCurrency(remaining);
  el.spentMonth.textContent = formatCurrency(spent);
  el.monthlyBudget.textContent = formatCurrency(budget);
  el.purchaseCount.textContent = String(monthPurchases.length);
  el.averagePurchase.textContent = `Média ${formatCurrency(average)}`;
  el.budgetInput.value = budget ? String(budget).replace(".", ",") : "";
  el.userNameInput.value = state.settings.userName || "";
  el.userGenderInput.value = state.settings.userGender || "neutral";
  renderProfile();

  el.purchaseList.innerHTML = "";
  state.purchases.forEach((purchase, index) => {
    const row = document.createElement("li");
    row.className = "purchase-row";
    row.innerHTML = `
      <div>
        <strong>Compra #${state.purchases.length - index}</strong>
        <span>${formatDate(purchase.date)}</span>
      </div>
      <strong>${formatCurrency(purchase.total)}</strong>
    `;
    el.purchaseList.append(row);
  });

  el.emptyPurchases.classList.toggle("is-visible", state.purchases.length === 0);
  renderPurchaseSummary();
}

function renderProfile() {
  const name = (state.settings.userName || "").trim();
  const gender = state.settings.userGender || "neutral";
  el.welcomeTitle.textContent = name ? `Olá, ${name}` : "Boas-vindas";
  el.userAvatar.textContent = gender === "female" ? "♀" : gender === "male" ? "♂" : "F";
  el.userAvatar.dataset.gender = gender;
}

function createItemRow(item, { removable }) {
  const row = document.createElement("li");
  row.className = `item-row${item.checked ? " is-checked" : ""}`;

  const quantity = item.quantity ? `<span>${escapeHtml(item.quantity)}</span>` : "<span>Sem quantidade</span>";
  row.innerHTML = `
    <button class="check-button" type="button" aria-label="Marcar ${escapeHtml(item.name)}">✓</button>
    <div class="item-main">
      <strong>${escapeHtml(item.name)}</strong>
      ${quantity}
    </div>
    ${
      removable
        ? `
          <div class="item-actions">
            <button class="edit-button" type="button" aria-label="Editar item">✎</button>
            <button class="delete-button" type="button" aria-label="Remover item">×</button>
          </div>
        `
        : ""
    }
  `;

  row.querySelector(".check-button").addEventListener("click", () => toggleItem(item.id));
  const editButton = row.querySelector(".edit-button");
  if (editButton) {
    editButton.addEventListener("click", () => openItemDialog(item.id));
  }
  const deleteButton = row.querySelector(".delete-button");
  if (deleteButton) {
    deleteButton.addEventListener("click", () => removeItem(item.id));
  }

  return row;
}

function createSummaryItemRow(item) {
  const row = document.createElement("li");
  row.className = `item-row summary-row${item.checked ? " is-checked" : ""}`;
  const quantity = item.quantity ? `<span>${escapeHtml(item.quantity)}</span>` : "<span>Sem quantidade</span>";
  row.innerHTML = `
    <div class="item-main">
      <strong>${escapeHtml(item.name)}</strong>
      ${quantity}
    </div>
  `;
  return row;
}

function renderItems() {
  el.itemList.innerHTML = "";
  el.summaryItemList.innerHTML = "";

  state.items.forEach((item) => {
    el.itemList.append(createItemRow(item, { removable: true }));
  });

  state.items.slice(0, 3).forEach((item) => {
    el.summaryItemList.append(createSummaryItemRow(item));
  });

  el.emptyItems.classList.toggle("is-visible", state.items.length === 0);
  el.emptySummaryItems.classList.toggle("is-visible", state.items.length === 0);
  if (el.itemCountLabel) {
    el.itemCountLabel.textContent = `${state.items.length} ${state.items.length === 1 ? "item" : "itens"}`;
  }
}

function renderNavigation() {
  el.views.forEach((view) => view.classList.toggle("is-active", view.id === state.activeView));
  el.navButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.view === state.activeView));
}

function renderSettings() {
  el.themeToggle.checked = document.documentElement.dataset.theme === "dark";
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
  state.activeView = viewId;
  renderNavigation();
  closeFabMenu();
}

function renderPurchaseSummary() {
  el.summaryPurchaseList.innerHTML = "";
  state.purchases.slice(0, 3).forEach((purchase, index) => {
    const row = document.createElement("li");
    row.className = "purchase-row summary-row";
    row.innerHTML = `
      <div>
        <strong>Compra #${state.purchases.length - index}</strong>
        <span>${formatDate(purchase.date)}</span>
      </div>
      <strong>${formatCurrency(purchase.total)}</strong>
    `;
    el.summaryPurchaseList.append(row);
  });
  el.emptySummaryPurchases.classList.toggle("is-visible", state.purchases.length === 0);
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
      checked: false,
      createdAt: Date.now(),
    });
  }

  closeItemDialog();
  await reloadAndRender();
  showToast(item ? "Item atualizado." : "Item adicionado.");
}

function openItemDialog(id = null) {
  state.editingItemId = id;
  const item = state.items.find((current) => current.id === id);

  el.itemForm.reset();
  el.itemDialogTitle.textContent = item ? "Editar item" : "Novo item";
  el.saveItemButton.textContent = item ? "Salvar" : "Adicionar";
  if (item) {
    el.itemName.value = item.name;
    el.itemQuantity.value = item.quantity || "";
  }

  if (typeof el.itemDialog.showModal === "function") {
    el.itemDialog.showModal();
  } else {
    el.itemDialog.setAttribute("open", "");
  }
  setTimeout(() => el.itemName.focus(), 80);
}

function closeItemDialog() {
  state.editingItemId = null;
  if (typeof el.itemDialog.close === "function") {
    el.itemDialog.close();
  } else {
    el.itemDialog.removeAttribute("open");
  }
}

async function toggleItem(id) {
  const item = state.items.find((current) => current.id === id);
  if (!item) return;

  await putOne("items", { ...item, checked: !item.checked });
  await reloadAndRender();
}

async function removeItem(id) {
  if (state.editingItemId === id) {
    state.editingItemId = null;
  }
  await deleteOne("items", id);
  await reloadAndRender();
  showToast("Item removido.");
}

async function saveBudget(event) {
  event.preventDefault();
  const value = parseCurrency(el.budgetInput.value);
  if (!Number.isFinite(value) || value < 0) {
    showToast("Informe um budget válido.");
    return;
  }

  await putOne("settings", { ...state.settings, id: SETTINGS_ID, monthlyBudget: value });
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

  await Promise.all([clearStore("items"), clearStore("purchases"), clearStore("settings")]);
  await putOne("settings", { id: SETTINGS_ID, monthlyBudget: 1200, userName: "", userGender: "neutral" });

  state.editingItemId = null;

  await reloadAndRender();
  setView("dashboardView");
  showToast("Dados resetados.");
}

function toggleTheme(event) {
  const theme = event.currentTarget.checked ? "dark" : "light";
  applyTheme(theme);
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

function openQuickItem() {
  closeFabMenu();
  openItemDialog();
}

function openQuickPurchase() {
  closeFabMenu();
  openCheckout();
}

function openCheckout() {
  el.purchaseTotal.value = "";
  if (typeof el.checkoutDialog.showModal === "function") {
    el.checkoutDialog.showModal();
  } else {
    el.checkoutDialog.setAttribute("open", "");
  }
  setTimeout(() => el.purchaseTotal.focus(), 80);
}

async function finishPurchase(event) {
  event.preventDefault();
  const total = parseCurrency(el.purchaseTotal.value);
  if (!Number.isFinite(total) || total <= 0) {
    showToast("Informe o total da compra.");
    return;
  }

  await putOne("purchases", {
    id: createId(),
    total,
    date: Date.now(),
  });

  await bulkPut(
    "items",
    state.items.map((item) => ({ ...item, checked: false })),
  );

  closeCheckout();
  await reloadAndRender();
  setView("purchaseView");
  showToast("Compra registrada.");
}

function closeCheckout() {
  if (typeof el.checkoutDialog.close === "function") {
    el.checkoutDialog.close();
  } else {
    el.checkoutDialog.removeAttribute("open");
  }
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

function bindEvents() {
  el.navButtons.forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });
  el.itemForm.addEventListener("submit", saveItem);
  el.closeItemDialogButton.addEventListener("click", closeItemDialog);
  el.cancelItemDialogButton.addEventListener("click", closeItemDialog);
  el.budgetForm.addEventListener("submit", saveBudget);
  el.profileForm.addEventListener("submit", saveProfile);
  el.resetDatabaseButton.addEventListener("click", resetDatabase);
  el.themeToggle.addEventListener("change", toggleTheme);
  el.quickAddButton.addEventListener("click", toggleFabMenu);
  el.quickAddItemButton?.addEventListener("click", openQuickItem);
  el.quickAddPurchaseButton?.addEventListener("click", openQuickPurchase);
  el.inlineAddButton.addEventListener("click", openQuickAdd);
  el.viewFullListButton?.addEventListener("click", () => setView("listView"));
  el.viewPurchasesButton?.addEventListener("click", () => setView("purchaseView"));
  el.checkoutForm.addEventListener("submit", finishPurchase);
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
