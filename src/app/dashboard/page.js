'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/lib/api';
import { setAuthTokenCookie, clearAuthTokenCookie } from '@/lib/auth-cookie';
import Header from '@/components/Header';

const MODES = [
  { id: '', label: '📷 Foto', hint: 'Fotografia realista, câmera profissional, iluminação natural' },
  { id: 'produto', label: '🛍️ Produto', hint: 'Foto comercial de produto em destaque, fundo limpo, iluminação de estúdio' },
  { id: 'anuncio', label: '📢 Anúncio', hint: 'Peça publicitária pronta para divulgação, texto legível e chamada clara' },
  { id: 'arte', label: '🎨 Arte', hint: 'Arte criativa e ilustração' },
];

const NEGOCIOS = ['Alimentação', 'Beleza', 'Imóveis', 'Moda', 'Loja', 'Automóveis', 'Tecnologia', 'Outro'];
const OBJETIVOS = ['Vender', 'Divulgar', 'Promover oferta', 'Conseguir clientes', 'Postar nas redes'];
const AUDIENCIAS = ['A Criativa decide', 'Público geral', 'Homens', 'Mulheres', 'Famílias', 'Premium', 'Jovens'];
const AUDIENCIA_ICONS = {
  'A Criativa decide': '✨',
  'Público geral': '👥',
  'Homens': '👨',
  'Mulheres': '👩',
  'Famílias': '👨‍👩‍👧',
  'Premium': '💎',
  'Jovens': '🎧',
};

function IconDownload({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" />
    </svg>
  );
}

function IconRefresh({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M20 9a8 8 0 10-2.3 5.7L15 17" />
    </svg>
  );
}

