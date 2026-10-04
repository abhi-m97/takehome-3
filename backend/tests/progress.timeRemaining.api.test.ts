import request from 'supertest';
import { createApp } from '../src/app';
import { enrollments } from '../src/data/seed';
import type { CourseEnrollment } from '../src/types';

interface TimedCourse {
  courseId: string;
  lessonsCompleted: number;
  lessonsTotal: number;
  estimatedMinutesRemaining: number | null;
  isStale?: boolean;
}

const app = createApp();

async function getCourses(path: string): Promise<TimedCourse[]> {
  const res = await request(app).get(path);
  expect(res.status).toBe(200);
  return res.body.courses;
}

const idsOf = (courses: TimedCourse[]): string[] => courses.map((c) => c.courseId);

describe('GET /api/learners/:learnerId/progress - estimated time remaining', () => {
  describe('derived fields on each course', () => {
    it('reports lessonsCompleted, lessonsTotal and estimatedMinutesRemaining for learner 1', async () => {
      const courses = await getCourses('/api/learners/1/progress');
      const byId = (id: string) => courses.find((c) => c.courseId === id);

      expect(byId('course-onboarding')).toMatchObject({
        lessonsCompleted: 2,
        lessonsTotal: 4,
        estimatedMinutesRemaining: 30,
      });
      expect(byId('course-leadership')).toMatchObject({
        lessonsCompleted: 1,
        lessonsTotal: 3,
        estimatedMinutesRemaining: 25,
      });
      expect(byId('course-compliance')).toMatchObject({
        lessonsCompleted: 1,
        lessonsTotal: 2,
        estimatedMinutesRemaining: 5,
      });
    });

    it('reports the derived fields for learner 2', async () => {
      const courses = await getCourses('/api/learners/2/progress');

      expect(courses).toHaveLength(1);
      expect(courses[0]).toMatchObject({
        courseId: 'course-safety',
        lessonsCompleted: 1,
        lessonsTotal: 2,
        estimatedMinutesRemaining: 20,
      });
    });
  });

  describe('maxMinutes filter', () => {
    it('keeps only courses at or under 5 minutes (inclusive boundary): compliance', async () => {
      const courses = await getCourses('/api/learners/1/progress?maxMinutes=5');
      expect(idsOf(courses)).toEqual(['course-compliance']);
    });

    it('includes a course whose estimate equals maxMinutes and excludes the one above: 25 keeps leadership and compliance, not onboarding', async () => {
      const courses = await getCourses('/api/learners/1/progress?maxMinutes=25');
      expect(idsOf(courses)).toEqual(['course-leadership', 'course-compliance']);
      expect(idsOf(courses)).not.toContain('course-onboarding');
    });

    it('returns all three courses when maxMinutes equals the largest estimate (30)', async () => {
      const courses = await getCourses('/api/learners/1/progress?maxMinutes=30');
      expect(idsOf(courses)).toHaveLength(3);
      expect(idsOf(courses)).toEqual(
        expect.arrayContaining(['course-onboarding', 'course-leadership', 'course-compliance']),
      );
    });

    it('returns 200 with an empty course list (not 404) when no course fits under maxMinutes', async () => {
      const res = await request(app).get('/api/learners/1/progress?maxMinutes=1');

      expect(res.status).toBe(200);
      expect(res.body.learnerId).toBe(1);
      expect(res.body.courses).toEqual([]);
    });

    it('returns an empty list for learner 2 when maxMinutes is below the estimate (10 < 20)', async () => {
      const courses = await getCourses('/api/learners/2/progress?maxMinutes=10');
      expect(courses).toEqual([]);
    });

    it('returns learner 2 course-safety when maxMinutes equals its estimate (20)', async () => {
      const courses = await getCourses('/api/learners/2/progress?maxMinutes=20');
      expect(idsOf(courses)).toEqual(['course-safety']);
    });
  });

  describe('invalid maxMinutes', () => {
    it.each(['abc', '0', '-5', '1.5', ''])(
      'rejects maxMinutes=%p with 400 (must be a positive integer)',
      async (value) => {
        const res = await request(app).get(
          `/api/learners/1/progress?maxMinutes=${encodeURIComponent(value)}`,
        );

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/invalid maxMinutes/i);
      },
    );

    it('rejects a repeated maxMinutes parameter with 400', async () => {
      const res = await request(app).get('/api/learners/1/progress?maxMinutes=10&maxMinutes=20');

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/invalid maxMinutes/i);
    });
  });

  describe('behaviour that must not change', () => {
    it('without query params, lists learner 1 courses by most recent activity first', async () => {
      const courses = await getCourses('/api/learners/1/progress');
      expect(idsOf(courses)).toEqual([
        'course-leadership',
        'course-onboarding',
        'course-compliance',
      ]);
    });

    it('with maxMinutes=30, keeps the same order and the same isStale flags', async () => {
      const courses = await getCourses('/api/learners/1/progress?maxMinutes=30');

      expect(idsOf(courses)).toEqual([
        'course-leadership',
        'course-onboarding',
        'course-compliance',
      ]);

      const byId = (id: string) => courses.find((c) => c.courseId === id);
      expect(byId('course-compliance')?.isStale).toBe(true);
      expect(byId('course-leadership')?.isStale).toBeFalsy();
      expect(byId('course-onboarding')?.isStale).toBeFalsy();
    });
  });

  describe('order of validation checks', () => {
    it('returns 404 for an unknown learner when maxMinutes is valid', async () => {
      const res = await request(app).get('/api/learners/999/progress?maxMinutes=10');
      expect(res.status).toBe(404);
    });

    it('reports an invalid learner ID before an invalid maxMinutes', async () => {
      const res = await request(app).get('/api/learners/abc/progress?maxMinutes=abc');

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/invalid learner id/i);
    });

    it('reports an invalid maxMinutes (400) before an unknown learner (404)', async () => {
      const res = await request(app).get('/api/learners/999/progress?maxMinutes=abc');

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/invalid maxMinutes/i);
    });
  });
});

