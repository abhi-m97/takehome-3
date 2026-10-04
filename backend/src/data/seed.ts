import type { CourseEnrollment } from '../types';

/**
 * In-memory seed data. Do not mutate at runtime unless you choose to implement
 * writes — the take-home only requires read/list for in-progress courses.
 */

/** Timestamps are relative to import time so the fresh/stale demo mix never goes stale itself. */
function daysAgo(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString();
}

export const enrollments: CourseEnrollment[] = [
  {
    courseId: 'course-onboarding',
    title: 'New Hire Onboarding',
    learnerId: 1,
    lessons: [
      { id: 'l1', title: 'Welcome', completed: true, estimatedDurationMinutes: 5 },
      { id: 'l2', title: 'Tools setup', completed: true, estimatedDurationMinutes: 10 },
      { id: 'l3', title: 'Security basics', completed: false, estimatedDurationMinutes: 20 },
      { id: 'l4', title: 'Team intro', completed: false, estimatedDurationMinutes: 10 },
    ],
    lastActivityAt: daysAgo(4),
    status: 'in_progress',
  },
  {
    courseId: 'course-leadership',
    title: 'Leadership Essentials',
    learnerId: 1,
    lessons: [
      { id: 'l1', title: 'Feedback frameworks', completed: true, estimatedDurationMinutes: 20 },
      { id: 'l2', title: 'Coaching conversations', completed: false, estimatedDurationMinutes: 15 },
      // No duration on purpose: exercises the default.
      { id: 'l3', title: 'Delegation', completed: false },
    ],
    lastActivityAt: daysAgo(2),
    status: 'in_progress',
  },
  {
    courseId: 'course-compliance',
    title: 'Annual Compliance Refresh',
    learnerId: 1,
    lessons: [
      { id: 'l1', title: 'Policy overview', completed: true, estimatedDurationMinutes: 10 },
      { id: 'l2', title: 'Quiz', completed: false, estimatedDurationMinutes: 5 },
    ],
    lastActivityAt: daysAgo(54), // always > STALE_DAYS (30)
    status: 'in_progress',
  },
  {
    courseId: 'course-completed-sample',
    title: 'Completed Course (should not appear in API)',
    learnerId: 1,
    lessons: [
      { id: 'l1', title: 'Done', completed: true },
      { id: 'l2', title: 'Also done', completed: true },
    ],
    lastActivityAt: daysAgo(84),
    status: 'completed',
  },
  {
    courseId: 'course-not-started',
    title: 'Not Started Course (should not appear in API)',
    learnerId: 1,
    lessons: [
      { id: 'l1', title: 'Intro', completed: false },
    ],
    lastActivityAt: daysAgo(23),
    status: 'not_started',
  },
  {
    courseId: 'course-safety',
    title: 'Workplace Safety',
    learnerId: 2,
    lessons: [
      { id: 'l1', title: 'Hazards', completed: true, estimatedDurationMinutes: 10 },
      { id: 'l2', title: 'Procedures', completed: false, estimatedDurationMinutes: 20 },
    ],
    lastActivityAt: daysAgo(3),
    status: 'in_progress',
  },
  {
    courseId: 'course-privacy',
    title: 'Data Privacy Fundamentals',
    learnerId: 2,
    lessons: [
      { id: 'l1', title: 'GDPR basics', completed: true },
      { id: 'l2', title: 'Handling PII', completed: true },
    ],
    lastActivityAt: daysAgo(106),
    status: 'completed',
  },
  {
    courseId: 'course-ethics',
    title: 'Workplace Ethics',
    learnerId: 3,
    lessons: [
      { id: 'l1', title: 'Code of conduct', completed: true },
      { id: 'l2', title: 'Reporting concerns', completed: true },
    ],
    lastActivityAt: daysAgo(40),
    status: 'completed',
  },
];

export const knownLearnerIds = new Set(
  enrollments.map((enrollment) => enrollment.learnerId),
);
