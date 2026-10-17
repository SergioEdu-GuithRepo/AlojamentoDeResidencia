'use client';

import React from 'react';
import { useSiteMedia } from './SiteMediaProvider';

/**
 * Ilustração Linear do Bartender / Concierge Mr. C
 * Adaptada à paleta Verde Esmeralda & Branco de Alto Contraste.
 */
export function BartenderIllustration({
  variant = 'terracotta',
  className = 'w-12 h-24',
}: {
  variant?: 'terracotta' | 'white';
  className?: string;
}) {
  const strokeColor = variant === 'terracotta' ? '#1A4734' : '#FFFFFF';
  const bowtieColor = variant === 'terracotta' ? '#1A4734' : '#FFFFFF';
  const shakerFill = variant === 'terracotta' ? '#EDF4F0' : '#0E281E';

  return (
    <svg
      viewBox="0 0 64 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="32" cy="20" rx="8.5" ry="10.5" stroke={strokeColor} strokeWidth="1.4" />
      <path
        d="M24 16C26 12 31 12 35 14C38 15 40 14 40 14"
        stroke={strokeColor}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M29.5 24.5C31 25.8 33 25.8 34.5 24.5"
        stroke={strokeColor}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path d="M24.5 33L32 36.5L24.5 40V33Z" fill={bowtieColor} />
      <path d="M39.5 33L32 36.5L39.5 40V33Z" fill={bowtieColor} />
      <circle cx="32" cy="36.5" r="1.6" fill={bowtieColor} />
      <path
        d="M23.5 34L14 39C11.5 40.5 10 43 10 46.5V64C10 66 11.5 67 13.5 67H50.5C52.5 67 54 66 54 64V46.5C54 43 52.5 40.5 50 39L40.5 34"
        stroke={strokeColor}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M25 35L32 54L39 35"
        stroke={strokeColor}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M26 53L36 47L39 52L29 58L26 53Z"
        stroke={strokeColor}
        strokeWidth="1.3"
        fill={shakerFill}
      />
      <circle cx="32" cy="61" r="1.2" fill={strokeColor} />
      <circle cx="32" cy="64.5" r="1.2" fill={strokeColor} />
      <path
        d="M17 67L19 104H45L47 67"
        stroke={strokeColor}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <line x1="32" y1="67" x2="32" y2="118" stroke={strokeColor} strokeWidth="1.3" />
      <path
        d="M23 104L24 118C24 118 20 120 19 122H31V104"
        stroke={strokeColor}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M41 104L40 118C40 118 44 120 45 122H33V104"
        stroke={strokeColor}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Logotipo Superior Esquerdo (estilo mrcresidencesbocaraton.com em Português)
 */
export function BrandLogo({
  light = true,
  size = 'md',
}: {
  light?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const textColor = light ? 'text-white' : 'text-mrc-terracotta';
  const subColor = light ? 'text-white/90' : 'text-mrc-muted';

  return (
    <div className="inline-flex items-center gap-3.5 select-none">
      <BartenderIllustration
        variant={light ? 'white' : 'terracotta'}
        className={size === 'lg' ? 'w-9 h-18' : size === 'sm' ? 'w-6 h-12' : 'w-7 h-14'}
      />
      <div className={`flex items-baseline gap-2.5 ${textColor}`}>
        <span
          className={`font-serif tracking-wider font-light leading-none ${
            size === 'lg'
              ? 'text-4xl sm:text-5xl'
              : size === 'sm'
              ? 'text-2xl sm:text-3xl'
              : 'text-3xl sm:text-4xl'
          }`}
        >
          Mr. C
        </span>
        <div className="flex flex-col text-left">
          <span
            className={`font-sans uppercase tracking-[0.22em] font-medium leading-none ${
              size === 'lg' ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
            }`}
          >
            RESIDÊNCIAS
          </span>
          <span
            className={`font-sans uppercase tracking-[0.22em] text-[10px] font-normal mt-1 ${subColor}`}
          >
            COLEÇÃO PRIVADA · ANGOLA
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Brasão Central do Rodapé (estilo mrcresidencesbocaraton.com em Português)
 */
export function FooterCrestLogo() {
  return (
    <div className="inline-flex flex-col items-center select-none text-white">
      <BartenderIllustration variant="white" className="w-11 h-22 mb-3" />
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
        <div className="text-center sm:text-right">
          <p className="font-serif text-lg sm:text-xl tracking-[0.08em] text-white/95 leading-none mb-1">
            Mr. C
          </p>
          <p className="font-sans text-2xl sm:text-3xl tracking-[0.22em] uppercase font-light text-white leading-none">
            RESIDÊNCIAS
          </p>
          <p className="font-sans text-[10px] tracking-[0.26em] uppercase text-white/85 mt-1.5">
            LUANDA · MUSSULO · CABO LEDO
          </p>
        </div>
        <div className="hidden sm:block w-px h-14 bg-white/35" />
        <div className="text-center sm:text-left text-[10px] sm:text-[11px] tracking-[0.22em] uppercase leading-relaxed text-white/90 font-normal">
          <p>CURADORIA</p>
          <p>ARQUITETURA</p>
          <p>&amp; ACESSO</p>
          <p>INTELIGENTE</p>
          <p>24 HORAS</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Padrão Geométrico Trellis / Lattice Contínuo
 */
export function GeometricLatticePattern({
  variant = 'terracotta',
  className = 'w-full h-full min-h-[360px]',
}: {
  variant?: 'terracotta' | 'blush';
  className?: string;
}) {
  const reactId = React.useId().replace(/:/g, '');
  const patternId = `mrc-trellis-${variant}-${reactId}`;
  const bgColor = variant === 'terracotta' ? '#1A4734' : '#EDF4F0';
  const strokeColor =
    variant === 'terracotta'
      ? 'rgba(237, 244, 240, 0.28)'
      : 'rgba(26, 71, 52, 0.24)';

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <svg
        className="w-full h-full min-h-[inherit]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={patternId}
            x="0"
            y="0"
            width="64"
            height="96"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="96" stroke={strokeColor} strokeWidth="1" />
            <line x1="32" y1="0" x2="32" y2="96" stroke={strokeColor} strokeWidth="1" />
            <line x1="64" y1="0" x2="64" y2="96" stroke={strokeColor} strokeWidth="1" />

            <rect
              x="6"
              y="8"
              width="20"
              height="80"
              rx="10"
              stroke={strokeColor}
              strokeWidth="1"
              fill="none"
            />
            <rect
              x="38"
              y="8"
              width="20"
              height="80"
              rx="10"
              stroke={strokeColor}
              strokeWidth="1"
              fill="none"
            />

            <path
              d="M0 48 C 16 48, 16 0, 32 0 C 48 0, 48 48, 64 48 C 48 48, 48 96, 32 96 C 16 96, 16 48, 0 48 Z"
              stroke={strokeColor}
              strokeWidth="1"
              fill="none"
            />

            <polygon
              points="32,36 40,48 32,60 24,48"
              stroke={strokeColor}
              strokeWidth="1"
              fill="none"
            />
            <circle
              cx="32"
              cy="48"
              r="2.5"
              stroke={strokeColor}
              strokeWidth="1"
              fill="none"
            />

            <path d="M0 36 L8 48 L0 60" stroke={strokeColor} strokeWidth="1" fill="none" />
            <path d="M64 36 L56 48 L64 60" stroke={strokeColor} strokeWidth="1" fill="none" />

            <line x1="12" y1="48" x2="20" y2="48" stroke={strokeColor} strokeWidth="1" />
            <line x1="44" y1="48" x2="52" y2="48" stroke={strokeColor} strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}

/**
 * Cabeçalho Hero com Vídeo Cinematográfico e Sobreposição em Verde-Floresta Profundo
 */
export function VideoHeroHeader({
  children,
  minHeight = 'min-h-[82vh]',
  posterUrl,
  videoUrl,
}: {
  children?: React.ReactNode;
  minHeight?: string;
  posterUrl?: string;
  videoUrl?: string;
}) {
  const { img } = useSiteMedia();
  const poster = posterUrl || img('hero_poster');
  const video = videoUrl || img('hero_video');

  return (
    <section
      data-parallax-frame
      className={`relative w-full overflow-hidden bg-mrc-espresso text-white ${minHeight} flex flex-col justify-center`}
    >
      <div data-parallax="hero-bg" className="absolute inset-0 z-0 overflow-hidden">
        <video
          key={video}
          autoPlay
          muted
          loop
          playsInline
          poster={poster}
          className="w-full h-full object-cover object-center scale-105 animate-slow-zoom"
        >
          <source src={video} type={video.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#081A13]/85 via-[#0E281E]/75 to-[#081A13]/90" />
      </div>

      {children && (
        <div data-parallax="hero-content" className="relative z-10 w-full h-full">
          {children}
        </div>
      )}
    </section>
  );
}
