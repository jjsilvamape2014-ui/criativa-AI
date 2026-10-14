'use client';

// Painel do dono: quem se cadastrou, quem usou, quem comprou e as últimas conversas.
// Os dados vêm de /api/admin/* e só aparecem para o e-mail configurado no servidor
// (ADMIN_EMAILS ou VIDEO_UNLIMITED_EMAILS). Contas de teste e a do dono ficam fora.

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { api } from '@/lib/api';

const PERIODOS = [7, 30, 90, 365];

const fmtData = (d) => (d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—');
const fmtReais = (v) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function Numero({ titulo, valor, detalhe }) {
  return (
    <div className="rounded-2xl border border-brand-border bg-brand-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-sub">{titulo}</p>
      <p className="mt-2 font-display text-4xl font-bold text-brand-text">{valor}</p>
      {detalhe && <p className="mt-1 text-sm text-brand-sub">{detalhe}</p>}
    </div>
  );
}

export default function AdminPage() {
  const [dias, setDias] = useState(30);
  const [resumo, setResumo] = useState(null);
  const [conversas, setConversas] = useState([]);
  const [aberta, setAberta] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let vivo = true;
    setCarregando(true);
    setErro('');
    Promise.all([api.getAdminResumo(dias), api.getAdminConversas(dias * 24, 60)])
      .then(([r, c]) => { if (vivo) { setResumo(r); setConversas(Array.isArray(c) ? c : []); } })
      .catch((e) => { if (vivo) setErro(e.status === 403 || e.status === 401 ? 'Esta página é só para o dono do app. Entre com a conta de administrador.' : (e.message || 'Não consegui carregar os dados.')); })
      .finally(() => { if (vivo) setCarregando(false); });
    return () => { vivo = false; };
  }, [dias]);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Painel do dono</h1>
            <p className="mt-1 text-sm text-brand-sub">Quem se cadastrou, quem usou e quem comprou. Contas de teste e a sua ficam fora.</p>
          </div>
          <div role="group" aria-label="Período" className="flex gap-2">
            {PERIODOS.map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={dias === p}
                onClick={() => setDias(p)}
                className={`min-h-[44px] rounded-xl border px-4 text-sm font-semibold ${dias === p ? 'border-brand-accent bg-brand-accent/15 text-brand-text' : 'border-brand-border bg-brand-surface text-brand-sub hover:text-brand-text'}`}
              >
                {p === 365 ? '1 ano' : `${p} dias`}
              </button>
            ))}
          </div>
        </div>

        {erro && <p className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200">{erro}</p>}
        {carregando && !erro && <p className="mt-8 text-brand-sub">Carregando…</p>}

        {resumo && !erro && (
          <>
            <section aria-label="Números" className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Numero titulo="Cadastros" valor={resumo.cadastros.noPeriodo} detalhe={`${resumo.cadastros.total} no total`} />
              <Numero titulo="Usaram" valor={resumo.usaram.pessoas} detalhe={`${resumo.usaram.imagens} imagens · ${resumo.usaram.videos} vídeos`} />
              <Numero titulo="Compraram" valor={resumo.compras.pessoas} detalhe={`${resumo.compras.pagamentos} pagamentos · ${resumo.compras.assinantesPremium} PREMIUM`} />
              <Numero titulo="Faturado" valor={fmtReais(resumo.compras.totalReais)} detalhe={resumo.compras.pendentesOuFalhos ? `${resumo.compras.pendentesOuFalhos} pagamento(s) não concluído(s)` : 'pagamentos concluídos'} />
            </section>
            <p className="mt-3 text-xs text-brand-tert">{resumo.contasDeTesteIgnoradas || 0} contas de teste ignoradas · {resumo.usaram.falhas} gerações falharam no período</p>

            <section aria-labelledby="pessoas-h" className="mt-10">
              <h2 id="pessoas-h" className="font-display text-xl font-bold">Pessoas</h2>
              <div className="mt-3 overflow-x-auto rounded-2xl border border-brand-border">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-brand-surface text-xs uppercase tracking-wider text-brand-sub">
                    <tr>
                      <th scope="col" className="px-4 py-3">Cliente</th>
                      <th scope="col" className="px-4 py-3">Plano</th>
                      <th scope="col" className="px-4 py-3">Cadastro</th>
                      <th scope="col" className="px-4 py-3">Último uso</th>
                      <th scope="col" className="px-4 py-3 text-right">Imagens</th>
                      <th scope="col" className="px-4 py-3 text-right">Vídeos</th>
                      <th scope="col" className="px-4 py-3 text-right">Pagou</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumo.pessoas.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-6 text-brand-sub">Ninguém neste período.</td></tr>
                    )}
                    {resumo.pessoas.map((p, i) => (
                      <tr key={`${p.cliente}-${i}`} className="border-t border-brand-border">
                        <td className="px-4 py-3 font-mono text-xs">{p.cliente}</td>
                        <td className="px-4 py-3">{p.plano}</td>
                        <td className="px-4 py-3 text-brand-sub">{fmtData(p.cadastro)}</td>
                        <td className="px-4 py-3 text-brand-sub">{fmtData(p.ultimoUso)}</td>
                        <td className="px-4 py-3 text-right">{p.imagens}</td>
                        <td className="px-4 py-3 text-right">{p.videos}</td>
                        <td className="px-4 py-3 text-right">{p.pagamentos ? fmtReais(p.pagoReais) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section aria-labelledby="conversas-h" className="mt-10">
              <h2 id="conversas-h" className="font-display text-xl font-bold">Últimas conversas</h2>
              <p className="mt-1 text-sm text-brand-sub">O que cada pessoa pediu e o que o app respondeu. Toque para abrir.</p>
              <ul className="mt-3 flex flex-col gap-2">
                {conversas.length === 0 && <li className="text-brand-sub">Nenhuma conversa neste período.</li>}
                {conversas.map((c, i) => (
                  <li key={i} className="rounded-2xl border border-brand-border bg-brand-surface">
                    <button
                      type="button"
                      aria-expanded={aberta === i}
                      onClick={() => setAberta(aberta === i ? null : i)}
                      className="flex min-h-[44px] w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left"
                    >
                      <span className="font-semibold">{c.marca || 'Sem marca'} <span className="font-mono text-xs font-normal text-brand-sub">· {c.cliente}</span></span>
                      <span className="text-xs text-brand-sub">{fmtData(c.quando)} · {c.conversa.length} mensagens</span>
                    </button>
                    {aberta === i && (
                      <ol className="flex flex-col gap-2 border-t border-brand-border px-4 py-3">
                        {c.conversa.map((m, k) => (
                          <li key={k} className={`rounded-xl px-3 py-2 text-sm ${m.quem === 'cliente' ? 'bg-brand-accent/10' : 'bg-brand-bg'}`}>
                            <span className="mr-2 text-xs font-bold uppercase tracking-wider text-brand-sub">{m.quem}</span>
                            <span className="whitespace-pre-line">{m.texto}</span>
                            {(m.imagem || m.video) && <span className="ml-2 text-xs text-brand-tert">[{m.video ? 'vídeo' : 'imagem'} entregue]</span>}
                          </li>
                        ))}
                      </ol>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
