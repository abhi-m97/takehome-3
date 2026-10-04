import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { AppError } from './errors';
import { progressRouter } from './routes/progressRoutes';

declare module 'express-serve-static-core' {
  interface Request {
    /**
     * Fictional stand-in for what real auth middleware would set from a
     * verified session/JWT — never trust the `:learnerId` route param for
     * access control on its own. Undefined unless the
     * `x-authenticated-learner-id` header is sent; this starter does not
     * enforce it (see the comment in progressRoutes.ts).
     */
    authenticatedLearnerId?: number;
  }
}

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use((req: Request, _res: Response, next: NextFunction) => {
    const header = req.header('x-authenticated-learner-id');
    if (header !== undefined) {
      req.authenticatedLearnerId = Number(header);
    }
    next();
  });

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.use('/api', progressRouter);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }

    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
