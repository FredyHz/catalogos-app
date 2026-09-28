'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import Logo from '@/components/Logo';
import SpaceBackground from '@/components/SpaceBackground';

interface Poster {
  id: string;
  title: string;
  updatedAt: string;
  type: string;
}

export default function PublicacionesListPage() {
  const [items, setItems] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/posters?published=true')
      .then((res) => setItems(res.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SpaceBackground className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6">
          <Link href="/dashboard"><Logo size="sm" /></Link>
        </div>

        <h1 className="text-2xl font-bold text-white mb-8">Publicaciones</h1>

        {loading && <p className="text-gray-400">Cargando...</p>}

        {!loading && items.length === 0 && (
          <p className="text-gray-400">Todavía no has publicado ningún diseño.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/editor?id=${p.id}`}
              className="rounded-xl p-4 border transition hover:-translate-y-0.5"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(232,201,122,0.18)' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(232,201,122,0.55)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(232,201,122,0.18)')}
            >
              <h2 className="font-semibold text-white">{p.title}</h2>
              <p className="text-xs font-medium uppercase mt-1" style={{ color: '#E8C97A' }}>{p.type}</p>
              <p className="text-sm text-gray-400">
                Editado: {new Date(p.updatedAt).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </SpaceBackground>
  );
}