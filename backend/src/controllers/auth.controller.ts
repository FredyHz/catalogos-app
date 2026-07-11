import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

export async function register(req: Request, res: Response) {
  try {
    const { email, password, name, businessName } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Ese correo ya esta registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, businessName },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: '7d',
    });

    return res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, businessName: user.businessName },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al registrar usuario' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: '7d',
    });

    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, businessName: user.businessName },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al iniciar sesion' });
  }
}
