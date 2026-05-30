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

function renderSpaces() {
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

function toggleSpaceMenu() {
  if (!el.spaceMenu) {
    console.error("[SPACE MENU] spaceMenu element not found!");
    return;
  }
  renderSpaces();
  el.spaceMenu.showModal();
}

function closeSpaceMenu() {
  if (!el.spaceMenu) {
    console.error("[SPACE MENU] spaceMenu element not found!");
    return;
  }
  el.spaceMenu.close();
}

async function switchSpace(spaceId) {
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
