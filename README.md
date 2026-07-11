# Catálogos App

Plataforma para crear catálogos y posters personalizables para cualquier tipo
de negocio (carnes, ropa, zapatos, etc.), exportables a PDF y compartibles con link.

## Estructura del proyecto

```
catalogos-app/
├── backend/       API en Node.js + Express + TypeScript + Prisma
└── frontend/      Next.js + TypeScript + Tailwind CSS
```

## Requisitos previos

- Node.js 18 o superior
- Una base de datos PostgreSQL (puedes usar [Neon](https://neon.tech),
  [Supabase](https://supabase.com) o [Railway](https://railway.app) gratis, o instalar
  Postgres local)
- Cuenta gratuita en [Cloudinary](https://cloudinary.com) (para subir imágenes)

## 1. Levantar el backend

```bash
cd backend
npm install
cp .env.example .env
```

Edita el archivo `.env` con tu `DATABASE_URL` real y un `JWT_SECRET`.

```bash
npm run prisma:migrate   # crea las tablas en tu base de datos
npm run dev              # levanta el servidor en http://localhost:4000
```

Prueba que funcione entrando a `http://localhost:4000/api/health` — debería
responder `{"status":"ok"}`.

## 2. Levantar el frontend

En otra terminal:

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev              # levanta el sitio en http://localhost:3000
```

## 3. Subir a GitHub

Desde la raíz del proyecto (`catalogos-app/`):

```bash
git init
git add .
git commit -m "Estructura inicial del proyecto"
git branch -M main
git remote add origin <URL-de-tu-repositorio-en-GitHub>
git push -u origin main
```

## Qué ya está armado

- Registro / login de usuarios con JWT
- Modelo de datos (Prisma) para: usuarios, catálogos, productos, plantillas y posters
- CRUD de catálogos y productos protegido por autenticación
- Ruta pública para ver un catálogo por su link (`/c/[slug]`)
- Contador de vistas por catálogo
- Página de login y dashboard básico conectados al backend

## Lo que sigue (próximos pasos sugeridos)

1. Editor visual de catálogos/posters (drag & drop con Fabric.js o Konva.js)
2. Generación de PDF a partir del catálogo (Puppeteer)
3. Subida de imágenes a Cloudinary
4. Plantillas prediseñadas por categoría de negocio
5. Kit de marca (logo, color y fuente guardados por usuario)
