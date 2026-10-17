-- ============================================================================
-- CASA C RESIDENCES — GESTÃO DE FOTOGRAFIAS E VÍDEOS (3/3)
-- Execute este ficheiro no SQL Editor do Supabase DEPOIS de schema.sql e seed.sql.
-- É seguro executá-lo mais do que uma vez.
--
-- Cria:
--   1. Bucket público "media" no Supabase Storage (ficheiros carregados do PC)
--   2. Tabela site_media   -> fotografias/vídeo fixos do site (topo, painéis, etc.)
--   3. Tabela galeria_site -> itens da secção "A Galeria" da página inicial
--   4. Permite eliminar residências (as reservas associadas são removidas em cascata)
--
-- ⚠️  As políticas aqui são abertas (instalação). Execute depois seguranca.sql
--     — e volte a executá-lo sempre que re-executar este ficheiro.
-- ============================================================================

-- 1. BUCKET DE ARMAZENAMENTO -------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'media',
    'media',
    true,
    52428800, -- 50 MB por ficheiro
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Media leitura publica" ON storage.objects;
CREATE POLICY "Media leitura publica" ON storage.objects
    FOR SELECT USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Media carregar" ON storage.objects;
CREATE POLICY "Media carregar" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "Media atualizar" ON storage.objects;
CREATE POLICY "Media atualizar" ON storage.objects
    FOR UPDATE USING (bucket_id = 'media') WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "Media eliminar" ON storage.objects;
CREATE POLICY "Media eliminar" ON storage.objects
    FOR DELETE USING (bucket_id = 'media');

-- 2. FOTOGRAFIAS FIXAS DO SITE ----------------------------------------------
-- Cada "chave" corresponde a um espaço do site (ex.: inicio_foto_1).
-- Se a chave não existir, o site usa a fotografia original de demonstração.
CREATE TABLE IF NOT EXISTS public.site_media (
    chave TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'imagem' CHECK (tipo IN ('imagem', 'video')),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. GALERIA DA PÁGINA INICIAL ----------------------------------------------
CREATE TABLE IF NOT EXISTS public.galeria_site (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    categoria TEXT NOT NULL DEFAULT 'RESIDÊNCIAS'
        CHECK (categoria IN ('RESIDÊNCIAS', 'EXTERIOR', 'COMODIDADES', 'GASTRONOMIA')),
    imagem_url TEXT NOT NULL,
    legenda TEXT NOT NULL DEFAULT '',
    residencia TEXT NOT NULL DEFAULT '',
    ordem INTEGER NOT NULL DEFAULT 0,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Itens iniciais (apenas se a galeria estiver vazia)
INSERT INTO public.galeria_site (categoria, imagem_url, legenda, residencia, ordem)
SELECT * FROM (VALUES
    ('RESIDÊNCIAS', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85', 'SALÃO DE ESTAR, SALA DE JANTAR E COZINHA — VILLA ATLÂNTICA MUSSULO', 'VILLA ATLÂNTICA · MUSSULO', 1),
    ('RESIDÊNCIAS', 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85', 'COZINHA DE CHEF E SALA DE REFEIÇÕES — RESIDÊNCIA MIRADOURO TALATONA', 'RESIDÊNCIA MIRADOURO · TALATONA', 2),
    ('RESIDÊNCIAS', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85', 'SUÍTE MASTER E TERRAÇO PRIVATIVO — PENTHOUSE BAÍA ATELIER', 'PENTHOUSE BAÍA · LUANDA', 3),
    ('RESIDÊNCIAS', 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1600&q=85', 'BANHO REVESTIDO A MÁRMORE ITALIANO — CASA DAS DUNAS CABO LEDO', 'CASA DAS DUNAS · CABO LEDO', 4),
    ('EXTERIOR', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85', 'PISCINA INFINITA CLIMATIZADA E DECK EM TECA — PENÍNSULA DO MUSSULO', 'VILLA ATLÂNTICA · MUSSULO', 5),
    ('EXTERIOR', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85', 'ARQUITETURA ORGÂNICA EM PAVILHÕES — PRAIA DE CABO LEDO', 'CASA DAS DUNAS · CABO LEDO', 6),
    ('COMODIDADES', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=85', 'SPA DE BEM-ESTAR PRIVADO, SAUNA PANORÂMICA E CONCIERGE 24H', 'COLEÇÃO MR. C RESIDÊNCIAS', 7),
    ('GASTRONOMIA', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85', 'TERRAÇO DE JANTAR PRIVADO & HOSPITALIDADE DE EXCELÊNCIA', 'COLEÇÃO MR. C RESIDÊNCIAS', 8)
) AS v(categoria, imagem_url, legenda, residencia, ordem)
WHERE NOT EXISTS (SELECT 1 FROM public.galeria_site);

ALTER TABLE public.site_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galeria_site ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso completo site_media" ON public.site_media;
CREATE POLICY "Acesso completo site_media" ON public.site_media FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso completo galeria_site" ON public.galeria_site;
CREATE POLICY "Acesso completo galeria_site" ON public.galeria_site FOR ALL USING (true) WITH CHECK (true);

-- 4. PERMITIR ELIMINAR RESIDÊNCIAS ------------------------------------------
-- Antes: ON DELETE RESTRICT (impedia eliminar residências com reservas).
ALTER TABLE public.reservas DROP CONSTRAINT IF EXISTS reservas_propriedade_id_fkey;
ALTER TABLE public.reservas
    ADD CONSTRAINT reservas_propriedade_id_fkey
    FOREIGN KEY (propriedade_id) REFERENCES public.propriedades(id) ON DELETE CASCADE;
