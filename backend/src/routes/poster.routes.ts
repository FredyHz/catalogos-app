import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { createPoster, getMyPosters, updatePoster, deletePoster } from '../controllers/poster.controller';

const router = Router();

router.post('/', requireAuth, createPoster);
router.get('/', requireAuth, getMyPosters);
router.put('/:id', requireAuth, updatePoster);
router.delete('/:id', requireAuth, deletePoster);

export default router;
