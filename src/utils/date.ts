/**
 * Safely formats a date string or Date object to a readable format
 * Dates are formatted in UTC so that a bare YYYY-MM-DD never shifts a day
 */
export function formatDate(dateString: string | Date): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Unknown date";
    }
    return date.toLocaleDateString('en-us', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  } catch (e) {
    console.error(`Error formatting date: ${dateString}`, e);
    return "Unknown date";
  }
}

/**
 * Formats a date as a short month and year, for example "Sep 2025"
 * Used in post list rows, where a narrow right-hand column keeps titles wide
 */
export function formatShortDate(dateString: string | Date): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Unknown date";
    }
    return date.toLocaleDateString('en-us', {
      year: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    });
  } catch (e) {
    console.error(`Error formatting date: ${dateString}`, e);
    return "Unknown date";
  }
}

/**
 * Formats a date as a bare ISO date, for example "2025-09-29"
 * Used for the datetime attribute of a list row, where a date-only value fits
 */
export function toISODate(value: string | Date): string {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const date = new Date(value);
  return isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

/**
 * Formats a date as an ISO timestamp, for example "2025-09-29T12:00:00Z"
 * A bare YYYY-MM-DD is treated as noon UTC. Used for the datetime attribute
 * of a post header, where a full timestamp fits.
 * Returns an empty string on an invalid date, so the caller can omit the
 * attribute instead of stamping the build time into the page.
 */
export function toISODateTime(value: string | Date): string {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T12:00:00Z`;
  }

  try {
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? '' : value.toISOString();
    }
    const date = new Date(value);
    return isNaN(date.getTime()) ? '' : date.toISOString();
  } catch (e) {
    console.error(`Error creating ISO string: ${value}`, e);
    return '';
  }
}

/**
 * Safely parses a date string or Date object to a Date object
 */
export function parseDate(date: Date | string | undefined): Date | null {
  if (!date) return null;
  
  // If it's already a Date object, return it
  if (date instanceof Date && !isNaN(date.getTime())) return date;
  
  try {
    // Try to parse the string into a Date
    const parsedDate = new Date(date);
    
    // Check if the date is valid
    return !isNaN(parsedDate.getTime()) ? parsedDate : null;
  } catch (e) {
    console.error(`Error parsing date: ${date}`, e);
    return null;
  }
} 