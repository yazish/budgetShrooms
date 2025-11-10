const DISPLAY_TIMEZONE = "America/Winnipeg";

function getTimezoneShift(date: Date) {
  const tzString = date.toLocaleString("en-CA", {
    timeZone: DISPLAY_TIMEZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const [ymd, hms] = tzString.split(", ");
  const [year, month, day] = ymd.split("-").map(Number);
  const [hour, minute, second] = hms.split(":").map(Number);
  const asUTC = Date.UTC(year, month - 1, day, hour, minute, second);
  return asUTC - date.getTime();
}

export function getMonthRange(monthId: string) {
  const parsed = parseMonth(monthId);
  if (!parsed) {
    throw new Error("Invalid month parameter");
  }

  const { year, month } = parsed;
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const endDate = new Date(Date.UTC(endYear, endMonth - 1, 1));

  const startShift = getTimezoneShift(startDate);
  const endShift = getTimezoneShift(endDate);

  return {
    start: new Date(startDate.getTime() - startShift),
    end: new Date(endDate.getTime() - endShift),
  };
}

export function formatMonthIdentifier(date: Date) {
  const tzString = date.toLocaleString("en-CA", {
    timeZone: DISPLAY_TIMEZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
  });
  const [year, month] = tzString.split("-");
  return `${year}-${month}`;
}

export function parseMonth(value: string) {
  if (!/^\d{4}-\d{2}$/.test(value)) {
    return null;
  }
  const [yearString, monthString] = value.split("-");
  const year = Number(yearString);
  const month = Number(monthString);
  if (month < 1 || month > 12) {
    return null;
  }
  return { year, month };
}

export function formatMonthTitle(monthId: string) {
  const parsed = parseMonth(monthId);
  if (!parsed) {
    return monthId;
  }
  const { year, month } = parsed;
  const date = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DISPLAY_TIMEZONE,
    year: "numeric",
    month: "long",
  }).format(date);
}

export function formatExpenseTimestamp(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DISPLAY_TIMEZONE,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatCurrency(amount: unknown) {
  const numericAmount =
    typeof amount === "number"
      ? amount
      : typeof amount === "string"
      ? Number(amount)
      : Number(amount ?? 0);
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(numericAmount);
}
