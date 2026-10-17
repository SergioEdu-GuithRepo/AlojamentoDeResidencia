-- ============================================================================
-- MR. C RESIDÊNCIAS — SEGURANÇA DE PRODUÇÃO
-- Execute DEPOIS de schema.sql, seed.sql e media.sql (pode ser re-executado).
--
-- O que este ficheiro faz:
--   • Só administradores autenticados (tabela public.administradores) podem
--     criar / editar / eliminar residências, fotografias, reservas, PINs, etc.
--   • Visitantes só LEEM o conteúdo público (residências ativas, fotos,
--     avaliações publicadas).
--   • Hóspedes reservam, consultam a reserva, fazem check-out e avaliam
--     apenas através de funções seguras (RPC) que validam preços, datas e
--     exigem CÓDIGO + EMAIL da reserva.
--
-- ⚠️  ANTES DE EXECUTAR: altere o email na secção 1 para o email da conta
--     de administrador que criou em Authentication → Users.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ADMINISTRADORES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.administradores (
    email TEXT PRIMARY KEY,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- >>> ALTERE AQUI para o(s) email(s) do(s) administrador(es) <<<
INSERT INTO public.administradores (email) VALUES
    ('sergio.eduardo.kuroko@gmail.com')
ON CONFLICT (email) DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.administradores a
        WHERE lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    );
$$;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

ALTER TABLE public.administradores ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 2. REMOVER TODAS AS POLÍTICAS ABERTAS ANTERIORES
-- ----------------------------------------------------------------------------
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN
        SELECT policyname, tablename FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN (
              'propriedades', 'fechaduras', 'reservas', 'codigos_acesso',
              'pagamentos', 'avaliacoes', 'automacoes_logs',
              'bloqueios_calendario', 'site_media', 'galeria_site',
              'administradores'
          )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 3. NOVAS POLÍTICAS (RLS)
