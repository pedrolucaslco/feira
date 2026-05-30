function monthlyClosingDayKey(year, month) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function setMonthlyClosingDay(day, date = new Date()) {
  const key = monthlyClosingDayKey(date.getFullYear(), date.getMonth());
  state.settings.monthlyClosingDays = {
    ...(state.settings.monthlyClosingDays || {}),
    [key]: day,
  };
}

function getMonthlyClosingDay(date = new Date()) {
  const key = monthlyClosingDayKey(date.getFullYear(), date.getMonth());
  return state.settings.monthlyClosingDays?.[key] || "";
}

function monthBounds(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1).getTime();
  return { start, end, labelDate: date, usesClosingDay: false };
}

function billingPeriodBounds(date = new Date(), closingDay) {
  if (closingDay === undefined) closingDay = getMonthlyClosingDay(date);
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

function monthlyClosingDayLabel(date = new Date()) {
  const day = getMonthlyClosingDay(date);
  if (!day) return "";
  return `Fechamento dia ${day}: compras a partir desse dia entram no ciclo seguinte.`;
}
