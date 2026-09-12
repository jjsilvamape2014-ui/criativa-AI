'use client';

import { useState, useRef } from 'react';
import { api } from '@/lib/api';

const STYLES = [
  {
    id: 'classico',
    icon: '',
    title: 'Clássico',
    desc: 'Foto em destaque, nome e número grandes. O que todo mundo reconhece.',
  },
  {
    id: 'moderno',
    icon: '',
    title: 'Moderno 2026',
    desc: 'Número gigante em primeiro plano e layout arrojado.',
  },
  {
    id: 'institucional',
    icon: '',
    title: 'Institucional',
    desc: 'Camisa oficial de campanha e fundo na cor partidária, visual de assessoria.',
  },
  {
    id: 'tiara',
    icon: '',
    title: 'Foto tiara',
    desc: 'Retrato grande no topo com o número em destaque embaixo.',
  },
  {
    id: 'faixa',
    icon: '',
    title: 'Faixa partidária',
    desc: 'Faixa de cor atravessando o card, tipografia forte e ousada.',
  },
  {
    id: 'cracha',
    icon: '',
    title: 'Crachá',
    desc: 'Foto central com a tag do nome por baixo, estilo "João Carlos Mello".',
  },
  {
    id: 'verso',
    icon: '',
    title: 'Frente e verso',
    desc: 'Gera a frente do santinho e a parte de trás com propostas, voto e coligação.',
  },
];

const CORES_CAMPANHA = [
  { id: 'verde', label: 'Verde (exemplo pesquisado)', phrase: 'verde e amarelo vibrante' },
  { id: 'azul', label: 'Azul', phrase: 'azul e branco' },
  { id: 'vermelho', label: 'Vermelho', phrase: 'vermelho e branco' },
  { id: 'amarelo', label: 'Amarelo / Ouro', phrase: 'amarelo ouro e preto' },
  { id: 'laranja', label: 'Laranja', phrase: 'laranja e branco' },
];

const CARGO = ['Prefeito(a)', 'Vereador(a)', 'Presidente', 'Governador(a)', 'Senador(a)', 'Deputado(a) Federal', 'Deputado(a) Estadual', 'Deputado(a) Distrital'];

