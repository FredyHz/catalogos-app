'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Logo from '@/components/Logo';
import SpaceBackground from '@/components/SpaceBackground';

interface BrandKit {
  businessName: string | null;
  logoUrl: string | null;
  brandColor: string | null;
  brandSecondaryColor: string | null;
  brandAccentColor: string | null;
  brandFont: string | null;
  whatsappNumber: string | null;
}

const FONT_OPTIONS = [
  'Poppins',
  'Roboto',
  'Montserrat',
  'Lato',
  'Open Sans',
  'Playfair Display',
  'Nunito',
  'Raleway',
];

const DEFAULT_COLORS = {
  brandColor: '#7c3aed',
  brandSecondaryColor: '#4f46e5',
  brandAccentColor: '#f59e0b',
};

const GOLD = '#E8C97A';
const inputStyle = { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(232,201,122,0.25)' };

export default function MarcaPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [businessName, setBusinessName] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [brandColor, setBrandColor] = useState(DEFAULT_COLORS.brandColor);
  const [brandSecondaryColor, setBrandSecondaryColor] = useState(DEFAULT_COLORS.brandSecondaryColor);
  const [brandAccentColor, setBrandAccentColor] = useState(DEFAULT_COLORS.brandAccentColor);
  const [brandFont, setBrandFont] = useState('Poppins');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    const fetchBrandKit = async () => {
      try {
        const res = await api.get<BrandKit>('/brand-kit');
        const data = res.data;
        setBusinessName(data.businessName || '');
        setLogoUrl(data.logoUrl);
        setBrandColor(data.brandColor || DEFAULT_COLORS.brandColor);
        setBrandSecondaryColor(data.brandSecondaryColor || DEFAULT_COLORS.brandSecondaryColor);
        setBrandAccentColor(data.brandAccentColor || DEFAULT_COLORS.brandAccentColor);
        setBrandFont(data.brandFont || 'Poppins');
        setWhatsappNumber(data.whatsappNumber || '');
      } catch (err) {
        console.error('Error al cargar kit de marca:', err);
        setError('No se pudo cargar tu kit de marca.');
      } finally {
        setLoading(false);
      }
    };

    fetchBrandKit();
  }, []);

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const res = await api.post<{ logoUrl: string }>('/brand-kit/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setLogoUrl(res.data.logoUrl);
      setSuccess('Logo actualizado correctamente.');
    } catch (err) {
      console.error('Error al subir logo:', err);
      setError('No se pudo subir el logo. Intenta de nuevo.');
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/brand-kit', {
        businessName,
        brandColor,
        brandSecondaryColor,
        brandAccentColor,
        brandFont,
        whatsappNumber,
      });
      setSuccess('¡Tu marca se guardó correctamente!');
    } catch (err) {
      console.error('Error al guardar kit de marca:', err);
      setError('No se pudo guardar tu marca. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const logoSrc = logoUrl
    ? logoUrl.startsWith('http')
      ? logoUrl
      : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace('/api', '')}${logoUrl}`
    : null;

  if (loading) {
    return (
      <SpaceBackground className="min-h-screen flex items-center justify-center">
        <p className="font-medium" style={{ color: GOLD }}>Cargando tu kit de marca...</p>
      </SpaceBackground>
    );
  }

  return (
    <SpaceBackground className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-400 hover:text-[#E8C97A] mb-2 flex items-center gap-1 transition"
            >
              ← Volver al dashboard
            </button>
            <h1 className="text-3xl font-bold text-white">🎨 Mi Marca</h1>
            <p className="text-gray-400 mt-1">
              Configura tu logo y colores una sola vez. Los aplicaremos en tus plantillas y diseños.
            </p>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda: formulario */}
          <div
            className="lg:col-span-2 rounded-2xl border p-6 space-y-6"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(232,201,122,0.18)' }}
          >
            {/* Logo */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Logo del negocio
              </label>
              <div className="flex items-center gap-4">
                <div
                  onClick={handleLogoClick}
                  className="w-24 h-24 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors overflow-hidden"
                  style={{ borderColor: 'rgba(232,201,122,0.4)', backgroundColor: 'rgba(255,255,255,0.03)' }}
                >
                  {uploadingLogo ? (
                    <span className="text-xs" style={{ color: GOLD }}>Subiendo...</span>
                  ) : logoSrc ? (
                    <img src={logoSrc} alt="Logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <span className="text-2xl" style={{ color: GOLD }}>+</span>
                  )}
                </div>
                <div>
                  <button
                    onClick={handleLogoClick}
                    disabled={uploadingLogo}
                    className="px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    style={{ backgroundColor: GOLD, color: '#0B0E1A' }}
                  >
                    {logoSrc ? 'Cambiar logo' : 'Subir logo'}
                  </button>
                  <p className="text-xs text-gray-500 mt-2">PNG o JPG, idealmente con fondo transparente.</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Nombre del negocio */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Nombre del negocio
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ej. Carnicería El Buen Corte"
                className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8C97A] text-white placeholder-gray-500"
                style={inputStyle}
              />
            </div>

            {/* WhatsApp del negocio */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Número de WhatsApp para pedidos
              </label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="Ej. 5219991234567 (con código de país, sin espacios ni signos)"
                className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8C97A] text-white placeholder-gray-500"
                style={inputStyle}
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Aquí llegarán los pedidos que hagan tus clientes desde tus catálogos publicados.
              </p>
            </div>

            {/* Colores */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Colores de marca
              </label>
              <div className="grid grid-cols-3 gap-4">
                <ColorField label="Principal" value={brandColor} onChange={setBrandColor} />
                <ColorField label="Secundario" value={brandSecondaryColor} onChange={setBrandSecondaryColor} />
                <ColorField label="Acento" value={brandAccentColor} onChange={setBrandAccentColor} />
              </div>
            </div>

            {/* Fuente */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Fuente principal
              </label>
              <select
                value={brandFont}
                onChange={(e) => setBrandFont(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8C97A] text-white"
                style={inputStyle}
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font} value={font} className="text-black">
                    {font}
                  </option>
                ))}
              </select>
            </div>

            {/* Guardar */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 font-semibold rounded-lg transition-colors disabled:opacity-50"
              style={{ backgroundColor: GOLD, color: '#0B0E1A' }}
            >
              {saving ? 'Guardando...' : 'Guardar mi marca'}
            </button>
          </div>

          {/* Columna derecha: preview en vivo — se mantiene claro/neutro a propósito */}
          <div
            className="rounded-2xl border p-4"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(232,201,122,0.18)' }}
          >
            <p className="text-sm font-semibold text-white mb-3 px-2">Vista previa</p>
            <div className="bg-white rounded-xl p-2 shadow-inner">
              <div
                className="rounded-lg overflow-hidden border border-gray-100"
                style={{ backgroundColor: brandColor }}
              >
                <div className="p-6 flex flex-col items-center text-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center overflow-hidden">
                    {logoSrc ? (
                      <img src={logoSrc} alt="Logo" className="w-full h-full object-contain p-1.5" />
                    ) : (
                      <span className="text-xl">🏪</span>
                    )}
                  </div>
                  <p className="text-white font-bold text-lg" style={{ fontFamily: brandFont }}>
                    {businessName || 'Nombre de tu negocio'}
                  </p>
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full text-white"
                    style={{ backgroundColor: brandSecondaryColor }}
                  >
                    Oferta especial
                  </span>
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ backgroundColor: brandAccentColor, color: '#1f2937' }}
                  >
                    20% de descuento
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4 px-2">
              Así se verán tus colores y logo aplicados en posters y catálogos.
            </p>
          </div>
        </div>
      </div>
    </SpaceBackground>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1.5">{label}</p>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded-lg border cursor-pointer p-0.5"
          style={{ borderColor: 'rgba(232,201,122,0.3)' }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8C97A] text-white"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(232,201,122,0.25)' }}
        />
      </div>
    </div>
  );
}