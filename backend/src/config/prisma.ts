import { PrismaClient } from '@prisma/client';

// Instancia unica de Prisma para toda la app (buena practica)
const prisma = new PrismaClient();

export default prisma;
