/**
 * Helper to get local date string in YYYY-MM-DD format (timezone-safe)
 */
export function getLocalDateString(d: Date = new Date()): string {
  if (!d || isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
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
  if (isNaN(d.getTime())) return 'N/A';
  try {
    return d.toLocaleDateString('en-KE', { ...options, timeZone: 'UTC' });
  } catch (_) {
    return d.toLocaleDateString();
  }
}

/**
 * Safe date formatter returning N/A instead of Invalid Date
 */
export function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return 'N/A';
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Safe date and time formatter returning N/A instead of Invalid Date
 */
export function formatDateTime(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return 'N/A';
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('en-KE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
