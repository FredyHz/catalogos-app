import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { addProduct, updateProduct, deleteProduct } from '../controllers/product.controller';

const router = Router();

router.post('/', requireAuth, addProduct);
router.put('/:id', requireAuth, updateProduct);
router.delete('/:id', requireAuth, deleteProduct);

export default router;
