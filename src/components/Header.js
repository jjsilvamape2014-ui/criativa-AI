'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { clearAuthTokenCookie } from '@/lib/auth-cookie';
import Logo from '@/components/Logo';

export default function Header() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getProfile().then(setUser).catch(() => {
        localStorage.removeItem('token');
        clearAuthTokenCookie();
      });
    }
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    clearAuthTokenCookie();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-3'}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className={`flex flex-col gap-2 transition-all duration-300 rounded-2xl ${scrolled ? 'glass shadow-xl shadow-black/20 border border-white/10 px-4 py-2' : 'bg-transparent'}`}>
          {/* Top row: logo + auth */}
          <div className="flex items-center justify-between">
            <a href={user ? '/dashboard' : '/'}>
              <Logo size="md" />
            </a>

            <div className="flex items-center gap-3">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl glass hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-400 rounded-lg flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-primary-500/20">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-white hidden sm:block">{user.name}</span>
                    {user.plan === 'PREMIUM' && <span className="text-xs">⭐</span>}
                    <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-60 glass rounded-2xl border border-white/10 shadow-2xl shadow-black/40 py-2 z-50 animate-slide-in">
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-sm font-semibold text-white">{user.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                          <span className={user.plan === 'PREMIUM' ? 'badge-premium mt-2' : 'badge-free mt-2'}>
                            {user.plan === 'PREMIUM' ? '⭐ Premium' : 'Free'}
                          </span>
                        </div>
                        <a href="/dashboard" className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">Minha área</a>
                        <a href="/cerebro" className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">Estúdio inteligente</a>
                        <a href="/plans" className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">Planos & Assinatura</a>
                        <div className="border-t border-white/10 mt-1 pt-1">
                          <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                            Sair
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <a href="/login" className="btn-ghost text-sm">Entrar</a>
                  <a href="/register" className="btn-primary text-sm py-2 px-4">Criar conta</a>
                </div>
              )}
            </div>
          </div>

          {/* Floating nav bar below the logo */}
          <nav className="flex items-center justify-center gap-1 overflow-x-auto bg-white/5 border border-white/10 rounded-xl px-1.5 py-1 backdrop-blur-md scrollbar-none">
            <a href="/dashboard" className="btn-ghost text-sm px-3 py-1.5 whitespace-nowrap">✨ Criar</a>
            <a href="/dashboard#recentes" className="btn-ghost text-sm px-3 py-1.5 whitespace-nowrap">▣ Minhas criações</a>
            <a href="/plans" className="btn-ghost text-sm px-3 py-1.5 whitespace-nowrap">⭐ Planos</a>
            <div className="relative">
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={`btn-ghost text-sm px-3 py-1.5 whitespace-nowrap flex items-center gap-1 ${moreOpen ? 'text-white' : ''}`}
              >
                Mais
                <svg className={`h-3.5 w-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {moreOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-52 glass rounded-xl border border-white/10 shadow-2xl shadow-black/40 py-1.5 z-50 animate-slide-in">
                    <a href="/video" onClick={() => setMoreOpen(false)} className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">🎬 Transformar em vídeo</a>
                    <a href="/card-de-candidato" onClick={() => setMoreOpen(false)} className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">🗳️ Santinho de candidato</a>
                    <a href="/cerebro" onClick={() => setMoreOpen(false)} className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">🖌️ Editar imagem</a>
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
