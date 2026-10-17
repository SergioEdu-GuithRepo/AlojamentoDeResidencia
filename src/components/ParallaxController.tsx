'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Fallback de parallax para browsers sem CSS Scroll-Driven Animations (ex.: Firefox).
 * Nos browsers com suporte nativo não faz nada — o CSS em globals.css trata de tudo.
 */
export default function ParallaxController() {
  const pathname = usePathname();

  useEffect(() => {
    if (CSS.supports('(animation-timeline: view()) and (animation-range: entry)')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
        const frame = el.closest<HTMLElement>('[data-parallax-frame]');
        if (!frame) return;
        const r = frame.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;

        const tipo = el.dataset.parallax;
        if (tipo === 'media') {
          // Progresso "cover": 0 quando entra por baixo, 1 quando sai por cima
          const p = (vh - r.top) / (vh + r.height);
          el.style.translate = `0 ${(-10 + 20 * p).toFixed(2)}%`;
        } else {
          // Progresso "exit-crossing": 0 com o topo no topo do ecrã, 1 quando sai
          const p = Math.min(Math.max(-r.top / r.height, 0), 1);
          if (tipo === 'hero-bg') {
            el.style.translate = `0 ${(35 * p).toFixed(2)}%`;
          } else if (tipo === 'hero-content') {
            const q = Math.min(p / 0.85, 1);
            el.style.translate = `0 ${(-90 * q).toFixed(1)}px`;
            el.style.opacity = String(1 - 0.9 * q);
          }
        }
      });
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [pathname]);

  return null;
}
