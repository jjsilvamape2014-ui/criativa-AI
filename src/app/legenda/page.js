'use client';

import { useRef, useState } from 'react';
import Header from '@/components/Header';

export default function LegendaPage() {
  const fileRef = useRef(null);
  const [arquivo, setArquivo] = useState(null);
  const [tx, setTx] = useState(false);
  const [res, setRes] = useState(null);
  const [erro, setErro] = useState('');

  const subindo = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) { setArquivo(f); setErro(''); setRes(null); }
  };

  async function gera() {
    if (!arquivo) return setErro('Escolha o MP4 primeiro.');
    setTx(true); setErro('');
    try {
      const fd = new FormData();
      fd.append('video', arquivo);
      const r = await fetch('/api/legenda/transcribe', { method: 'POST', body: fd });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || ('HTTP ' + r.status));
      setRes(d);
    } catch (err) {
      setErro(err.message);
    } finally {
      setTx(false);
    }
  }

  function baixa(txt, nome, mime) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: (mime || 'text/plain;charset=utf-8') }));
    a.download = nome;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  function fmt(s) {
    const p = (n) => String(n).padStart(2, '0');
    return p(Math.floor((s || 0) / 60)) + ':' + p(Math.floor((s || 0) % 60));
  }

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-2xl px-4 pt-32 pb-20">
        <p className="eyebrow">Entrevista → legenda</p>
        <h1 className="text-2xl font-bold text-brand-text mt-1">Legenda sincronizada da entrevista</h1>
        <p className="mt-1 text-sm text-brand-sub">
          Sobe o MP4, o Whisper (Groq) transcreve com tempo por palavra e devolve o
          <b> SRT</b> quebrado em 2 linhas — pronto pra legendar o vídeo.
        </p>

        <div className="card mt-6 space-y-4">
          <button
            onClick={() => fileRef.current && fileRef.current.click()}
            className="w-full rounded-xl border border-dashed border-brand-borderStrong bg-white/[0.03] px-4 py-8 text-sm text-brand-sub hover:border-primary-500/50 hover:text-brand-text transition-colors"
          >
            {arquivo ? arquivo.name : 'Escolher o MP4 da entrevista'}
          </button>
          <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={subindo} />

          <button
            onClick={gera}
            disabled={!arquivo || tx}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {tx ? 'Transcrevendo…' : 'Transcrever e gerar legenda'}
          </button>

          {erro && <p className="text-sm text-red-400">{erro}</p>}
        </div>

        {res && (
          <div className="card mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-primary-500/15 px-3 py-1 font-semibold text-primary-400">
                {(res.language || 'pt').toUpperCase()}
              </span>
              <span className="text-brand-sub">
                {fmt(res.duration)} · {(res.segments || []).length} blocos
              </span>
            </div>

            <div className="max-h-40 space-y-0.5 overflow-y-auto rounded-lg bg-black/20 p-3">
              {(res.segments || []).map((s, i) => (
                <p key={i} className="text-xs leading-relaxed text-brand-sub">
                  <span className="text-brand-dim">{fmt(s.start)}</span> — {s.text}
                </p>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button onClick={() => baixa(res.srt, 'legenda.srt')} className="btn-primary flex-1">
                Baixar .srt
              </button>
              <button
                onClick={() => baixa(JSON.stringify(res, null, 2), 'legenda.json', 'application/json')}
                className="btn-secondary flex-1"
              >
                Baixar JSON
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
