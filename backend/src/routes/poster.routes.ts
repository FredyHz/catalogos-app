import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { createPoster, getMyPosters, getPosterById, updatePoster, deletePoster } from '../controllers/poster.controller';
import { exportPosterToPDF } from '../controllers/pdf.controller';
import { generateShareImage } from '../controllers/share.controller';

const router = Router();

router.post('/', requireAuth, createPoster);
router.get('/', requireAuth, getMyPosters);
router.post('/export-pdf', requireAuth, exportPosterToPDF);
router.post('/share-image', requireAuth, generateShareImage);
router.get('/:id', requireAuth, getPosterById);
router.put('/:id', requireAuth, updatePoster);
router.delete('/:id', requireAuth, deletePoster);

export default router;
