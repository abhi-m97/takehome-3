import { useEffect, useState } from 'react';
import type { CourseProgress, LearnerProgressResponse } from './types';

const LEARNER_ID = 1;

export function App() {
  const [courses, setCourses] = useState<CourseProgress[] | null>(null);

  useEffect(() => {
    void fetch(`/api/learners/${LEARNER_ID}/progress`)
      .then((res) => res.json())
      .then((body: LearnerProgressResponse) => setCourses(body.courses));
  }, []);

  if (!courses) {
    return null;
  }

  return (
    <main className="page">
      <p className="eyebrow">Docebo · pilot</p>
      <h1>My progress</h1>
      <p className="lede">In-progress courses for learner {LEARNER_ID}.</p>
      <ul className="course-list">
        {courses.map((course) => (
          <li key={course.courseId} className="course">
            <h2>{course.title}</h2>
            <p className="meta">
              {course.completionPercentage}% · {course.lastActivityAt}
            </p>
            {course.isStale ? <span className="badge">Inactive</span> : null}
          </li>
        ))}
      </ul>
    </main>
  );
}
