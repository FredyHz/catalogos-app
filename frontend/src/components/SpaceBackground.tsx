'use client';

import { useEffect, useState, ReactNode } from 'react';

interface Star {
  id: number;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  gold: boolean;
}

interface Meteor {
  id: number;
  top: number;
  duration: number;
  delay: number;
  length: number;
}

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() < 0.15 ? 2.5 : 1.3,
    duration: 2 + Math.random() * 3,
    delay: Math.random() * 5,
    gold: Math.random() < 0.25,
  }));
}

function generateMeteors(count: number): Meteor[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: Math.random() * 60,
    duration: 2.2 + Math.random() * 1.8,
    delay: Math.random() * 8,
    length: 110 + Math.random() * 60,
  }));
}

// Textura de grano vía SVG con feTurbulence, codificada como data-URI
const GRAIN_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E`;

export default function SpaceBackground({
  children,
  starCount = 70,
  meteorCount = 4,
  className = '',
}: {
  children?: ReactNode;
  starCount?: number;
  meteorCount?: number;
  className?: string;
}) {
  const [stars, setStars] = useState<Star[]>([]);
  const [meteors, setMeteors] = useState<Meteor[]>([]);

  useEffect(() => {
    setStars(generateStars(starCount));
    setMeteors(generateMeteors(meteorCount));
  }, [starCount, meteorCount]);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ backgroundColor: '#05060B' }}>
      {/* Degradado base navy profundo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 900px 500px at 20% -10%, rgba(217,169,78,0.10), transparent), radial-gradient(ellipse 700px 500px at 100% 100%, rgba(30,41,90,0.55), transparent), linear-gradient(180deg, #05060B 0%, #0A0E1A 60%, #05060B 100%)',
        }}
      />

      {/* Grano */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url("${GRAIN_SVG}")`, opacity: 0.35 }}
      />

      {/* Estrellas */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((s) => (
          <span
            key={s.id}
            className="absolute rounded-full"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              backgroundColor: s.gold ? '#E8C97A' : '#F5F5F7',
              animation: `sfTwinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
              boxShadow: s.gold ? '0 0 4px rgba(232,201,122,0.8)' : '0 0 3px rgba(255,255,255,0.6)',
            }}
          />
        ))}
      </div>

      {/* Meteoros */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {meteors.map((m) => (
          <span
            key={m.id}
            className="absolute"
            style={{
              top: `${m.top}%`,
              left: '-15%',
              width: m.length,
              height: 2,
              background: 'linear-gradient(90deg, transparent, #E8C97A, #FFFFFF, transparent)',
              transform: 'rotate(-30deg)',
              animation: `sfMeteor ${m.duration}s linear ${m.delay}s infinite`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">{children}</div>

      <style>{`
        @keyframes sfTwinkle {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
        @keyframes sfMeteor {
          0% { transform: translate(0, 0) rotate(-30deg); opacity: 0; }
          8% { opacity: 1; }
          25% { transform: translate(140vw, 90vh) rotate(-30deg); opacity: 0; }
          100% { transform: translate(140vw, 90vh) rotate(-30deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}