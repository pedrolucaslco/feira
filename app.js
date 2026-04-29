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
  settings: { id: SETTINGS_ID, monthlyBudget: 1200 },
  activeView: "dashboardView",
  editingItemId: null,
  purchaseActive: localStorage.getItem("feira:purchaseActive") === "true",
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
  headerBalance: document.querySelector("#headerBalance"),
  monthLabel: document.querySelector("#monthLabel"),
  remainingBalance: document.querySelector("#remainingBalance"),
  spentMonth: document.querySelector("#spentMonth"),
  monthlyBudget: document.querySelector("#monthlyBudget"),
  purchaseCount: document.querySelector("#purchaseCount"),
  averagePurchase: document.querySelector("#averagePurchase"),
  purchaseList: document.querySelector("#purchaseList"),
  emptyPurchases: document.querySelector("#emptyPurchases"),
  budgetForm: document.querySelector("#budgetForm"),
  budgetInput: document.querySelector("#budgetInput"),
  itemForm: document.querySelector("#itemForm"),
  itemName: document.querySelector("#itemName"),
  itemQuantity: document.querySelector("#itemQuantity"),
  itemList: document.querySelector("#itemList"),
  activeItemList: document.querySelector("#activeItemList"),
  emptyItems: document.querySelector("#emptyItems"),
  emptyActiveItems: document.querySelector("#emptyActiveItems"),
  startPurchaseButton: document.querySelector("#startPurchaseButton"),
  cancelPurchaseButton: document.querySelector("#cancelPurchaseButton"),
  finishPurchaseButton: document.querySelector("#finishPurchaseButton"),
  resetDatabaseButton: document.querySelector("#resetDatabaseButton"),
  themeToggle: document.querySelector("#themeToggle"),
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

  state.items = items.sort((a, b) => a.createdAt - b.createdAt);
  state.purchases = purchases.sort((a, b) => b.date - a.date);
  state.settings = settings || state.settings;
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
  el.headerBalance.textContent = formatCurrency(remaining);
  el.remainingBalance.textContent = formatCurrency(remaining);
  el.spentMonth.textContent = formatCurrency(spent);
  el.monthlyBudget.textContent = formatCurrency(budget);
  el.purchaseCount.textContent = String(monthPurchases.length);
  el.averagePurchase.textContent = `Média ${formatCurrency(average)}`;
  el.budgetInput.value = budget ? String(budget).replace(".", ",") : "";

  el.purchaseList.innerHTML = "";
  monthPurchases.slice(0, 6).forEach((purchase, index) => {
    const row = document.createElement("li");
    row.className = "purchase-row";
    row.innerHTML = `
      <div>
        <strong>Compra #${monthPurchases.length - index}</strong>
        <span>${formatDate(purchase.date)}</span>
      </div>
      <strong>${formatCurrency(purchase.total)}</strong>
    `;
    el.purchaseList.append(row);
  });

  el.emptyPurchases.classList.toggle("is-visible", monthPurchases.length === 0);
}

function createItemRow(item, { removable }) {
  if (removable && state.editingItemId === item.id) {
    return createEditableItemRow(item);
  }

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
    editButton.addEventListener("click", () => startEditingItem(item.id));
  }
  const deleteButton = row.querySelector(".delete-button");
  if (deleteButton) {
    deleteButton.addEventListener("click", () => removeItem(item.id));
  }

  return row;
}

function createEditableItemRow(item) {
  const row = document.createElement("li");
  row.className = "item-row edit-row";
  row.innerHTML = `
    <form class="edit-item-form">
      <label>
        <span>Item</span>
        <input name="name" autocomplete="off" value="${escapeHtml(item.name)}" required />
      </label>
      <label>
        <span>Quantidade</span>
        <input name="quantity" autocomplete="off" value="${escapeHtml(item.quantity || "")}" placeholder="2 kg" />
      </label>
      <div class="edit-actions">
        <button class="secondary-button" type="button" data-action="cancel">Cancelar</button>
        <button class="save-item-button" type="submit">Salvar</button>
      </div>
    </form>
  `;

  const form = row.querySelector(".edit-item-form");
  const cancelButton = row.querySelector('[data-action="cancel"]');
  form.addEventListener("submit", (event) => saveEditedItem(event, item.id));
  cancelButton.addEventListener("click", cancelEditingItem);
  setTimeout(() => form.elements.name.focus(), 0);

  return row;
}

