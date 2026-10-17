'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Scroll suave e mais lento (inércia) para rato / trackpad em desktop.
 *
 * - Não atua em ecrãs táteis (mantém o scroll nativo do telemóvel).
 * - Respeita "reduzir movimento" do sistema operativo.
 * - Deixa passar o scroll de modais, listas e áreas com scroll próprio.
 * - Teclado, barra de scroll e links de âncora continuam nativos.
 */

/** Distância percorrida por cada "clique" da roda (1 = nativo; menor = mais lento). */
const VELOCIDADE = 0.7;
/** Suavidade da desaceleração (menor = mais lento e mais suave). */
const SUAVIDADE = 0.06;

export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');
    const toque = window.matchMedia('(pointer: coarse)');
    if (reduzirMovimento.matches || toque.matches) return;

    const html = document.documentElement;
    let alvo = window.scrollY;
    let atual = window.scrollY;
    let animando = false;
    let raf = 0;
    let ultimoTempo = 0;

    const maxScroll = () => html.scrollHeight - window.innerHeight;

    const parar = () => {
      animando = false;
      cancelAnimationFrame(raf);
      alvo = atual = window.scrollY;
      html.style.scrollBehavior = '';
    };

    const passo = (agora: number) => {
      const dt = ultimoTempo ? Math.min(agora - ultimoTempo, 64) : 16.67;
      ultimoTempo = agora;
      // Interpolação independente da taxa de atualização do ecrã (60/120 Hz)
      const k = 1 - Math.pow(1 - SUAVIDADE, dt / 16.67);
      atual += (alvo - atual) * k;

      if (Math.abs(alvo - atual) < 0.5) {
        atual = alvo;
        window.scrollTo(0, atual);
        animando = false;
        html.style.scrollBehavior = '';
        return;
      }
      window.scrollTo(0, atual);
      raf = requestAnimationFrame(passo);
    };

    /** true se algum elemento por baixo do cursor consegue fazer scroll nesta direção. */
    const temScrollProprio = (el: Element | null, dy: number): boolean => {
      while (el && el !== document.body && el !== html) {
        if (el instanceof HTMLElement) {
          if (el.dataset.nativeScroll !== undefined) return true;
          const { overflowY } = getComputedStyle(el);
          if (
            (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
            el.scrollHeight > el.clientHeight + 1
          ) {
            const podeDescer = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
            const podeSubir = el.scrollTop > 0;
            if ((dy > 0 && podeDescer) || (dy < 0 && podeSubir)) return true;
          }
        }
        el = el.parentElement;
      }
      return false;
    };

    const onWheel = (e: WheelEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey) return; // zoom / gestos
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // scroll horizontal
      if (document.querySelector('dialog[open]')) return;
      if (getComputedStyle(document.body).overflow === 'hidden') return; // modal aberto
      if (temScrollProprio(e.target as Element, e.deltaY)) return;

      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16; // linhas
      else if (e.deltaMode === 2) dy *= window.innerHeight; // páginas

      e.preventDefault();

      if (!animando) {
        alvo = atual = window.scrollY;
        ultimoTempo = 0;
      }
      alvo = Math.max(0, Math.min(maxScroll(), alvo + dy * VELOCIDADE));

      if (!animando) {
        animando = true;
        // Evita que o "scroll-behavior: smooth" do CSS duplique a suavização
        html.style.scrollBehavior = 'auto';
        raf = requestAnimationFrame(passo);
      }
    };

    // Scroll vindo de outras fontes (teclado, barra, âncoras): sincroniza
    const onScroll = () => {
      if (!animando) alvo = atual = window.scrollY;
    };

    const onInterromper = () => {
      if (animando) parar();
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onInterromper);
    window.addEventListener('pointerdown', onInterromper);
    window.addEventListener('resize', onInterromper);

    return () => {
      parar();
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onInterromper);
      window.removeEventListener('pointerdown', onInterromper);
      window.removeEventListener('resize', onInterromper);
    };
    // Reinicia a cada mudança de página (o Next.js repõe o scroll no topo)
  }, [pathname]);

  return null;
}
