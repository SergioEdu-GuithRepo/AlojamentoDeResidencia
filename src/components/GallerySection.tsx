'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useSiteMedia } from './SiteMediaProvider';

interface GalleryItem {
  id: string;
  category: string;
  image: string;
  caption: string;
  residence: string;
}

const TABS = ['TODAS', 'RESIDÊNCIAS', 'EXTERIOR', 'COMODIDADES', 'GASTRONOMIA'] as const;

export default function GallerySection() {
  const { galeria } = useSiteMedia();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('TODAS');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const GALLERY_ITEMS: GalleryItem[] = galeria.map((g) => ({
    id: g.id,
    category: g.categoria,
    image: g.imagem_url,
    caption: g.legenda,
    residence: g.residencia,
  }));

  if (GALLERY_ITEMS.length === 0) return null;

  const filtered =
    activeTab === 'TODAS'
      ? GALLERY_ITEMS.slice(0, 4)
      : GALLERY_ITEMS.filter((item) => item.category === activeTab);

  return (
    <section id="galeria" className="bg-white py-24 sm:py-32">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-12">
        {/* Cabeçalho & Separadores Alinhados à Esquerda (estilo mrcresidencesbocaraton.com) */}
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-[0.28em] uppercase text-mrc-terracotta mb-2">
            A GALERIA · ARQUITETURA CURADA
          </p>
          <h2 className="text-3xl sm:text-4xl font-light tracking-[0.18em] uppercase text-mrc-charcoal mb-10">
            A GALERIA
          </h2>

          <div className="flex flex-wrap items-center gap-8 sm:gap-12 border-b border-mrc-terracotta/15 pb-3">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs sm:text-sm tracking-[0.22em] uppercase pb-3 -mb-[13px] transition-all border-b-2 ${
                  activeTab === tab
                    ? 'text-mrc-terracotta border-mrc-terracotta font-semibold'
                    : 'text-mrc-muted border-transparent hover:text-mrc-charcoal font-normal'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Grelha Arquitetónica 2x2 com Legenda à Esquerda e Botão '+' Circular à Direita */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setLightboxItem(item)}
              className="group relative aspect-[4/3] overflow-hidden bg-mrc-espresso cursor-pointer shadow-md"
            >
              <img
                src={item.image}
                alt={item.caption}
                className="w-full h-full object-cover mrc-image-zoom"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-mrc-espresso/80 via-transparent to-transparent opacity-90" />

              <div className="absolute bottom-5 left-6 right-16">
                <p className="text-[11px] sm:text-xs font-medium tracking-[0.18em] uppercase text-white/95 leading-relaxed">
                  {item.caption}
                </p>
              </div>

              <button
                type="button"
                aria-label="Expandir fotografia"
                className="absolute bottom-4 right-5 w-9 h-9 rounded-full bg-mrc-coral text-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:bg-mrc-terracotta"
              >
                <Plus className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Lightbox ao clicar em '+' */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-mrc-espresso/95 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-mrc-espresso border border-white/20 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-mrc-espresso/80 text-white flex items-center justify-center border border-white/30 hover:bg-white hover:text-mrc-espresso transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxItem.image}
              alt={lightboxItem.caption}
              className="w-full max-h-[78vh] object-cover"
            />
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-white">
              <p className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase">
                {lightboxItem.caption}
              </p>
              <span className="text-xs tracking-[0.22em] uppercase text-emerald-300">
                {lightboxItem.residence}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
