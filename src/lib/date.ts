import dayjs from "dayjs";

export function formatDate(date: string | null | undefined): string {
  if (!date) return "-";
  return dayjs(date).format("YYYY-MM-DD");
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return "-";
  return dayjs(date).format("YYYY-MM-DD HH:mm");
}

export function isOverdue(date: string | null | undefined): boolean {
  if (!date) return false;
  return dayjs(date).isBefore(dayjs(), "day");
}

export function isToday(date: string | null | undefined): boolean {
  if (!date) return false;
  return dayjs(date).isSame(dayjs(), "day");
}

export function daysBetween(start: string | null, end: string | null): number {
  if (!start || !end) return 0;
  return dayjs(end).diff(dayjs(start), "day");
}

export function nowISO(): string {
  return dayjs().toISOString();
}

export { dayjs };
