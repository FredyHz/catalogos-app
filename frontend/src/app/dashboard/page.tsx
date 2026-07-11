'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Catalog {
  id: string;
  title: string;
  category: string;
  slug: string;
  isPublished: boolean;
}

export default function DashboardPage() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/catalogs')
      .then((res) => setCatalogs(res.data))
      .catch(() => setCatalogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Mis catálogos</h1>
          <button className="bg-black text-white px-4 py-2 rounded-md">+ Nuevo catálogo</button>
        </div>

        {loading && <p>Cargando...</p>}

        {!loading && catalogs.length === 0 && (
          <p className="text-gray-500">Todavía no tienes catálogos. ¡Crea el primero!</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {catalogs.map((c) => (
            <div key={c.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <h2 className="font-semibold">{c.title}</h2>
              <p className="text-sm text-gray-500">{c.category}</p>
              <span
                className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
                  c.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {c.isPublished ? 'Publicado' : 'Borrador'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
