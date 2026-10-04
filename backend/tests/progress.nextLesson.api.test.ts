import request from 'supertest';
import { createApp } from '../src/app';
import { enrollments } from '../src/data/seed';
import type { CourseEnrollment } from '../src/types';

interface NextLessonCourse {
  courseId: string;
  nextLesson?: { title: string; estimatedMinutes: number } | null;
}

const app = createApp();

async function getCourses(path: string): Promise<NextLessonCourse[]> {
  const res = await request(app).get(path);
  expect(res.status).toBe(200);
  return res.body.courses;
}

const nextOf = (courses: NextLessonCourse[], courseId: string) =>
  courses.find((c) => c.courseId === courseId)?.nextLesson;

describe('GET /api/learners/:learnerId/progress - nextLesson', () => {
  describe('seed data', () => {
    it('reports the first incomplete lesson of each course for learner 1', async () => {
      const courses = await getCourses('/api/learners/1/progress');

      expect(nextOf(courses, 'course-onboarding')).toEqual({
        title: 'Security basics',
        estimatedMinutes: 20,
      });
      expect(nextOf(courses, 'course-leadership')).toEqual({
        title: 'Coaching conversations',
        estimatedMinutes: 15,
      });
      expect(nextOf(courses, 'course-compliance')).toEqual({
        title: 'Quiz',
        estimatedMinutes: 5,
      });
    });

    it('reports the first incomplete lesson for learner 2', async () => {
      const courses = await getCourses('/api/learners/2/progress');

      expect(courses).toHaveLength(1);
      expect(nextOf(courses, 'course-safety')).toEqual({
        title: 'Procedures',
        estimatedMinutes: 20,
      });
    });
  });

  describe('not affected by maxMinutes', () => {
    it('still reports nextLesson on the single course left by maxMinutes=15', async () => {
      const courses = await getCourses('/api/learners/1/progress?maxMinutes=15');

      expect(courses.map((c) => c.courseId)).toEqual(['course-compliance']);
      expect(nextOf(courses, 'course-compliance')).toEqual({
        title: 'Quiz',
        estimatedMinutes: 5,
      });
    });

    it('returns the same nextLesson values as the unfiltered list when maxMinutes=30', async () => {
      const unfiltered = await getCourses('/api/learners/1/progress');
      const filtered = await getCourses('/api/learners/1/progress?maxMinutes=30');

      expect(filtered).toHaveLength(3);
      for (const course of unfiltered) {
        expect(course.nextLesson).toBeTruthy();
        expect(nextOf(filtered, course.courseId)).toEqual(course.nextLesson);
      }
    });
  });
});

/**
 * Edge cases the seed data cannot express. Temporary enrollments are pushed onto the
 * shared `enrollments` array and removed after each test. Jest isolates module registries
 * per test file, so nothing leaks into other files.
 */
describe('nextLesson - edge-case courses injected for learner 1', () => {
  const injected: CourseEnrollment[] = [];

  const inject = (enrollment: CourseEnrollment): void => {
    enrollments.push(enrollment);
    injected.push(enrollment);
  };

  afterEach(() => {
    for (const row of injected.splice(0)) {
      enrollments.splice(enrollments.indexOf(row), 1);
    }
  });

  const emptyCourse = (): CourseEnrollment => ({
    courseId: 'course-test-empty',
    title: 'Course Without Lessons',
    learnerId: 1,
    lessons: [],
    lastActivityAt: new Date().toISOString(),
    status: 'in_progress',
  });

  const finishedCourse = (): CourseEnrollment => ({
    courseId: 'course-test-finished',
    title: 'In Progress But Every Lesson Complete',
    learnerId: 1,
    lessons: [
      { id: 'l1', title: 'First', completed: true, estimatedDurationMinutes: 15 },
      { id: 'l2', title: 'Second', completed: true },
    ],
    lastActivityAt: new Date().toISOString(),
    status: 'in_progress',
  });

  it('has a nextLesson of exactly null for a course with no lessons', async () => {
    inject(emptyCourse());

    const courses = await getCourses('/api/learners/1/progress');

    expect(courses.map((c) => c.courseId)).toContain('course-test-empty');
    expect(nextOf(courses, 'course-test-empty')).toBeNull();
  });

  it('has a nextLesson of exactly null for a course whose lessons are all complete', async () => {
    inject(finishedCourse());

    const courses = await getCourses('/api/learners/1/progress');

    expect(courses.map((c) => c.courseId)).toContain('course-test-finished');
    expect(nextOf(courses, 'course-test-finished')).toBeNull();
  });
});
