'use client';

import React from 'react';
import Link from 'next/link';
import { FooterCrestLogo, GeometricLatticePattern } from './BrandMotifs';

export default function Footer() {
  return (
    <footer className="relative bg-mrc-terracotta text-white overflow-hidden">
      {/* Fundo Integral com o Padrão Geométrico Trellis */}
      <div className="relative py-24 sm:py-32 px-6 flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <GeometricLatticePattern
            variant="terracotta"
            className="w-full h-full min-h-[420px]"
          />
        </div>

        {/* Caixa Central Sólida com o Brasão Mr. C Residências */}
        <div className="relative z-10 bg-mrc-terracotta px-10 sm:px-20 py-12 sm:py-16 text-center max-w-2xl w-full mx-auto shadow-2xl border border-white/10">
          <FooterCrestLogo />

          <p className="mt-8 text-xs sm:text-sm text-white/90 font-normal tracking-[0.14em] leading-relaxed">
            Reservas Diretas Exclusivas em Kwanzas (AOA), Confirmação Imediata &amp; Hospitalidade Autónoma via Smart Lock
          </p>

          <div className="mt-6 pt-6 border-t border-white/20 flex flex-wrap items-center justify-center gap-6 text-xs tracking-[0.22em] uppercase text-white/90 font-medium">
            <Link href="/propriedades" className="hover:text-white hover:underline underline-offset-4">
              RESIDÊNCIAS
            </Link>
            <span>·</span>
            <Link href="/minhas-reservas" className="hover:text-white hover:underline underline-offset-4">
              PORTAL CHAVE DIGITAL
            </Link>
            <span>·</span>
            <Link href="/admin" className="hover:text-white hover:underline underline-offset-4">
              ADMINISTRAÇÃO
            </Link>
          </div>
        </div>
      </div>

      {/* Barra Inferior Legal & Contacto em Português */}
      <div className="relative z-10 bg-mrc-terracotta/95 border-t border-white/20 px-6 sm:px-12 py-5">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs tracking-[0.16em] text-white/90">
          <div className="flex items-center gap-4 font-medium">
            <a href="tel:+244923880110" className="hover:text-white underline underline-offset-4">
              Ligar
            </a>
            <span className="text-white/50">|</span>
            <a
              href="mailto:concierge@casaresidences.com"
              className="hover:text-white underline underline-offset-4"
            >
              Email
            </a>
            <span className="text-white/50">|</span>
            <Link href="/minhas-reservas" className="hover:text-white underline underline-offset-4">
              Consultar PIN Smart Lock
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-white/85">
            <Link href="/propriedades" className="hover:text-white underline underline-offset-4">
              Termos &amp; Condições
            </Link>
            <span className="text-white/50">|</span>
            <Link href="/minhas-reservas" className="hover:text-white underline underline-offset-4">
              Política de Privacidade
            </Link>
            <span className="text-white/50">|</span>
            <span>©{new Date().getFullYear()} Mr. C Residências</span>
            <span className="text-white/50">|</span>
            <Link href="/admin" className="hover:text-white underline underline-offset-4">
              Painel Executivo
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
