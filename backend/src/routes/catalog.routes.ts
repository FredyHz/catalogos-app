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

const router = Router();

// Ruta publica (para ver el catalogo compartido, sin login)
router.get('/public/:slug', getCatalogBySlug);

// Rutas protegidas (requieren estar autenticado)
router.post('/', requireAuth, createCatalog);
router.get('/', requireAuth, getMyCatalogs);
router.get('/:id', requireAuth, getCatalogById);
router.put('/:id', requireAuth, updateCatalog);
router.delete('/:id', requireAuth, deleteCatalog);

export default router;
