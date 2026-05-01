const DB_NAME = "feira-db";
const DB_VERSION = 4;
const SETTINGS_ID = "main";
const LOCAL_SPACE_ID = "local";
const ACTIVE_SPACE_STORAGE_KEY = "feira:active-space";
const THEME_STORAGE_KEY = "feira:theme";
const ACCENT_STORAGE_KEY = "feira:accent";
const PROFILE_STORAGE_KEY = "feira:profile";
const EDITOR_MODE_STORAGE_KEY = "feira:editor-mode";
const SUPABASE_CONFIG = globalThis.FEIRA_SUPABASE || {};
const STORE_TO_ENTITY = {
  items: "item",
  categories: "category",
  purchases: "purchase",
  meals: "meal",
  settings: "settings",
};
const ENTITY_TO_STORE = Object.fromEntries(Object.entries(STORE_TO_ENTITY).map(([storeName, entityType]) => [entityType, storeName]));
const VALID_ACCENTS = ["emerald", "green", "sky", "blue", "purple", "fuchsia", "rose", "amber", "teal", "cyan"];
const VIEW_ORDER = ["dashboardView", "listView", "mealsView", "purchaseView", "settingsView"];
const DEFAULT_ITEMS = [
  { name: "Arroz", quantity: "1 pacote" },
  { name: "Feijão", quantity: "1 kg" },
  { name: "Leite", quantity: "2 un" },
  { name: "Café", quantity: "" },
];
const UNCATEGORIZED_ID = "uncategorized";
const DEFAULT_SETTINGS = {
  id: SETTINGS_ID,
  monthlyBudget: 1200,
  cardClosingDay: "",
  userName: "",
  userGender: "neutral",
  editorMode: "modal",
};

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

function localPersonalSettings() {
  let profile = {};
  try {
    profile = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || "{}");
  } catch (error) {
    profile = {};
  }
  return {
    userName: profile.userName || "",
    userGender: profile.userGender || "neutral",
    editorMode: localStorage.getItem(EDITOR_MODE_STORAGE_KEY) || "modal",
  };
}

function saveLocalProfile(userName, userGender) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({ userName, userGender }));
}

applyTheme(getInitialTheme());
applyAccent(getInitialAccent());

