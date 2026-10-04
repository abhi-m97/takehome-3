import { getNextLesson, DEFAULT_LESSON_MINUTES } from '../src/services/progressService';
import type { CourseEnrollment } from '../src/types';

interface LessonSpec {
  title?: string;
  completed: boolean;
  minutes?: number;
}

/** An incomplete lesson, optionally with a title and a duration. */
const todo = (minutes?: number, title?: string): LessonSpec => ({ completed: false, minutes, title });

/** A completed lesson, optionally with a title and a duration. */
const done = (minutes?: number, title?: string): LessonSpec => ({ completed: true, minutes, title });

function makeEnrollment(specs: LessonSpec[]): CourseEnrollment {
  return {
    courseId: 'course-test',
    title: 'Test Course',
    learnerId: 1,
    status: 'in_progress',
    lastActivityAt: '2026-01-01T00:00:00.000Z',
    lessons: specs.map((spec, index) => ({
      id: `l${index + 1}`,
      title: spec.title ?? `Lesson ${index + 1}`,
      completed: spec.completed,
      estimatedDurationMinutes: spec.minutes,
    })),
  };
}

describe('getNextLesson', () => {
  describe('which lesson is next', () => {
    it('returns the first incomplete lesson in array order', () => {
      const enrollment = makeEnrollment([
        done(5, 'Intro'),
        todo(20, 'Security basics'),
        todo(10, 'Team intro'),
      ]);
      expect(getNextLesson(enrollment)).toEqual({ title: 'Security basics', estimatedMinutes: 20 });
    });

    it('returns the first lesson when nothing is complete', () => {
      const enrollment = makeEnrollment([todo(7, 'First'), todo(9, 'Second')]);
      expect(getNextLesson(enrollment)).toEqual({ title: 'First', estimatedMinutes: 7 });
    });

    it('picks the first incomplete lesson even when a later lesson is complete (out-of-order completion)', () => {
      const enrollment = makeEnrollment([
        done(5, 'Done one'),
        todo(12, 'Todo A'),
        done(8, 'Done two'),
        todo(30, 'Todo B'),
      ]);
      expect(getNextLesson(enrollment)).toEqual({ title: 'Todo A', estimatedMinutes: 12 });
    });
  });

  describe('no next lesson', () => {
    it('returns null when every lesson is complete', () => {
      const enrollment = makeEnrollment([done(10), done(), done(25)]);
      expect(getNextLesson(enrollment)).toBeNull();
    });

    it('returns null when the course has no lessons', () => {
      const enrollment = makeEnrollment([]);
      expect(getNextLesson(enrollment)).toBeNull();
    });
  });

  describe('estimatedMinutes', () => {
    it('uses the default when the next lesson has no duration', () => {
      const enrollment = makeEnrollment([todo(undefined, 'No duration')]);
      expect(getNextLesson(enrollment)).toEqual({
        title: 'No duration',
        estimatedMinutes: DEFAULT_LESSON_MINUTES,
      });
    });

    it.each([0, -5, NaN, Infinity, 1.5])(
      'treats an invalid duration of %p as the default',
      (invalidDuration) => {
        const enrollment = makeEnrollment([todo(invalidDuration, 'Odd duration')]);
        expect(getNextLesson(enrollment)).toEqual({
          title: 'Odd duration',
          estimatedMinutes: DEFAULT_LESSON_MINUTES,
        });
      },
    );

    it('ignores the durations of completed lessons', () => {
      const enrollment = makeEnrollment([done(45, 'Done one'), done(30, 'Done two'), todo(8, 'Next')]);
      expect(getNextLesson(enrollment)).toEqual({ title: 'Next', estimatedMinutes: 8 });
    });

    it('does not borrow the duration of a later incomplete lesson', () => {
      const enrollment = makeEnrollment([todo(undefined, 'First'), todo(25, 'Second')]);
      expect(getNextLesson(enrollment)).toEqual({
        title: 'First',
        estimatedMinutes: DEFAULT_LESSON_MINUTES,
      });
    });
  });
});
