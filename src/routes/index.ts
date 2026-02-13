import { Router } from 'express';
import gymRoutes from './gym.routes';
import trainerRoutes from './trainer.routes';
import memberRoutes from './member.routes';
import metricRoutes from './metric.routes';
import workoutRoutes from './workout.routes';

const router = Router();

router.use('/gyms', gymRoutes);
router.use('/trainers', trainerRoutes);
router.use('/members', memberRoutes);
router.use('/members', metricRoutes); 
router.use('/sessions', workoutRoutes);

export default router;
