import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();



// GET /api/brand-kit — obtener el kit de marca del usuario logueado
export const getBrandKit = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        businessName: true,
        logoUrl: true,
        brandColor: true,
        brandSecondaryColor: true,
        brandAccentColor: true,
        brandFont: true,
        whatsappNumber: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Error al obtener kit de marca:', error);
    return res.status(500).json({ error: 'Error al obtener kit de marca' });
  }
};

// PUT /api/brand-kit — actualizar el kit de marca
export const updateBrandKit = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { businessName, brandColor, brandSecondaryColor, brandAccentColor, brandFont, whatsappNumber } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        businessName,
        brandColor,
        brandSecondaryColor,
        brandAccentColor,
        brandFont,
        whatsappNumber,
      },
     select: {
        businessName: true,
        logoUrl: true,
        brandColor: true,
        brandSecondaryColor: true,
        brandAccentColor: true,
        brandFont: true,
        whatsappNumber: true,
      },
    });

    return res.json(updatedUser);
  } catch (error) {
    console.error('Error al actualizar kit de marca:', error);
    return res.status(500).json({ error: 'Error al actualizar kit de marca' });
  }
};

// POST /api/brand-kit/logo — subir/actualizar el logo
export const uploadBrandLogo = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }


    const logoUrl = `/uploads/${req.file.filename}`;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { logoUrl },
      select: { logoUrl: true },
    });

    return res.json(updatedUser);
  } catch (error) {
    console.error('Error al subir logo:', error);
    return res.status(500).json({ error: 'Error al subir logo' });
  }
};