const state = {
  db: null,
  supabase: null,
  syncChannel: null,
  items: [],
  categories: [],
  purchases: [],
  meals: [],
  spaces: [],
  syncOutbox: [],
  syncConflicts: [],
  settings: { ...DEFAULT_SETTINGS },
  activeSpaceId: localStorage.getItem(ACTIVE_SPACE_STORAGE_KEY) || LOCAL_SPACE_ID,
  syncStatus: "local",
  activeView: "dashboardView",
  editingItemId: null,
  editingPurchaseId: null,
  editingMealId: null,
  inlineItemEditor: null,
  inlinePurchaseEditor: null,
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

function cssEscape(value) {
  if (globalThis.CSS && typeof globalThis.CSS.escape === "function") {
    return globalThis.CSS.escape(value);
  }
  return String(value).replace(/["\\]/g, "\\$&");
}

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

const el = {
  views: [...document.querySelectorAll(".view")],
  navButtons: [...document.querySelectorAll(".nav-button")],
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
  mealCountLabel: document.querySelector("#mealCountLabel"),
  mealList: document.querySelector("#mealList"),
  emptyMeals: document.querySelector("#emptyMeals"),
  createFirstMealButton: document.querySelector("#createFirstMealButton"),
  resetDatabaseButton: document.querySelector("#resetDatabaseButton"),
  manualRefreshButton: document.querySelector("#manualRefreshButton"),
  themeToggle: document.querySelector("#themeToggle"),
  accentColorInput: document.querySelector("#accentColorInput"),
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
  fabMenu: document.querySelector("#fabMenu"),
  quickAddItemButton: document.querySelector("#quickAddItemButton"),
  quickAddPurchaseButton: document.querySelector("#quickAddPurchaseButton"),
  listMenuButton: document.querySelector("#listMenuButton"),
  listMenu: document.querySelector("#listMenu"),
  openCategoryDialogButton: document.querySelector("#openCategoryDialogButton"),
  addSummaryItemButton: document.querySelector("#addSummaryItemButton"),
  addSummaryPurchaseButton: document.querySelector("#addSummaryPurchaseButton"),
  viewFullListButton: document.querySelector("#viewFullListButton"),
  viewPurchasesButton: document.querySelector("#viewPurchasesButton"),
  refreshButton: document.querySelector("#refreshButton"),
  purchaseInlineEditorMount: document.querySelector("#purchaseInlineEditorMount"),
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
      if (!db.objectStoreNames.contains("meals")) {
        db.createObjectStore("meals", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("categories")) {
        db.createObjectStore("categories", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("spaces")) {
        db.createObjectStore("spaces", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("syncOutbox")) {
        db.createObjectStore("syncOutbox", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("syncMeta")) {
        db.createObjectStore("syncMeta", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("syncConflicts")) {
        db.createObjectStore("syncConflicts", { keyPath: "id" });
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

function activeSettingsId(spaceId = state.activeSpaceId) {
  return `${spaceId}:${SETTINGS_ID}`;
}

function activeSpace() {
  return state.spaces.find((space) => space.id === state.activeSpaceId) || { id: LOCAL_SPACE_ID, name: "Espaço local", type: "local" };
}

function isSharedSpace(space = activeSpace()) {
  return space.id !== LOCAL_SPACE_ID && space.type === "shared";
}

function withSpace(record, spaceId = state.activeSpaceId) {
  return { ...record, spaceId };
}

function normalizeSettings(settings, spaceId = state.activeSpaceId) {
  const personalSettings = localPersonalSettings();
  return {
    ...DEFAULT_SETTINGS,
    ...personalSettings,
    ...(settings || {}),
    ...personalSettings,
    id: activeSettingsId(spaceId),
    spaceId,
  };
}

function normalizeMeal(meal, spaceId = state.activeSpaceId) {
  const now = Date.now();
  const items = Array.isArray(meal?.items)
    ? meal.items
      .map((item) => ({
        id: item.id || createId(),
        name: String(item.name || "").trim(),
        quantity: String(item.quantity || "").trim(),
        createdAt: Number(item.createdAt) || now,
      }))
      .filter((item) => item.name)
    : [];

  return {
    ...(meal || {}),
    id: meal?.id || createId(),
    spaceId,
    name: String(meal?.name || "Refeição").trim() || "Refeição",
    items,
    createdAt: Number(meal?.createdAt) || now,
    updatedAt: Number(meal?.updatedAt) || Number(meal?.createdAt) || now,
  };
}

function normalizeStoreRecord(storeName, value, spaceId = state.activeSpaceId) {
  if (storeName === "meals") return normalizeMeal(value, spaceId);
  return value;
}

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
  const record = withSpace(value);
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

async function seedData() {
  const spaces = await getAll("spaces");
  if (!spaces.some((space) => space.id === LOCAL_SPACE_ID)) {
    await putOne("spaces", {
      id: LOCAL_SPACE_ID,
      name: "Espaço local",
      type: "local",
      createdAt: Date.now(),
    });
  }

  await migrateLocalRecords();

  const settings = await getOne("settings", activeSettingsId(LOCAL_SPACE_ID));
  const isFirstRun = !settings;

  if (isFirstRun) {
    await putOne("settings", normalizeSettings(state.settings, LOCAL_SPACE_ID));
  }

  const items = await getAll("items");
  const localItems = items.filter((item) => (item.spaceId || LOCAL_SPACE_ID) === LOCAL_SPACE_ID);
  if (isFirstRun && !localItems.length) {
    await bulkPut(
      "items",
      DEFAULT_ITEMS.map((item) => ({
        id: createId(),
        spaceId: LOCAL_SPACE_ID,
        name: item.name,
        quantity: item.quantity,
        checked: false,
        createdAt: Date.now(),
      })),
    );
  }
}

async function loadState() {
  const [items, categories, purchases, meals, settings, spaces, syncOutbox, syncConflicts] = await Promise.all([
    getAll("items"),
    getAll("categories"),
    getAll("purchases"),
    getAll("meals"),
    getOne("settings", activeSettingsId()),
    getAll("spaces"),
    getAll("syncOutbox"),
    getAll("syncConflicts"),
  ]);

  if (!spaces.some((space) => space.id === state.activeSpaceId)) {
    state.activeSpaceId = LOCAL_SPACE_ID;
    localStorage.setItem(ACTIVE_SPACE_STORAGE_KEY, state.activeSpaceId);
  }

  state.spaces = spaces.sort((a, b) => (a.type === "local" ? -1 : b.type === "local" ? 1 : a.name.localeCompare(b.name)));
  state.items = items.filter((item) => (item.spaceId || LOCAL_SPACE_ID) === state.activeSpaceId).sort((a, b) => b.createdAt - a.createdAt);
  state.categories = categories.filter((category) => (category.spaceId || LOCAL_SPACE_ID) === state.activeSpaceId).sort((a, b) => a.createdAt - b.createdAt);
  state.purchases = purchases.filter((purchase) => (purchase.spaceId || LOCAL_SPACE_ID) === state.activeSpaceId).sort((a, b) => b.date - a.date);
  state.meals = meals
    .filter((meal) => (meal.spaceId || LOCAL_SPACE_ID) === state.activeSpaceId)
    .map((meal) => normalizeMeal(meal, state.activeSpaceId))
    .sort((a, b) => b.updatedAt - a.updatedAt);
  state.settings = normalizeSettings(settings, state.activeSpaceId);
  state.syncOutbox = syncOutbox.filter((operation) => operation.spaceId === state.activeSpaceId);
  state.syncConflicts = syncConflicts.filter((conflict) => conflict.spaceId === state.activeSpaceId);
}

async function migrateLocalRecords() {
  const [items, categories, purchases, meals, settings] = await Promise.all([getAll("items"), getAll("categories"), getAll("purchases"), getAll("meals"), getAll("settings")]);
  const migratedItems = items.filter((item) => !item.spaceId).map((item) => ({ ...item, spaceId: LOCAL_SPACE_ID }));
  const migratedCategories = categories.filter((category) => !category.spaceId).map((category) => ({ ...category, spaceId: LOCAL_SPACE_ID }));
  const migratedPurchases = purchases.filter((purchase) => !purchase.spaceId).map((purchase) => ({ ...purchase, spaceId: LOCAL_SPACE_ID }));
  const migratedMeals = meals.filter((meal) => !meal.spaceId).map((meal) => ({ ...meal, spaceId: LOCAL_SPACE_ID }));
  const legacySettings = settings.find((setting) => setting.id === SETTINGS_ID);

  if (migratedItems.length) await bulkPut("items", migratedItems);
  if (migratedCategories.length) await bulkPut("categories", migratedCategories);
  if (migratedPurchases.length) await bulkPut("purchases", migratedPurchases);
  if (migratedMeals.length) await bulkPut("meals", migratedMeals);
  if (legacySettings) {
    if (legacySettings.userName || legacySettings.userGender) {
      saveLocalProfile(legacySettings.userName || "", legacySettings.userGender || "neutral");
    }
    if (legacySettings.editorMode) {
      localStorage.setItem(EDITOR_MODE_STORAGE_KEY, legacySettings.editorMode);
    }
    await putOne("settings", normalizeSettings(legacySettings, LOCAL_SPACE_ID));
    await deleteOne("settings", SETTINGS_ID);
  }
}

function monthBounds(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1).getTime();
  return { start, end, labelDate: date, usesClosingDay: false };
}

function billingPeriodBounds(date = new Date(), closingDay = state.settings.cardClosingDay) {
  if (!closingDay) return monthBounds(date);

  const currentDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const currentClosing = closingDateForMonth(closingDay, date.getFullYear(), date.getMonth());
  const startsCurrentCycle = currentDay >= currentClosing;
  const start = startsCurrentCycle ? currentClosing : closingDateForMonth(closingDay, date.getFullYear(), date.getMonth() - 1);
  const end = startsCurrentCycle ? closingDateForMonth(closingDay, date.getFullYear(), date.getMonth() + 1) : currentClosing;
  const labelDate = startsCurrentCycle ? new Date(date.getFullYear(), date.getMonth() + 1, 1) : new Date(date.getFullYear(), date.getMonth(), 1);

  return {
    start: start.getTime(),
    end: end.getTime(),
    labelDate,
    usesClosingDay: true,
  };
}

function currentMonthPurchases() {
  const { start, end } = billingPeriodBounds();
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

function formatLongMonth(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
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

function normalizeItemName(name) {
  return String(name || "").trim().toLowerCase();
}

function mergeQuantity(currentQuantity = "", nextQuantity = "") {
  const current = String(currentQuantity || "").trim();
  const next = String(nextQuantity || "").trim();
  if (!current) return next;
  if (!next || current.toLowerCase() === next.toLowerCase()) return current;
  return `${current} + ${next}`;
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
  if (candidate <= today) {
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
  renderPurchaseSummary();
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

function renderWeeklyBudget(remaining, weeksLeft) {
  if (!el.topbarWeeklyBudget || !el.topbarWeeklyLabel) return;

  if (!weeksLeft) {
    el.topbarWeeklyBudget.textContent = "--";
    el.topbarWeeklyLabel.textContent = "Semana";
    return;
  }

  el.topbarWeeklyBudget.textContent = formatCurrency(remaining / weeksLeft);
  el.topbarWeeklyLabel.textContent = "por semana";
}

function renderProfile() {
  if (el.activeSpaceName) {
    el.activeSpaceName.textContent = activeSpace().name;
  }
}

function renderSpaces() {
  const space = activeSpace();
  const pendingCount = state.syncOutbox.length;
  const conflictCount = state.syncConflicts.length;
  if (el.spaceSwitcherButton) {
    el.spaceSwitcherButton.setAttribute("aria-expanded", String(!el.spaceMenu?.hidden));
  }
  if (el.spaceMenuList) {
    el.spaceMenuList.innerHTML = "";
    state.spaces.forEach((current) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = current.id === state.activeSpaceId ? "is-active" : "";
      button.innerHTML = `
        <span>${escapeHtml(current.name)}</span>
        <small>${current.type === "shared" ? "Compartilhado" : "Local"}</small>
      `;
      button.addEventListener("click", () => switchSpace(current.id));
      el.spaceMenuList.append(button);
    });
  }
  if (el.syncStatusLabel) {
    if (!isSharedSpace(space)) {
      el.syncStatusLabel.textContent = "Local";
    } else if (conflictCount) {
      el.syncStatusLabel.textContent = `${conflictCount} conflito${conflictCount === 1 ? "" : "s"}`;
    } else if (pendingCount) {
      el.syncStatusLabel.textContent = "Sincronizando";
    } else {
      el.syncStatusLabel.textContent = state.syncStatus === "offline" ? "Offline" : "Sincronizado";
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

  row.addEventListener("click", () => openItemEditor(item.id, itemCategoryId(item)));
  row.addEventListener("keydown", (event) => {
    if (event.target !== row) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openItemEditor(item.id, itemCategoryId(item));
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

  el.emptyItems.classList.toggle("is-visible", state.items.length === 0 && !state.inlineItemEditor);
  el.emptySummaryItems.classList.toggle("is-visible", state.items.length === 0);
  if (el.itemCountLabel) {
    el.itemCountLabel.textContent = `${state.items.length} ${state.items.length === 1 ? "item" : "itens"}`;
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

function createMealRow(meal) {
  const row = document.createElement("article");
  row.className = "meal-row";
  const itemCount = Array.isArray(meal.items) ? meal.items.length : 0;
  const preview = (meal.items || [])
    .slice(0, 3)
    .map((item) => item.quantity ? `${item.name} (${item.quantity})` : item.name)
    .join(", ");
  row.innerHTML = `
    <button class="meal-main" type="button" aria-label="Editar ${escapeHtml(meal.name)}">
      <strong>${escapeHtml(meal.name)}</strong>
      <span>${itemCount} ${itemCount === 1 ? "item" : "itens"}${preview ? ` - ${escapeHtml(preview)}` : ""}</span>
    </button>
    <div class="meal-actions">
      <button class="secondary-button meal-copy-button" type="button">
        <i data-lucide="list-plus" aria-hidden="true"></i>
        Adicionar à lista de compras atual
      </button>
    </div>
  `;

  row.querySelector(".meal-main").addEventListener("click", () => openMealEditor(meal.id));
  row.querySelector(".meal-copy-button").addEventListener("click", () => addMealToCurrentList(meal.id));
  return row;
}

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
      <ul class="item-list category-items" id="${listId}" data-collapsed="${isCollapsed}" aria-hidden="${isCollapsed}" style="${isCollapsed ? "height: 0px;" : ""}"></ul>
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

    if (state.inlineItemEditor && !state.inlineItemEditor.id && itemCategoryId({ categoryId: state.inlineItemEditor.categoryId }) === category.id) {
      list.append(createItemInlineEditor(null, category.id));
    }

    items.forEach((item) => {
      if (state.inlineItemEditor?.id === item.id) {
        list.append(createItemInlineEditor(item, category.id));
        return;
      }
      list.append(createItemRow(item, { removable: true, draggable: true }));
    });

    if (!items.length && !hasInlineNewItem) {
      const empty = document.createElement("li");
      empty.className = "category-empty";
      empty.textContent = "Arraste itens para esta seção.";
      list.append(empty);
    }

    section.querySelector(".category-toggle").addEventListener("click", () => toggleCategory(category.id));
    section.querySelector(".category-add-button").addEventListener("click", () => openItemEditor(null, category.id));
    el.itemList.append(section);
  });
}

function renderNavigation() {
  el.views.forEach((view) => view.classList.toggle("is-active", view.id === state.activeView));
  el.navButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.view === state.activeView));
  if (el.quickAddButton) {
    el.quickAddButton.hidden = state.activeView === "settingsView";
  }
}

function renderSettings() {
  el.themeToggle.checked = document.documentElement.dataset.theme === "dark";
  if (el.accentColorInput) {
    el.accentColorInput.value = document.documentElement.dataset.accent || "emerald";
  }
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
}

function renderIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function render() {
  renderDashboard();
  renderItems();
  renderMeals();
  renderNavigation();
  renderSettings();
  renderSpaces();
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

function toggleSpaceMenu() {
  if (!el.spaceMenu) return;
  el.spaceMenu.hidden = !el.spaceMenu.hidden;
  renderSpaces();
}

function closeSpaceMenu() {
  if (!el.spaceMenu) return;
  el.spaceMenu.hidden = true;
  renderSpaces();
}

async function switchSpace(spaceId) {
  if (spaceId === state.activeSpaceId) {
    closeSpaceMenu();
    return;
  }
  state.activeSpaceId = spaceId;
  localStorage.setItem(ACTIVE_SPACE_STORAGE_KEY, spaceId);
  state.editingItemId = null;
  state.editingPurchaseId = null;
  state.inlineItemEditor = null;
  state.inlinePurchaseEditor = null;
  state.pendingItemCategoryId = "";
  state.collapsedCategoryIds.clear();
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

  const { data } = await state.supabase.auth.getSession();
  if (!data.session) {
    const { error } = await state.supabase.auth.signInAnonymously();
    if (error) {
      console.info("Falha ao autenticar anonimamente no Supabase.", error);
      showToast("Não foi possível conectar ao compartilhamento.");
      return null;
    }
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
  const pending = (await getAll("syncOutbox")).some((operation) => operation.spaceId === record.space_id && operation.entityType === record.entity_type && operation.entityId === record.entity_id);
  if (pending) {
    await createConflict(record, mapped.value);
    return;
  }

  if (record.deleted_at) {
    await deleteOne(mapped.storeName, mapped.value.id);
  } else {
    if (mapped.storeName === "settings") {
      const currentSettings = await getOne("settings", mapped.value.id);
      await putOne("settings", normalizeSettings({ ...(currentSettings || {}), ...mapped.value }, record.space_id));
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
        state.syncStatus = navigator.onLine ? "offline" : "offline";
        failed = true;
        break;
      }

      const result = Array.isArray(data) ? data[0] : data;
      if (result?.status === "conflict") {
        const remoteRecord = result.remote_record || result.record;
        if (remoteRecord) {
          const mapped = fromRemoteRecord(remoteRecord);
          await createConflict(remoteRecord, mapped?.value || null);
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
    card.className = "conflict-card";
    card.innerHTML = `
      <h3>${escapeHtml(conflict.entityType)} ${escapeHtml(conflict.entityId)}</h3>
      <div class="conflict-versions">
        <div class="conflict-version">
          <span>Local</span>
          <pre>${escapeHtml(JSON.stringify(conflict.local, null, 2))}</pre>
        </div>
        <div class="conflict-version">
          <span>Nuvem</span>
          <pre>${escapeHtml(JSON.stringify(conflict.remote, null, 2))}</pre>
        </div>
      </div>
      <div class="conflict-actions">
        <button class="secondary-button" type="button" data-resolution="cloud">Usar nuvem</button>
        <button class="primary-dialog-button" type="button" data-resolution="local">Usar local</button>
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

  row.addEventListener("click", () => openPurchaseEditor(purchase.id));
  row.addEventListener("keydown", (event) => {
    if (event.target !== row) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPurchaseEditor(purchase.id);
    }
  });

  return row;
}

function editorMode() {
  return state.settings.editorMode === "inline" ? "inline" : "modal";
}

function createInlineActionButton(label, variant = "secondary") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = variant === "primary" ? "primary-dialog-button" : "secondary-button";
  button.textContent = label;
  return button;
}

function createItemInlineEditor(item = null, categoryId = "") {
  const row = document.createElement("li");
  row.className = "inline-editor-row item-inline-editor";
  const form = document.createElement("form");
  form.className = "inline-editor-form";
  form.innerHTML = `
    <input name="name" autocomplete="off" placeholder="Item" required value="${escapeHtml(item?.name || "")}" />
    <input name="quantity" autocomplete="off" placeholder="Quantidade" value="${escapeHtml(item?.quantity || "")}" />
    <div class="inline-editor-actions"></div>
  `;

  const actions = form.querySelector(".inline-editor-actions");
  const cancelButton = createInlineActionButton("Cancelar");
  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.className = "primary-dialog-button";
  saveButton.textContent = item ? "Salvar" : "Adicionar";
  actions.append(cancelButton);
  if (item) {
    const deleteButton = createInlineActionButton("Excluir", "danger");
    deleteButton.className = "danger-text-button inline-delete-button";
    deleteButton.addEventListener("click", () => removeItem(item.id));
    actions.append(deleteButton);
  }
  actions.append(saveButton);

  cancelButton.addEventListener("click", closeInlineItemEditor);
  form.addEventListener("submit", (event) => saveInlineItem(event, item?.id || null, categoryId));

  row.append(form);
  return row;
}

function createPurchaseInlineEditor(purchase = null) {
  const row = document.createElement("li");
  row.className = "inline-editor-row purchase-inline-editor";
  const form = document.createElement("form");
  form.className = "inline-editor-form purchase-inline-form";
  form.innerHTML = `
    <input name="name" autocomplete="off" placeholder="Nome da compra" value="${escapeHtml(purchase?.name || "")}" />
    <input name="date" type="date" required value="${formatDateInput(purchase?.date || Date.now())}" />
    <input name="total" inputmode="decimal" autocomplete="off" placeholder="Valor pago" required value="${purchase ? escapeHtml(String(purchase.total).replace(".", ",")) : ""}" />
    <div class="inline-editor-actions"></div>
  `;

  const actions = form.querySelector(".inline-editor-actions");
  const cancelButton = createInlineActionButton("Cancelar");
  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.className = "primary-dialog-button";
  saveButton.textContent = purchase ? "Salvar" : "Registrar";
  actions.append(cancelButton);
  if (purchase) {
    const deleteButton = createInlineActionButton("Excluir", "danger");
    deleteButton.className = "danger-text-button inline-delete-button";
    deleteButton.addEventListener("click", () => removePurchase(purchase.id));
    actions.append(deleteButton);
  }
  actions.append(saveButton);

  cancelButton.addEventListener("click", closeInlinePurchaseEditor);
  form.addEventListener("submit", (event) => saveInlinePurchase(event, purchase?.id || null));

  row.append(form);
  return row;
}

function createMealItemEditorRow(item = {}) {
  const row = document.createElement("div");
  row.className = "meal-item-editor-row";
  row.dataset.itemId = item.id || createId();
  row.dataset.createdAt = item.createdAt || Date.now();
  row.innerHTML = `
    <input name="mealItemName" autocomplete="off" placeholder="Item" value="${escapeHtml(item.name || "")}" />
    <input name="mealItemQuantity" autocomplete="off" placeholder="Quantidade" value="${escapeHtml(item.quantity || "")}" />
    <button class="icon-button meal-item-remove-button" type="button" aria-label="Remover item">
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

function addMealItemEditorRow(item = {}) {
  if (!el.mealItemsEditor) return;
  el.mealItemsEditor.append(createMealItemEditorRow(item));
  renderIcons();
}

function focusDialogInput(input) {
  //return;
  if (!input) return;
  input.focus({ preventScroll: true });
  requestAnimationFrame(() => input.focus({ preventScroll: true }));
}

function focusInlineEditor() {
  requestAnimationFrame(() => {
    document.querySelector(".inline-editor-form input")?.focus({ preventScroll: true });
  });
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
    await saveRecord("items", { ...item, name, quantity });
  } else {
    await saveRecord("items", {
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

function openItemEditor(id = null, categoryId = "") {
  closeFabMenu();
  closeListMenu();
  const normalizedCategoryId = categoryId === UNCATEGORIZED_ID ? "" : categoryId;
  if (editorMode() !== "inline") {
    openItemDialog(id, normalizedCategoryId);
    return;
  }

  if (state.activeView !== "listView") {
    setView("listView");
  }
  state.inlinePurchaseEditor = null;
  state.inlineItemEditor = { id, categoryId: normalizedCategoryId };
  renderItems();
  renderIcons();
  focusInlineEditor();
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
  if (item) {
    await saveRecord("items", { ...item, name, quantity });
  } else {
    await saveRecord("items", {
      id: createId(),
      name,
      quantity,
      categoryId: categoryId === UNCATEGORIZED_ID ? "" : categoryId,
      checked: false,
      createdAt: Date.now(),
    });
  }

  state.inlineItemEditor = null;
  await reloadAndRender();
  showToast(item ? "Item atualizado." : "Item adicionado.");
}

function openItemDialog(id = null, categoryId = "") {
  state.inlineItemEditor = null;
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

function openMealEditor(id = null) {
  closeFabMenu();
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
  focusDialogInput(el.mealName);
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

    const newItem = {
      id: createId(),
      name: mealItem.name.trim(),
      quantity: mealItem.quantity || "",
      categoryId: "",
      checked: false,
      createdAt: Date.now() + addedCount,
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
  const shouldExpand = state.collapsedCategoryIds.has(id);
  if (shouldExpand) {
    state.collapsedCategoryIds.delete(id);
  } else {
    state.collapsedCategoryIds.add(id);
  }

  const section = el.itemList.querySelector(`.category-section[data-category-id="${cssEscape(id)}"]`);
  const toggle = section?.querySelector(".category-toggle");
  const icon = toggle?.querySelector("i");
  const list = section?.querySelector(".category-items");
  if (!section || !toggle || !icon || !list) {
    renderItems();
    renderIcons();
    return;
  }

  toggle.setAttribute("aria-expanded", String(shouldExpand));
  icon.setAttribute("data-lucide", shouldExpand ? "chevron-down" : "chevron-right");
  animateCategoryList(list, shouldExpand);
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
    target?.querySelector(".category-items:not([data-collapsed='true'])")?.classList.add("is-drop-target");
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

  await saveRecord("items", { ...item, categoryId: normalizedCategoryId });
  await reloadAndRender();
  showToast("Item movido.");
}

async function toggleItem(id) {
  const item = state.items.find((current) => current.id === id);
  if (!item) return;

  await saveRecord("items", { ...item, checked: !item.checked });
  await reloadAndRender();
}

async function removeItem(id) {
  if (!id) return;
  const confirmed = window.confirm("Excluir este item?");
  if (!confirmed) return;

  if (state.editingItemId === id) {
    state.editingItemId = null;
  }
  if (state.inlineItemEditor?.id === id) {
    state.inlineItemEditor = null;
  }
  await deleteRecord("items", id);
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

  await saveRecord("settings", normalizeSettings({ ...state.settings, monthlyBudget: value, cardClosingDay }));
  await reloadAndRender();
  showToast("Budget atualizado.");
}

async function saveProfile(event) {
  event.preventDefault();
  const userName = el.userNameInput.value.trim();

  saveLocalProfile(userName, "neutral");
  await putOne("settings", normalizeSettings({ ...state.settings, userName, userGender: "neutral" }));
  await reloadAndRender();
  showToast("Perfil atualizado.");
}

async function changeEditorMode(event) {
  const editorModeValue = event.currentTarget.value === "inline" ? "inline" : "modal";
  state.inlineItemEditor = null;
  state.inlinePurchaseEditor = null;
  localStorage.setItem(EDITOR_MODE_STORAGE_KEY, editorModeValue);
  await putOne("settings", normalizeSettings({ ...state.settings, editorMode: editorModeValue }));
  await reloadAndRender();
  showToast(editorModeValue === "inline" ? "Editor inline ativado." : "Editor em modal ativado.");
}

async function resetDatabase() {
  const confirmed = window.confirm("Tem certeza que deseja apagar os dados deste espaço e começar do zero?");
  if (!confirmed) return;

  await Promise.all([
    ...state.items.map((item) => deleteRecord("items", item.id)),
    ...state.categories.map((category) => deleteRecord("categories", category.id)),
    ...state.purchases.map((purchase) => deleteRecord("purchases", purchase.id)),
    ...state.meals.map((meal) => deleteRecord("meals", meal.id)),
  ]);
  await saveRecord("settings", normalizeSettings({ ...state.settings, monthlyBudget: DEFAULT_SETTINGS.monthlyBudget, cardClosingDay: "" }));

  state.editingItemId = null;
  state.editingPurchaseId = null;
  state.editingMealId = null;
  state.inlineItemEditor = null;
  state.inlinePurchaseEditor = null;
  state.pendingItemCategoryId = "";
  state.collapsedCategoryIds.clear();

  await reloadAndRender();
  setView("dashboardView");
  showToast("Espaço resetado.");
}

function toggleTheme(event) {
  const theme = event.currentTarget.checked ? "dark" : "light";
  applyTheme(theme);
}

function changeAccent(event) {
  applyAccent(event.currentTarget.value);
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
  if (state.activeView === "dashboardView") {
    toggleFabMenu();
  }
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
  openItemEditor();
}

function openQuickPurchase() {
  closeFabMenu();
  openPurchaseEditor();
}

function openPurchaseEditor(id = null) {
  closeFabMenu();
  if (editorMode() !== "inline") {
    openCheckout(id);
    return;
  }

  if (state.activeView !== "purchaseView") {
    setView("purchaseView");
  }
  state.inlineItemEditor = null;
  state.inlinePurchaseEditor = { id };
  renderDashboard();
  renderIcons();
  focusInlineEditor();
}

function closeInlinePurchaseEditor() {
  state.inlinePurchaseEditor = null;
  renderDashboard();
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

function openCheckout(id = null) {
  state.inlinePurchaseEditor = null;
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
  el.topbarRefreshButton?.addEventListener("click", refreshApp);
  el.themeToggle.addEventListener("change", toggleTheme);
  el.accentColorInput?.addEventListener("change", changeAccent);
  el.editorModeInput?.addEventListener("change", changeEditorMode);
  el.spaceSwitcherButton?.addEventListener("click", toggleSpaceMenu);
  el.createSpaceForm?.addEventListener("submit", createSharedSpace);
  el.joinSpaceForm?.addEventListener("submit", joinSharedSpace);
  el.renameSpaceButton?.addEventListener("click", renameCurrentSpace);
  el.copyInviteButton?.addEventListener("click", copyInviteCode);
  el.openConflictsButton?.addEventListener("click", openConflictDialog);
  el.closeConflictDialogButton?.addEventListener("click", closeConflictDialog);
  window.addEventListener("online", () => syncNow());
  el.quickAddButton.addEventListener("click", handleFabButton);
  el.quickAddItemButton?.addEventListener("click", openQuickItem);
  el.quickAddPurchaseButton?.addEventListener("click", openQuickPurchase);
  el.listMenuButton?.addEventListener("click", toggleListMenu);
  el.openCategoryDialogButton?.addEventListener("click", openCategoryDialog);
  document.addEventListener("click", (event) => {
    if (el.spaceMenu && !el.spaceMenu.hidden && !event.target.closest(".space-switcher-wrap")) {
      closeSpaceMenu();
    }
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
  el.refreshButton.addEventListener("click", () => openPurchaseEditor());
  el.createFirstMealButton?.addEventListener("click", () => openMealEditor());
  el.mealForm?.addEventListener("submit", saveMeal);
  el.addMealItemButton?.addEventListener("click", () => addMealItemEditorRow());
  el.deleteMealButton?.addEventListener("click", () => removeMeal(state.editingMealId));
  el.closeMealDialogButton?.addEventListener("click", closeMealDialog);
  el.cancelMealDialogButton?.addEventListener("click", closeMealDialog);
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
    if (supabaseConfigured()) {
      await ensureSupabase();
      await pullSpaceRecords();
      subscribeToSpace();
      syncNow();
    }
    registerServiceWorker();
  } catch (error) {
    console.error(error);
    showToast("Não foi possível iniciar o app.");
  }
}

init();
