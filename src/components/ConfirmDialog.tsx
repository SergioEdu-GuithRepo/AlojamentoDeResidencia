'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowRight, HelpCircle, Trash2, RotateCcw } from 'lucide-react';

export interface OpcoesConfirmacao {
  titulo: string;
  mensagem?: React.ReactNode;
  textoConfirmar?: string;
  textoCancelar?: string;
  /** Ação destrutiva (botão vermelho) */
  perigo?: boolean;
  /** Ícone do cabeçalho */
  icone?: 'eliminar' | 'repor' | 'aviso' | 'pergunta';
  /** Pré-visualização de uma imagem (ex.: fotografia a eliminar) */
  imagem?: string;
  /** Pré-visualização "antes → depois" (ex.: repor original) */
  comparacao?: { antes: string; depois: string; rotuloAntes?: string; rotuloDepois?: string };
  /** Obriga o utilizador a escrever esta palavra para confirmar */
  exigirTexto?: string;
}

type Confirmar = (opcoes: OpcoesConfirmacao) => Promise<boolean>;

const Contexto = createContext<Confirmar>(async () => false);

export function useConfirmar() {
  return useContext(Contexto);
}

const ICONES = {
  eliminar: Trash2,
  repor: RotateCcw,
  aviso: AlertTriangle,
  pergunta: HelpCircle,
};

/**
 * Caixa de confirmação elegante (substitui window.confirm / window.prompt).
 * Usa <dialog> nativo com showModal(): foco preso, tecla Esc e camada superior.
 */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const resolverRef = useRef<((valor: boolean) => void) | null>(null);
  const resultadoRef = useRef(false);
  const [opcoes, setOpcoes] = useState<OpcoesConfirmacao | null>(null);
  const [textoDigitado, setTextoDigitado] = useState('');

  const confirmar = useCallback<Confirmar>((novas) => {
    setOpcoes(novas);
    setTextoDigitado('');
    resultadoRef.current = false;
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  // Abre o diálogo quando há opções
  useEffect(() => {
    const dialog = dialogRef.current;
    if (opcoes && dialog && !dialog.open) dialog.showModal();
  }, [opcoes]);

  // Fallback de "light dismiss" para browsers sem suporte a closedby (Safari)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;
    const onClick = (e: MouseEvent) => {
      if (e.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      const dentro =
        r.top <= e.clientY && e.clientY <= r.bottom && r.left <= e.clientX && e.clientX <= r.right;
      if (!dentro) dialog.close();
    };
    dialog.addEventListener('click', onClick);
    return () => dialog.removeEventListener('click', onClick);
  }, []);

  const aoFechar = () => {
    resolverRef.current?.(resultadoRef.current);
    resolverRef.current = null;
    setOpcoes(null);
  };

  const fechar = (valor: boolean) => {
    resultadoRef.current = valor;
    dialogRef.current?.close();
  };

  const bloqueado =
    Boolean(opcoes?.exigirTexto) &&
    textoDigitado.trim().toUpperCase() !== opcoes?.exigirTexto?.toUpperCase();

  const Icone = ICONES[opcoes?.icone || (opcoes?.perigo ? 'eliminar' : 'pergunta')];

  return (
    <Contexto.Provider value={confirmar}>
      {children}

      <dialog
        ref={dialogRef}
        {...{ closedby: 'any' }}
        onClose={aoFechar}
        aria-labelledby="confirmacao-titulo"
        className="mrc-confirm-dialog w-[min(92vw,520px)] p-0 bg-white text-mrc-charcoal shadow-2xl"
      >
        {opcoes && (
          <form
            method="dialog"
            onSubmit={(e) => {
              e.preventDefault();
              if (!bloqueado) fechar(true);
            }}
          >
            {/* Faixa superior */}
            <div className={`h-1.5 ${opcoes.perigo ? 'bg-red-700' : 'bg-mrc-terracotta'}`} />

            <div className="px-7 pt-7 pb-6 space-y-5">
              <div className="flex items-start gap-4">
                <span
                  className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${
                    opcoes.perigo ? 'bg-red-50 text-red-700' : 'bg-mrc-blush text-mrc-terracotta'
                  }`}
                >
                  <Icone className="w-5 h-5" />
                </span>
                <div className="space-y-1.5 pt-0.5">
                  <h2
                    id="confirmacao-titulo"
                    className="font-serif text-xl uppercase tracking-[0.06em] text-mrc-charcoal leading-snug"
                  >
                    {opcoes.titulo}
                  </h2>
                  {opcoes.mensagem && (
                    <div className="text-sm text-mrc-muted leading-relaxed">{opcoes.mensagem}</div>
                  )}
                </div>
              </div>

              {opcoes.imagem && (
                <div className="aspect-video bg-mrc-blush overflow-hidden border border-mrc-terracotta/15">
                  <img src={opcoes.imagem} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              {opcoes.comparacao && (
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <figure className="space-y-1.5">
                    <div className="aspect-[4/3] bg-mrc-blush overflow-hidden border border-mrc-terracotta/15">
                      <img src={opcoes.comparacao.antes} alt="" className="w-full h-full object-cover" />
                    </div>
                    <figcaption className="text-[10px] font-semibold tracking-[0.18em] uppercase text-mrc-muted text-center">
                      {opcoes.comparacao.rotuloAntes || 'ATUAL'}
                    </figcaption>
                  </figure>
                  <ArrowRight className="w-5 h-5 text-mrc-terracotta" />
                  <figure className="space-y-1.5">
                    <div className="aspect-[4/3] bg-mrc-blush overflow-hidden border-2 border-mrc-terracotta">
                      <img src={opcoes.comparacao.depois} alt="" className="w-full h-full object-cover" />
                    </div>
                    <figcaption className="text-[10px] font-semibold tracking-[0.18em] uppercase text-mrc-terracotta text-center">
                      {opcoes.comparacao.rotuloDepois || 'ORIGINAL'}
                    </figcaption>
                  </figure>
                </div>
              )}

              {opcoes.exigirTexto && (
                <div className="space-y-2">
                  <label htmlFor="confirmacao-texto" className="block text-xs text-mrc-muted">
                    Para confirmar, escreva{' '}
                    <strong className="font-semibold text-mrc-charcoal tracking-[0.12em]">
                      {opcoes.exigirTexto}
                    </strong>
                  </label>
                  <input
                    id="confirmacao-texto"
                    type="text"
                    autoComplete="off"
                    autoFocus
                    value={textoDigitado}
                    onChange={(e) => setTextoDigitado(e.target.value)}
                    className="w-full border border-mrc-terracotta/35 px-3.5 py-2.5 text-sm tracking-[0.12em] uppercase focus:outline-none focus:border-red-700"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 px-7 py-5 bg-mrc-cream border-t border-mrc-terracotta/15">
              <button
                type="button"
                onClick={() => fechar(false)}
                autoFocus={!opcoes.exigirTexto}
                className="px-6 py-3 text-xs font-semibold tracking-[0.2em] uppercase border border-mrc-terracotta/40 text-mrc-terracotta bg-white hover:bg-mrc-blush transition-colors"
              >
                {opcoes.textoCancelar || 'CANCELAR'}
              </button>
              <button
                type="submit"
                disabled={bloqueado}
                className={`px-6 py-3 text-xs font-semibold tracking-[0.2em] uppercase text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  opcoes.perigo ? 'bg-red-700 hover:bg-red-800' : 'bg-mrc-terracotta hover:bg-mrc-espresso'
                }`}
              >
                {opcoes.textoConfirmar || 'CONFIRMAR'}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </Contexto.Provider>
  );
}
