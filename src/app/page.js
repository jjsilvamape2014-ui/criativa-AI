'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import LandingGenerator from '@/components/LandingGenerator';
import ImageSlot from '@/components/ImageSlot';
import { setAuthTokenCookie } from '@/lib/auth-cookie';

const GALLERY = [
  { cat: 'Anúncio de produto', prompt: 'Anúncio de hambúrguer artesanal com o preço R$ 29,90 e a chamada Peça já', src: '/showcase/anuncio-hamburguer.webp' },
  { cat: 'Post para feed', prompt: 'Post quadrado com a frase Promoção de Setembro, fundo laranja', src: '/showcase/post-feed.webp' },
  { cat: 'Logotipo', prompt: 'Logotipo para a marca Padaria São João, traço minimalista', src: '/showcase/logo-padaria.webp' },
  { cat: 'Capa de vídeo', prompt: 'Thumbnail com o título Como Vender Mais no Instagram', src: '/showcase/capa-video.webp' },
  { cat: 'Foto de perfil', prompt: 'Retrato profissional, fundo neutro, luz suave de estúdio', src: '/showcase/foto-perfil.webp' },
  { cat: 'Arte de parede', prompt: 'Composição abstrata em tons terrosos, formato retrato', src: '/showcase/arte-parede.webp' },
];

const STYLES = [
  { name: 'Anúncio de produto', sub: 'preço em destaque', prompt: 'Anúncio de açaí com o preço R$ 12,90 em destaque, fundo roxo', src: '/showcase/estilo-anuncio.webp' },
  { name: 'Logotipo', sub: 'nome escrito certo', prompt: 'Logotipo minimalista para a marca Açaí do Norte, traço limpo', src: '/showcase/estilo-logo.webp' },
  { name: 'Post para feed', sub: 'chamada legível', prompt: 'Post quadrado com a chamada Promoção de Setembro, tipografia forte', src: '/showcase/estilo-post.webp' },
  { name: 'Capa de vídeo', sub: 'título grande', prompt: 'Capa de vídeo com o título Como Abrir Sua Loja, alto contraste', src: '/showcase/estilo-capa.webp' },
  { name: 'Foto de perfil', sub: 'retrato profissional', prompt: 'Retrato profissional em fundo neutro, luz suave de estúdio', src: '/showcase/estilo-perfil.webp' },
  { name: 'Arte de parede', sub: 'quadro decorativo', prompt: 'Arte abstrata em tons terrosos para quadro decorativo grande', src: '/showcase/estilo-arte.webp' },
];

function HeadingLabel({ children }) {
  return (
    <span className="text-xs font-semibold uppercase text-brand-accent" style={{ letterSpacing: '1.4px' }}>
      {children}
    </span>
  );
}

function SectionHead({ label, title, right }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-brand-border">
      <div>
        <HeadingLabel>{label}</HeadingLabel>
        <h2 className="mt-3 font-display font-bold text-brand-text text-[34px] leading-[1.05]" style={{ letterSpacing: '-1.8px' }}>
          {title}
        </h2>
      </div>
      {right && (
        <p className="text-[14px] text-brand-tert max-w-[330px] leading-relaxed" style={{ textWrap: 'pretty' }}>
          {right}
        </p>
      )}
    </div>
  );
}

