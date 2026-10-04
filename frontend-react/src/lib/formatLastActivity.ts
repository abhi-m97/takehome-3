const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type FormattedActivity = {
  /** e.g. "today", "yesterday", "3 days ago" */
  relative: string;
  /** e.g. "Mar 4" (year is appended only when it differs from the current year) */
  date: string;
  /** Full local timestamp, suitable for a tooltip. */
  full: string;
};

/**
 * Formats an ISO timestamp for display in the viewer's local time zone.
 *
 * "Days ago" counts whole elapsed 24-hour periods since the timestamp (the same basis
 * as the backend's stale rule), not calendar days. A timestamp from the previous
 * evening can therefore read "today". Future timestamps (clock skew) are clamped to 0.
 */
export function formatLastActivity(
  iso: string,
  now: Date = new Date(),
): FormattedActivity {
  const then = new Date(iso);

  if (Number.isNaN(then.getTime())) {
    return { relative: 'unknown', date: '', full: iso };
  }

  const daysAgo = Math.floor(Math.max(0, now.getTime() - then.getTime()) / MS_PER_DAY);

  const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }).format(
    -daysAgo,
    'day',
  );

  const date = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    ...(then.getFullYear() !== now.getFullYear() ? { year: 'numeric' as const } : {}),
  }).format(then);

  const full = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(then);

  return { relative, date, full };
}
