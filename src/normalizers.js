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

function normalizeItem(item, spaceId = state.activeSpaceId) {
  const now = Date.now();
  const createdAt = Number(item?.createdAt);
  const sortOrder = Number(item?.sortOrder);
  const safeCreatedAt = Number.isFinite(createdAt) ? createdAt : now;
  return {
    ...(item || {}),
    id: item?.id || createId(),
    spaceId,
    name: String(item?.name || "").trim(),
    quantity: String(item?.quantity || "").trim(),
    categoryId: String(item?.categoryId || "").trim(),
    checked: item?.checked === true,
    createdAt: safeCreatedAt,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : safeCreatedAt,
  };
}

function normalizePurchase(purchase, spaceId = state.activeSpaceId) {
  const now = Date.now();
  const date = Number(purchase?.date);
  const createdAt = Number(purchase?.createdAt);
  const startedAt = Number(purchase?.startedAt);
  const completedAt = Number(purchase?.completedAt);
  const durationMs = Number(purchase?.durationMs);
  const items = Array.isArray(purchase?.items)
    ? purchase.items
      .map((item) => ({
        itemId: String(item.itemId || item.id || "").trim(),
        name: String(item.name || "").trim(),
        quantity: String(item.quantity || "").trim(),
        categoryId: String(item.categoryId || "").trim(),
        categoryName: String(item.categoryName || "Sem seção").trim() || "Sem seção",
        checkedAt: Number(item.checkedAt) || Number(item.createdAt) || now,
      }))
      .filter((item) => item.itemId && item.name)
    : [];
  return {
    ...(purchase || {}),
    id: purchase?.id || createId(),
    spaceId,
    name: String(purchase?.name || "").trim(),
    total: Number(purchase?.total) || 0,
    date: Number.isFinite(date) ? date : now,
    createdAt: Number.isFinite(createdAt) ? createdAt : (Number.isFinite(date) ? date : now),
    ...(Number.isFinite(startedAt) ? { startedAt } : {}),
    ...(Number.isFinite(completedAt) ? { completedAt } : {}),
    ...(Number.isFinite(durationMs) ? { durationMs } : {}),
    ...(items.length ? { items } : {}),
  };
}

function normalizePurchaseSession(session, spaceId = state.activeSpaceId) {
  const now = Date.now();
  const startedAt = Number(session?.startedAt);
  const completedAt = Number(session?.completedAt);
  const updatedAt = Number(session?.updatedAt);
  const status = ["active", "completed", "cancelled"].includes(session?.status) ? session.status : "active";
  const checkedItems = Array.isArray(session?.checkedItems)
    ? session.checkedItems
      .map((item) => ({
        itemId: String(item.itemId || item.id || "").trim(),
        checkedAt: Number(item.checkedAt) || now,
      }))
      .filter((item) => item.itemId)
    : [];
  return {
    ...(session || {}),
    id: session?.id || createId(),
    spaceId,
    status,
    startedAt: Number.isFinite(startedAt) ? startedAt : now,
    ...(Number.isFinite(completedAt) ? { completedAt } : {}),
    updatedAt: Number.isFinite(updatedAt) ? updatedAt : now,
    checkedItems,
  };
}

function normalizeStoreRecord(storeName, value, spaceId = state.activeSpaceId) {
  if (storeName === "items") return normalizeItem(value, spaceId);
  if (storeName === "purchases") return normalizePurchase(value, spaceId);
  if (storeName === "purchaseSessions") return normalizePurchaseSession(value, spaceId);
  if (storeName === "meals") return normalizeMeal(value, spaceId);
  return value;
}