/**
 * Edge cases the seed data cannot express. Temporary enrollments are pushed onto the
 * shared `enrollments` array and removed after each test. Jest isolates module registries
 * per test file, so nothing leaks into other files. Assertions use course IDs (and the
 * injected course's own fields) only, because the extra rows change the counts.
 */
describe('estimated time remaining - edge-case courses injected for learner 1', () => {
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

  describe('course with no lessons', () => {
    it('is excluded when maxMinutes is present, because it has no estimate', async () => {
      inject(emptyCourse());

      const courses = await getCourses('/api/learners/1/progress?maxMinutes=1000');
      expect(idsOf(courses)).not.toContain('course-test-empty');
    });

    it('is still listed without maxMinutes, with a null estimate (not 0) and zero lessons', async () => {
      inject(emptyCourse());

      const courses = await getCourses('/api/learners/1/progress');
      const empty = courses.find((c) => c.courseId === 'course-test-empty');

      expect(empty).toBeDefined();
      expect(empty?.lessonsTotal).toBe(0);
      expect(empty?.estimatedMinutesRemaining).toBeNull();
    });
  });

  describe('in-progress course with every lesson complete', () => {
    it('has an estimate of exactly 0, even though a completed lesson has a duration', async () => {
      inject(finishedCourse());

      const courses = await getCourses('/api/learners/1/progress');
      const finished = courses.find((c) => c.courseId === 'course-test-finished');

      expect(finished).toBeDefined();
      expect(finished?.estimatedMinutesRemaining).toBe(0);
    });

    it('is included when maxMinutes is present, because 0 is within any positive limit', async () => {
      inject(finishedCourse());

      const courses = await getCourses('/api/learners/1/progress?maxMinutes=1');
      expect(idsOf(courses)).toContain('course-test-finished');
    });
  });

  it('leaves no injected courses behind after each test', async () => {
    const courses = await getCourses('/api/learners/1/progress');
    expect(idsOf(courses)).not.toContain('course-test-empty');
    expect(idsOf(courses)).not.toContain('course-test-finished');
  });
});
