import request from 'supertest';
import { createApp } from '../src/app';
import { enrollments } from '../src/data/seed';

describe('GET /health', () => {
  it('returns ok', async () => {
    const app = createApp();
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('GET /api/learners/:learnerId/progress', () => {
  const app = createApp();

  it('returns 400 for invalid learner id', async () => {
    const res = await request(app).get('/api/learners/abc/progress');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid learner id/i);
  });

  it('returns 404 for unknown learner', async () => {
    const res = await request(app).get('/api/learners/999/progress');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('returns only in-progress courses for learner 1', async () => {
    const res = await request(app).get('/api/learners/1/progress');
    expect(res.status).toBe(200);
    expect(res.body.learnerId).toBe(1);

    const courses = res.body.courses;
    expect(courses.length).toBe(3);

    const courseIds = courses.map((c: { courseId: string }) => c.courseId);
    expect(courseIds).toEqual(
      expect.arrayContaining([
        'course-onboarding',
        'course-leadership',
        'course-compliance',
      ]),
    );
    expect(courseIds).not.toContain('course-completed-sample');
    expect(courseIds).not.toContain('course-not-started');
  });

  it('includes required fields with computed completion percentage', async () => {
    const res = await request(app).get('/api/learners/1/progress');
    const onboarding = res.body.courses.find(
      (c: { courseId: string }) => c.courseId === 'course-onboarding',
    );
    const seedOnboarding = enrollments.find((e) => e.courseId === 'course-onboarding');

    expect(onboarding).toMatchObject({
      courseId: 'course-onboarding',
      title: 'New Hire Onboarding',
      completionPercentage: 50,
      lastActivityAt: seedOnboarding?.lastActivityAt,
      status: 'in_progress',
    });
  });

  it('flags stale courses inactive for more than 30 days, but not recent ones', async () => {
    const res = await request(app).get('/api/learners/1/progress');
    const compliance = res.body.courses.find(
      (c: { courseId: string }) => c.courseId === 'course-compliance',
    );
    const onboarding = res.body.courses.find(
      (c: { courseId: string }) => c.courseId === 'course-onboarding',
    );
    const leadership = res.body.courses.find(
      (c: { courseId: string }) => c.courseId === 'course-leadership',
    );

    expect(compliance).toBeDefined();
    expect(compliance.isStale).toBe(true);
    expect(onboarding.isStale).toBeFalsy();
    expect(leadership.isStale).toBeFalsy();
  });

  it('sorts courses by lastActivityAt descending', async () => {
    const res = await request(app).get('/api/learners/1/progress');
    const timestamps = res.body.courses.map(
      (c: { lastActivityAt: string }) => c.lastActivityAt,
    );

    const sorted = [...timestamps].sort(
      (a: string, b: string) => new Date(b).getTime() - new Date(a).getTime(),
    );
    expect(timestamps).toEqual(sorted);
  });

  it('returns a single in-progress course for learner 2', async () => {
    const res = await request(app).get('/api/learners/2/progress');
    expect(res.status).toBe(200);
    expect(res.body.courses).toHaveLength(1);
    expect(res.body.courses[0].courseId).toBe('course-safety');
  });
});
