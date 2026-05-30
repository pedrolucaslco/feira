function monthBounds(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1).getTime();
  return { start, end, labelDate: date, usesClosingDay: false };
}

function billingPeriodBounds(date = new Date(), closingDay = state.settings.cardClosingDay) {
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
