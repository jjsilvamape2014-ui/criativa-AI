'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Header from '@/components/Header';

export default function PlansPage() {
  const [user, setUser] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState(null);

  useEffect(() => {
    api.getCreditPackages().then(setPackages).catch(() => {});
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

  const handleBuyCredits = async (packageId) => {
    if (!user) {
      window.location.href = '/register';
      return;
    }
    setLoading(true);
    try {
      const data = await api.createCheckoutSession('credits', packageId);
      window.location.href = data.url;
    } catch (err) {
      alert('Erro ao iniciar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const creditPackages = [
    { id: 'credits_50', name: 'Pacote Básico', images: 50, videos: 0, price: 'R$ 9,00', priceCents: 900 },
    { id: 'credits_150', name: 'Pacote Pro', images: 150, videos: 10, price: 'R$ 19,00', priceCents: 1900 },
    { id: 'credits_500', name: 'Pacote Ultra', images: 500, videos: 50, price: 'R$ 49,00', priceCents: 4900 },
  ];

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8 pt-36">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">Escolha seu plano</h1>
          <p className="text-gray-400">Comece grátis. Quando os créditos acabarem, é só R$ 39,99/mês.</p>
        </div>

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
              <li className="flex items-center gap-2">Créditos grátis de imagem</li>
              <li className="flex items-center gap-2">Resolução 4K</li>
              <li className="flex items-center gap-2">Sem watermark</li>
              <li className="flex items-center gap-2">Texto em português nítido</li>
              <li className="flex items-center gap-2 text-gray-500">Ao acabar os créditos, assina o Premium</li>
            </ul>
            {user?.plan === 'FREE' ? (
              user?.creditsImages + user?.creditsPurchased > 0 ? (
                <a href="/" className="btn-secondary block text-center text-sm">Usar meus créditos gratuitos</a>
              ) : (
                <a href="/logout" className="btn-secondary block text-center text-sm">Créditos esgotados</a>
              )
            ) : (
              <a href="/register" className="btn-secondary block text-center text-sm">Começar grátis</a>
            )}
          </div>

          {/* Premium */}
          <div className={`card border-2 border-primary-500 relative`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              SEM LIMITES
            </div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Premium</h3>
              {user?.plan === 'PREMIUM' && <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full font-bold">ATUAL</span>}
            </div>
            <p className="text-4xl font-bold text-primary-400 mb-1">R$ 39,99<span className="text-base font-normal text-gray-400">/mês</span></p>
            <p className="text-sm text-gray-400 mb-6">Crie sem limites, quando quiser</p>
            <ul className="space-y-3 text-sm text-gray-300 mb-6">
              <li className="flex items-center gap-2">Imagens ilimitadas em 4K</li>
              <li className="flex items-center gap-2">Todos os estilos de anúncio</li>
              <li className="flex items-center gap-2">Modelos exclusivos premium</li>
              <li className="flex items-center gap-2">Upscale 4K automático</li>
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
                {loading ? 'Processando...' : 'Assinar Premium — R$ 39,99/mês'}
              </button>
            )}
          </div>
        </div>

        {/* Créditos avulsos */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center text-white mb-2">Ou compre créditos avulsos</h2>
          <p className="text-center text-gray-400 text-sm mb-8">Não expiram. Use quando quiser.</p>

          <div className="grid md:grid-cols-3 gap-4">
            {creditPackages.map(pkg => (
              <div key={pkg.id} className="card text-center">
                <h4 className="font-semibold text-white mb-1">{pkg.name}</h4>
                <p className="text-3xl font-bold text-white mb-2">{pkg.price}</p>
                <ul className="space-y-1 text-sm text-gray-400 mb-4">
                  <li>{pkg.images} imagens</li>
                  <li className="text-green-400 font-medium">Não expira</li>
                </ul>
                <button
                  onClick={() => handleBuyCredits(pkg.id)}
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
              { q: 'O plano Free é grátis mesmo?', a: 'Sim! Você ganha créditos gratuitos para começar a criar. Quando os créditos acabarem, o app te mostra a assinatura Premium de R$ 39,99/mês para continuar.' },
              { q: 'O que acontece quando meus créditos gratuitos acabam?', a: 'Você vê a tela de assinatura do Premium por R$ 39,99/mês. Ao assinar, passa a gerar imagens sem limites durante o mês.' },
              { q: 'Posso cancelar o Premium a qualquer momento?', a: 'Sim. Você continua com os benefícios até o fim do período pago.' },
              { q: 'Precisa de cartão de crédito para o plano Free?', a: 'Não. O plano Free é 100% gratuito, sem cartão e sem compromisso.' },
              { q: 'Posso usar as imagens comercialmente?', a: 'Sim. Todas as imagens geradas são suas. Use onde quiser, sem restrições.' },
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
