// Paleta y estilos compartidos de los editores (StyleFreds Pro).
// Uso: import { T, ui } from '@/lib/editorTheme';  style={{ backgroundColor: T.panel }}

export const T = {
  bg: '#11131D',           // fondo principal (alrededor del lienzo)
  bgAlt: '#191D2B',        // barras superior e inferior
  panel: '#202538',        // paneles laterales
  border: '#30364A',       // bordes sutiles
  violet: '#7C3AED',       // acento principal
  violetBright: '#9333EA', // hover / activo
  text: '#F8FAFC',         // texto principal
  textMuted: '#A1A1B5',    // texto secundario
  ok: '#34D399',           // estado positivo
  warn: '#FB923C',         // advertencia
} as const;

// Clases reutilizables para botones y campos
export const ui = {
  iconBtn:
    'h-9 w-9 flex items-center justify-center rounded-lg text-[#A1A1B5] transition hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent',
  ghostBtn:
    'px-3 h-9 rounded-lg text-sm font-medium text-[#F8FAFC] border border-[#30364A] transition hover:border-[#7C3AED] hover:bg-white/5 disabled:opacity-50',
  primaryBtn:
    'px-4 h-9 rounded-lg text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50',
  input:
    'h-9 rounded-lg px-3 text-sm text-[#F8FAFC] placeholder-[#A1A1B5] bg-[#11131D] border border-[#30364A] outline-none transition focus:border-[#7C3AED]',
} as const;