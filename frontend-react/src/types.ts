export type NextLesson = { title: string; estimatedMinutes: number };

export type CourseProgress = {
  courseId: string;
  title: string;
  completionPercentage: number;
  lastActivityAt: string;
  status: string;
  isStale: boolean;
  lessonsCompleted: number;
  lessonsTotal: number;
  /** Whole minutes left. `null` = course has no lessons (no estimate); `0` = all lessons complete. */
  estimatedMinutesRemaining: number | null;
  /** The first incomplete lesson, or `null` when there is none. */
  nextLesson: NextLesson | null;
};

export type LearnerProgressResponse = {
  learnerId: number;
  courses: CourseProgress[];
};
