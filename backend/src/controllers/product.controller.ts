import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// Ayudante: verifica que el catalogo pertenezca al usuario autenticado
async function verifyCatalogOwnership(catalogId: string, userId: string) {
  const catalog = await prisma.catalog.findUnique({ where: { id: catalogId } });
  if (!catalog || catalog.userId !== userId) return false;
  return true;
}

export async function addProduct(req: AuthRequest, res: Response) {
  const { catalogId, name, description, price, imageUrl, attributes, order } = req.body;

  const isOwner = await verifyCatalogOwnership(catalogId, req.userId as string);
  if (!isOwner) return res.status(403).json({ error: 'No autorizado' });

  const product = await prisma.product.create({
    data: { catalogId, name, description, price, imageUrl, attributes, order: order ?? 0 },
  });

  return res.status(201).json(product);
}

export async function updateProduct(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const product = await prisma.product.findUnique({ where: { id }, include: { catalog: true } });
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  if (product.catalog.userId !== req.userId) return res.status(403).json({ error: 'No autorizado' });

  const updated = await prisma.product.update({ where: { id }, data: req.body });
  return res.json(updated);
}

export async function deleteProduct(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const product = await prisma.product.findUnique({ where: { id }, include: { catalog: true } });
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  if (product.catalog.userId !== req.userId) return res.status(403).json({ error: 'No autorizado' });

  await prisma.product.delete({ where: { id } });
  return res.status(204).send();
}
