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

  if (cardClosingDay) {
    setMonthlyClosingDay(cardClosingDay);
  }

  await saveRecord("settings", {
    ...state.settings,
    monthlyBudget,
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
