var state = {
  db: null,
  supabase: null,
  syncChannel: null,
  items: [],
  categories: [],
  purchases: [],
  purchaseSessions: [],
  meals: [],
  spaces: [],
  syncOutbox: [],
  syncConflicts: [],
  settings: { ...DEFAULT_SETTINGS },
  activeSpaceId: localStorage.getItem(ACTIVE_SPACE_STORAGE_KEY) || LOCAL_SPACE_ID,
  syncStatus: "local",
  activeView: "listView",
  editingItemId: null,
  editingPurchaseId: null,
  finishingPurchaseSessionId: null,
  purchaseTimerId: 0,
  editingMealId: null,
  inlineItemEditor: null,
  inlinePurchaseEditor: null,
  pendingItemCategoryId: "",
  editingCategoryId: null,
  pendingDeleteCategoryId: "",
  reorderCategoryIds: [],
  collapsedCategoryIds: new Set(),
  manuallyToggledCategoryIds: new Set(),
  draggingItemId: null,
  dragTargetItemId: "",
  dragTargetCategoryId: "",
  dragTargetPlacement: "after",
  suppressItemClickId: "",
};

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
      DEFAULT_ITEMS.map((item, index) => {
        const createdAt = Date.now() + index;
        return {
          id: createId(),
          spaceId: LOCAL_SPACE_ID,
          name: item.name,
          quantity: item.quantity,
          checked: false,
          createdAt,
          sortOrder: createdAt,
        };
      }),
    );
  }
}

async function loadState() {
  const [items, categories, purchases, purchaseSessions, meals, settings, spaces, syncOutbox, syncConflicts] = await Promise.all([
    getAll("items"),
    getAll("categories"),
    getAll("purchases"),
    getAll("purchaseSessions"),
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
  state.items = items
    .filter((item) => (item.spaceId || LOCAL_SPACE_ID) === state.activeSpaceId)
    .map((item) => normalizeItem(item, state.activeSpaceId))
    .sort((a, b) => (b.sortOrder - a.sortOrder) || (b.createdAt - a.createdAt));
  state.categories = categories.filter((category) => (category.spaceId || LOCAL_SPACE_ID) === state.activeSpaceId).sort((a, b) => a.createdAt - b.createdAt);
  state.purchases = purchases
    .filter((purchase) => (purchase.spaceId || LOCAL_SPACE_ID) === state.activeSpaceId)
    .map((purchase) => normalizePurchase(purchase, state.activeSpaceId))
    .sort((a, b) => (b.createdAt - a.createdAt) || (b.date - a.date));
  state.purchaseSessions = purchaseSessions
    .filter((session) => (session.spaceId || LOCAL_SPACE_ID) === state.activeSpaceId)
    .map((session) => normalizePurchaseSession(session, state.activeSpaceId))
    .sort((a, b) => b.startedAt - a.startedAt);
  state.meals = meals
    .filter((meal) => (meal.spaceId || LOCAL_SPACE_ID) === state.activeSpaceId)
    .map((meal) => normalizeMeal(meal, state.activeSpaceId))
    .sort((a, b) => b.updatedAt - a.updatedAt);
  state.settings = normalizeSettings(settings, state.activeSpaceId);
  state.syncOutbox = syncOutbox.filter((operation) => operation.spaceId === state.activeSpaceId);
  state.syncConflicts = syncConflicts.filter((conflict) => conflict.spaceId === state.activeSpaceId);
}

async function migrateLocalRecords() {
  const [items, categories, purchases, purchaseSessions, meals, settings] = await Promise.all([getAll("items"), getAll("categories"), getAll("purchases"), getAll("purchaseSessions"), getAll("meals"), getAll("settings")]);
  const migratedItems = items
    .filter((item) => !item.spaceId || !Number.isFinite(Number(item.sortOrder)))
    .map((item) => normalizeItem({ ...item, spaceId: item.spaceId || LOCAL_SPACE_ID }, item.spaceId || LOCAL_SPACE_ID));
  const migratedCategories = categories.filter((category) => !category.spaceId).map((category) => ({ ...category, spaceId: LOCAL_SPACE_ID }));
  const migratedPurchases = purchases
    .filter((purchase) => !purchase.spaceId || !Number.isFinite(Number(purchase.createdAt)))
    .map((purchase) => normalizePurchase({ ...purchase, spaceId: purchase.spaceId || LOCAL_SPACE_ID }, purchase.spaceId || LOCAL_SPACE_ID));
  const migratedMeals = meals.filter((meal) => !meal.spaceId).map((meal) => ({ ...meal, spaceId: LOCAL_SPACE_ID }));
  const migratedPurchaseSessions = purchaseSessions
    .filter((session) => !session.spaceId)
    .map((session) => normalizePurchaseSession({ ...session, spaceId: LOCAL_SPACE_ID }, LOCAL_SPACE_ID));
  const legacySettings = settings.find((setting) => setting.id === SETTINGS_ID);

  if (migratedItems.length) await bulkPut("items", migratedItems);
  if (migratedCategories.length) await bulkPut("categories", migratedCategories);
  if (migratedPurchases.length) await bulkPut("purchases", migratedPurchases);
  if (migratedMeals.length) await bulkPut("meals", migratedMeals);
  if (migratedPurchaseSessions.length) await bulkPut("purchaseSessions", migratedPurchaseSessions);
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

async function reloadAndRender() {
  await loadState();
  render();
}
