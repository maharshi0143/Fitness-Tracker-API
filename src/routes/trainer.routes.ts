import { Router } from 'express';
import { assignTrainer } from '../controllers/trainer.controller';

const router = Router();

router.post('/:trainerId/assignments', assignTrainer);

export default router;
