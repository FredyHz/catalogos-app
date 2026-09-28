// Librería de formas para el editor - StyleFreds
// Cada forma tiene un "kind" que le dice al renderizador cómo dibujarla:
// - 'polygon': polígono regular (usa Konva RegularPolygon, necesita "sides")
// - 'star': estrella (usa Konva Star, necesita "points" e "innerRatio")
// - 'ring': anillo/dona (usa Konva Ring, necesita "innerRatio")
// - 'arc': arco parcial (usa Konva Arc, necesita "angle")
// - 'wedge': rebanada tipo "pie" (usa Konva Wedge, necesita "angle")
// - 'arrow-dir': flecha apuntando en una dirección (usa Konva Arrow, necesita "rotation" y opcional "double")
// - 'path': forma libre dibujada con un path SVG normalizado en un viewBox de 100x100

export type ShapeKind = 'polygon' | 'star' | 'ring' | 'arc' | 'wedge' | 'arrow-dir' | 'path';

export interface ShapeDef {
  id: string;
  name: string;
  category: string;
  kind: ShapeKind;
  sides?: number;
  points?: number;
  innerRatio?: number;
  angle?: number;
  rotation?: number;
  double?: boolean;
  path?: string; // path SVG, viewBox 0 0 100 100
}

export const SHAPE_CATEGORIES = [
  'Polígonos',
  'Estrellas',
  'Círculos y arcos',
  'Flechas',
  'Símbolos',
];

