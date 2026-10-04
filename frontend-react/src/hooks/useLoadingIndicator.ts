import { useEffect, useRef, useState } from 'react';

type Options = {
  /** Wait this long before showing the indicator. */
  delayMs: number;
  /** Once shown, keep it visible for at least this long. */
  minVisibleMs: number;
};

/**
 * Decides whether a loading indicator (e.g. a skeleton) should be visible.
 *
 * - Shows only after `loading` has been true for `delayMs`, so fast loads never flash it.
 * - Once shown, stays visible for at least `minVisibleMs`, so it never flickers away.
 * - If loading restarts while it is visible, it stays visible.
 */
export function useLoadingIndicator(
  loading: boolean,
  { delayMs, minVisibleMs }: Options,
): boolean {
  const [visible, setVisible] = useState(false);
  const shownAtRef = useRef(0); // timestamp (ms) of when the indicator last appeared

  useEffect(() => {
    if (loading) {
      if (visible) return; // already showing, nothing to schedule
      const showTimer = setTimeout(() => {
        shownAtRef.current = Date.now();
        setVisible(true);
      }, delayMs);
      return () => clearTimeout(showTimer);
    }

    if (!visible) return; // finished before the delay: never show

    const remainingMs = Math.max(0, minVisibleMs - (Date.now() - shownAtRef.current));
    const hideTimer = setTimeout(() => setVisible(false), remainingMs);
    return () => clearTimeout(hideTimer); // cancelled if loading restarts
  }, [loading, visible, delayMs, minVisibleMs]);

  return visible;
}
