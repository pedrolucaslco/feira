const DB_NAME = "feira-db";
const DB_VERSION = 5;
const SETTINGS_ID = "main";
const LOCAL_SPACE_ID = "local";
const ACTIVE_SPACE_STORAGE_KEY = "feira:active-space";
const THEME_STORAGE_KEY = "feira:theme";
const PROFILE_STORAGE_KEY = "feira:profile";
const EDITOR_MODE_STORAGE_KEY = "feira:editor-mode";
const SUPABASE_CONFIG = globalThis.FEIRA_SUPABASE || {};
const STORE_TO_ENTITY = {
  items: "item",
  categories: "category",
  purchases: "purchase",
  purchaseSessions: "purchase_session",
  meals: "meal",
  settings: "settings",
};
const ENTITY_TO_STORE = Object.fromEntries(Object.entries(STORE_TO_ENTITY).map(([storeName, entityType]) => [entityType, storeName]));
const VIEW_ORDER = ["quickNoteView", "listView", "mealsView", "purchaseView", "changelogView", "settingsView"];
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
const RECENTLY_PURCHASED_SECTION_ID = "recently-purchased";
const QUICK_NOTE_KEY = "feira:quick-note";
