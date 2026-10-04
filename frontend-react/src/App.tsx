import { useEffect, useState } from 'react';
import { CourseCard } from './components/CourseCard';
import { CourseListSkeleton } from './components/CourseListSkeleton';
import { EmptyState } from './components/EmptyState';
import { TimeFilter } from './components/TimeFilter';
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
  // maxMinutes is the filter the request was made with, so the empty-state copy always matches the data shown.
  | { status: 'success'; courses: CourseProgress[]; maxMinutes: number | null };

export function App() {
  const [learnerId, setLearnerId] = useState<string>(SCENARIOS[0].id);
  // Reset together with learnerId (see handleLearnerChange): a different learner is a different session.
  const [maxMinutes, setMaxMinutes] = useState<number | null>(null);
  // Whether the learner has any in-progress courses, learned from an unfiltered load. null = not known yet.
  const [learnerHasCourses, setLearnerHasCourses] = useState<boolean | null>(null);
  // Demo-only flag; stands in for a real feature-flag service. Not persisted.
  const [showNextLesson, setShowNextLesson] = useState(false);
  const [view, setView] = useState<ViewState>({ status: 'loading' });
  const showSkeleton = useLoadingIndicator(view.status === 'loading', {
    delayMs: LOADING_UI_DELAY_MS,
    minVisibleMs: MIN_LOADING_UI_MS,
  });

  useEffect(() => {
    const controller = new AbortController();
    setView({ status: 'loading' });

    const base = `/api/learners/${encodeURIComponent(learnerId)}/progress`;
    const url = maxMinutes === null ? base : `${base}?maxMinutes=${maxMinutes}`;

    void fetch(url, {
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
          maxMinutes,
        });
        // Only an unfiltered response tells us whether the learner has courses at all.
        if (maxMinutes === null) setLearnerHasCourses(courses.length > 0);
        setView({ status: 'success', courses, maxMinutes });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return; // superseded by a newer selection
        setView({
          status: 'error',
          message: err instanceof Error ? err.message : String(err),
        });
      });

    return () => controller.abort();
  }, [learnerId, maxMinutes]);

  // One handler so React batches all three updates into a single render and a single fetch.
  function handleLearnerChange(value: string) {
    setLearnerId(value);
    setMaxMinutes(null);
    setLearnerHasCourses(null);
  }

  return (
    <main className="page">
      {/* Demo-only controls: the scenario picker stands in for a login, and the flag stands in for a real feature-flag service. */}
      <div className="demo-controls">
        <div className="scenario-picker">
          <label htmlFor="scenario">Scenario</label>
          <select
            id="scenario"
            value={learnerId}
            onChange={(e) => handleLearnerChange(e.target.value)}
          >
            {SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label} (ID: {s.id})
              </option>
            ))}
          </select>
        </div>
        <label className="demo-flag">
          <input
            type="checkbox"
            checked={showNextLesson}
            onChange={(e) => setShowNextLesson(e.target.checked)}
          />
          Experimental: next lesson preview
        </label>
      </div>

      <p className="eyebrow">Docebo · pilot</p>
      <h1>My progress</h1>
      <p className="lede">In-progress courses for learner {learnerId}.</p>

      <div className="time-filter-slot">
        {learnerHasCourses === true ? (
          <TimeFilter value={maxMinutes} onChange={setMaxMinutes} />
        ) : null}
      </div>

      {showSkeleton ? (
        <CourseListSkeleton />
      ) : (
        <>
          {view.status === 'error' ? (
            <p className="error" role="alert">
              {view.message}
            </p>
          ) : null}

          {view.status === 'success' && view.courses.length === 0 ? (
            <EmptyState maxMinutes={view.maxMinutes} onClear={() => setMaxMinutes(null)} />
          ) : null}

          {view.status === 'success' && view.courses.length > 0 ? (
            <ul className="course-list">
              {view.courses.map((course, index) => (
                <CourseCard key={course.courseId} course={course} index={index} showNextLesson={showNextLesson} />
              ))}
            </ul>
          ) : null}
        </>
      )}
    </main>
  );
}
