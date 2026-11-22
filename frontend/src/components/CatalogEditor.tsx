'use client';

import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Ellipse, Text, Image as KonvaImage, Transformer, Line, Arrow, Star, Group, RegularPolygon, Ring, Arc, Wedge, Path } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';
import api from '@/lib/api';
import Logo from './Logo';
import Link from 'next/link';
import { AVAILABLE_FONTS } from './CanvasEditor';
import QRCode from 'qrcode';
import { notifyMascot } from '@/lib/mascotBus';
import { T, ui } from '@/lib/editorTheme';
import { SHAPES, SHAPE_CATEGORIES, ShapeDef } from '@/lib/shapes';
import { Shapes, Type, ImagePlus, Pencil, Palette, QrCode, Save, FileDown, Upload, Minus, Plus, Search, PaintBucket, Layers, Eye, EyeOff, Lock, Unlock, ChevronUp, ChevronDown, Trash2, RotateCcw, RotateCw, FlipHorizontal2, FlipVertical2, Maximize2, ImageUp } from 'lucide-react';

const TEXT_STYLES = {
  titulo: { fontSize: 48, fontFamily: 'Poppins', fontWeight: 'bold' as const },
  subtitulo: { fontSize: 28, fontFamily: 'Poppins', fontWeight: '600' as const },
  normal: { fontSize: 18, fontFamily: 'Poppins', fontWeight: 'normal' as const },
};

type ElementType = 'rect' | 'circle' | 'triangle' | 'line' | 'arrow' | 'star' | 'text' | 'image' | 'pen' | 'icon';
type BrushStyle = 'normal' | 'marker' | 'pixel' | 'calligraphy' | 'sprite';

interface CatalogElement {
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
  align?: string;
  fill?: string;
  src?: string;
  opacity?: number;
  cornerRadius?: number;
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  locked?: boolean;
  hidden?: boolean;
  points?: number[];
  brushStyle?: BrushStyle;
  isEraser?: boolean;
  shapeId?: string;
  flipX?: boolean;
  flipY?: boolean;
  filterType?: 'none' | 'grayscale' | 'sepia' | 'invert';
  brightness?: number;
  contrast?: number;
  originalSrc?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  fit?: 'stretch' | 'fill';
  zoom?: number;
  offsetX?: number;
  offsetY?: number;
  saturation?: number;
  hue?: number;
  blur?: number;
  pixelate?: number;
  fillType?: 'solid' | 'linear' | 'radial';
  gradientStart?: string;
  gradientEnd?: string;
  gradientAngle?: number;
}

interface PageBg {
  fill?: string;
  fillType?: 'solid' | 'linear' | 'radial';
  gradientStart?: string;
  gradientEnd?: string;
  gradientAngle?: number;
}

interface CatalogPage {
  id: string;
  elements: CatalogElement[];
  bg?: PageBg;
}