-- ----------------------------------------------------------------------------
-- Administradores: cada admin só vê a própria linha; ninguém escreve via API.
CREATE POLICY "Admin ve propria conta" ON public.administradores
    FOR SELECT TO authenticated
    USING (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- Conteúdo público: leitura para todos, escrita só admin.
CREATE POLICY "Leitura publica residencias ativas" ON public.propriedades
    FOR SELECT USING (ativa OR public.is_admin());
CREATE POLICY "Admin gere residencias" ON public.propriedades
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Leitura publica site_media" ON public.site_media
    FOR SELECT USING (true);
CREATE POLICY "Admin gere site_media" ON public.site_media
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Leitura publica galeria_site" ON public.galeria_site
    FOR SELECT USING (true);
CREATE POLICY "Admin gere galeria_site" ON public.galeria_site
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Leitura publica avaliacoes publicadas" ON public.avaliacoes
    FOR SELECT USING (publicada OR public.is_admin());
CREATE POLICY "Admin gere avaliacoes" ON public.avaliacoes
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Dados privados (hóspedes, PINs, pagamentos, fechaduras): só admin.
CREATE POLICY "Admin gere fechaduras" ON public.fechaduras
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin gere reservas" ON public.reservas
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin gere codigos_acesso" ON public.codigos_acesso
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin gere pagamentos" ON public.pagamentos
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin gere automacoes_logs" ON public.automacoes_logs
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin gere bloqueios" ON public.bloqueios_calendario
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. STORAGE (bucket "media"): leitura pública, escrita só admin
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Media leitura publica" ON storage.objects;
DROP POLICY IF EXISTS "Media carregar" ON storage.objects;
DROP POLICY IF EXISTS "Media atualizar" ON storage.objects;
DROP POLICY IF EXISTS "Media eliminar" ON storage.objects;

CREATE POLICY "Media leitura publica" ON storage.objects
    FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Media carregar" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "Media atualizar" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'media' AND public.is_admin())
    WITH CHECK (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "Media eliminar" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.is_admin());

-- ----------------------------------------------------------------------------
-- 5. FUNÇÕES PÚBLICAS SEGURAS (RPC) PARA HÓSPEDES
-- ----------------------------------------------------------------------------

-- 5.1 Datas ocupadas (sem dados pessoais) — usado no calendário/disponibilidade
CREATE OR REPLACE FUNCTION public.datas_ocupadas(p_propriedade_id UUID)
RETURNS TABLE (inicio DATE, fim DATE)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT r.data_checkin, r.data_checkout FROM public.reservas r
    WHERE r.propriedade_id = p_propriedade_id AND r.status <> 'cancelada'
    UNION ALL
    SELECT b.data_inicio, b.data_fim FROM public.bloqueios_calendario b
    WHERE b.propriedade_id = p_propriedade_id;
$$;
GRANT EXECUTE ON FUNCTION public.datas_ocupadas(UUID) TO anon, authenticated;

-- Formatação "1.234.567 Kz"
CREATE OR REPLACE FUNCTION public.formatar_kz(v NUMERIC)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT replace(to_char(round(coalesce(v, 0)), 'FM999,999,999,999'), ',', '.') || ' Kz';
$$;

-- 5.2 Criar reserva — preço calculado no servidor, sem sobreposição de datas
CREATE OR REPLACE FUNCTION public.criar_reserva(
    p_propriedade_id UUID,
    p_nome TEXT,
    p_email TEXT,
    p_telefone TEXT,
    p_documento TEXT,
    p_checkin DATE,
    p_checkout DATE,
    p_num_hospedes INTEGER,
    p_metodo TEXT,
    p_pedidos TEXT DEFAULT ''
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_prop public.propriedades%ROWTYPE;
    v_noites INTEGER;
    v_subtotal NUMERIC;
    v_servico NUMERIC;
    v_total NUMERIC;
    v_codigo TEXT;
    v_pin TEXT;
    v_reserva_id UUID;
    v_fechadura UUID;
    v_email TEXT := lower(trim(coalesce(p_email, '')));
    v_admin BOOLEAN := public.is_admin();
BEGIN
    -- Bloqueia a linha da residência: reservas simultâneas ficam em fila.
    SELECT * INTO v_prop FROM public.propriedades
    WHERE id = p_propriedade_id AND (ativa OR v_admin)
    FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Residência não encontrada.';
    END IF;

    IF length(trim(coalesce(p_nome, ''))) < 2 OR length(p_nome) > 120 THEN
        RAISE EXCEPTION 'Nome do titular inválido.';
    END IF;
    IF v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' OR length(v_email) > 160 THEN
        RAISE EXCEPTION 'Email inválido.';
    END IF;
    IF length(trim(coalesce(p_telefone, ''))) < 6 OR length(p_telefone) > 40 THEN
        RAISE EXCEPTION 'Telefone inválido.';
    END IF;
    IF length(trim(coalesce(p_documento, ''))) < 3 OR length(p_documento) > 60 THEN
        RAISE EXCEPTION 'Documento de identificação inválido.';
    END IF;
    IF length(coalesce(p_pedidos, '')) > 1000 THEN
        RAISE EXCEPTION 'Pedidos especiais demasiado longos (máx. 1000 caracteres).';
    END IF;
    IF p_metodo NOT IN ('cartao_credito', 'mbway', 'pix', 'transferencia') THEN
        RAISE EXCEPTION 'Método de pagamento inválido.';
    END IF;

    IF p_checkin IS NULL OR p_checkout IS NULL OR p_checkout <= p_checkin THEN
        RAISE EXCEPTION 'Selecione uma data de check-out posterior ao check-in.';
    END IF;
    IF p_checkin < (now() AT TIME ZONE 'Africa/Luanda')::date THEN
        RAISE EXCEPTION 'A data de check-in já passou.';
    END IF;

    v_noites := p_checkout - p_checkin;
    IF v_noites < v_prop.estadia_minima_noites THEN
        RAISE EXCEPTION 'Estadia mínima de % noites para esta residência.', v_prop.estadia_minima_noites;
    END IF;
    IF v_noites > 365 THEN
        RAISE EXCEPTION 'Estadia máxima de 365 noites.';
    END IF;
    IF p_num_hospedes IS NULL OR p_num_hospedes < 1 OR p_num_hospedes > v_prop.capacidade_maxima THEN
        RAISE EXCEPTION 'Número de hóspedes inválido (máx. %).', v_prop.capacidade_maxima;
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.reservas
        WHERE propriedade_id = p_propriedade_id AND status <> 'cancelada'
          AND data_checkin < p_checkout AND data_checkout > p_checkin
    ) OR EXISTS (
        SELECT 1 FROM public.bloqueios_calendario
        WHERE propriedade_id = p_propriedade_id
          AND data_inicio < p_checkout AND data_fim > p_checkin
    ) THEN
        RAISE EXCEPTION 'As datas selecionadas já se encontram reservadas ou bloqueadas no calendário.';
    END IF;

    v_subtotal := round(v_noites * v_prop.preco_noite);
    v_servico := round(v_subtotal * v_prop.taxa_servico_percentual / 100);
    v_total := round(v_subtotal + v_prop.taxa_limpeza + v_servico);

    LOOP
        v_codigo := 'CAS-' || to_char(now(), 'YYYY') || '-' ||
                    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.reservas WHERE codigo_reserva = v_codigo);
    END LOOP;
    v_pin := (100000 + floor(random() * 900000))::INTEGER::TEXT;

    INSERT INTO public.reservas (
        codigo_reserva, propriedade_id, hospede_nome, hospede_email, hospede_telefone,
        hospede_documento, data_checkin, data_checkout, noites, num_hospedes,
        valor_noites, taxa_limpeza, taxa_servico, valor_total, status,
        pagamento_status, pedidos_especiais
    ) VALUES (
        v_codigo, v_prop.id, trim(p_nome), v_email, trim(p_telefone),
        trim(p_documento), p_checkin, p_checkout, v_noites, p_num_hospedes,
        v_subtotal, v_prop.taxa_limpeza, v_servico, v_total, 'confirmada',
        'aprovado', coalesce(p_pedidos, '')
    ) RETURNING id INTO v_reserva_id;

    SELECT id INTO v_fechadura FROM public.fechaduras
    WHERE propriedade_id = v_prop.id LIMIT 1;

    IF v_fechadura IS NOT NULL THEN
        INSERT INTO public.codigos_acesso (
            reserva_id, fechadura_id, propriedade_id, pin_code, valido_de, valido_ate, status
        ) VALUES (
            v_reserva_id, v_fechadura, v_prop.id, v_pin,
            (p_checkin::text || ' ' || v_prop.hora_checkin)::timestamp AT TIME ZONE 'Africa/Luanda',
            (p_checkout::text || ' ' || v_prop.hora_checkout)::timestamp AT TIME ZONE 'Africa/Luanda',
            'ativo'
        );
    END IF;

    INSERT INTO public.pagamentos (
        reserva_id, valor, moeda, metodo, status, referencia_gateway, comprovativo_url
    ) VALUES (
        v_reserva_id, v_total, 'AOA', p_metodo, 'aprovado',
        'AOA_' || upper(p_metodo) || '_' || (10000000 + floor(random() * 90000000))::BIGINT,
        '/reserva/' || v_codigo
    );

    INSERT INTO public.automacoes_logs (reserva_id, tipo, canal, destinatario, descricao, status) VALUES
        (v_reserva_id, 'EMAIL_CONFIRMACAO', 'Email', v_email,
         'Confirmação e recibo (' || public.formatar_kz(v_total) || ') da reserva ' || v_codigo || ' enviados.', 'enviado'),
        (v_reserva_id, 'GERACAO_PIN_SMARTLOCK', 'SmartLock API', v_prop.nome,
         CASE WHEN v_fechadura IS NULL
              THEN 'Sem fechadura associada — PIN não emitido.'
              ELSE 'Código PIN sincronizado na fechadura inteligente (' || p_checkin || ' a ' || p_checkout || ').' END,
         CASE WHEN v_fechadura IS NULL THEN 'pendente' ELSE 'concluido' END),
        (v_reserva_id, 'WHATSAPP_INSTRUCOES_24H', 'WhatsApp', trim(p_telefone),
         'Credenciais digitais e localização disponibilizadas no Portal do Hóspede.', 'enviado');

    RETURN v_codigo;
