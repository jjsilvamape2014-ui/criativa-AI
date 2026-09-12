'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { clearAuthTokenCookie } from '@/lib/auth-cookie';
import Logo from '@/components/Logo';

export default function Header() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getProfile().then(setUser).catch(() => {
        localStorage.removeItem('token');
        clearAuthTokenCookie();
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    clearAuthTokenCookie();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a href={user ? '/dashboard' : '/'}>
            <Logo size="md" />
          </a>

          <div className="hidden lg:flex items-center gap-1">
            <a href="/dashboard" className="btn-ghost text-sm">Criar imagem</a>
            <a href="/dashboard#recentes" className="btn-ghost text-sm">Minhas criações</a>
            <a href="/plans" className="btn-ghost text-sm">Planos</a>
            <a href="/plans" className="btn-ghost text-sm">Mais</a>
          </div>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg glass hover:bg-white/5 transition-all duration-200"
              >
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center font-bold text-sm text-white">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-brand-text hidden sm:block">{user.name}</span>
                {(user.plan === 'PREMIUM' || user.plan === 'PREMIUM') && <span className="badge-premium !px-1.5 !py-0.5 !text-[10px]">Premium</span>}
                {user.plan === 'FREE' && <span className="badge-free !px-1.5 !py-0.5 !text-[10px]">Grátis</span>}
                <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-64 card rounded-xl py-2 z-50 animate-slide-in">
                    <div className="px-4 py-3 border-b border-brand-border">
                      <p className="text-sm font-semibold text-brand-text">{user.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                      <span className={`badge mt-2 ${user.plan === 'PREMIUM' ? 'badge-premium' : 'badge-free'}`}>
                        {user.plan === 'PREMIUM' ? 'Premium' : 'Grátis'}
                      </span>
                    </div>
                    <a href="/dashboard" className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">Criar</a>
                    <a href="/dashboard#recentes" className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">Minhas criações</a>
                    <a href="/cerebro" className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">Editar imagem</a>
                    <a href="/plans" className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">Planos</a>
                    <div className="border-t border-brand-border mt-1 pt-1">
                      <a href="/video" className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">Vídeo com IA</a>
                    </div>
                    <div className="border-t border-brand-border mt-1 pt-1">
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
    </header>
  );
}
