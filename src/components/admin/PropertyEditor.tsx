'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  Save,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { CasaService } from '@/lib/supabase';
import { carregarFicheiro } from '@/lib/media';
import { Propriedade } from '@/types/casa';
import UploadButton from './UploadButton';
import { useConfirmar, type OpcoesConfirmacao } from '@/components/ConfirmDialog';

type CamposTexto = Omit<
  Propriedade,
  'id' | 'slug' | 'imagem_principal' | 'galeria' | 'fechadura_id' | 'regras_casa' | 'comodidades'
>;

const labelCls = 'block text-xs font-semibold tracking-[0.18em] uppercase text-mrc-terracotta mb-1.5';
const inputCls =
  'w-full border border-mrc-terracotta/35 px-3.5 py-2.5 text-sm text-mrc-charcoal bg-white focus:outline-none focus:border-mrc-terracotta';

interface Props {
  propriedade: Propriedade;
  onClose: () => void;
  onChanged: (mensagem: string) => void;
  onDeleted: (mensagem: string) => void;
}

/** Opções da caixa de confirmação para eliminar uma residência (partilhada com o admin). */
export function opcoesEliminarResidencia(p: Propriedade): OpcoesConfirmacao {
  return {
    titulo: `Eliminar "${p.nome}"?`,
    mensagem: (
      <>
        Esta ação é <strong className="text-red-700">definitiva</strong>. Serão apagadas as fotografias, a
        fechadura, as reservas, os códigos PIN e as avaliações desta residência. Se pretende apenas retirá-la do
        site, use <strong className="text-mrc-charcoal">Ocultar</strong>.
      </>
    ),
    perigo: true,
    imagem: p.imagem_principal || undefined,
    exigirTexto: 'ELIMINAR',
    textoConfirmar: 'ELIMINAR DEFINITIVAMENTE',
  };
}