function renderItems() {
  el.itemList.innerHTML = "";
  el.activeItemList.innerHTML = "";

  state.items.forEach((item) => {
    el.itemList.append(createItemRow(item, { removable: true }));
    el.activeItemList.append(createItemRow(item, { removable: false }));
  });

  el.emptyItems.classList.toggle("is-visible", state.items.length === 0);
  el.emptyActiveItems.classList.toggle("is-visible", state.items.length === 0);
  el.finishPurchaseButton.disabled = state.items.length === 0;
}

function renderNavigation() {
  el.views.forEach((view) => view.classList.toggle("is-active", view.id === state.activeView));
  el.navButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.view === state.activeView));
}

function renderSettings() {
  el.themeToggle.checked = document.documentElement.dataset.theme === "dark";
}

function render() {
  renderDashboard();
  renderItems();
  renderNavigation();
  renderSettings();
}

function setView(viewId) {
  state.activeView = viewId;
  renderNavigation();
}

async function addItem(event) {
  event.preventDefault();
  const name = el.itemName.value.trim();
  const quantity = el.itemQuantity.value.trim();
  if (!name) return;

  await putOne("items", {
    id: createId(),
    name,
    quantity,
    checked: false,
    createdAt: Date.now(),
  });

  el.itemForm.reset();
  await reloadAndRender();
  showToast("Item adicionado.");
}

function startEditingItem(id) {
  state.editingItemId = id;
  renderItems();
}

function cancelEditingItem() {
  state.editingItemId = null;
  renderItems();
}

async function saveEditedItem(event, id) {
  event.preventDefault();
  const item = state.items.find((current) => current.id === id);
  if (!item) return;

  const form = event.currentTarget;
  const name = form.elements.name.value.trim();
  const quantity = form.elements.quantity.value.trim();
  if (!name) {
    showToast("Informe o nome do item.");
    return;
  }

  await putOne("items", { ...item, name, quantity });
  state.editingItemId = null;
  await reloadAndRender();
  showToast("Item atualizado.");
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

  await putOne("settings", { id: SETTINGS_ID, monthlyBudget: value });
  await reloadAndRender();
  showToast("Budget atualizado.");
}

async function resetDatabase() {
  const confirmed = window.confirm("Tem certeza que deseja apagar todos os dados e começar do zero?");
  if (!confirmed) return;

  await Promise.all([clearStore("items"), clearStore("purchases"), clearStore("settings")]);
  await putOne("settings", { id: SETTINGS_ID, monthlyBudget: 1200 });

  state.editingItemId = null;
  state.purchaseActive = false;
  localStorage.setItem("feira:purchaseActive", "false");

  await reloadAndRender();
  setView("dashboardView");
  showToast("Dados resetados.");
}

function toggleTheme(event) {
  const theme = event.currentTarget.checked ? "dark" : "light";
  applyTheme(theme);
}

function startPurchase() {
  state.purchaseActive = true;
  localStorage.setItem("feira:purchaseActive", "true");
  setView("purchaseView");
}

function cancelPurchase() {
  state.purchaseActive = false;
  localStorage.setItem("feira:purchaseActive", "false");
  setView("dashboardView");
}

function openCheckout() {
  if (!state.items.length) {
    showToast("Adicione itens antes de finalizar.");
    return;
  }

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

  state.purchaseActive = false;
  localStorage.setItem("feira:purchaseActive", "false");
  closeCheckout();
  await reloadAndRender();
  setView("dashboardView");
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
  el.itemForm.addEventListener("submit", addItem);
  el.budgetForm.addEventListener("submit", saveBudget);
  el.resetDatabaseButton.addEventListener("click", resetDatabase);
  el.themeToggle.addEventListener("change", toggleTheme);
  el.startPurchaseButton.addEventListener("click", startPurchase);
  el.cancelPurchaseButton.addEventListener("click", cancelPurchase);
  el.finishPurchaseButton.addEventListener("click", openCheckout);
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
    if (state.purchaseActive) setView("purchaseView");
    registerServiceWorker();
  } catch (error) {
    console.error(error);
    showToast("Não foi possível iniciar o app.");
  }
}

init();