function ImageNode({ el, shapeRef, onSelect, onChange }: any) {
  const [img] = useImage(el.src, 'anonymous');
  const nodeRef = useRef<any>(null);

  const w = el.width || 200;
  const h = el.height || 200;

  // Modo "llenar": la imagen cubre el marco y se recorta; zoom y mover cambian la parte visible
  let cropProps: any = {};
  if (el.fit === 'fill' && img) {
    const nw = img.width || 1;
    const nh = img.height || 1;
    const zoom = Math.max(1, el.zoom ?? 1);
    const scale = Math.max(w / nw, h / nh) * zoom;
    const cw = w / scale;
    const ch = h / scale;
    const cx = Math.max(0, nw - cw) * (0.5 + (el.offsetX ?? 0) / 200);
    const cy = Math.max(0, nh - ch) * (0.5 + (el.offsetY ?? 0) / 200);
    cropProps = { cropX: cx, cropY: cy, cropWidth: cw, cropHeight: ch };
  }

  useEffect(() => {
    const node = nodeRef.current;
    if (!node || !img) return;
    const filters: any[] = [];
    if (el.filterType === 'grayscale') filters.push(Konva.Filters.Grayscale);
    if (el.filterType === 'sepia') filters.push(Konva.Filters.Sepia);
    if (el.filterType === 'invert') filters.push(Konva.Filters.Invert);
    if (el.brightness) filters.push(Konva.Filters.Brighten);
    if (el.contrast) filters.push(Konva.Filters.Contrast);
    if (el.saturation || el.hue) filters.push(Konva.Filters.HSL);
    if (el.blur) filters.push(Konva.Filters.Blur);
    if (el.pixelate) filters.push(Konva.Filters.Pixelate);

    if (filters.length === 0) {
      node.filters([]);
      node.clearCache();
      node.getLayer()?.batchDraw();
      return;
    }
    node.cache();
    node.filters(filters);
    node.brightness((el.brightness || 0) / 100);
    node.contrast(el.contrast || 0);
    node.saturation((el.saturation || 0) / 100);
    node.hue(el.hue || 0);
    node.blurRadius(el.blur || 0);
    node.pixelSize(Math.max(1, el.pixelate || 1));
    node.getLayer()?.batchDraw();
  }, [img, el.filterType, el.brightness, el.contrast, el.saturation, el.hue, el.blur, el.pixelate, w, h, el.fit, el.zoom, el.offsetX, el.offsetY]);

  return (
    <KonvaImage
      ref={(node) => {
        nodeRef.current = node;
        shapeRef(node);
      }}
      image={img}
      {...cropProps}
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

function getFillProps(el: any, w: number, h: number) {
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

function ShapeThumbnail({ def }: { def: ShapeDef }) {
  if (def.kind === 'path') {
    return (
      <svg viewBox="0 0 100 100" width="28" height="28">
        <path d={def.path} fill="#C4B5FD" />
      </svg>
    );
  }
  const commonSvgProps = { fill: '#C4B5FD' };
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
        <circle cx="50" cy="50" r={45 * (1 - (def.innerRatio ?? 0.5)) / 1 + 45 * (def.innerRatio ?? 0.5) * 0} fill="none" stroke="#C4B5FD" strokeWidth={45 * (1 - (def.innerRatio ?? 0.5))} />
      </svg>
    );
  }
  if (def.kind === 'arc' || def.kind === 'wedge') {
    return (
      <svg viewBox="0 0 100 100" width="28" height="28">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#C4B5FD" strokeWidth="8" strokeDasharray={`${((def.angle || 90) / 360) * 251} 251`} />
      </svg>
    );
  }
  if (def.kind === 'arrow-dir') {
    return (
      <svg viewBox="0 0 100 100" width="28" height="28" style={{ transform: `rotate(${def.rotation || 0}deg)` }}>
        <line x1="10" y1="50" x2="80" y2="50" stroke="#C4B5FD" strokeWidth="8" />
        <polygon points="70,35 95,50 70,65" fill="#C4B5FD" />
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

export default function CatalogEditor({ catalogId }: { catalogId: string }) {
  const [title, setTitle] = useState('Mi catálogo');
  const [pages, setPages] = useState<CatalogPage[]>([{ id: `page-${Date.now()}`, elements: [] }]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<{ id: string; value: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const shapeRefs = useRef<Record<string, any>>({});
  const [drawMode, setDrawMode] = useState(false);
  const [brushStyle, setBrushStyle] = useState<BrushStyle>('normal');
  const [brushColor, setBrushColor] = useState('#111827');
  const [brushSize, setBrushSize] = useState(6);
  const [isErasing, setIsErasing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStrokeId, setCurrentStrokeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('elementos');
  const [zoom, setZoom] = useState(1);

  const currentPage = pages[currentPageIndex];
  const elements = currentPage?.elements || [];
  const canvasBg: PageBg = currentPage?.bg || { fill: '#ffffff' };
  const patchBg = (patch: Partial<PageBg>) =>
    setPages((prev) => prev.map((p, i) => (i === currentPageIndex ? { ...p, bg: { ...(p.bg || { fill: '#ffffff' }), ...patch } } : p)));
  const [showBgPanel, setShowBgPanel] = useState(false);
  const [shapeCategory, setShapeCategory] = useState(SHAPE_CATEGORIES[0]);
  const [searchQ, setSearchQ] = useState('');

  useEffect(() => {
    api
      .get(`/catalogs/${catalogId}`)
      .then((res) => {
        setTitle(res.data.title);
        const design = res.data.design;
        if (design && design.pages && design.pages.length > 0) {
          setPages(design.pages);
        }
      })
      .catch((err) => console.error('Error cargando catálogo:', err));
  }, [catalogId]);

  useEffect(() => {
    if (selectedId && shapeRefs.current[selectedId] && trRef.current) {
      trRef.current.nodes([shapeRefs.current[selectedId]]);
      trRef.current.getLayer().batchDraw();
    } else if (trRef.current) {
      trRef.current.nodes([]);
    }
  }, [selectedId, elements]);

  const updatePageElements = (updater: (prev: CatalogElement[]) => CatalogElement[]) => {
    setPages((prev) => prev.map((p, i) => (i === currentPageIndex ? { ...p, elements: updater(p.elements) } : p)));
  };

  const addPage = () => {
    const newPage: CatalogPage = { id: `page-${Date.now()}`, elements: [] };
    setPages((prev) => [...prev, newPage]);
    setCurrentPageIndex(pages.length);
    setSelectedId(null);
  };

  const deletePage = (index: number) => {
    if (pages.length <= 1) return;
    const confirmDelete = window.confirm('¿Eliminar esta página?');
    if (!confirmDelete) return;
    setPages((prev) => prev.filter((_, i) => i !== index));
    setCurrentPageIndex((prev) => Math.max(0, prev >= index ? prev - 1 : prev));
    setSelectedId(null);
  };

  const addRect = () => {
    const id = `rect-${Date.now()}`;
    updatePageElements((prev) => [...prev, {
      id, type: 'rect', x: 60, y: 60, width: 150, height: 100, fill: '#7C3AED', rotation: 0, opacity: 1, cornerRadius: 0,
    }]);
    setSelectedId(id);
  };

  const addCircle = () => {
    const id = `circle-${Date.now()}`;
    updatePageElements((prev) => [...prev, {
      id, type: 'circle', x: 60, y: 60, width: 120, height: 120, fill: '#7C3AED', rotation: 0, opacity: 1,
    }]);
    setSelectedId(id);
  };

  const addTriangle = () => {
    const id = `triangle-${Date.now()}`;
    updatePageElements((prev) => [...prev, {
      id, type: 'triangle', x: 60, y: 60, width: 120, height: 120, fill: '#7C3AED', rotation: 0, opacity: 1,
    }]);
    setSelectedId(id);
  };

  const addLine = () => {
    const id = `line-${Date.now()}`;
    updatePageElements((prev) => [...prev, {
      id, type: 'line', x: 60, y: 60, width: 150, height: 0, fill: '#7C3AED', rotation: 0, opacity: 1, strokeWidth: 4,
    }]);
    setSelectedId(id);
  };

  const addArrow = () => {
    const id = `arrow-${Date.now()}`;
    updatePageElements((prev) => [...prev, {
      id, type: 'arrow', x: 60, y: 60, width: 150, height: 0, fill: '#7C3AED', rotation: 0, opacity: 1, strokeWidth: 4,
    }]);
    setSelectedId(id);
  };

  const addStar = () => {
    const id = `star-${Date.now()}`;
    updatePageElements((prev) => [...prev, {
      id, type: 'star', x: 60, y: 60, width: 120, height: 120, fill: '#7C3AED', rotation: 0, opacity: 1,
    }]);
    setSelectedId(id);
  };

  const addShapeIcon = (shapeId: string) => {
    const id = `icon-${Date.now()}`;
    updatePageElements((prev) => [...prev, {
      id, type: 'icon', shapeId, x: 60, y: 60, width: 100, height: 100, fill: '#7C3AED', rotation: 0, opacity: 1,
    }]);
    setSelectedId(id);
  };

  const addText = (style: 'titulo' | 'subtitulo' | 'normal' = 'normal') => {
    const id = `text-${Date.now()}`;
    const preset = TEXT_STYLES[style];
    const labelMap = { titulo: 'Añadir título', subtitulo: 'Añadir subtítulo', normal: 'Añadir texto' };
    updatePageElements((prev) => [...prev, {
      id,
      type: 'text',
      x: 100,
      y: 100,
      width: 250,
      text: labelMap[style],
      fontSize: preset.fontSize,
      fontFamily: preset.fontFamily,
      fontStyle: preset.fontWeight === 'bold' ? 'bold' : 'normal',
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
      updatePageElements((prev) => [...prev, {
        id, type: 'image', x: 80, y: 80, width: 200, height: 200, src: reader.result as string, rotation: 0, opacity: 1, cornerRadius: 0,
      }]);
      setSelectedId(id);
    };
    reader.readAsDataURL(file);
  };

  const getPointerPos = () => {
    const stage = stageRef.current;
    if (!stage) return null;
    return stage.getPointerPosition();
  };

  const snapToPixel = (val: number, size = 10) => Math.round(val / size) * size;

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
    const newStroke: CatalogElement = {
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
    updatePageElements((prev) => [...prev, newStroke]);
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
    updatePageElements((prev) =>
      prev.map((el) =>
        el.id === currentStrokeId ? { ...el, points: [...(el.points || []), x, y] } : el
      )
    );
  };

  const handlePenMouseUp = () => {
    if (!drawMode || !isDrawing) return;
    setIsDrawing(false);
    setCurrentStrokeId(null);
  };

  const updateElement = (updated: CatalogElement) => {
    updatePageElements((prev) => prev.map((el) => (el.id === updated.id ? updated : el)));
  };

  const patchSelected = (patch: Partial<CatalogElement>) => {
    if (!selectedId) return;
    updatePageElements((prev) => prev.map((el) => (el.id === selectedId ? { ...el, ...patch } : el)));
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    updatePageElements((prev) => prev.filter((el) => el.id !== selectedId));
    setSelectedId(null);
  };

  const duplicateSelected = () => {
    if (!selectedId) return;
    const el = elements.find((e) => e.id === selectedId);
    if (!el) return;
    const id = `${el.type}-${Date.now()}`;
    const copy = { ...el, id, x: el.x + 20, y: el.y + 20 };
    updatePageElements((prev) => [...prev, copy]);
    setSelectedId(id);
  };

  const bringToFront = () => {
    if (!selectedId) return;
    updatePageElements((prev) => {
      const el = prev.find((e) => e.id === selectedId);
      if (!el) return prev;
      return [...prev.filter((e) => e.id !== selectedId), el];
    });
  };

  const sendToBack = () => {
    if (!selectedId) return;
    updatePageElements((prev) => {
      const el = prev.find((e) => e.id === selectedId);
      if (!el) return prev;
      return [el, ...prev.filter((e) => e.id !== selectedId)];
    });
  };

  const toggleLock = () => {
    if (!selectedId) return;
    patchSelected({ locked: !elements.find((e) => e.id === selectedId)?.locked });
  };

  const changeColor = (color: string) => patchSelected({ fill: color });
  const changeFontFamily = (fontFamily: string) => patchSelected({ fontFamily });
  const changeOpacity = (opacity: number) => patchSelected({ opacity });
  const changeCornerRadius = (cornerRadius: number) => patchSelected({ cornerRadius });
  const changeStrokeColor = (strokeColor: string) => patchSelected({ strokeColor });
  const changeStrokeWidth = (strokeWidth: number) => patchSelected({ strokeWidth });
  const changeShadowColor = (shadowColor: string) => patchSelected({ shadowColor });
  const changeShadowBlur = (shadowBlur: number) => patchSelected({ shadowBlur });

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

  const changeAlign = (align: string) => patchSelected({ align });

  const handleTextDblClick = (el: CatalogElement) => {
    if (el.locked) return;
    setEditingText({ id: el.id, value: el.text || '' });
  };

  const commitTextEdit = () => {
    if (!editingText) return;
    updatePageElements((prev) =>
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
  const saveCatalog = async () => {
    setSaving(true);
    try {
      await api.put(`/catalogs/${catalogId}`, {
        title,
        design: { pages },
      });
      flash('¡Guardado correctamente!');
    } catch (err) {
      console.error(err);
      flash('Error al guardar.');
    } finally {
      setSaving(false);
    }
  };
  const exportToPDF = async () => {
    if (!stageRef.current) return;
    setSaving(true);
    try {
      const originalPageIndex = currentPageIndex;
      const images: string[] = [];

      for (let i = 0; i < pages.length; i++) {
        setCurrentPageIndex(i);
        setSelectedId(null);
        await new Promise((resolve) => setTimeout(resolve, 150));
        const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
        images.push(dataUrl);
      }

      setCurrentPageIndex(originalPageIndex);

      const response = await api.post(
        '/catalogs/export-pdf',
        { title, images },
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title || 'catalogo'}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      flash('Error al exportar el PDF.');
    } finally {
      setSaving(false);
    }
  };
  const applyMyBrand = async () => {
    try {
      const res = await api.get('/brand-kit');
      const kit = res.data;
      const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace('/api', '');

      updatePageElements((prev) => {
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
            src: logoSrc, rotation: 0, opacity: 1, cornerRadius: 0,
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
    try {
      // Necesitamos el slug del catálogo actual; lo pedimos al backend por si no lo tenemos aún
      const res = await api.get(`/catalogs/${catalogId}`);
      const slug = res.data.slug;

      if (!slug) {
        flash('No se pudo generar el QR: falta el slug del catálogo.');
        return;
      }

      const publicUrl = `${window.location.origin}/c/${slug}`;
      const qrDataUrl = await QRCode.toDataURL(publicUrl, { width: 300, margin: 1 });

      const id = `qr-${Date.now()}`;
      updatePageElements((prev) => [...prev, {
        id,
        type: 'image' as ElementType,
        x: 650, y: 20, width: 100, height: 100,
        src: qrDataUrl, rotation: 0, opacity: 1, cornerRadius: 0,
      }]);
      setSelectedId(id);
      flash('¡Código QR insertado!');
    } catch (err) {
      console.error(err);
      flash('Error al generar el código QR. Asegúrate de haber guardado el catálogo primero.');
    }
  };


  const layerLabel = (el: CatalogElement) => {
    if (el.type === 'text') return (el.text || 'Texto').slice(0, 22);
    if (el.type === 'icon') return SHAPES.find((sh) => sh.id === el.shapeId)?.name || 'Forma';
    const names: Record<string, string> = {
      rect: 'Rectángulo', circle: 'Círculo', triangle: 'Triángulo', line: 'Línea',
      arrow: 'Flecha', star: 'Estrella', image: 'Imagen', pen: 'Trazo',
    };
    return names[el.type] || 'Elemento';
  };

  const toggleHiddenById = (id: string) => {
    updatePageElements((prev) => prev.map((el) => (el.id === id ? { ...el, hidden: !el.hidden } : el)));
    if (id === selectedId) setSelectedId(null);
  };

  const toggleLockById = (id: string) => {
    updatePageElements((prev) => prev.map((el) => (el.id === id ? { ...el, locked: !el.locked } : el)));
  };

  const deleteById = (id: string) => {
    updatePageElements((prev) => prev.filter((el) => el.id !== id));
    if (id === selectedId) setSelectedId(null);
  };

  // dir = 1 sube la capa (hacia el frente), dir = -1 la baja
  const moveLayer = (id: string, dir: 1 | -1) => {
    updatePageElements((prev) => {
      const i = prev.findIndex((el) => el.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const toggleFlipX = () => {
    const el = elements.find((x) => x.id === selectedId);
    if (el) patchSelected({ flipX: !el.flipX });
  };

  const toggleFlipY = () => {
    const el = elements.find((x) => x.id === selectedId);
    if (el) patchSelected({ flipY: !el.flipY });
  };

  const replaceImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      patchSelected({ src, originalSrc: src });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Ajusta la altura del marco a la proporción real de la foto
  const restoreAspect = () => {
    const el = elements.find((x) => x.id === selectedId);
    if (!el || el.type !== 'image' || !el.src) return;
    const im = new window.Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => patchSelected({ height: Math.round((el.width || 200) * im.height / im.width) });
    im.src = el.src;
  };

  const setAspect = (ratio: number) => {
    const el = elements.find((x) => x.id === selectedId);
    if (!el) return;
    patchSelected({ height: Math.round((el.width || 200) * ratio), fit: 'fill' });
  };

  const fillCanvas = () => patchSelected({ x: 0, y: 0, width: 800, height: 600, fit: 'fill', rotation: 0 });

  const resetImage = () =>
    patchSelected({
      filterType: 'none', brightness: 0, contrast: 0, saturation: 0, hue: 0, blur: 0, pixelate: 0,
      zoom: 1, offsetX: 0, offsetY: 0, flipX: false, flipY: false, rotation: 0,
      cornerRadius: 0, strokeWidth: 0, opacity: 1, fit: 'stretch',
    });

  const rotateBy = (deg: number) => {
    const el = elements.find((x) => x.id === selectedId);
    if (!el) return;
    let r = ((el.rotation || 0) + deg) % 360;
    if (r > 180) r -= 360;
    if (r < -180) r += 360;
    patchSelected({ rotation: r });
  };

  const chip = (active: boolean) =>
    `flex-1 h-8 border border-[#30364A] rounded-md text-xs transition ${active ? 'bg-[#7C3AED] text-white' : 'hover:bg-white/10'}`;

  const imgSlider = (label: string, value: number, min: number, max: number, step: number, onChange: (v: number) => void, unit = '') => (
    <div>
      <label className="text-xs text-[#A1A1B5] flex justify-between mb-1"><span>{label}</span><span>{Math.round(value * 100) / 100}{unit}</span></label>
      <input
        type="range" min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[#7C3AED]"
      />
    </div>
  );

  const railTabs: { id: string; label: string; icon: any }[] = [
    { id: 'elementos', label: 'Elementos', icon: Shapes },
    { id: 'texto', label: 'Texto', icon: Type },
    { id: 'imagenes', label: 'Imágenes', icon: ImagePlus },
    { id: 'dibujo', label: 'Dibujo', icon: Pencil },
    { id: 'capas', label: 'Capas', icon: Layers },
    { id: 'marca', label: 'Marca', icon: Palette },
  ];

  const panelBtn =
    'w-full text-left px-3 py-2.5 rounded-lg border border-[#30364A] text-sm font-medium text-[#F8FAFC] transition hover:border-[#7C3AED] hover:bg-white/5';
  const quickShape =
    'border border-[#30364A] hover:border-[#7C3AED] hover:bg-white/5 rounded-lg p-3 flex items-center justify-center transition';
  const sectionTitle = 'text-[11px] font-semibold uppercase tracking-wider text-[#A1A1B5] mb-2';
  const zoomIn = () => setZoom((z) => Math.min(2, Math.round((z + 0.1) * 10) / 10));
  const zoomOut = () => setZoom((z) => Math.max(0.3, Math.round((z - 0.1) * 10) / 10));

  return (
    <div className="flex flex-col h-screen text-[#F8FAFC]" style={{ backgroundColor: T.bg }}>
      {/* Barra superior */}
      <div className="h-14 shrink-0 flex items-center justify-between px-4 gap-4 border-b" style={{ backgroundColor: T.bgAlt, borderColor: T.border }}>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/catalogos"><div className="px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.92)' }}><Logo size="sm" /></div></Link>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del catálogo"
            className={`${ui.input} w-56`}
          />
        </div>
        <div className="flex items-center gap-2">
          {savedMessage && <span className="text-sm mr-2" style={{ color: T.ok }}>{savedMessage}</span>}
          <button onClick={saveCatalog} disabled={saving} className={`${ui.ghostBtn} flex items-center gap-2`}>
            <Save size={16} />
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            onClick={exportToPDF}
            disabled={saving}
            className={`${ui.primaryBtn} flex items-center gap-2`}
            style={{ background: `linear-gradient(135deg, ${T.violet}, ${T.violetBright})` }}
          >
            <FileDown size={16} />
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Barra de categorías */}
        <div className="w-[76px] shrink-0 flex flex-col items-center py-3 gap-1 border-r" style={{ backgroundColor: T.bgAlt, borderColor: T.border }}>
          {railTabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className="w-16 py-2.5 rounded-xl flex flex-col items-center gap-1 text-[11px] font-medium transition"
                style={{
                  backgroundColor: active ? 'rgba(124,58,237,0.2)' : 'transparent',
                  color: active ? '#FFFFFF' : T.textMuted,
                  boxShadow: active ? `inset 0 0 0 1px ${T.violet}` : 'none',
                }}
              >
                <Icon size={20} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Panel secundario */}
        <div className="w-72 shrink-0 overflow-y-auto p-4 space-y-4 border-r" style={{ backgroundColor: T.panel, borderColor: T.border }}>
          {activeTab === 'elementos' && (
            <div>
              <div className="relative mb-3">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1B5]" />
                <input
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Buscar formas"
                  className={`${ui.input} w-full pl-9`}
                />
              </div>
              <h3 className={sectionTitle}>Básicos</h3>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={addRect} title="Rectángulo" className={quickShape}>
                  <div className="w-7 h-5 bg-[#C4B5FD] rounded-sm" />
                </button>
                <button onClick={addCircle} title="Círculo" className={quickShape}>
                  <div className="w-6 h-6 bg-[#C4B5FD] rounded-full" />
                </button>
                <button onClick={addTriangle} title="Triángulo" className={quickShape}>
                  <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[16px] border-b-[#C4B5FD]" />
                </button>
                <button onClick={addLine} title="Línea" className={quickShape}>
                  <div className="w-7 h-0.5 bg-[#C4B5FD]" />
                </button>
                <button onClick={addArrow} title="Flecha" className={quickShape}>
                  <span className="text-[#C4B5FD] text-lg">→</span>
                </button>
                <button onClick={addStar} title="Estrella" className={quickShape}>
                  <span className="text-[#C4B5FD] text-lg">★</span>
                </button>
              </div>

              <div className="flex gap-1.5 flex-wrap mt-4 mb-3">
                {SHAPE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setShapeCategory(cat); setSearchQ(''); }}
                    className="px-2.5 py-1 rounded-full text-xs font-medium transition"
                    style={{
                      backgroundColor: shapeCategory === cat && !searchQ ? T.violet : 'rgba(255,255,255,0.06)',
                      color: shapeCategory === cat && !searchQ ? '#fff' : T.textMuted,
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {SHAPES.filter((sh) => (searchQ.trim() ? sh.name.toLowerCase().includes(searchQ.trim().toLowerCase()) : sh.category === shapeCategory)).map((sh) => (
                  <button key={sh.id} onClick={() => addShapeIcon(sh.id)} title={sh.name} className={`${quickShape} aspect-square !p-2`}>
                    <ShapeThumbnail def={sh} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'texto' && (
            <div>
              <h3 className={sectionTitle}>Texto</h3>
              <div className="space-y-2">
                <button onClick={() => addText('titulo')} className={panelBtn}>
                  <span className="text-lg font-bold block">Añadir título</span>
                </button>
                <button onClick={() => addText('subtitulo')} className={panelBtn}>
                  <span className="text-base font-semibold block">Añadir subtítulo</span>
                </button>
                <button onClick={() => addText('normal')} className={panelBtn}>
                  <span className="text-sm block">Añadir texto</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'imagenes' && (
            <div className="space-y-2">
              <h3 className={sectionTitle}>Imágenes</h3>
              <button onClick={() => fileInputRef.current?.click()} className={`${panelBtn} flex items-center gap-2`}>
                <Upload size={16} /> Subir imagen
              </button>
            </div>
          )}

          {activeTab === 'dibujo' && (
            <div className="space-y-4">
              <h3 className={sectionTitle}>Pluma</h3>
              <button
                onClick={() => { setDrawMode((v) => !v); setSelectedId(null); }}
                className="w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition"
                style={{
                  backgroundColor: drawMode ? T.violet : 'transparent',
                  color: '#fff',
                  border: `1px solid ${drawMode ? T.violet : T.border}`,
                }}
              >
                {drawMode ? '✏️ Pluma activa' : '✏️ Activar pluma'}
              </button>

              {drawMode && (
                <>
                  <div>
                    <label className="text-xs text-[#A1A1B5] block mb-1.5">Estilo</label>
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
                          className="px-2 py-1.5 rounded-md text-xs border transition"
                          style={{
                            backgroundColor: brushStyle === b.id && !isErasing ? T.violet : 'transparent',
                            borderColor: brushStyle === b.id && !isErasing ? T.violet : T.border,
                            color: brushStyle === b.id && !isErasing ? '#fff' : T.textMuted,
                          }}
                        >
                          {b.label}
                        </button>
                      ))}
                      <button
                        onClick={() => setIsErasing((v) => !v)}
                        className="px-2 py-1.5 rounded-md text-xs border transition"
                        style={{
                          backgroundColor: isErasing ? '#DC2626' : 'transparent',
                          borderColor: isErasing ? '#DC2626' : T.border,
                          color: isErasing ? '#fff' : T.textMuted,
                        }}
                      >
                        🧹 Borrador
                      </button>
                    </div>
                  </div>

                  {!isErasing && (
                    <div>
                      <label className="text-xs text-[#A1A1B5] block mb-1.5">Color</label>
                      <input
                        type="color"
                        value={brushColor}
                        onChange={(e) => setBrushColor(e.target.value)}
                        className="w-full h-9 rounded-md cursor-pointer bg-transparent border border-[#30364A]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-[#A1A1B5] block mb-1.5">Grosor: {brushSize}px</label>
                    <input
                      type="range" min="2" max="40"
                      value={brushSize}
                      onChange={(e) => setBrushSize(parseFloat(e.target.value))}
                      className="w-full accent-[#7C3AED]"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'capas' && (
            <div>
              <h3 className={sectionTitle}>Capas ({elements.length})</h3>
              {elements.length === 0 && <p className="text-sm text-[#A1A1B5] text-center mt-4">Aún no hay elementos</p>}
              <div className="space-y-1.5">
                {[...elements].reverse().map((el, idx, arr) => {
                  const selected = el.id === selectedId;
                  return (
                    <div
                      key={el.id}
                      onClick={() => { if (!el.hidden) { setDrawMode(false); setSelectedId(el.id); } }}
                      className="flex items-center gap-1 rounded-lg px-2 py-1.5 cursor-pointer border transition"
                      style={{
                        borderColor: selected ? T.violet : T.border,
                        backgroundColor: selected ? 'rgba(124,58,237,0.15)' : 'transparent',
                        opacity: el.hidden ? 0.5 : 1,
                      }}
                    >
                      <span className="flex-1 text-xs truncate text-[#F8FAFC]">{layerLabel(el)}</span>
                      <button title="Subir" disabled={idx === 0} onClick={(e) => { e.stopPropagation(); moveLayer(el.id, 1); }} className={`${ui.iconBtn} !h-6 !w-6`}><ChevronUp size={14} /></button>
                      <button title="Bajar" disabled={idx === arr.length - 1} onClick={(e) => { e.stopPropagation(); moveLayer(el.id, -1); }} className={`${ui.iconBtn} !h-6 !w-6`}><ChevronDown size={14} /></button>
                      <button title={el.hidden ? 'Mostrar' : 'Ocultar'} onClick={(e) => { e.stopPropagation(); toggleHiddenById(el.id); }} className={`${ui.iconBtn} !h-6 !w-6`}>{el.hidden ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                      <button title={el.locked ? 'Desbloquear' : 'Bloquear'} onClick={(e) => { e.stopPropagation(); toggleLockById(el.id); }} className={`${ui.iconBtn} !h-6 !w-6`}>{el.locked ? <Lock size={14} /> : <Unlock size={14} />}</button>
                      <button title="Eliminar" onClick={(e) => { e.stopPropagation(); deleteById(el.id); }} className={`${ui.iconBtn} !h-6 !w-6 hover:!text-red-400`}><Trash2 size={14} /></button>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-[#A1A1B5] mt-3">La capa de arriba es la que queda al frente.</p>
            </div>
          )}

          {activeTab === 'marca' && (
            <div className="space-y-2">
              <h3 className={sectionTitle}>Marca</h3>
              <button onClick={applyMyBrand} className={`${panelBtn} flex items-center gap-2`}>
                <Palette size={16} /> Aplicar mi marca
              </button>
              <button onClick={() => { setSelectedId(null); setShowBgPanel(true); }} className={`${panelBtn} flex items-center gap-2`}>
                <PaintBucket size={16} /> Fondo de página
              </button>
              <button onClick={insertQRCode} className={`${panelBtn} flex items-center gap-2`}>
                <QrCode size={16} /> Insertar código QR
              </button>
            </div>
          )}

          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
        </div>

        {/* Canvas central */}
        <div
          className="flex-1 overflow-auto flex p-8"
          style={{
            backgroundColor: T.bg,
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        >
          <div className="m-auto" style={{ width: 800 * zoom, height: 600 * zoom }}>
            <div
              className="bg-white shadow-2xl"
              style={{ position: 'relative', width: 800, height: 600, transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            >
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
                <Rect x={0} y={0} width={800} height={600} {...getFillProps(canvasBg, 800, 600)} listening={false} />
                {elements.filter((el) => !el.hidden).map((el) => {
                  const commonShapeProps = {
                    opacity: el.opacity ?? 1,
                    stroke: el.strokeColor,
                    strokeWidth: el.strokeWidth || 0,
                    shadowColor: el.shadowColor,
                    shadowBlur: el.shadowBlur || 0,
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
                    return (
                      <Text
                        key={el.id}
                        ref={(node) => { shapeRefs.current[el.id] = node; }}
                        x={el.x}
                        y={el.y}
                        width={el.width || 200}
                        text={el.text}
                        fontSize={el.fontSize}
                        fontFamily={el.fontFamily || 'Poppins'}
                        fontStyle={el.fontStyle || 'normal'}
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
                }}
              />
            )}
            </div>
          </div>
        </div>

        {/* Panel derecho de propiedades */}
        <div className="w-72 shrink-0 overflow-y-auto p-4 border-l" style={{ backgroundColor: T.panel, borderColor: T.border }}>
          {!selectedElement && !showBgPanel && (
            <div className="mt-10 text-center px-4">
              <div className="mx-auto mb-3 w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(124,58,237,0.15)' }}>
                <Shapes size={22} color={T.violet} />
              </div>
              <p className="text-sm font-medium text-[#F8FAFC]">Propiedades</p>
              <p className="text-xs text-[#A1A1B5] mt-1">Selecciona un elemento del lienzo para editarlo</p>
            </div>
          )}
          {!selectedElement && showBgPanel && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#F8FAFC]">Fondo de página</h3>
                <button onClick={() => setShowBgPanel(false)} className="text-[#A1A1B5] hover:text-white">✕</button>
              </div>

              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => patchBg({ fillType: 'solid' })}
                  className={`flex-1 h-8 border border-[#30364A] rounded-md text-xs ${(!canvasBg.fillType || canvasBg.fillType === 'solid') ? 'bg-[#7C3AED] text-white' : 'hover:bg-white/10'}`}
                >
                  Sólido
                </button>
                <button
                  onClick={() => patchBg({ fillType: 'linear', gradientStart: canvasBg.gradientStart || canvasBg.fill || '#7C3AED', gradientEnd: canvasBg.gradientEnd || '#ffffff' })}
                  className={`flex-1 h-8 border border-[#30364A] rounded-md text-xs ${canvasBg.fillType === 'linear' ? 'bg-[#7C3AED] text-white' : 'hover:bg-white/10'}`}
                >
                  Lineal
                </button>
                <button
                  onClick={() => patchBg({ fillType: 'radial', gradientStart: canvasBg.gradientStart || canvasBg.fill || '#7C3AED', gradientEnd: canvasBg.gradientEnd || '#ffffff' })}
                  className={`flex-1 h-8 border border-[#30364A] rounded-md text-xs ${canvasBg.fillType === 'radial' ? 'bg-[#7C3AED] text-white' : 'hover:bg-white/10'}`}
                >
                  Radial
                </button>
              </div>

              {(!canvasBg.fillType || canvasBg.fillType === 'solid') && (
                <input
                  type="color"
                  value={canvasBg.fill || '#ffffff'}
                  onChange={(e) => patchBg({ fill: e.target.value })}
                  className="w-full h-9 border border-[#30364A] rounded-md cursor-pointer"
                />
              )}

              {(canvasBg.fillType === 'linear' || canvasBg.fillType === 'radial') && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={canvasBg.gradientStart || '#7C3AED'}
                      onChange={(e) => patchBg({ gradientStart: e.target.value })}
                      className="flex-1 h-9 border border-[#30364A] rounded-md cursor-pointer"
                    />
                    <input
                      type="color"
                      value={canvasBg.gradientEnd || '#ffffff'}
                      onChange={(e) => patchBg({ gradientEnd: e.target.value })}
                      className="flex-1 h-9 border border-[#30364A] rounded-md cursor-pointer"
                    />
                  </div>
                  {canvasBg.fillType === 'linear' && (
                    <div>
                      <label className="text-xs text-[#A1A1B5] block mb-1">Ángulo: {canvasBg.gradientAngle ?? 0}°</label>
                      <input
                        type="range" min="0" max="360"
                        value={canvasBg.gradientAngle ?? 0}
                        onChange={(e) => patchBg({ gradientAngle: parseFloat(e.target.value) })}
                        className="w-full accent-[#7C3AED]"
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
                <h3 className="font-semibold text-[#F8FAFC]">
                  {selectedElement.type === 'text' ? 'Texto' : selectedElement.type === 'image' ? 'Imagen' : 'Forma'}
                </h3>
                <button onClick={() => setSelectedId(null)} className="text-[#A1A1B5] hover:text-white">✕</button>
              </div>

              {selectedElement.type === 'text' && (
                <>
                  <div>
                    <label className="text-xs text-[#A1A1B5] block mb-1">Fuente</label>
                    <select
                      value={selectedElement.fontFamily || 'Poppins'}
                      onChange={(e) => changeFontFamily(e.target.value)}
                      className="w-full border border-[#30364A] bg-[#11131D] text-[#F8FAFC] rounded-md px-2 py-2 text-sm"
                      style={{ fontFamily: selectedElement.fontFamily || 'Poppins' }}
                    >
                      {AVAILABLE_FONTS.map((font) => (
                        <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-[#A1A1B5] block mb-1">Tamaño</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => changeFontSize(-2)} className="w-8 h-8 border border-[#30364A] rounded-md text-[#A1A1B5] hover:bg-white/10">−</button>
                      <span className="text-sm w-8 text-center">{selectedElement.fontSize}</span>
                      <button onClick={() => changeFontSize(2)} className="w-8 h-8 border border-[#30364A] rounded-md text-[#A1A1B5] hover:bg-white/10">+</button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-[#A1A1B5] block mb-1">Color de texto</label>
                    <input
                      type="color"
                      value={selectedElement.fill || '#111827'}
                      onChange={(e) => changeColor(e.target.value)}
                      className="w-full h-9 border border-[#30364A] rounded-md cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#A1A1B5] block mb-1">Alineación</label>
                    <div className="flex gap-2">
                      <button onClick={() => changeAlign('left')} className={`flex-1 h-9 border border-[#30364A] rounded-md ${selectedElement.align === 'left' ? 'bg-[#7C3AED] text-white' : 'hover:bg-white/10'}`}>⯇</button>
                      <button onClick={() => changeAlign('center')} className={`flex-1 h-9 border border-[#30364A] rounded-md ${selectedElement.align === 'center' ? 'bg-[#7C3AED] text-white' : 'hover:bg-white/10'}`}>☰</button>
                      <button onClick={() => changeAlign('right')} className={`flex-1 h-9 border border-[#30364A] rounded-md ${selectedElement.align === 'right' ? 'bg-[#7C3AED] text-white' : 'hover:bg-white/10'}`}>⯈</button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-[#A1A1B5] block mb-1">Negrita</label>
                    <button
                      onClick={toggleBold}
                      className={`w-full h-9 border border-[#30364A] rounded-md font-bold ${selectedElement.fontStyle === 'bold' ? 'bg-[#7C3AED] text-white' : 'hover:bg-white/10'}`}
                    >
                      B
                    </button>
                  </div>
                </>
              )}

                            {(selectedElement.type === 'rect' || selectedElement.type === 'circle' || selectedElement.type === 'triangle' || selectedElement.type === 'star' || selectedElement.type === 'line' || selectedElement.type === 'arrow' || selectedElement.type === 'icon' || selectedElement.type === 'text') && (
                <div>
                  <label className="text-xs text-[#A1A1B5] block mb-1">Relleno</label>
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => patchSelected({ fillType: 'solid' })}
                      className={`flex-1 h-8 border border-[#30364A] rounded-md text-xs ${(!selectedElement.fillType || selectedElement.fillType === 'solid') ? 'bg-[#7C3AED] text-white' : 'hover:bg-white/10'}`}
                    >
                      Sólido
                    </button>
                    <button
                      onClick={() => patchSelected({ fillType: 'linear', gradientStart: selectedElement.gradientStart || selectedElement.fill || '#7C3AED', gradientEnd: selectedElement.gradientEnd || '#EC4899' })}
                      className={`flex-1 h-8 border border-[#30364A] rounded-md text-xs ${selectedElement.fillType === 'linear' ? 'bg-[#7C3AED] text-white' : 'hover:bg-white/10'}`}
                    >
                      Lineal
                    </button>
                    <button
                      onClick={() => patchSelected({ fillType: 'radial', gradientStart: selectedElement.gradientStart || selectedElement.fill || '#7C3AED', gradientEnd: selectedElement.gradientEnd || '#EC4899' })}
                      className={`flex-1 h-8 border border-[#30364A] rounded-md text-xs ${selectedElement.fillType === 'radial' ? 'bg-[#7C3AED] text-white' : 'hover:bg-white/10'}`}
                    >
                      Radial
                    </button>
                  </div>

                  {(!selectedElement.fillType || selectedElement.fillType === 'solid') && (
                    <input
                      type="color"
                      value={selectedElement.fill || '#7C3AED'}
                      onChange={(e) => changeColor(e.target.value)}
                      className="w-full h-9 border border-[#30364A] rounded-md cursor-pointer"
                    />
                  )}

                  {(selectedElement.fillType === 'linear' || selectedElement.fillType === 'radial') && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={selectedElement.gradientStart || '#7C3AED'}
                          onChange={(e) => patchSelected({ gradientStart: e.target.value })}
                          className="flex-1 h-9 border border-[#30364A] rounded-md cursor-pointer"
                        />
                        <input
                          type="color"
                          value={selectedElement.gradientEnd || '#EC4899'}
                          onChange={(e) => patchSelected({ gradientEnd: e.target.value })}
                          className="flex-1 h-9 border border-[#30364A] rounded-md cursor-pointer"
                        />
                      </div>
                      {selectedElement.fillType === 'linear' && (
                        <div>
                          <label className="text-xs text-[#A1A1B5] block mb-1">Ángulo: {selectedElement.gradientAngle ?? 0}°</label>
                          <input
                            type="range" min="0" max="360"
                            value={selectedElement.gradientAngle ?? 0}
                            onChange={(e) => patchSelected({ gradientAngle: parseFloat(e.target.value) })}
                            className="w-full accent-[#7C3AED]"
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
                    <label className="text-xs text-[#A1A1B5] block mb-1">Ajuste en el marco</label>
                    <div className="flex gap-2 mb-2">
                      <button onClick={() => patchSelected({ fit: 'stretch' })} className={chip(selectedElement.fit !== 'fill')}>Estirar</button>
                      <button onClick={() => patchSelected({ fit: 'fill' })} className={chip(selectedElement.fit === 'fill')}>Llenar y recortar</button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={restoreAspect} className="h-8 border border-[#30364A] rounded-md text-xs hover:bg-white/10">Proporción original</button>
                      <button onClick={() => patchSelected({ height: selectedElement.width || 200 })} className="h-8 border border-[#30364A] rounded-md text-xs hover:bg-white/10">Cuadrado</button>
                      <button onClick={fillCanvas} className="h-8 border border-[#30364A] rounded-md text-xs hover:bg-white/10 flex items-center justify-center gap-1"><Maximize2 size={12} /> Lienzo</button>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      <button onClick={() => setAspect(1)} className="h-8 border border-[#30364A] rounded-md text-xs hover:bg-white/10">1:1</button>
                      <button onClick={() => setAspect(3 / 4)} className="h-8 border border-[#30364A] rounded-md text-xs hover:bg-white/10">4:3</button>
                      <button onClick={() => setAspect(9 / 16)} className="h-8 border border-[#30364A] rounded-md text-xs hover:bg-white/10">16:9</button>
                      <button onClick={() => setAspect(16 / 9)} className="h-8 border border-[#30364A] rounded-md text-xs hover:bg-white/10">9:16</button>
                    </div>
                  </div>

                  {selectedElement.fit === 'fill' && (
                    <div className="space-y-3">
                      {imgSlider('Zoom', selectedElement.zoom ?? 1, 1, 4, 0.05, (v) => patchSelected({ zoom: v }), 'x')}
                      {imgSlider('Mover horizontal', selectedElement.offsetX ?? 0, -100, 100, 1, (v) => patchSelected({ offsetX: v }))}
                      {imgSlider('Mover vertical', selectedElement.offsetY ?? 0, -100, 100, 1, (v) => patchSelected({ offsetY: v }))}
                      <p className="text-[11px] text-[#A1A1B5]">Tip: en este modo, al arrastrar las esquinas del marco también recortas la foto.</p>
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-[#A1A1B5] block mb-1">Forma del marco</label>
                    <div className="grid grid-cols-4 gap-2">
                      <button onClick={() => patchSelected({ cornerRadius: 0 })} className="h-8 border border-[#30364A] rounded-md text-xs hover:bg-white/10">Recto</button>
                      <button onClick={() => patchSelected({ cornerRadius: 24 })} className="h-8 border border-[#30364A] rounded-md text-xs hover:bg-white/10">Suave</button>
                      <button onClick={() => patchSelected({ cornerRadius: Math.round(Math.min(selectedElement.width || 200, selectedElement.height || 200) / 2) })} className="h-8 border border-[#30364A] rounded-md text-xs hover:bg-white/10">Círculo</button>
                      <button onClick={() => patchSelected({ cornerRadius: Math.round(Math.min(selectedElement.width || 200, selectedElement.height || 200) / 3) })} className="h-8 border border-[#30364A] rounded-md text-xs hover:bg-white/10">Píldora</button>
                    </div>
                    <p className="text-[11px] text-[#A1A1B5] mt-1">Para un círculo perfecto usa "Cuadrado" y luego "Círculo".</p>
                  </div>

                  <div>
                    <label className="text-xs text-[#A1A1B5] block mb-1">Girar y voltear</label>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      <button onClick={() => rotateBy(-90)} title="Girar 90° a la izquierda" className="h-9 border border-[#30364A] rounded-md hover:bg-white/10 flex items-center justify-center"><RotateCcw size={16} /></button>
                      <button onClick={() => rotateBy(90)} title="Girar 90° a la derecha" className="h-9 border border-[#30364A] rounded-md hover:bg-white/10 flex items-center justify-center"><RotateCw size={16} /></button>
                      <button onClick={toggleFlipX} title="Voltear horizontal" className={`h-9 border border-[#30364A] rounded-md flex items-center justify-center ${selectedElement.flipX ? 'bg-[#7C3AED] text-white' : 'hover:bg-white/10'}`}><FlipHorizontal2 size={16} /></button>
                      <button onClick={toggleFlipY} title="Voltear vertical" className={`h-9 border border-[#30364A] rounded-md flex items-center justify-center ${selectedElement.flipY ? 'bg-[#7C3AED] text-white' : 'hover:bg-white/10'}`}><FlipVertical2 size={16} /></button>
                    </div>
                    {imgSlider('Ángulo', Math.round(selectedElement.rotation || 0), -180, 180, 1, (v) => patchSelected({ rotation: v }), '°')}
                  </div>

                  <div>
                    <label className="text-xs text-[#A1A1B5] block mb-1">Ajustes rápidos</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => patchSelected({ filterType: 'none', saturation: 40, contrast: 15, brightness: 0, hue: 0 })} className="h-8 border border-[#30364A] rounded-md text-xs hover:bg-white/10">Vívido</button>
                      <button onClick={() => patchSelected({ filterType: 'none', contrast: 40, brightness: -10, saturation: -20, hue: 0 })} className="h-8 border border-[#30364A] rounded-md text-xs hover:bg-white/10">Dramático</button>
                      <button onClick={() => patchSelected({ filterType: 'none', brightness: 10, contrast: -10, saturation: 10, hue: 0 })} className="h-8 border border-[#30364A] rounded-md text-xs hover:bg-white/10">Suave</button>
                      <button onClick={() => patchSelected({ filterType: 'sepia', contrast: 10, brightness: 0, saturation: 0, hue: 0 })} className="h-8 border border-[#30364A] rounded-md text-xs hover:bg-white/10">Vintage</button>
                      <button onClick={() => patchSelected({ filterType: 'grayscale', contrast: 30, brightness: 0, saturation: 0, hue: 0 })} className="h-8 border border-[#30364A] rounded-md text-xs hover:bg-white/10">Noir</button>
                      <button onClick={() => patchSelected({ filterType: 'none', brightness: 0, contrast: 0, saturation: 0, hue: 0, blur: 0, pixelate: 0 })} className="h-8 border border-[#30364A] rounded-md text-xs hover:bg-white/10">Ninguno</button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-[#A1A1B5] block mb-1">Filtro</label>
                    <div className="grid grid-cols-4 gap-2">
                      <button onClick={() => patchSelected({ filterType: 'none' })} className={chip(!selectedElement.filterType || selectedElement.filterType === 'none')}>Normal</button>
                      <button onClick={() => patchSelected({ filterType: 'grayscale' })} className={chip(selectedElement.filterType === 'grayscale')}>B/N</button>
                      <button onClick={() => patchSelected({ filterType: 'sepia' })} className={chip(selectedElement.filterType === 'sepia')}>Sepia</button>
                      <button onClick={() => patchSelected({ filterType: 'invert' })} className={chip(selectedElement.filterType === 'invert')}>Invertir</button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {imgSlider('Brillo', selectedElement.brightness || 0, -100, 100, 1, (v) => patchSelected({ brightness: v }))}
                    {imgSlider('Contraste', selectedElement.contrast || 0, -100, 100, 1, (v) => patchSelected({ contrast: v }))}
                    {imgSlider('Saturación', selectedElement.saturation || 0, -100, 100, 1, (v) => patchSelected({ saturation: v }))}
                    {imgSlider('Tono', selectedElement.hue || 0, 0, 359, 1, (v) => patchSelected({ hue: v }), '°')}
                    {imgSlider('Desenfoque', selectedElement.blur || 0, 0, 40, 1, (v) => patchSelected({ blur: v }))}
                    {imgSlider('Pixelado', selectedElement.pixelate || 0, 0, 30, 1, (v) => patchSelected({ pixelate: v }))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => replaceInputRef.current?.click()} className="h-9 border border-[#30364A] rounded-md text-xs hover:bg-white/10 flex items-center justify-center gap-1.5"><ImageUp size={14} /> Reemplazar</button>
                    <button onClick={resetImage} className="h-9 border border-[#30364A] rounded-md text-xs hover:bg-white/10">Restablecer</button>
                  </div>
                  <input type="file" accept="image/*" ref={replaceInputRef} onChange={replaceImage} className="hidden" />
                </>
              )}

              {selectedElement.type !== 'line' && selectedElement.type !== 'arrow' && (
                <div>
                  <label className="text-xs text-[#A1A1B5] block mb-1">Bordes redondeados</label>
                  <input
                    type="range" min="0" max={Math.max(50, Math.round(Math.min(selectedElement.width || 100, selectedElement.height || 100) / 2))}
                    value={selectedElement.cornerRadius || 0}
                    onChange={(e) => changeCornerRadius(parseFloat(e.target.value))}
                    className="w-full accent-[#7C3AED]"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-[#A1A1B5] block mb-1">Opacidad</label>
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={selectedElement.opacity ?? 1}
                  onChange={(e) => changeOpacity(parseFloat(e.target.value))}
                  className="w-full accent-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-xs text-[#A1A1B5] block mb-1">Borde / Trazo</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={selectedElement.strokeColor || '#000000'}
                    onChange={(e) => changeStrokeColor(e.target.value)}
                    className="w-10 h-9 border border-[#30364A] rounded-md cursor-pointer"
                  />
                  <input
                    type="range" min="0" max="20"
                    value={selectedElement.strokeWidth || 0}
                    onChange={(e) => changeStrokeWidth(parseFloat(e.target.value))}
                    className="flex-1 accent-[#7C3AED]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#A1A1B5] block mb-1">Sombra</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="color"
                    value={selectedElement.shadowColor || '#000000'}
                    onChange={(e) => changeShadowColor(e.target.value)}
                    className="w-full h-9 border border-[#30364A] rounded-md cursor-pointer"
                  />
                  <div className="flex items-center text-xs text-[#A1A1B5]">Blur: {selectedElement.shadowBlur || 0}</div>
                </div>
                <input
                  type="range" min="0" max="30"
                  value={selectedElement.shadowBlur || 0}
                  onChange={(e) => changeShadowBlur(parseFloat(e.target.value))}
                  className="w-full accent-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-xs text-[#A1A1B5] block mb-1">Orden</label>
                <div className="flex gap-2">
                  <button onClick={bringToFront} className="flex-1 border border-[#30364A] rounded-md py-2 text-xs hover:bg-white/10">Traer al frente</button>
                  <button onClick={sendToBack} className="flex-1 border border-[#30364A] rounded-md py-2 text-xs hover:bg-white/10">Enviar al fondo</button>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#30364A]">
                <button onClick={toggleLock} className={`flex-1 border border-[#30364A] rounded-md py-2 text-sm ${selectedElement.locked ? 'bg-[#7C3AED] text-white' : 'hover:bg-white/10'}`}>
                  {selectedElement.locked ? '🔒' : '🔓'}
                </button>
                <button onClick={duplicateSelected} className="flex-1 border border-[#30364A] rounded-md py-2 text-sm hover:bg-white/10">Duplicar</button>
                <button onClick={deleteSelected} className="flex-1 bg-red-600 text-white rounded-md py-2 text-sm hover:bg-red-700">Eliminar</button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Barra inferior: páginas + zoom */}
      <div className="h-24 shrink-0 flex items-center justify-between px-4 gap-4 border-t" style={{ backgroundColor: T.bgAlt, borderColor: T.border }}>
        <div className="flex gap-3 items-center overflow-x-auto py-2 pr-2">
          {pages.map((page, index) => (
            <div key={page.id} className="relative group shrink-0">
              <button
                onClick={() => { setCurrentPageIndex(index); setSelectedId(null); }}
                className="w-20 h-14 rounded-md bg-white flex items-center justify-center text-xs font-medium transition"
                style={{
                  border: `2px solid ${index === currentPageIndex ? T.violet : T.border}`,
                  color: index === currentPageIndex ? T.violet : '#6B7280',
                }}
              >
                Página {index + 1}
              </button>
              {pages.length > 1 && (
                <button
                  onClick={() => deletePage(index)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addPage}
            title="Agregar página"
            className="w-20 h-14 shrink-0 rounded-md text-[#A1A1B5] hover:text-white hover:border-[#7C3AED] transition flex items-center justify-center text-xl"
            style={{ border: `2px dashed ${T.border}` }}
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs mr-3" style={{ color: T.textMuted }}>Página {currentPageIndex + 1} de {pages.length}</span>
          <button onClick={zoomOut} className={`${ui.iconBtn} !h-7 !w-7`} title="Alejar"><Minus size={14} /></button>
          <button onClick={() => setZoom(1)} className="px-2 h-7 rounded-md hover:bg-white/10 text-xs text-[#F8FAFC] min-w-[52px]" title="Restablecer zoom">{Math.round(zoom * 100)}%</button>
          <button onClick={zoomIn} className={`${ui.iconBtn} !h-7 !w-7`} title="Acercar"><Plus size={14} /></button>
        </div>
      </div>
    </div>
  );
}