export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Crea catálogos y posters para tu negocio
      </h1>
      <p className="text-lg text-gray-600 max-w-xl mb-8">
        Carnes, ropa, zapatos o lo que vendas — arma tu catálogo, personalízalo
        y compártelo con un link o expórtalo en PDF.
      </p>
      <a
        href="/login"
        className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition"
      >
        Empezar gratis
      </a>
    </main>
  );
}
