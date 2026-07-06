/**
 * Helper to get local date string in YYYY-MM-DD format (timezone-safe)
 */
export function getLocalDateString(d: Date = new Date()): string {
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
}

/**
 * Format a date-only string (e.g. YYYY-MM-DD) avoiding timezone shifting
 */
export function formatLocalDate(
  dateStr: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }
): string {
  if (!dateStr) return 'N/A';
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return d.toLocaleDateString('en-KE', { ...options, timeZone: 'UTC' });
}
