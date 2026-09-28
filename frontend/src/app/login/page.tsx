'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SpaceBackground from '@/components/SpaceBackground';
import Logo from '@/components/Logo';
import { Eye, EyeOff } from 'lucide-react';

const GOLD = '#E8C97A';
const inputStyle = { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(232,201,122,0.25)' };

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Credenciales inválidas');
      const data = await res.json();
      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch (err) {
      setError('Correo o contraseña incorrectos. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SpaceBackground className="min-h-screen flex items-center justify-center px-4">
      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
            <Logo size="lg" />
          </div>
        </div>

        <div
          className="rounded-2xl shadow-2xl p-8 border"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(232,201,122,0.2)', backdropFilter: 'blur(12px)' }}
        >
          <h1 className="text-2xl font-semibold text-white mb-1">Bienvenido de nuevo</h1>
          <p className="text-sm text-gray-400 mb-6">Ingresa para seguir creando tus diseños</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Correo electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@empresa.com"
                className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-[#E8C97A] outline-none transition text-white placeholder-gray-500"
                style={inputStyle}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-300">Contraseña</label>
                <a href="/forgot-password" className="text-xs hover:underline" style={{ color: GOLD }}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-11 rounded-lg border focus:ring-2 focus:ring-[#E8C97A] outline-none transition text-white placeholder-gray-500"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-semibold transition disabled:opacity-60 shadow-lg"
              style={{ backgroundColor: GOLD, color: '#0B0E1A' }}
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            ¿No tienes cuenta?{' '}
            <a href="/register" className="font-medium hover:underline" style={{ color: GOLD }}>
              Regístrate gratis
            </a>
          </p>
        </div>
      </div>
    </SpaceBackground>
  );
}