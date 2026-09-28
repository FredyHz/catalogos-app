'use client';

import { useEffect, useState } from 'react';
import SpaceBackground from './SpaceBackground';

const MESSAGES = [
  'Despertando a StyleFreds...',
  'Afilando los pinceles...',
  'Puliendo tu Kit de Marca...',
  '¡Todo listo para crear!',
];

const SESSION_KEY = 'sf_intro_shown';

export default function IntroSplash() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem(SESSION_KEY);
    if (alreadyShown) return;
    setVisible(true);
    sessionStorage.setItem(SESSION_KEY, '1');
  }, []);

  useEffect(() => {
    if (!visible) return;
    if (step >= MESSAGES.length - 1) {
      const exitTimer = setTimeout(() => setLeaving(true), 900);
      const hideTimer = setTimeout(() => setVisible(false), 1300);
      return () => {
        clearTimeout(exitTimer);
        clearTimeout(hideTimer);
      };
    }
    const t = setTimeout(() => setStep((s) => s + 1), 850);
    return () => clearTimeout(t);
  }, [visible, step]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200]"
      style={{ animation: leaving ? 'sfIntroOut .4s ease-in forwards' : undefined }}
    >
      <SpaceBackground starCount={90} meteorCount={5} className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 px-6 text-center">
          <div style={{ animation: 'sfMascotFloatBig 2.6s ease-in-out infinite' }}>
            <svg viewBox="0 0 100 100" className="h-24 w-24 drop-shadow-[0_0_18px_rgba(232,201,122,0.35)]">
              <path
                d="M30 45 C15 55 10 75 18 88 C24 78 30 72 38 68 Z"
                fill="#D9A94E"
                style={{ transformOrigin: '30px 55px', animation: 'sfCapeFlutterBig 1.3s ease-in-out infinite' }}
              />
              <ellipse cx="50" cy="62" rx="22" ry="20" fill="#1A1F2E" stroke="#E8C97A" strokeWidth="1.5" />
              <circle cx="50" cy="38" r="24" fill="#F5C99B" />
              <path d="M28 28 C20 18 22 8 30 10 C34 18 34 26 34 30 Z" fill="#B9773F" />
              <path d="M72 28 C80 18 78 8 70 10 C66 18 66 26 66 30 Z" fill="#B9773F" />
              <path d="M30 34 Q50 26 70 34 L68 42 Q50 36 32 42 Z" fill="#0A0E1A" />
              <circle cx="41" cy="38" r="3.2" fill="#1F2937" />
              <circle cx="59" cy="38" r="3.2" fill="#1F2937" />
              <ellipse cx="50" cy="47" rx="9" ry="6" fill="#FFF" />
              <ellipse cx="50" cy="46" rx="2.2" ry="1.8" fill="#1F2937" />
              <path d="M45 50 Q50 54 55 50" stroke="#1F2937" strokeWidth="1.6" fill="none" strokeLinecap="round" />
              <circle cx="50" cy="62" r="7" fill="#E8C97A" />
              <text x="50" y="66" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1A1F2E" fontFamily="Poppins, sans-serif">
                S
              </text>
            </svg>
          </div>

          <div key={step} className="relative" style={{ animation: 'sfMsgIn .45s ease-out both' }}>
            <p className="font-mono text-xs tracking-widest text-[#E8C97A] uppercase mb-1">StyleFreds</p>
            <p className="text-white text-lg font-medium">{MESSAGES[step]}</p>
          </div>

          <div className="flex gap-1.5 mt-2">
            {MESSAGES.map((_, i) => (
              <span
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === step ? 20 : 6,
                  backgroundColor: i <= step ? '#E8C97A' : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>
        </div>
      </SpaceBackground>

      <style>{`
        @keyframes sfIntroOut {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes sfMascotFloatBig {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes sfCapeFlutterBig {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-8deg); }
        }
        @keyframes sfMsgIn {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}