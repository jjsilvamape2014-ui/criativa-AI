'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';

// Estilos de anúncio em vídeo — o "Afiliado Shopee" é o estilo de apresentação de
// produto usado pelos afiliados pra vender no marketplace.
const AD_STYLES = [
  { key: 'afiliado', label: 'Afiliado Shopee' },
  { key: 'promo', label: 'Impulso (mktplace)' },
  { key: 'brasil', label: 'Energia BR' },
  { key: 'empresa', label: 'Empresa' },
  { key: 'logo', label: 'Logo' },
  { key: 'hero', label: 'Hero shot' },
  { key: 'orbit', label: 'Rotação 360°' },
  { key: 'lifestyle', label: 'Lifestyle' },
  { key: 'elegant', label: 'Elegante' },
];

const MODES = [
  { key: 'product', icon: '', label: 'Anúncio de produto', tip: 'Vídeo vendendo no marketplace' },
  { key: 'talking', icon: '', label: 'Anúncio falado', tip: 'Apresentadora fala do produto', hot: true },
  { key: 'animate', icon: '', label: 'Animar imagem', tip: 'Move a sua imagem' },
];

export default function VideoGenerator() {
  const [mode, setMode] = useState('product');
  const [prompt, setPrompt] = useState('');
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [preset, setPreset] = useState('afiliado');
  const [script, setScript] = useState('');
  const [presenter, setPresenter] = useState('mulher');
  const [liveStatus, setLiveStatus] = useState('');

  const [imageUrl, setImageUrl] = useState('');
  const [imageData, setImageData] = useState('');
  const [preview, setPreview] = useState('');
  const fileRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getProfile().then(setUser).catch(() => {});
      api.getHistory().then(setHistory).catch(() => {});
    }
  }, []);

  // Recebe a imagem vinda do "Criar anúncio em vídeo" (card da imagem gerada)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const vidImg = sessionStorage.getItem('criai_video_image');
    const vidName = sessionStorage.getItem('criai_video_name');
    if (vidImg) {
      setImageData('');
      setImageUrl(vidImg);
      setPreview(vidImg);
      sessionStorage.removeItem('criai_video_image');
    }
    if (vidName) {
      setProductName(String(vidName).slice(0, 60));
      sessionStorage.removeItem('criai_video_name');
    }
  }, []);

  const recentImages = (history || []).filter(g => g.type === 'IMAGE' && g.imageUrl);

  const handleFileUpload = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setImageData(dataUrl);
      setImageUrl('');
      setPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectRecent = (url) => {
    setImageData('');
    setImageUrl(url);
    setPreview(url);
  };

  const handleGenerate = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    if (!imageData && !imageUrl.trim()) {
      setError({ type: 'GENERIC', message: 'Envie uma foto do seu produto ou escolha uma imagem.' });
      return;
    }
    // Estilos focados em produto pedem o nome; Empresa/Logo animam a marca em si
    const NEEDS_PRODUCT_NAME = ['afiliado', 'promo', 'brasil', 'hero', 'orbit', 'lifestyle', 'elegant'];
    if (mode === 'product' && NEEDS_PRODUCT_NAME.includes(preset) && !productName.trim()) {
      setError({ type: 'GENERIC', message: 'Informe o nome do produto para o anúncio.' });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setLiveStatus('');

    if (mode === 'talking') {
      const payload = { productName, productDesc, script, presenter };
      if (productPrice.trim()) payload.productPrice = productPrice.trim();
      if (imageData) {
        payload.imageData = imageData;
      } else {
        payload.imageUrl = imageUrl.trim();
      }
      try {
        const data = await api.generateTalkingAd(payload, setLiveStatus);
        setResult(data);
        setUser(prev => prev ? { ...prev, ...data.credits } : null);
      } catch (err) {
        if (err.data?.code === 'NO_CREDITS') {
          setError({ type: 'NO_CREDITS', message: 'Seus créditos de vídeo acabaram! Assine o plano por R$ 39,99/mês.' });
        } else {
          const detail = err.data?.details || err.message;
          setError({ type: 'GENERIC', message: `Não consegui gerar o anúncio falado. ${detail ? 'Detalhe: ' + detail : 'Tente novamente.'}` });
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    const options = { mode, preset };
    if (imageData) options.imageData = imageData;
    if (mode === 'product') {
      options.prompt = prompt;
      options.productName = productName;
      options.productDesc = productDesc;
      if (productPrice.trim()) options.productPrice = productPrice.trim();
    } else {
      options.prompt = prompt;
    }

    try {
      const data = await api.generateVideo(imageData ? '' : imageUrl.trim(), options);
      setResult(data);
      setUser(prev => prev ? { ...prev, ...data.credits } : null);
    } catch (err) {
      if (err.data?.code === 'NO_CREDITS') {
        setError({ type: 'NO_CREDITS', message: 'Seus créditos de vídeo acabaram! Assine o plano por R$ 39,99/mês.' });
      } else {
        setError({ type: 'GENERIC', message: err.message || 'Erro ao gerar vídeo. Tente novamente.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result?.videoUrl) return;
    const link = document.createElement('a');
    link.href = result.videoUrl;
    link.download = 'criai-anuncio-produto.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const credits = user ? (user.creditsVideos || 0) + (user.creditsPurchased || 0) : 0;

  const fieldLabel = 'block text-sm font-semibold text-gray-200 mb-2';

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Guia didático: o usuário sabe exatamente o que fazer */}
      <div className="card p-4 border-primary-500/25 bg-gradient-to-br from-primary-600/10 to-transparent">
        <p className="text-sm font-bold text-white mb-2.5">Como criar o seu anúncio em 3 passos</p>
        <ol className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-0 text-[13px] text-gray-300">
          <li className="flex items-start gap-1.5 sm:pr-12">
            <span className="w-5 h-5 shrink-0 rounded-full bg-primary-600 text-white text-[11px] font-bold flex items-center justify-center">1</span>
            Envie a foto do produto
          </li>
          <li className="flex items-start gap-1.5 sm:px-6 border-t sm:border-t-0 sm:border-l border-white/10 sm:ml-12 sm:pl-12 sm:border-l-white/10">
            <span className="w-5 h-5 shrink-0 rounded-full bg-primary-600 text-white text-[11px] font-bold flex items-center justify-center">2</span>
            Diga nome, preço e vantagens
          </li>
          <li className="flex items-start gap-1.5 border-t sm:border-t-0 sm:border-l border-white/10 mt-2 sm:mt-0 sm:ml-12 sm:pl-12 pt-2 sm:pt-0">
            <span className="w-5 h-5 shrink-0 rounded-full bg-primary-600 text-white text-[11px] font-bold flex items-center justify-center">3</span>
            Escolha o tipo e toque em criar
          </li>
        </ol>
      </div>

      <div className="card">
        <p className="text-sm font-bold text-white mb-3">Qual tipo de vídeo você quer?</p>

        {/* Tipos de vídeo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-8">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`relative text-left rounded-xl border-2 px-4 py-3.5 transition-all duration-300 ${
                mode === m.key
                  ? 'border-primary-500 bg-primary-600/10 shadow-lg shadow-primary-500/20'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              {m.hot && (
                <span className="absolute -top-2 -right-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-primary-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
                  Nosso diferencial
                </span>
              )}
              <p className="text-xl mb-1">{m.icon}</p>
              <p className={`text-sm font-bold ${mode === m.key ? 'text-white' : 'text-gray-200'}`}>{m.label}</p>
              <p className={`text-[11px] mt-0.5 ${mode === m.key ? 'text-primary-300' : 'text-gray-500'}`}>{m.tip}</p>
            </button>
          ))}
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label className="block text-sm font-semibold text-gray-200">
              {mode === 'product' ? 'Foto do produto' : 'Imagem de origem'}
            </label>
            <span className="text-[11px] text-gray-500">
              {mode === 'talking' ? 'A IA usa essa foto pra criar a apresentadora segurando o produto' : 'Sem marca d’água · PNG/JPG' }
            </span>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files?.[0])}
        />

        <div className="flex items-start gap-4">
          {preview ? (
            <button
              onClick={() => fileRef.current?.click()}
              className="relative w-40 h-40 rounded-2xl overflow-hidden border-2 border-primary-400 group shrink-0"
            >
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Trocar foto
              </span>
            </button>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-40 h-40 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.03] hover:border-primary-500/60 hover:bg-primary-600/5 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-primary-300 transition-all shrink-0"
            >
              <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className="text-xs font-semibold">Enviar foto</span>
            </button>
          )}

          <div className="flex-1">
            {recentImages.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-medium text-gray-500 mb-2">Ou use uma das suas criações:</p>
                <div className="flex gap-2 flex-wrap">
                  {recentImages.slice(0, 6).map((img, i) => (
                    <button
                      key={img.id || i}
                      onClick={() => handleSelectRecent(img.imageUrl)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        preview === img.imageUrl ? 'border-primary-500' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {preview && (
              <button
                onClick={() => { setPreview(''); setImageData(''); setImageUrl(''); }}
                className="text-xs text-gray-400 hover:text-red-400 font-medium mt-1"
              >
                ✕ Remover imagem
              </button>
            )}
          </div>
        </div>

        {/* Estilos de anúncio */}
        {mode !== 'talking' && (
          <div className="mt-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className={fieldLabel}>
                {mode === 'product' ? 'Estilo do anúncio em vídeo' : 'Estilo do vídeo'}
              </label>
              <a
                href={`https://www.pinterest.com/search/videos/?q=${encodeURIComponent(AD_STYLES.find((s) => s.key === preset)?.label.replace(' ', '') || 'anuncio de produto')}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary-300 hover:text-primary-200 font-medium underline underline-offset-2"
              >
                Ver exemplos no Pinterest →
              </a>
            </div>
            <div className="flex flex-wrap gap-2 mt-2.5">
              {AD_STYLES.map((st) => (
                <button
                  key={st.key}
                  onClick={() => setPreset(st.key)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all border ${
                    preset === st.key
                      ? 'bg-primary-600 text-white border-primary-600 shadow'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:border-primary-500/40'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2.5 leading-relaxed">
              O "Afiliado Shopee" é o estilo dos vídeos dos afiliados que vendem no marketplace. Se escrever um
              movimento próprio abaixo, ele vale mais que o estilo.
            </p>
          </div>
        )}

        {/* Campos do modo produto */}
        {mode === 'product' && (
          <div className="grid sm:grid-cols-3 gap-4 mt-6">
            <div>
              <label className={fieldLabel}>Nome do produto</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder='Ex: "Fritadeira Air Fryer 10L"'
                className="input"
              />
            </div>
            <div>
              <label className={fieldLabel}>Preço (opcional)</label>
              <input
                type="text"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                placeholder='Ex: "49,90"'
                className="input"
              />
            </div>
            <div>
              <label className={fieldLabel}>Vantagens (opcional)</label>
              <input
                type="text"
                value={productDesc}
                onChange={(e) => setProductDesc(e.target.value)}
                placeholder='Ex: "frita sem óleo, painel digital"'
                className="input"
              />
            </div>
          </div>
        )}

        {/* Campos do anúncio falado */}
        {mode === 'talking' && (
          <div className="mt-6">
            <div className="mb-4">
              <label className={fieldLabel}>Quem apresenta o produto?</label>
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  onClick={() => setPresenter('mulher')}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all border ${
                    presenter === 'mulher'
                      ? 'bg-primary-600 text-white border-primary-600 shadow'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:border-primary-500/40'
                  }`}
                >
                  Apresentadora
                </button>
                <button
                  onClick={() => setPresenter('homem')}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all border ${
                    presenter === 'homem'
                      ? 'bg-primary-600 text-white border-primary-600 shadow'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:border-primary-500/40'
                  }`}
                >
                  Apresentador
                </button>
                <span className="text-[11px] text-gray-500 self-center">Sempre uma pessoa bonita e carismática, estilo comercial de TV</span>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className={fieldLabel}>Nome do produto</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder='Ex: "Tênis Runner Plus"'
                  className="input"
                />
              </div>
              <div>
                <label className={fieldLabel}>Preço (opcional)</label>
                <input
                  type="text"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder='Ex: "89,90"'
                  className="input"
                />
              </div>
              <div>
                <label className={fieldLabel}>Vantagens (opcional)</label>
                <input
                  type="text"
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                  placeholder='Ex: "leve, confortável, ideal pra corrida"'
                  className="input"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className={fieldLabel}>Roteiro (opcional — a IA escreve se deixar em branco)</label>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                rows={3}
                placeholder="Ex: Olha só que achado! Esse tênis é leve, confortável e por só R$ 89,90. Corre que é por tempo limitado!"
                className="input resize-none"
              />
            </div>
          </div>
        )}

        {/* Movimento personalizado */}
        {mode === 'animate' && (
          <div className="mt-6">
            <label className={fieldLabel}>Movimento desejado (opcional)</label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: o produto gira lentamente mostrando os detalhes"
              className="input"
            />
          </div>
        )}
        {mode === 'product' && (
          <div className="mt-5">
            <label className={fieldLabel}>Movimento próprio (opcional, vale mais que o estilo)</label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='Ex: "câmera dá zoom rápido mostrando o produto chegando de trás"'
              className="input"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t border-white/10">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {mode === 'talking' ? 'Criando o anúncio falado (leva ~1 min)...' : 'Gerando (pode demorar)...'}
              </>
            ) : (
              <>
                {mode === 'talking'
                  ? <span>Criar anúncio falado (1 crédito)</span>
                  : mode === 'product'
                    ? <span>Criar anúncio (1 crédito)</span>
                    : <span>Gerar vídeo (1 crédito)</span>}
              </>
            )}
          </button>

          {user && (
            <span className="text-sm text-gray-400">
              <b className="text-gray-200">{credits}</b> créditos
            </span>
          )}
        </div>

        {loading && liveStatus && (
          <p className="mt-4 text-sm text-primary-300 font-medium animate-pulse flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-primary-400 animate-ping" />
            {liveStatus}
          </p>
        )}
      </div>

      {error && (
        <div className={`rounded-xl p-4 border ${error.type === 'NO_CREDITS' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <p className={`text-sm font-medium ${error.type === 'NO_CREDITS' ? 'text-amber-300' : 'text-red-300'}`}>
            {error.message}
          </p>
          {error.type === 'NO_CREDITS' && (
            <a href="/plans" className="inline-block mt-2 text-sm text-primary-300 font-semibold hover:underline">
              Ver planos e recargas →
            </a>
          )}
        </div>
      )}

      {result?.videoUrl && (
        <div className="card card-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">
              {mode === 'product' ? 'Anúncio do produto criado!' : mode === 'talking' ? 'Anúncio falado criado!' : 'Vídeo gerado'}
            </h3>
            <button onClick={handleDownload} className="text-sm text-primary-300 hover:text-primary-200 font-medium flex items-center gap-1">
              Baixar
            </button>
          </div>
          <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
            <video src={result.videoUrl} controls className="w-full h-auto max-h-[500px]" />
          </div>
          {result?.script && (
            <p className="mt-3 text-sm text-gray-400">Roteiro: <b className="text-gray-200">&quot;{result.script}&quot;</b></p>
          )}
          {productName && <p className="mt-2 text-sm text-gray-400">Anúncio para: <b className="text-gray-200">{productName}</b></p>}
          {preset && mode === 'product' && !prompt.trim() && (
            <p className="mt-1 text-sm text-gray-400">Estilo: <b className="text-gray-200">{AD_STYLES.find((s) => s.key === preset)?.label || preset}</b></p>
          )}
          {prompt && mode !== 'talking' && <p className="mt-1 text-sm text-gray-400 italic">&quot;{prompt}&quot;</p>}
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-dark-900 rounded-2xl p-8 max-w-md w-full border border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Crie sua conta gratuita</h3>
            <p className="text-gray-400 mb-6">Ganhe 2 vídeos grátis todo mês. Sem cartão de crédito.</p>
            <div className="space-y-3">
              <a href="/register" className="btn-primary block text-center">Criar conta grátis</a>
              <a href="/login" className="btn-secondary block text-center">Já tenho conta</a>
            </div>
            <button onClick={() => setShowLoginModal(false)} className="mt-4 text-sm text-gray-500 hover:text-gray-300 w-full">
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}