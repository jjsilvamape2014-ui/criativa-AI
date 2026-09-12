'use client';

import { useState, useEffect, useRef } from 'react';

// Fontes padrão disponíveis (sempre renderizadas corretamente, sem depender da IA)
const FONTS = [
  { id: 'Arial', name: 'Arial', stack: 'Arial, sans-serif' },
  { id: 'Impact', name: 'Impact (chamativa)', stack: 'Impact, Haettenschweiler, sans-serif' },
  { id: 'Georgia', name: 'Georgia (elegante)', stack: 'Georgia, serif' },
  { id: 'Courier', name: 'Courier (monoespaçada)', stack: '"Courier New", monospace' },
  { id: 'Trebuchet', name: 'Trebuchet (moderna)', stack: '"Trebuchet MS", sans-serif' },
  { id: 'Verdana', name: 'Verdana (limpa)', stack: 'Verdana, Geneva, sans-serif' },
];

const PRESETS = [
  { id: 'simple', name: 'Simples', fontColor: '#ffffff', strokeColor: '#000000', fontSize: 90, bold: true, align: 'center', y: 0.82 },
  { id: 'headline', name: 'Manchete', fontColor: '#ffd700', strokeColor: '#000000', fontSize: 120, bold: true, align: 'center', y: 0.5 },
  { id: 'brand', name: 'Marca', fontColor: '#ffffff', strokeColor: '#4f46e5', fontSize: 100, bold: true, align: 'center', y: 0.85 },
  { id: 'clean', name: 'Limpo', fontColor: '#111111', strokeColor: '#ffffff', fontSize: 90, bold: false, align: 'center', y: 0.85 },
];

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export default function TextOnImage({ baseImageUrl, onExport }) {
  const canvasRef = useRef(null);
  const [text, setText] = useState('');
  const [fontId, setFontId] = useState('Impact');
  const [presetId, setPresetId] = useState('headline');
  const [fontColor, setFontColor] = useState('#ffd700');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(120);
  const [bold, setBold] = useState(true);
  const [align, setAlign] = useState('center');
  const [yPos, setYPos] = useState(0.5);
  const [strokeWidth, setStrokeWidth] = useState(6);
  const [loading, setLoading] = useState(false);
  const [img, setImg] = useState(null);
  const [imgLoading, setImgLoading] = useState(false);

  // Carregar imagem base (fundo)
  useEffect(() => {
    if (!baseImageUrl) return;
    setImgLoading(true);
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = baseImageUrl;
    image.onload = () => {
      setImg(image);
      setImgLoading(false);
      // Aplicar tamanho de fonte relativo à largura da imagem
      setFontSize(Math.round(image.width * 0.12));
    };
    image.onerror = () => {
      setImgLoading(false);
      setImg(null);
    };
  }, [baseImageUrl]);

  // Aplicar preset
  const applyPreset = (id) => {
    const p = PRESETS.find(x => x.id === id);
    if (!p) return;
    setPresetId(id);
    setFontColor(p.fontColor);
    setStrokeColor(p.strokeColor);
    setFontSize(p.fontSize);
    setBold(p.bold);
    setAlign(p.align);
    setYPos(p.y);
  };

  // Renderizar no canvas (em alta resolução)
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;

    // Alta resolução: 2x
    const scale = 2;
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    canvas.width = w * scale;
    canvas.height = h * scale;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const font = FONTS.find(f => f.id === fontId) || FONTS[0];
    const fontSizePx = fontSize * scale;
    ctx.font = `${bold ? '800 ' : '500 '}${fontSizePx}px ${font.stack}`;
    ctx.textAlign = align === 'center' ? 'center' : align === 'left' ? 'left' : 'right';
    ctx.textBaseline = 'middle';

    const lines = wrapText(ctx, text, canvas.width - (canvas.width * 0.08));
    const lineHeight = fontSizePx * 1.15;
    const totalHeight = lineHeight * lines.length;
    const startY = canvas.height * yPos - totalHeight / 2;

    lines.forEach((line, i) => {
      const y = startY + (i * lineHeight) + lineHeight / 2;
      if (strokeWidth > 0) {
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth * scale;
        ctx.strokeText(line, canvas.width / 2, y);
      }
      ctx.fillStyle = fontColor;
      ctx.fillText(line, canvas.width / 2, y);
    });
  };

  useEffect(() => {
    if (text) render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, fontId, fontColor, strokeColor, fontSize, bold, align, yPos, strokeWidth, img]);

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Exportar sem fundo transparente: JPEG em alta qualidade (preserva as cores do fundo)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    onExport && onExport(dataUrl);
  };

  if (imgLoading || !img) {
    return (
      <div className="card text-center py-10">
        <p className="text-gray-400">Carregando imagem base...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Texto em Português nítido</h3>
        <span className="text-xs text-gray-400">Texto 100% correto, renderizado localmente</span>
      </div>

      {/* Presets */}
      <div className="flex gap-2 flex-wrap mb-4">
        {PRESETS.map(p => (
          <button
            key={p.id}
            onClick={() => applyPreset(p.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              presetId === p.id
                ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Texto */}
      <label className="block text-sm font-semibold text-gray-300 mb-1">Texto em português</label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Digite aqui o texto que deve aparecer na imagem (ex: PROMOÇÃO IMPERDÍVEL)"
        className="input min-h-[70px] resize-none mb-4"
        maxLength={120}
      />

      {/* Fonte e formatação */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Fonte</label>
          <select value={fontId} onChange={(e) => setFontId(e.target.value)} className="input text-sm py-2">
            {FONTS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Cor do texto</label>
          <input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} className="w-full h-9 rounded-lg border border-gray-200 cursor-pointer" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Borda</label>
          <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="w-full h-9 rounded-lg border border-gray-200 cursor-pointer" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Tamanho</label>
          <input type="range" min={30} max={200} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full mt-2" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">Posição (vertical)</label>
          <input type="range" min={0.05} max={0.95} step={0.01} value={yPos} onChange={(e) => setYPos(Number(e.target.value))} className="w-full mt-2" />
        </div>
        <div className="flex items-end gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input type="checkbox" checked={bold} onChange={(e) => setBold(e.target.checked)} className="accent-primary-500 w-4 h-4" />
            Negrito
          </label>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5 relative">
        <canvas ref={canvasRef} className="w-full h-auto max-h-[480px] object-contain" />
      </div>

      <button
        onClick={handleExport}
        disabled={!text.trim()}
        className="btn-primary mt-4 w-full disabled:opacity-50"
      >
        Aplicar texto e baixar imagem final
      </button>
    </div>
  );
}
