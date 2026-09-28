'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import Logo from '@/components/Logo';
import SpaceBackground from '@/components/SpaceBackground';

interface Catalog {
  id: string;
  title: string;
  category: string;
  slug: string;
  updatedAt: string;
  _count?: { products: number };
}

const inputStyle = {
  backgroundColor: 'rgba(255,255,255,0.06)',
  borderColor: 'rgba(232,201,122,0.25)',
};

export default function CatalogosListPage() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [creating, setCreating] = useState(false);

  const loadCatalogs = () => {
    setLoading(true);
    api
      .get('/catalogs')
      .then((res) => setCatalogs(res.data))
      .catch(() => setCatalogs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCatalogs();
  }, []);

  const createCatalog = async () => {
    if (!title.trim()) return;
    setCreating(true);
    try {
      await api.post('/catalogs', { title, category });
      setTitle('');
      setCategory('general');
      setShowForm(false);
      loadCatalogs();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <SpaceBackground className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6">
          <Link href="/dashboard"><Logo size="sm" /></Link>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Mis Catálogos</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-md font-medium transition"
            style={{ backgroundColor: '#E8C97A', color: '#0B0E1A' }}
          >
            + Nuevo catálogo
          </button>
        </div>

        {showForm && (
          <div
            className="rounded-xl p-4 mb-6 border"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(232,201,122,0.18)' }}
          >
            <div className="flex gap-3 flex-wrap items-center">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nombre del catálogo"
                className="border rounded-md px-3 py-2 flex-1 min-w-[200px] text-white placeholder-gray-500"
                style={inputStyle}
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border rounded-md px-3 py-2 text-white"
                style={inputStyle}
              >
                <option value="general" className="text-black">General</option>
                <option value="carnes" className="text-black">Carnes</option>
                <option value="ropa" className="text-black">Ropa</option>
                <option value="zapatos" className="text-black">Zapatos</option>
              </select>
              <button
                onClick={createCatalog}
                disabled={creating}
                className="px-4 py-2 rounded-md disabled:opacity-50 font-medium"
                style={{ backgroundColor: '#E8C97A', color: '#0B0E1A' }}
              >
                {creating ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </div>
        )}

        {loading && <p className="text-gray-400">Cargando...</p>}

        {!loading && catalogs.length === 0 && (
          <p className="text-gray-400">Todavía no tienes catálogos. ¡Crea el primero!</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {catalogs.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/catalogos/editor?id=${c.id}`}
              className="rounded-xl p-4 border transition hover:-translate-y-0.5 block"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(232,201,122,0.18)' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(232,201,122,0.55)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(232,201,122,0.18)')}
            >
              <h2 className="font-semibold text-white">{c.title}</h2>
              <p className="text-xs font-medium uppercase mt-1" style={{ color: '#E8C97A' }}>{c.category}</p>
              <p className="text-sm text-gray-400">
                {c._count?.products ?? 0} productos
              </p>
            </Link>
          ))}
        </div>
      </div>
    </SpaceBackground>
  );
}