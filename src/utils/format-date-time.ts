/**
 * DMS 时间串固定为 `YYYY-MM-DD HH:mm:ss`；`replace(' ', 'T')` 是为了 Hermes 能按本地时区解析。
 *
 * @param {string | null} [value] - 待解析的 DMS 时间串；缺省、空串或纯空白按无法解析处理。
 * @returns {Date | null} 解析出的本地时间；无法解析时返回 null。
 */
export function parseDmsDateTime(value?: string | null): Date | null {
  const trimmedValue = value?.trim();
  if (!trimmedValue) return null;

  const parsedDate = new Date(trimmedValue.replace(' ', 'T'));
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function pad(part: number): string {
  return String(part).padStart(2, '0');
}

/**
 * 把 DMS 时间串格式化为 `YYYY-MM-DD HH:mm` 的展示文案，秒位被舍弃。
 *
 * @param {string | null} [value] - 待格式化的 DMS 时间串。
 * @returns {string} 格式化后的时间；无法解析时返回“时间未知”。
 */
export function formatDateTime(value?: string | null): string {
  const parsedDate = parseDmsDateTime(value);
  if (!parsedDate) return '时间未知';

  return `${parsedDate.getFullYear()}-${pad(parsedDate.getMonth() + 1)}-${pad(
    parsedDate.getDate(),
  )} ${pad(parsedDate.getHours())}:${pad(parsedDate.getMinutes())}`;
}