function IconEdit({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function IconTrash({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-1 14H6L5 7m5-4h4l1 1h4v2H5V4h4l1-1z" />
    </svg>
  );
}

function CampaignView({ result, onExit, onDownloadUrl, onCopy }) {
  const [copied, setCopied] = useState(null);
  const copy = async (label, text) => {
    await onCopy(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };
  const [downloading, setDownloading] = useState(false);
  const downloadAll = async () => {
    setDownloading(true);
    if (result.postImage) await onDownloadUrl(result.postImage, 'post-campanha.png');
    if (result.storyImage) await onDownloadUrl(result.storyImage, 'story-campanha.png');
    setDownloading(false);
  };

  return (
    <div className="mx-auto max-w-2xl">
      {(result.confirmation || result.direction) && (
        <div className="mb-4 rounded-2xl border border-primary-500/30 bg-primary-500/[0.06] p-4">
          {result.confirmation && <p className="text-sm font-semibold text-white">{result.confirmation}</p>}
          {result.direction && <p className="mt-1 text-[13px] text-gray-300">{result.direction}</p>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {result.postImage && (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <img src={result.postImage} alt="Post da campanha" className="w-full aspect-square bg-black/20 object-cover" />
            <button
              onClick={() => onDownloadUrl(result.postImage, 'post-campanha.png')}
              className="w-full border-t border-white/10 py-2.5 text-[13px] font-semibold text-primary-200 hover:bg-white/5 transition-colors"
            >
              <IconDownload /> Post (feed)
            </button>
          </div>
        )}
        {result.storyImage && (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <img src={result.storyImage} alt="Story da campanha" className="w-full aspect-[9/16] bg-black/20 object-cover" />
            <button
              onClick={() => onDownloadUrl(result.storyImage, 'story-campanha.png')}
              className="w-full border-t border-white/10 py-2.5 text-[13px] font-semibold text-primary-200 hover:bg-white/5 transition-colors"
            >
              <IconDownload /> Story
            </button>
          </div>
        )}
      </div>

      {(result.caption || result.cta) && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-500">Legenda pronta para postar</p>
          {result.caption && (
            <p className="mt-2 text-[14px] leading-relaxed text-gray-200">{result.caption}</p>
          )}
          {result.cta && (
            <p className="mt-2 inline-block rounded-lg bg-primary-500/15 px-3 py-1 text-[13px] font-semibold text-primary-200">
              CTA: {result.cta}
            </p>
          )}
          {(result.hashtags || []).length > 0 && (
            <p className="mt-2 text-[12px] text-gray-500">{result.hashtags.join(' ')}</p>
          )}
          <button
            onClick={() => copy('legenda', `${result.caption || ''}\n\n${(result.hashtags || []).join(' ')}\n\nCTA: ${result.cta || ''}`)}
            className="mt-3 rounded-xl border border-white/10 px-4 py-2 text-[13px] text-gray-200 hover:bg-white/5 transition-colors"
          >
            {copied === 'legenda' ? 'Copiado!' : 'Copiar legenda + hashtags'}
          </button>
        </div>
      )}

      {(result.plan || []).length > 0 && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-500">Plano da semana</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {result.plan.map((line, i) => (
              <li key={i} className="text-[13px] text-gray-300">{line}</li>
            ))}
          </ul>
          <button
            onClick={() => copy('plano', result.plan.join('\n'))}
            className="mt-3 rounded-xl border border-white/10 px-4 py-2 text-[13px] text-gray-200 hover:bg-white/5 transition-colors"
          >
            {copied === 'plano' ? 'Copiado!' : 'Copiar plano'}
          </button>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2">
        <button
          onClick={downloadAll}
          disabled={downloading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-3 text-sm font-semibold text-white hover:from-primary-500 hover:to-primary-400 disabled:opacity-40 transition-all"
        >
          <IconDownload /> {downloading ? 'Baixando…' : 'Baixar tudo'}
        </button>
        <button onClick={onExit} className="w-full rounded-xl border border-white/10 py-2.5 text-[13px] text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
          ← Criar outra peça
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [history, setHistory] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('');
  const [audience, setAudience] = useState('A Criativa decide');
  const [changeText, setChangeText] = useState('');
  const [review, setReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [intent, setIntent] = useState(null); // { confirmation, direction, intent, msg }
  const [understanding, setUnderstanding] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wBusiness, setWBusiness] = useState('');
  const [wGoal, setWGoal] = useState('');
  const [concepts, setConcepts] = useState(null);
  const [conceptsLoading, setConceptsLoading] = useState(false);
  const [campaign, setCampaign] = useState(null); // { loading, ask, result }
  const [favs, setFavs] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('criai_favs') || '[]')); } catch { return new Set(); }
  });
  const [favFilter, setFavFilter] = useState(false);
  const [showAllAudiences, setShowAllAudiences] = useState(false);
  const [sideToolsOpen, setSideToolsOpen] = useState(false);
  const inputRef = useRef(null);
  const activePrompt = useRef('');

  const loadHistory = useCallback(async () => {
    try {
      const hist = await api.getHistory();
      setHistory(hist || []);
    } catch {}
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { clearAuthTokenCookie(); window.location.href = '/login'; return; }
    setAuthTokenCookie(token);
    Promise.all([loadHistory()]).then(() => setLoading(false));
  }, [loadHistory]);

  const promptWithMode = (msg) => {
    const parts = [];
    const hint = MODES.find((m) => m.id === mode)?.hint;
    if (hint) parts.push(hint);
    if (audience && audience !== 'A Criativa decide') parts.push(`Público-alvo: ${audience.toLowerCase()}`);
    parts.push(msg.trim());
    return parts.join('. ');
  };

  const generate = async (msg) => {
    const clean = (msg ?? input).trim();
    if (!clean || generating) return;
    setInput('');
    setChangeText('');
    setReview(null);
    activePrompt.current = clean;
    setGenerating(true);
    setStatus('');
    try {
      const data = await api.generateImageLive(promptWithMode(clean), { model: 'flux2pro', width: 1216, height: 1520 }, setStatus, () => {});
      setLastResult({ imageUrl: data.imageUrl, prompt: clean });
      loadHistory();
    } catch (err) {
      if (err.data?.code === 'NO_CREDITS') { window.location.href = '/plans'; return; }
      setStatus('Não consegui gerar agora. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  };

  const beginCreation = async (raw) => {
    const msg = (raw ?? input).trim();
    if (!msg || generating || understanding) return;
    setUnderstanding(true);
    try {
      const r = await api.getIntent(msg);
      // Sempre mostra o "Entendi": o usuário confere a interpretação ANTES de gastar crédito.
      if (r?.success && r.confirmation) {
        setIntent({ ...r, msg });
        setInput('');
      } else {
        generate(msg);
      }
    } catch {
      generate(msg);
    } finally {
      setUnderstanding(false);
    }
  };

  const answerQuestion = (answer) => {
    if (!intent) return;
    beginCreation(`${intent.msg} ${answer.trim()}`);
  };

  const backToEdit = () => {
    if (intent) setInput(intent.msg);
    setIntent(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const confirmIntent = () => {
    if (!intent) return;
    const m = intent.msg;
    setIntent(null);
    generate(m);
  };

  const newCreation = () => {
    setLastResult(null);
    setIntent(null);
    setChangeText('');
    setTimeout(() => inputRef.current?.focus(), 50);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openItem = (item) => {
    setLastResult({ imageUrl: item.imageUrl, prompt: item.prompt || '' });
    setIntent(null);
    setChangeText('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeItem = async (id) => {
    try {
      await api.deleteHistoryItem(id);
      setHistory((h) => h.filter((i) => i.id !== id));
    } catch {}
  };

  const openCerebro = (url, change) => {
    sessionStorage.setItem('criai_ref_image', url);
    sessionStorage.setItem('criai_ref_prompt', change || '');
    window.location.href = '/cerebro';
  };

  const openVideo = (url) => {
    sessionStorage.setItem('criai_video_image', url);
    sessionStorage.setItem('criai_video_name', activePrompt.current || '');
    window.location.href = '/video';
  };

  const submitChange = () => {
    const t = changeText.trim();
    if (!t || !lastResult) return;
    openCerebro(lastResult.imageUrl, t);
  };

  const runReview = async () => {
    if (!lastResult || reviewLoading) return;
    setReviewLoading(true);
    setReview(null);
    try {
      const r = await api.getClientReview(lastResult.imageUrl);
      if (r?.success) setReview(r.clientReview);
    } catch {}
    setReviewLoading(false);
  };

  const makeBetter = () => {
    if (!lastResult || !review) return;
    const base = activePrompt.current || lastResult.prompt || '';
    const next = review.suggestion ? `${base} ${review.suggestion}` : base;
    setReview(null);
    generate(next);
  };

  const runCampaign = async (raw) => {
    if (campaign?.loading) return;
    const text = (raw ?? input).trim() || activePrompt.current?.trim() || '';
    if (!text) { noCampaignText(); return; }
    setCampaign({ loading: true });
    try {
      const r = await api.campaign(text);
      if (!r?.success) throw new Error('Sem resposta');
      if (r.code === 'NEED_ANSWER') {
        setCampaign({ ask: { question: r.question, options: r.options || [], base: text, confirmation: r.confirmation } });
        return;
      }
      setCampaign({ result: r });
      loadHistory();
    } catch (err) {
      if (err.data?.code === 'NO_CREDITS') { setCampaign(null); window.location.href = '/plans'; return; }
      setCampaign({ error: true });
    }
  };

  const answerCampaign = (answer) => {
    if (!campaign?.ask) return;
    const base = campaign.ask.base;
    setCampaign(null);
    runCampaign(`${base} ${answer.trim()}`);
  };

  const exitCampaign = () => setCampaign(null);

  const downloadUrl = async (url, name) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } catch {
      window.open(url, '_blank');
    }
  };

  const copyText = async (text) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  const toggleFav = (id) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      try { localStorage.setItem('criai_favs', JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const goTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const goRecentes = () => { setFavFilter(false); document.getElementById('recentes')?.scrollIntoView({ behavior: 'smooth' }); };
  const goFavs = () => { setFavFilter(true); document.getElementById('recentes')?.scrollIntoView({ behavior: 'smooth' }); };

  const noCampaignText = () => {
    setStatus('Escreva sobre o que é o seu negócio (ex.: quero divulgar minha hamburgueria) para eu montar a campanha.');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const pickConcepts = async () => {
    if (!wBusiness || !wGoal || conceptsLoading) return;
    setConceptsLoading(true);
    setConcepts(null);
    try {
      const r = await api.getConcepts(wBusiness, wGoal);
      if (r?.success) setConcepts(r.concepts || []);
    } catch {}
    setConceptsLoading(false);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary-800 border-t-primary-400 rounded-full animate-spin mx-auto mb-4"></div>
        </div>
      </>
    );
  }

  const completed = history.filter((i) => i.imageUrl && i.status === 'COMPLETED');
  const recentes = favFilter ? completed.filter((i) => favs.has(i.id)) : completed;

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 pt-44 pb-10">
        <div className="flex gap-6 items-start">
          <aside className="hidden lg:block w-60 shrink-0 sticky top-44">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <button
                onClick={newCreation}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-primary-500 hover:to-primary-400 transition-all"
              >
                ✨ Nova criação
              </button>
              <div className="flex flex-col gap-0.5">
                <button onClick={goTop} className="btn-ghost w-full justify-start text-sm px-3 py-2">⌂ Início</button>
                <button onClick={goRecentes} className={`btn-ghost w-full justify-start text-sm px-3 py-2 ${favFilter ? '' : 'text-primary-200'}`}>▣ Minhas criações</button>
                <button onClick={goFavs} className={`btn-ghost w-full justify-start text-sm px-3 py-2 ${favFilter ? 'text-primary-200' : ''}`}>♡ Favoritos</button>
                <a href="/plans" className="btn-ghost w-full justify-start text-sm px-3 py-2">💳 Planos</a>
              </div>
              <div className="my-2 border-t border-white/10" />
              <button
                onClick={() => setSideToolsOpen(!sideToolsOpen)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[13px] font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                + Mais ferramentas
                <svg className={`h-3.5 w-3.5 transition-transform ${sideToolsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {sideToolsOpen && (
                <div className="mt-1 flex flex-col gap-0.5 animate-slide-in">
                  <a href="/video" className="btn-ghost w-full justify-start text-sm px-3 py-2">🎬 Transformar em vídeo</a>
                  <a href="/card-de-candidato" className="btn-ghost w-full justify-start text-sm px-3 py-2">🗳️ Santinho de candidato</a>
                  <a href="/cerebro" className="btn-ghost w-full justify-start text-sm px-3 py-2">🖌️ Editar imagem</a>
                </div>
              )}
            </div>
          </aside>

          <section className="min-w-0 flex-1">
            {campaign?.loading ? (
              <div className="mx-auto max-w-xl rounded-2xl border border-primary-500/30 bg-primary-500/[0.06] p-8 text-center">
                <p className="text-lg font-semibold text-white">Montando sua campanha…</p>
                <p className="mt-2 text-[13px] text-gray-400">Entendendo seu negócio, escrevendo a legenda e criando o Post + Story.</p>
                <div className="mt-4 flex justify-center gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary-400" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary-400 [animation-delay:120ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary-400 [animation-delay:240ms]" />
                </div>
              </div>
            ) : campaign?.ask ? (
              <div className="mx-auto max-w-xl">
                <div className="rounded-2xl border border-primary-500/30 bg-primary-500/[0.06] p-6 text-center">
                  <p className="text-[13px] font-semibold uppercase tracking-wide text-primary-300">Antes de começar</p>
                  <p className="mt-2 text-lg font-semibold text-white">{campaign.ask.question}</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {(campaign.ask.options || []).map((o) => (
                      <button
                        key={o}
                        onClick={() => answerCampaign(o)}
                        className="rounded-xl border border-primary-500/40 bg-primary-500/10 px-5 py-2.5 text-sm font-medium text-primary-100 hover:bg-primary-500/20 transition-colors"
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                  <button onClick={exitCampaign} className="mt-5 text-[13px] text-gray-400 hover:text-white transition-colors">
                    ← Cancelar campanha
                  </button>
                </div>
              </div>
            ) : campaign?.error ? (
              <div className="mx-auto max-w-xl rounded-2xl border border-red-500/30 bg-red-500/[0.06] p-6 text-center">
                <p className="text-sm font-semibold text-white">Não consegui montar a campanha agora.</p>
                <button onClick={exitCampaign} className="mt-4 text-[13px] text-gray-400 hover:text-white transition-colors">← Voltar</button>
              </div>
            ) : campaign?.result ? (
              <CampaignView result={campaign.result} onExit={exitCampaign} onDownloadUrl={downloadUrl} onCopy={copyText} />
            ) : lastResult && !generating ? (
              <div className="mx-auto max-w-2xl">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  <img src={lastResult.imageUrl} alt="" className="w-full bg-black/20" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <a
                    href={lastResult.imageUrl}
                    download="criativa-imagem.png"
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-3 text-sm font-semibold text-white hover:from-primary-500 hover:to-primary-400 transition-all"
                  >
                    <IconDownload /> Baixar
                  </a>
                  <button
                    onClick={() => generate(activePrompt.current)}
                    disabled={generating}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm text-gray-200 hover:bg-white/10 disabled:opacity-40 transition-colors"
                  >
                    <IconRefresh /> Gerar novamente
                  </button>
                  <button
                    onClick={() => openCerebro(lastResult.imageUrl, '')}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm text-gray-200 hover:bg-white/10 transition-colors"
                  >
                    <IconEdit /> Editar
                  </button>
                  <button
                    onClick={() => openVideo(lastResult.imageUrl)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm text-gray-200 hover:bg-white/10 transition-colors"
                  >
                    🎬 Vídeo
                  </button>
                </div>
                <button
                  onClick={runReview}
                  disabled={reviewLoading || review}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-primary-500/40 bg-primary-500/10 px-4 py-2.5 text-sm font-semibold text-primary-200 hover:bg-primary-500/20 disabled:opacity-50 transition-all"
                >
                  {reviewLoading ? (
                    <>
                      <span className="flex gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-400" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-400 [animation-delay:120ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-400 [animation-delay:240ms]" />
                      </span>
                      Olhando com olhos de cliente…
                    </>
                  ) : (
                    <>👁️ Olhe como um cliente</>
                  )}
                </button>

                <button
                  onClick={() => runCampaign(activePrompt.current)}
                  disabled={campaign?.loading}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-primary-500/40 bg-primary-500/10 px-4 py-2.5 text-sm font-semibold text-primary-200 hover:bg-primary-500/20 disabled:opacity-50 transition-all"
                >
                  🚀 Criar campanha inteira (Post + Story + Legenda + CTA)
                </button>

                {review && (
                  <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-sm font-semibold text-white">Se eu fosse seu cliente…</p>
                    <p className="mt-0.5 text-[12px] text-gray-500">{review.verdict}</p>
                    <div className="mt-3 flex flex-col gap-2">
                      {[
                        ['Atenção', review.attention],
                        ['Clareza', review.clarity],
                        ['Desejo', review.desire],
                        ['Profissionalismo', review.professionalism],
                      ].map(([label, val]) => (
                        <div key={label} className="flex items-center gap-3">
                          <span className="w-28 shrink-0 text-[12px] text-gray-400">{label}</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400" style={{ width: `${Math.max(0, Math.min(100, (val || 0) * 10))}%` }} />
                          </div>
                          <span className="w-8 shrink-0 text-right text-[12px] font-semibold text-white">{val}/10</span>
                        </div>
                      ))}
                    </div>
                    {review.suggestion && (
                      <p className="mt-3 rounded-xl border border-primary-500/20 bg-primary-500/[0.07] px-3 py-2 text-[12px] leading-snug text-primary-100">
                        Sugestão: {review.suggestion}
                      </p>
                    )}
                    <button
                      onClick={makeBetter}
                      disabled={generating}
                      className="mt-3 w-full rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-primary-500 hover:to-primary-400 disabled:opacity-40 transition-all"
                    >
                      ✨ Faça melhor
                    </button>
                  </div>
                )}
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-sm font-semibold text-white">O que você quer mudar?</p>
                  <p className="mt-0.5 text-[12px] text-gray-500">Descreva e a IA ajusta a imagem para você.</p>
                  <div className="mt-3 flex gap-2">
                    <input
                      value={changeText}
                      onChange={(e) => setChangeText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') submitChange(); }}
                      placeholder="Ex.: troque o fundo por azul"
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-primary-500/40"
                    />
                    <button
                      onClick={submitChange}
                      disabled={!changeText.trim()}
                      className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-500 disabled:opacity-40 transition-colors"
                    >
                      Ajustar
                    </button>
                  </div>
                </div>
                <p className="mt-4 text-center text-[12px] text-gray-500">
                  Descrição: <span className="text-gray-400">{lastResult.prompt || 'Minha criação'}</span>
                </p>
                <div className="mt-3 text-center">
                  <button onClick={newCreation} className="text-[13px] text-primary-300 hover:text-primary-200 transition-colors">
                    ← Criar outra imagem
                  </button>
                </div>
              </div>
            ) : intent ? (
              <div className="mx-auto max-w-xl">
                <div className="rounded-2xl border border-primary-500/30 bg-primary-500/[0.06] p-6 text-center">
                  <p className="text-[13px] font-semibold uppercase tracking-wide text-primary-300">Entendi o que você quer</p>
                  <p className="mt-2 text-lg font-semibold text-white">{intent.confirmation}</p>
                  {intent.direction && (
                    <p className="mt-3 text-[14px] leading-relaxed text-gray-300">{intent.direction}</p>
                  )}
                  {intent.intent && (intent.intent.platform || intent.intent.emotion || intent.intent.visualStyle) && (
                    <p className="mt-2 text-[12px] text-gray-500">
                      {[intent.intent.platform, intent.intent.emotion, intent.intent.visualStyle].filter(Boolean).join(' · ')}
                    </p>
                  )}

                  {intent.question && (
                    <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-left">
                      <p className="text-sm font-medium text-white">{intent.question}</p>
                      {intent.options && intent.options.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {intent.options.map((o) => (
                            <button
                              key={o}
                              onClick={() => answerQuestion(o)}
                              disabled={understanding}
                              className="rounded-full border border-primary-500/40 bg-primary-500/10 px-4 py-2 text-[13px] font-medium text-primary-100 hover:bg-primary-500/20 disabled:opacity-50 transition-colors"
                            >
                              {o}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-5 flex flex-col gap-2">
                    {!intent.question && (
                      <button
                        onClick={confirmIntent}
                        disabled={understanding}
                        className="w-full rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-3 text-sm font-semibold text-white hover:from-primary-500 hover:to-primary-400 disabled:opacity-40 transition-all"
                      >
                        {understanding ? 'Entendendo…' : 'Está certo'}
                      </button>
                    )}
                    <button
                      onClick={backToEdit}
                      className="w-full rounded-xl border border-white/10 px-5 py-2.5 text-[13px] text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Quero mudar algo
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-2xl">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-white">O que você quer criar?</h1>
                  <p className="mt-2 text-[15px] text-gray-400">Conte sua ideia. A Criativa cuida do resto.</p>
                  <p className="mt-1 text-[13px] text-primary-300/80">Não precisa saber criar prompts.</p>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-3 focus-within:border-primary-500/40 transition-colors">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); beginCreation(); }
                    }}
                    rows={4}
                    placeholder="Descreva o que você está imaginando…"
                    className="w-full resize-none bg-transparent px-2 py-2 text-[15px] text-white placeholder-gray-500 outline-none"
                  />
                  <div className="mt-1 flex flex-wrap gap-1.5 px-1">
                    {MODES.map((m) => (
                      <button
                        key={m.id || 'foto'}
                        onClick={() => setMode(mode === m.id ? '' : m.id)}
                        className={`rounded-full px-3 py-1.5 text-[12px] border transition-colors ${
                          mode === m.id
                            ? 'border-primary-500 bg-primary-500/20 text-primary-200'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 px-1">
                    <span className="text-[11px] text-gray-500">Para quem é?</span>
                    {AUDIENCIAS.slice(0, 2).map((a) => (
                      <button
                        key={a}
                        onClick={() => { setAudience(a); setShowAllAudiences(false); }}
                        className={`rounded-full px-3 py-1 text-[12px] border transition-colors ${
                          audience === a && !showAllAudiences
                            ? 'border-primary-500 bg-primary-500/20 text-primary-200'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {AUDIENCIA_ICONS[a]} {a}
                      </button>
                    ))}
                    {showAllAudiences
                      ? AUDIENCIAS.slice(2).map((a) => (
                          <button
                            key={a}
                            onClick={() => setAudience(a)}
                            className={`rounded-full px-3 py-1 text-[12px] border transition-colors ${
                              audience === a
                                ? 'border-primary-500 bg-primary-500/20 text-primary-200'
                                : 'border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/20'
                            }`}
                          >
                            {AUDIENCIA_ICONS[a]} {a}
                          </button>
                        ))
                      : (
                          <button
                            onClick={() => setShowAllAudiences(true)}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[12px] text-gray-400 hover:text-white hover:border-white/20 transition-colors"
                          >
                            🎯 Escolher público…
                          </button>
                        )}
                  </div>
                  <div className="mt-3 flex justify-end px-1">
                    <button
                      onClick={() => beginCreation()}
                      disabled={generating || understanding || !input.trim()}
                      className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition-all ${
                        input.trim()
                          ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/25 hover:from-primary-500 hover:to-primary-400'
                          : 'bg-white/5 text-gray-500 border border-white/10'
                      }`}
                    >
                      {understanding ? 'Entendendo…' : input.trim() ? '✨ Criar imagem →' : 'Criar imagem'}
                    </button>
                  </div>
                </div>

                <p className="mt-1.5 text-center text-[11px] text-gray-500">
                  Enter envia · Shift+Enter pula linha · os tipos só orientam a IA
                </p>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center">
                  <p className="text-sm font-semibold text-white">✨ Precisa de uma ideia?</p>
                  <p className="mt-1 text-[12px] text-gray-500">A Criativa pode pensar por você — uma criação ou a campanha inteira.</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => setWizardOpen(!wizardOpen)}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[13px] text-gray-200 hover:text-white hover:border-white/20 transition-colors"
                    >
                      💡 Não sei o que criar
                    </button>
                    <button
                      onClick={() => runCampaign()}
                      className="rounded-full border border-primary-500/40 bg-primary-500/10 px-4 py-2 text-[13px] text-primary-200 hover:bg-primary-500/20 transition-colors"
                    >
                      🚀 Criar campanha
                    </button>
                  </div>
                </div>

                {wizardOpen && (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-sm font-semibold text-white">Deixe a Criativa pensar por você</p>
                    <p className="mt-0.5 text-[12px] text-gray-500">Escolha o seu negócio e o seu objetivo: a IA cria 3 ideias para escolher.</p>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={wBusiness}
                        onChange={(e) => setWBusiness(e.target.value)}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-primary-500/40"
                      >
                        <option value="" className="bg-neutral-900">Meu negócio é…</option>
                        {NEGOCIOS.map((n) => <option key={n} value={n} className="bg-neutral-900">{n}</option>)}
                      </select>
                      <select
                        value={wGoal}
                        onChange={(e) => setWGoal(e.target.value)}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-primary-500/40"
                      >
                        <option value="" className="bg-neutral-900">Quero…</option>
                        {OBJETIVOS.map((o) => <option key={o} value={o} className="bg-neutral-900">{o}</option>)}
                      </select>
                    </div>
                    <button
                      onClick={pickConcepts}
                      disabled={!wBusiness || !wGoal || conceptsLoading}
                      className="mt-3 w-full rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-500 disabled:opacity-40 transition-colors"
                    >
                      {conceptsLoading ? 'Criando ideias…' : 'Gerar 3 ideias'}
                    </button>

                    {(conceptsLoading || concepts) && (
                      <div className="mt-4">
                        {conceptsLoading ? (
                          <p className="text-[13px] text-gray-400 flex items-center gap-2">
                            <span className="flex gap-1">
                              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-400" />
                              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-400 [animation-delay:120ms]" />
                              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-400 [animation-delay:240ms]" />
                            </span>
                            Pensando em conceitos diferentes…
                          </p>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {concepts.map((c, i) => (
                              <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3">
                                <p className="text-sm font-semibold text-white">{c.title}</p>
                                <p className="mt-1 text-[12px] leading-snug text-gray-400">{c.description}</p>
                                <button
                                  onClick={() => generate(c.prompt + '. ' + c.description)}
                                  className="mt-2 rounded-lg border border-primary-500/40 bg-primary-500/10 px-3 py-1.5 text-[12px] font-semibold text-primary-200 hover:bg-primary-500/20 transition-colors"
                                >
                                  Gostei desta
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {(generating || status) && (
                  <div className="mt-4 flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[13px] text-gray-300">
                    {generating && (
                      <span className="flex gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-400" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-400 [animation-delay:120ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-400 [animation-delay:240ms]" />
                      </span>
                    )}
                    <span>{generating ? status || 'Entendendo seu pedido…' : status}</span>
                  </div>
                )}

                {recentes.length > 0 && (
                  <div id="recentes" className="mt-10">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-white">{favFilter ? '♡ Favoritos' : 'Suas criações recentes'}</h2>
                      {favFilter ? (
                        <button onClick={goRecentes} className="text-[12px] text-primary-300 hover:text-primary-200 transition-colors">Ver todas</button>
                      ) : (
                        <span className="text-[12px] text-gray-500">{completed.length} criação(ões)</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {recentes.slice(0, 12).map((item) => (
                        <div
                          key={item.id}
                          className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/5"
                        >
                          <button onClick={() => openItem(item)} className="absolute inset-0">
                            <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFav(item.id); }}
                            className={`absolute top-2 right-2 rounded-lg p-1.5 transition-colors ${
                              favs.has(item.id)
                                ? 'bg-primary-500/30 text-primary-200'
                                : 'bg-black/40 text-white/80 opacity-0 group-hover:opacity-100 hover:text-white'
                            }`}
                            aria-label="Favoritar"
                          >
                            {favs.has(item.id) ? '❤️' : '🤍'}
                          </button>
                          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a
                              href={item.imageUrl}
                              download="criativa-imagem.png"
                              onClick={(e) => e.stopPropagation()}
                              className="rounded-lg bg-white/15 p-1.5 text-white hover:bg-white/25 transition-colors"
                              aria-label="Baixar"
                            >
                              <IconDownload />
                            </a>
                            <button
                              onClick={(e) => { e.stopPropagation(); openCerebro(item.imageUrl, ''); }}
                              className="rounded-lg bg-white/15 p-1.5 text-white hover:bg-white/25 transition-colors"
                              aria-label="Editar"
                            >
                              <IconEdit />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                              className="rounded-lg bg-red-500/25 p-1.5 text-red-200 hover:bg-red-500/40 transition-colors"
                              aria-label="Excluir"
                            >
                              <IconTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}