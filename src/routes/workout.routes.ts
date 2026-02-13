import { Router } from 'express';
import { addExercise, createWorkout } from '../controllers/workout.controller';

const router = Router();

router.post('/', createWorkout); // To create a session
router.post('/:sessionId/exercises', addExercise);

export default router;
