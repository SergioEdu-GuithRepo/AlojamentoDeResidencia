'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { VideoHeroHeader } from '@/components/BrandMotifs';
import { CasaService } from '@/lib/supabase';
import { Reserva } from '@/types/casa';
import { emailGuardadoReserva, esquecerEmailReserva, lembrarEmailReserva } from '@/lib/hospede';
import { useConfirmar } from '@/components/ConfirmDialog';
import {
  CheckCircle2,
  Copy,
  KeyRound,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Wifi,
  LogOut,
} from 'lucide-react';

export default function ReservaPortalPage() {
  const params = useParams();
  const codigo = decodeURIComponent((params?.codigo as string) || '').toUpperCase();
  const confirmar = useConfirmar();

  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [email, setEmail] = useState('');
  const [estado, setEstado] = useState<'a_carregar' | 'pedir_email' | 'ok'>('a_carregar');
  const [emailInput, setEmailInput] = useState('');
  const [erroAcesso, setErroAcesso] = useState('');
  const [aVerificar, setAVerificar] = useState(false);
  const [erroAcao, setErroAcao] = useState('');
  const [erroAvaliacao, setErroAvaliacao] = useState('');
  const [copied, setCopied] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  // Review Form
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');
  const [avaliacaoEnviada, setAvaliacaoEnviada] = useState(false);
  const [aEnviarAvaliacao, setAEnviarAvaliacao] = useState(false);

  /** Carrega a reserva; devolve true se o código + email coincidirem. */
  const carregarReserva = async (mail: string): Promise<boolean> => {
    const r = await CasaService.getReservaByCodigo(codigo, mail);
    if (r && r.propriedade) {
      setReserva(r);
      setEmail(mail);
      setAvaliacaoEnviada(Boolean(r.avaliada));
      lembrarEmailReserva(codigo, mail);
      setEstado('ok');
      return true;
    }
    return false;
  };

  useEffect(() => {
    const guardado = emailGuardadoReserva(codigo);
    // Sem email guardado: tenta mesmo assim (administradores autenticados não precisam de email)
    carregarReserva(guardado)
      .then((ok) => {
        if (!ok) {
          if (guardado) esquecerEmailReserva(codigo);
          setEstado('pedir_email');
        }
      })
      .catch(() => setEstado('pedir_email'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigo]);

  const handleVerificarEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const mail = emailInput.trim().toLowerCase();
    if (!mail) return;
    setAVerificar(true);
    setErroAcesso('');
    try {
      const ok = await carregarReserva(mail);
      if (!ok) setErroAcesso('O email não corresponde a esta reserva.');
    } catch (err) {
      setErroAcesso(err instanceof Error ? err.message : 'Não foi possível consultar a reserva.');
    } finally {
      setAVerificar(false);
    }
  };

  if (estado !== 'ok' || !reserva || !reserva.propriedade) {
    return (
      <div className="min-h-screen bg-mrc-cream text-mrc-charcoal">
        <Navbar />
        <VideoHeroHeader minHeight="h-[160px] xl:h-[260px]" />
        <div className="py-24 px-6">
          {estado === 'a_carregar' ? (
            <p className="text-center text-xs font-semibold tracking-[0.26em] uppercase text-mrc-terracotta">
              A LOCALIZAR A RESERVA {codigo}…
            </p>
          ) : (
            <form
              onSubmit={handleVerificarEmail}
              className="max-w-lg mx-auto bg-white border border-mrc-terracotta/25 p-8 md:p-10 shadow-md space-y-6 animate-fade-up"
            >
              <div className="space-y-2 text-center">
                <ShieldCheck className="w-7 h-7 text-mrc-terracotta mx-auto" />
                <p className="text-xs font-semibold tracking-[0.24em] uppercase text-mrc-terracotta">
                  RESERVA {codigo}
                </p>
                <h1 className="font-serif text-2xl md:text-3xl uppercase tracking-[0.06em]">
                  Confirme o seu email
                </h1>
                <p className="text-base text-mrc-muted">
                  Por segurança, indique o email do titular da reserva para ver o PIN e o guia da residência.
                </p>
              </div>

              {erroAcesso && (
                <div role="alert" className="p-4 bg-red-50 border border-red-300 text-red-900 text-sm">
                  {erroAcesso}
                </div>
              )}

              <input
                type="email"
                required
                autoComplete="email"
                autoFocus
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="nome@exemplo.com"
                aria-label="Email do titular"
                className="w-full border border-mrc-terracotta/35 bg-white px-4 py-4 text-base focus:outline-none focus:border-mrc-terracotta"
              />

              <button
                type="submit"
                disabled={aVerificar}
                className="w-full bg-mrc-terracotta hover:bg-mrc-espresso disabled:opacity-60 text-white py-4 text-xs font-semibold tracking-[0.25em] uppercase transition-colors duration-300"
              >
                {aVerificar ? 'A VERIFICAR…' : 'ABRIR PORTAL DO HÓSPEDE'}
              </button>

              <Link
                href="/minhas-reservas"
                className="block text-center text-xs font-semibold tracking-[0.22em] uppercase text-mrc-muted hover:text-mrc-terracotta transition-colors"
              >
                Procurar outra reserva
              </Link>
            </form>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  const prop = reserva.propriedade;
  const pin = reserva.codigo_acesso?.pin_code || '';
  const pinAtivo =
    Boolean(pin) &&
    reserva.codigo_acesso?.status !== 'revogado' &&
    reserva.codigo_acesso?.status !== 'expirado' &&
    reserva.status !== 'concluida' &&
    reserva.status !== 'cancelada';
  const podeCheckout = reserva.status === 'confirmada' || reserva.status === 'checkin_ativo';

  const handleCopyPin = () => {
    navigator.clipboard.writeText(`${pin}#`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelfCheckOut = async () => {
    const ok = await confirmar({
      titulo: 'Concluir a estadia?',
      mensagem:
        'O código PIN da fechadura será desativado de imediato e a equipa de limpeza será notificada. Esta ação não pode ser desfeita.',
      textoConfirmar: 'Fazer check-out',
      icone: 'aviso',
    });
    if (!ok) return;
    setCheckingOut(true);
    setErroAcao('');
    try {
      await CasaService.realizarCheckOutAutonomo(codigo, email);
      await carregarReserva(email);
    } catch (err) {
      setErroAcao(err instanceof Error ? err.message : 'Não foi possível concluir o check-out.');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleEnviarAvaliacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comentario.trim()) return;
    setAEnviarAvaliacao(true);
    setErroAvaliacao('');
    try {
      await CasaService.adicionarAvaliacao(
        { codigo, email },
        {
          nota_geral: nota,
          nota_limpeza: 5,
          nota_checkin: 5,
          nota_localizacao: 5,
          comentario: comentario.trim(),
        }
      );
      setAvaliacaoEnviada(true);
    } catch (err) {
      setErroAvaliacao(err instanceof Error ? err.message : 'Não foi possível enviar a avaliação.');
    } finally {
      setAEnviarAvaliacao(false);
    }
  };

  return (
    <div className="min-h-screen bg-mrc-cream text-mrc-charcoal">
      <Navbar />

      {/* Top Confirmation Header with Video */}
      <VideoHeroHeader
        minHeight="min-h-[480px] xl:min-h-[560px]"
        posterUrl={prop.imagem_principal}
      >
        <div className="min-h-[480px] xl:min-h-[560px] flex flex-col justify-end pt-36 xl:pt-64 pb-12 px-6 md:px-14 max-w-[1320px] mx-auto text-white">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-up">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
                <span>RESERVA CONFIRMADA · CÓDIGO {reserva.codigo_reserva}</span>
              </div>
              <h1 className="font-serif text-3xl md:text-5xl font-normal tracking-[0.06em] uppercase">
                {prop.nome}
              </h1>
              <p className="text-base text-white/90 font-normal">
                Hóspede Titular: {reserva.hospede_nome} · {reserva.data_checkin} a {reserva.data_checkout}
              </p>
            </div>

            <div className="bg-mrc-espresso/85 backdrop-blur-md border border-white/25 px-6 py-4 text-right">
              <p className="text-xs font-medium tracking-[0.22em] uppercase text-white/80">
                ESTADO DO ACESSO DIGITAL
              </p>
              <p className="text-sm font-semibold tracking-[0.22em] uppercase text-white mt-1">
                {pinAtivo ? 'SMART LOCK SINCRONIZADA & ATIVA' : 'ESTADIA CONCLUÍDA · PIN EXPIRADO'}
              </p>
            </div>
          </div>
        </div>
      </VideoHeroHeader>

      {/* Main Content */}
      <section className="py-16 md:py-24 max-w-[1320px] mx-auto px-6 md:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Digital Key / Smart Lock PIN Card */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-mrc-espresso text-white p-8 md:p-10 border border-mrc-terracotta/40 space-y-8 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/15 pb-5">
                <div>
                  <p className="text-xs font-semibold tracking-[0.24em] uppercase text-emerald-300">
                    CHAVE DIGITAL TEMPORÁRIA
                  </p>
                  <h2 className="font-serif text-2xl uppercase tracking-[0.06em] mt-1">
                    FECHADURA SMART LOCK
                  </h2>
                </div>
                <KeyRound className="w-6 h-6 text-emerald-300" />
              </div>

              {/* Large Architectural PIN Readout */}
              <div className="bg-white/10 border border-white/20 p-6 text-center space-y-3">
                <p className="text-xs font-medium tracking-[0.24em] uppercase text-white/80">
                  DIGITE NO TECLADO DA PORTA PRINCIPAL
                </p>
                <div className="font-serif text-4xl md:text-5xl tracking-[0.25em] text-white py-2">
                  {pinAtivo ? `${pin}#` : '••••••'}
                </div>
                {pinAtivo ? (
                  <button
                    onClick={handleCopyPin}
                    className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.22em] uppercase text-emerald-300 hover:text-white transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? 'CÓDIGO COPIADO' : 'COPIAR CÓDIGO PIN'}
                  </button>
                ) : (
                  !pin &&
                  podeCheckout && (
                    <p className="text-sm text-white/85">
                      PIN em emissão — o concierge enviará o código antes da chegada.
                    </p>
                  )
                )}
              </div>

              {/* Validity Window */}
              <div className="space-y-3 text-xs tracking-[0.18em] uppercase border-t border-white/15 pt-5">
                <div className="flex justify-between">
                  <span className="text-white/70">ATIVAÇÃO AUTOMÁTICA</span>
                  <span className="text-white font-semibold">
                    {reserva.data_checkin} · {prop.hora_checkin}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">EXPIRAÇÃO AUTOMÁTICA</span>
                  <span className="text-white font-semibold">
                    {reserva.data_checkout} · {prop.hora_checkout}
                  </span>
                </div>
              </div>

              {erroAcao && (
                <div role="alert" className="p-4 bg-red-50 border border-red-300 text-red-900 text-sm normal-case tracking-normal">
                  {erroAcao}
                </div>
              )}

              {/* Autonomous Check-Out Action */}
              {podeCheckout ? (
                <div className="pt-3">
                  <button
                    onClick={handleSelfCheckOut}
                    disabled={checkingOut}
                    className="w-full border border-white/40 hover:bg-white hover:text-mrc-espresso disabled:opacity-60 text-white py-4 text-xs font-semibold tracking-[0.22em] uppercase transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    {checkingOut
                      ? 'A ENCERRAR ESTADIA...'
                      : 'REALIZAR CHECK-OUT AUTÓNOMO AGORA'}
                  </button>
                  <p className="text-xs text-white/75 text-center mt-2.5 font-normal">
                    Ao confirmar o check-out, o código PIN é desativado e a equipa de governança é notificada.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-white/10 text-center text-xs font-semibold tracking-[0.2em] uppercase text-emerald-300">
                  {reserva.status === 'cancelada'
                    ? 'RESERVA CANCELADA'
                    : 'CHECK-OUT REGISTADO · EQUIPA DE LIMPEZA NOTIFICADA'}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Digital House Guide & Post-Stay Review */}
          <div className="lg:col-span-7 space-y-10">
            {/* Digital House Manual */}
            <div className="bg-white border border-mrc-terracotta/25 p-8 md:p-10 space-y-8 shadow-sm">
              <div>
                <p className="text-xs font-semibold tracking-[0.24em] uppercase text-mrc-terracotta">
                  MANUAL DIGITAL DO HÓSPEDE
                </p>
                <h2 className="font-serif text-2xl md:text-3xl text-mrc-charcoal uppercase tracking-[0.06em] mt-1">
                  INSTRUÇÕES DE CHEGADA &amp; CASA
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-5 bg-mrc-blush/55 border border-mrc-terracotta/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-mrc-terracotta">
                    <Wifi className="w-4 h-4" />
                    <span>REDE WI-FI PRIVADA</span>
                  </div>
                  <p className="text-sm text-mrc-charcoal font-semibold">
                    Rede: {prop.wifi_nome}
                  </p>
                  <p className="text-sm text-mrc-muted font-normal">
                    Password: {prop.wifi_senha}
                  </p>
                </div>

                <div className="p-5 bg-mrc-blush/55 border border-mrc-terracotta/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-mrc-terracotta">
                    <Phone className="w-4 h-4" />
                    <span>CONCIERGE &amp; APOIO 24/7</span>
                  </div>
                  <p className="text-sm text-mrc-charcoal font-semibold">
                    {prop.contacto_emergencia}
                  </p>
                  <p className="text-sm text-mrc-muted font-normal">
                    Atendimento prioritário via WhatsApp
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-mrc-terracotta">
                  <MapPin className="w-4 h-4" />
                  <span>ENDEREÇO &amp; INSTRUÇÕES DE ENTRADA</span>
                </div>
                <p className="text-base text-mrc-charcoal font-medium">{prop.endereco}</p>
                <p className="text-base text-mrc-muted font-normal leading-relaxed">
                  {prop.instrucoes_entrada}
                </p>
              </div>

              <div className="border-t border-mrc-terracotta/20 pt-6">
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-mrc-terracotta mb-3">
                  NORMAS DE CORTESIA DA RESIDÊNCIA
                </p>
                <ul className="space-y-2 text-sm text-mrc-muted font-normal">
                  {prop.regras_casa.map((regra, i) => (
                    <li key={i}>• {regra}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Guest Review Form */}
            <div className="bg-white border border-mrc-terracotta/25 p-8 md:p-10 space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-[0.24em] uppercase text-mrc-terracotta">
                    FEEDBACK DA ESTADIA
                  </p>
                  <h3 className="font-serif text-2xl text-mrc-charcoal uppercase tracking-[0.06em] mt-1">
                    PARTILHE A SUA EXPERIÊNCIA
                  </h3>
                </div>
                <Sparkles className="w-5 h-5 text-mrc-terracotta" />
              </div>

              {avaliacaoEnviada ? (
                <div className="p-6 bg-mrc-blush/60 border border-mrc-terracotta/25 text-center space-y-2">
                  <p className="text-xs font-semibold tracking-[0.22em] uppercase text-mrc-terracotta">
                    AVALIAÇÃO REGISTADA COM SUCESSO
                  </p>
                  <p className="text-base text-mrc-muted font-normal">
                    Muito obrigado pelo seu testemunho sobre a {prop.nome}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEnviarAvaliacao} className="space-y-6">
                  {erroAvaliacao && (
                    <div role="alert" className="p-4 bg-red-50 border border-red-300 text-red-900 text-sm">
                      {erroAvaliacao}
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold tracking-[0.2em] uppercase text-mrc-muted">
                      CLASSIFICAÇÃO:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNota(star)}
                          className="text-mrc-terracotta"
                        >
                          <Star
                            className={`w-5 h-5 ${star <= nota ? 'fill-current' : 'opacity-30'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    required
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="O SEU COMENTÁRIO SOBRE A ARQUITETURA, CONFORTO E CHECK-IN DIGITAL*"
                    className="mrc-input-underline"
                  />

                  <button
                    type="submit"
                    disabled={aEnviarAvaliacao}
                    className="border border-mrc-terracotta bg-mrc-terracotta text-white hover:bg-mrc-espresso disabled:opacity-60 px-9 py-3.5 text-xs font-semibold tracking-[0.24em] uppercase transition-colors duration-300"
                  >
                    {aEnviarAvaliacao ? 'A ENVIAR…' : 'PUBLICAR AVALIAÇÃO'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
