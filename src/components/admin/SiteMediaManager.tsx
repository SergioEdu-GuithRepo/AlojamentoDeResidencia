'use client';

import React, { useState } from 'react';
import { RotateCcw, Trash2, ChevronUp, ChevronDown, CheckCircle2, Info } from 'lucide-react';
import {
  MediaService,
  SLOTS_SITE,
  CATEGORIAS_GALERIA,
  carregarFicheiro,
  type CategoriaGaleria,
  type ItemGaleria,
} from '@/lib/media';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useSiteMedia } from '@/components/SiteMediaProvider';
import { useConfirmar } from '@/components/ConfirmDialog';
import UploadButton from './UploadButton';

const inputCls =
  'w-full border border-mrc-terracotta/35 px-3 py-2 text-sm text-mrc-charcoal bg-white focus:outline-none focus:border-mrc-terracotta';

export default function SiteMediaManager({ notificar }: { notificar: (msg: string) => void }) {
  const { media, galeria, img, recarregar } = useSiteMedia();
  const confirmar = useConfirmar();
  const [aProcessar, setAProcessar] = useState<string | null>(null);

  const grupos = Array.from(new Set(SLOTS_SITE.map((s) => s.grupo)));

  const executar = async (id: string, acao: () => Promise<void>, sucesso: string) => {
    setAProcessar(id);
    try {
      await acao();
      await recarregar();
      notificar(sucesso);
    } catch (e) {
      notificar(e instanceof Error ? e.message : 'Ocorreu um erro.');
    } finally {
      setAProcessar(null);
    }
  };

  // ---------- Espaços fixos ----------
  const substituirSlot = (chave: string, rotulo: string) => async (files: File[]) =>
    executar(
      chave,
      async () => {
        const url = await carregarFicheiro(files[0], 'site');
        await MediaService.definirSiteMedia(chave, url);
      },
      `"${rotulo}" atualizada no site.`
    );

  const reporSlot = async (chave: string, rotulo: string) => {
    const slot = SLOTS_SITE.find((s) => s.chave === chave);
    const ok = await confirmar({
      titulo: 'Repor fotografia original?',
      mensagem: (
        <>
          A imagem personalizada de <strong className="text-mrc-charcoal">{rotulo}</strong> será
          substituída pela original e apagada do armazenamento.
        </>
      ),
      icone: 'repor',
      comparacao:
        slot?.tipo === 'imagem' ? { antes: img(chave), depois: slot.padrao } : undefined,
      textoConfirmar: 'REPOR ORIGINAL',
    });
    if (!ok) return;
    executar(chave, () => MediaService.reporSiteMedia(chave), `"${rotulo}" reposta.`);
  };

  // ---------- Galeria ----------
  const adicionarGaleria = async (files: File[]) => {
    setAProcessar('galeria-add');
    let total = 0;
    for (const f of files) {
      try {
        const url = await carregarFicheiro(f, 'galeria');
        await MediaService.adicionarItemGaleria({
          categoria: 'RESIDÊNCIAS',
          imagem_url: url,
          legenda: '',
          residencia: '',
        });
        total++;
      } catch (e) {
        notificar(e instanceof Error ? e.message : 'Erro no envio.');
      }
    }
    await recarregar();
    setAProcessar(null);
    if (total > 0) notificar(`${total} fotografia(s) adicionada(s) à galeria.`);
  };

  const atualizarItem = (item: ItemGaleria, alteracoes: Partial<ItemGaleria>, mensagem: string) =>
    executar(item.id, () => MediaService.atualizarItemGaleria(item.id, alteracoes), mensagem);

  const substituirItem = (item: ItemGaleria) => async (files: File[]) =>
    executar(
      item.id,
      async () => {
        const url = await carregarFicheiro(files[0], 'galeria');
        await MediaService.atualizarItemGaleria(item.id, { imagem_url: url });
      },
      'Fotografia da galeria substituída.'
    );

  const eliminarItem = async (item: ItemGaleria) => {
    const ok = await confirmar({
      titulo: 'Eliminar fotografia da galeria?',
      mensagem: 'A fotografia deixa de aparecer na página inicial e é apagada do armazenamento.',
      perigo: true,
      imagem: item.imagem_url,
      textoConfirmar: 'ELIMINAR',
    });
    if (!ok) return;
    executar(item.id, () => MediaService.removerItemGaleria(item), 'Fotografia eliminada da galeria.');
  };

  const moverItem = (indice: number, direcao: -1 | 1) => {
    const destino = indice + direcao;
    if (destino < 0 || destino >= galeria.length) return;
    const ids = galeria.map((g) => g.id);
    [ids[indice], ids[destino]] = [ids[destino], ids[indice]];
    executar(galeria[indice].id, () => MediaService.reordenarGaleria(ids), 'Ordem da galeria atualizada.');
  };

  return (
    <div className="space-y-12">
      <div>
        <h2 className="font-serif text-2xl text-mrc-charcoal uppercase tracking-[0.06em]">
          FOTOGRAFIAS &amp; VÍDEO DO SITE
        </h2>
        <p className="text-sm text-mrc-muted max-w-3xl">
          Substitua qualquer fotografia do site carregando ficheiros diretamente do seu computador. As alterações
          ficam visíveis imediatamente para todos os visitantes. As fotografias de cada residência gerem-se no
          separador <strong>02. Residências</strong> → <em>Editar dados &amp; fotografias</em>.
        </p>
        {!isSupabaseConfigured && (
          <p className="mt-3 inline-flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 text-sm">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            Modo local: as fotografias ficam guardadas apenas neste navegador. Configure o Supabase para as armazenar
            na base de dados.
          </p>
        )}
      </div>

      {/* ESPAÇOS FIXOS */}
      {grupos.map((grupo) => (
        <section key={grupo} className="space-y-5">
          <h3 className="text-xs font-semibold tracking-[0.24em] uppercase text-mrc-terracotta border-b border-mrc-terracotta/20 pb-3">
            {grupo}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {SLOTS_SITE.filter((s) => s.grupo === grupo).map((slot) => {
              const personalizada = Boolean(media[slot.chave]);
              const url = img(slot.chave);
              return (
                <div key={slot.chave} className="bg-white border border-mrc-terracotta/25 shadow-sm flex flex-col">
                  <div className="relative aspect-video bg-mrc-espresso overflow-hidden">
                    {slot.tipo === 'video' ? (
                      <video key={url} src={url} muted loop autoPlay playsInline className="w-full h-full object-cover" />
                    ) : (
                      <img src={url} alt={slot.rotulo} className="w-full h-full object-cover" />
                    )}
                    <span
                      className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase ${
                        personalizada ? 'bg-mrc-terracotta text-white' : 'bg-white/90 text-mrc-muted'
                      }`}
                    >
                      {personalizada && <CheckCircle2 className="w-3 h-3" />}
                      {personalizada ? 'PERSONALIZADA' : 'ORIGINAL'}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col gap-3">
                    <div>
                      <p className="text-sm font-medium text-mrc-charcoal">{slot.rotulo}</p>
                      {slot.dica && <p className="text-xs text-mrc-muted mt-0.5">{slot.dica}</p>}
                    </div>
                    <div className="mt-auto flex flex-wrap gap-2">
                      <UploadButton
                        onFiles={substituirSlot(slot.chave, slot.rotulo)}
                        accept={slot.tipo === 'video' ? 'video/mp4,video/webm' : 'image/*'}
                        label={slot.tipo === 'video' ? 'SUBSTITUIR VÍDEO' : 'SUBSTITUIR'}
                        disabled={aProcessar !== null}
                      />
                      {personalizada && (
                        <button
                          type="button"
                          onClick={() => reporSlot(slot.chave, slot.rotulo)}
                          disabled={aProcessar !== null}
                          className="inline-flex items-center gap-2 px-4 py-2.5 text-[11px] font-semibold tracking-[0.18em] uppercase border border-mrc-terracotta/40 text-mrc-terracotta hover:bg-mrc-blush transition-colors disabled:opacity-60"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          REPOR ORIGINAL
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* GALERIA DA PÁGINA INICIAL */}
      <section className="space-y-5">
        <div className="border-b border-mrc-terracotta/20 pb-3">
          <h3 className="text-xs font-semibold tracking-[0.24em] uppercase text-mrc-terracotta">
            GALERIA DA PÁGINA INICIAL ({galeria.length})
          </h3>
          <p className="text-xs text-mrc-muted mt-1">
            As 4 primeiras aparecem no separador &quot;Todas&quot;. Defina a categoria para cada fotografia aparecer no
            separador correspondente. A legenda e a residência são guardadas ao sair do campo.
          </p>
        </div>

        <UploadButton
          onFiles={adicionarGaleria}
          multiple
          variant="dropzone"
          label="ADICIONAR FOTOGRAFIAS À GALERIA"
          disabled={aProcessar !== null && aProcessar !== 'galeria-add'}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {galeria.map((item, i) => (
            <div
              key={item.id}
              className={`bg-white border border-mrc-terracotta/25 shadow-sm flex flex-col transition-opacity ${
                aProcessar === item.id ? 'opacity-60' : ''
              }`}
            >
              <div className="relative aspect-[4/3] bg-mrc-espresso overflow-hidden">
                <img src={item.imagem_url} alt={item.legenda} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 bg-white/90 text-mrc-espresso px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em]">
                  #{i + 1}
                </span>
              </div>
              <div className="p-4 space-y-3 flex-1 flex flex-col">
                <select
                  value={item.categoria}
                  onChange={(e) =>
                    atualizarItem(item, { categoria: e.target.value as CategoriaGaleria }, 'Categoria atualizada.')
                  }
                  className={inputCls}
                >
                  {CATEGORIAS_GALERIA.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  defaultValue={item.legenda}
                  placeholder="Legenda (ex: Piscina infinita — Mussulo)"
                  onBlur={(e) =>
                    e.target.value !== item.legenda &&
                    atualizarItem(item, { legenda: e.target.value.toUpperCase() }, 'Legenda guardada.')
                  }
                  className={inputCls}
                />
                <input
                  type="text"
                  defaultValue={item.residencia}
                  placeholder="Residência / local (opcional)"
                  onBlur={(e) =>
                    e.target.value !== item.residencia &&
                    atualizarItem(item, { residencia: e.target.value.toUpperCase() }, 'Residência guardada.')
                  }
                  className={inputCls}
                />
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                  <UploadButton
                    onFiles={substituirItem(item)}
                    label="SUBSTITUIR"
                    variant="outline"
                    disabled={aProcessar !== null}
                  />
                  <button
                    type="button"
                    onClick={() => moverItem(i, -1)}
                    disabled={i === 0 || aProcessar !== null}
                    aria-label="Mover para cima"
                    className="w-9 h-9 inline-flex items-center justify-center border border-mrc-terracotta/40 text-mrc-terracotta hover:bg-mrc-blush disabled:opacity-40"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moverItem(i, 1)}
                    disabled={i === galeria.length - 1 || aProcessar !== null}
                    aria-label="Mover para baixo"
                    className="w-9 h-9 inline-flex items-center justify-center border border-mrc-terracotta/40 text-mrc-terracotta hover:bg-mrc-blush disabled:opacity-40"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => eliminarItem(item)}
                    disabled={aProcessar !== null}
                    aria-label="Eliminar"
                    className="ml-auto w-9 h-9 inline-flex items-center justify-center bg-red-700 text-white hover:bg-red-800 disabled:opacity-40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
