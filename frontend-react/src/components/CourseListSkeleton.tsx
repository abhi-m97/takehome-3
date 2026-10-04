const SKELETON_COUNT = 3;

/**
 * Placeholder shown while the course list loads. Mirrors the real card layout so the
 * swap causes minimal movement; later cards fade out to hint that the length is unknown.
 */
export function CourseListSkeleton() {
  return (
    <div className="loading">
      <p className="loading-text" role="status">
        Loading your courses…
      </p>
      <ul className="course-list" aria-hidden="true">
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <li key={i} className="course course--skeleton">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-bar" />
            <div className="skeleton skeleton-meta" />
          </li>
        ))}
      </ul>
    </div>
  );
}
