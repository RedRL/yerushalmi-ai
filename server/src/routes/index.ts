import { Router } from 'express';
import { healthRouter } from './health.routes';
import { inquiriesRouter } from './inquiries.routes';
import { uploadsRouter } from './uploads.routes';

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(inquiriesRouter);
apiRouter.use(uploadsRouter);
