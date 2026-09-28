import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { AuthRequest } from '../middleware/auth.middleware';

export async function generateShareImage(req: AuthRequest, res: Response) {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'Falta la imagen' });
  }

  const matches = image.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) {
    return res.status(400).json({ error: 'Formato de imagen inválido' });
  }

  const ext = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');

  const filename = `poster-${Date.now()}.${ext}`;
  const uploadsDir = path.join(__dirname, '../../uploads');

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, buffer);

  const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
  const publicUrl = `${baseUrl}/uploads/${filename}`;

  return res.json({ url: publicUrl });
}