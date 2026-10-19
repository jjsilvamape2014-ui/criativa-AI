'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/lib/api';

// Categorias do JSON de presets (backend: src/data/motion-presets.json), em pt-BR
const GROUP_LABELS = {
  base: 'Base',
  zoom: 'Zoom',
  dolly: 'Dolly',
  pan_tilt: 'Pan e tilt',
  focus: 'Foco',
  lens: 'Lente',
  handheld: 'Na mão',
  crane: 'Grua',
  aerial: 'Aéreo',
  transition: 'Transição',
  hero: 'Cena hero',
  car: 'Carro',
  orbit: 'Órbita',
  pov: 'POV (primeira pessoa)',
  time: 'Tempo',
  style: 'Estilo',
  face: 'Rosto'
};

// Busca sem acento e sem caixa alta: "orbita" acha "Órbita"
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Escolha do movimento de câmera (65 presets, agrupados por categoria).
// Estilo idêntico aos chips de estilo do VideoGenerator; teclado: os chips são
// botões nativos (Tab + Enter/Espaço) e a seta para baixo na busca vai ao 1º resultado.
export default function MotionPresetPicker({ value, onChange }) {
  const [groups, setGroups] = useState({});
  const [search, setSearch] = useState('');
  const listRef = useRef(null);

  // O endpoint exige login (igual ao resto do gerador): sem token, nem tenta
  useEffect(() => {
    if (typeof window === 'undefined' || !localStorage.getItem('token')) return;
    let alive = true;
    api.getMotionPresets()
      .then((d) => { if (alive) setGroups(d.groups || {}); })
      .catch(() => { /* offline/401: o picker só mostra o aviso */ });
    return () => { alive = false; };
  }, []);

  // Filtra por nome (pt/en), slug ou categoria
  const visible = useMemo(() => {
    const q = norm(search).trim();
    const out = {};
    for (const [group, items] of Object.entries(groups)) {
      const keep = items.filter((p) =>
        !q || [p.name, p.labelPt, p.slug, group, GROUP_LABELS[group]].some((f) => norm(f).includes(q))
      );
      if (keep.length) out[group] = keep;
    }
    return out;
  }, [groups, search]);

  const focusFirst = (e) => {
    if (e.key !== 'ArrowDown') return;
    const first = listRef.current?.querySelector('button[data-preset]');
    if (first) { e.preventDefault(); first.focus(); }
  };

  const temPresets = Object.keys(groups).length > 0;
  const total = Object.values(visible).reduce((n, items) => n + items.length, 0);

  return (
    <div className="mt-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="motion-search" className="block text-sm font-semibold text-gray-200 mb-2">
          Movimento da câmera (opcional)
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs text-primary-300 hover:text-primary-200 font-medium underline underline-offset-2 mb-2"
          >
            ✕ Sem movimento
          </button>
        )}
      </div>

      {!temPresets ? (
        <p className="text-xs text-gray-500 leading-relaxed">
          {typeof window !== 'undefined' && !localStorage.getItem('token')
            ? 'Entre na sua conta para escolher entre os 65 movimentos de câmera.'
            : 'Não consegui carregar os movimentos de câmera. Recarregue a página para ver a lista.'}
        </p>
      ) : (
        <>
          <input
            id="motion-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={focusFirst}
            placeholder="Buscar movimento (ex.: zoom, órbita, grua)"
            className="input"
          />

          <div ref={listRef} className="mt-3 space-y-4 max-h-72 overflow-y-auto pr-1">
            {Object.entries(visible).map(([group, items]) => (
              <div key={group}>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">
                  {GROUP_LABELS[group] || group} · {items.length}
                </p>
                <div className="flex flex-wrap gap-2">
                  {items.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      data-preset={p.id}
                      onClick={() => onChange(value === p.id ? '' : p.id)}
                      aria-pressed={value === p.id}
                      title={p.prompt}
                      className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all border ${
                        value === p.id
                          ? 'bg-primary-600 text-white border-primary-600 shadow'
                          : 'bg-white/5 text-gray-300 border-white/10 hover:border-primary-500/40'
                      }`}
                    >
                      {p.labelPt || p.name}
                      {p.badge === 'top_choice' && <span className="ml-1 text-amber-300">★</span>}
                      {p.badge === 'new' && <span className="ml-1 text-primary-200">novo</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {total === 0 && (
              <p className="text-xs text-gray-500">Nenhum movimento encontrado para &quot;{search}&quot;.</p>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-2.5 leading-relaxed">
            O movimento entra no prompt ao lado do estilo que você já escolheu — nada do que você escreveu é apagado.
          </p>
        </>
      )}
    </div>
  );
}
