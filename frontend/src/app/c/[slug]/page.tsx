'use client';

import { useEffect, useState } from 'react';
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
  user?: {
    whatsappNumber: string | null;
    businessName: string | null;
  };
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function PublicCatalogPage({ params }: { params: { slug: string } }) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    api
      .get(`/catalogs/public/${params.slug}`)
      .then((res) => setCatalog(res.data))
      .catch(() => setCatalog(null))
      .finally(() => setLoading(false));
  }, [params.slug]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setShowCart(true);
  };

  const changeQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0);

  const sendOrderToWhatsApp = () => {
    if (!catalog?.user?.whatsappNumber || cart.length === 0) return;

    const lines = cart.map(
      (item) =>
        `• ${item.quantity}x ${item.product.name}${
          item.product.price ? ` - $${(item.product.price * item.quantity).toFixed(2)}` : ''
        }`
    );

    const businessLabel = catalog.user.businessName || catalog.title;
    const message = [
      `¡Hola! Quiero hacer un pedido de *${businessLabel}*:`,
      '',
      ...lines,
      '',
      `*Total: $${totalPrice.toFixed(2)}*`,
    ].join('\n');

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${catalog.user.whatsappNumber}?text=${encodedMessage}`, '_blank');
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Cargando catálogo...</p>
      </main>
    );
  }

  if (!catalog) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Este catálogo no existe o ya no está disponible.</p>
      </main>
    );
  }

  const canOrder = !!catalog.user?.whatsappNumber;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 pb-28">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">{catalog.title}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {catalog.products.map((p) => (
            <div key={p.id} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
              {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-full h-48 object-cover" />}
              <div className="p-4 flex flex-col flex-1">
                <h2 className="font-semibold">{p.name}</h2>
                {p.description && <p className="text-sm text-gray-500 mt-1">{p.description}</p>}
                {p.price !== undefined && p.price !== null && (
                  <p className="text-lg font-bold mt-2">${p.price}</p>
                )}
                {canOrder && (
                  <button
                    onClick={() => addToCart(p)}
                    className="mt-auto pt-3 w-full bg-brand-600 text-white text-sm font-medium py-2 rounded-md hover:bg-brand-700 transition"
                  >
                    Agregar al pedido
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botón flotante del carrito */}
      {canOrder && totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          {showCart && (
            <div className="bg-white border-t shadow-lg max-h-80 overflow-y-auto">
              <div className="max-w-lg mx-auto p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">Tu pedido</h3>
                  <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-600 text-sm">
                    Ocultar
                  </button>
                </div>
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{item.product.name}</p>
                      {item.product.price !== undefined && (
                        <p className="text-xs text-gray-400">
                          ${((item.product.price || 0) * item.quantity).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changeQuantity(item.product.id, -1)}
                        className="w-7 h-7 border rounded-md text-gray-600 hover:bg-gray-50"
                      >
                        −
                      </button>
                      <span className="text-sm w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => changeQuantity(item.product.id, 1)}
                        className="w-7 h-7 border rounded-md text-gray-600 hover:bg-gray-50"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-500 hover:text-red-600 text-xs ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-brand-600 px-4 py-3">
            <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
              <button
                onClick={() => setShowCart((v) => !v)}
                className="text-white text-sm font-medium flex items-center gap-2"
              >
                🛒 {totalItems} {totalItems === 1 ? 'producto' : 'productos'} · ${totalPrice.toFixed(2)}
              </button>
              <button
                onClick={sendOrderToWhatsApp}
                className="bg-white text-brand-700 text-sm font-semibold px-4 py-2 rounded-md hover:bg-gray-50 transition flex items-center gap-2"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M17.6 6.3A8.86 8.86 0 0 0 12.03 3.5 8.9 8.9 0 0 0 3.6 15.9L3 21l5.25-1.38a8.86 8.86 0 0 0 3.78.84h.01a8.9 8.9 0 0 0 8.86-8.88 8.83 8.83 0 0 0-3.3-6.28ZM12.04 19.1h-.01a7.4 7.4 0 0 1-3.77-1.03l-.27-.16-2.8.74.75-2.73-.18-.28a7.4 7.4 0 0 1 11.53-9.16 7.35 7.35 0 0 1 2.17 5.22 7.4 7.4 0 0 1-7.42 7.4Zm4.06-5.54c-.22-.11-1.3-.64-1.5-.72-.2-.07-.35-.11-.5.11-.14.22-.57.72-.7.87-.13.15-.26.16-.48.05a6.1 6.1 0 0 1-1.8-1.11 6.7 6.7 0 0 1-1.24-1.54c-.13-.22 0-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.07-.15.04-.28-.02-.4-.06-.11-.5-1.2-.68-1.65-.18-.43-.36-.37-.5-.38h-.43a.82.82 0 0 0-.6.28 2.5 2.5 0 0 0-.78 1.86c0 1.1.8 2.16.91 2.31.11.15 1.57 2.4 3.8 3.36.53.23.94.37 1.27.47.53.17 1.02.15 1.4.09.43-.06 1.3-.53 1.48-1.04.18-.51.18-.95.13-1.04-.05-.09-.2-.15-.42-.26Z" />
                </svg>
                Enviar pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}