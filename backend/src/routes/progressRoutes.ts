import { Router, type Request, type Response, type NextFunction } from 'express';
import { ValidationError } from '../errors';
import { getInProgressCourses } from '../services/progressService';
import type { LearnerProgressResponse } from '../types';

export const progressRouter = Router();

progressRouter.get(
  '/learners/:learnerId/progress',
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const learnerId = parseLearnerId(req.params.learnerId);

      // Fictional trust boundary: req.authenticatedLearnerId (set by the
      // stand-in middleware in app.ts) is what a real check would compare
      // against `learnerId` before returning data — this starter does not
      // enforce it on purpose. e.g.:
      //   if (req.authenticatedLearnerId !== undefined && req.authenticatedLearnerId !== learnerId) {
      //     throw new ForbiddenError(`Learner ${req.authenticatedLearnerId} cannot access learner ${learnerId}'s progress`);
      //   }

      const maxMinutes = parseMaxMinutes(req.query.maxMinutes);

      const courses = getInProgressCourses(learnerId, { maxMinutes });
      const body: LearnerProgressResponse = { learnerId, courses };
      res.json(body);
    } catch (error) {
      next(error);
    }
  },
);

function parseLearnerId(raw: string | string[]): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === undefined) {
    throw new ValidationError('Invalid learner ID: missing');
  }
  const learnerId = Number(value);
  if (!Number.isInteger(learnerId) || learnerId <= 0) {
    throw new ValidationError(`Invalid learner ID: ${value}`);
  }
  return learnerId;
}

// A strict regex rather than Number(): Number('') is 0, Number(' 5 ') is 5 and
// Number('1e2') is 100, so all of those would slip through as valid limits.
function parseMaxMinutes(raw: unknown): number | undefined {
  if (raw === undefined) {
    return undefined;
  }
  if (typeof raw === 'string' && /^[1-9][0-9]*$/.test(raw)) {
    const maxMinutes = Number(raw);
    if (Number.isSafeInteger(maxMinutes)) {
      return maxMinutes;
    }
  }
  throw new ValidationError(`Invalid maxMinutes: ${String(raw)}`);
}
