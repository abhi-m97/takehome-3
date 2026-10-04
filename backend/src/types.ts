/** Enrollment status in seed data — not necessarily what the API returns. */
export type EnrollmentStatus = 'not_started' | 'in_progress' | 'completed';

export interface Lesson {
  id: string;
  title: string;
  completed: boolean;
  /** Whole minutes. Missing or non-positive-integer values are treated as the default. */
  estimatedDurationMinutes?: number;
}

/** Raw enrollment record used by the in-memory store. */
export interface CourseEnrollment {
  courseId: string;
  title: string;
  learnerId: number;
  lessons: Lesson[];
  /** ISO-8601 timestamp of last learner activity on this course */
  lastActivityAt: string;
  status: EnrollmentStatus;
}

export interface NextLesson {
  title: string;
  /** Whole minutes, using the same duration rule as estimatedMinutesRemaining. */
  estimatedMinutes: number;
}

/** API response shape for a single in-progress course. */
export interface CourseProgress {
  courseId: string;
  title: string;
  completionPercentage: number;
  lastActivityAt: string;
  status: 'in_progress';
  lessonsCompleted: number;
  lessonsTotal: number;
  /** Whole minutes left; null when the course has no lessons (no estimate). */
  estimatedMinutesRemaining: number | null;
  /** First incomplete lesson in array order; null when none. */
  nextLesson: NextLesson | null;
  /** Set when last activity is older than the stale threshold (see progressService). */
  isStale?: boolean;
}

export interface LearnerProgressResponse {
  learnerId: number;
  courses: CourseProgress[];
}
