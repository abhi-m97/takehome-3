import {
  estimateMinutesRemaining,
  DEFAULT_LESSON_MINUTES,
} from '../src/services/progressService';
import type { CourseEnrollment } from '../src/types';

interface LessonSpec {
  completed: boolean;
  minutes?: number;
}

/** An incomplete lesson, optionally with a duration. */
const todo = (minutes?: number): LessonSpec => ({ completed: false, minutes });

/** A completed lesson, optionally with a duration. */
const done = (minutes?: number): LessonSpec => ({ completed: true, minutes });

function makeEnrollment(specs: LessonSpec[]): CourseEnrollment {
  return {
    courseId: 'course-test',
    title: 'Test Course',
    learnerId: 1,
    status: 'in_progress',
    lastActivityAt: '2026-01-01T00:00:00.000Z',
    lessons: specs.map((spec, index) => ({
      id: `l${index + 1}`,
      title: `Lesson ${index + 1}`,
      completed: spec.completed,
      estimatedDurationMinutes: spec.minutes,
    })),
  };
}

describe('estimateMinutesRemaining', () => {
  describe('which lessons count', () => {
    it('sums the durations of incomplete lessons only', () => {
      const enrollment = makeEnrollment([done(40), todo(5), todo(7)]);
      expect(estimateMinutesRemaining(enrollment)).toBe(12);
    });

    it('ignores completed lessons even when they have durations', () => {
      const enrollment = makeEnrollment([done(30), done(45), todo(8)]);
      expect(estimateMinutesRemaining(enrollment)).toBe(8);
    });
  });

  describe('missing durations', () => {
    it('counts one incomplete lesson without a duration as the default', () => {
      const enrollment = makeEnrollment([todo(5), todo()]);
      expect(estimateMinutesRemaining(enrollment)).toBe(5 + DEFAULT_LESSON_MINUTES);
    });

    it('uses remaining lessons x default when no incomplete lesson has a duration', () => {
      const enrollment = makeEnrollment([done(), todo(), todo(), todo()]);
      expect(estimateMinutesRemaining(enrollment)).toBe(3 * DEFAULT_LESSON_MINUTES);
    });

    it('does not apply the default to a completed lesson without a duration', () => {
      const enrollment = makeEnrollment([done(), todo(6)]);
      expect(estimateMinutesRemaining(enrollment)).toBe(6);
    });
  });

  describe('invalid durations', () => {
    it.each([0, -5, NaN, Infinity, 1.5])(
      'treats an incomplete lesson with duration %p as the default',
      (invalidDuration) => {
        const enrollment = makeEnrollment([todo(invalidDuration)]);
        expect(estimateMinutesRemaining(enrollment)).toBe(DEFAULT_LESSON_MINUTES);
      },
    );

    it.each([0, -5, NaN, Infinity, 1.5])(
      'adds the default alongside valid durations when another lesson has duration %p',
      (invalidDuration) => {
        const enrollment = makeEnrollment([todo(4), todo(invalidDuration)]);
        expect(estimateMinutesRemaining(enrollment)).toBe(4 + DEFAULT_LESSON_MINUTES);
      },
    );
  });

  describe('empty and finished courses', () => {
    it('returns 0 when every lesson is complete', () => {
      const enrollment = makeEnrollment([done(10), done(), done(25)]);
      expect(estimateMinutesRemaining(enrollment)).toBe(0);
    });

    it('returns null (no estimate) when the course has no lessons', () => {
      const enrollment = makeEnrollment([]);
      expect(estimateMinutesRemaining(enrollment)).toBeNull();
    });
  });
});
