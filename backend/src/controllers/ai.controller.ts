import { Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AuthRequest } from '../middleware/auth.middleware';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateImage(req: AuthRequest, res: Response) {
  const { prompt } = req.body;

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Falta la descripción de la imagen' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

    const result = await model.generateContent(prompt);
    const response = result.response;

    const parts = response.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p: any) => p.inlineData);

    if (!imagePart || !imagePart.inlineData) {
      return res.status(500).json({ error: 'No se pudo generar la imagen' });
    }

    const base64Data = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType || 'image/png';
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    return res.json({ image: dataUrl });
  } catch (err: any) {
    console.error('Error generando imagen con Gemini:', err.message || err);
    return res.status(500).json({ error: 'Error al generar la imagen con IA' });
  }
}