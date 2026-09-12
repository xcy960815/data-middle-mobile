/** DMS 时间串固定为 `YYYY-MM-DD HH:mm:ss`；`replace(' ', 'T')` 是为了 Hermes 能按本地时区解析。 */
export function parseDmsDateTime(value?: string | null): Date | null {
  const trimmedValue = value?.trim();
  if (!trimmedValue) return null;

  const parsedDate = new Date(trimmedValue.replace(' ', 'T'));
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function pad(part: number): string {
  return String(part).padStart(2, '0');
}

export function formatDateTime(value?: string | null): string {
  const parsedDate = parseDmsDateTime(value);
  if (!parsedDate) return '时间未知';

  return `${parsedDate.getFullYear()}-${pad(parsedDate.getMonth() + 1)}-${pad(
    parsedDate.getDate(),
  )} ${pad(parsedDate.getHours())}:${pad(parsedDate.getMinutes())}`;
}
