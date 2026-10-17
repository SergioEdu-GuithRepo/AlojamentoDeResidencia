'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GallerySection from '@/components/GallerySection';
import VipInquiryForm from '@/components/VipInquiryForm';
import PropertyCard from '@/components/PropertyCard';
import { useSiteMedia } from '@/components/SiteMediaProvider';
import { GeometricLatticePattern, VideoHeroHeader } from '@/components/BrandMotifs';
import { CasaService, formatarKz } from '@/lib/supabase';
import { Propriedade } from '@/types/casa';

export default function HomePage() {
  const router = useRouter();
  const { img } = useSiteMedia();
  const [propriedades, setPropriedades] = useState<Propriedade[]>([]);

  // Estado da Barra de Reserva Rápida
  const [selectedSlug, setSelectedSlug] = useState<string>('villa-atlantica-cascais');
  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');
  const [hospedes, setHospedes] = useState<number>(4);

  useEffect(() => {
    const today = new Date();
    const d1 = new Date(today);
    d1.setDate(today.getDate() + 7);
    const d2 = new Date(today);
    d2.setDate(today.getDate() + 11);
    setCheckIn(d1.toISOString().split('T')[0]);
    setCheckOut(d2.toISOString().split('T')[0]);

    CasaService.getPropriedades().then((props) => {
      setPropriedades(props);
      if (props.length > 0) setSelectedSlug(props[0].slug);
    });
  }, []);

  const handleBookingSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/propriedades/${selectedSlug}?checkin=${checkIn}&checkout=${checkOut}&hospedes=${hospedes}`
    );
  };

  return (
    <div className="min-h-screen bg-white text-mrc-charcoal selection:bg-mrc-terracotta selection:text-white">
      <Navbar />

      {/* =====================================================================
          1. SECÇÃO HERO COM VÍDEO ("BEM-VINDO À MR. C" — Referência 2)
      ===================================================================== */}
      <VideoHeroHeader
        minHeight="min-h-[88vh]"
      >
        <div className="min-h-[88vh] flex flex-col justify-between pt-36 xl:pt-64 pb-12 px-6 sm:px-12 max-w-[1440px] mx-auto">
          <div />

          {/* Título Central e Botão Contornado */}
          <div className="text-center max-w-4xl mx-auto space-y-8 animate-fade-up my-auto py-12">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-[0.2em] uppercase text-white leading-tight">
              BEM-VINDO À <span className="font-semibold">MR. C</span>
            </h1>
            <div>
              <Link
                href="#inquire"
                className="inline-block border border-white/75 px-10 py-3.5 text-xs tracking-[0.26em] uppercase font-medium text-white hover:bg-white hover:text-mrc-espresso transition-all duration-500"
              >
                FALAR COM O CONCIERGE
              </Link>
            </div>
          </div>

          {/* Barra de Reserva Direta Integrada na Base do Hero */}
          <form
            onSubmit={handleBookingSearch}
            className="bg-white/95 backdrop-blur-md border border-mrc-terracotta/25 p-5 sm:p-6 max-w-5xl w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 items-end shadow-2xl animate-fade-up delay-200"
          >
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.22em] uppercase text-mrc-terracotta mb-1.5">
                RESIDÊNCIA
              </label>
              <select
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                className="w-full bg-transparent border-b border-mrc-terracotta/40 pb-2 text-xs sm:text-sm font-medium tracking-wider uppercase text-mrc-charcoal focus:outline-none focus:border-mrc-terracotta"
              >
                {propriedades.map((p) => (
                  <option key={p.id} value={p.slug}>
                    {p.nome} ({formatarKz(p.preco_noite)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-[0.22em] uppercase text-mrc-terracotta mb-1.5">
                CHECK-IN
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-transparent border-b border-mrc-terracotta/40 pb-2 text-xs sm:text-sm font-medium tracking-wider uppercase text-mrc-charcoal focus:outline-none focus:border-mrc-terracotta"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-[0.22em] uppercase text-mrc-terracotta mb-1.5">
                CHECK-OUT
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-transparent border-b border-mrc-terracotta/40 pb-2 text-xs sm:text-sm font-medium tracking-wider uppercase text-mrc-charcoal focus:outline-none focus:border-mrc-terracotta"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-[0.22em] uppercase text-mrc-terracotta mb-1.5">
                HÓSPEDES
              </label>
              <select
                value={hospedes}
                onChange={(e) => setHospedes(Number(e.target.value))}
                className="w-full bg-transparent border-b border-mrc-terracotta/40 pb-2 text-xs sm:text-sm font-medium tracking-wider uppercase text-mrc-charcoal focus:outline-none focus:border-mrc-terracotta"
              >
                {[2, 4, 6, 8, 10].map((num) => (
                  <option key={num} value={num}>
                    {num} HÓSPEDES
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-mrc-terracotta hover:bg-mrc-espresso text-white py-3.5 px-5 text-xs font-semibold tracking-[0.24em] uppercase transition-all duration-300"
              >
                RESERVAR AGORA
              </button>
            </div>
          </form>
        </div>
      </VideoHeroHeader>

      {/* Faixa de Respiro Branca */}
      <div className="h-14 sm:h-20 bg-white" />

      {/* =====================================================================
          2. PAINEL DUPLO 1 (TRELLIS VERDE ESCURO + TEXTO) + FOTO FULL-BLEED 1
      ===================================================================== */}
      <section id="story" className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 min-h-[340px] lg:min-h-[520px]">
          <GeometricLatticePattern
            variant="terracotta"
            className="w-full h-full min-h-[340px] lg:min-h-[520px]"
          />
        </div>

        <div className="lg:col-span-7 bg-mrc-terracotta text-white flex items-center px-8 sm:px-16 lg:px-24 py-20 lg:py-28">
          <div data-reveal className="max-w-xl space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-[0.16em] uppercase leading-snug text-white">
              RESIDÊNCIAS PRIVADAS
              <br />
              DE REQUINTE INTEMPORAL
            </h2>
            <p className="text-base sm:text-lg text-white/95 font-normal leading-relaxed">
              Residências impecavelmente desenhadas nos endereços mais exclusivos — Península do Mussulo, Talatona, Marginal da Baía e Cabo Ledo. Aliando o glamour clássico à hospitalidade autónoma com Smart Lock 24/7 e reserva direta em Kwanzas (AOA).
            </p>
            <div className="pt-2">
              <Link
                href="/propriedades"
                className="inline-block text-xs sm:text-sm font-semibold tracking-[0.24em] uppercase text-white border-b border-white pb-1.5 hover:opacity-80 transition-opacity"
              >
                EXPLORAR RESIDÊNCIAS
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Fotografia Arquitetónica Exterior 1 */}
      <div data-parallax-frame className="relative w-full h-[60vh] sm:h-[78vh] overflow-hidden bg-mrc-espresso">
        <img
          data-parallax="media"
          src={img('inicio_foto_1')}
          alt="Arquitetura Mr. C Residências"
          className="object-cover"
        />
      </div>

      {/* =====================================================================
          3. PAINEL DUPLO 2 (TRELLIS SÁLVIA CLARO + TEXTO) + FOTO PISCINA 2
      ===================================================================== */}
      <section id="amenities" className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 min-h-[340px] lg:min-h-[520px]">
          <GeometricLatticePattern
            variant="blush"
            className="w-full h-full min-h-[340px] lg:min-h-[520px]"
          />
        </div>

        <div className="lg:col-span-7 bg-mrc-blush text-mrc-charcoal flex items-center px-8 sm:px-16 lg:px-24 py-20 lg:py-28">
          <div data-reveal className="max-w-xl space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-[0.16em] uppercase leading-snug text-mrc-terracotta">
              DESFRUTAR, RELAXAR,
              <br />
              REPETIR
            </h2>
            <p className="text-base sm:text-lg text-mrc-charcoal font-normal leading-relaxed">
              Cada estadia inclui chegada autónoma sem chaves físicas. Assim que o pagamento é confirmado, as nossas fechaduras inteligentes Nuki, Yale e August geram automaticamente o seu código PIN privado de 6 dígitos, ativo exclusivamente entre a data do seu check-in e check-out.
            </p>
            <div className="pt-2">
              <Link
                href="/minhas-reservas"
                className="inline-block text-xs sm:text-sm font-semibold tracking-[0.24em] uppercase text-mrc-terracotta border-b border-mrc-terracotta pb-1.5 hover:opacity-75 transition-opacity"
              >
                EXPLORAR SERVIÇOS &amp; CHAVE DIGITAL
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Fotografia Piscina Infinita 2 */}
      <div data-parallax-frame className="relative w-full h-[60vh] sm:h-[78vh] overflow-hidden bg-mrc-espresso">
        <img
          data-parallax="media"
          src={img('inicio_foto_2')}
          alt="Piscina Mr. C Residências"
          className="object-cover"
        />
      </div>

      {/* =====================================================================
          4. PAINEL DUPLO 3 (TRELLIS VERDE ESCURO + TEXTO) + FOTO IATE 3
      ===================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 min-h-[340px] lg:min-h-[520px]">
          <GeometricLatticePattern
            variant="terracotta"
            className="w-full h-full min-h-[340px] lg:min-h-[520px]"
          />
        </div>

        <div className="lg:col-span-7 bg-mrc-terracotta text-white flex items-center px-8 sm:px-16 lg:px-24 py-20 lg:py-28">
          <div data-reveal className="max-w-xl space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-[0.16em] uppercase leading-snug text-white">
              COSTA ATLÂNTICA
              <br />
              UMA HERANÇA DE ESTILO
            </h2>
            <p className="text-base sm:text-lg text-white/95 font-normal leading-relaxed">
              Das águas serenas do Mussulo às falésias de Cabo Ledo e à sofisticação de Talatona e da Baía de Luanda, viva uma experiência arquitetónica incomparável com tarifas transparentes em Kwanzas e confirmação instantânea.
            </p>
            <div className="pt-2">
              <Link
                href="/propriedades"
                className="inline-block text-xs sm:text-sm font-semibold tracking-[0.24em] uppercase text-white border-b border-white pb-1.5 hover:opacity-80 transition-opacity"
              >
                EXPLORAR A COLEÇÃO
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Fotografia Aérea Costa Esmeralda & Iate 3 */}
      <div data-parallax-frame className="relative w-full h-[60vh] sm:h-[78vh] overflow-hidden bg-mrc-espresso">
        <img
          data-parallax="media"
          src={img('inicio_foto_3')}
          alt="Iate na Costa Esmeralda"
          className="object-cover"
        />
      </div>

      {/* =====================================================================
          5. COLEÇÃO DE RESIDÊNCIAS PARA RESERVA ONLINE IMEDIATA
      ===================================================================== */}
      <section className="py-24 sm:py-32 bg-mrc-cream border-b border-mrc-terracotta/15">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.28em] uppercase text-mrc-terracotta mb-2">
                RESERVA DIRETA EM KWANZAS (AOA) · PIN SMART LOCK AUTOMÁTICO
              </p>
              <h2 className="text-3xl sm:text-4xl font-light tracking-[0.16em] uppercase text-mrc-charcoal">
                COLEÇÃO DE RESIDÊNCIAS
              </h2>
            </div>
            <Link
              href="/propriedades"
              className="text-xs font-semibold tracking-[0.24em] uppercase text-mrc-terracotta border-b border-mrc-terracotta pb-1.5 self-start md:self-auto"
            >
              VER TODAS AS RESIDÊNCIAS ({propriedades.length})
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {propriedades.map((prop, index) => (
              <PropertyCard key={prop.id} propriedade={prop} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. GRELHA DE GALERIA 2x2 (Referência 3)
      ===================================================================== */}
      <GallerySection />

      {/* =====================================================================
          7. FORMULÁRIO DE CONSULTA VIP COM ILUSTRAÇÃO DO BARTENDER (Referência 2)
      ===================================================================== */}
      <VipInquiryForm />

      {/* =====================================================================
          8. RODAPÉ INTEGRAL COM PADRÃO GEOMÉTRICO TRELLIS (Referências 1, 2, 3)
      ===================================================================== */}
      <Footer />
    </div>
  );
}
