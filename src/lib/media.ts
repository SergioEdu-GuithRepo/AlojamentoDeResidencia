/**
 * Gestão de fotografias e vídeos do site.
 * - Ficheiros carregados do computador vão para o Supabase Storage (bucket "media")
 * - Os URLs ficam guardados na base de dados (site_media, galeria_site, propriedades)
 * - Sem Supabase configurado, funciona em modo local (localStorage) apenas para imagens
 */
import { supabase, isSupabaseConfigured } from './supabase';

export const MEDIA_BUCKET = 'media';

const LS_SITE_MEDIA = 'casa_aoa_v2_site_media';
const LS_GALERIA = 'casa_aoa_v2_galeria_site';

const MAX_IMAGEM_MB = 25;
const MAX_VIDEO_MB = 50;

// ============================================================================
// ESPAÇOS DE FOTOGRAFIA FIXOS DO SITE
// ============================================================================
export type TipoMedia = 'imagem' | 'video';

export interface SlotMedia {
  chave: string;
  grupo: string;
  rotulo: string;
  tipo: TipoMedia;
  padrao: string;
  dica?: string;
}

const u = (id: string, w = 2000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;

export const SLOTS_SITE: SlotMedia[] = [
  {
    chave: 'hero_video',
    grupo: 'Topo das páginas',
    rotulo: 'Vídeo de fundo do topo',
    tipo: 'video',
    padrao:
      'https://assets.mixkit.co/videos/preview/mixkit-luxury-resort-pool-with-palm-trees-42874-large.mp4',
    dica: 'MP4 até 50 MB. Aparece no topo de todas as páginas.',
  },
  {
    chave: 'hero_poster',
    grupo: 'Topo das páginas',
    rotulo: 'Imagem do topo (mostrada enquanto o vídeo carrega)',
    tipo: 'imagem',
    padrao: u('photo-1545324418-cc1a3fa10c00'),
    dica: 'Formato horizontal, mínimo 1920 px de largura.',
  },
  {
    chave: 'inicio_foto_1',
    grupo: 'Página inicial',
    rotulo: 'Fotografia panorâmica 1 — após "Residências Privadas"',
    tipo: 'imagem',
    padrao: u('photo-1545324418-cc1a3fa10c00'),
  },
  {
    chave: 'inicio_foto_2',
    grupo: 'Página inicial',
    rotulo: 'Fotografia panorâmica 2 — após "Desfrutar, Relaxar"',
    tipo: 'imagem',
    padrao: u('photo-1580587771525-78b9dba3b914'),
  },
  {
    chave: 'inicio_foto_3',
    grupo: 'Página inicial',
    rotulo: 'Fotografia panorâmica 3 — após "Costa Atlântica"',
    tipo: 'imagem',
    padrao: u('photo-1567899378494-47b22a2ae96a'),
  },
  {
    chave: 'residencias_topo',
    grupo: 'Página Residências',
    rotulo: 'Imagem do topo',
    tipo: 'imagem',
    padrao: u('photo-1600585154340-be6161a56a0c'),
  },
  {
    chave: 'residencias_destaque',
    grupo: 'Página Residências',
    rotulo: 'Fotografia de destaque (16:9)',
    tipo: 'imagem',
    padrao: u('photo-1600585154340-be6161a56a0c'),
  },
  {
    chave: 'residencias_vertical_1',
    grupo: 'Página Residências',
    rotulo: 'Fotografia vertical — esquerda',
    tipo: 'imagem',
    padrao: u('photo-1600566753190-17f0baa2a6c3', 1200),
  },
  {
    chave: 'residencias_vertical_2',
    grupo: 'Página Residências',
    rotulo: 'Fotografia vertical — direita',
    tipo: 'imagem',
    padrao: u('photo-1600566753376-12c8ab7fb75b', 1200),
  },
  {
    chave: 'residencias_detalhe',
    grupo: 'Página Residências',
    rotulo: 'Fotografia "Atenção ao Detalhe"',
    tipo: 'imagem',
    padrao: u('photo-1600210492486-724fe5c67fb0'),
  },
  {
    chave: 'residencias_faixa_1',
    grupo: 'Página Residências',
    rotulo: 'Faixa inferior — fotografia 1',
    tipo: 'imagem',
    padrao: u('photo-1540555700478-4be289fbecef', 900),
  },
  {
    chave: 'residencias_faixa_2',
    grupo: 'Página Residências',
    rotulo: 'Faixa inferior — fotografia 2',
    tipo: 'imagem',
    padrao: u('photo-1584132967334-10e028bd69f7', 900),
  },
];

export const PADROES_SITE: Record<string, string> = Object.fromEntries(
  SLOTS_SITE.map((s) => [s.chave, s.padrao])
);

export type MapaMedia = Record<string, string>;

// ============================================================================
// GALERIA DA PÁGINA INICIAL
// ============================================================================
export const CATEGORIAS_GALERIA = ['RESIDÊNCIAS', 'EXTERIOR', 'COMODIDADES', 'GASTRONOMIA'] as const;
export type CategoriaGaleria = (typeof CATEGORIAS_GALERIA)[number];

export interface ItemGaleria {
  id: string;
  categoria: CategoriaGaleria;
  imagem_url: string;
  legenda: string;
  residencia: string;
  ordem: number;
}

export const GALERIA_PADRAO: ItemGaleria[] = [
  ['RESIDÊNCIAS', 'photo-1600585154340-be6161a56a0c', 'SALÃO DE ESTAR, SALA DE JANTAR E COZINHA — VILLA ATLÂNTICA MUSSULO', 'VILLA ATLÂNTICA · MUSSULO'],
  ['RESIDÊNCIAS', 'photo-1600566753376-12c8ab7fb75b', 'COZINHA DE CHEF E SALA DE REFEIÇÕES — RESIDÊNCIA MIRADOURO TALATONA', 'RESIDÊNCIA MIRADOURO · TALATONA'],
  ['RESIDÊNCIAS', 'photo-1600210492486-724fe5c67fb0', 'SUÍTE MASTER E TERRAÇO PRIVATIVO — PENTHOUSE BAÍA ATELIER', 'PENTHOUSE BAÍA · LUANDA'],
  ['RESIDÊNCIAS', 'photo-1600566752355-35792bedcfea', 'BANHO REVESTIDO A MÁRMORE ITALIANO — CASA DAS DUNAS CABO LEDO', 'CASA DAS DUNAS · CABO LEDO'],
  ['EXTERIOR', 'photo-1613490493576-7fde63acd811', 'PISCINA INFINITA CLIMATIZADA E DECK EM TECA — PENÍNSULA DO MUSSULO', 'VILLA ATLÂNTICA · MUSSULO'],
  ['EXTERIOR', 'photo-1512917774080-9991f1c4c750', 'ARQUITETURA ORGÂNICA EM PAVILHÕES — PRAIA DE CABO LEDO', 'CASA DAS DUNAS · CABO LEDO'],
  ['COMODIDADES', 'photo-1540555700478-4be289fbecef', 'SPA DE BEM-ESTAR PRIVADO, SAUNA PANORÂMICA E CONCIERGE 24H', 'COLEÇÃO MR. C RESIDÊNCIAS'],
  ['GASTRONOMIA', 'photo-1600607687939-ce8a6c25118c', 'TERRAÇO DE JANTAR PRIVADO & HOSPITALIDADE DE EXCELÊNCIA', 'COLEÇÃO MR. C RESIDÊNCIAS'],
].map(([categoria, foto, legenda, residencia], i) => ({
  id: `gal-${i + 1}`,
  categoria: categoria as CategoriaGaleria,
  imagem_url: u(foto, 1600),
  legenda,
  residencia,
  ordem: i + 1,
}));

// ============================================================================
// UTILITÁRIOS LOCAIS
// ============================================================================
function lerLocal<T>(chave: string, padrao: T): T {
  if (typeof window === 'undefined') return padrao;
  try {
    const raw = window.localStorage.getItem(chave);
    return raw ? (JSON.parse(raw) as T) : padrao;
  } catch {
    return padrao;
  }
}

function gravarLocal<T>(chave: string, dados: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(chave, JSON.stringify(dados));
  } catch {
    throw new Error(
      'Espaço local esgotado. Configure o Supabase para armazenar fotografias sem limites.'
    );
  }
}

function blobParaDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Não foi possível ler o ficheiro.'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Redimensiona e comprime a imagem no browser antes do envio
 * (fotografias de telemóvel com 8–12 MB ficam com ~300–800 KB).
 */
async function comprimirImagem(file: File, maxLado = 2400, qualidade = 0.85): Promise<Blob> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return file;
  }
  try {
    const bitmap = await createImageBitmap(file);
    const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * escala);
    const h = Math.round(bitmap.height * escala);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();

    const paraBlob = (tipo: string) =>
      new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, tipo, qualidade));

    let blob = await paraBlob('image/webp');
    if (!blob || blob.type !== 'image/webp') blob = await paraBlob('image/jpeg');
    if (!blob) return file;
    return blob.size < file.size || escala < 1 ? blob : file;
  } catch {
    return file;
  }
}

function extensaoPara(tipo: string, nome: string): string {
  const mapa: Record<string, string> = {
    'image/webp': 'webp',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/avif': 'avif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
  };
  return mapa[tipo] || nome.split('.').pop()?.toLowerCase() || 'bin';
}

// ============================================================================
// UPLOAD / REMOÇÃO DE FICHEIROS
// ============================================================================

/** Carrega um ficheiro do computador e devolve o URL público. */
export async function carregarFicheiro(file: File, pasta: string): Promise<string> {
  const ehVideo = file.type.startsWith('video/');
  const ehImagem = file.type.startsWith('image/');

  if (!ehVideo && !ehImagem) {
    throw new Error('Formato não suportado. Utilize JPG, PNG, WebP ou MP4.');
  }
  if (ehImagem && file.size > MAX_IMAGEM_MB * 1024 * 1024) {
    throw new Error(`Imagem demasiado grande (máx. ${MAX_IMAGEM_MB} MB).`);
  }
  if (ehVideo && file.size > MAX_VIDEO_MB * 1024 * 1024) {
    throw new Error(`Vídeo demasiado grande (máx. ${MAX_VIDEO_MB} MB).`);
  }

  if (isSupabaseConfigured && supabase) {
    const blob = ehImagem ? await comprimirImagem(file) : file;
    const tipo = blob.type || file.type;
    const caminho = `${pasta}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensaoPara(tipo, file.name)}`;

    const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(caminho, blob, {
      contentType: tipo,
      cacheControl: '31536000',
      upsert: false,
    });
    if (error) {
      throw new Error(
        `Falha no envio: ${error.message}. Confirme que executou o ficheiro supabase/media.sql.`
      );
    }
    return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(caminho).data.publicUrl;
  }

  if (ehVideo) {
    throw new Error('O envio de vídeos requer o Supabase configurado.');
  }
  // Modo local: imagem reduzida guardada como Data URL
  return blobParaDataUrl(await comprimirImagem(file, 1600, 0.8));
}

