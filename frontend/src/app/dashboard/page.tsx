'use client';

import Link from 'next/link';
import Logo from '@/components/Logo';
import SpaceBackground from '@/components/SpaceBackground';

const createSections = [
  { title: 'Posters', description: 'Crea posters llamativos para tu negocio', href: '/dashboard/posters', icon: '🖼️' },
  { title: 'Anuncios', description: 'Diseña anuncios para promocionar tus productos', href: '/dashboard/anuncios', icon: '📢' },
  { title: 'Catálogos', description: 'Organiza tus productos en catálogos', href: '/dashboard/catalogos', icon: '📚' },
  { title: 'Edición', description: 'Abre el editor visual en blanco', href: '/dashboard/editor', icon: '✏️' },
];

const manageSections = [
  { title: 'Publicaciones', description: 'Tus diseños ya compartidos públicamente', href: '/dashboard/publicaciones', icon: '🌐' },
  { title: 'Mi Marca', description: 'Configura tu logo y colores de marca', href: '/dashboard/marca', icon: '🎨' },
];

function ControlCard({ s }: { s: (typeof createSections)[number] }) {
  return (
    <Link
      href={s.href}
      className="group relative rounded-2xl p-6 border transition-all duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C97A]"
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderColor: 'rgba(232,201,122,0.18)',
        backdropFilter: 'blur(6px)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(232,201,122,0.55)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(232,201,122,0.18)')}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 border"
        style={{ backgroundColor: 'rgba(232,201,122,0.12)', borderColor: 'rgba(232,201,122,0.3)' }}
      >
        {s.icon}
      </div>
      <h2 className="text-lg font-bold text-white group-hover:text-[#E8C97A] transition-colors">
        {s.title}
      </h2>
      <p className="text-sm text-gray-400 mt-1 leading-relaxed">{s.description}</p>

      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ boxShadow: '0 0 24px rgba(232,201,122,0.15)' }}
      />
    </Link>
  );
}

export default function DashboardHome() {
  return (
    <SpaceBackground className="min-h-screen">
      <header className="h-16 border-b flex items-center px-6" style={{ borderColor: 'rgba(232,201,122,0.15)' }}>
        <Logo size="sm" />
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <p className="font-mono text-[11px] tracking-widest text-[#E8C97A] uppercase mb-2">
          Panel de control
        </p>
        <h1 className="text-3xl font-bold text-white mb-10">¿Qué quieres crear hoy?</h1>

        <section className="mb-12">
          <p className="font-mono text-[11px] tracking-widest text-gray-400 uppercase mb-4">Crear</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {createSections.map((s) => (
              <ControlCard key={s.href} s={s} />
            ))}
          </div>
        </section>

        <section>
          <p className="font-mono text-[11px] tracking-widest text-gray-400 uppercase mb-4">Gestionar</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {manageSections.map((s) => (
              <ControlCard key={s.href} s={s} />
            ))}
          </div>
        </section>
      </main>
    </SpaceBackground>
  );
}