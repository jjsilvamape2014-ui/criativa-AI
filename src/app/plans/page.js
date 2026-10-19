'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Header from '@/components/Header';

// Nada de preço ou id de pacote escrito à mão aqui: tudo vem de /api/credits/plans
// (plans.js no backend). Era exatamente esse desencontro — a tela mandava
// `credits_50` e o servidor só conhecia `credits_30` — que fazia TODO botão de
// compra responder "Pacote inválido".
export default function PlansPage() {
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    api.getPlans().then(setPlans).catch(() => setErro('Não consegui carregar os planos agora. Recarregue a página.'));
    const token = localStorage.getItem('token');
    if (token) {
      api.getProfile().then(setUser).catch(() => {});
    }
  }, []);

  const handleSubscribe = async () => {
    if (!user) {
      window.location.href = '/register';
      return;
    }
    setLoading(true);
    try {
      const data = await api.createCheckoutSession('subscription');
      window.location.href = data.url;
    } catch (err) {
      alert('Erro ao iniciar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (pkg) => {
    if (!user) {
      window.location.href = '/register';
      return;
    }
    setLoading(true);
    try {
      const data = await api.createCheckoutSession(pkg.kind === 'video' ? 'video' : 'credits', pkg.id);
      window.location.href = data.url;
    } catch (err) {
      alert(err?.message || 'Erro ao iniciar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const premiumPreco = plans?.premium?.priceFormatted || 'R$ 39,90';
  const pacotesImagem = plans?.packages || [];
  const pacotesVideo = plans?.videoPackages || [];
  const semSaldoImagem = user && user.plan === 'FREE' && (user.creditsImages || 0) + (user.creditsPurchased || 0) <= 0;

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8 pt-36">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">Escolha seu plano</h1>
          <p className="text-gray-400">Comece grátis. Quando os créditos acabarem, é só {premiumPreco}/mês.</p>
        </div>

        {erro && (
          <div className="max-w-3xl mx-auto mb-8 card border-2 border-amber-500/40 text-amber-200 text-sm text-center">
            {erro}
          </div>
        )}

        {/* Planos */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
          {/* Free */}
          <div className={`card border-2 ${user?.plan === 'FREE' ? 'border-primary-500' : 'border-white/10'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Gratuito</h3>
              {user?.plan === 'FREE' && <span className="text-xs bg-primary-500/20 text-primary-300 px-2 py-1 rounded-full font-bold">ATUAL</span>}
            </div>
            <p className="text-4xl font-bold text-white mb-1">R$ 0<span className="text-base font-normal text-gray-400"> Limitado</span></p>
            <p className="text-sm text-gray-400 mb-6">Teste tudo sem pagar nada</p>
            <ul className="space-y-3 text-sm text-gray-300 mb-6">
              <li className="flex items-center gap-2">{plans?.free?.images ?? 10} imagens por mês</li>
              <li className="flex items-center gap-2">{plans?.free?.videoSeconds ?? 5} s de vídeo por mês</li>
              <li className="flex items-center gap-2">Sem watermark</li>
              <li className="flex items-center gap-2">Texto em português nítido</li>
              <li className="flex items-center gap-2 text-gray-500">Ao acabar, assine o Premium ou compre um pacote</li>
            </ul>
            {user?.plan === 'FREE' ? (
              semSaldoImagem ? (
                <a href="/plans#pacotes" className="btn-secondary block text-center text-sm">Créditos esgotados — comprar</a>
              ) : (
                <a href="/" className="btn-secondary block text-center text-sm">Usar meus créditos gratuitos</a>
              )
            ) : (
              <a href="/register" className="btn-secondary block text-center text-sm">Começar grátis</a>
            )}
          </div>

          {/* Premium */}
          <div className={`card border-2 border-primary-500 relative`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              MELHOR CUSTO
            </div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Premium</h3>
              {user?.plan === 'PREMIUM' && <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full font-bold">ATUAL</span>}
            </div>
            <p className="text-4xl font-bold text-primary-400 mb-1">{premiumPreco}<span className="text-base font-normal text-gray-400">/mês</span></p>
            <p className="text-sm text-gray-400 mb-6">Mais imagens e mais vídeo, todo mês</p>
            <ul className="space-y-3 text-sm text-gray-300 mb-6">
              <li className="flex items-center gap-2">{plans?.premium?.images ?? 50} imagens por mês</li>
              <li className="flex items-center gap-2">{plans?.premium?.videoSeconds ?? 15} s de vídeo por mês</li>
              <li className="flex items-center gap-2">Todos os estilos de anúncio</li>
              <li className="flex items-center gap-2">Todos os presets de câmera</li>
              <li className="flex items-center gap-2">Sem fila — prioridade máxima</li>
              <li className="flex items-center gap-2">Suporte prioritário</li>
            </ul>
            {user?.plan === 'PREMIUM' ? (
              <button disabled className="w-full py-3 rounded-xl bg-white/5 text-gray-500 font-semibold cursor-default">
                Plano atual
              </button>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? 'Processando...' : `Assinar Premium — ${premiumPreco}/mês`}
              </button>
            )}
          </div>
        </div>

        {/* Pacotes de vídeo */}
        <div id="pacotes" className="max-w-4xl mx-auto mb-12">
          <h2 className="text-xl font-bold text-center text-white mb-2">Pacotes de vídeo</h2>
          <p className="text-center text-gray-400 text-sm mb-8">
            Vídeos de 5 segundos, com movimento de câmera. Não expiram e os créditos também servem para imagens.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {pacotesVideo.length === 0 && (
              <p className="text-center text-gray-500 text-sm md:col-span-3">Carregando pacotes…</p>
            )}
            {pacotesVideo.map((pkg) => (
              <div key={pkg.id} className="card text-center border-2 border-white/10">
                <h4 className="font-semibold text-white mb-1">{pkg.name}</h4>
                <p className="text-3xl font-bold text-white mb-2">{pkg.priceFormatted}</p>
                <ul className="space-y-1 text-sm text-gray-400 mb-4">
                  <li className="text-white font-medium">{pkg.clips} vídeos de 5 s</li>
                  <li>{pkg.pricePerClipFormatted} por vídeo</li>
                  <li className="text-gray-500">{pkg.credits} créditos</li>
                  <li className="text-green-400 font-medium">Não expira</li>
                </ul>
                <button
                  onClick={() => handleBuy(pkg)}
                  disabled={loading}
                  className="btn-primary w-full text-sm disabled:opacity-50"
                >
                  Comprar vídeos
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Créditos avulsos */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center text-white mb-2">Créditos avulsos</h2>
          <p className="text-center text-gray-400 text-sm mb-8">Não expiram. Use quando quiser — em imagem ou vídeo.</p>

          <div className="grid md:grid-cols-3 gap-4">
            {pacotesImagem.map((pkg) => (
              <div key={pkg.id} className="card text-center">
                <h4 className="font-semibold text-white mb-1">{pkg.name}</h4>
                <p className="text-3xl font-bold text-white mb-2">{pkg.priceFormatted}</p>
                <ul className="space-y-1 text-sm text-gray-400 mb-4">
                  <li>{pkg.images} imagens</li>
                  <li>ou {pkg.videos} vídeos de 5 s</li>
                  <li className="text-green-400 font-medium">Não expira</li>
                </ul>
                <button
                  onClick={() => handleBuy(pkg)}
                  disabled={loading}
                  className="btn-secondary w-full text-sm disabled:opacity-50"
                >
                  Comprar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dúvidas */}
        <div className="max-w-2xl mx-auto mt-16">
          <h2 className="text-lg font-bold text-white mb-4 text-center">Perguntas frequentes</h2>
          <div className="space-y-3">
            {[
              { q: 'O plano Free é grátis mesmo?', a: `Sim! Você ganha ${plans?.free?.images ?? 10} imagens e ${plans?.free?.videoSeconds ?? 5} s de vídeo para começar. Quando acabar, dá para assinar o Premium ou comprar um pacote de créditos.` },
              { q: 'O que acontece quando meus créditos gratuitos acabam?', a: `Você decide: assinar o Premium (${premiumPreco}/mês, com ${plans?.premium?.images ?? 50} imagens e ${plans?.premium?.videoSeconds ?? 15} s de vídeo por mês) ou comprar créditos avulsos, que não vencem.` },
              { q: 'Como funciona o crédito de vídeo?', a: `Um vídeo de 5 segundos usa ${plans?.videoCreditsPer5s ?? 10} créditos. Vídeos mais longos usam na proporção (10 s = ${(plans?.videoCreditsPer5s ?? 10) * 2} créditos). O mesmo crédito comprado serve para gerar imagens.` },
              { q: 'Posso cancelar o Premium a qualquer momento?', a: 'Sim. Você continua com os benefícios até o fim do período pago e não perde os créditos comprados.' },
              { q: 'Precisa de cartão de crédito para o plano Free?', a: 'Não. O plano Free é 100% gratuito, sem cartão e sem compromisso.' },
              { q: 'Posso usar as imagens e os vídeos comercialmente?', a: 'Sim. Tudo que você gera é seu. Use onde quiser, sem restrições.' },
            ].map((item, i) => (
              <details key={i} className="card py-4 cursor-pointer">
                <summary className="font-medium text-white list-none flex justify-between items-center">
                  {item.q}
                  <span className="text-gray-400 text-lg">+</span>
                </summary>
                <p className="text-sm text-gray-400 mt-3">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