export default function Home() {
  const [heroPrompt, setHeroPrompt] = useState('');
  const [logged, setLogged] = useState(false);
  const genWrapRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthTokenCookie(token);
        window.location.replace('/dashboard');
        return;
      }
      setLogged(false);
    }
  }, []);

  const pickStyle = useCallback((prompt) => {
    setHeroPrompt(prompt);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('criai:set-prompt', { detail: { prompt } }));
    }
    if (genWrapRef.current) {
      genWrapRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans">
      {/* NAV */}
      <nav className="flex items-center justify-between px-10 py-5 max-w-[1180px] mx-auto">
        <a href="/" className="font-display font-extrabold text-[17px] text-brand-text">
          CRIATIVA<span className="text-brand-accent">.</span>AI
        </a>
        <div className="flex items-center gap-[26px]">
          <a href="/plans" className="text-[14px] text-brand-tert hover:text-brand-text transition-colors">Planos</a>
          {logged ? (
            <a href="/dashboard" className="rounded-[8px] bg-brand-text px-[18px] py-[9px] text-[14px] font-semibold text-brand-bg hover:opacity-90 transition-opacity">
              Criar imagem
            </a>
          ) : (
            <>
              <a href="/login" className="text-[14px] text-brand-tert hover:text-brand-text transition-colors">Entrar</a>
              <a href="/register" className="rounded-[8px] bg-brand-text px-[18px] py-[9px] text-[14px] font-semibold text-brand-bg hover:opacity-90 transition-opacity">
                Criar conta
              </a>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="px-10 max-w-[1180px] mx-auto pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1.02fr_.98fr] gap-14 items-center">
          {/* Esquerda */}
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-brand-borderStrong py-1.5 pr-4 pl-1.5">
              <span className="w-[6px] h-[6px] rounded-full bg-brand-accent" />
              <span className="text-[12px] text-brand-tert">Ideogram e FLUX Pro</span>
            </div>

            <h1
              className="mt-6 font-display font-extrabold text-brand-text text-[60px] leading-[1.02] max-w-[560px]"
              style={{ letterSpacing: '-2.4px', textWrap: 'balance' }}
            >
              Texto em português que sai <span className="text-brand-accent">escrito certo.</span>
            </h1>

            <p className="mt-6 text-[17px] text-brand-sub max-w-[440px] leading-relaxed" style={{ textWrap: 'pretty' }}>
              Pôster, anúncio e logotipo em 4K com acentuação e ortografia corretas — o que a maioria das IAs de imagem ainda erra. 10 imagens grátis por mês, sem cartão.
            </p>

            <div className="mt-8" ref={genWrapRef}>
              <LandingGenerator initialPrompt={heroPrompt} />
            </div>
          </div>

          {/* Direita */}
          <div className="relative">
            <ImageSlot src="/showcase/hero-acai.webp" label="Saída da IA: pôster de açaí com texto em português" aspect="4/5" className="border-brand-borderStrong" />
            <div className="absolute -left-[22px] bottom-[-14px] max-w-[270px] rounded-[11px] border border-brand-borderStrong bg-brand-surface p-4">
              <p className="text-[11px] uppercase text-brand-dim" style={{ letterSpacing: '1px' }}>Prompt</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#DDD6CF]" style={{ textWrap: 'pretty' }}>
                “Pôster de açaí com o preço R$ 12,90 em destaque, fundo roxo, tipografia forte”
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DIFERENCIAL: ANÚNCIO FALADO */}
      <section className="px-10 max-w-[1180px] mx-auto pt-20">
        <SectionHead
          label="Nosso diferencial"
          title="Uma apresentadora IA vende o seu produto falando"
          right="Nenhuma outra ferramenta faz isso: você manda a foto do produto e recebe um vídeo com voz, roteiro e lábios sincronizados em português."
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 items-center">
          {/* Vídeo de demonstração */}
          <div className="relative rounded-[18px] border border-brand-border overflow-hidden bg-black">
            <video
              src="/showcase/talking-demo.mp4"
              poster="/showcase/capa-video.webp"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="w-full aspect-[4/5] object-cover"
            />
            <span className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur px-3 py-1.5 text-[11px] font-semibold text-white">
              Exemplo do Anúncio Falado
            </span>
            <span className="absolute bottom-3 left-3 rounded-full bg-brand-accent px-3 py-1.5 text-[11px] font-bold text-brand-bg">
              A voz fala o roteiro em português
            </span>
          </div>

          {/* Lado a lado do que a ferramenta faz */}
          <div className="flex flex-col gap-4">
            <div className="rounded-[14px] border border-brand-border bg-brand-surface p-5 flex gap-4 items-start">
              <span className="text-2xl"></span>
              <div>
                <p className="text-[15px] font-semibold text-brand-text">Você envia a foto do produto</p>
                <p className="mt-1 text-[13px] text-brand-tert leading-relaxed">Tênis, fritadeira, moda, eletrônico — o que você vende, a IA mostra na mão da apresentadora.</p>
              </div>
            </div>
            <div className="rounded-[14px] border border-brand-border bg-brand-surface p-5 flex gap-4 items-start">
              <span className="text-2xl"></span>
              <div>
                <p className="text-[15px] font-semibold text-brand-text">A IA escreve o roteiro e gera a voz</p>
                <p className="mt-1 text-[13px] text-brand-tert leading-relaxed">Nome, preço e vantagens do anúncio viram uma narração animada em português. Você também pode escrever do seu jeito.</p>
              </div>
            </div>
            <div className="rounded-[14px] border border-brand-border bg-brand-surface p-5 flex gap-4 items-start">
              <span className="text-2xl"></span>
              <div>
                <p className="text-[15px] font-semibold text-brand-text">Pronto pra postar no Shopee e TikTok</p>
                <p className="mt-1 text-[13px] text-brand-tert leading-relaxed">Vídeo vertical, com a apresentadora olhando pra câmera e falando o roteiro — igual ao dos grandes afiliados.</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (typeof window === 'undefined') return;
                window.dispatchEvent(new CustomEvent('criai:open-video'));
                genWrapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="mt-1 rounded-[12px] bg-brand-accent w-full py-[14px] text-[14px] font-bold text-brand-bg hover:bg-brand-accentHover transition-colors"
            >
              Criar o meu anúncio falado →
            </button>
          </div>
        </div>
      </section>

      {/* COMPARATIVO */}
      <section className="px-10 max-w-[1180px] mx-auto pt-20">
        <SectionHead
          label="O mesmo prompt, duas IAs"
          title="Onde as outras erram a acentuação"
          right="Compare você mesmo. Mesmo texto, mesma descrição, resultados lado a lado."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div>
            <ImageSlot src="/showcase/comp-outra.webp" label="Outra IA: acentuação errada" />
            <div className="mt-3 flex items-center gap-3">
              <span className="rounded-md border border-brand-borderStrong px-2.5 py-1 text-xs text-brand-tert">Outra IA</span>
              <span className="text-sm text-brand-tert">acentuação e letras trocadas</span>
            </div>
          </div>
          <div>
            <ImageSlot src="/showcase/comp-criativa.webp" label="Criativa AI: frase correta" className="border-brand-accent" />
            <div className="mt-3 flex items-center gap-3">
              <span className="rounded-md bg-brand-accent px-2.5 py-1 text-xs font-medium text-brand-bg">Criativa AI</span>
              <span className="text-sm text-brand-tert">frase correta, pronta para publicar</span>
            </div>
          </div>
        </div>
        <p className="mt-6 text-center text-[13px] text-brand-dim">
          Prompt usado nas duas: “cartaz com a frase Promoção de Setembro em português”
        </p>
      </section>

      {/* GALERIA */}
      <section className="px-10 max-w-[1180px] mx-auto pt-20">
        <SectionHead
          label="Feito com a Criativa"
          title="Saídas reais, prompt à mostra"
          right="Cada imagem com a descrição que a gerou."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {GALLERY.map((g, i) => (
            <div key={i} className="rounded-[14px] border border-brand-border bg-brand-surface overflow-hidden">
              <ImageSlot src={g.src} label={g.prompt} styleRadius={false} />
              <div className="px-[15px] pt-[13px] pb-[15px]">
                <p className="text-[11px] font-semibold uppercase text-brand-accent" style={{ letterSpacing: '1px' }}>{g.cat}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-brand-sub" style={{ textWrap: 'pretty' }}>“{g.prompt}”</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ESTILOS */}
      <section className="px-10 max-w-[1180px] mx-auto pt-20">
        <SectionHead label="Comece por um estilo" title="Para quem vende algo" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          {STYLES.map((s, i) => (
            <button
              key={i}
              onClick={() => pickStyle(s.prompt)}
              className="rounded-[12px] border border-brand-border bg-brand-surface p-2 text-left hover:border-brand-accent transition-colors"
            >
              <ImageSlot src={s.src} label={s.name} styleRadius={false} className="rounded-[8px]" />
              <p className="mt-2 px-1 text-[13px] font-semibold text-brand-text">{s.name}</p>
              <p className="px-1 pb-1 text-[11px] text-brand-dim">{s.sub}</p>
            </button>
          ))}
        </div>
      </section>

      {/* PREÇOS */}
      <section className="px-10 max-w-[1180px] mx-auto pt-20">
        <div className="text-center">
          <h2 className="font-display font-extrabold text-brand-text text-[40px] leading-[1.05]" style={{ letterSpacing: '-2px' }}>
            Dois planos, sem pegadinha
          </h2>
          <p className="mt-3 text-[16px] text-brand-tert">Uma única foto licenciada em banco de imagens custa mais que um mês inteiro aqui.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.08fr] gap-4 max-w-[840px] mx-auto mt-10">
          {/* Gratuito */}
          <div className="rounded-[16px] border border-brand-border bg-brand-surface p-[26px]">
            <p className="text-[14px] font-semibold text-brand-tert">Gratuito</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display font-extrabold text-brand-text text-[42px]" style={{ letterSpacing: '-1.6px' }}>R$ 0</span>
              <span className="text-[14px] text-brand-dim">para sempre</span>
            </div>
            <ul className="mt-6 space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5 text-brand-sub"><span className="text-brand-green">✓</span> 10 imagens por mês em 4K</li>
              <li className="flex items-center gap-2.5 text-brand-sub"><span className="text-brand-green">✓</span> Sem watermark</li>
              <li className="flex items-center gap-2.5 text-brand-sub"><span className="text-brand-green">✓</span> Texto em português nítido</li>
              <li className="flex items-center gap-2.5 text-brand-dim"><span className="text-brand-red">✗</span> Imagens ilimitadas</li>
              <li className="flex items-center gap-2.5 text-brand-dim"><span className="text-brand-red">✗</span> Modelos premium e prioridade na fila</li>
            </ul>
            <a href="/register" className="mt-8 block w-full rounded-[10px] border border-[#3A343A] py-3 text-center text-sm font-semibold text-brand-text hover:border-brand-borderStrong transition-colors">
              Começar grátis
            </a>
          </div>

          {/* Premium */}
          <div className="relative rounded-[16px] border border-brand-accent bg-[#17110E] p-[26px]">
            <span className="absolute -top-[11px] left-[26px] rounded-full bg-brand-accent px-3 py-[3px] text-[11px] font-bold uppercase text-brand-bg">
              Sem limites
            </span>
            <p className="text-[14px] font-semibold text-brand-accent">Premium</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display font-extrabold text-brand-text text-[42px]" style={{ letterSpacing: '-1.6px' }}>R$ 39,99</span>
              <span className="text-[14px] text-brand-tert">por mês</span>
            </div>
            <ul className="mt-6 space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5 text-brand-sub"><span className="text-brand-accent">✓</span> Imagens ilimitadas em 4K</li>
              <li className="flex items-center gap-2.5 text-brand-sub"><span className="text-brand-accent">✓</span> Todos os estilos de anúncio</li>
              <li className="flex items-center gap-2.5 text-brand-sub"><span className="text-brand-accent">✓</span> Modelos exclusivos premium</li>
              <li className="flex items-center gap-2.5 text-brand-sub"><span className="text-brand-accent">✓</span> Upscale 4K automático</li>
              <li className="flex items-center gap-2.5 text-brand-sub"><span className="text-brand-accent">✓</span> Sem fila — prioridade máxima</li>
            </ul>
            <a href="/plans" className="mt-8 block w-full rounded-[10px] bg-brand-accent py-3 text-center text-sm font-semibold text-brand-bg hover:bg-brand-accentHover transition-colors">
              Assinar Premium
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-[13px] text-brand-dim">Cancele quando quiser · Sem watermark em nenhum plano</p>
      </section>

      {/* CTA FINAL */}
      <section className="px-10 max-w-[1180px] mx-auto pt-20">
        <div className="rounded-[18px] border border-brand-borderStrong bg-brand-surface px-10 py-[52px] text-center">
          <h2 className="font-display font-extrabold text-brand-text text-[38px] leading-[1.05]" style={{ letterSpacing: '-2px' }}>
            Escreva em português. Receba em 4K.
          </h2>
          <p className="mt-3 text-[16px] text-brand-tert">10 imagens grátis por mês, sem cartão.</p>
          <a href="/register" className="mt-6 inline-block rounded-[10px] bg-brand-accent px-[30px] py-[15px] text-[14px] font-semibold text-brand-bg hover:bg-brand-accentHover transition-colors">
            Criar conta grátis
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-[80px] border-t border-brand-border px-10 py-[26px]">
        <div className="max-w-[1180px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-display font-extrabold text-[14px] text-brand-tert">
            CRIATIVA<span className="text-brand-accent">.</span>AI
          </span>
          <span className="text-[12px] text-brand-dim">© 2026 Criativa AI · Todos os direitos reservados</span>
        </div>
      </footer>
    </div>
  );
}
