import { Response } from 'express';
import { v4 as uuid } from 'uuid';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// Crear un nuevo catalogo
export async function createCatalog(req: AuthRequest, res: Response) {
  try {
    const { title, category, templateId } = req.body;
    const userId = req.userId as string;

    // genera un slug unico legible, ej: "carniceria-lopez-8f3a1b"
    const baseSlug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const slug = `${baseSlug}-${uuid().slice(0, 6)}`;

    const catalog = await prisma.catalog.create({
      data: { title, category, templateId, userId, slug },
    });

    return res.status(201).json(catalog);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al crear el catalogo' });
  }
}

// Listar catalogos del usuario autenticado
export async function getMyCatalogs(req: AuthRequest, res: Response) {
  const userId = req.userId as string;

  const catalogs = await prisma.catalog.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { products: true } } },
  });

  return res.json(catalogs);
}

// Obtener un catalogo por id (para editarlo, requiere ser el dueño)
export async function getCatalogById(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const catalog = await prisma.catalog.findUnique({
    where: { id },
    include: { products: { orderBy: { order: 'asc' } }, template: true },
  });

  if (!catalog) return res.status(404).json({ error: 'Catalogo no encontrado' });
  if (catalog.userId !== req.userId) return res.status(403).json({ error: 'No autorizado' });

  return res.json(catalog);
}

// Obtener catalogo publico por slug (sin autenticacion, para el link compartible)
export async function getCatalogBySlug(req: AuthRequest, res: Response) {
  const { slug } = req.params;

  const catalog = await prisma.catalog.findUnique({
    where: { slug },
    include: { products: { orderBy: { order: 'asc' } }, template: true },
  });

  if (!catalog || !catalog.isPublished) {
    return res.status(404).json({ error: 'Catalogo no encontrado' });
  }

  // incrementa el contador de vistas
  await prisma.catalog.update({
    where: { slug },
    data: { viewCount: { increment: 1 } },
  });

  return res.json(catalog);
}

// Actualizar catalogo (diseño, titulo, categoria, publicacion)
export async function updateCatalog(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const catalog = await prisma.catalog.findUnique({ where: { id } });
  if (!catalog) return res.status(404).json({ error: 'Catalogo no encontrado' });
  if (catalog.userId !== req.userId) return res.status(403).json({ error: 'No autorizado' });

  const updated = await prisma.catalog.update({
    where: { id },
    data: req.body,
  });

  return res.json(updated);
}

// Eliminar catalogo
export async function deleteCatalog(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const catalog = await prisma.catalog.findUnique({ where: { id } });
  if (!catalog) return res.status(404).json({ error: 'Catalogo no encontrado' });
  if (catalog.userId !== req.userId) return res.status(403).json({ error: 'No autorizado' });

  await prisma.catalog.delete({ where: { id } });
  return res.status(204).send();
}
