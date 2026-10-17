'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { BrandLogo } from './BrandMotifs';

const NAV_LINKS = [
  { href: '/', label: 'INÍCIO' },
  { href: '/#story', label: 'A HISTÓRIA MR. C' },
  { href: '/propriedades', label: 'RESIDÊNCIAS' },
  { href: '/#amenities', label: 'SERVIÇOS & COMODIDADES' },
  { href: '/#galeria', label: 'GALERIA' },
  { href: '/minhas-reservas', label: 'CHAVE DIGITAL (PIN)' },
  { href: '/#inquire', label: 'CONTACTO VIP' },
  { href: '/admin', label: 'ADMINISTRAÇÃO' },
];

// Links principais mostrados na barra compacta (após scroll)
const PRIMARY_LINKS = [
  { href: '/propriedades', label: 'RESIDÊNCIAS' },
  { href: '/minhas-reservas', label: 'CHAVE DIGITAL' },
  { href: '/#inquire', label: 'CONTACTO VIP' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fecha o menu ao mudar de página
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || menuOpen
          ? 'bg-mrc-espresso/95 backdrop-blur-md py-4 border-b border-white/15 shadow-lg'
          : 'bg-gradient-to-b from-[#081A13]/70 to-transparent py-6 xl:py-8'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 flex items-start justify-between gap-8">
        {/* Logotipo no canto superior esquerdo */}
        <Link href="/" className="shrink-0 transition-opacity duration-300 hover:opacity-90">
          <BrandLogo light size={scrolled ? 'sm' : 'md'} />
        </Link>

        {/* Menu vertical (só em ecrãs largos ≥1280px e no topo da página) */}
        {!scrolled && !menuOpen && (
          <nav
            aria-label="Navegação Principal"
            className="hidden xl:flex flex-col items-end text-right border-r border-white/45 pr-4 space-y-1"
          >
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[11px] font-medium tracking-[0.22em] uppercase leading-snug transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Barra compacta (após scroll) + botão MENU */}
        <div
          className={`items-center gap-7 self-center ${
            scrolled || menuOpen ? 'flex' : 'flex xl:hidden'
          }`}
        >
          <nav aria-label="Navegação Compacta" className="hidden lg:flex items-center gap-7">
            {PRIMARY_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-medium tracking-[0.2em] uppercase whitespace-nowrap pb-1 border-b transition-colors duration-300 ${
                    isActive
                      ? 'text-white border-white'
                      : 'text-white/80 border-transparent hover:text-white hover:border-white/40'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="inline-flex items-center gap-2 text-white px-3.5 py-2 border border-white/35 bg-white/5 hover:bg-white hover:text-mrc-espresso transition-colors duration-300 text-xs font-semibold tracking-[0.22em] uppercase"
            aria-label={menuOpen ? 'Fechar Menu' : 'Abrir Menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span className="hidden sm:inline">{menuOpen ? 'FECHAR' : 'MENU'}</span>
          </button>
        </div>
      </div>

      {/* Painel de navegação completo */}
      {menuOpen && (
        <div className="border-t border-white/15 mt-4 animate-fade-in">
          <nav
            aria-label="Menu Completo"
            className="max-w-[1440px] mx-auto px-6 sm:px-12 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-4"
          >
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`text-sm font-medium tracking-[0.2em] uppercase py-2 border-b transition-colors duration-300 ${
                    isActive
                      ? 'text-white border-white'
                      : 'text-white/80 border-white/15 hover:text-white hover:border-white/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
