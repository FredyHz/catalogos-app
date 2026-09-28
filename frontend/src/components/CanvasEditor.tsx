'use client';

import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Ellipse, Text, Image as KonvaImage, Transformer, Line, Arrow, Star, Group, RegularPolygon, Ring, Arc, Wedge, Path } from 'react-konva';
import Konva from 'konva';
import useImage from 'use-image';
import api from '@/lib/api';
import Logo from './Logo';
import { TEMPLATES } from '@/lib/templates';
import QRCode from 'qrcode';
import { notifyMascot } from '@/lib/mascotBus';
import { SHAPES, SHAPE_CATEGORIES, ShapeDef } from '@/lib/shapes';


export const AVAILABLE_FONTS = [
  'Poppins',
  'Montserrat',
  'Roboto',
  'Playfair Display',
  'Lato',
  'Oswald',
  'Merriweather',
  'Pacifico',
  'Bebas Neue',
  'Raleway',
  'Nunito',
  'Dancing Script',
  'Inter',
  'Open Sans',
  'Roboto Slab',
  'Roboto Condensed',
  'Work Sans',
  'Rubik',
  'Quicksand',
  'Josefin Sans',
  'Barlow',
  'Karla',
  'Mulish',
  'DM Sans',
  'Space Grotesk',
  'Fira Sans',
  'Libre Baskerville',
  'Cormorant Garamond',
  'Crimson Text',
  'EB Garamond',
  'Lora',
  'PT Serif',
  'Abril Fatface',
  'Anton',
  'Archivo Black',
  'Righteous',
  'Alfa Slab One',
  'Fredoka',
  'Baloo 2',
  'Comfortaa',
  'Caveat',
  'Satisfy',
  'Great Vibes',
  'Sacramento',
  'Shadows Into Light',
  'Permanent Marker',
  'Amatic SC',
  'Indie Flower',
  'Kalam',
  'Patrick Hand',
  'Courier Prime',
  'Space Mono',
  'IBM Plex Mono',
  'IBM Plex Sans',
  'Teko',
  'Bungee',
  'Passion One',
  'Yanone Kaffeesatz',
  'Titan One',
];

const TEXT_STYLES = {
  titulo: { fontSize: 48, fontFamily: 'Poppins', fontWeight: 'bold' as const },
  subtitulo: { fontSize: 28, fontFamily: 'Poppins', fontWeight: '600' as const },
  normal: { fontSize: 18, fontFamily: 'Poppins', fontWeight: 'normal' as const },
};

type ElementType = 'rect' | 'circle' | 'triangle' | 'line' | 'arrow' | 'star' | 'text' | 'image' | 'pen' | 'icon';
type BrushStyle = 'normal' | 'marker' | 'pixel' | 'calligraphy' | 'sprite';

interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  textDecoration?: string;
  uppercase?: boolean;
  lineHeight?: number;
  letterSpacing?: number;
  align?: string;
  fill?: string;
  src?: string;
  originalSrc?: string;
  opacity?: number;
  cornerRadius?: number;
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  locked?: boolean;
  flipX?: boolean;
  flipY?: boolean;
  filterType?: 'none' | 'grayscale' | 'sepia';
  brightness?: number;
  contrast?: number;
  points?: number[];
  brushStyle?: BrushStyle;
  isEraser?: boolean;
  shapeId?: string;
    fillType?: 'solid' | 'linear' | 'radial';
  gradientStart?: string;
  gradientEnd?: string;
  gradientAngle?: number;
}


function roundRectClip(ctx: any, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  function getFillProps(el: CanvasElement, w: number, h: number) {
  if (el.fillType === 'linear') {
    const angle = ((el.gradientAngle ?? 0) * Math.PI) / 180;
    const cx = w / 2;
    const cy = h / 2;
    const len = Math.sqrt(w * w + h * h) / 2;
    const dx = Math.cos(angle) * len;
    const dy = Math.sin(angle) * len;
    return {
      fillLinearGradientStartPoint: { x: cx - dx, y: cy - dy },
      fillLinearGradientEndPoint: { x: cx + dx, y: cy + dy },
      fillLinearGradientColorStops: [0, el.gradientStart || '#7C3AED', 1, el.gradientEnd || '#EC4899'],
    };
  }
  if (el.fillType === 'radial') {
    const r = Math.max(w, h) / 2;
    return {
      fillRadialGradientStartPoint: { x: w / 2, y: h / 2 },
      fillRadialGradientEndPoint: { x: w / 2, y: h / 2 },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndRadius: r,
      fillRadialGradientColorStops: [0, el.gradientStart || '#7C3AED', 1, el.gradientEnd || '#EC4899'],
    };
  }
  return { fill: el.fill };
}
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(width - r, 0);
  ctx.arcTo(width, 0, width, r, r);
  ctx.lineTo(width, height - r);
  ctx.arcTo(width, height, width - r, height, r);
  ctx.lineTo(r, height);
  ctx.arcTo(0, height, 0, height - r, r);
  ctx.lineTo(0, r);
  ctx.arcTo(0, 0, r, 0, r);
  ctx.closePath();
}
function getFillProps(el: CanvasElement, w: number, h: number) {
  if (el.fillType === 'linear') {
    const angle = ((el.gradientAngle ?? 0) * Math.PI) / 180;
    const cx = w / 2;
    const cy = h / 2;
    const len = Math.sqrt(w * w + h * h) / 2;
    const dx = Math.cos(angle) * len;
    const dy = Math.sin(angle) * len;
    return {
      fillLinearGradientStartPoint: { x: cx - dx, y: cy - dy },
      fillLinearGradientEndPoint: { x: cx + dx, y: cy + dy },
      fillLinearGradientColorStops: [0, el.gradientStart || '#7C3AED', 1, el.gradientEnd || '#EC4899'],
    };
  }
  if (el.fillType === 'radial') {
    const r = Math.max(w, h) / 2;
    return {
      fillRadialGradientStartPoint: { x: w / 2, y: h / 2 },
      fillRadialGradientEndPoint: { x: w / 2, y: h / 2 },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndRadius: r,
      fillRadialGradientColorStops: [0, el.gradientStart || '#7C3AED', 1, el.gradientEnd || '#EC4899'],
    };
  }
  return { fill: el.fill };
}

