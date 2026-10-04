/**
 * Format a whole number of minutes for display.
 * Under 60: "25 min". 60 or more: "1 h" for exact hours, otherwise "1 h 15 min".
 */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}
