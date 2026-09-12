'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import VideoGenerator from '@/components/VideoGenerator';

const PLACEHOLDER = 'Pôster de açaí com o preço R$ 12,90 em destaque';

export default function LandingGenerator({ initialPrompt = '', scrollOnSet = false }) {
  const [mode, setMode] = useState('image'); // 'image' | 'video' — tudo na mesma caixa
  const [prompt, setPrompt] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { url, prompt } — imagem pronta, fora do campo
  const [error, setError] = useState(null);
  const [size, setSize] = useState({ width: 1216, height: 1520 });
  const [liveStatus, setLiveStatus] = useState(null); // etapa atual da IA ("onde ela está pesquisando")
  const [research, setResearch] = useState(null); // modelos de referência + fontes achadas na pesquisa
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const p = e.detail?.prompt;
      if (p) setPrompt(p);
      if (e.detail?.width && e.detail?.height) setSize({ width: e.detail.width, height: e.detail.height });
      if (scrollOnSet && inputRef.current) {
        inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        inputRef.current.focus();
      }
    };
    window.addEventListener('criai:set-prompt', handler);
    return () => window.removeEventListener('criai:set-prompt', handler);
  }, [scrollOnSet]);

  // Botões externos ("Criar meu anúncio", home) podem abrir direto o modo vídeo
  useEffect(() => {
    const handler = () => setMode('video');
    window.addEventListener('criai:open-video', handler);
    return () => window.removeEventListener('criai:open-video', handler);
  }, []);

  const handleGenerate = async () => {
    const msg = prompt.trim();
    if (!msg) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      window.location.href = '/register';
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setResearch(null);
    setLiveStatus('Conectando…');
    try {
      const data = await api.generateImageLive(
        msg,
        { model: 'flux2pro', width: size.width, height: size.height },
        setLiveStatus, // mostra onde a IA está "pesquisando", etapa por etapa
        setResearch   // recebe os modelos de referência que ela encontrou
      );
      // A imagem PRONTA sai do campo gerador: vira um cartão de resultado abaixo,
      // e o campo limpa para a próxima descrição.
      setResult({ url: data.imageUrl, prompt: msg });
      setPrompt('');
    } catch (err) {
      if (err.data?.code === 'NO_CREDITS') {
        window.location.href = '/plans';
        return;
      }
      setError('Não foi possível gerar agora. Tente novamente.');
    } finally {
      setLoading(false);
      setLiveStatus(null);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div>
      {/* Eleições 2026 — atalho para o santinho do candidato */}
      <a
        href="/card-de-candidato"
        className="mb-4 flex items-center justify-between gap-3 rounded-[16px] border-2 border-brand-accent/40 bg-gradient-to-r from-brand-accent/20 to-transparent px-4 py-3 transition-all hover:border-brand-accent"
      >
        <div>
          <p className="text-[14px] font-bold text-brand-text">Eleições 2026 · Card de candidato</p>
          <p className="text-[12px] text-brand-dim mt-0.5">Foto, nome, número e slogan — o santinho pronto no instante.</p>
        </div>
        <span className="shrink-0 rounded-lg bg-brand-accent px-3 py-2 text-[12px] font-bold text-brand-bg">Criar agora →</span>
      </a>
      {/* Escolha o formato — dois cartões grandes, impossível errar */}
      <div className="grid sm:grid-cols-2 gap-3 mb-5 max-w-[560px]">
        <button
          onClick={() => setMode('image')}
          className={`group relative text-left rounded-[18px] border-2 p-4 transition-all duration-300 overflow-hidden ${
            mode === 'image'
              ? 'border-brand-accent bg-gradient-to-br from-brand-accent/15 to-transparent shadow-xl shadow-brand-accent/20'
              : 'border-brand-border bg-brand-surface hover:border-brand-borderStrong'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-2xl mb-1 ${mode === 'image' ? '' : 'opacity-80'}`}></p>
              <p className={`text-[15px] font-bold ${mode === 'image' ? 'text-brand-accent' : 'text-brand-text'}`}>Criar imagem</p>
              <p className="text-[12px] text-brand-dim mt-0.5">Pôster, logo, post, arte</p>
            </div>
            <span className={`w-5 h-5 rounded-full border-2 mt-1 ${mode === 'image' ? 'bg-brand-accent border-brand-accent' : 'border-brand-borderStrong'}`}>
              {mode === 'image' && <span className="block w-3 h-3 rounded-full bg-brand-bg m-[2px]" />}
            </span>
          </div>
          <div className="flex mt-3 -space-x-2">
            <img src="/showcase/hero-acai.webp" alt="" className="w-11 h-11 rounded-lg object-cover border-2 border-brand-surface" />
            <img src="/showcase/post-feed.webp" alt="" className="w-11 h-11 rounded-lg object-cover border-2 border-brand-surface" />
            <img src="/showcase/logo-padaria.webp" alt="" className="w-11 h-11 rounded-lg object-cover border-2 border-brand-surface" />
          </div>
        </button>
        <button
          onClick={() => setMode('video')}
          className={`group relative text-left rounded-[18px] border-2 p-4 transition-all duration-300 overflow-hidden ${
            mode === 'video'
              ? 'border-brand-accent bg-gradient-to-br from-brand-accent/15 to-transparent shadow-xl shadow-brand-accent/20'
              : 'border-brand-border bg-brand-surface hover:border-brand-borderStrong'
          }`}
        >
          <span className={`absolute -top-2 -right-2 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-lg ${
            mode === 'video' ? 'bg-brand-accent text-brand-bg' : 'bg-brand-red text-brand-text'
          }`}>
            Nenhuma IA faz igual
          </span>
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-2xl mb-1 ${mode === 'video' ? '' : 'opacity-80'}`}></p>
              <p className={`text-[15px] font-bold ${mode === 'video' ? 'text-brand-accent' : 'text-brand-text'}`}>Vídeo / Anúncio falado</p>
              <p className="text-[12px] text-brand-dim mt-0.5">Apresentadora fala do seu produto</p>
            </div>
            <span className={`w-5 h-5 rounded-full border-2 mt-1 ${mode === 'video' ? 'bg-brand-accent border-brand-accent' : 'border-brand-borderStrong'}`}>
              {mode === 'video' && <span className="block w-3 h-3 rounded-full bg-brand-bg m-[2px]" />}
            </span>
          </div>
          <div className="flex mt-3 -space-x-2">
            <img src="/showcase/capa-video.webp" alt="" className="w-11 h-11 rounded-lg object-cover border-2 border-brand-surface" />
            <img src="/showcase/estilo-anuncio.webp" alt="" className="w-11 h-11 rounded-lg object-cover border-2 border-brand-surface" />
            <img src="/showcase/estilo-capa.webp" alt="" className="w-11 h-11 rounded-lg object-cover border-2 border-brand-surface" />
          </div>
        </button>
      </div>

      {mode === 'image' ? (
        <>
      <div className="flex items-center gap-3 rounded-[14px] border border-brand-borderStrong bg-brand-surface p-[14px] pl-[18px] max-w-[520px]">
        <input
          ref={inputRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKey}
          placeholder={PLACEHOLDER}
          className="flex-1 min-w-0 bg-transparent text-[15px] text-brand-text placeholder-brand-dim outline-none"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="shrink-0 rounded-[9px] bg-brand-accent px-5 py-[11px] text-sm font-semibold text-brand-bg hover:bg-brand-accentHover disabled:opacity-40 transition-colors"
        >
          {loading ? 'Gerando…' : 'Gerar'}
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-brand-dim">
        <p>Descreva em português. Sem cartão para começar.</p>
        <a
          href={`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(prompt.trim() || 'design criativo')}`}
          target="_blank"
          rel="noreferrer"
          className="text-brand-accent hover:text-brand-accentHover underline underline-offset-2"
        >
          Ver ideias no Pinterest
        </a>
      </div>

      {/* Onde a IA está "pesquisando" — status ao vivo, igual ChatGPT */}
      {loading && (
        <div className="mt-4 rounded-xl border border-brand-border bg-brand-surface p-4 max-w-[520px]">
          <p className="text-[13px] text-brand-sub">
            {liveStatus || 'Preparando…'}
            <span className="inline-block ml-0.5 animate-pulse">…</span>
          </p>
        </div>
      )}

      {/* Modelos de referência encontrados na pesquisa (Freepik) + fontes */}
      {research && research.inspiration && research.inspiration.length > 0 && (
        <div className="mt-4 max-w-[520px]">
          <p className="mb-2 text-[12px] text-brand-dim">Modelos de referência que encontrei na pesquisa:</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {research.inspiration.map((m, i) => (
              <a
                key={i}
                href={m.page || m.thumb}
                target="_blank"
                rel="noreferrer"
                className="shrink-0"
                title={m.title || 'Modelo de referência'}
              >
                <img
                  src={m.thumb}
                  alt={m.title || 'Modelo de referência'}
                  className="h-16 w-16 object-cover rounded-lg border border-brand-border"
                />
              </a>
            ))}
          </div>
          {research.fonts && research.fonts.length > 0 && (
            <p className="mt-2 text-[12px] text-brand-dim">Fontes ideais para a peça: {research.fonts.join(' · ')}</p>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-brand-border bg-brand-surface p-4">
          <p className="text-sm text-brand-sub">{error}</p>
        </div>
      )}

      {/* Resultado — fora do campo gerador, num card próprio */}
      {result && (
        <div className="mt-6 rounded-xl border border-brand-border bg-brand-surface max-w-[520px] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border">
            <p className="text-sm font-medium text-brand-text">Pronto!</p>
            <button
              onClick={() => { setResult(null); inputRef.current?.focus(); }}
              className="text-brand-dim hover:text-brand-text text-sm"
              aria-label="Fechar resultado"
            >
              ✕
            </button>
          </div>
          <img
            src={result.url}
            alt="Resultado da geração"
            className="w-full max-h-[460px] object-contain bg-brand-surface"
          />
          <div className="flex flex-col gap-2 p-3 border-t border-brand-border">
            <a
              href={result.url}
              download={`criativa-imagem.png`}
              className="block text-center text-sm py-2.5 rounded-lg bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accentHover transition-colors"
            >
              Baixar imagem
            </a>
            <button
              onClick={() => {
                if (typeof window === 'undefined') return;
                sessionStorage.setItem('criai_ref_image', result.url);
                sessionStorage.setItem('criai_ref_prompt', result.prompt || '');
                window.location.href = '/dashboard?chat=1#cerebro';
              }}
              className="block text-center text-sm py-2.5 rounded-lg border border-brand-border text-brand-accent hover:text-brand-accentHover transition-colors"
            >
              Editar na conversa (Cérebro)
            </button>
            <button
              onClick={() => {
                if (typeof window === 'undefined') return;
                sessionStorage.setItem('criai_video_image', result.url);
                sessionStorage.setItem('criai_video_name', result.prompt || '');
                setMode('video');
              }}
              className="block text-center text-sm py-2.5 rounded-lg border border-brand-border text-brand-accent hover:text-brand-accentHover transition-colors"
            >
              Criar anúncio em vídeo
            </button>
            <button
              onClick={() => { setResult(null); inputRef.current?.focus(); }}
              className="block text-center text-sm py-1 text-brand-dim hover:text-brand-text transition-colors"
            >
              Gerar outra
            </button>
          </div>
        </div>
      )}
        </>
      ) : (
        <VideoGenerator />
      )}
    </div>
  );
}
