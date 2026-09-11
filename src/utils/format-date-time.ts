/** DMS 时间串固定为 `YYYY-MM-DD HH:mm:ss`；`replace(' ', 'T')` 是为了 Hermes 能按本地时区解析。 */
export function formatDateTime(value?: string | null): string {
  const trimmedValue = value?.trim();
  if (!trimmedValue) return '时间未知';

  const parsedDate = new Date(trimmedValue.replace(' ', 'T'));
  if (Number.isNaN(parsedDate.getTime())) return '时间未知';

  const pad = (part: number) => String(part).padStart(2, '0');
  return `${parsedDate.getFullYear()}-${pad(parsedDate.getMonth() + 1)}-${pad(
    parsedDate.getDate(),
  )} ${pad(parsedDate.getHours())}:${pad(parsedDate.getMinutes())}`;
}
