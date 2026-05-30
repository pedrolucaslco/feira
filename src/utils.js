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

function sortObjectKeys(value) {
  if (Array.isArray(value)) return value.map(sortObjectKeys);
  if (!value || typeof value !== "object") return value;
  return Object.keys(value)
    .sort()
    .reduce((result, key) => {
      result[key] = sortObjectKeys(value[key]);
      return result;
    }, {});
}

function formatDuration(durationMs = 0) {
  const totalSeconds = Math.max(0, Math.floor(Number(durationMs) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = hours
    ? [hours, minutes, seconds]
    : [minutes, seconds];
  return parts.map((part) => String(part).padStart(2, "0")).join(":");
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

function itemSortOrder(item) {
  const sortOrder = Number(item?.sortOrder);
  if (Number.isFinite(sortOrder)) return sortOrder;
  const createdAt = Number(item?.createdAt);
  return Number.isFinite(createdAt) ? createdAt : Date.now();
}

function sortOrderForItemPosition(items, targetIndex) {
  const previous = items[targetIndex - 1];
  const next = items[targetIndex];
  if (previous && next) return (itemSortOrder(previous) + itemSortOrder(next)) / 2;
  if (previous) return itemSortOrder(previous) - 1;
  if (next) return itemSortOrder(next) + 1;
  return Date.now();
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
