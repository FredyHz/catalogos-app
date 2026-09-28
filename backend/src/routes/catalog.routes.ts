import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  createCatalog,
  getMyCatalogs,
  getCatalogById,
  getCatalogBySlug,
  updateCatalog,
  deleteCatalog,
} from '../controllers/catalog.controller';
import { exportCatalogToPDF } from '../controllers/pdf.controller';

const router = Router();

router.get('/public/:slug', getCatalogBySlug);

router.post('/', requireAuth, createCatalog);
router.get('/', requireAuth, getMyCatalogs);
router.post('/export-pdf', requireAuth, exportCatalogToPDF);
router.get('/:id', requireAuth, getCatalogById);
router.put('/:id', requireAuth, updateCatalog);
router.delete('/:id', requireAuth, deleteCatalog);

export default router;