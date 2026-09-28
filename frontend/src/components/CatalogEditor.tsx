'use client';

import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Ellipse, Text, Image as KonvaImage, Transformer, Line, Arrow, Star, Group } from 'react-konva';
import useImage from 'use-image';
import api from '@/lib/api';
import Logo from './Logo';
import Link from 'next/link';
import { AVAILABLE_FONTS } from './CanvasEditor';
import QRCode from 'qrcode';
import { notifyMascot } from '@/lib/mascotBus';

const TEXT_STYLES = {
  titulo: { fontSize: 48, fontFamily: 'Poppins', fontWeight: 'bold' as const },
  subtitulo: { fontSize: 28, fontFamily: 'Poppins', fontWeight: '600' as const },
  normal: { fontSize: 18, fontFamily: 'Poppins', fontWeight: 'normal' as const },
};

type ElementType = 'rect' | 'circle' | 'triangle' | 'line' | 'arrow' | 'star' | 'text' | 'image' | 'pen';
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
  points?: number[];
  brushStyle?: BrushStyle;
  isEraser?: boolean;
}

interface CatalogPage {
  id: string;
  elements: CatalogElement[];
}

function ImageNode({ el, shapeRef, onSelect, onChange }: any) {
  const [img] = useImage(el.src);
  return (
    <KonvaImage
      ref={shapeRef}
      image={img}
      x={el.x}
      y={el.y}
      width={el.width}
      height={el.height}
      rotation={el.rotation || 0}
      opacity={el.opacity ?? 1}
      cornerRadius={el.cornerRadius || 0}
      stroke={el.strokeColor}
      strokeWidth={el.strokeWidth || 0}
      shadowColor={el.shadowColor}
      shadowBlur={el.shadowBlur || 0}
      draggable={!el.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e: any) => onChange({ ...el, x: e.target.x(), y: e.target.y() })}
      onTransformEnd={(e: any) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        onChange({
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

export default function CatalogEditor({ catalogId }: { catalogId: string }) {
  const [title, setTitle] = useState('Mi catálogo');
  const [pages, setPages] = useState<CatalogPage[]>([{ id: `page-${Date.now()}`, elements: [] }]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<{ id: string; value: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const currentPage = pages[currentPageIndex];
  const elements = currentPage?.elements || [];

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

  const sidebarBtn = 'w-full text-left px-3 py-2.5 rounded-lg border border-gray-200 hover:border-brand-400 hover:bg-brand-50 transition text-sm font-medium text-gray-700';return (
   
   <div className="flex flex-col h-screen">
      {/* Barra superior */}
             <div className="h-16 shrink-0 border-b flex items-center justify-between px-6 gap-4" style={{ backgroundColor: '#0B0E1A', borderColor: 'rgba(232,201,122,0.15)' }}>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/catalogos"><Logo size="sm" /></Link>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
                        placeholder="Título del catálogo"
            className="border rounded-md px-3 py-1.5 text-sm w-56 text-white placeholder-gray-500"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(232,201,122,0.25)' }}
            
          />
        </div>
        <div className="flex items-center gap-2">
          {savedMessage && <span className="text-sm text-gray-500 mr-2">{savedMessage}</span>}
          <button
            onClick={saveCatalog}
            disabled={saving}
            className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50 hover:bg-gray-900 transition"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            onClick={exportToPDF}
            disabled={saving}
            className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50 hover:bg-orange-700 transition"
          >
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
       {/* Sidebar izquierdo */}
                     {/* Sidebar izquierdo */}
        <div className="w-60 shrink-0 border-r overflow-y-auto p-4 space-y-6" style={{ backgroundColor: '#0B0E1A', borderColor: 'rgba(232,201,122,0.15)' }}>
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
            <div className="grid grid-cols-3 gap-2">
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
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Imágenes</h3>
            <button onClick={() => fileInputRef.current?.click()} className={sidebarBtn}>
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
                <div className="flex-1 overflow-auto flex items-center justify-center p-8" style={{ backgroundColor: '#05060B' }}>
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
                {elements.map((el) => {
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
                        fill={el.fill}
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
                        fill={el.fill}
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
                        fill={el.fill}
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
                        fill={el.fill}
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
                        fill={el.fill}
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

          {/* Miniaturas de páginas */}
          <div className="flex gap-3 items-center flex-wrap">
            {pages.map((page, index) => (
              <div key={page.id} className="relative group">
                <button
                  onClick={() => { setCurrentPageIndex(index); setSelectedId(null); }}
                  className={`w-20 h-14 border-2 rounded-md bg-white flex items-center justify-center text-xs font-medium ${
                    index === currentPageIndex ? 'border-brand-600 text-brand-600' : 'border-gray-300 text-gray-500 hover:border-gray-400'
                  }`}
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
              className="w-20 h-14 border-2 border-dashed rounded-md text-gray-500 hover:text-[#E8C97A] transition flex items-center justify-center text-xl"
              style={{ borderColor: 'rgba(232,201,122,0.3)' }}
            >
              +
            </button>
          </div>
        </div>

        {/* Panel derecho de propiedades */}
               <div className="w-72 shrink-0 border-l overflow-y-auto p-4" style={{ backgroundColor: '#0B0E1A', borderColor: 'rgba(232,201,122,0.15)' }}>
          {!selectedElement && (
            <p className="text-sm text-gray-400 mt-4 text-center">
              Selecciona un elemento para editar sus propiedades
            </p>
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
                    <label className="text-xs text-gray-500 block mb-1">Negrita</label>
                    <button
                      onClick={toggleBold}
                      className={`w-full h-9 border rounded-md font-bold ${selectedElement.fontStyle === 'bold' ? 'bg-gray-800 text-white' : 'hover:bg-gray-50'}`}
                    >
                      B
                    </button>
                  </div>
                </>
              )}

              {(selectedElement.type === 'rect' || selectedElement.type === 'circle' || selectedElement.type === 'triangle' || selectedElement.type === 'star' || selectedElement.type === 'line' || selectedElement.type === 'arrow') && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Color</label>
                  <input
                    type="color"
                    value={selectedElement.fill || '#7C3AED'}
                    onChange={(e) => changeColor(e.target.value)}
                    className="w-full h-9 border rounded-md cursor-pointer"
                  />
                </div>
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
                  className="w-full"
                />
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
                  {selectedElement.locked ? '🔒' : '🔓'}
                </button>
                <button onClick={duplicateSelected} className="flex-1 border rounded-md py-2 text-sm hover:bg-gray-50">Duplicar</button>
                <button onClick={deleteSelected} className="flex-1 bg-red-600 text-white rounded-md py-2 text-sm hover:bg-red-700">Eliminar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}