/** Indica se o URL pertence ao armazenamento do site (e pode ser apagado). */
export function ehFicheiroInterno(url?: string | null): boolean {
  return Boolean(url && url.includes(`/storage/v1/object/public/${MEDIA_BUCKET}/`));
}

/** Remove ficheiros do Storage (ignora URLs externos). */
export async function removerFicheiros(urls: (string | null | undefined)[]): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  const marcador = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
  const caminhos = urls
    .filter((url): url is string => ehFicheiroInterno(url))
    .map((url) => decodeURIComponent(url.slice(url.indexOf(marcador) + marcador.length).split('?')[0]));
  if (caminhos.length === 0) return;
  try {
    await supabase.storage.from(MEDIA_BUCKET).remove(caminhos);
  } catch {
    // remoção é "best-effort": não bloqueia a operação principal
  }
}

// ============================================================================
// SERVIÇO: FOTOGRAFIAS DO SITE + GALERIA
// ============================================================================
export const MediaService = {
  async getSiteMedia(): Promise<MapaMedia> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('site_media').select('chave, url');
        if (!error && data) {
          return Object.fromEntries(data.map((r) => [String(r.chave), String(r.url)]));
        }
      } catch {
        // tabela ainda não criada ou rede indisponível
      }
      return {};
    }
    return lerLocal<MapaMedia>(LS_SITE_MEDIA, {});
  },

  async definirSiteMedia(chave: string, url: string): Promise<void> {
    const anterior = (await this.getSiteMedia())[chave];
    const slot = SLOTS_SITE.find((s) => s.chave === chave);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('site_media').upsert({
        chave,
        url,
        tipo: slot?.tipo || 'imagem',
        atualizado_em: new Date().toISOString(),
      });
      if (error) throw new Error(`Erro ao guardar: ${error.message}`);
    } else {
      gravarLocal(LS_SITE_MEDIA, { ...lerLocal<MapaMedia>(LS_SITE_MEDIA, {}), [chave]: url });
    }

    if (anterior && anterior !== url) await removerFicheiros([anterior]);
  },

  async reporSiteMedia(chave: string): Promise<void> {
    const anterior = (await this.getSiteMedia())[chave];
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('site_media').delete().eq('chave', chave);
      if (error) throw new Error(`Erro ao repor: ${error.message}`);
    } else {
      const atual = lerLocal<MapaMedia>(LS_SITE_MEDIA, {});
      delete atual[chave];
      gravarLocal(LS_SITE_MEDIA, atual);
    }
    await removerFicheiros([anterior]);
  },

  async getGaleria(): Promise<ItemGaleria[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('galeria_site')
          .select('*')
          .order('ordem', { ascending: true })
          .order('criado_em', { ascending: true });
        if (!error && data) {
          return data.map((r) => ({
            id: String(r.id),
            categoria: r.categoria as CategoriaGaleria,
            imagem_url: String(r.imagem_url),
            legenda: String(r.legenda ?? ''),
            residencia: String(r.residencia ?? ''),
            ordem: Number(r.ordem ?? 0),
          }));
        }
      } catch {
        // tabela ainda não criada
      }
      return GALERIA_PADRAO;
    }
    return lerLocal<ItemGaleria[]>(LS_GALERIA, GALERIA_PADRAO);
  },

  async adicionarItemGaleria(item: Omit<ItemGaleria, 'id' | 'ordem'>): Promise<void> {
    const atuais = await this.getGaleria();
    const ordem = atuais.reduce((max, i) => Math.max(max, i.ordem), 0) + 1;

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('galeria_site').insert({ ...item, ordem });
      if (error) {
        throw new Error(`Erro ao adicionar: ${error.message}. Executou supabase/media.sql?`);
      }
      return;
    }
    gravarLocal(LS_GALERIA, [...atuais, { ...item, id: `gal-${Date.now()}`, ordem }]);
  },

  async atualizarItemGaleria(
    id: string,
    alteracoes: Partial<Omit<ItemGaleria, 'id'>>
  ): Promise<void> {
    const atuais = await this.getGaleria();
    const anterior = atuais.find((i) => i.id === id);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('galeria_site').update(alteracoes).eq('id', id);
      if (error) throw new Error(`Erro ao atualizar: ${error.message}`);
    } else {
      gravarLocal(
        LS_GALERIA,
        atuais.map((i) => (i.id === id ? { ...i, ...alteracoes } : i))
      );
    }

    if (alteracoes.imagem_url && anterior && anterior.imagem_url !== alteracoes.imagem_url) {
      await removerFicheiros([anterior.imagem_url]);
    }
  },

  async removerItemGaleria(item: ItemGaleria): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('galeria_site').delete().eq('id', item.id);
      if (error) throw new Error(`Erro ao eliminar: ${error.message}`);
    } else {
      const atuais = await this.getGaleria();
      gravarLocal(LS_GALERIA, atuais.filter((i) => i.id !== item.id));
    }
    await removerFicheiros([item.imagem_url]);
  },

  async reordenarGaleria(idsOrdenados: string[]): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await Promise.all(
        idsOrdenados.map((id, i) =>
          supabase!.from('galeria_site').update({ ordem: i + 1 }).eq('id', id)
        )
      );
      return;
    }
    const atuais = await this.getGaleria();
    gravarLocal(
      LS_GALERIA,
      idsOrdenados
        .map((id, i) => {
          const item = atuais.find((a) => a.id === id);
          return item ? { ...item, ordem: i + 1 } : null;
        })
        .filter(Boolean)
    );
  },
};
