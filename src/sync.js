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
