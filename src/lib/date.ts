/**
 * SlideBee Standardized Date Formatting Utilities
 * Enforces unified Date, Month, and Year formatting across the platform.
 * Format standard: "04 Nov 2026" (or "04 Nov 2026, 05:19 PM")
 */

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * Format any date input to "DD MMM YYYY" (e.g. "04 Nov 2026")
 */
export function formatDate(input?: string | number | Date | null): string {
  if (!input) return "N/A";
  try {
    const d = typeof input === "string" || typeof input === "number" ? new Date(input) : input;
    if (isNaN(d.getTime())) return String(input);
    const day = String(d.getDate()).padStart(2, "0");
    const month = MONTHS_SHORT[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return String(input);
  }
}

/**
 * Format any date input to full month format "DD MMMM YYYY" (e.g. "04 November 2026")
 */
export function formatDateLong(input?: string | number | Date | null): string {
  if (!input) return "N/A";
  try {
    const d = typeof input === "string" || typeof input === "number" ? new Date(input) : input;
    if (isNaN(d.getTime())) return String(input);
    const day = String(d.getDate()).padStart(2, "0");
    const month = MONTHS_LONG[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return String(input);
  }
}

/**
 * Format date with time: "DD MMM YYYY, HH:MM AM/PM" (e.g. "04 Nov 2026, 05:19 PM")
 */
export function formatDateTime(input?: string | number | Date | null): string {
  if (!input) return "N/A";
  try {
    const d = typeof input === "string" || typeof input === "number" ? new Date(input) : input;
    if (isNaN(d.getTime())) return String(input);
    const datePart = formatDate(d);
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, "0");
    return `${datePart}, ${strHours}:${minutes} ${ampm}`;
  } catch {
    return String(input);
  }
}

/**
 * Format as Month and Year: "MMM YYYY" (e.g. "Nov 2026")
 */
export function formatMonthYear(input?: string | number | Date | null): string {
  if (!input) return "N/A";
  try {
    const d = typeof input === "string" || typeof input === "number" ? new Date(input) : input;
    if (isNaN(d.getTime())) return String(input);
    const month = MONTHS_SHORT[d.getMonth()];
    const year = d.getFullYear();
    return `${month} ${year}`;
  } catch {
    return String(input);
  }
}
