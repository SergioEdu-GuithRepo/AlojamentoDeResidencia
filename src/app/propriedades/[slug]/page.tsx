'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CasaService, formatarKz } from '@/lib/supabase';
import { Propriedade, Avaliacao, CalculoReserva } from '@/types/casa';
import {
  Check,
  KeyRound,
  MapPin,
  ShieldCheck,
  Star,
  Clock,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

function PropriedadeDetalheContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [propriedade, setPropriedade] = useState<Propriedade | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [activeImage, setActiveImage] = useState<string>('');

  // Estado da Reserva
  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');
  const [hospedes, setHospedes] = useState<number>(2);
  const [calculo, setCalculo] = useState<CalculoReserva | null>(null);
  const [loadingDisp, setLoadingDisp] = useState<boolean>(false);

  useEffect(() => {
    const today = new Date();
    const d1 = new Date(today);
    d1.setDate(today.getDate() + 5);
    const d2 = new Date(today);
    d2.setDate(today.getDate() + 9);

    const qIn = searchParams.get('checkin') || d1.toISOString().split('T')[0];
    const qOut = searchParams.get('checkout') || d2.toISOString().split('T')[0];
    const qHosp = Number(searchParams.get('hospedes')) || 2;

    setCheckIn(qIn);
    setCheckOut(qOut);
    setHospedes(qHosp);

    CasaService.getPropriedadeBySlug(slug).then((prop) => {
      if (prop) {
        setPropriedade(prop);
        setActiveImage(prop.imagem_principal);
        CasaService.getAvaliacoes(prop.id).then(setAvaliacoes);
      }
    });
  }, [slug, searchParams]);

  useEffect(() => {
    if (!propriedade || !checkIn || !checkOut) return;
    setLoadingDisp(true);
    CasaService.verificarDisponibilidade(propriedade.id, checkIn, checkOut).then((res) => {
      setCalculo(res);
      setLoadingDisp(false);
    });
  }, [propriedade, checkIn, checkOut]);

  if (!propriedade) {
    return (
      <div className="min-h-screen bg-mrc-cream flex items-center justify-center">
        <p className="text-xs font-semibold tracking-[0.28em] uppercase text-mrc-terracotta">
          A CARREGAR RESIDÊNCIA...
        </p>
      </div>
    );
  }

  const handleProsseguirCheckout = () => {
    if (!calculo || !calculo.disponivel) return;
    const query = new URLSearchParams({
      propriedadeId: propriedade.id,
      slug: propriedade.slug,
      checkin: checkIn,
      checkout: checkOut,
      hospedes: String(hospedes),
    });
    router.push(`/checkout?${query.toString()}`);
  };

  const fotos = Array.from(
    new Set([propriedade.imagem_principal, ...propriedade.galeria].filter(Boolean))
  );

  return (
    <>
      {/* Hero da Residência */}
      <section data-parallax-frame className="relative h-[72vh] min-h-[560px] xl:min-h-[660px] w-full overflow-hidden bg-mrc-espresso">
        <img
          data-parallax="media"
          src={activeImage || propriedade.imagem_principal}
          alt={propriedade.nome}
          className="object-cover transition-opacity duration-700 animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-mrc-espresso/85 via-mrc-espresso/30 to-mrc-espresso/60" />

        <div data-parallax="hero-content" className="absolute inset-0 max-w-[1440px] mx-auto px-6 md:px-14 flex flex-col justify-between pt-36 xl:pt-64 pb-12 text-white">
          <div>
            <Link
              href="/propriedades"
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.22em] uppercase text-white/90 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              VOLTAR À COLEÇÃO
            </Link>
          </div>

          <div className="max-w-3xl space-y-3 animate-fade-up">
            <p className="text-xs font-semibold tracking-[0.28em] uppercase text-white/90 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-300" />
              {propriedade.localizacao} · {propriedade.regiao}
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-[0.06em] uppercase">
              {propriedade.nome}
            </h1>
            <p className="text-base md:text-lg text-white/90 font-normal">
              {propriedade.subtitulo}
            </p>
          </div>
        </div>
      </section>

      {/* Galeria de Miniaturas (capa + fotografias carregadas no admin) */}
      {fotos.length > 1 && (
        <div className="bg-mrc-blush/60 border-b border-mrc-terracotta/20">
          <div className="max-w-[1440px] mx-auto px-6 md:px-14 py-4 flex items-center gap-4 overflow-x-auto">
            {fotos.map((imgUrl, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(imgUrl)}
                className={`relative w-28 h-16 overflow-hidden flex-shrink-0 border-2 transition-all ${
                  activeImage === imgUrl
                    ? 'border-mrc-terracotta opacity-100 scale-105'
                    : 'border-transparent opacity-65 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Conteúdo & Calculadora de Reserva em Kwanzas (AOA) */}
      <section className="py-16 md:py-24 max-w-[1440px] mx-auto px-6 md:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-start">
          {/* Coluna Esquerda */}
          <div className="lg:col-span-7 space-y-14">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-y border-mrc-terracotta/25 py-6 text-center">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-mrc-muted">SUÍTES</p>
                <p className="font-serif text-2xl md:text-3xl text-mrc-charcoal mt-1">{propriedade.quartos}</p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-mrc-muted">BANHOS</p>
                <p className="font-serif text-2xl md:text-3xl text-mrc-charcoal mt-1">{propriedade.casas_banho}</p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-mrc-muted">HÓSPEDES</p>
                <p className="font-serif text-2xl md:text-3xl text-mrc-charcoal mt-1">ATÉ {propriedade.capacidade_maxima}</p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-mrc-muted">ÁREA</p>
                <p className="font-serif text-2xl md:text-3xl text-mrc-charcoal mt-1">{propriedade.area_m2} M²</p>
              </div>
            </div>

            <div className="space-y-5">
              <h2 className="font-serif text-2xl md:text-3xl text-mrc-terracotta font-normal tracking-[0.08em] uppercase">
                SOBRE A RESIDÊNCIA
              </h2>
              <p className="text-base text-mrc-muted font-normal leading-relaxed">
                {propriedade.descricao_completa}
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="font-serif text-2xl text-mrc-terracotta font-normal tracking-[0.08em] uppercase">
                COMODIDADES &amp; SERVIÇOS INCLUÍDOS
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {propriedade.comodidades.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 py-3.5 px-5 bg-white border border-mrc-terracotta/20 text-xs font-medium tracking-[0.16em] uppercase text-mrc-charcoal"
                  >
                    <Check className="w-4 h-4 text-mrc-terracotta flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-mrc-blush/70 border border-mrc-terracotta/25 p-8 space-y-5">
              <div className="flex items-center gap-3">
                <KeyRound className="w-5 h-5 text-mrc-terracotta" />
                <h3 className="font-serif text-xl text-mrc-charcoal font-medium tracking-[0.08em] uppercase">
                  ACESSO DIGITAL &amp; REGRAS DA CASA
                </h3>
              </div>
              <p className="text-base text-mrc-muted font-normal leading-relaxed">
                Esta propriedade está equipada com fechadura inteligente conectada. Após a confirmação da reserva, receberá um código PIN exclusivo de 6 dígitos ativo durante o período exato da sua estadia.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs font-semibold tracking-[0.18em] uppercase text-mrc-charcoal">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-mrc-terracotta" />
                  <span>CHECK-IN: A PARTIR DAS {propriedade.hora_checkin}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-mrc-terracotta" />
                  <span>CHECK-OUT: ATÉ ÀS {propriedade.hora_checkout}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <h3 className="font-serif text-2xl text-mrc-terracotta font-normal tracking-[0.08em] uppercase">
                AVALIAÇÕES DE HÓSPEDES ({avaliacoes.length})
              </h3>
              {avaliacoes.length === 0 ? (
                <p className="text-base text-mrc-muted font-normal">
                  Ainda não existem avaliações públicas para esta residência.
                </p>
              ) : (
                <div className="space-y-4">
                  {avaliacoes.map((av) => (
                    <div key={av.id} className="bg-white border border-mrc-terracotta/20 p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-mrc-charcoal">
                          {av.hospede_nome}
                        </span>
                        <div className="flex items-center gap-1 text-mrc-terracotta">
                          {Array.from({ length: av.nota_geral }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-base text-mrc-muted font-normal italic">&ldquo;{av.comentario}&rdquo;</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Coluna Direita: Calculadora de Reserva em Kwanzas */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="bg-white border border-mrc-terracotta/30 p-8 md:p-10 shadow-xl space-y-7">
              <div className="flex items-baseline justify-between border-b border-mrc-terracotta/20 pb-5">
                <div>
                  <span className="font-serif text-2xl sm:text-3xl text-mrc-charcoal">
                    {formatarKz(propriedade.preco_noite)}
                  </span>
                  <span className="text-xs font-semibold tracking-[0.2em] uppercase text-mrc-muted ml-2">
                    / NOITE
                  </span>
                </div>
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-mrc-terracotta">
                  MÍN. {propriedade.estadia_minima_noites} NOITES
                </span>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold tracking-[0.2em] uppercase text-mrc-terracotta mb-2">
                    DATA CHECK-IN
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full border border-mrc-terracotta/35 px-3.5 py-3 text-sm text-mrc-charcoal font-medium focus:outline-none focus:border-mrc-terracotta"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-[0.2em] uppercase text-mrc-terracotta mb-2">
                    DATA CHECK-OUT
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full border border-mrc-terracotta/35 px-3.5 py-3 text-sm text-mrc-charcoal font-medium focus:outline-none focus:border-mrc-terracotta"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-[0.2em] uppercase text-mrc-terracotta mb-2">
                  NÚMERO DE HÓSPEDES
                </label>
                <select
                  value={hospedes}
                  onChange={(e) => setHospedes(Number(e.target.value))}
                  className="w-full border border-mrc-terracotta/35 px-3.5 py-3 text-xs font-semibold tracking-[0.18em] uppercase text-mrc-charcoal bg-transparent focus:outline-none focus:border-mrc-terracotta"
                >
                  {Array.from({ length: propriedade.capacidade_maxima }).map((_, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {idx + 1} {idx === 0 ? 'HÓSPEDE' : 'HÓSPEDES'}
                    </option>
                  ))}
                </select>
              </div>

              {loadingDisp ? (
                <div className="py-6 text-center text-xs font-semibold tracking-[0.22em] uppercase text-mrc-muted">
                  A VERIFICAR DISPONIBILIDADE...
                </div>
              ) : calculo ? (
                <div className="space-y-4 pt-2">
                  {!calculo.disponivel ? (
                    <div className="bg-red-50 border border-red-300 p-4 flex items-start gap-3 text-red-900 text-sm">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>{calculo.motivo_indisponivel}</span>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 text-sm tracking-wider uppercase text-mrc-muted">
                        <div className="flex justify-between">
                          <span>
                            {formatarKz(calculo.preco_noite)} × {calculo.noites} NOITES
                          </span>
                          <span className="text-mrc-charcoal font-medium">
                            {formatarKz(calculo.subtotal_noites)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>TAXA DE PREPARAÇÃO &amp; LIMPEZA</span>
                          <span className="text-mrc-charcoal font-medium">
                            {formatarKz(calculo.taxa_limpeza)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>CONCIERGE DIGITAL &amp; SMART LOCK</span>
                          <span className="text-mrc-charcoal font-medium">
                            {formatarKz(calculo.taxa_servico)}
                          </span>
                        </div>
                        <div className="pt-4 border-t border-mrc-terracotta/25 flex justify-between items-baseline text-base font-semibold text-mrc-charcoal">
                          <span>TOTAL (AOA)</span>
                          <span className="font-serif text-2xl text-mrc-terracotta">
                            {formatarKz(calculo.valor_total)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handleProsseguirCheckout}
                        className="w-full bg-mrc-terracotta hover:bg-mrc-espresso text-white py-4 text-xs font-semibold tracking-[0.26em] uppercase transition-all duration-300"
                      >
                        RESERVAR &amp; GERAR ACESSO PIN
                      </button>
                    </>
                  )}
                </div>
              ) : null}

              <div className="pt-4 border-t border-mrc-terracotta/15 flex items-center justify-center gap-2 text-xs font-medium tracking-[0.18em] uppercase text-mrc-muted">
                <ShieldCheck className="w-4 h-4 text-mrc-terracotta" />
                <span>CONFIRMAÇÃO IMEDIATA · PIN AUTOMÁTICO</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function PropriedadeDetalhePage() {
  return (
    <div className="min-h-screen bg-mrc-cream text-mrc-charcoal">
      <Navbar />
      <Suspense fallback={<div className="py-36 text-center text-sm">A carregar residência...</div>}>
        <PropriedadeDetalheContent />
      </Suspense>
      <Footer />
    </div>
  );
}
