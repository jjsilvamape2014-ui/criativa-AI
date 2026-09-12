'use client';

const STYLES = [
  { icon: '', label: 'Logotipo', prompt: 'Logotipo profissional minimalista para uma marca de tecnologia, com símbolo geométrico e tipografia elegante, fundo limpo, vetor' },
  { icon: '', label: 'Foto de perfil', prompt: 'Retrato profissional vibrante para foto de perfil, iluminação de estúdio, fundo desfocado colorido, fotorrealismo em 4K' },
  { icon: '', label: 'Pôster', prompt: 'Pôster criativo chamativo para celebridade, cores vibrantes, tipografia ousada, estilo moderno e elegante' },
  { icon: '', label: 'Paisagem', prompt: 'Paisagem cinematográfica deslumbrante de montanhas nevadas ao pôr do sol, nuvens dramáticas, ultra detalhada, 4K' },
  { icon: '', label: 'Fantasia', prompt: 'Ilustração de fantasia épica de um castelo flutuante nas nuvens ao amanhecer, cores mágicas, arte digital de alta qualidade' },
  { icon: '', label: 'Avatar fofo', prompt: 'Animal fofo estilo kawaii, olhos grandes, cores suaves, ilustração digital adorável, fundo pastel' },
  { icon: '', label: 'Arquitetura', prompt: 'Casa moderna minimalista com arquitetura contemporânea, piscina, ao entardecer, iluminação aconchegante, fotorrealismo' },
  { icon: '', label: 'Produto', prompt: 'Hambúrguer gourmet apetitoso sobre fundo escuro dramático, fotografia de comida profissional, iluminação de estúdio, 4K' },
];

export default function StyleChips() {
  const handleClick = (prompt) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('criai:switch-tab', { detail: { tab: 'image' } }));
      window.dispatchEvent(new CustomEvent('criai:set-prompt', { detail: { prompt } }));
      document.getElementById('gerador')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {STYLES.map((s, i) => (
        <button
          key={i}
          onClick={() => handleClick(s.prompt)}
          className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full glass border border-white/10 hover:border-primary-500/40 hover:bg-primary-500/10 transition-all duration-300 hover:scale-105"
        >
          <span className="text-xl group-hover:animate-float">{s.icon}</span>
          <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{s.label}</span>
        </button>
      ))}
    </div>
  );
}
