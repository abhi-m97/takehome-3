import { enrollments, knownLearnerIds } from '../data/seed';
import { NotFoundError } from '../errors';
import type { CourseEnrollment, CourseProgress, Lesson, NextLesson } from '../types';

/** Days without activity before a course is considered stale (business rule hint). */
export const STALE_DAYS = 30;

/**
 * Return in-progress courses for a learner, sorted by last activity (most recent first).
 *
 * - Throws NotFoundError when the learner does not exist in seed data
 * - Includes only enrollments with status `in_progress`
 * - Computes completionPercentage from completed / total lessons (0–100, rounded)
 * - Flags isStale when last activity is older than STALE_DAYS
 * - Adds lessonsCompleted, lessonsTotal, estimatedMinutesRemaining and nextLesson
 * - When `maxMinutes` is given, keeps only courses with an estimate <= maxMinutes
 *   (inclusive); courses with no estimate (null) are dropped. nextLesson is unaffected.
 * - Sorts by lastActivityAt descending
 *
 * `now` is evaluated once per call so every course is judged against the same instant.
 */
export function getInProgressCourses(
  learnerId: number,
  options: { now?: Date; maxMinutes?: number } = {},
): CourseProgress[] {
  const { now = new Date(), maxMinutes } = options;

  if (!knownLearnerIds.has(learnerId)) {
    throw new NotFoundError(`Learner ${learnerId} not found`);
  }

  return enrollments
    .filter(
      (enrollment) =>
        enrollment.learnerId === learnerId && enrollment.status === 'in_progress',
    )
    .map((enrollment) => toCourseProgress(enrollment, now))
    .filter((course) => fitsWithin(course.estimatedMinutesRemaining, maxMinutes))
    .sort(
      (a, b) => Date.parse(b.lastActivityAt) - Date.parse(a.lastActivityAt),
    );
}

/** No limit keeps everything; otherwise a null estimate never fits (null <= n is true in JS). */
function fitsWithin(estimate: number | null, maxMinutes: number | undefined): boolean {
  if (maxMinutes === undefined) {
    return true;
  }
  return estimate !== null && estimate <= maxMinutes;
}

/** Minutes assumed for an incomplete lesson without a valid duration. */
export const DEFAULT_LESSON_MINUTES = 10;

/**
 * Estimate the minutes left in a course.
 *
 * - No lessons: null (no estimate, not 0)
 * - Otherwise the sum over incomplete lessons only; completed lessons never count
 * - A duration counts only if it is a positive integer; anything else
 *   (missing, 0, negative, NaN, Infinity, fractional) counts as DEFAULT_LESSON_MINUTES
 * - All lessons complete: 0
 */
export function estimateMinutesRemaining(enrollment: CourseEnrollment): number | null {
  if (enrollment.lessons.length === 0) {
    return null;
  }
  return enrollment.lessons
    .filter((lesson) => !lesson.completed)
    .reduce((total, lesson) => total + lessonMinutes(lesson), 0);
}

function lessonMinutes(lesson: Lesson): number {
  const duration = lesson.estimatedDurationMinutes;
  return duration !== undefined && Number.isInteger(duration) && duration > 0
    ? duration
    : DEFAULT_LESSON_MINUTES;
}

/**
 * Find the lesson a learner should do next.
 *
 * - The first incomplete lesson in array order (array position is course order), even
 *   when a later lesson is already complete
 * - estimatedMinutes follows the same duration rule as estimateMinutesRemaining
 * - null when there is no incomplete lesson (every lesson complete, or no lessons)
 */
export function getNextLesson(enrollment: CourseEnrollment): NextLesson | null {
  const lesson = enrollment.lessons.find((candidate) => !candidate.completed);
  return lesson ? { title: lesson.title, estimatedMinutes: lessonMinutes(lesson) } : null;
}

export function computeCompletionPercentage(enrollment: CourseEnrollment): number {
  if (enrollment.lessons.length === 0) {
    return 0;
  }
  const completed = enrollment.lessons.filter((lesson) => lesson.completed).length;
  return Math.round((completed / enrollment.lessons.length) * 100);
}

export function isEnrollmentStale(lastActivityAt: string, now: Date = new Date()): boolean {
  const lastActivity = new Date(lastActivityAt);
  const diffMs = now.getTime() - lastActivity.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays > STALE_DAYS;
}

/** Maps an in-progress enrollment to the API response shape. */
function toCourseProgress(enrollment: CourseEnrollment, now: Date): CourseProgress {
  return {
    courseId: enrollment.courseId,
    title: enrollment.title,
    completionPercentage: computeCompletionPercentage(enrollment),
    lastActivityAt: enrollment.lastActivityAt,
    status: 'in_progress',
    lessonsCompleted: enrollment.lessons.filter((lesson) => lesson.completed).length,
    lessonsTotal: enrollment.lessons.length,
    estimatedMinutesRemaining: estimateMinutesRemaining(enrollment),
    nextLesson: getNextLesson(enrollment),
    isStale: isEnrollmentStale(enrollment.lastActivityAt, now),
  };
}
