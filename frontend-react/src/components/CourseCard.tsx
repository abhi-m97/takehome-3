import type { CSSProperties } from 'react';
import { formatLastActivity } from '../lib/formatLastActivity';
import type { CourseProgress } from '../types';

type Props = {
  course: CourseProgress;
  /** Position in the list, used to stagger the entrance animation. */
  index?: number;
};

export function CourseCard({ course, index = 0 }: Props) {
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

      <p className="meta">
        <time dateTime={course.lastActivityAt} title={full}>
          Last active {relative}
          {date ? ` (${date})` : ''}
        </time>
      </p>
    </li>
  );
}
