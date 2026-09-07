export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDisplayDate(date = new Date()): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatDisplayDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return formatDisplayDate(new Date(y, m - 1, d));
}

export function formatReminderTime(reminderTime: string): string {
  const [hours, minutes] = reminderTime.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return reminderTime;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function parseReminder(dateKey: string, reminderTime: string): Date {
  const [hours, minutes] = reminderTime.split(":").map(Number);
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d, hours, minutes, 0, 0);
}

export function lastNDateKeys(n: number, from = new Date()): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(from);
    d.setDate(from.getDate() - i);
    keys.push(todayKey(d));
  }
  return keys;
}

export function weekdayShort(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "short",
  });
}
