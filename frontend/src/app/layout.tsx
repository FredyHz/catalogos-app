import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catalogos App',
  description: 'Crea catalogos y posters para tu negocio',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
