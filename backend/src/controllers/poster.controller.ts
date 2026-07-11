import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export async function createPoster(req: AuthRequest, res: Response) {
  const { title, design } = req.body;
  const userId = req.userId as string;

  const poster = await prisma.poster.create({
    data: { title, design, userId },
  });

  return res.status(201).json(poster);
}

export async function getMyPosters(req: AuthRequest, res: Response) {
  const posters = await prisma.poster.findMany({
    where: { userId: req.userId },
    orderBy: { updatedAt: 'desc' },
  });

  return res.json(posters);
}

export async function updatePoster(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const poster = await prisma.poster.findUnique({ where: { id } });
  if (!poster) return res.status(404).json({ error: 'Poster no encontrado' });
  if (poster.userId !== req.userId) return res.status(403).json({ error: 'No autorizado' });

  const updated = await prisma.poster.update({ where: { id }, data: req.body });
  return res.json(updated);
}

export async function deletePoster(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const poster = await prisma.poster.findUnique({ where: { id } });
  if (!poster) return res.status(404).json({ error: 'Poster no encontrado' });
  if (poster.userId !== req.userId) return res.status(403).json({ error: 'No autorizado' });

  await prisma.poster.delete({ where: { id } });
  return res.status(204).send();
}
