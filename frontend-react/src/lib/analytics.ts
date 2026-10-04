/**
 * Minimal analytics client (stub for the assessment).
 *
 * Events are written to the console as one line of JSON each. To connect a real
 * service (Segment, Amplitude, etc.), replace the body of `transport` only;
 * callers of `track` don't change.
 *
 * Privacy: events carry numeric IDs and counts only, no names or course titles.
 */

type AnalyticsEvents = {
  course_progress_viewed: {
    learnerId: number;
    courseCount: number;
    staleCount: number;
    /** Active time filter in minutes, or null for "any length". */
    maxMinutes: number | null;
  };
};

type Payload = {
  event: string;
  timestamp: string;
  properties: unknown;
};

/** The one place that knows where events go. */
function transport(payload: Payload): void {
  console.info(JSON.stringify(payload));
}

/** Record an event. Event names and their properties are checked at compile time. */
export function track<E extends keyof AnalyticsEvents>(
  event: E,
  properties: AnalyticsEvents[E],
): void {
  try {
    transport({ event, timestamp: new Date().toISOString(), properties });
  } catch {
    // Analytics must never break the UI.
  }
}
