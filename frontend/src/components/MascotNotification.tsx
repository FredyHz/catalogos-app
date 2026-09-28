'use client';

import { useEffect, useRef, useState } from 'react';
import { MASCOT_EVENT_NAME, MascotDetail, MascotType } from '@/lib/mascotBus';

const TYPE_STYLES: Record<MascotType, { bubble: string; icon: string; ring: string }> = {
  success: { bubble: 'bg-white border-brand-200', icon: '✓', ring: 'ring-brand-400' },
  error: { bubble: 'bg-white border-red-200', icon: '✕', ring: 'ring-red-400' },
  info: { bubble: 'bg-white border-sky-200', icon: 'i', ring: 'ring-sky-400' },
};

const TYPE_ICON_BG: Record<MascotType, string> = {
  success: 'bg-brand-600',
  error: 'bg-red-500',
  info: 'bg-sky-500',
};

export default function MascotNotification() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [detail, setDetail] = useState<MascotDetail>({ message: '', type: 'success' });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<MascotDetail>;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);

      setDetail(custom.detail);
      setLeaving(false);
      setVisible(true);

      timeoutRef.current = setTimeout(() => {
        setLeaving(true);
        leaveTimeoutRef.current = setTimeout(() => setVisible(false), 350);
      }, 2600);
    };

    window.addEventListener(MASCOT_EVENT_NAME, handler);
    return () => {
      window.removeEventListener(MASCOT_EVENT_NAME, handler);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    };
  }, []);

  if (!visible) return null;

  const styles = TYPE_STYLES[detail.type];
  const iconBg = TYPE_ICON_BG[detail.type];

  return (
    <div
      className="fixed bottom-5 right-5 z-[100] flex items-end gap-3 pointer-events-none select-none"
      style={{ animation: leaving ? 'sfMascotOut .35s ease-in forwards' : 'sfMascotIn .5s cubic-bezier(.34,1.56,.64,1)' }}
    >
      {/* Globo de diálogo */}
      <div
        className={`mb-4 max-w-[220px] rounded-2xl rounded-br-sm border px-4 py-2.5 shadow-lg ${styles.bubble}`}
        style={{ animation: 'sfBubbleIn .35s ease-out .15s both' }}
      >
        <div className="flex items-center gap-2">
          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${iconBg}`}>
            {styles.icon}
          </span>
          <p className="text-sm font-medium text-gray-700 leading-snug">{detail.message}</p>
        </div>
      </div>

      {/* Mascota SVG */}
      <div className="relative h-16 w-16 shrink-0" style={{ animation: 'sfMascotFloat 2.4s ease-in-out infinite' }}>
        <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-lg">
          {/* Capa */}
          <path
            d="M30 45 C15 55 10 75 18 88 C24 78 30 72 38 68 Z"
            fill="#EC4899"
            style={{ transformOrigin: '30px 55px', animation: 'sfCapeFlutter 1.2s ease-in-out infinite' }}
          />
          {/* Cuerpo */}
          <ellipse cx="50" cy="62" rx="22" ry="20" fill="#7C3AED" />
          {/* Cabeza */}
          <circle cx="50" cy="38" r="24" fill="#F5C99B" />
          {/* Orejas */}
          <path d="M28 28 C20 18 22 8 30 10 C34 18 34 26 34 30 Z" fill="#B9773F" />
          <path d="M72 28 C80 18 78 8 70 10 C66 18 66 26 66 30 Z" fill="#B9773F" />
          {/* Antifaz */}
          <path d="M30 34 Q50 26 70 34 L68 42 Q50 36 32 42 Z" fill="#4F46E5" />
          {/* Ojos */}
          <circle cx="41" cy="38" r="3.2" fill="#1F2937" />
          <circle cx="59" cy="38" r="3.2" fill="#1F2937" />
          {/* Hocico */}
          <ellipse cx="50" cy="47" rx="9" ry="6" fill="#FFF" />
          <ellipse cx="50" cy="46" rx="2.2" ry="1.8" fill="#1F2937" />
          {/* Sonrisa */}
          <path d="M45 50 Q50 54 55 50" stroke="#1F2937" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          {/* Emblema en el pecho */}
          <circle cx="50" cy="62" r="7" fill="#FBBF24" />
          <text x="50" y="66" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#7C3AED" fontFamily="Poppins, sans-serif">
            S
          </text>
        </svg>
      </div>

      <style>{`
        @keyframes sfMascotIn {
          0% { transform: translateX(140px) scale(0.6); opacity: 0; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
        @keyframes sfMascotOut {
          0% { transform: translateX(0) scale(1); opacity: 1; }
          100% { transform: translateY(20px) scale(0.85); opacity: 0; }
        }
        @keyframes sfBubbleIn {
          0% { transform: translateY(6px) scale(0.9); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes sfMascotFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes sfCapeFlutter {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-6deg); }
        }
      `}</style>
    </div>
  );
}