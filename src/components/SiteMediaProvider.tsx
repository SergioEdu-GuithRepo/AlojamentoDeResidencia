'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { MediaService, PADROES_SITE, GALERIA_PADRAO, type MapaMedia, type ItemGaleria } from '@/lib/media';

interface SiteMediaContexto {
  media: MapaMedia;
  galeria: ItemGaleria[];
  recarregar: () => Promise<void>;
}

const Contexto = createContext<SiteMediaContexto>({
  media: {},
  galeria: GALERIA_PADRAO,
  recarregar: async () => {},
});

/**
 * Disponibiliza a todas as páginas as fotografias geridas no painel admin.
 * Os dados iniciais vêm do servidor (sem "piscar" de imagens antigas).
 */
export function SiteMediaProvider({
  initialMedia,
  initialGaleria,
  children,
}: {
  initialMedia: MapaMedia;
  initialGaleria: ItemGaleria[];
  children: React.ReactNode;
}) {
  const [media, setMedia] = useState<MapaMedia>(initialMedia);
  const [galeria, setGaleria] = useState<ItemGaleria[]>(initialGaleria);

  const recarregar = useCallback(async () => {
    const [m, g] = await Promise.all([MediaService.getSiteMedia(), MediaService.getGaleria()]);
    setMedia(m);
    setGaleria(g);
  }, []);

  // Sincroniza no browser (modo local, ou se o servidor não conseguiu contactar o Supabase)
  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return (
    <Contexto.Provider value={{ media, galeria, recarregar }}>{children}</Contexto.Provider>
  );
}

export function useSiteMedia() {
  const ctx = useContext(Contexto);
  /** Devolve a fotografia definida no admin ou a original de demonstração. */
  const img = useCallback(
    (chave: string) => ctx.media[chave] || PADROES_SITE[chave] || '',
    [ctx.media]
  );
  return { ...ctx, img };
}
