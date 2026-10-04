import { useEffect, useState } from 'react';
import { CourseCard } from './components/CourseCard';
import { CourseListSkeleton } from './components/CourseListSkeleton';
import { EmptyState } from './components/EmptyState';
import { useLoadingIndicator } from './hooks/useLoadingIndicator';
import { track } from './lib/analytics';
import type { CourseProgress, LearnerProgressResponse } from './types';

// Test-only scenario picker (hardcoded for the assessment, not production code).
// `id` is a string so we can send invalid values like "abc" straight to the API.
const SCENARIOS = [
  { id: '1', label: 'Learner 1' },
  { id: '2', label: 'Learner 2' },
  { id: '3', label: 'Learner 3 (completed only)' },
  { id: '999', label: 'Unknown learner (404)' },
  { id: 'abc', label: 'Invalid ID (400)' },
] as const;

/** Wait this long before showing the skeleton, so fast responses never flash it. */
const LOADING_UI_DELAY_MS = 150;
/** Once shown, keep the skeleton up this long so it doesn't flicker away. */
const MIN_LOADING_UI_MS = 400;

type ViewState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; courses: CourseProgress[] };

export function App() {
  const [learnerId, setLearnerId] = useState<string>(SCENARIOS[0].id);
  const [view, setView] = useState<ViewState>({ status: 'loading' });
  const showSkeleton = useLoadingIndicator(view.status === 'loading', {
    delayMs: LOADING_UI_DELAY_MS,
    minVisibleMs: MIN_LOADING_UI_MS,
  });

  useEffect(() => {
    const controller = new AbortController();
    setView({ status: 'loading' });

    void fetch(`/api/learners/${encodeURIComponent(learnerId)}/progress`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (controller.signal.aborted) return; // aborted mid-body; ignore stale result
        if (!res.ok) {
          throw new Error(`${res.status}: ${body.error ?? res.statusText}`);
        }
        const { learnerId: responseLearnerId, courses } = body as LearnerProgressResponse;
        track('course_progress_viewed', {
          learnerId: responseLearnerId,
          courseCount: courses.length,
          staleCount: courses.filter((c) => c.isStale).length,
        });
        setView({ status: 'success', courses });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return; // superseded by a newer selection
        setView({
          status: 'error',
          message: err instanceof Error ? err.message : String(err),
        });
      });

    return () => controller.abort();
  }, [learnerId]);

  return (
    <main className="page">
      <div className="scenario-picker">
        <label htmlFor="scenario">Scenario</label>
        <select
          id="scenario"
          value={learnerId}
          onChange={(e) => setLearnerId(e.target.value)}
        >
          {SCENARIOS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label} (ID: {s.id})
            </option>
          ))}
        </select>
      </div>

      <p className="eyebrow">Docebo · pilot</p>
      <h1>My progress</h1>
      <p className="lede">In-progress courses for learner {learnerId}.</p>

      {showSkeleton ? (
        <CourseListSkeleton />
      ) : (
        <>
          {view.status === 'error' ? (
            <p className="error" role="alert">
              {view.message}
            </p>
          ) : null}

          {view.status === 'success' && view.courses.length === 0 ? <EmptyState /> : null}

          {view.status === 'success' && view.courses.length > 0 ? (
            <ul className="course-list">
              {view.courses.map((course, index) => (
                <CourseCard key={course.courseId} course={course} index={index} />
              ))}
            </ul>
          ) : null}
        </>
      )}
    </main>
  );
}
