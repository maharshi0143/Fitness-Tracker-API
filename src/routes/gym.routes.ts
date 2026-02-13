import { Router } from 'express';
import { createGym } from '../controllers/gym.controller';

const router = Router();

router.post('/', createGym);

export default router;
