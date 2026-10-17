-- ============================================================================
-- CASA C RESIDENCES — ARQUITETURA DE BANCO DE DADOS SUPABASE (POSTGRESQL)
-- Execute este ficheiro primeiro (1/2) no SQL Editor do seu projeto Supabase.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE PROPRIEDADES
CREATE TABLE IF NOT EXISTS public.propriedades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    subtitulo TEXT NOT NULL,
    localizacao TEXT NOT NULL,
    regiao TEXT NOT NULL,
    endereco TEXT NOT NULL,
    descricao_curta TEXT NOT NULL,
    descricao_completa TEXT NOT NULL,
    preco_noite NUMERIC(10, 2) NOT NULL,
    taxa_limpeza NUMERIC(10, 2) NOT NULL DEFAULT 120.00,
    taxa_servico_percentual NUMERIC(5, 2) NOT NULL DEFAULT 8.00,
    capacidade_maxima INTEGER NOT NULL DEFAULT 6,
    quartos INTEGER NOT NULL DEFAULT 3,
    camas INTEGER NOT NULL DEFAULT 4,
    casas_banho INTEGER NOT NULL DEFAULT 3,
    area_m2 INTEGER NOT NULL DEFAULT 220,
    estadia_minima_noites INTEGER NOT NULL DEFAULT 2,
    hora_checkin TEXT NOT NULL DEFAULT '15:00',
    hora_checkout TEXT NOT NULL DEFAULT '11:00',
    wifi_nome TEXT NOT NULL,
    wifi_senha TEXT NOT NULL,
    instrucoes_entrada TEXT NOT NULL,
    regras_casa JSONB NOT NULL DEFAULT '[]'::jsonb,
    comodidades JSONB NOT NULL DEFAULT '[]'::jsonb,
    imagem_principal TEXT NOT NULL,
    galeria JSONB NOT NULL DEFAULT '[]'::jsonb,
    fechadura_id TEXT NOT NULL,
    contacto_emergencia TEXT NOT NULL,
    destaque BOOLEAN NOT NULL DEFAULT true,
    ativa BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABELA DE FECHADURAS INTELIGENTES (SMART LOCKS)
CREATE TABLE IF NOT EXISTS public.fechaduras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    propriedade_id UUID NOT NULL REFERENCES public.propriedades(id) ON DELETE CASCADE,
    nome_dispositivo TEXT NOT NULL,
    marca TEXT NOT NULL CHECK (marca IN ('Nuki', 'Yale', 'August', 'Schlage')),
    modelo TEXT NOT NULL,
    device_id TEXT UNIQUE NOT NULL,
    bateria_percentual INTEGER NOT NULL DEFAULT 95,
    status_conexao TEXT NOT NULL DEFAULT 'online' CHECK (status_conexao IN ('online', 'offline')),
    ultima_sincronizacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABELA DE RESERVAS
CREATE TABLE IF NOT EXISTS public.reservas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_reserva TEXT UNIQUE NOT NULL,
    propriedade_id UUID NOT NULL REFERENCES public.propriedades(id) ON DELETE RESTRICT,
    hospede_nome TEXT NOT NULL,
    hospede_email TEXT NOT NULL,
    hospede_telefone TEXT NOT NULL,
    hospede_documento TEXT NOT NULL,
    data_checkin DATE NOT NULL,
    data_checkout DATE NOT NULL,
    noites INTEGER NOT NULL,
    num_hospedes INTEGER NOT NULL,
    valor_noites NUMERIC(10, 2) NOT NULL,
    taxa_limpeza NUMERIC(10, 2) NOT NULL,
    taxa_servico NUMERIC(10, 2) NOT NULL,
    valor_total NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmada' CHECK (status IN ('pendente', 'confirmada', 'checkin_ativo', 'concluida', 'cancelada')),
    pagamento_status TEXT NOT NULL DEFAULT 'aprovado' CHECK (pagamento_status IN ('pendente', 'aprovado', 'reembolsado', 'falhou')),
    pedidos_especiais TEXT,
    checkin_realizado_em TIMESTAMPTZ,
    checkout_realizado_em TIMESTAMPTZ,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT datas_validas CHECK (data_checkout > data_checkin)
);

-- 4. TABELA DE CÓDIGOS DE ACESSO TEMPORÁRIOS (PIN SMART LOCK)
CREATE TABLE IF NOT EXISTS public.codigos_acesso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reserva_id UUID NOT NULL REFERENCES public.reservas(id) ON DELETE CASCADE,
    fechadura_id UUID NOT NULL REFERENCES public.fechaduras(id) ON DELETE CASCADE,
    propriedade_id UUID NOT NULL REFERENCES public.propriedades(id) ON DELETE CASCADE,
    pin_code VARCHAR(6) NOT NULL,
    valido_de TIMESTAMPTZ NOT NULL,
    valido_ate TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'ativo', 'expirado', 'revogado')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABELA DE PAGAMENTOS