export default function PropertyEditor({ propriedade, onClose, onChanged, onDeleted }: Props) {
  const confirmar = useConfirmar();
  const [form, setForm] = useState<CamposTexto>(() => ({
    nome: propriedade.nome,
    subtitulo: propriedade.subtitulo,
    localizacao: propriedade.localizacao,
    regiao: propriedade.regiao,
    endereco: propriedade.endereco,
    descricao_curta: propriedade.descricao_curta,
    descricao_completa: propriedade.descricao_completa,
    preco_noite: propriedade.preco_noite,
    taxa_limpeza: propriedade.taxa_limpeza,
    taxa_servico_percentual: propriedade.taxa_servico_percentual,
    capacidade_maxima: propriedade.capacidade_maxima,
    quartos: propriedade.quartos,
    camas: propriedade.camas,
    casas_banho: propriedade.casas_banho,
    area_m2: propriedade.area_m2,
    estadia_minima_noites: propriedade.estadia_minima_noites,
    hora_checkin: propriedade.hora_checkin,
    hora_checkout: propriedade.hora_checkout,
    wifi_nome: propriedade.wifi_nome,
    wifi_senha: propriedade.wifi_senha,
    instrucoes_entrada: propriedade.instrucoes_entrada,
    contacto_emergencia: propriedade.contacto_emergencia,
    destaque: propriedade.destaque,
    ativa: propriedade.ativa,
  }));
  const [comodidades, setComodidades] = useState(propriedade.comodidades.join('\n'));
  const [regras, setRegras] = useState(propriedade.regras_casa.join('\n'));
  const [capa, setCapa] = useState(propriedade.imagem_principal);
  const [galeria, setGaleria] = useState<string[]>(
    propriedade.galeria.filter((u) => u && u !== propriedade.imagem_principal)
  );
  const [aGuardar, setAGuardar] = useState(false);
  const [aProcessarFoto, setAProcessarFoto] = useState(false);
  const [erro, setErro] = useState('');

  // Fechar com ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const set = <K extends keyof CamposTexto>(campo: K, valor: CamposTexto[K]) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  const pasta = `residencias/${propriedade.id}`;

  /** Guarda imediatamente as alterações de fotografias na base de dados. */
  const gravarFotos = async (novaCapa: string, novaGaleria: string[], mensagem: string) => {
    setAProcessarFoto(true);
    setErro('');
    try {
      await CasaService.atualizarPropriedade(propriedade.id, {
        imagem_principal: novaCapa,
        galeria: novaGaleria,
      });
      setCapa(novaCapa);
      setGaleria(novaGaleria);
      onChanged(mensagem);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao guardar fotografias.');
    } finally {
      setAProcessarFoto(false);
    }
  };

  const substituirCapa = async (files: File[]) => {
    try {
      const url = await carregarFicheiro(files[0], pasta);
      await gravarFotos(url, galeria, 'Fotografia de capa substituída.');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro no envio.');
    }
  };

  const adicionarFotos = async (files: File[]) => {
    const novas: string[] = [];
    for (const f of files) {
      try {
        novas.push(await carregarFicheiro(f, pasta));
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Erro no envio.');
      }
    }
    if (novas.length === 0) return;
    // Se ainda não houver capa, a primeira fotografia passa a ser a capa
    if (!capa) {
      await gravarFotos(novas[0], [...galeria, ...novas.slice(1)], `${novas.length} fotografia(s) adicionada(s).`);
    } else {
      await gravarFotos(capa, [...galeria, ...novas], `${novas.length} fotografia(s) adicionada(s).`);
    }
  };

  const substituirFoto = async (indice: number, files: File[]) => {
    try {
      const url = await carregarFicheiro(files[0], pasta);
      const nova = galeria.map((u, i) => (i === indice ? url : u));
      await gravarFotos(capa, nova, 'Fotografia substituída.');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro no envio.');
    }
  };

  const eliminarFoto = async (indice: number) => {
    const ok = await confirmar({
      titulo: 'Eliminar fotografia?',
      mensagem: `A fotografia será removida da galeria de "${propriedade.nome}" e apagada do armazenamento.`,
      perigo: true,
      imagem: galeria[indice],
      textoConfirmar: 'ELIMINAR',
    });
    if (!ok) return;
    await gravarFotos(
      capa,
      galeria.filter((_, i) => i !== indice),
      'Fotografia eliminada.'
    );
  };

  const definirComoCapa = async (indice: number) => {
    const novaCapa = galeria[indice];
    const nova = galeria.map((u, i) => (i === indice ? capa : u)).filter(Boolean);
    await gravarFotos(novaCapa, nova, 'Nova fotografia de capa definida.');
  };

  const mover = async (indice: number, direcao: -1 | 1) => {
    const destino = indice + direcao;
    if (destino < 0 || destino >= galeria.length) return;
    const nova = [...galeria];
    [nova[indice], nova[destino]] = [nova[destino], nova[indice]];
    await gravarFotos(capa, nova, 'Ordem das fotografias atualizada.');
  };

  const guardarDados = async (e: React.FormEvent) => {
    e.preventDefault();
    setAGuardar(true);
    setErro('');
    try {
      await CasaService.atualizarPropriedade(propriedade.id, {
        ...form,
        preco_noite: Number(form.preco_noite),
        taxa_limpeza: Number(form.taxa_limpeza),
        taxa_servico_percentual: Number(form.taxa_servico_percentual),
        capacidade_maxima: Number(form.capacidade_maxima),
        quartos: Number(form.quartos),
        camas: Number(form.camas),
        casas_banho: Number(form.casas_banho),
        area_m2: Number(form.area_m2),
        estadia_minima_noites: Number(form.estadia_minima_noites),
        comodidades: comodidades.split('\n').map((s) => s.trim()).filter(Boolean),
        regras_casa: regras.split('\n').map((s) => s.trim()).filter(Boolean),
      });
      onChanged(`Dados da residência "${form.nome}" guardados.`);
      onClose();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao guardar.');
    } finally {
      setAGuardar(false);
    }
  };

  const eliminarResidencia = async () => {
    const ok = await confirmar(opcoesEliminarResidencia(propriedade));
    if (!ok) return;
    setAGuardar(true);
    try {
      await CasaService.eliminarPropriedade(propriedade.id);
      onDeleted(`Residência "${propriedade.nome}" eliminada.`);
      onClose();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao eliminar.');
      setAGuardar(false);
    }
  };

  const campoNumero = (campo: keyof CamposTexto, rotulo: string) => (
    <div>
      <label className={labelCls}>{rotulo}</label>
      <input
        type="number"
        min={0}
        value={Number(form[campo])}
        onChange={(e) => set(campo, Number(e.target.value) as never)}
        className={inputCls}
      />
    </div>
  );

  const campoTexto = (campo: keyof CamposTexto, rotulo: string, obrigatorio = false) => (
    <div>
      <label className={labelCls}>
        {rotulo}
        {obrigatorio && '*'}
      </label>
      <input
        type="text"
        required={obrigatorio}
        value={String(form[campo] ?? '')}
        onChange={(e) => set(campo, e.target.value as never)}
        className={inputCls}
      />
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[60] bg-mrc-espresso/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Editar ${propriedade.nome}`}
        className="relative w-full max-w-6xl bg-white shadow-2xl animate-fade-up my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="sticky top-0 z-10 bg-mrc-espresso text-white px-6 sm:px-8 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-emerald-300">
              EDITAR RESIDÊNCIA
            </p>
            <h3 className="font-serif text-xl sm:text-2xl uppercase tracking-[0.06em]">
              {propriedade.nome}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-10 h-10 flex items-center justify-center border border-white/30 hover:bg-white hover:text-mrc-espresso transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {erro && (
          <div className="bg-red-50 border-b border-red-200 text-red-800 px-6 sm:px-8 py-3 text-sm">
            {erro}
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-10">
          {/* =============== FOTOGRAFIAS =============== */}
          <section className="space-y-5">
            <div className="flex items-center justify-between gap-4 border-b border-mrc-terracotta/20 pb-3">
              <h4 className="text-xs font-semibold tracking-[0.24em] uppercase text-mrc-terracotta">
                FOTOGRAFIAS DA RESIDÊNCIA
              </h4>
              {aProcessarFoto && (
                <span className="inline-flex items-center gap-2 text-xs text-mrc-muted">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> A guardar…
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Capa */}
              <div className="lg:col-span-5 space-y-3">
                <p className="text-xs font-semibold tracking-[0.18em] uppercase text-mrc-muted">
                  FOTOGRAFIA DE CAPA
                </p>
                <div className="aspect-[4/3] bg-mrc-blush border border-mrc-terracotta/20 overflow-hidden flex items-center justify-center">
                  {capa ? (
                    <img src={capa} alt="Capa" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-mrc-muted">Sem fotografia de capa</span>
                  )}
                </div>
                <UploadButton
                  onFiles={substituirCapa}
                  label={capa ? 'SUBSTITUIR CAPA' : 'CARREGAR CAPA'}
                  disabled={aProcessarFoto}
                  className="w-full"
                />
                <p className="text-xs text-mrc-muted">
                  Aparece nos cartões da página inicial, na lista de residências e no topo da página da residência.
                </p>
              </div>

              {/* Galeria */}
              <div className="lg:col-span-7 space-y-3">
                <p className="text-xs font-semibold tracking-[0.18em] uppercase text-mrc-muted">
                  GALERIA ({galeria.length} FOTOGRAFIAS)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {galeria.map((url, i) => (
                    <div key={url + i} className="group relative aspect-[4/3] bg-mrc-blush overflow-hidden border border-mrc-terracotta/20">
                      <img src={url} alt={`Fotografia ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-mrc-espresso/75 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                        <button
                          type="button"
                          onClick={() => definirComoCapa(i)}
                          disabled={aProcessarFoto}
                          className="w-full inline-flex items-center justify-center gap-1.5 bg-white text-mrc-espresso px-2 py-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase hover:bg-mrc-blush"
                        >
                          <Star className="w-3 h-3" /> DEFINIR COMO CAPA
                        </button>
                        <UploadButton
                          onFiles={(files) => substituirFoto(i, files)}
                          label="SUBSTITUIR"
                          variant="outline"
                          disabled={aProcessarFoto}
                          className="w-full !px-2 !py-1.5 !text-[10px]"
                        />
                        <div className="w-full flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => mover(i, -1)}
                            disabled={i === 0 || aProcessarFoto}
                            aria-label="Mover para a esquerda"
                            className="flex-1 inline-flex items-center justify-center bg-white/90 text-mrc-espresso py-1.5 disabled:opacity-40"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => mover(i, 1)}
                            disabled={i === galeria.length - 1 || aProcessarFoto}
                            aria-label="Mover para a direita"
                            className="flex-1 inline-flex items-center justify-center bg-white/90 text-mrc-espresso py-1.5 disabled:opacity-40"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => eliminarFoto(i)}
                            disabled={aProcessarFoto}
                            aria-label="Eliminar fotografia"
                            className="flex-1 inline-flex items-center justify-center bg-red-700 text-white py-1.5 hover:bg-red-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <UploadButton
                  onFiles={adicionarFotos}
                  multiple
                  variant="dropzone"
                  label="ADICIONAR FOTOGRAFIAS À GALERIA"
                  disabled={aProcessarFoto}
                />
              </div>
            </div>
          </section>

          {/* =============== DADOS =============== */}
          <form onSubmit={guardarDados} className="space-y-8">
            <section className="space-y-5">
              <h4 className="text-xs font-semibold tracking-[0.24em] uppercase text-mrc-terracotta border-b border-mrc-terracotta/20 pb-3">
                INFORMAÇÃO GERAL
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {campoTexto('nome', 'NOME DA RESIDÊNCIA', true)}
                {campoTexto('subtitulo', 'SUBTÍTULO', true)}
                {campoTexto('localizacao', 'LOCALIZAÇÃO (EX: TALATONA, LUANDA)', true)}
                {campoTexto('regiao', 'REGIÃO')}
                {campoTexto('endereco', 'ENDEREÇO')}
                {campoTexto('contacto_emergencia', 'CONTACTO DE EMERGÊNCIA')}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>DESCRIÇÃO CURTA (CARTÕES)</label>
                  <textarea
                    rows={3}
                    value={form.descricao_curta}
                    onChange={(e) => set('descricao_curta', e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>DESCRIÇÃO COMPLETA (PÁGINA DA RESIDÊNCIA)</label>
                  <textarea
                    rows={3}
                    value={form.descricao_completa}
                    onChange={(e) => set('descricao_completa', e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-5">
              <h4 className="text-xs font-semibold tracking-[0.24em] uppercase text-mrc-terracotta border-b border-mrc-terracotta/20 pb-3">
                TARIFAS (KZ) &amp; CARACTERÍSTICAS
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
                {campoNumero('preco_noite', 'PREÇO / NOITE (KZ)')}
                {campoNumero('taxa_limpeza', 'TAXA LIMPEZA (KZ)')}
                {campoNumero('taxa_servico_percentual', 'TAXA SERVIÇO (%)')}
                {campoNumero('estadia_minima_noites', 'ESTADIA MÍN. (NOITES)')}
                {campoNumero('capacidade_maxima', 'HÓSPEDES (MÁX.)')}
                {campoNumero('quartos', 'SUÍTES / QUARTOS')}
                {campoNumero('camas', 'CAMAS')}
                {campoNumero('casas_banho', 'CASAS DE BANHO')}
                {campoNumero('area_m2', 'ÁREA (M²)')}
              </div>
            </section>

            <section className="space-y-5">
              <h4 className="text-xs font-semibold tracking-[0.24em] uppercase text-mrc-terracotta border-b border-mrc-terracotta/20 pb-3">
                CHEGADA, WI-FI &amp; REGRAS
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {campoTexto('hora_checkin', 'HORA CHECK-IN')}
                {campoTexto('hora_checkout', 'HORA CHECK-OUT')}
                {campoTexto('wifi_nome', 'REDE WI-FI')}
                {campoTexto('wifi_senha', 'PASSWORD WI-FI')}
              </div>
              <div>
                <label className={labelCls}>INSTRUÇÕES DE ENTRADA</label>
                <textarea
                  rows={2}
                  value={form.instrucoes_entrada}
                  onChange={(e) => set('instrucoes_entrada', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>COMODIDADES (UMA POR LINHA)</label>
                  <textarea
                    rows={6}
                    value={comodidades}
                    onChange={(e) => setComodidades(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>REGRAS DA CASA (UMA POR LINHA)</label>
                  <textarea
                    rows={6}
                    value={regras}
                    onChange={(e) => setRegras(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            </section>

            <section className="flex flex-wrap gap-6">
              <label className="inline-flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.ativa}
                  onChange={(e) => set('ativa', e.target.checked)}
                  className="w-4 h-4 accent-[#1A4734]"
                />
                <span className="text-sm text-mrc-charcoal inline-flex items-center gap-2">
                  {form.ativa ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  Visível no site
                </span>
              </label>
              <label className="inline-flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.destaque}
                  onChange={(e) => set('destaque', e.target.checked)}
                  className="w-4 h-4 accent-[#1A4734]"
                />
                <span className="text-sm text-mrc-charcoal">Residência em destaque</span>
              </label>
            </section>

            {/* Ações */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 border-t border-mrc-terracotta/20 pt-6">
              <button
                type="button"
                onClick={eliminarResidencia}
                disabled={aGuardar}
                className="inline-flex items-center justify-center gap-2 border border-red-700 text-red-700 hover:bg-red-700 hover:text-white px-6 py-3.5 text-xs font-semibold tracking-[0.2em] uppercase transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                ELIMINAR RESIDÊNCIA
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3.5 text-xs font-semibold tracking-[0.2em] uppercase border border-mrc-terracotta/40 text-mrc-terracotta hover:bg-mrc-blush transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={aGuardar}
                  className="inline-flex items-center gap-2 bg-mrc-terracotta hover:bg-mrc-espresso text-white px-8 py-3.5 text-xs font-semibold tracking-[0.2em] uppercase transition-colors disabled:opacity-60"
                >
                  {aGuardar ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  GUARDAR DADOS
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
