import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import catalogRoutes from './routes/catalog.routes';
import productRoutes from './routes/product.routes';
import posterRoutes from './routes/poster.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // limite alto por si mandan imagenes en base64
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/catalogs', catalogRoutes);
app.use('/api/products', productRoutes);
app.use('/api/posters', posterRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
