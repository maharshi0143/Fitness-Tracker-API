import { Router } from 'express';
import { createMetric } from '../controllers/metric.controller';

const router = Router();

router.post('/:memberId/metrics', createMetric);

export default router;
