export interface TemplateElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  align?: string;
  fill?: string;
  opacity?: number;
  cornerRadius?: number;
}

export interface DesignTemplate {
  id: string;
  name: string;
  previewColor: string;
  elements: TemplateElement[];
}

export const TEMPLATES: DesignTemplate[] = [
  {
    id: 'oferta-especial',
    name: 'Oferta especial',
    previewColor: '#DC2626',
    elements: [
      { id: 'bg', type: 'rect', x: 0, y: 0, width: 800, height: 600, fill: '#DC2626', opacity: 1 },
      { id: 't1', type: 'text', x: 60, y: 80, width: 680, text: 'OFERTA ESPECIAL', fontSize: 64, fontFamily: 'Poppins', fontStyle: 'bold', align: 'center', fill: '#FFFFFF', opacity: 1 },
      { id: 't2', type: 'text', x: 60, y: 220, width: 680, text: 'Hasta 50% de descuento', fontSize: 32, fontFamily: 'Poppins', fontStyle: 'normal', align: 'center', fill: '#FFFFFF', opacity: 1 },
      { id: 'r1', type: 'rect', x: 300, y: 320, width: 200, height: 70, fill: '#FFFFFF', opacity: 1, cornerRadius: 12 },
      { id: 't3', type: 'text', x: 300, y: 342, width: 200, text: '¡Compra ya!', fontSize: 22, fontFamily: 'Poppins', fontStyle: 'bold', align: 'center', fill: '#DC2626', opacity: 1 },
    ],
  },
  {
    id: 'nuevo-producto',
    name: 'Nuevo producto',
    previewColor: '#7C3AED',
    elements: [
      { id: 'bg', type: 'rect', x: 0, y: 0, width: 800, height: 600, fill: '#F5F3FF', opacity: 1 },
      { id: 'bar', type: 'rect', x: 0, y: 0, width: 800, height: 90, fill: '#7C3AED', opacity: 1 },
      { id: 't1', type: 'text', x: 40, y: 25, width: 400, text: 'Nuevo producto', fontSize: 36, fontFamily: 'Poppins', fontStyle: 'bold', align: 'left', fill: '#FFFFFF', opacity: 1 },
      { id: 'img', type: 'rect', x: 250, y: 150, width: 300, height: 300, fill: '#DDD6FE', opacity: 1, cornerRadius: 16 },
      { id: 't2', type: 'text', x: 100, y: 480, width: 600, text: 'Descripción de tu producto aquí', fontSize: 22, fontFamily: 'Poppins', fontStyle: 'normal', align: 'center', fill: '#4C1D95', opacity: 1 },
    ],
  },
  {
    id: 'promocion-horario',
    name: 'Promoción con horario',
    previewColor: '#059669',
    elements: [
      { id: 'bg', type: 'rect', x: 0, y: 0, width: 800, height: 600, fill: '#FFFFFF', opacity: 1 },
      { id: 'top', type: 'rect', x: 0, y: 0, width: 800, height: 200, fill: '#059669', opacity: 1 },
      { id: 't1', type: 'text', x: 40, y: 60, width: 720, text: 'Promoción de la semana', fontSize: 44, fontFamily: 'Poppins', fontStyle: 'bold', align: 'center', fill: '#FFFFFF', opacity: 1 },
      { id: 't2', type: 'text', x: 100, y: 260, width: 600, text: 'Lunes a Viernes', fontSize: 26, fontFamily: 'Poppins', fontStyle: '600' as any, align: 'center', fill: '#065F46', opacity: 1 },
      { id: 't3', type: 'text', x: 100, y: 320, width: 600, text: '9:00 AM — 6:00 PM', fontSize: 22, fontFamily: 'Poppins', fontStyle: 'normal', align: 'center', fill: '#111827', opacity: 1 },
      { id: 'circ', type: 'circle', x: 320, y: 400, width: 160, height: 160, fill: '#D1FAE5', opacity: 1 },
    ],
  },
  {
    id: 'lienzo-blanco',
    name: 'Lienzo en blanco',
    previewColor: '#E5E7EB',
    elements: [],
  },
];