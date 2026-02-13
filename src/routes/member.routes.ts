import { Router } from 'express';
import { enrollMember } from '../controllers/member.controller';

const router = Router();

router.post('/:memberId/enrollments', enrollMember);

export default router;