CREATE TABLE IF NOT EXISTS public.pagamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reserva_id UUID NOT NULL REFERENCES public.reservas(id) ON DELETE CASCADE,
    valor NUMERIC(10, 2) NOT NULL,
    moeda VARCHAR(3) NOT NULL DEFAULT 'EUR',
    metodo TEXT NOT NULL CHECK (metodo IN ('cartao_credito', 'mbway', 'pix', 'transferencia')),
    status TEXT NOT NULL DEFAULT 'aprovado' CHECK (status IN ('pendente', 'aprovado', 'reembolsado', 'falhou')),
    referencia_gateway TEXT NOT NULL,
    comprovativo_url TEXT,
    pago_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TABELA DE AVALIAÇÕES DE HÓSPEDES
CREATE TABLE IF NOT EXISTS public.avaliacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reserva_id UUID REFERENCES public.reservas(id) ON DELETE SET NULL,
    propriedade_id UUID NOT NULL REFERENCES public.propriedades(id) ON DELETE CASCADE,
    hospede_nome TEXT NOT NULL,
    nota_geral INTEGER NOT NULL CHECK (nota_geral BETWEEN 1 AND 5),
    nota_limpeza INTEGER NOT NULL CHECK (nota_limpeza BETWEEN 1 AND 5),
    nota_checkin INTEGER NOT NULL CHECK (nota_checkin BETWEEN 1 AND 5),
    nota_localizacao INTEGER NOT NULL CHECK (nota_localizacao BETWEEN 1 AND 5),
    comentario TEXT NOT NULL,
    publicada BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TABELA DE LOGS DE AUTOMAÇÃO (EMAILS / WHATSAPP / SMART LOCK)
CREATE TABLE IF NOT EXISTS public.automacoes_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reserva_id UUID NOT NULL REFERENCES public.reservas(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL,
    canal TEXT NOT NULL,
    destinatario TEXT NOT NULL,
    descricao TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'concluido',
    data_execucao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. TABELA DE BLOQUEIOS DE CALENDÁRIO (MANUTENÇÃO / USO PRÓPRIO)
CREATE TABLE IF NOT EXISTS public.bloqueios_calendario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    propriedade_id UUID NOT NULL REFERENCES public.propriedades(id) ON DELETE CASCADE,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    motivo TEXT NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- FUNÇÃO RPC: VERIFICAR DISPONIBILIDADE SEM CONFLITO DE DATAS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.verificar_disponibilidade(
    p_propriedade_id UUID,
    p_checkin DATE,
    p_checkout DATE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    conflitos_reserva INTEGER;
    conflitos_bloqueio INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO conflitos_reserva
    FROM public.reservas
    WHERE propriedade_id = p_propriedade_id
      AND status NOT IN ('cancelada')
      AND data_checkin < p_checkout
      AND data_checkout > p_checkin;

    SELECT COUNT(*)
    INTO conflitos_bloqueio
    FROM public.bloqueios_calendario
    WHERE propriedade_id = p_propriedade_id
      AND data_inicio < p_checkout
      AND data_fim > p_checkin;

    RETURN (conflitos_reserva = 0 AND conflitos_bloqueio = 0);
END;
$$;

-- ============================================================================
-- POLÍTICAS DE ARRANQUE (ABERTAS) — APENAS PARA INSTALAÇÃO INICIAL
-- ⚠️  Em produção execute a seguir o ficheiro seguranca.sql, que substitui
--     estas políticas. Se voltar a executar este ficheiro, volte a executar
--     também o seguranca.sql.
-- ============================================================================
ALTER TABLE public.propriedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fechaduras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.codigos_acesso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automacoes_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bloqueios_calendario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso completo propriedades" ON public.propriedades;
CREATE POLICY "Acesso completo propriedades" ON public.propriedades FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso completo fechaduras" ON public.fechaduras;
CREATE POLICY "Acesso completo fechaduras" ON public.fechaduras FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso completo reservas" ON public.reservas;
CREATE POLICY "Acesso completo reservas" ON public.reservas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso completo codigos_acesso" ON public.codigos_acesso;
CREATE POLICY "Acesso completo codigos_acesso" ON public.codigos_acesso FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso completo pagamentos" ON public.pagamentos;
CREATE POLICY "Acesso completo pagamentos" ON public.pagamentos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso completo avaliacoes" ON public.avaliacoes;
CREATE POLICY "Acesso completo avaliacoes" ON public.avaliacoes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso completo automacoes_logs" ON public.automacoes_logs;
CREATE POLICY "Acesso completo automacoes_logs" ON public.automacoes_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso completo bloqueios_calendario" ON public.bloqueios_calendario;
CREATE POLICY "Acesso completo bloqueios_calendario" ON public.bloqueios_calendario FOR ALL USING (true) WITH CHECK (true);