function ImageNode({ el, shapeRef, onSelect, onChange }: any) {
  const [img] = useImage(el.src, 'anonymous');
  const nodeRef = useRef<any>(null);

  useEffect(() => {
    if (!nodeRef.current || !img) return;
    const filters: any[] = [];
    if (el.filterType === 'grayscale') filters.push(Konva.Filters.Grayscale);
    if (el.filterType === 'sepia') filters.push(Konva.Filters.Sepia);
    if (el.brightness) filters.push(Konva.Filters.Brighten);
    if (el.contrast) filters.push(Konva.Filters.Contrast);
    nodeRef.current.cache();
    nodeRef.current.filters(filters);
    nodeRef.current.brightness((el.brightness || 0) / 100);
    nodeRef.current.contrast(el.contrast || 0);
    nodeRef.current.getLayer()?.batchDraw();
  }, [img, el.filterType, el.brightness, el.contrast]);

  const w = el.width || 200;
  const h = el.height || 200;

  return (
    <KonvaImage
      ref={(node) => {
        nodeRef.current = node;
        shapeRef(node);
      }}
      image={img}
      x={el.flipX ? el.x + w : el.x}
      y={el.flipY ? el.y + h : el.y}
      width={w}
      height={h}
      scaleX={el.flipX ? -1 : 1}
      scaleY={el.flipY ? -1 : 1}
      rotation={el.rotation || 0}
      opacity={el.opacity ?? 1}
      stroke={el.strokeColor}
      strokeWidth={el.strokeWidth || 0}
      shadowColor={el.shadowColor}
      shadowBlur={el.shadowBlur || 0}
      shadowOffsetX={el.shadowOffsetX || 0}
      shadowOffsetY={el.shadowOffsetY || 0}
      cornerRadius={el.cornerRadius || 0}
      draggable={!el.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e: any) => {
        const node = e.target;
        const nx = el.flipX ? node.x() - w : node.x();
        const ny = el.flipY ? node.y() - h : node.y();
        onChange({ ...el, x: nx, y: ny });
      }}
      onTransformEnd={(e: any) => {
        const node = e.target;
        const scaleX = Math.abs(node.scaleX());
        const scaleY = Math.abs(node.scaleY());
        node.scaleX(el.flipX ? -1 : 1);
        node.scaleY(el.flipY ? -1 : 1);
        onChange({
          ...el,
          width: Math.max(20, w * scaleX),
          height: Math.max(20, h * scaleY),
          rotation: node.rotation(),
        });
      }}
    />
  );
}
function ShapeThumbnail({ def }: { def: ShapeDef }) {
  if (def.kind === 'path') {
    return (
      <svg viewBox="0 0 100 100" width="28" height="28">
        <path d={def.path} fill="#4B5563" />
      </svg>
    );
  }
  const commonSvgProps = { fill: '#4B5563' };
  if (def.kind === 'polygon') {
    const sides = def.sides || 3;
    const pts = Array.from({ length: sides }, (_, i) => {
      const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
      return `${50 + 45 * Math.cos(angle)},${50 + 45 * Math.sin(angle)}`;
    }).join(' ');
    return <svg viewBox="0 0 100 100" width="28" height="28"><polygon points={pts} {...commonSvgProps} /></svg>;
  }
  if (def.kind === 'star') {
    const points = def.points || 5;
    const inner = 45 * (def.innerRatio ?? 0.5);
    const pts = Array.from({ length: points * 2 }, (_, i) => {
      const r = i % 2 === 0 ? 45 : inner;
      const angle = (Math.PI * i) / points - Math.PI / 2;
      return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
    }).join(' ');
    return <svg viewBox="0 0 100 100" width="28" height="28"><polygon points={pts} {...commonSvgProps} /></svg>;
  }
  if (def.kind === 'ring') {
    return (
      <svg viewBox="0 0 100 100" width="28" height="28">
        <circle cx="50" cy="50" r={45 * (1 - (def.innerRatio ?? 0.5)) / 1 + 45 * (def.innerRatio ?? 0.5) * 0} fill="none" stroke="#4B5563" strokeWidth={45 * (1 - (def.innerRatio ?? 0.5))} />
      </svg>
    );
  }
  if (def.kind === 'arc' || def.kind === 'wedge') {
    return (
      <svg viewBox="0 0 100 100" width="28" height="28">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#4B5563" strokeWidth="8" strokeDasharray={`${((def.angle || 90) / 360) * 251} 251`} />
      </svg>
    );
  }
  if (def.kind === 'arrow-dir') {
    return (
      <svg viewBox="0 0 100 100" width="28" height="28" style={{ transform: `rotate(${def.rotation || 0}deg)` }}>
        <line x1="10" y1="50" x2="80" y2="50" stroke="#4B5563" strokeWidth="8" />
        <polygon points="70,35 95,50 70,65" fill="#4B5563" />
      </svg>
    );
  }
  return null;
}
function ShapeIconNode({ el, shapeRef, onSelect, onChange }: any) {
  const def: ShapeDef | undefined = SHAPES.find((s) => s.id === el.shapeId);
  if (!def) return null;

  const w = el.width || 100;
  const h = el.height || 100;
  const cx = el.x + w / 2;
  const cy = el.y + h / 2;

    const commonProps = {
    ...getFillProps(el, w, h),
    opacity: el.opacity ?? 1,
    stroke: el.strokeColor,
    strokeWidth: el.strokeWidth || 0,
    shadowColor: el.shadowColor,
    shadowBlur: el.shadowBlur || 0,
    draggable: !el.locked,
    onClick: onSelect,
    onTap: onSelect,
  };

  const handleDragEndCentered = (e: any) => {
    const node = e.target;
    onChange({ ...el, x: node.x() - w / 2, y: node.y() - h / 2 });
  };

  const handleTransformEndCentered = (e: any) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    const newW = Math.max(20, w * scaleX);
    const newH = Math.max(20, h * scaleY);
    onChange({
      ...el,
      x: node.x() - newW / 2,
      y: node.y() - newH / 2,
      width: newW,
      height: newH,
      rotation: node.rotation(),
    });
  };

  if (def.kind === 'polygon') {
    return (
      <RegularPolygon
        ref={shapeRef}
        x={cx} y={cy}
        sides={def.sides || 3}
        radius={Math.min(w, h) / 2}
        rotation={el.rotation || 0}
        {...commonProps}
        onDragEnd={handleDragEndCentered}
        onTransformEnd={handleTransformEndCentered}
      />
    );
  }

  if (def.kind === 'star') {
    const r = Math.min(w, h) / 2;
    return (
      <Star
        ref={shapeRef}
        x={cx} y={cy}
        numPoints={def.points || 5}
        innerRadius={r * (def.innerRatio ?? 0.5)}
        outerRadius={r}
        rotation={el.rotation || 0}
        {...commonProps}
        onDragEnd={handleDragEndCentered}
        onTransformEnd={handleTransformEndCentered}
      />
    );
  }

  if (def.kind === 'ring') {
    const r = Math.min(w, h) / 2;
    return (
      <Ring
        ref={shapeRef}
        x={cx} y={cy}
        innerRadius={r * (def.innerRatio ?? 0.5)}
        outerRadius={r}
        rotation={el.rotation || 0}
        {...commonProps}
        onDragEnd={handleDragEndCentered}
        onTransformEnd={handleTransformEndCentered}
      />
    );
  }

  if (def.kind === 'arc') {
    const r = Math.min(w, h) / 2;
    return (
      <Arc
        ref={shapeRef}
        x={cx} y={cy}
        innerRadius={r * 0.55}
        outerRadius={r}
        angle={def.angle || 180}
        rotation={el.rotation || 0}
        {...commonProps}
        onDragEnd={handleDragEndCentered}
        onTransformEnd={handleTransformEndCentered}
      />
    );
  }

  if (def.kind === 'wedge') {
    const r = Math.min(w, h) / 2;
    return (
      <Wedge
        ref={shapeRef}
        x={cx} y={cy}
        radius={r}
        angle={def.angle || 90}
        rotation={el.rotation || 0}
        {...commonProps}
        onDragEnd={handleDragEndCentered}
        onTransformEnd={handleTransformEndCentered}
      />
    );
  }

  if (def.kind === 'arrow-dir') {
    const points = def.double ? [w * 0.1, 0, w * 0.9, 0] : [0, 0, w, 0];
    return (
      <Arrow
        ref={shapeRef}
        x={el.x} y={cy}
        points={points}
        pointerLength={Math.min(w, h) * 0.25}
        pointerWidth={Math.min(w, h) * 0.35}
        pointerAtBeginning={!!def.double}
        stroke={el.fill}
        strokeWidth={Math.max(4, Math.min(w, h) * 0.12)}
        rotation={(el.rotation || 0) + (def.rotation || 0)}
        opacity={el.opacity ?? 1}
        shadowColor={el.shadowColor}
        shadowBlur={el.shadowBlur || 0}
        draggable={!el.locked}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e: any) => {
          const node = e.target;
          onChange({ ...el, x: node.x(), y: node.y() - h / 2 });
        }}
        onTransformEnd={handleTransformEndCentered}
      />
    );
  }

  return (
    <Path
      ref={shapeRef}
      x={el.x} y={el.y}
      data={def.path}
      scaleX={w / 100}
      scaleY={h / 100}
      rotation={el.rotation || 0}
      {...commonProps}
      onDragEnd={(e: any) => {
        const node = e.target;
        onChange({ ...el, x: node.x(), y: node.y() });
      }}
      onTransformEnd={(e: any) => {
        const node = e.target;
        const newW = Math.max(20, 100 * node.scaleX());
        const newH = Math.max(20, 100 * node.scaleY());
        node.scaleX(newW / 100);
        node.scaleY(newH / 100);
        onChange({ ...el, width: newW, height: newH, rotation: node.rotation() });
      }}
    />
  );
}