export default function CardDeCandidatoPage() {
  const [foto, setFoto] = useState(null);
  const [nomeUrna, setNomeUrna] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [cargo, setCargo] = useState(CARGO[0]);
  const [cidade, setCidade] = useState('');
  const [numero, setNumero] = useState('');
  const [coligacao, setColigacao] = useState('');
  const [slogan, setSlogan] = useState('');
  const [propostas, setPropostas] = useState('');
  const [estilo, setEstilo] = useState('classico');
  const [cor, setCor] = useState('verde');
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  const readFoto = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => setFoto(e.target.result);
    if (file) reader.readAsDataURL(file);
  };

  const buildArgs = () => {
    const cargoTx = cargo === 'Presidente'
      ? 'Presidente da República'
      : `${cargo} de ${cidade.trim() || 'sua cidade'}`;
    const colors = (CORES_CAMPANHA.find((c) => c.id === cor) || CORES_CAMPANHA[0]).phrase;
    const colig = coligacao.trim() ? `, coligação "${coligacao.trim()}"` : '';
    const base = {
      photo: foto,
      urn: nomeUrna.trim(),
      cargo: cargo,
      cargoTx,
      city: cidade.trim(),
      num: numero.trim(),
      slogan: slogan.trim(),
      colig: colig,
      colors,
      year: '2026',
    };
    return base;
  };

  const buildFrontPrompt = (a) => {
    const hero =
      a.photo
        ? 'retrato do candidato da foto de referência em destaque (rosto idêntico)'
        : 'retrato profissional de candidato(a) sorridente com traje social, sorriso confiante';
    const camisa =
      'candidato vestindo camisa de campanha na cor oficial com o nome e número em pequeno detalhe no peito';
    const nomeBig = `nome de urna "${a.urn}" em letras grandes e bem legíveis`;
    const numBig = `NÚMERO ${a.num} em destaque grande e exato`;
    const common = [
      'ano 2026',
      a.colig,
      `paleta de campanha em ${a.colors}`,
      'ultra sharp e nítido para impressão, cara limpa (clean), bordas vetoriais, alta definição profissional',
      'tipografia forte estilo material oficial de urna, layout vertical limpo e profissional, todo o texto perfeitamente escrito em português, sem erros, sem letras inventadas',
    ];
    const lead = {
      classico: [
        'Card político vertical tipo "santinho" de campanha eleitoral 2026',
        `${hero} centralizado`,
        nomeBig,
        `cargo ${a.cargoTx}`,
      ],
      moderno: [
        'Card político vertical de campanha 2026, conceito ARROJADO estilo numerão:',
        `o NÚMERO ${a.num} GIGANTE em primeiro plano`,
        hero,
        nomeBig,
        `cargo ${a.cargoTx}`,
      ],
      institucional: [
        'Card político vertical de campanha 2026, visual INSTITUCIONAL de assessoria de comunicação:',
        hero,
        camisa,
        `fundo com faixa de cor ${a.colors} e bandeira/mapa da cidade em degradê`,
        nomeBig,
        `cargo ${a.cargoTx}`,
      ],
      tiara: [
        'Card político vertical de campanha 2026, layout FOTO TIARA:',
        `${hero} grande no topo em retrato 3:4`,
        `número ${a.num} grande centralizado na metade inferior`,
        nomeBig,
        `cargo ${a.cargoTx}`,
      ],
      faixa: [
        'Card político vertical de campanha 2026, layout FAIXA PARTIDÁRIA:',
        `faixa diagonal larga em ${a.colors} atravessando o card`,
        hero,
        nomeBig,
        `número ${a.num} em tipografia ousada`,
        `cargo ${a.cargoTx}`,
      ],
      cracha: [
        'Card político vertical de campanha 2026, layout CRACHÁ em pé:',
        hero,
        `"crachá" com o nome "${a.urn}" em uma tag retangular sólida abaixo da foto`,
        `cargo ${a.cargoTx}`,
        `número ${a.num} em destaque`,
      ],
    }[estilo] || [];

    const parts = [...lead, ...common.filter(Boolean)];
    if (a.slogan) parts.push(`slogan "${a.slogan}"`);
    return parts.filter(Boolean).join(', ');
  };

  const buildBackPrompt = (a) => {
    const props =
      propostas.trim()
        ? propostas
            .split(/\n|;|•|-/)
            .map((p) => p.trim())
            .filter(Boolean)
            .slice(0, 3)
            .map((p) => `"${p}"`)
            .join(', ')
        : 'propostas de campanha em bullets curtos: saúde, educação e geração de empregos';
    return [
      `Parte de TRÁS do santinho político (card de campanha vertical ${a.year}):`,
      `"VOTE ${a.num}" enorme e em negrito no topo`,
      `nome de urna "${a.urn}" nas letras tradicionais de urna`,
      `cargo ${a.cargoTx}`,
      'seção de PROPOSTAS em bullets curtos e legíveis:',
      props,
      a.slogan ? `slogan "${a.slogan}" na parte inferior` : '',
      a.colig,
      `ano ${a.year}`,
      a.colors,
      'layout de santinho oficial, limpo, todos os textos perfeitamente escritos em português, sem erros',
    ].filter(Boolean).join(', ');
  };

  const run = async (side) => {
    setError(null);
    setStatus('Preparando…');
    setLoading(true);
    try {
      const a = buildArgs();
      if (!a.urn || !a.num || !a.city) {
        throw new Error('Preencha nome de urna, número e cidade antes de gerar.');
      }
      const msg = side === 'back' ? buildBackPrompt(a) : buildFrontPrompt(a);
      const opts = {
        model: 'flux2pro',
        width: 1216,
        height: 1520,
        upscale: true,
      };
      if (a.photo) opts.referenceImage = a.photo;
      const data = await api.generateImageLive(msg, opts, setStatus, () => {});
      if (side === 'back') setBack(data.imageUrl);
      else setFront(data.imageUrl);
    } catch (err) {
      if (err.data?.code === 'NO_CREDITS') {
        window.location.href = '/plans';
        return;
      }
      setError(err.data?.details || err.message || 'Não foi possível gerar agora. Tente novamente.');
    } finally {
      setLoading(false);
      setStatus(null);
    }
  };

  const requisitos = nomeUrna.trim() && numero.trim() && cidade.trim();

  return (
    <div className="mx-auto max-w-[560px] px-4 pb-16 pt-8">
      <div className="mb-6">
        <a
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-brand-dim hover:text-brand-text transition-colors"
        >
          ← Voltar
        </a>
        <p className="text-[22px] font-bold text-brand-text">Card de candidato</p>
        <p className="mt-1 text-[14px] text-brand-sub">
          Monte o santinho do candidato(a) eleições 2026: foto, nome, número e slogan prontos para imprimir e divulgar no WhatsApp.
        </p>
      </div>

      <div className="mb-5 rounded-xl border border-brand-border bg-brand-surface p-4 text-[12px] leading-relaxed text-brand-dim">
        Envie a foto do <strong className="text-brand-sub">próprio candidato(a)</strong>. O responsável pelo conteúdo é você — a Criativa AI não é filiada a partidos e a peça não substitui a assessoria jurídico-eleitoral.
      </div>

      {/* Foto */}
      <div className="mb-5">
        <p className="mb-2 text-[13px] font-semibold text-brand-text">Foto do candidato(a)</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => readFoto(e.target.files?.[0])}
        />
        {foto ? (
          <div className="flex items-center gap-3">
            <img src={foto} alt="" className="h-20 w-20 rounded-xl object-cover border border-brand-border" />
            <div className="flex gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="rounded-lg border border-brand-border px-3 py-1.5 text-[13px] text-brand-accent hover:text-brand-accentHover"
              >
                Trocar
              </button>
              <button
                onClick={() => setFoto(null)}
                className="rounded-lg border border-brand-border px-3 py-1.5 text-[13px] text-brand-dim hover:text-brand-red"
              >
                Remover
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-brand-borderStrong bg-brand-surface text-brand-dim hover:border-brand-accent hover:text-brand-accent transition-colors"
          >
            <span className="text-xl"></span>
            <span className="text-[13px]">Clique para enviar a foto</span>
          </button>
        )}
      </div>

      {/* Campos */}
      <div className="grid grid-cols-1 gap-3">
        <label className="text-[13px] font-semibold text-brand-text">
          Nome de urna (como sai no voto)
          <input
            value={nomeUrna}
            onChange={(e) => setNomeUrna(e.target.value)}
            placeholder="Ex.: Professora Ana"
            className="mt-1 w-full rounded-xl border border-brand-borderStrong bg-brand-surface p-3 text-[14px] text-brand-text placeholder-brand-dim outline-none focus:border-brand-accent"
          />
        </label>
        <label className="text-[13px] font-semibold text-brand-text">
          Nome completo (opcional)
          <input
            value={nomeCompleto}
            onChange={(e) => setNomeCompleto(e.target.value)}
            placeholder="Ex.: Ana Paula Mendes"
            className="mt-1 w-full rounded-xl border border-brand-borderStrong bg-brand-surface p-3 text-[14px] text-brand-text placeholder-brand-dim outline-none focus:border-brand-accent"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-[13px] font-semibold text-brand-text">
            Cargo
            <select
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className="mt-1 w-full rounded-xl border border-brand-borderStrong bg-brand-surface p-3 text-[14px] text-brand-text outline-none focus:border-brand-accent"
            >
              {CARGO.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="text-[13px] font-semibold text-brand-text">
            Cidade
            <input
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Ex.: Belo Horizonte - MG"
              className="mt-1 w-full rounded-xl border border-brand-borderStrong bg-brand-surface p-3 text-[14px] text-brand-text placeholder-brand-dim outline-none focus:border-brand-accent"
            />
          </label>
        </div>
        <label className="text-[13px] font-semibold text-brand-text">
          Número do candidato
          <input
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            placeholder={
              cargo === 'Prefeito(a)' || cargo === 'Governador(a)' || cargo === 'Presidente' || cargo === 'Senador(a)'
                ? 'Ex.: 12'
                : 'Ex.: 12345'
            }
            maxLength={5}
            className="mt-1 w-full rounded-xl border border-brand-borderStrong bg-brand-surface p-3 text-[14px] text-brand-text placeholder-brand-dim outline-none focus:border-brand-accent"
          />
        </label>
        <label className="text-[13px] font-semibold text-brand-text">
          Partido / Coligação (opcional)
          <input
            value={coligacao}
            onChange={(e) => setColigacao(e.target.value)}
            placeholder="Ex.: MDB - X com Progressistas"
            className="mt-1 w-full rounded-xl border border-brand-borderStrong bg-brand-surface p-3 text-[14px] text-brand-text placeholder-brand-dim outline-none focus:border-brand-accent"
          />
        </label>
        <label className="text-[13px] font-semibold text-brand-text">
          Slogan (opcional)
          <input
            value={slogan}
            onChange={(e) => setSlogan(e.target.value)}
            placeholder="Ex.: Coragem pra mudar"
            className="mt-1 w-full rounded-xl border border-brand-borderStrong bg-brand-surface p-3 text-[14px] text-brand-text placeholder-brand-dim outline-none focus:border-brand-accent"
          />
        </label>
        <label className="text-[13px] font-semibold text-brand-text">
          Propostas para o verso (uma por linha, opcional)
          <textarea
            value={propostas}
            onChange={(e) => setPropostas(e.target.value)}
            rows={3}
            placeholder={'Saúde com mais remédios e postos\nEducação em tempo integral\nNovos empregos na cidade'}
            className="mt-1 w-full rounded-xl border border-brand-borderStrong bg-brand-surface p-3 text-[14px] text-brand-text placeholder-brand-dim outline-none focus:border-brand-accent"
          />
        </label>

        {/* Estilo */}
        <div className="pt-1">
          <p className="mb-2 text-[13px] font-semibold text-brand-text">Estilo do santinho</p>
          <div className="flex flex-col gap-2">
            {STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => setEstilo(s.id)}
                className={`rounded-xl border-2 p-3 text-left transition-all ${
                  estilo === s.id
                    ? 'border-brand-accent bg-brand-accent/10'
                    : 'border-brand-border bg-brand-surface hover:border-brand-borderStrong'
                }`}
              >
                <p className={`text-[14px] font-semibold ${estilo === s.id ? 'text-brand-accent' : 'text-brand-text'}`}>
                  {s.icon} {s.title}
                </p>
                <p className="mt-0.5 text-[12px] text-brand-dim">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>
      {/* Cor de campanha */}
        <div className="pt-1">
          <p className="mb-2 text-[13px] font-semibold text-brand-text">Cor da campanha</p>
          <div className="flex flex-wrap gap-2">
            {CORES_CAMPANHA.map((c) => (
              <button
                key={c.id}
                onClick={() => setCor(c.id)}
                className={`rounded-full border px-3 py-1.5 text-[12px] transition-all ${
                  cor === c.id
                    ? 'border-brand-accent bg-brand-accent/15 text-brand-accent'
                    : 'border-brand-borderStrong text-brand-dim hover:text-brand-text'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          onClick={() => run('front')}
          disabled={loading || !requisitos}
          className="flex-1 rounded-xl bg-brand-accent px-4 py-3 text-[14px] font-semibold text-brand-bg hover:bg-brand-accentHover disabled:opacity-40 transition-colors"
        >
          {loading ? 'Gerando…' : 'Gerar frente'}
        </button>
        {estilo === 'verso' && (
          <button
            onClick={() => run('back')}
            disabled={loading || !requisitos}
            className="flex-1 rounded-xl border border-brand-borderStrong px-4 py-3 text-[14px] font-semibold text-brand-accent hover:text-brand-accentHover disabled:opacity-40 transition-colors"
          >
            {loading ? 'Gerando…' : 'Gerar verso'}
          </button>
        )}
      </div>
      {!requisitos && (
        <p className="mt-2 text-[12px] text-brand-dim">Preencha nome de urna, cidade e número para liberar a geração.</p>
      )}

      {status && (
        <div className="mt-4 rounded-xl border border-brand-border bg-brand-surface p-4">
          <p className="text-[13px] text-brand-sub">
            {status}
            <span className="inline-block ml-0.5 animate-pulse">…</span>
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-brand-border bg-brand-surface p-4">
          <p className="text-[13px] text-brand-sub">{error}</p>
        </div>
      )}

      {/* Resultados */}
      <div className="mt-6 flex flex-col gap-6">
        {front && (
          <ResultCard
            label="Frente"
            url={front}
            onCerebro={(u, p) => {
              sessionStorage.setItem('criai_ref_image', u);
              sessionStorage.setItem('criai_ref_prompt', p || '');
              window.location.href = '/dashboard?chat=1#cerebro';
            }}
          />
        )}
        {back && <ResultCard label="Verso" url={back} onCerebro={(u, p) => { sessionStorage.setItem('criai_ref_image', u); sessionStorage.setItem('criai_ref_prompt', p || ''); window.location.href = '/dashboard?chat=1#cerebro'; }} />}
        {front && !back && (
          <button
            onClick={() => { setFront(null); setError(null); }}
            className="text-center text-[13px] text-brand-dim hover:text-brand-text"
          >
            Gerar outra
          </button>
        )}
      </div>
    </div>
  );
}

function ResultCard({ label, url, onCerebro }) {
  return (
    <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface">
      <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
        <p className="text-sm font-medium text-brand-text">{label}</p>
        <span className="rounded-full bg-brand-accent/15 px-2.5 py-0.5 text-[11px] font-bold text-brand-accent">Pronto!</span>
      </div>
      <img src={url} alt={`${label} do card`} className="w-full max-h-[520px] object-contain bg-brand-bg" />
      <div className="flex flex-col gap-2 p-3">
        <a
          href={url}
          download={`santinho-${label.toLowerCase()}.png`}
          className="block text-center text-sm py-2.5 rounded-lg bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accentHover transition-colors"
        >
          Baixar {label.toLowerCase()}
        </a>
        <button
          onClick={() => onCerebro(url, '')}
          className="block text-center text-sm py-2.5 rounded-lg border border-brand-border text-brand-accent hover:text-brand-accentHover transition-colors"
        >
          Editar na conversa (Cérebro)
        </button>
      </div>
    </div>
  );
}