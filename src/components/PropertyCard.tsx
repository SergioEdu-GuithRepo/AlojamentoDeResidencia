'use client';

import React from 'react';
import Link from 'next/link';
import { Propriedade } from '@/types/casa';
import { formatarKz } from '@/lib/supabase';
import { ArrowRight } from 'lucide-react';

interface PropertyCardProps {
  propriedade: Propriedade;
  index?: number;
}

export default function PropertyCard({ propriedade }: PropertyCardProps) {
  return (
    <article className="group bg-white border border-mrc-terracotta/20 transition-all duration-500 hover:border-mrc-terracotta/50 hover-lift flex flex-col">
      {/* Fotografia Arquitetónica */}
      <Link
        href={`/propriedades/${propriedade.slug}`}
        className="relative block aspect-[16/10] overflow-hidden bg-mrc-espresso"
      >
        <img
          src={propriedade.imagem_principal}
          alt={propriedade.nome}
          className="w-full h-full object-cover mrc-image-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-mrc-espresso/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />

        {/* Etiqueta de Localização */}
        <div className="absolute top-5 left-5 bg-mrc-espresso/90 backdrop-blur-md px-4 py-2 text-xs font-medium tracking-[0.22em] uppercase text-white border border-white/15">
          {propriedade.localizacao}
        </div>

        {/* Etiqueta de Preço em Kwanzas (AOA) */}
        <div className="absolute bottom-5 right-5 bg-white/95 backdrop-blur-md px-4 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-mrc-charcoal shadow-sm">
          {formatarKz(propriedade.preco_noite)} / NOITE
        </div>
      </Link>

      {/* Conteúdo */}
      <div className="p-8 md:p-10 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-4 mb-3">
            <span className="text-xs font-semibold tracking-[0.24em] uppercase text-mrc-terracotta">
              {propriedade.quartos} SUÍTES · {propriedade.capacidade_maxima} HÓSPEDES · {propriedade.area_m2} M²
            </span>
          </div>

          <Link href={`/propriedades/${propriedade.slug}`}>
            <h3 className="font-serif text-2xl md:text-3xl text-mrc-charcoal font-normal tracking-[0.04em] uppercase mb-3 group-hover:text-mrc-terracotta transition-colors">
              {propriedade.nome}
            </h3>
          </Link>

          <p className="text-base text-mrc-muted font-normal leading-relaxed line-clamp-2 mb-6">
            {propriedade.subtitulo} — {propriedade.descricao_curta}
          </p>
        </div>

        {/* Rodapé de Especificação */}
        <div className="pt-5 border-t border-mrc-terracotta/20 flex items-center justify-between">
          <div className="text-xs font-medium tracking-[0.2em] uppercase text-mrc-muted">
            CHECK-IN AUTÓNOMO <span className="text-mrc-terracotta font-semibold">· SMART LOCK</span>
          </div>

          <Link
            href={`/propriedades/${propriedade.slug}`}
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.24em] uppercase text-mrc-terracotta group-hover:translate-x-1.5 transition-transform"
          >
            EXPLORAR RESIDÊNCIA
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
