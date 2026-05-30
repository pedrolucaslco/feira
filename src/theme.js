function getInitialTheme() {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  const mode = theme === "dark" ? "dark" : "light";
  localStorage.setItem(THEME_STORAGE_KEY, mode);
  applyDaisyTheme(mode);
}

function getStoredThemeMode() {
  return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
}

function applyDaisyTheme(mode = getStoredThemeMode()) {
  document.documentElement.dataset.mode = mode;
  document.documentElement.dataset.theme = mode === "dark" ? "dim" : "emerald";
  updateThemeColor();
}

function updateThemeColor() {
  const accent = getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim();
  const mode = document.documentElement.dataset.mode === "dark" ? "dark" : "light";
  document.querySelector("#themeColorMeta")?.setAttribute("content", mode === "dark" ? "#1f2937" : accent || "#059669");
}

function toggleTheme(event) {
  const theme = event.currentTarget.checked ? "dark" : "light";
  applyTheme(theme);
}
