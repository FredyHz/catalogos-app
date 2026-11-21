import { Router } from 'express';
import multer from 'multer';
import { getBrandKit, updateBrandKit, uploadBrandLogo } from '../controllers/brandKit.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// El archivo se queda en memoria y de ahí se sube a Cloudinary (ya no se escribe en disco)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

router.get('/', requireAuth, getBrandKit);
router.put('/', requireAuth, updateBrandKit);
router.post('/logo', requireAuth, upload.single('logo'), uploadBrandLogo);

export default router;