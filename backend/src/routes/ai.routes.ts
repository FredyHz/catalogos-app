import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { generateImage } from '../controllers/ai.controller';

const router = Router();

router.post('/generate-image', requireAuth, generateImage);

export default router;