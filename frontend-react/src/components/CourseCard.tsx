import type { CSSProperties } from 'react';
import { formatLastActivity } from '../lib/formatLastActivity';
import { formatMinutes } from '../lib/formatMinutes';
import type { CourseProgress } from '../types';

type Props = {
  course: CourseProgress;
  /** Position in the list, used to stagger the entrance animation. */
  index?: number;
  /** Experimental: show the next lesson under the summary. Off by default. */
  showNextLesson?: boolean;
};

/** e.g. "2 of 4 lessons · about 30 min left". "about" because estimates may include default durations. */
function lessonSummary(course: CourseProgress): string {
  const { lessonsCompleted, lessonsTotal, estimatedMinutesRemaining } = course;
  if (lessonsTotal === 0) return 'No lessons listed';
  if (lessonsCompleted === lessonsTotal) return 'All lessons done';

  const count = `${lessonsCompleted} of ${lessonsTotal} lessons`;
  // Omit the time when there's no estimate; never show "0 min left".
  if (estimatedMinutesRemaining === null || estimatedMinutesRemaining <= 0) return count;
  return `${count} · about ${formatMinutes(estimatedMinutesRemaining)} left`;
}

export function CourseCard({ course, index = 0, showNextLesson = false }: Props) {
  const percentage = Math.min(100, Math.max(0, Math.round(course.completionPercentage)));
  const { relative, date, full } = formatLastActivity(course.lastActivityAt);

  return (
    <li
      className="course fade-in"
      style={{ '--i': index } as CSSProperties}
    >
      <div className="course-header">
        <h2>{course.title}</h2>
        {course.isStale ? <span className="badge">Inactive</span> : null}
      </div>

      <div className="progress-row">
        <div
          className="progress"
          role="progressbar"
          aria-label={`${course.title} completion`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
        >
          <div className="progress-fill" style={{ width: `${percentage}%` }} />
        </div>
        <span className="progress-pct">{percentage}%</span>
      </div>

      {/* Two columns sharing the same two text rows, so the next-lesson block lines up with the meta lines. */}
      <div className="course-info">
        <div>
          <p className="meta">{lessonSummary(course)}</p>
          <p className="meta">
            <time dateTime={course.lastActivityAt} title={full}>
              Last active {relative}
              {date ? ` (${date})` : ''}
            </time>
          </p>
        </div>

        {showNextLesson && course.nextLesson ? (
          <div className="next-lesson">
            <p className="meta next-lesson-title">Next: {course.nextLesson.title}</p>
            <p className="meta">{formatMinutes(course.nextLesson.estimatedMinutes)}</p>
          </div>
        ) : null}
      </div>
    </li>
  );
}