export const SHAPES: ShapeDef[] = [
  // ---------- POLÍGONOS (regulares, 3 a 12 lados) ----------
  { id: 'poly-3', name: 'Triángulo', category: 'Polígonos', kind: 'polygon', sides: 3 },
  { id: 'poly-4', name: 'Cuadrado', category: 'Polígonos', kind: 'polygon', sides: 4 },
  { id: 'poly-5', name: 'Pentágono', category: 'Polígonos', kind: 'polygon', sides: 5 },
  { id: 'poly-6', name: 'Hexágono', category: 'Polígonos', kind: 'polygon', sides: 6 },
  { id: 'poly-7', name: 'Heptágono', category: 'Polígonos', kind: 'polygon', sides: 7 },
  { id: 'poly-8', name: 'Octágono', category: 'Polígonos', kind: 'polygon', sides: 8 },
  { id: 'poly-9', name: 'Eneágono', category: 'Polígonos', kind: 'polygon', sides: 9 },
  { id: 'poly-10', name: 'Decágono', category: 'Polígonos', kind: 'polygon', sides: 10 },
  { id: 'poly-11', name: 'Endecágono', category: 'Polígonos', kind: 'polygon', sides: 11 },
  { id: 'poly-12', name: 'Dodecágono', category: 'Polígonos', kind: 'polygon', sides: 12 },
  { id: 'rhombus', name: 'Rombo', category: 'Polígonos', kind: 'path', path: 'M50 5 L95 50 L50 95 L5 50 Z' },
  { id: 'parallelogram', name: 'Paralelogramo', category: 'Polígonos', kind: 'path', path: 'M25 20 L95 20 L75 80 L5 80 Z' },
  { id: 'trapezoid', name: 'Trapecio', category: 'Polígonos', kind: 'path', path: 'M25 15 L75 15 L95 85 L5 85 Z' },
  { id: 'cross-shape', name: 'Cruz', category: 'Polígonos', kind: 'path', path: 'M35 5 H65 V35 H95 V65 H65 V95 H35 V65 H5 V35 H35 Z' },
  { id: 'plus-thick', name: 'Más', category: 'Polígonos', kind: 'path', path: 'M40 10 H60 V40 H90 V60 H60 V90 H40 V60 H10 V40 H40 Z' },
  { id: 'semi-circle', name: 'Semicírculo', category: 'Polígonos', kind: 'path', path: 'M5 50 A45 45 0 0 1 95 50 Z' },
  { id: 'quarter-circle', name: 'Cuarto de círculo', category: 'Polígonos', kind: 'path', path: 'M5 95 A90 90 0 0 0 95 5 L5 5 Z' },

  // ---------- ESTRELLAS (distintos números de puntas y proporciones) ----------
  { id: 'star-4-sharp', name: 'Estrella 4 (aguda)', category: 'Estrellas', kind: 'star', points: 4, innerRatio: 0.3 },
  { id: 'star-4-soft', name: 'Estrella 4 (suave)', category: 'Estrellas', kind: 'star', points: 4, innerRatio: 0.6 },
  { id: 'star-5-sharp', name: 'Estrella 5 (aguda)', category: 'Estrellas', kind: 'star', points: 5, innerRatio: 0.4 },
  { id: 'star-5-soft', name: 'Estrella 5 (suave)', category: 'Estrellas', kind: 'star', points: 5, innerRatio: 0.7 },
  { id: 'star-6-sharp', name: 'Estrella 6 (aguda)', category: 'Estrellas', kind: 'star', points: 6, innerRatio: 0.4 },
  { id: 'star-6-soft', name: 'Estrella 6 (suave)', category: 'Estrellas', kind: 'star', points: 6, innerRatio: 0.7 },
  { id: 'star-7', name: 'Estrella 7', category: 'Estrellas', kind: 'star', points: 7, innerRatio: 0.5 },
  { id: 'star-8-sharp', name: 'Estrella 8 (aguda)', category: 'Estrellas', kind: 'star', points: 8, innerRatio: 0.4 },
  { id: 'star-8-soft', name: 'Estrella 8 (suave)', category: 'Estrellas', kind: 'star', points: 8, innerRatio: 0.75 },
  { id: 'star-9', name: 'Estrella 9', category: 'Estrellas', kind: 'star', points: 9, innerRatio: 0.55 },
  { id: 'star-10', name: 'Estrella 10', category: 'Estrellas', kind: 'star', points: 10, innerRatio: 0.6 },
  { id: 'star-12', name: 'Estrella 12 (sol)', category: 'Estrellas', kind: 'star', points: 12, innerRatio: 0.65 },
  { id: 'sparkle-4', name: 'Destello', category: 'Estrellas', kind: 'path', path: 'M50 0 C52 35 65 48 100 50 C65 52 52 65 50 100 C48 65 35 52 0 50 C35 48 48 35 50 0 Z' },
  { id: 'badge-seal', name: 'Sello / Insignia', category: 'Estrellas', kind: 'star', points: 16, innerRatio: 0.85 },

  // ---------- CÍRCULOS Y ARCOS ----------
  { id: 'ring-thin', name: 'Anillo delgado', category: 'Círculos y arcos', kind: 'ring', innerRatio: 0.8 },
  { id: 'ring-medium', name: 'Anillo medio', category: 'Círculos y arcos', kind: 'ring', innerRatio: 0.6 },
  { id: 'ring-thick', name: 'Dona', category: 'Círculos y arcos', kind: 'ring', innerRatio: 0.35 },
  { id: 'arc-90', name: 'Arco 90°', category: 'Círculos y arcos', kind: 'arc', angle: 90 },
  { id: 'arc-180', name: 'Arco 180°', category: 'Círculos y arcos', kind: 'arc', angle: 180 },
  { id: 'arc-270', name: 'Arco 270°', category: 'Círculos y arcos', kind: 'arc', angle: 270 },
  { id: 'arc-300', name: 'Arco 300°', category: 'Círculos y arcos', kind: 'arc', angle: 300 },
  { id: 'wedge-30', name: 'Rebanada 30°', category: 'Círculos y arcos', kind: 'wedge', angle: 30 },
  { id: 'wedge-60', name: 'Rebanada 60°', category: 'Círculos y arcos', kind: 'wedge', angle: 60 },
  { id: 'wedge-90', name: 'Rebanada 90°', category: 'Círculos y arcos', kind: 'wedge', angle: 90 },
  { id: 'wedge-120', name: 'Rebanada 120°', category: 'Círculos y arcos', kind: 'wedge', angle: 120 },
  { id: 'wedge-180', name: 'Media rebanada', category: 'Círculos y arcos', kind: 'wedge', angle: 180 },
  { id: 'wedge-270', name: 'Rebanada 270°', category: 'Círculos y arcos', kind: 'wedge', angle: 270 },
  { id: 'ellipse-wide', name: 'Óvalo ancho', category: 'Círculos y arcos', kind: 'path', path: 'M50 20 C80 20 95 35 95 50 C95 65 80 80 50 80 C20 80 5 65 5 50 C5 35 20 20 50 20 Z' },

  // ---------- FLECHAS (8 direcciones + variantes dobles) ----------
  { id: 'arrow-right', name: 'Flecha derecha', category: 'Flechas', kind: 'arrow-dir', rotation: 0 },
  { id: 'arrow-up-right', name: 'Flecha diagonal ↗', category: 'Flechas', kind: 'arrow-dir', rotation: -45 },
  { id: 'arrow-up', name: 'Flecha arriba', category: 'Flechas', kind: 'arrow-dir', rotation: -90 },
  { id: 'arrow-up-left', name: 'Flecha diagonal ↖', category: 'Flechas', kind: 'arrow-dir', rotation: -135 },
  { id: 'arrow-left', name: 'Flecha izquierda', category: 'Flechas', kind: 'arrow-dir', rotation: 180 },
  { id: 'arrow-down-left', name: 'Flecha diagonal ↙', category: 'Flechas', kind: 'arrow-dir', rotation: 135 },
  { id: 'arrow-down', name: 'Flecha abajo', category: 'Flechas', kind: 'arrow-dir', rotation: 90 },
  { id: 'arrow-down-right', name: 'Flecha diagonal ↘', category: 'Flechas', kind: 'arrow-dir', rotation: 45 },
  { id: 'arrow-double-h', name: 'Flecha doble ↔', category: 'Flechas', kind: 'arrow-dir', rotation: 0, double: true },
  { id: 'arrow-double-v', name: 'Flecha doble ↕', category: 'Flechas', kind: 'arrow-dir', rotation: -90, double: true },
  { id: 'chevron-right', name: 'Chevrón derecha', category: 'Flechas', kind: 'path', path: 'M20 10 L70 50 L20 90 L35 90 L85 50 L35 10 Z' },
  { id: 'chevron-left', name: 'Chevrón izquierda', category: 'Flechas', kind: 'path', path: 'M80 10 L30 50 L80 90 L65 90 L15 50 L65 10 Z' },
  { id: 'chevron-up', name: 'Chevrón arriba', category: 'Flechas', kind: 'path', path: 'M10 80 L50 30 L90 80 L90 65 L50 15 L10 65 Z' },
  { id: 'chevron-down', name: 'Chevrón abajo', category: 'Flechas', kind: 'path', path: 'M10 20 L50 70 L90 20 L90 35 L50 85 L10 35 Z' },
  { id: 'arrow-block-right', name: 'Flecha bloque →', category: 'Flechas', kind: 'path', path: 'M5 35 H55 V15 L95 50 L55 85 V65 H5 Z' },
  { id: 'arrow-curved', name: 'Flecha curva', category: 'Flechas', kind: 'path', path: 'M10 70 C10 30 40 15 70 15 L70 5 L95 25 L70 45 L70 30 C50 30 25 40 25 70 Z' },

  // ---------- SÍMBOLOS ----------
  { id: 'heart', name: 'Corazón', category: 'Símbolos', kind: 'path', path: 'M50 88 C10 60 0 35 15 18 C28 4 48 10 50 28 C52 10 72 4 85 18 C100 35 90 60 50 88 Z' },
  { id: 'lightning', name: 'Rayo', category: 'Símbolos', kind: 'path', path: 'M55 2 L15 55 H40 L30 98 L88 40 H58 Z' },
  { id: 'cloud', name: 'Nube', category: 'Símbolos', kind: 'path', path: 'M25 70 C10 70 5 55 15 48 C10 35 25 22 38 28 C42 15 65 12 72 25 C88 22 95 38 85 48 C95 55 88 70 75 70 Z' },
  { id: 'sun', name: 'Sol', category: 'Símbolos', kind: 'star', points: 8, innerRatio: 0.5 },
  { id: 'moon', name: 'Luna', category: 'Símbolos', kind: 'path', path: 'M65 5 C40 5 20 25 20 50 C20 75 40 95 65 95 C45 85 32 70 32 50 C32 30 45 15 65 5 Z' },
  { id: 'drop', name: 'Gota', category: 'Símbolos', kind: 'path', path: 'M50 5 C70 35 85 52 85 68 C85 85 69 95 50 95 C31 95 15 85 15 68 C15 52 30 35 50 5 Z' },
  { id: 'shield', name: 'Escudo', category: 'Símbolos', kind: 'path', path: 'M50 3 L90 18 V48 C90 72 72 90 50 97 C28 90 10 72 10 48 V18 Z' },
  { id: 'house', name: 'Casa', category: 'Símbolos', kind: 'path', path: 'M50 5 L95 40 V95 H60 V65 H40 V95 H5 V40 Z' },
  { id: 'speech-bubble', name: 'Globo de diálogo', category: 'Símbolos', kind: 'path', path: 'M5 10 H95 V70 H35 L15 95 V70 H5 Z' },
  { id: 'thought-bubble', name: 'Globo de pensamiento', category: 'Símbolos', kind: 'path', path: 'M50 8 C75 8 92 25 92 45 C92 65 75 80 50 80 C25 80 8 65 8 45 C8 25 25 8 50 8 Z M25 88 C31 88 36 83 36 77 C36 71 31 66 25 66 C19 66 14 71 14 77 C14 83 19 88 25 88 Z M12 98 C15 98 18 95 18 92 C18 89 15 86 12 86 C9 86 6 89 6 92 C6 95 9 98 12 98 Z' },
  { id: 'banner', name: 'Bandera / Banner', category: 'Símbolos', kind: 'path', path: 'M10 5 H90 V70 L50 55 L10 70 Z' },
  { id: 'ribbon', name: 'Listón', category: 'Símbolos', kind: 'path', path: 'M15 10 H85 L75 50 L85 90 H15 L25 50 Z' },
  { id: 'check-mark', name: 'Check', category: 'Símbolos', kind: 'path', path: 'M10 50 L35 75 L90 15 L80 5 L35 55 L20 40 Z' },
  { id: 'x-mark', name: 'X', category: 'Símbolos', kind: 'path', path: 'M10 20 L40 50 L10 80 L20 90 L50 60 L80 90 L90 80 L60 50 L90 20 L80 10 L50 40 L20 10 Z' },
  { id: 'bracket-left', name: 'Corchete [', category: 'Símbolos', kind: 'path', path: 'M60 5 H35 V95 H60 V85 H45 V15 H60 Z' },
  { id: 'bracket-right', name: 'Corchete ]', category: 'Símbolos', kind: 'path', path: 'M40 5 H65 V95 H40 V85 H55 V15 H40 Z' },
  { id: 'infinity', name: 'Infinito', category: 'Símbolos', kind: 'path', path: 'M25 35 C10 35 5 45 5 50 C5 55 10 65 25 65 C40 65 45 50 50 50 C55 50 60 65 75 65 C90 65 95 55 95 50 C95 45 90 35 75 35 C60 35 55 50 50 50 C45 50 40 35 25 35 Z' },
  { id: 'gear', name: 'Engranaje', category: 'Símbolos', kind: 'star', points: 10, innerRatio: 0.72 },
  { id: 'puzzle', name: 'Pieza de rompecabezas', category: 'Símbolos', kind: 'path', path: 'M10 10 H40 C40 3 50 3 50 10 H80 V38 C87 38 87 48 80 48 V70 H50 C50 77 40 77 40 70 H10 V48 C3 48 3 38 10 38 Z' },
  { id: 'flag', name: 'Bandera de meta', category: 'Símbolos', kind: 'path', path: 'M20 5 H25 V95 H20 Z M25 10 H85 L70 25 L85 40 H25 Z' },
  { id: 'target', name: 'Diana / Objetivo', category: 'Símbolos', kind: 'ring', innerRatio: 0.5 },
];