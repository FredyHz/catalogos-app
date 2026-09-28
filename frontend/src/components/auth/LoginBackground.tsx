'use client';

import { useMemo } from 'react';

// Formas que replican los primitivos del editor (rect, circle, triangle, star, line)
// flotando de fondo — el login usa el mismo lenguaje visual que el producto.
const SHAPE_TYPES = ['rect', 'circle', 'triangle', 'star', 'line'] as const;

interface FloatingShape {
  id: number;
  type: (typeof SHAPE_TYPES)[number];
  top: string;
  left: string;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

function generateShapes(count: number): FloatingShape[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    type: SHAPE_TYPES[i % SHAPE_TYPES.length],
    top: `${Math.random() * 90}%`,
    left: `${Math.random() * 90}%`,
    size: 40 + Math.random() * 80,
    duration: 18 + Math.random() * 14,
    delay: Math.random() * -20,
    opacity: 0.08 + Math.random() * 0.1,
  }));
}

function ShapeSvg({ type, size }: { type: FloatingShape['type']; size: number }) {
  const stroke = '#ffffff';
  switch (type) {
    case 'rect':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <rect x="10" y="10" width="80" height="80" rx="12" fill="none" stroke={stroke} strokeWidth="3" />
        </svg>
      );
    case 'circle':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke={stroke} strokeWidth="3" />
        </svg>
      );
    case 'triangle':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <polygon points="50,10 90,90 10,90" fill="none" stroke={stroke} strokeWidth="3" />
        </svg>
      );
    case 'star':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <polygon
            points="50,5 61,38 96,38 68,59 79,92 50,71 21,92 32,59 4,38 39,38"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
          />
        </svg>
      );
    case 'line':
      return (
        <svg width={size} height={size * 0.3} viewBox="0 0 100 30">
          <line x1="5" y1="15" x2="95" y2="15" stroke={stroke} strokeWidth="3" />
        </svg>
      );
  }
}

export default function LoginBackground() {
  const shapes = useMemo(() => generateShapes(14), []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600 animate-gradient-shift bg-[length:200%_200%]" />

      {/* Formas flotantes — los mismos primitivos del editor */}
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className="absolute animate-float"
          style={{
            top: shape.top,
            left: shape.left,
            opacity: shape.opacity,
            animationDuration: `${shape.duration}s`,
            animationDelay: `${shape.delay}s`,
          }}
        >
          <ShapeSvg type={shape.type} size={shape.size} />
        </div>
      ))}

      {/* Viñeta suave para legibilidad del formulario */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-900/40 via-transparent to-transparent" />
    </div>
  );
}