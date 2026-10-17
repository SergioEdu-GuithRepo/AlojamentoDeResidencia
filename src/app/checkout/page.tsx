'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { VideoHeroHeader } from '@/components/BrandMotifs';
import { CasaService, formatarKz } from '@/lib/supabase';
import { lembrarEmailReserva } from '@/lib/hospede';
import { Propriedade, CalculoReserva } from '@/types/casa';
import { ArrowLeft, CreditCard, KeyRound, Lock, ShieldCheck } from 'lucide-react';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const slug = searchParams.get('slug') || 'villa-atlantica-cascais';
  const checkIn = searchParams.get('checkin') || '';
  const checkOut = searchParams.get('checkout') || '';
  const hospedes = Number(searchParams.get('hospedes')) || 2;

  const [propriedade, setPropriedade] = useState<Propriedade | null>(null);
  const [calculo, setCalculo] = useState<CalculoReserva | null>(null);

  // Formulário do Hóspede
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [documento, setDocumento] = useState('');
  const [metodo, setMetodo] = useState<'mbway' | 'cartao_credito' | 'transferencia'>('mbway');
  const [pedidos, setPedidos] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    CasaService.getPropriedadeBySlug(slug).then((prop) => {
      if (prop) {
        setPropriedade(prop);
        if (checkIn && checkOut) {
          CasaService.verificarDisponibilidade(prop.id, checkIn, checkOut).then(setCalculo);
        }
      }
    });
  }, [slug, checkIn, checkOut]);

  const handleConfirmarPagamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propriedade || !calculo) return;
    if (!nome || !email || !telefone || !documento) {
      setErro('Por favor, preencha todos os dados obrigatórios do titular.');
      return;
    }

    setSubmitting(true);
    setErro('');
    try {
      const resultado = await CasaService.criarReservaComPagamento({
        propriedade_id: propriedade.id,
        hospede_nome: nome,
        hospede_email: email,
        hospede_telefone: telefone,
        hospede_documento: documento,
        data_checkin: checkIn,
        data_checkout: checkOut,
        num_hospedes: hospedes,
        metodo_pagamento: metodo,
        pedidos_especiais: pedidos,
      });
      lembrarEmailReserva(resultado.reserva.codigo_reserva, email);
      router.push(`/reserva/${resultado.reserva.codigo_reserva}`);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao processar a reserva.');
      setSubmitting(false);
    }
  };

  if (!propriedade || !calculo) {
    return (
      <div className="py-32 text-center">
        <p className="text-xs font-semibold tracking-[0.25em] uppercase text-mrc-terracotta">
          A PREPARAR DOSSIER DE RESERVA...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1320px] mx-auto px-6 md:px-14 py-16 md:py-24">
      <div className="mb-10">
        <Link
          href={`/propriedades/${propriedade.slug}`}
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.22em] uppercase text-mrc-terracotta hover:opacity-75"
        >
          <ArrowLeft className="w-4 h-4" />
          VOLTAR PARA {propriedade.nome}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-start">
        <form onSubmit={handleConfirmarPagamento} className="lg:col-span-7 space-y-12">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] uppercase text-mrc-terracotta mb-2">
              PASSO FINAL · EMISSÃO DE CREDENCIAIS DIGITAIS
            </p>
            <h1 className="font-serif text-3xl md:text-4xl text-mrc-charcoal font-normal tracking-[0.06em] uppercase">
              CONFIRMAÇÃO &amp; CHECK-IN AUTÓNOMO
            </h1>
          </div>

          {erro && (
            <div className="p-4 bg-red-50 border border-red-300 text-red-900 text-sm">
              {erro}
            </div>
          )}

          <div className="space-y-7">
            <h2 className="text-xs font-semibold tracking-[0.24em] uppercase text-mrc-terracotta border-b border-mrc-terracotta/25 pb-3">
              01. IDENTIFICAÇÃO DO HÓSPEDE TITULAR
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
              <div>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="NOME COMPLETO*"
                  className="mrc-input-underline"
                />
              </div>
              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL (PARA ENVIO DO PIN)*"
                  className="mrc-input-underline"
                />
              </div>
              <div>
                <input
                  type="tel"
                  required
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="TELEFONE / WHATSAPP (+244)*"
                  className="mrc-input-underline"
                />
              </div>
              <div>
                <input
                  type="text"
                  required
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  placeholder="BILHETE DE IDENTIDADE / PASSAPORTE / NIF*"
                  className="mrc-input-underline"
                />
              </div>
            </div>

            <div>
              <input
                type="text"
                value={pedidos}
                onChange={(e) => setPedidos(e.target.value)}
                placeholder="PEDIDOS ESPECIAIS (HORÁRIO PREVISTO DE CHEGADA, TRANSFER, ADEGA)"
                className="mrc-input-underline"
              />
            </div>
          </div>

          {/* Método de Pagamento em Kwanzas (AOA) */}
          <div className="space-y-6">
            <h2 className="text-xs font-semibold tracking-[0.24em] uppercase text-mrc-terracotta border-b border-mrc-terracotta/25 pb-3">
              02. MÉTODO DE PAGAMENTO EM KWANZAS (AOA)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  id: 'mbway',
                  label: 'MULTICAIXA EXPRESS',
                  sub: 'CONFIRMAÇÃO INSTANTÂNEA EMIS',
                },
                {
                  id: 'cartao_credito',
                  label: 'CARTÃO VISA / MASTERCARD',
                  sub: 'MULTICAIXA / INTERNACIONAL',
                },
                {
                  id: 'transferencia',
                  label: 'REFERÊNCIA / IBAN AO06',
                  sub: 'LIQUIDAÇÃO BANCÁRIA IMEDIATA',
                },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() =>
                    setMetodo(item.id as 'mbway' | 'cartao_credito' | 'transferencia')
                  }
                  className={`p-5 border text-left transition-all ${
                    metodo === item.id
                      ? 'border-mrc-terracotta bg-mrc-blush/70 shadow-sm'
                      : 'border-mrc-terracotta/25 bg-white hover:border-mrc-terracotta/50'
                  }`}
                >
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase text-mrc-charcoal">
                    {item.label}
                  </p>
                  <p className="text-xs tracking-[0.14em] uppercase text-mrc-muted mt-1">
                    {item.sub}
                  </p>
                </button>
              ))}
            </div>

            {metodo === 'cartao_credito' && (
              <div className="bg-white border border-mrc-terracotta/25 p-6 space-y-5">
                <div className="flex items-center justify-between text-xs font-medium tracking-[0.2em] uppercase text-mrc-muted">
                  <span>GATEWAY ENCRIPTADO EMIS / VISA</span>
                  <CreditCard className="w-4 h-4 text-mrc-terracotta" />
                </div>
                <input
                  type="text"
                  defaultValue="4532 •••• •••• 8891"
                  className="mrc-input-underline"
                  placeholder="NÚMERO DO CARTÃO"
                />
                <div className="grid grid-cols-2 gap-6">
                  <input
                    type="text"
                    defaultValue="08/29"
                    className="mrc-input-underline"
                    placeholder="VALIDADE (MM/AA)"
                  />
                  <input
                    type="text"
                    defaultValue="942"
                    className="mrc-input-underline"
                    placeholder="CVC"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-mrc-blush/65 border border-mrc-terracotta/25 p-6 flex items-start gap-4">
            <KeyRound className="w-5 h-5 text-mrc-terracotta flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-mrc-charcoal">
                EMISSÃO AUTOMÁTICA DE CÓDIGO PIN SMART LOCK
              </p>
              <p className="text-sm text-mrc-muted font-normal leading-relaxed">
                Ao concluir a reserva, o nosso servidor comunica diretamente com a fechadura inteligente da propriedade e gera o seu PIN temporário de 6 dígitos na página seguinte.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-mrc-terracotta hover:bg-mrc-espresso disabled:opacity-50 text-white py-5 text-xs font-semibold tracking-[0.28em] uppercase transition-all duration-300 flex items-center justify-center gap-3"
          >
            <Lock className="w-4 h-4" />
            {submitting
              ? 'A SINCRONIZAR SMART LOCK & EMITIR PIN...'
              : `CONFIRMAR PAGAMENTO (${formatarKz(calculo.valor_total)}) E GERAR PIN`}
          </button>
        </form>

        {/* Resumo lateral em Kwanzas (AOA) */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-mrc-terracotta/30 p-8 space-y-6 shadow-lg">
            <div className="aspect-[16/10] overflow-hidden bg-mrc-espresso">
              <img
                src={propriedade.imagem_principal}
                alt={propriedade.nome}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-mrc-terracotta">
                {propriedade.localizacao}
              </p>
              <h3 className="font-serif text-2xl text-mrc-charcoal uppercase tracking-[0.05em] mt-1">
                {propriedade.nome}
              </h3>
            </div>

            <div className="border-y border-mrc-terracotta/20 py-4 space-y-2.5 text-xs tracking-[0.18em] uppercase">
              <div className="flex justify-between">
                <span className="text-mrc-muted font-medium">CHECK-IN</span>
                <span className="text-mrc-charcoal font-semibold">
                  {checkIn} ({propriedade.hora_checkin})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-mrc-muted font-medium">CHECK-OUT</span>
                <span className="text-mrc-charcoal font-semibold">
                  {checkOut} ({propriedade.hora_checkout})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-mrc-muted font-medium">HÓSPEDES</span>
                <span className="text-mrc-charcoal font-semibold">{hospedes} HÓSPEDES</span>
              </div>
            </div>

            <div className="space-y-3 text-sm tracking-[0.14em] uppercase">
              <div className="flex justify-between text-mrc-muted">
                <span>
                  {calculo.noites} NOITES × {formatarKz(calculo.preco_noite)}
                </span>
                <span className="text-mrc-charcoal font-medium">
                  {formatarKz(calculo.subtotal_noites)}
                </span>
              </div>
              <div className="flex justify-between text-mrc-muted">
                <span>PREPARAÇÃO &amp; LIMPEZA</span>
                <span className="text-mrc-charcoal font-medium">
                  {formatarKz(calculo.taxa_limpeza)}
                </span>
              </div>
              <div className="flex justify-between text-mrc-muted">
                <span>CONCIERGE &amp; SMART LOCK</span>
                <span className="text-mrc-charcoal font-medium">
                  {formatarKz(calculo.taxa_servico)}
                </span>
              </div>
              <div className="pt-4 border-t border-mrc-terracotta/25 flex justify-between items-baseline">
                <span className="text-xs font-semibold tracking-[0.22em] text-mrc-charcoal">
                  VALOR TOTAL (AOA)
                </span>
                <span className="font-serif text-2xl sm:text-3xl text-mrc-terracotta">
                  {formatarKz(calculo.valor_total)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs font-medium tracking-[0.18em] uppercase text-mrc-muted">
              <ShieldCheck className="w-4 h-4 text-mrc-terracotta" />
              <span>TRANSAÇÃO PROTEGIDA · PIN VÁLIDO APENAS NA ESTADIA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-mrc-cream text-mrc-charcoal">
      <Navbar />
      <VideoHeroHeader minHeight="h-[160px] xl:h-[260px]" />
      <Suspense fallback={<div className="py-32 text-center text-sm">A carregar...</div>}>
        <CheckoutContent />
      </Suspense>
      <Footer />
    </div>
  );
}
