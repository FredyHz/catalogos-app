import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { uploadBuffer } from '../config/cloudinary';

export async function generateShareImage(req: AuthRequest, res: Response) {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'Falta la imagen' });
  }

  const matches = image.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) {
    return res.status(400).json({ error: 'Formato de imagen inválido' });
  }

  try {
    const buffer = Buffer.from(matches[2], 'base64');
    const publicUrl = await uploadBuffer(buffer, 'stylefreds/compartidos');
    return res.json({ url: publicUrl });
  } catch (error) {
    console.error('Error al subir imagen para compartir:', error);
    return res.status(500).json({ error: 'No se pudo subir la imagen' });
  }
}