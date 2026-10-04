import { formatMinutes } from '../lib/formatMinutes';

type Props = {
  /** Active time filter, if any. Changes the copy when the filtered list is empty. */
  maxMinutes?: number | null;
  /** Clears the time filter. */
  onClear?: () => void;
};

export function EmptyState({ maxMinutes = null, onClear }: Props) {
  const filtered = maxMinutes !== null;

  return (
    <section className="empty fade-in" role="status">
      <svg
        className="empty-icon"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 6.5C10.5 5 8 4.5 4 4.5v13c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2v-13c-4 0-6.5.5-8 2z" />
        <path d="M12 6.5v13" />
      </svg>
      {filtered ? (
        <>
          <h2>No courses fit in {formatMinutes(maxMinutes)}</h2>
          <p>Try a longer time, or show courses of any length.</p>
          <button type="button" className="empty-action" onClick={onClear}>
            Show any length
          </button>
        </>
      ) : (
        <>
          <h2>No courses in progress</h2>
          <p>Courses you&apos;ve started will appear here.</p>
        </>
      )}
    </section>
  );
}
