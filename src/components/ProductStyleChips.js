'use client';

const STYLES = [
  { icon: '', cmd: 'showcase', label: 'Foto premium', prompt: 'foto publicitária premium do produto, iluminação de estúdio profissional, fundo limpo sofisticado, alta qualidade comercial' },
  { icon: '', cmd: 'metaad', label: 'Meta Ads', prompt: 'imagem pronta para anúncio no Meta Ads, visual chamativo, composição publicitária profissional' },
  { icon: '', cmd: '3Dbillboard', label: 'Outdoor 3D', prompt: 'produto exibido em um outdoor 3D gigante em uma cidade futurista, efeito visual de destaque, anúncio impactante' },
  { icon: '', cmd: 'billboard', label: 'Outdoor', prompt: 'produto em um outdoor 3D gigante, publicidade urbana cinematográfica' },
  { icon: '', cmd: 'hologram', label: 'Holograma', prompt: 'produto com hologramas e interfaces digitais flutuantes ao redor, visual tecnológico futurista' },
  { icon: '', cmd: 'nature', label: 'Natureza', prompt: 'produto integrado a elementos naturais, composição orgânica harmoniosa, fotografia high-end' },
  { icon: '', cmd: 'fire', label: 'Fire', prompt: 'produto rodeado por fogo e faíscas dramáticas, lighting dramático, anúncio impactante' },
  { icon: '', cmd: 'luxury', label: 'Luxo', prompt: 'produto com estética de luxo, fundo elegante, dourado e sofisticado, fotografia premium' },
  { icon: '', cmd: 'underwater', label: 'Submerso', prompt: 'produto debaixo d’água, iluminação aquática, bolhas, visual cinematográfico' },
  { icon: '', cmd: 'cinematic', label: 'Cinema', prompt: 'cena com visual cinematográfico, profundidade de campo, iluminação dramática de filme' },
  { icon: '', cmd: 'portal', label: 'Portal', prompt: 'produto saindo de um portal de energia brilhante, efeito sci-fi impactante' },
  { icon: '', cmd: 'macro', label: 'Macro', prompt: 'close com detalhes extremos do produto, macro fotografia, textura nítida em 4K' },
  { icon: '', cmd: 'space', label: 'Espaço', prompt: 'produto flutuando no espaço, estrelas e nebulosas ao fundo, visual épico' },
  { icon: '', cmd: 'floating', label: 'Flutuante', prompt: 'produto flutuando com elementos ao redor, composição criativa, anúncio moderno' },
  { icon: '', cmd: 'cyberpunk', label: 'Cyberpunk', prompt: 'campanha com estética cyberpunk, neon, futurista, clima noturno high-tech' },
  { icon: '', cmd: 'splash', label: 'Splash', prompt: 'produto rodeado por água ou líquido em movimento, splash dinâmico, fotografia congelada' },
  { icon: '', cmd: 'desert', label: 'Deserto', prompt: 'produto em um deserto cinematográfico, tons quentes, luz dourada épica' },
  { icon: '', cmd: 'energy', label: 'Energia', prompt: 'produto com raios e energia visual ao redor, efeito elétrico dramático' },
  { icon: '', cmd: 'jungle', label: 'Selva', prompt: 'produto em uma selva tropical, vegetação densa, luz filtrada, aventureiro' },
  { icon: '', cmd: 'productshot', label: 'Estúdio', prompt: 'foto profissional de estúdio do produto, iluminação perfeita, fundo limpo premium' },
  { icon: '', cmd: 'storm', label: 'Tempestade', prompt: 'produto em meio a uma tempestade épica, relâmpagos, clima dramático cinematográfico' },
  { icon: '', cmd: 'neon', label: 'Neon', prompt: 'cena futurista com luzes neon vibrantes, atmosfera urbana noturna, visual impactante' },
  { icon: '', cmd: 'ocean', label: 'Oceano', prompt: 'produto em uma cena oceânica, ondas, luz subaquática, visual cinematográfico' },
  { icon: '', cmd: 'explosion', label: 'Explosão', prompt: 'produto no meio de uma explosão visual colorida, energia, impacto publicitário' },
  { icon: '', cmd: 'futuristic', label: 'Futurista', prompt: 'produto em ambiente tecnológico futurista, luzes neon, design high-tech' },
  { icon: '', cmd: 'ice', label: 'Gelo', prompt: 'produto em um ambiente congelado, gelo e neve, tons frios, atmosfera épica' },
  { icon: '', cmd: 'smoke', label: 'Fumaça', prompt: 'produto rodeado por fumaça dramática, iluminação de estúdio, clima misterioso premium' },
];

export default function ProductStyleChips() {
  const handleClick = (prompt) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('criai:switch-tab', { detail: { tab: 'image' } }));
      window.dispatchEvent(new CustomEvent('criai:append-prompt', { detail: { prompt } }));
      document.getElementById('gerador')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-wrap gap-2.5">
      {STYLES.map((s, i) => (
        <button
          key={i}
          onClick={() => handleClick(s.prompt)}
          title={`/${s.cmd} — ${s.label}`}
          className="group flex items-center gap-2 px-3.5 py-2 rounded-full glass border border-white/10 hover:border-primary-500/40 hover:bg-primary-500/10 transition-all duration-300 hover:scale-105"
        >
          <span className="text-lg group-hover:animate-float">{s.icon}</span>
          <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{s.label}</span>
        </button>
      ))}
    </div>
  );
}
