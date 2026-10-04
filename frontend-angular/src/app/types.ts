export type CourseProgress = {
  courseId: string;
  title: string;
  completionPercentage: number;
  lastActivityAt: string;
  status: string;
  isStale?: boolean;
};

export type LearnerProgressResponse = {
  learnerId: number;
  courses: CourseProgress[];
};
