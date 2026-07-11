import api from '@/lib/api';

interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
}

interface Catalog {
  id: string;
  title: string;
  category: string;
  products: Product[];
}

async function getCatalog(slug: string): Promise<Catalog | null> {
  try {
    const res = await api.get(`/catalogs/public/${slug}`);
    return res.data;
  } catch {
    return null;
  }
}

export default async function PublicCatalogPage({ params }: { params: { slug: string } }) {
  const catalog = await getCatalog(params.slug);

  if (!catalog) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Este catálogo no existe o ya no está disponible.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">{catalog.title}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {catalog.products.map((p) => (
            <div key={p.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-full h-48 object-cover" />}
              <div className="p-4">
                <h2 className="font-semibold">{p.name}</h2>
                {p.description && <p className="text-sm text-gray-500 mt-1">{p.description}</p>}
                {p.price && <p className="text-lg font-bold mt-2">${p.price}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
