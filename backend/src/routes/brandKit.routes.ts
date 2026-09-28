import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getBrandKit, updateBrandKit, uploadBrandLogo } from '../controllers/brandKit.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `logo-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

router.get('/', requireAuth, getBrandKit);
router.put('/', requireAuth, updateBrandKit);
router.post('/logo', requireAuth, upload.single('logo'), uploadBrandLogo);

export default router;