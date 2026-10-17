'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import { useSiteMedia } from '@/components/SiteMediaProvider';
import { VideoHeroHeader } from '@/components/BrandMotifs';
import { CasaService } from '@/lib/supabase';
import { Propriedade } from '@/types/casa';
import { ArrowRight } from 'lucide-react';

export default function PropriedadesPage() {
  const { img } = useSiteMedia();
  const [propriedades, setPropriedades] = useState<Propriedade[]>([]);
  const [regiaoAtiva, setRegiaoAtiva] = useState<string>('TODAS');

  useEffect(() => {
    CasaService.getPropriedades().then(setPropriedades);
  }, []);

  const regioes = [
    'TODAS',
    ...Array.from(
      new Set(propriedades.map((p) => p.localizacao.split(',')[0].trim().toUpperCase()).filter(Boolean))
    ),
  ];

  const filtradas = propriedades.filter((p) => {
    return (
      regiaoAtiva === 'TODAS' ||
      p.localizacao.toUpperCase().includes(regiaoAtiva) ||
      p.regiao.toUpperCase().includes(regiaoAtiva) ||
      p.nome.toUpperCase().includes(regiaoAtiva)
    );
  });

  return (
    <div className="min-h-screen bg-white text-mrc-charcoal">
      <Navbar />

      {/* =====================================================================
          1. SECÇÃO HERO ("AS RESIDÊNCIAS" — Referência 1)
      ===================================================================== */}
      <VideoHeroHeader
        minHeight="min-h-[72vh]"
        posterUrl={img('residencias_topo')}
      >
        <div className="min-h-[72vh] flex flex-col items-center justify-center pt-36 xl:pt-64 pb-16 px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-up">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-[0.2em] uppercase text-white">
              AS RESIDÊNCIAS
            </h1>
            <div>
              <Link
                href="/#inquire"
                className="inline-block border border-white/75 px-10 py-3.5 text-xs tracking-[0.26em] uppercase font-medium text-white hover:bg-white hover:text-mrc-espresso transition-all duration-500"
              >
                CONTACTO VIP
              </Link>
            </div>
          </div>
        </div>
      </VideoHeroHeader>

      {/* =====================================================================
          2. INTRODUÇÃO EDITORIAL EM DUAS COLUNAS
      ===================================================================== */}
      <section className="py-24 sm:py-32 max-w-[1280px] mx-auto px-6 sm:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-5">
            <h2 className="text-2xl sm:text-3xl font-light tracking-[0.16em] uppercase text-mrc-terracotta leading-snug">
              TRADIÇÃO CLÁSSICA,
              <br />
              CONFORTO MODERNO
            </h2>
          </div>
          <div className="lg:col-span-7">
            <p className="text-base sm:text-lg text-mrc-charcoal font-normal leading-relaxed">
              As residências da Coleção Mr. C representam uma interpretação costeira e contemporânea da arte de bem receber. Madeiras nobres naturais, pedra calcária, amplos terraços privativos sobre o mar e tecnologia invisível de fechaduras inteligentes criam um santuário de sofisticação absoluta.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. FOTOGRAFIA ARQUITETÓNICA SOBREPOSTA À FAIXA SÁLVIA CLARA
      ===================================================================== */}
      <section className="relative">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-12 relative z-10">
          <div className="aspect-[16/9] overflow-hidden bg-mrc-espresso shadow-xl">
            <img
              src={img('residencias_destaque')}
              alt="Arquitetura Interior Mr. C"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="bg-mrc-blush -mt-32 sm:-mt-48 pt-48 sm:pt-64 pb-24 sm:pb-32">
          <div className="max-w-[1280px] mx-auto px-6 sm:px-12">
            {/* Especificações em Duas Colunas: "UMA RESIDÊNCIA PARA VIVER" */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">
              <div className="lg:col-span-5 space-y-5">
                <h2 className="text-2xl sm:text-3xl font-light tracking-[0.16em] uppercase text-mrc-terracotta">
                  UMA RESIDÊNCIA PARA VIVER
                </h2>
                <p className="text-base text-mrc-charcoal font-normal leading-relaxed">
                  Cada propriedade é entregue integralmente preparada com enxoval de hotelaria cinco estrelas, internet fibra e Starlink de alta velocidade, climatização central e entrada autónoma sem chaves sincronizada com as datas da sua reserva.
                </p>
              </div>

              <div className="lg:col-span-7 space-y-4 text-sm sm:text-base text-mrc-charcoal">
                <p className="text-xs font-semibold tracking-[0.22em] uppercase text-mrc-terracotta mb-3">
                  CARACTERÍSTICAS DAS RESIDÊNCIAS &amp; ACESSO AUTÓNOMO
                </p>
                <ul className="space-y-2.5 font-normal leading-relaxed">
                  <li>• Plantas amplas em conceito aberto com envidraçados do chão ao teto</li>
                  <li>• Terraços panorâmicos privados com piscinas infinitas climatizadas</li>
                  <li>• Fechaduras Inteligentes conectadas (Nuki, Yale &amp; August) com PIN temporário de 6 dígitos</li>
                  <li>• Cozinhas de autor totalmente equipadas com eletrodomésticos Gaggenau e Miele</li>
                  <li>• Casas de banho revestidas a mármore com banheira de imersão e duche de chuva</li>
                  <li>• Portal Digital do Hóspede 24/7 com credenciais Wi-Fi, manual da casa e check-out num clique</li>
                </ul>
                <div className="pt-6">
                  <a
                    href="#colecao-residencias"
                    className="inline-block text-xs font-semibold tracking-[0.24em] uppercase text-mrc-terracotta border-b border-mrc-terracotta pb-1.5"
                  >
                    SELECIONAR UMA RESIDÊNCIA PARA RESERVAR
                  </a>
                </div>
              </div>
            </div>

            {/* Duas Fotografias Verticais Lado a Lado (Referência 1) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
              <div className="aspect-[4/5] overflow-hidden bg-mrc-espresso shadow-lg">
                <img
                  src={img('residencias_vertical_1')}
                  alt="Detalhe Sala de Jantar"
                  className="w-full h-full object-cover mrc-image-zoom"
                />
              </div>
              <div className="aspect-[4/5] overflow-hidden bg-mrc-espresso shadow-lg">
                <img
                  src={img('residencias_vertical_2')}
                  alt="Detalhe Cozinha de Chef"
                  className="w-full h-full object-cover mrc-image-zoom"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. COLEÇÃO INTERATIVA DE RESIDÊNCIAS & RESERVA ONLINE EM KWANZAS
      ===================================================================== */}
      <section id="colecao-residencias" className="py-24 sm:py-32 max-w-[1360px] mx-auto px-6 sm:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-mrc-terracotta/20 pb-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.26em] uppercase text-mrc-terracotta mb-2">
              RESERVA ONLINE EM KWANZAS (AOA) · DISPONIBILIDADE EM TEMPO REAL
            </p>
            <h2 className="text-2xl sm:text-4xl font-light tracking-[0.16em] uppercase text-mrc-charcoal">
              RESIDÊNCIAS DISPONÍVEIS ({filtradas.length})
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            {regioes.map((reg) => (
              <button
                key={reg}
                onClick={() => setRegiaoAtiva(reg)}
                className={`text-xs tracking-[0.22em] uppercase pb-1.5 border-b-2 transition-all ${
                  regiaoAtiva === reg
                    ? 'text-mrc-terracotta border-mrc-terracotta font-semibold'
                    : 'text-mrc-muted border-transparent hover:text-mrc-charcoal font-normal'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {filtradas.map((prop, index) => (
            <PropertyCard key={prop.id} propriedade={prop} index={index} />
          ))}
        </div>
      </section>

      {/* =====================================================================
          5. "ATENÇÃO AO DETALHE" + FOTO PANORÂMICA DA SUÍTE MASTER
      ===================================================================== */}
      <section className="pb-24 sm:pb-32 max-w-[1280px] mx-auto px-6 sm:px-12 space-y-20">
        <div className="max-w-xl space-y-5">
          <h2 className="text-2xl sm:text-3xl font-light tracking-[0.16em] uppercase text-mrc-terracotta">
            ATENÇÃO AO DETALHE
          </h2>
          <p className="text-base text-mrc-charcoal font-normal leading-relaxed">
            Cada superfície, acabamento e ponto tecnológico foi pensado para proporcionar total tranquilidade. Chegue à hora que desejar com o seu código PIN pessoal, ligue-se imediatamente ao Wi-Fi de alta velocidade e desfrute de privacidade absoluta.
          </p>
        </div>

        <div data-parallax-frame className="aspect-[16/9] overflow-hidden bg-mrc-espresso shadow-xl">
          <img
            data-parallax="media"
            src={img('residencias_detalhe')}
            alt="Suíte Principal Mr. C"
            className="object-cover"
          />
        </div>
      </section>

      {/* =====================================================================
          6. FAIXA INFERIOR DE NAVEGAÇÃO CRUZADA COM 2 FOTOGRAFIAS (Referência 1)
      ===================================================================== */}
      <section className="bg-mrc-blush py-20 px-6 sm:px-12 border-t border-mrc-terracotta/15">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-3 text-center lg:text-left">
            <Link
              href="/#galeria"
              className="inline-flex flex-col items-center lg:items-start gap-2 text-xs font-semibold tracking-[0.22em] uppercase text-mrc-terracotta hover:opacity-75 transition-opacity"
            >
              <span>DESCOBRIR ARQUITETURA &amp; GALERIA</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-6">
            <div className="aspect-square overflow-hidden bg-mrc-espresso">
              <img
                src={img('residencias_faixa_1')}
                alt="Gastronomia & Bem-Estar"
                className="w-full h-full object-cover mrc-image-zoom"
              />
            </div>
            <div className="aspect-square overflow-hidden bg-mrc-espresso">
              <img
                src={img('residencias_faixa_2')}
                alt="Hospitalidade Mr. C"
                className="w-full h-full object-cover mrc-image-zoom"
              />
            </div>
          </div>

          <div className="lg:col-span-3 text-center lg:text-right">
            <Link
              href="/minhas-reservas"
              className="inline-flex flex-col items-center lg:items-end gap-2 text-xs font-semibold tracking-[0.22em] uppercase text-mrc-terracotta hover:opacity-75 transition-opacity"
            >
              <span>ACEDER À CHAVE DIGITAL &amp; PORTAL</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
