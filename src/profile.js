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