export default function CanvasEditor({ posterId, defaultType }: { posterId?: string | null; defaultType?: string }) {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<{ id: string; value: string } | null>(null);
  const [title, setTitle] = useState('Mi poster');
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [currentPosterId, setCurrentPosterId] = useState<string | null>(posterId || null);
  const [posterType, setPosterType] = useState(defaultType || 'POSTER');
  const [isPublished, setIsPublished] = useState(false);
  const [history, setHistory] = useState<{ stack: CanvasElement[][]; step: number }>({ stack: [[]], step: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const shapeRefs = useRef<Record<string, any>>({});

  const setElementsWithHistory = (updater: (prev: CanvasElement[]) => CanvasElement[]) => {
    setElements((prev) => {
      const next = updater(prev);
      setHistory((h) => {
        const stack = h.stack.slice(0, h.step + 1);
        stack.push(next);
        return { stack, step: stack.length - 1 };
      });
      return next;
    });
  };

  const undo = () => {
    setHistory((h) => {
      if (h.step <= 0) return h;
      const newStep = h.step - 1;
      setElements(h.stack[newStep]);
      return { ...h, step: newStep };
    });
  };

  const redo = () => {
    setHistory((h) => {
      if (h.step >= h.stack.length - 1) return h;
      const newStep = h.step + 1;
      setElements(h.stack[newStep]);
      return { ...h, step: newStep };
    });
  };

  useEffect(() => {
    if (selectedId && shapeRefs.current[selectedId] && trRef.current) {
      trRef.current.nodes([shapeRefs.current[selectedId]]);
      trRef.current.getLayer().batchDraw();
    } else if (trRef.current) {
      trRef.current.nodes([]);
    }
  }, [selectedId, elements]);

  useEffect(() => {
    if (!posterId) return;
    api
      .get(`/posters/${posterId}`)
      .then((res) => {
        setTitle(res.data.title);
                const loadedDesign = res.data.design;
        const loaded = Array.isArray(loadedDesign) ? loadedDesign : (loadedDesign?.elements || []);
        setElements(loaded);
        setHistory({ stack: [loaded], step: 0 });
        if (loadedDesign?.canvasBg) setCanvasBg(loadedDesign.canvasBg);
        setCurrentPosterId(res.data.id);
        setPosterType(res.data.type || 'POSTER');
        setIsPublished(res.data.isPublished || false);
      })
      .catch((err) => console.error('Error cargando poster:', err));
  }, [posterId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea';
      const ctrlOrCmd = e.ctrlKey || e.metaKey;

      if (ctrlOrCmd && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (ctrlOrCmd && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      } else if (ctrlOrCmd && e.key.toLowerCase() === 'd' && !isTyping) {
        e.preventDefault();
        duplicateSelected();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && !isTyping && selectedId) {
        e.preventDefault();
        deleteSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });
  const addRect = () => {
    const id = `rect-${Date.now()}`;
    setElementsWithHistory((prev) => [...prev, {
      id, type: 'rect', x: 60, y: 60, width: 150, height: 100, fill: '#7C3AED', rotation: 0, opacity: 1, cornerRadius: 0,
    }]);
    setSelectedId(id);
  };

  const addCircle = () => {
    const id = `circle-${Date.now()}`;
    setElementsWithHistory((prev) => [...prev, {
      id, type: 'circle', x: 60, y: 60, width: 120, height: 120, fill: '#7C3AED', rotation: 0, opacity: 1,
    }]);
    setSelectedId(id);
  };

  const addTriangle = () => {
    const id = `triangle-${Date.now()}`;
    setElementsWithHistory((prev) => [...prev, {
      id, type: 'triangle', x: 60, y: 60, width: 120, height: 120, fill: '#7C3AED', rotation: 0, opacity: 1,
    }]);
    setSelectedId(id);
  };

  const addLine = () => {
    const id = `line-${Date.now()}`;
    setElementsWithHistory((prev) => [...prev, {
      id, type: 'line', x: 60, y: 60, width: 150, height: 0, fill: '#7C3AED', rotation: 0, opacity: 1, strokeWidth: 4,
    }]);
    setSelectedId(id);
  };

  const addArrow = () => {
    const id = `arrow-${Date.now()}`;
    setElementsWithHistory((prev) => [...prev, {
      id, type: 'arrow', x: 60, y: 60, width: 150, height: 0, fill: '#7C3AED', rotation: 0, opacity: 1, strokeWidth: 4,
    }]);
    setSelectedId(id);
  };

  const addStar = () => {
    const id = `star-${Date.now()}`;
    setElementsWithHistory((prev) => [...prev, {
      id, type: 'star', x: 60, y: 60, width: 120, height: 120, fill: '#7C3AED', rotation: 0, opacity: 1,
    }]);
    setSelectedId(id);
  };
  const addShapeIcon = (shapeId: string) => {
    const id = `icon-${Date.now()}`;
    setElementsWithHistory((prev) => [...prev, {
      id, type: 'icon', shapeId, x: 60, y: 60, width: 100, height: 100, fill: '#7C3AED', rotation: 0, opacity: 1,
    }]);
    setSelectedId(id);
    setShowShapesModal(false);
  };

  const addText = (style: 'titulo' | 'subtitulo' | 'normal' = 'normal') => {
    const id = `text-${Date.now()}`;
    const preset = TEXT_STYLES[style];
    const labelMap = { titulo: 'Añadir título', subtitulo: 'Añadir subtítulo', normal: 'Añadir texto' };
    setElementsWithHistory((prev) => [...prev, {
      id,
      type: 'text',
      x: 100,
      y: 100,
      width: 250,
      text: labelMap[style],
      fontSize: preset.fontSize,
      fontFamily: preset.fontFamily,
      fontStyle: preset.fontWeight === 'bold' ? 'bold' : 'normal',
      textDecoration: '',
      uppercase: false,
      lineHeight: 1.2,
      letterSpacing: 0,
      align: 'left',
      fill: '#111827',
      rotation: 0,
      opacity: 1,
    }]);
    setSelectedId(id);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const id = `image-${Date.now()}`;
      const src = reader.result as string;
      setElementsWithHistory((prev) => [...prev, {
        id, type: 'image', x: 80, y: 80, width: 200, height: 200, src, originalSrc: src, rotation: 0, opacity: 1, cornerRadius: 0,
      }]);
      setSelectedId(id);
    };
    reader.readAsDataURL(file);
  };

  const updateElement = (updated: CanvasElement) => {
    setElementsWithHistory((prev) => prev.map((el) => (el.id === updated.id ? updated : el)));
  };

  const patchSelected = (patch: Partial<CanvasElement>) => {
    if (!selectedId) return;
    setElementsWithHistory((prev) => prev.map((el) => (el.id === selectedId ? { ...el, ...patch } : el)));
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setElementsWithHistory((prev) => prev.filter((el) => el.id !== selectedId));
    setSelectedId(null);
  };

  const duplicateSelected = () => {
    if (!selectedId) return;
    const el = elements.find((e) => e.id === selectedId);
    if (!el) return;
    const id = `${el.type}-${Date.now()}`;
    const copy = { ...el, id, x: el.x + 20, y: el.y + 20 };
    setElementsWithHistory((prev) => [...prev, copy]);
    setSelectedId(id);
  };

  const bringToFront = () => {
    if (!selectedId) return;
    setElementsWithHistory((prev) => {
      const el = prev.find((e) => e.id === selectedId);
      if (!el) return prev;
      return [...prev.filter((e) => e.id !== selectedId), el];
    });
  };

  const sendToBack = () => {
    if (!selectedId) return;
    setElementsWithHistory((prev) => {
      const el = prev.find((e) => e.id === selectedId);
      if (!el) return prev;
      return [el, ...prev.filter((e) => e.id !== selectedId)];
    });
  };

  const toggleLock = () => {
    if (!selectedId) return;
    patchSelected({ locked: !elements.find((e) => e.id === selectedId)?.locked });
  };

  const centerHorizontal = () => {
    if (!selectedId) return;
    const el = elements.find((e) => e.id === selectedId);
    if (!el) return;
    const w = el.width || 0;
    patchSelected({ x: (800 - w) / 2 });
  };

  const centerVertical = () => {
    if (!selectedId) return;
    const el = elements.find((e) => e.id === selectedId);
    if (!el) return;
    const h = el.height || 0;
    patchSelected({ y: (600 - h) / 2 });
  };

  const changeColor = (color: string) => patchSelected({ fill: color });
  const changeFontFamily = (fontFamily: string) => patchSelected({ fontFamily });
  const changeOpacity = (opacity: number) => patchSelected({ opacity });
  const changeCornerRadius = (cornerRadius: number) => patchSelected({ cornerRadius });
  const changeStrokeColor = (strokeColor: string) => patchSelected({ strokeColor });
  const changeStrokeWidth = (strokeWidth: number) => patchSelected({ strokeWidth });
  const changeShadowColor = (shadowColor: string) => patchSelected({ shadowColor });
  const changeShadowBlur = (shadowBlur: number) => patchSelected({ shadowBlur });
  const changeShadowOffsetX = (shadowOffsetX: number) => patchSelected({ shadowOffsetX });
  const changeShadowOffsetY = (shadowOffsetY: number) => patchSelected({ shadowOffsetY });

  const changeFontSize = (delta: number) => {
    if (!selectedId) return;
    const el = elements.find((e) => e.id === selectedId);
    if (!el) return;
    patchSelected({ fontSize: Math.max(8, (el.fontSize || 18) + delta) });
  };

  const toggleBold = () => {
    if (!selectedId) return;
    const el = elements.find((e) => e.id === selectedId);
    if (!el) return;
    patchSelected({ fontStyle: el.fontStyle === 'bold' ? 'normal' : 'bold' });
  };

  const toggleUnderline = () => {
    if (!selectedId) return;
    const el = elements.find((e) => e.id === selectedId);
    if (!el) return;
    patchSelected({ textDecoration: el.textDecoration === 'underline' ? '' : 'underline' });
  };

  const toggleStrikethrough = () => {
    if (!selectedId) return;
    const el = elements.find((e) => e.id === selectedId);
    if (!el) return;
    patchSelected({ textDecoration: el.textDecoration === 'line-through' ? '' : 'line-through' });
  };

  const toggleUppercase = () => {
    if (!selectedId) return;
    const el = elements.find((e) => e.id === selectedId);
    if (!el) return;
    patchSelected({ uppercase: !el.uppercase });
  };

  const changeLineHeight = (lineHeight: number) => patchSelected({ lineHeight });
  const changeLetterSpacing = (letterSpacing: number) => patchSelected({ letterSpacing });
  const changeAlign = (align: string) => patchSelected({ align });

  const toggleFlipX = () => {
    if (!selectedId) return;
    const el = elements.find((e) => e.id === selectedId);
    if (!el) return;
    patchSelected({ flipX: !el.flipX });
  };

  const toggleFlipY = () => {
    if (!selectedId) return;
    const el = elements.find((e) => e.id === selectedId);
    if (!el) return;
    patchSelected({ flipY: !el.flipY });
  };

  const applyImageFilter = (filterType: 'none' | 'grayscale' | 'sepia') => {
    patchSelected({ filterType });
  };

  const changeBrightness = (brightness: number) => patchSelected({ brightness });
  const changeContrast = (contrast: number) => patchSelected({ contrast });

  const smartSquareCrop = () => {
    if (!selectedId) return;
    const el = elements.find((e) => e.id === selectedId);
    if (!el || el.type !== 'image') return;
    const size = Math.min(el.width || 200, el.height || 200);
    patchSelected({ width: size, height: size });
  };

  const handleTextDblClick = (el: CanvasElement) => {
    if (el.locked) return;
    setEditingText({ id: el.id, value: el.text || '' });
  };
  const getPointerPos = () => {
    const stage = stageRef.current;
    if (!stage) return null;
    return stage.getPointerPosition();
  };

  const snapToPixel = (val: number, size = 10) => Math.round(val / size) * size;

  const commitToHistory = () => {
    setElements((prev) => {
      setHistory((h) => {
        const stack = h.stack.slice(0, h.step + 1);
        stack.push(prev);
        return { stack, step: stack.length - 1 };
      });
      return prev;
    });
  };

  const handlePenMouseDown = () => {
    if (!drawMode) return;
    const pos = getPointerPos();
    if (!pos) return;
    let { x, y } = pos;
    if (brushStyle === 'pixel') {
      x = snapToPixel(x);
      y = snapToPixel(y);
    }
    const id = `pen-${Date.now()}`;
    const newStroke: CanvasElement = {
      id,
      type: 'pen',
      x: 0,
      y: 0,
      points: [x, y],
      fill: brushColor,
      strokeWidth: brushSize,
      brushStyle,
      isEraser: isErasing,
      opacity: brushStyle === 'marker' ? 0.4 : 1,
      rotation: 0,
    };
    setElements((prev) => [...prev, newStroke]);
    setCurrentStrokeId(id);
    setIsDrawing(true);
  };

  const handlePenMouseMove = () => {
    if (!drawMode || !isDrawing || !currentStrokeId) return;
    const pos = getPointerPos();
    if (!pos) return;
    let { x, y } = pos;
    if (brushStyle === 'pixel') {
      x = snapToPixel(x);
      y = snapToPixel(y);
    }
    setElements((prev) =>
      prev.map((el) =>
        el.id === currentStrokeId ? { ...el, points: [...(el.points || []), x, y] } : el
      )
    );
  };

  const handlePenMouseUp = () => {
    if (!drawMode || !isDrawing) return;
    setIsDrawing(false);
    setCurrentStrokeId(null);
    commitToHistory();
  };

  const commitTextEdit = () => {
    if (!editingText) return;
    setElementsWithHistory((prev) =>
      prev.map((el) => (el.id === editingText.id ? { ...el, text: editingText.value } : el))
    );
    setEditingText(null);
  };

  const editingElement = editingText ? elements.find((e) => e.id === editingText.id) : null;
  const selectedElement = elements.find((el) => el.id === selectedId);

    const flash = (msg: string) => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(''), 3000);
    const isError = /error/i.test(msg);
    notifyMascot(msg, isError ? 'error' : 'success');
  };
  const saveDesign = async () => {
    setSaving(true);
    try {
        if (currentPosterId) {
        await api.put(`/posters/${currentPosterId}`, { title, design: { elements, canvasBg } });
      } else {
        const res = await api.post('/posters', { title, design: { elements, canvasBg }, type: posterType });
        setCurrentPosterId(res.data.id);
      }
      flash('¡Guardado correctamente!');
    } catch (err) {
      console.error(err);
      flash('Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const exportToPDF = async () => {
    if (!stageRef.current) return;
    setSaving(true);
    try {
      const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
      const response = await api.post(
        '/posters/export-pdf',
        { title, image: dataUrl },
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title || 'poster'}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      flash('Error al exportar el PDF.');
    } finally {
      setSaving(false);
    }
  };

  const exportAsImage = (format: 'png' | 'jpeg') => {
    if (!stageRef.current) return;
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2, mimeType, quality: 0.95 });
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${title || 'poster'}.${format === 'png' ? 'png' : 'jpg'}`;
    link.click();
  };

  const shareToWhatsApp = async () => {
    if (!stageRef.current) return;
    setSaving(true);
    try {
      const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isMobile && (navigator as any).canShare) {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `${title || 'poster'}.png`, { type: blob.type });
        if ((navigator as any).canShare({ files: [file] })) {
          await (navigator as any).share({
            files: [file],
            title: title || 'Mi poster',
            text: `Mira mi diseño: ${title || 'poster'}`,
          });
          setSaving(false);
          return;
        }
      }

      const response = await api.post('/posters/share-image', { image: dataUrl });
      const publicUrl = response.data.url;
      const message = encodeURIComponent(`Mira mi diseño "${title || 'poster'}": ${publicUrl}`);
      window.open(`https://wa.me/?text=${message}`, '_blank');
    } catch (err) {
      console.error(err);
      flash('Error al compartir.');
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    if (!currentPosterId) {
      flash('Primero guarda el diseño antes de publicar.');
      return;
    }
    setSaving(true);
    try {
      const newValue = !isPublished;
      await api.put(`/posters/${currentPosterId}`, { isPublished: newValue });
      setIsPublished(newValue);
      flash(newValue ? '¡Diseño publicado!' : 'Diseño despublicado.');
    } catch (err) {
      console.error(err);
      flash('Error al actualizar la publicación.');
    } finally {
      setSaving(false);
    }
  };

  const sidebarBtn = 'w-full text-left px-3 py-2.5 rounded-lg border border-gray-200 hover:border-brand-400 hover:bg-brand-50 transition text-sm font-medium text-gray-700';
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [showShapesModal, setShowShapesModal] = useState(false);
  const [shapeCategory, setShapeCategory] = useState(SHAPE_CATEGORIES[0]);
  const [drawMode, setDrawMode] = useState(false);
    const [canvasBg, setCanvasBg] = useState<{ fill?: string; fillType?: 'solid' | 'linear' | 'radial'; gradientStart?: string; gradientEnd?: string; gradientAngle?: number }>({ fill: '#ffffff' });
  const [showBgPanel, setShowBgPanel] = useState(false);
  const patchBg = (patch: Partial<typeof canvasBg>) => setCanvasBg((prev) => ({ ...prev, ...patch }));
  const [brushStyle, setBrushStyle] = useState<BrushStyle>('normal');
  const [brushColor, setBrushColor] = useState('#111827');
  const [brushSize, setBrushSize] = useState(6);
  const [isErasing, setIsErasing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStrokeId, setCurrentStrokeId] = useState<string | null>(null);

  const applyTemplate = (templateId: string) => {
    const tpl = TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    if (elements.length > 0) {
      const confirmSwap = window.confirm('Esto reemplazará tu diseño actual. ¿Continuar?');
      if (!confirmSwap) return;
    }
    setElementsWithHistory(() => tpl.elements.map((el) => ({ ...el, id: `${el.id}-${Date.now()}` })) as any);
    setShowTemplates(false);
  };
  const generateAIImage = async () => {
    if (!aiPrompt.trim()) return;
    setGeneratingImage(true);
    try {
      const res = await api.post('/ai/generate-image', { prompt: aiPrompt });
      const dataUrl = res.data.image;
      const id = `image-${Date.now()}`;
      setElementsWithHistory((prev) => [...prev, {
        id, type: 'image', x: 80, y: 80, width: 250, height: 250, src: dataUrl, rotation: 0, opacity: 1, cornerRadius: 0,
      }] as any);
      setSelectedId(id);
      setShowAIModal(false);
      setAiPrompt('');
    } catch (err) {
      console.error(err);
      flash('Error al generar la imagen. Intenta con otra descripción.');
    } finally {
      setGeneratingImage(false);
    }
  };

  const applyMyBrand = async () => {
    try {
      const res = await api.get('/brand-kit');
      const kit = res.data;
      const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace('/api', '');

      setElementsWithHistory((prev) => {
        let updated = prev.map((el) => {
          if (['rect', 'circle', 'triangle', 'star', 'line', 'arrow'].includes(el.type)) {
            return { ...el, fill: kit.brandColor || el.fill };
          }
          if (el.type === 'text') {
            return { ...el, fontFamily: kit.brandFont || el.fontFamily };
          }
          return el;
        });

        const hasLogo = updated.some((el) => el.id.startsWith('brand-logo'));
        if (kit.logoUrl && !hasLogo) {
          const logoSrc = kit.logoUrl.startsWith('http') ? kit.logoUrl : `${API_BASE}${kit.logoUrl}`;
          updated = [...updated, {
            id: `brand-logo-${Date.now()}`,
            type: 'image' as ElementType,
            x: 20, y: 20, width: 100, height: 100,
            src: logoSrc, originalSrc: logoSrc, rotation: 0, opacity: 1, cornerRadius: 0,
          }];
        }

        return updated;
      });

      flash('¡Tu marca fue aplicada!');
    } catch (err) {
      console.error(err);
      flash('No se pudo aplicar tu marca. Configúrala primero en "Mi Marca".');
    }
  };

  const insertQRCode = async () => {
    if (!stageRef.current) return;
    setSaving(true);
    try {
      const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
      const response = await api.post('/posters/share-image', { image: dataUrl });
      const publicUrl = response.data.url;

      const qrDataUrl = await QRCode.toDataURL(publicUrl, { width: 300, margin: 1 });

      const id = `qr-${Date.now()}`;
      setElementsWithHistory((prev) => [...prev, {
        id, type: 'image', x: 650, y: 20, width: 100, height: 100,
        src: qrDataUrl, originalSrc: qrDataUrl, rotation: 0, opacity: 1, cornerRadius: 0,
      }]);
      setSelectedId(id);
      flash('¡Código QR insertado!');
    } catch (err) {
      console.error(err);
      flash('Error al generar el código QR.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Barra superior */}
      <div className="h-16 shrink-0 border-b bg-white flex items-center justify-between px-6 gap-4">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del diseño"
            className="border rounded-md px-3 py-1.5 text-sm w-56"
          />
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={history.step <= 0}
              title="Deshacer (Ctrl+Z)"
              className="w-9 h-9 border rounded-md hover:bg-gray-50 disabled:opacity-30 flex items-center justify-center"
            >
              ↺
            </button>
            <button
              onClick={redo}
              disabled={history.step >= history.stack.length - 1}
              title="Rehacer (Ctrl+Y)"
              className="w-9 h-9 border rounded-md hover:bg-gray-50 disabled:opacity-30 flex items-center justify-center"
            >
              ↻
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 relative">
          {savedMessage && <span className="text-sm text-gray-500 mr-2">{savedMessage}</span>}
          <button
            onClick={saveDesign}
            disabled={saving}
            className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50 hover:bg-gray-900 transition"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu((v) => !v)}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50 transition"
            >
              Archivo / Exportar ▾
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-11 bg-white border rounded-md shadow-lg w-40 z-10 overflow-hidden">
                <button onClick={() => { exportAsImage('png'); setShowExportMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Exportar PNG</button>
                <button onClick={() => { exportAsImage('jpeg'); setShowExportMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Exportar JPG</button>
                <button onClick={() => { exportToPDF(); setShowExportMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Exportar PDF</button>
              </div>
            )}
          </div>

          <button
            onClick={shareToWhatsApp}
            disabled={saving}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50 hover:bg-green-700 transition flex items-center gap-2"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M17.6 6.3A8.86 8.86 0 0 0 12.03 3.5 8.9 8.9 0 0 0 3.6 15.9L3 21l5.25-1.38a8.86 8.86 0 0 0 3.78.84h.01a8.9 8.9 0 0 0 8.86-8.88 8.83 8.83 0 0 0-3.3-6.28ZM12.04 19.1h-.01a7.4 7.4 0 0 1-3.77-1.03l-.27-.16-2.8.74.75-2.73-.18-.28a7.4 7.4 0 0 1 11.53-9.16 7.35 7.35 0 0 1 2.17 5.22 7.4 7.4 0 0 1-7.42 7.4Zm4.06-5.54c-.22-.11-1.3-.64-1.5-.72-.2-.07-.35-.11-.5.11-.14.22-.57.72-.7.87-.13.15-.26.16-.48.05a6.1 6.1 0 0 1-1.8-1.11 6.7 6.7 0 0 1-1.24-1.54c-.13-.22 0-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.07-.15.04-.28-.02-.4-.06-.11-.5-1.2-.68-1.65-.18-.43-.36-.37-.5-.38h-.43a.82.82 0 0 0-.6.28 2.5 2.5 0 0 0-.78 1.86c0 1.1.8 2.16.91 2.31.11.15 1.57 2.4 3.8 3.36.53.23.94.37 1.27.47.53.17 1.02.15 1.4.09.43-.06 1.3-.53 1.48-1.04.18-.51.18-.95.13-1.04-.05-.09-.2-.15-.42-.26Z" />
            </svg>
            Compartir
          </button>
          <button
            onClick={togglePublish}
            disabled={saving}
            className={`px-4 py-2 rounded-md text-sm text-white disabled:opacity-50 transition ${
              isPublished ? 'bg-gray-500 hover:bg-gray-600' : 'bg-brand-600 hover:bg-brand-700'
            }`}
          >
            {isPublished ? 'Despublicar' : 'Publicar'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar izquierdo */}<div className="w-60 shrink-0 border-r bg-white overflow-y-auto p-4 space-y-6">
          <div>
            <button
              onClick={() => setShowTemplates(true)}
              className="w-full bg-brand-50 border border-brand-200 text-brand-700 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-100 transition"
            >
              🎨 Plantillas
            </button>
          </div>

          <div>
            <button
              onClick={() => setShowAIModal(true)}
              className="w-full bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 text-purple-700 px-3 py-2.5 rounded-lg text-sm font-medium hover:from-purple-100 hover:to-pink-100 transition"
            >
              ✨ Generar con IA
            </button>
            
          </div>
          <div>
            <button
              onClick={applyMyBrand}
              className="w-full bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-amber-100 transition"
            >
              🎨 Aplicar mi marca
            </button>
          </div>
                    <div>
            <button
              onClick={() => { setSelectedId(null); setShowBgPanel(true); }}
              className="w-full bg-teal-50 border border-teal-200 text-teal-700 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-100 transition"
            >
              🖼️ Fondo de página
            </button>
          </div>

          <div>
            <button
              onClick={insertQRCode}
              className="w-full bg-sky-50 border border-sky-200 text-sky-700 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-sky-100 transition"
            >
              📱 Insertar código QR
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-3 space-y-3">
            <button
              onClick={() => { setDrawMode((v) => !v); setSelectedId(null); }}
              className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                drawMode ? 'bg-gray-800 text-white' : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              {drawMode ? '✏️ Pluma activa' : '✏️ Activar pluma'}
            </button>

            {drawMode && (
              <>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Estilo</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'normal', label: 'Normal' },
                      { id: 'marker', label: 'Marcador' },
                      { id: 'pixel', label: 'Píxel' },
                      { id: 'calligraphy', label: 'Plumín' },
                      { id: 'sprite', label: 'Sprites' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        onClick={() => { setBrushStyle(b.id as BrushStyle); setIsErasing(false); }}
                        className={`px-2 py-1.5 rounded-md text-xs border ${
                          brushStyle === b.id && !isErasing
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                    <button
                      onClick={() => setIsErasing((v) => !v)}
                      className={`px-2 py-1.5 rounded-md text-xs border ${
                        isErasing ? 'bg-red-600 text-white border-red-600' : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      🧹 Borrador
                    </button>
                  </div>
                </div>

                {!isErasing && (
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Color</label>
                    <input
                      type="color"
                      value={brushColor}
                      onChange={(e) => setBrushColor(e.target.value)}
                      className="w-full h-9 border rounded-md cursor-pointer"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs text-gray-500 block mb-1">Grosor: {brushSize}px</label>
                  <input
                    type="range" min="2" max="40"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Texto</h3>
            

        
            <div className="space-y-2">
              <button onClick={() => addText('titulo')} className={sidebarBtn}>
                <span className="text-lg font-bold block">Añadir título</span>
              </button>
              <button onClick={() => addText('subtitulo')} className={sidebarBtn}>
                <span className="text-base font-semibold block">Añadir subtítulo</span>
              </button>
              <button onClick={() => addText('normal')} className={sidebarBtn}>
                <span className="text-sm block">Añadir texto</span>
              </button>
            </div>
          </div>

        <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Formas</h3>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <button onClick={addRect} title="Rectángulo" className="border border-gray-200 hover:border-brand-400 hover:bg-brand-50 rounded-lg p-3 flex items-center justify-center transition">
                <div className="w-7 h-5 bg-gray-700 rounded-sm" />
              </button>
              <button onClick={addCircle} title="Círculo" className="border border-gray-200 hover:border-brand-400 hover:bg-brand-50 rounded-lg p-3 flex items-center justify-center transition">
                <div className="w-6 h-6 bg-gray-700 rounded-full" />
              </button>
              <button onClick={addTriangle} title="Triángulo" className="border border-gray-200 hover:border-brand-400 hover:bg-brand-50 rounded-lg p-3 flex items-center justify-center transition">
                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[16px] border-b-gray-700" />
              </button>
              <button onClick={addLine} title="Línea" className="border border-gray-200 hover:border-brand-400 hover:bg-brand-50 rounded-lg p-3 flex items-center justify-center transition">
                <div className="w-7 h-0.5 bg-gray-700" />
              </button>
              <button onClick={addArrow} title="Flecha" className="border border-gray-200 hover:border-brand-400 hover:bg-brand-50 rounded-lg p-3 flex items-center justify-center transition">
                <span className="text-gray-700 text-lg">→</span>
              </button>
              <button onClick={addStar} title="Estrella" className="border border-gray-200 hover:border-brand-400 hover:bg-brand-50 rounded-lg p-3 flex items-center justify-center transition">
                <span className="text-gray-700 text-lg">★</span>
              </button>
            </div>
            <button
              onClick={() => setShowShapesModal(true)}
              className="w-full bg-violet-50 border border-violet-200 text-violet-700 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-violet-100 transition"
            >
              🔺 Más formas
            </button>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Imágenes</h3>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={sidebarBtn}
            >
              📤 Subir imagen
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Canvas central */}
        <div className="flex-1 bg-gray-100 overflow-auto flex items-center justify-center p-8">
          <div className="bg-white shadow-lg" style={{ position: 'relative' }}>
            <Stage
              ref={stageRef}
              width={800}
              height={600}
              onMouseDown={(e) => {
                if (drawMode) {
                  handlePenMouseDown();
                  return;
                }
                if (e.target === e.target.getStage()) setSelectedId(null);
              }}
              onMouseMove={handlePenMouseMove}
              onMouseUp={handlePenMouseUp}
              onMouseLeave={handlePenMouseUp}
            >
                            <Layer>
                <Rect x={0} y={0} width={800} height={600} {...getFillProps(canvasBg as any, 800, 600)} listening={false} />
                {elements.map((el) => {
                  const commonShapeProps = {
                    opacity: el.opacity ?? 1,
                    stroke: el.strokeColor,
                    strokeWidth: el.strokeWidth || 0,
                    shadowColor: el.shadowColor,
                    shadowBlur: el.shadowBlur || 0,
                    shadowOffsetX: el.shadowOffsetX || 0,
                    shadowOffsetY: el.shadowOffsetY || 0,
                    draggable: !el.locked,
                    onClick: () => setSelectedId(el.id),
                    onTap: () => setSelectedId(el.id),
                  };

                  if (el.type === 'rect') {
                    return (
                      <Rect
                        key={el.id}
                        ref={(node) => { shapeRefs.current[el.id] = node; }}
                        x={el.x}
                        y={el.y}
                        width={el.width}
                        height={el.height}
                                                rotation={el.rotation || 0}
                        {...getFillProps(el, el.width || 150, el.height || 100)}
                        cornerRadius={el.cornerRadius || 0}
                        {...commonShapeProps}
                        onDragEnd={(e) => updateElement({ ...el, x: e.target.x(), y: e.target.y() })}
                        onTransformEnd={(e) => {
                          const node = e.target;
                          const scaleX = node.scaleX();
                          const scaleY = node.scaleY();
                          node.scaleX(1);
                          node.scaleY(1);
                          updateElement({
                            ...el,
                            x: node.x(),
                            y: node.y(),
                            width: Math.max(20, node.width() * scaleX),
                            height: Math.max(20, node.height() * scaleY),
                            rotation: node.rotation(),
                          });
                        }}
                      />
                    );
                  }
                  if (el.type === 'circle') {
                    const w = el.width || 120;
                    const h = el.height || 120;
                    return (
                      <Ellipse
                        key={el.id}
                        ref={(node) => { shapeRefs.current[el.id] = node; }}
                        x={el.x + w / 2}
                        y={el.y + h / 2}
                        radiusX={w / 2}
                                                radiusY={h / 2}
                        rotation={el.rotation || 0}
                        {...getFillProps(el, w, h)}
                        {...commonShapeProps}
                        onDragEnd={(e) => {
                          const node = e.target;
                          updateElement({ ...el, x: node.x() - w / 2, y: node.y() - h / 2 });
                        }}
                        onTransformEnd={(e) => {
                          const node = e.target;
                          const scaleX = node.scaleX();
                          const scaleY = node.scaleY();
                          node.scaleX(1);
                          node.scaleY(1);
                          const newW = Math.max(20, w * scaleX);
                          const newH = Math.max(20, h * scaleY);
                          updateElement({
                            ...el,
                            x: node.x() - newW / 2,
                            y: node.y() - newH / 2,
                            width: newW,
                            height: newH,
                            rotation: node.rotation(),
                          });
                        }}
                      />
                    );
                  }
                  if (el.type === 'triangle') {
                    const w = el.width || 120;
                    const h = el.height || 120;
                    return (
                      <Line
                        key={el.id}
                        ref={(node) => { shapeRefs.current[el.id] = node; }}
                        x={el.x}
                        y={el.y}
                        points={[w / 2, 0, w, h, 0, h]}
                                               closed
                        {...getFillProps(el, w, h)}
                        rotation={el.rotation || 0}
                        {...commonShapeProps}
                        onDragEnd={(e) => updateElement({ ...el, x: e.target.x(), y: e.target.y() })}
                        onTransformEnd={(e) => {
                          const node = e.target;
                          const scaleX = node.scaleX();
                          const scaleY = node.scaleY();
                          node.scaleX(1);
                          node.scaleY(1);
                          updateElement({
                            ...el,
                            x: node.x(),
                            y: node.y(),
                            width: Math.max(20, w * scaleX),
                            height: Math.max(20, h * scaleY),
                            rotation: node.rotation(),
                          });
                        }}
                      />
                    );
                  }
                  if (el.type === 'line') {
                    const w = el.width || 150;
                    return (
                      <Line
                        key={el.id}
                        ref={(node) => { shapeRefs.current[el.id] = node; }}
                        x={el.x}
                        y={el.y}
                        points={[0, 0, w, 0]}
                        stroke={el.fill}
                        strokeWidth={el.strokeWidth || 4}
                        rotation={el.rotation || 0}
                        opacity={el.opacity ?? 1}
                        draggable={!el.locked}
                        onClick={() => setSelectedId(el.id)}
                        onTap={() => setSelectedId(el.id)}
                        onDragEnd={(e) => updateElement({ ...el, x: e.target.x(), y: e.target.y() })}
                        onTransformEnd={(e) => {
                          const node = e.target;
                          const scaleX = node.scaleX();
                          node.scaleX(1);
                          updateElement({ ...el, x: node.x(), y: node.y(), width: Math.max(20, w * scaleX), rotation: node.rotation() });
                        }}
                      />
                    );
                  }
                  if (el.type === 'arrow') {
                    const w = el.width || 150;
                    return (
                      <Arrow
                        key={el.id}
                        ref={(node) => { shapeRefs.current[el.id] = node; }}
                        x={el.x}
                        y={el.y}
                        points={[0, 0, w, 0]}
                        stroke={el.fill}
                        fill={el.fill}
                        strokeWidth={el.strokeWidth || 4}
                        rotation={el.rotation || 0}
                        opacity={el.opacity ?? 1}
                        draggable={!el.locked}
                        onClick={() => setSelectedId(el.id)}
                        onTap={() => setSelectedId(el.id)}
                        onDragEnd={(e) => updateElement({ ...el, x: e.target.x(), y: e.target.y() })}
                        onTransformEnd={(e) => {
                          const node = e.target;
                          const scaleX = node.scaleX();
                          node.scaleX(1);
                          updateElement({ ...el, x: node.x(), y: node.y(), width: Math.max(20, w * scaleX), rotation: node.rotation() });
                        }}
                      />
                    );
                  }
                  if (el.type === 'star') {
                    const w = el.width || 120;
                    const h = el.height || 120;
                    return (
                      <Star
                        key={el.id}
                        ref={(node) => { shapeRefs.current[el.id] = node; }}
                        x={el.x + w / 2}
                        y={el.y + h / 2}
                        numPoints={5}
                        innerRadius={Math.min(w, h) / 4}
                                                outerRadius={Math.min(w, h) / 2}
                        {...getFillProps(el, w, h)}
                        rotation={el.rotation || 0}
                        {...commonShapeProps}
                        onDragEnd={(e) => {
                          const node = e.target;
                          updateElement({ ...el, x: node.x() - w / 2, y: node.y() - h / 2 });
                        }}
                        onTransformEnd={(e) => {
                          const node = e.target;
                          const scaleX = node.scaleX();
                          const scaleY = node.scaleY();
                          node.scaleX(1);
                          node.scaleY(1);
                          const newW = Math.max(20, w * scaleX);
                          const newH = Math.max(20, h * scaleY);
                          updateElement({
                            ...el,
                            x: node.x() - newW / 2,
                            y: node.y() - newH / 2,
                            width: newW,
                            height: newH,
                            rotation: node.rotation(),
                          });
                        }}
                      />
                    );
                  }
                  if (el.type === 'text') {
                    const displayText = el.uppercase ? (el.text || '').toUpperCase() : el.text;
                    return (
                      <Text
                        key={el.id}
                        ref={(node) => { shapeRefs.current[el.id] = node; }}
                        x={el.x}
                        y={el.y}
                        width={el.width || 200}
                        text={displayText}
                        fontSize={el.fontSize}
                        fontFamily={el.fontFamily || 'Poppins'}
                        fontStyle={el.fontStyle || 'normal'}
                        textDecoration={el.textDecoration || ''}
                        lineHeight={el.lineHeight || 1.2}
                                                letterSpacing={el.letterSpacing || 0}
                        align={el.align || 'left'}
                        {...getFillProps(el, el.width || 200, (el.fontSize || 24) * 1.4)}
                        rotation={el.rotation || 0}
                        opacity={el.opacity ?? 1}
                        wrap="word"
                        draggable={!el.locked}
                        onClick={() => setSelectedId(el.id)}
                        onTap={() => setSelectedId(el.id)}
                        onDblClick={() => handleTextDblClick(el)}
                        onDblTap={() => handleTextDblClick(el)}
                        onDragEnd={(e) => updateElement({ ...el, x: e.target.x(), y: e.target.y() })}
                        onTransformEnd={(e) => {
                          const node = e.target;
                          const scaleX = node.scaleX();
                          const scaleY = node.scaleY();
                          node.scaleX(1);
                          node.scaleY(1);
                          updateElement({
                            ...el,
                            x: node.x(),
                            y: node.y(),
                            width: Math.max(50, node.width() * scaleX),
                            fontSize: Math.max(8, (el.fontSize || 24) * scaleY),
                            rotation: node.rotation(),
                          });
                        }}
                      />
                    );
                  }
                  if (el.type === 'image') {
                    return (
                      <ImageNode
                        key={el.id}
                        el={el}
                        shapeRef={(node: any) => { shapeRefs.current[el.id] = node; }}
                        onSelect={() => setSelectedId(el.id)}
                        onChange={updateElement}
                      />
                    );
                  }
                  if (el.type === 'icon') {
                    return (
                      <ShapeIconNode
                        key={el.id}
                        el={el}
                        shapeRef={(node: any) => { shapeRefs.current[el.id] = node; }}
                        onSelect={() => setSelectedId(el.id)}
                        onChange={updateElement}
                      />
                    );
                  }
                  if (el.type === 'pen') {
                    const pts = el.points || [];
                    if (el.brushStyle === 'sprite') {
                      const dots = [];
                      for (let i = 0; i < pts.length; i += 8) {
                        dots.push(
                          <Star
                            key={`${el.id}-dot-${i}`}
                            x={pts[i]}
                            y={pts[i + 1]}
                            numPoints={5}
                            innerRadius={(el.strokeWidth || 6) / 2}
                            outerRadius={el.strokeWidth || 6}
                            fill={el.fill}
                            opacity={el.opacity ?? 1}
                          />
                        );
                      }
                      return (
                        <Group key={el.id} onClick={() => setSelectedId(el.id)} onTap={() => setSelectedId(el.id)}>
                          {dots}
                        </Group>
                      );
                    }
                    return (
                      <Line
                        key={el.id}
                        ref={(node) => { shapeRefs.current[el.id] = node; }}
                        points={pts}
                        stroke={el.fill}
                        strokeWidth={el.strokeWidth || 6}
                        opacity={el.opacity ?? 1}
                        lineCap={el.brushStyle === 'calligraphy' ? 'square' : 'round'}
                        lineJoin={el.brushStyle === 'calligraphy' ? 'miter' : 'round'}
                        tension={el.brushStyle === 'pixel' ? 0 : 0.4}
                        globalCompositeOperation={el.isEraser ? 'destination-out' : 'source-over'}
                        draggable={!el.locked && !drawMode}
                        onClick={() => setSelectedId(el.id)}
                        onTap={() => setSelectedId(el.id)}
                        onDragEnd={(e) => {
                          const node = e.target;
                          const dx = node.x();
                          const dy = node.y();
                          node.x(0);
                          node.y(0);
                          const newPts = pts.map((p, idx) => (idx % 2 === 0 ? p + dx : p + dy));
                          updateElement({ ...el, points: newPts });
                        }}
                      />
                    );
                  }
                  return null;
                })}
                <Transformer ref={trRef} rotateEnabled />
              </Layer>
            </Stage>

            {editingElement && editingText && (
              <textarea
                autoFocus
                value={editingText.value}
                onChange={(e) => setEditingText({ ...editingText, value: e.target.value })}
                onBlur={commitTextEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    commitTextEdit();
                  }
                }}
                style={{
                  position: 'absolute',
                  top: editingElement.y,
                  left: editingElement.x,
                  width: editingElement.width || 200,
                  fontSize: editingElement.fontSize,
                  fontFamily: editingElement.fontFamily || 'Poppins',
                  fontWeight: editingElement.fontStyle === 'bold' ? 'bold' : 'normal',
                  textAlign: (editingElement.align as any) || 'left',
                  border: '1px solid #7C3AED',
                  padding: '2px 4px',
                  background: 'white',
                  resize: 'none',
                  overflow: 'hidden',
                  lineHeight: 1.2,
                }}
              />
            )}
          </div>
        </div>

        {/* Panel derecho de propiedades */}
                <div className="w-72 shrink-0 border-l bg-white overflow-y-auto p-4">
          {!selectedElement && !showBgPanel && (
            <p className="text-sm text-gray-400 mt-4 text-center">
              Selecciona un elemento para editar sus propiedades
            </p>
          )}

          {!selectedElement && showBgPanel && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Fondo de página</h3>
                <button onClick={() => setShowBgPanel(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => patchBg({ fillType: 'solid' })}
                  className={`flex-1 h-8 border rounded-md text-xs ${(!canvasBg.fillType || canvasBg.fillType === 'solid') ? 'bg-gray-800 text-white' : 'hover:bg-gray-50'}`}
                >
                  Sólido
                </button>
                <button
                  onClick={() => patchBg({ fillType: 'linear', gradientStart: canvasBg.gradientStart || canvasBg.fill || '#7C3AED', gradientEnd: canvasBg.gradientEnd || '#ffffff' })}
                  className={`flex-1 h-8 border rounded-md text-xs ${canvasBg.fillType === 'linear' ? 'bg-gray-800 text-white' : 'hover:bg-gray-50'}`}
                >
                  Lineal
                </button>
                <button
                  onClick={() => patchBg({ fillType: 'radial', gradientStart: canvasBg.gradientStart || canvasBg.fill || '#7C3AED', gradientEnd: canvasBg.gradientEnd || '#ffffff' })}
                  className={`flex-1 h-8 border rounded-md text-xs ${canvasBg.fillType === 'radial' ? 'bg-gray-800 text-white' : 'hover:bg-gray-50'}`}
                >
                  Radial
                </button>
              </div>

              {(!canvasBg.fillType || canvasBg.fillType === 'solid') && (
                <input
                  type="color"
                  value={canvasBg.fill || '#ffffff'}
                  onChange={(e) => patchBg({ fill: e.target.value })}
                  className="w-full h-9 border rounded-md cursor-pointer"
                />
              )}

              {(canvasBg.fillType === 'linear' || canvasBg.fillType === 'radial') && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={canvasBg.gradientStart || '#7C3AED'}
                      onChange={(e) => patchBg({ gradientStart: e.target.value })}
                      className="flex-1 h-9 border rounded-md cursor-pointer"
                    />
                    <input
                      type="color"
                      value={canvasBg.gradientEnd || '#ffffff'}
                      onChange={(e) => patchBg({ gradientEnd: e.target.value })}
                      className="flex-1 h-9 border rounded-md cursor-pointer"
                    />
                  </div>
                  {canvasBg.fillType === 'linear' && (
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Ángulo: {canvasBg.gradientAngle ?? 0}°</label>
                      <input
                        type="range" min="0" max="360"
                        value={canvasBg.gradientAngle ?? 0}
                        onChange={(e) => patchBg({ gradientAngle: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {selectedElement && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">
                  {selectedElement.type === 'text' ? 'Texto' : selectedElement.type === 'image' ? 'Imagen' : 'Forma'}
                </h3>
                <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              {selectedElement.type === 'text' && (
                <>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Fuente</label>
                    <select
                      value={selectedElement.fontFamily || 'Poppins'}
                      onChange={(e) => changeFontFamily(e.target.value)}
                      className="w-full border rounded-md px-2 py-2 text-sm"
                      style={{ fontFamily: selectedElement.fontFamily || 'Poppins' }}
                    >
                      {AVAILABLE_FONTS.map((font) => (
                        <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Tamaño</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => changeFontSize(-2)} className="w-8 h-8 border rounded-md text-gray-600 hover:bg-gray-50">−</button>
                      <span className="text-sm w-8 text-center">{selectedElement.fontSize}</span>
                      <button onClick={() => changeFontSize(2)} className="w-8 h-8 border rounded-md text-gray-600 hover:bg-gray-50">+</button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Color de texto</label>
                    <input
                      type="color"
                      value={selectedElement.fill || '#111827'}
                      onChange={(e) => changeColor(e.target.value)}
                      className="w-full h-9 border rounded-md cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Alineación</label>
                    <div className="flex gap-2">
                      <button onClick={() => changeAlign('left')} className={`flex-1 h-9 border rounded-md ${selectedElement.align === 'left' ? 'bg-brand-600 text-white' : 'hover:bg-gray-50'}`}>⯇</button>
                      <button onClick={() => changeAlign('center')} className={`flex-1 h-9 border rounded-md ${selectedElement.align === 'center' ? 'bg-brand-600 text-white' : 'hover:bg-gray-50'}`}>☰</button>
                      <button onClick={() => changeAlign('right')} className={`flex-1 h-9 border rounded-md ${selectedElement.align === 'right' ? 'bg-brand-600 text-white' : 'hover:bg-gray-50'}`}>⯈</button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Estilo</label>
                    <div className="flex gap-2">
                      <button onClick={toggleBold} className={`flex-1 h-9 border rounded-md font-bold ${selectedElement.fontStyle === 'bold' ? 'bg-gray-800 text-white' : 'hover:bg-gray-50'}`}>B</button>
                      <button onClick={toggleUnderline} className={`flex-1 h-9 border rounded-md underline ${selectedElement.textDecoration === 'underline' ? 'bg-gray-800 text-white' : 'hover:bg-gray-50'}`}>U</button>
                      <button onClick={toggleStrikethrough} className={`flex-1 h-9 border rounded-md line-through ${selectedElement.textDecoration === 'line-through' ? 'bg-gray-800 text-white' : 'hover:bg-gray-50'}`}>S</button>
                      <button onClick={toggleUppercase} className={`flex-1 h-9 border rounded-md text-xs ${selectedElement.uppercase ? 'bg-gray-800 text-white' : 'hover:bg-gray-50'}`}>AA</button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Interlineado</label>
                    <input
                      type="range" min="0.8" max="2.5" step="0.1"
                      value={selectedElement.lineHeight || 1.2}
                      onChange={(e) => changeLineHeight(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Interletra</label>
                    <input
                      type="range" min="-2" max="20" step="0.5"
                      value={selectedElement.letterSpacing || 0}
                      onChange={(e) => changeLetterSpacing(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </>
              )}

                            {(selectedElement.type === 'rect' || selectedElement.type === 'circle' || selectedElement.type === 'triangle' || selectedElement.type === 'star' || selectedElement.type === 'line' || selectedElement.type === 'arrow' || selectedElement.type === 'icon' || selectedElement.type === 'text') && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Relleno</label>
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => patchSelected({ fillType: 'solid' })}
                      className={`flex-1 h-8 border rounded-md text-xs ${(!selectedElement.fillType || selectedElement.fillType === 'solid') ? 'bg-gray-800 text-white' : 'hover:bg-gray-50'}`}
                    >
                      Sólido
                    </button>
                    <button
                      onClick={() => patchSelected({ fillType: 'linear', gradientStart: selectedElement.gradientStart || selectedElement.fill || '#7C3AED', gradientEnd: selectedElement.gradientEnd || '#EC4899' })}
                      className={`flex-1 h-8 border rounded-md text-xs ${selectedElement.fillType === 'linear' ? 'bg-gray-800 text-white' : 'hover:bg-gray-50'}`}
                    >
                      Lineal
                    </button>
                    <button
                      onClick={() => patchSelected({ fillType: 'radial', gradientStart: selectedElement.gradientStart || selectedElement.fill || '#7C3AED', gradientEnd: selectedElement.gradientEnd || '#EC4899' })}
                      className={`flex-1 h-8 border rounded-md text-xs ${selectedElement.fillType === 'radial' ? 'bg-gray-800 text-white' : 'hover:bg-gray-50'}`}
                    >
                      Radial
                    </button>
                  </div>

                  {(!selectedElement.fillType || selectedElement.fillType === 'solid') && (
                    <input
                      type="color"
                      value={selectedElement.fill || '#7C3AED'}
                      onChange={(e) => changeColor(e.target.value)}
                      className="w-full h-9 border rounded-md cursor-pointer"
                    />
                  )}

                  {(selectedElement.fillType === 'linear' || selectedElement.fillType === 'radial') && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={selectedElement.gradientStart || '#7C3AED'}
                          onChange={(e) => patchSelected({ gradientStart: e.target.value })}
                          className="flex-1 h-9 border rounded-md cursor-pointer"
                        />
                        <input
                          type="color"
                          value={selectedElement.gradientEnd || '#EC4899'}
                          onChange={(e) => patchSelected({ gradientEnd: e.target.value })}
                          className="flex-1 h-9 border rounded-md cursor-pointer"
                        />
                      </div>
                      {selectedElement.fillType === 'linear' && (
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">Ángulo: {selectedElement.gradientAngle ?? 0}°</label>
                          <input
                            type="range" min="0" max="360"
                            value={selectedElement.gradientAngle ?? 0}
                            onChange={(e) => patchSelected({ gradientAngle: parseFloat(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {selectedElement.type === 'image' && (
                <>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Voltear</label>
                    <div className="flex gap-2">
                      <button onClick={toggleFlipX} className={`flex-1 h-9 border rounded-md text-xs ${selectedElement.flipX ? 'bg-gray-800 text-white' : 'hover:bg-gray-50'}`}>↔ Horizontal</button>
                      <button onClick={toggleFlipY} className={`flex-1 h-9 border rounded-md text-xs ${selectedElement.flipY ? 'bg-gray-800 text-white' : 'hover:bg-gray-50'}`}>↕ Vertical</button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Filtro</label>
                    <div className="flex gap-2">
                      <button onClick={() => applyImageFilter('none')} className={`flex-1 h-9 border rounded-md text-xs ${(!selectedElement.filterType || selectedElement.filterType === 'none') ? 'bg-gray-800 text-white' : 'hover:bg-gray-50'}`}>Normal</button>
                      <button onClick={() => applyImageFilter('grayscale')} className={`flex-1 h-9 border rounded-md text-xs ${selectedElement.filterType === 'grayscale' ? 'bg-gray-800 text-white' : 'hover:bg-gray-50'}`}>B/N</button>
                      <button onClick={() => applyImageFilter('sepia')} className={`flex-1 h-9 border rounded-md text-xs ${selectedElement.filterType === 'sepia' ? 'bg-gray-800 text-white' : 'hover:bg-gray-50'}`}>Sepia</button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Brillo</label>
                    <input
                      type="range" min="-100" max="100"
                      value={selectedElement.brightness || 0}
                      onChange={(e) => changeBrightness(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Contraste</label>
                    <input
                      type="range" min="-100" max="100"
                      value={selectedElement.contrast || 0}
                      onChange={(e) => changeContrast(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Recorte</label>
                    <button onClick={smartSquareCrop} className="w-full h-9 border rounded-md text-xs hover:bg-gray-50">
                      Recortar a cuadrado
                    </button>
                  </div>
                </>
              )}
              

              {selectedElement.type !== 'line' && selectedElement.type !== 'arrow' && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Bordes redondeados</label>
                  <input
                    type="range" min="0" max="50"
                    value={selectedElement.cornerRadius || 0}
                    onChange={(e) => changeCornerRadius(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-gray-500 block mb-1">Opacidad</label>
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={selectedElement.opacity ?? 1}
                  onChange={(e) => changeOpacity(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Borde / Trazo</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={selectedElement.strokeColor || '#000000'}
                    onChange={(e) => changeStrokeColor(e.target.value)}
                    className="w-10 h-9 border rounded-md cursor-pointer"
                  />
                  <input
                    type="range" min="0" max="20"
                    value={selectedElement.strokeWidth || 0}
                    onChange={(e) => changeStrokeWidth(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Sombra</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="color"
                    value={selectedElement.shadowColor || '#000000'}
                    onChange={(e) => changeShadowColor(e.target.value)}
                    className="w-full h-9 border rounded-md cursor-pointer"
                  />
                  <div className="flex items-center text-xs text-gray-500">Blur: {selectedElement.shadowBlur || 0}</div>
                </div>
                <input
                  type="range" min="0" max="30"
                  value={selectedElement.shadowBlur || 0}
                  onChange={(e) => changeShadowBlur(parseFloat(e.target.value))}
                  className="w-full mb-1"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="range" min="-20" max="20"
                    value={selectedElement.shadowOffsetX || 0}
                    onChange={(e) => changeShadowOffsetX(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <input
                    type="range" min="-20" max="20"
                    value={selectedElement.shadowOffsetY || 0}
                    onChange={(e) => changeShadowOffsetY(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Alinear en canvas</label>
                <div className="flex gap-2">
                  <button onClick={centerHorizontal} className="flex-1 border rounded-md py-2 text-xs hover:bg-gray-50">Centrar horizontal</button>
                  <button onClick={centerVertical} className="flex-1 border rounded-md py-2 text-xs hover:bg-gray-50">Centrar vertical</button>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Orden</label>
                <div className="flex gap-2">
                  <button onClick={bringToFront} className="flex-1 border rounded-md py-2 text-xs hover:bg-gray-50">Traer al frente</button>
                  <button onClick={sendToBack} className="flex-1 border rounded-md py-2 text-xs hover:bg-gray-50">Enviar al fondo</button>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <button onClick={toggleLock} className={`flex-1 border rounded-md py-2 text-sm ${selectedElement.locked ? 'bg-gray-800 text-white' : 'hover:bg-gray-50'}`}>
                  {selectedElement.locked ? '🔒 Bloqueado' : '🔓 Bloquear'}
                </button>
                <button onClick={duplicateSelected} className="flex-1 border rounded-md py-2 text-sm hover:bg-gray-50">Duplicar</button>
                <button onClick={deleteSelected} className="flex-1 bg-red-600 text-white rounded-md py-2 text-sm hover:bg-red-700">Eliminar</button>
              </div>
            </div>
          )}
        </div>
      </div>

     {showTemplates && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowTemplates(false)}>
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Elige una plantilla</h2>
              <button onClick={() => setShowTemplates(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => applyTemplate(tpl.id)}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition group"
                >
                  <div
                    className="h-24 w-full"
                    style={{ backgroundColor: tpl.previewColor }}
                  />
                  <div className="p-2 text-xs font-medium text-gray-700 group-hover:text-brand-600">
                    {tpl.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showShapesModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowShapesModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Elige una forma</h2>
              <button onClick={() => setShowShapesModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {SHAPE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setShapeCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    shapeCategory === cat ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="overflow-y-auto grid grid-cols-5 sm:grid-cols-6 gap-3 pr-1">
              {SHAPES.filter((s) => s.category === shapeCategory).map((s) => (
                <button
                  key={s.id}
                  onClick={() => addShapeIcon(s.id)}
                  title={s.name}
                  className="border border-gray-200 hover:border-brand-400 hover:bg-brand-50 rounded-lg p-3 flex items-center justify-center transition aspect-square"
                >
                  <ShapeThumbnail def={s} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => !generatingImage && setShowAIModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">✨ Generar imagen con IA</h2>
              <button onClick={() => setShowAIModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <p className="text-sm text-gray-500 mb-3">Describe la imagen que quieres crear:</p>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ej: un tenis deportivo rojo sobre fondo blanco, estilo publicitario"
              rows={3}
              className="w-full border rounded-md px-3 py-2 text-sm mb-4 resize-none"
            />
            <button
              onClick={generateAIImage}
              disabled={generatingImage || !aiPrompt.trim()}
              className="w-full bg-purple-600 text-white py-2.5 rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition"
            >
              {generatingImage ? 'Generando...' : 'Generar imagen'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
