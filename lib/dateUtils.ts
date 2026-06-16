// All times are displayed in Argentina/Buenos_Aires (UTC-3, no DST year-round)
const TZ = "America/Argentina/Buenos_Aires";

function toDate(d: Date | string): Date {
  return typeof d === "string" ? new Date(d) : d;
}

function getARParts(d: Date | string) {
  const p: Record<string, string> = {};
  for (const { type, value } of new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(toDate(d))) {
    if (type !== "literal") p[type] = value;
  }
  return p;
}

/** "22:00" */
export function formatARTime(d: Date | string): string {
  const p = getARParts(d);
  return `${p.hour}:${p.minute}`;
}

/** "16/06/2026 22:00" */
export function formatARDateTime(d: Date | string): string {
  const p = getARParts(d);
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`;
}

/** "16/06 22:00" — for compact spaces */
export function formatARDateTimeShort(d: Date | string): string {
  const p = getARParts(d);
  return `${p.day}/${p.month} ${p.hour}:${p.minute}`;
}

/** "YYYY-MM-DD" in Argentina time — use for grouping/comparing dates */
export function getARDateKey(d: Date | string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(toDate(d));
}

/** "Hoy" | "Mañana" | "viernes 20 de junio" */
export function formatARDayHeader(dateKey: string): string {
  const now = new Date();
  const todayKey = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(now);
  const tomorrowKey = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(
    new Date(now.getTime() + 86400 * 1000)
  );

  if (dateKey === todayKey) return "Hoy";
  if (dateKey === tomorrowKey) return "Mañana";

  // dateKey is "YYYY-MM-DD" — parse at noon Argentina time to avoid DST edge cases
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${dateKey}T12:00:00-03:00`));
}