END;
$$;
GRANT EXECUTE ON FUNCTION public.criar_reserva(UUID, TEXT, TEXT, TEXT, TEXT, DATE, DATE, INTEGER, TEXT, TEXT)
    TO anon, authenticated;

-- Auxiliar: localiza reserva por código + email (admins dispensam o email)
CREATE OR REPLACE FUNCTION public._reserva_do_hospede(p_codigo TEXT, p_email TEXT)
RETURNS public.reservas
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT r.* FROM public.reservas r
    WHERE upper(r.codigo_reserva) = upper(trim(coalesce(p_codigo, '')))
      AND (public.is_admin() OR lower(r.hospede_email) = lower(trim(coalesce(p_email, ''))))
    LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public._reserva_do_hospede(TEXT, TEXT) FROM PUBLIC, anon, authenticated;

-- 5.3 Consultar reserva (código + email)
CREATE OR REPLACE FUNCTION public.obter_reserva(p_codigo TEXT, p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_res public.reservas;
BEGIN
    v_res := public._reserva_do_hospede(p_codigo, p_email);
    IF v_res.id IS NULL THEN
        RETURN NULL;
    END IF;

    RETURN to_jsonb(v_res) || jsonb_build_object(
        'propriedade', (SELECT to_jsonb(p) FROM public.propriedades p WHERE p.id = v_res.propriedade_id),
        'codigo_acesso', (SELECT to_jsonb(c) FROM public.codigos_acesso c
                          WHERE c.reserva_id = v_res.id ORDER BY c.criado_em DESC LIMIT 1),
        'pagamento', (SELECT to_jsonb(pg) FROM public.pagamentos pg
                      WHERE pg.reserva_id = v_res.id ORDER BY pg.pago_em DESC LIMIT 1),
        'avaliada', EXISTS (SELECT 1 FROM public.avaliacoes a WHERE a.reserva_id = v_res.id)
    );
END;
$$;
GRANT EXECUTE ON FUNCTION public.obter_reserva(TEXT, TEXT) TO anon, authenticated;

-- 5.4 Check-out autónomo
CREATE OR REPLACE FUNCTION public.checkout_autonomo(p_codigo TEXT, p_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_res public.reservas;
BEGIN
    v_res := public._reserva_do_hospede(p_codigo, p_email);
    IF v_res.id IS NULL THEN
        RAISE EXCEPTION 'Reserva não encontrada.';
    END IF;
    IF v_res.status NOT IN ('confirmada', 'checkin_ativo') THEN
        RAISE EXCEPTION 'Esta reserva já não permite check-out.';
    END IF;

    UPDATE public.reservas
    SET status = 'concluida', checkout_realizado_em = now()
    WHERE id = v_res.id;

    UPDATE public.codigos_acesso SET status = 'expirado' WHERE reserva_id = v_res.id;

    INSERT INTO public.automacoes_logs (reserva_id, tipo, canal, destinatario, descricao, status) VALUES
        (v_res.id, 'REVOGACAO_PIN_CHECKOUT', 'SmartLock API', 'Fechadura Inteligente',
         'PIN temporário desativado automaticamente após check-out autónomo do hóspede.', 'concluido'),
        (v_res.id, 'NOTIFICACAO_CHECKOUT_LIMPEZA', 'Sistema Interno', 'Equipa de Governança & Limpeza',
         'Alerta enviado: Hóspede concluiu check-out. Propriedade libertada para higienização.', 'enviado');
END;
$$;
GRANT EXECUTE ON FUNCTION public.checkout_autonomo(TEXT, TEXT) TO anon, authenticated;

-- 5.5 Avaliação do hóspede (uma por reserva)
CREATE OR REPLACE FUNCTION public.adicionar_avaliacao(
    p_codigo TEXT,
    p_email TEXT,
    p_nota_geral INTEGER,
    p_nota_limpeza INTEGER,
    p_nota_checkin INTEGER,
    p_nota_localizacao INTEGER,
    p_comentario TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_res public.reservas;
    v_av public.avaliacoes;
BEGIN
    v_res := public._reserva_do_hospede(p_codigo, p_email);
    IF v_res.id IS NULL THEN
        RAISE EXCEPTION 'Reserva não encontrada.';
    END IF;
    IF v_res.status = 'cancelada' THEN
        RAISE EXCEPTION 'Reservas canceladas não podem ser avaliadas.';
    END IF;
    IF EXISTS (SELECT 1 FROM public.avaliacoes WHERE reserva_id = v_res.id) THEN
        RAISE EXCEPTION 'Esta estadia já foi avaliada. Obrigado!';
    END IF;
    IF length(trim(coalesce(p_comentario, ''))) < 3 OR length(p_comentario) > 2000 THEN
        RAISE EXCEPTION 'O comentário deve ter entre 3 e 2000 caracteres.';
    END IF;

    INSERT INTO public.avaliacoes (
        reserva_id, propriedade_id, hospede_nome, nota_geral, nota_limpeza,
        nota_checkin, nota_localizacao, comentario, publicada
    ) VALUES (
        v_res.id, v_res.propriedade_id, v_res.hospede_nome, p_nota_geral, p_nota_limpeza,
        p_nota_checkin, p_nota_localizacao, trim(p_comentario), true
    ) RETURNING * INTO v_av;

    RETURN to_jsonb(v_av);
END;
$$;
GRANT EXECUTE ON FUNCTION public.adicionar_avaliacao(TEXT, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, TEXT)
    TO anon, authenticated;

-- ============================================================================
-- FIM. Recomendado em Authentication → Sign In / Providers:
--   desligar "Allow new users to sign up" (só convidados entram).
-- ============================================================================
