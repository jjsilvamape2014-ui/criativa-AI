'use client';

import { useRef, useState } from 'react';
import Header from '@/components/Header';

export default function MontarPage() {
  const vidRef = useRef(null);
  const logoRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [logoImg, setLogoImg] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [convidado, setConvidado] = useState('');
  const [chamada, setChamada] = useState('');
  const [cta, setCta] = useState('');
  const [etapa, setEtapa] = useState('idle'); // idle | legenda | narracao | montando | pronto
  const [msg, setMsg] = useState('');
  const [erro, setErro] = useState('');
  const [voz, setVoz] = useState('pf_dora');

  const pegaVideo = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) { setVideo(f); setErro(''); setEtapa('idle'); }
  };
  const pegaLogo = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) setLogoImg(f);
  };

  async function montar() {
    if (!video) return setErro('Escolha o MP4 da entrevista.');
    if (!titulo.trim()) return setErro('Digite o nome do podcast.');
    setErro('');

    // 1) Legenda
    setEtapa('legenda'); setMsg('Transcrevendo a entrevista (Whisper/Groq)…');
    const fd = new FormData();
    fd.append('video', video);
    let legenda = null;
    try {
      const r = await fetch('/api/legenda/transcribe', { method: 'POST', body: fd });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || ('HTTP ' + r.status));
      legenda = d.srt;
    } catch (e) { return setErro('Legenda falhou: ' + e.message); }

    // 2) Narração da abertura
    setEtapa('narracao'); setMsg('Gerando a narração da abertura…');

    // 3) Montagem
    setEtapa('montando');
    setMsg('Editando vídeo (ffmpeg): abertura + legenda queimada + CTA…');
    const fd2 = new FormData();
    fd2.append('video', video);
    fd2.append('srt', legenda);
    if (logoImg) fd2.append('logo', logoImg);
    fd2.append('voz', voz);
    fd2.append('abertura', JSON.stringify({
      titulo, subtitulo, convidado,
      chamada: chamada || `Você está assistindo ${titulo}.`,
      cta: cta || 'Inscreva-se e fique por dentro das próximas sessões!'
    }));
    try {
      const r = await fetch('/api/video/montar', { method: 'POST', body: fd2 });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || ('HTTP ' + r.status));
      }
      const blob = await r.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([blob], { type: 'video/mp4' }));
      a.download = 'podcast-professional.mp4';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      setEtapa('pronto'); setMsg('Vídeo pronto e baixado!');
    } catch (e) {
      return setErro('Montagem falhou: ' + e.message);
    }
  }

  const btLabel = {
    idle: 'Montar vídeo profissional',
    legenda: 'Transcrevendo…',
    narracao: 'Narrando…',
    montando: 'Editando…',
    pronto: 'Feito! Montar de novo'
  }[etapa];

  const inputCls = 'w-full rounded-xl border border-brand-borderStrong bg-white/[0.03] px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-dim focus:border-primary-500/60 focus:outline-none';

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-2xl px-4 pt-32 pb-20">
        <p className="eyebrow">Podcast → vídeo profissional</p>
        <h1 className="mt-1 text-2xl font-bold text-brand-text">Montar o episódio em um MP4</h1>
        <p className="mt-1 text-sm text-brand-sub">
          Sobe a entrevista, digita o nome correto do podcast e o convidado: o app transcreve,
          narra a abertura com voz, queima a legenda e entrega <b>um único vídeo</b> pra baixar.
        </p>

        <div className="card mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-brand-sub">Nome do podcast *</label>
              <input className={inputCls} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="A Palavra em Nossa Vida" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-brand-sub">Subtítulo / evento</label>
              <input className={inputCls} value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)} placeholder="Gincana Bíblica 2026 — Colégio São José" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-brand-sub">Convidado</label>
            <input className={inputCls} value={convidado} onChange={(e) => setConvidado(e.target.value)} placeholder="Monsenhor Gabriel" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-brand-sub">Frase da narração da abertura</label>
            <input className={inputCls} value={chamada} onChange={(e) => setChamada(e.target.value)} placeholder={`Você está assistindo ${titulo || 'A Palavra em Nossa Vida'}.`} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-brand-sub">CTA final</label>
            <input className={inputCls} value={cta} onChange={(e) => setCta(e.target.value)} placeholder="Inscreva-se e fique por dentro das próximas sessões!" />
          </div>

          <div>
            <button
              onClick={() => logoRef.current && logoRef.current.click()}
              className="w-full rounded-xl border border-dashed border-brand-borderStrong bg-white/[0.03] px-4 py-3 text-sm text-brand-sub hover:border-primary-500/50 hover:text-brand-text transition-colors"
            >
              {logoImg ? 'Logo: ' + logoImg.name : 'Livro/aluno do podcast (opcional)'}
            </button>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={pegaLogo} />
          </div>

          <button
            onClick={() => vidRef.current && vidRef.current.click()}
            className="w-full rounded-xl border border-dashed border-brand-borderStrong bg-white/[0.03] px-4 py-8 text-sm text-brand-sub hover:border-primary-500/50 hover:text-brand-text transition-colors"
          >
            {video ? video.name : 'Escolher o MP4 da entrevista (WhatsApp)'}
          </button>
          <input ref={vidRef} type="file" accept="video/*" className="hidden" onChange={pegaVideo} />

          {etapa !== 'idle' && <p className="text-sm text-primary-400">{msg}</p>}
          {erro && <p className="text-sm text-red-400">{erro}</p>}

          <button
            onClick={montar}
            disabled={!video || !titulo.trim() || etapa === 'legenda' || etapa === 'narracao' || etapa === 'montando'}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {btLabel}
          </button>
        </div>
      </main>
    </>
  );
}