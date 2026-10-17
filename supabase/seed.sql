-- ============================================================================
-- MR. C RESIDENCES — DADOS INICIAIS EM KWANZAS (AOA / Kz)
-- Execute no SQL Editor do Supabase para atualizar ou inserir valores em Kwanzas.
-- ============================================================================

INSERT INTO public.propriedades (
    id, slug, nome, subtitulo, localizacao, regiao, endereco,
    descricao_curta, descricao_completa, preco_noite, taxa_limpeza,
    taxa_servico_percentual, capacidade_maxima, quartos, camas, casas_banho,
    area_m2, estadia_minima_noites, hora_checkin, hora_checkout,
    wifi_nome, wifi_senha, instrucoes_entrada, regras_casa, comodidades,
    imagem_principal, galeria, fechadura_id, contacto_emergencia, destaque, ativa
) VALUES
(
    '11111111-1111-4111-8111-111111111101',
    'villa-atlantica-cascais',
    'Villa Atlântica Mussulo',
    'Arquitetura Contemporânea Sobre o Oceano',
    'Península do Mussulo, Luanda',
    'Luanda Sul & Litoral',
    'Alameda dos Coqueiros Marítimos, Lote 14, Mussulo, Luanda, Angola',
    'Villa privada com piscina infinita aquecida, jardim tropical privativo e check-in 100% digital via Smart Lock.',
    'Projetada para proporcionar privacidade absoluta frente às águas calmas da baía e o Atlântico, a Villa Atlântica combina betão aparente, madeiras nobres africanas e amplos panos de vidro. A propriedade dispõe de piscina infinita climatizada, terraço gourmet com lareira exterior, quatro suítes luminosas e sistema de domótica integrado com acesso autónomo por código PIN temporário.',
    450000.00, 85000.00, 8.00, 8, 4, 5, 5, 420, 2, '15:00', '11:00',
    'MrC_VillaAtlantica_5G', 'Atlantica#2025!',
    'O portão principal abre com o mesmo PIN de 6 dígitos seguido da tecla #. A fechadura inteligente Nuki Pro encontra-se na porta pivotante em madeira maciça.',
    '["Check-in autónomo a partir das 15:00 com PIN exclusivo", "Não são permitidas festas ou eventos sem autorização prévia", "Silêncio exterior solicitado após as 22:00", "Proibido fumar no interior da residência"]'::jsonb,
    '["Piscina Infinita Climatizada", "Smart Lock Nuki Pro 4.0", "Wi-Fi Fibra & Starlink 1 Gbps", "Cozinha Gaggenau Completa", "Adega Climatizada", "Gerador Industrial Silencioso & Energia Solar", "Estacionamento Privado Seguro", "Sauna Panorâmica"]'::jsonb,
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85',
    '["https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85", "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80", "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1400&q=80"]'::jsonb,
    'lock-nuki-01',
    '+244 923 880 110 (Concierge 24h)',
    true, true
),
(
    '11111111-1111-4111-8111-111111111102',
    'quinta-do-miradouro-douro',
    'Residência Miradouro Talatona',
    'Refúgio Arquitetónico com Piscina Suspensa',
    'Talatona, Condomínio Diplomático',
    'Luanda Sul',
    'Avenida Principal de Talatona, Condomínio Boulevard, Villa 8, Luanda, Angola',
    'Residência de autor com piscina suspensa em pedra natural, sala de cinema privada e segurança 24/7 com Smart Lock.',
    'Situada num dos condomínios mais exclusivos de Talatona, a Residência Miradouro funde pedra natural e madeira com interiores minimalistas de alto conforto. Ideal para estadias executivas ou familiares, dispõe de piscina aquecida, espaço gourmet completo e entrada autónoma sem chaves físicas.',
    380000.00, 70000.00, 8.00, 6, 3, 3, 4, 310, 2, '15:00', '11:00',
    'MrC_Miradouro_Mesh', 'Miradouro@2025',
    'Acesso identificado na portaria diplomática. Introduza o código PIN de 6 dígitos no teclado iluminado Yale situado à direita da entrada principal da Villa 8.',
    '["Check-in digital a partir das 15:00", "Piscina disponível 24h", "Proibido fumar no interior", "Animais de estimação sob consulta prévia"]'::jsonb,
    '["Piscina Suspensa Iluminada", "Smart Lock Yale Linus", "Adega Climatizada Privada", "Sala de Cinema & Som Sonos", "Terraço Panorâmico", "Wi-Fi Fibra Dedicada", "Estacionamento Coberto para 3 Viaturas", "Máquina Espresso Italiana"]'::jsonb,
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    '["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85", "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80", "https://images.unsplash.com/photo-1600573472589-003525b2b729?auto=format&fit=crop&w=1400&q=80", "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80"]'::jsonb,
    'lock-yale-02',
    '+244 923 880 220 (Concierge Talatona)',
    true, true
),
(
    '11111111-1111-4111-8111-111111111103',
    'penthouse-chiado-atelier',
    'Penthouse Baía Atelier',
    'Duplex Panorâmico Sobre a Marginal de Luanda',
    'Marginal da Baía, Ilha do Cabo',
    'Centro & Baía',
    'Avenida 4 de Fevereiro, Torre Atlântico, Cobertura Duplex 22A, Luanda, Angola',
    'Cobertura luminosa no coração financeiro e cultural com terraço privativo voltado para a Baía de Luanda.',
    'No topo de um edifício contemporâneo com elevador privado codificado, a Penthouse Baía Atelier oferece pé-direito duplo, luz natural abundante e um terraço privativo com vista de 180º para a Marginal e Ilha de Luanda. Equipada com fechadura inteligente August Wi-Fi para check-in imediato a qualquer hora da chegada do seu voo.',
    290000.00, 55000.00, 8.00, 4, 2, 2, 3, 195, 2, '15:00', '11:00',
    'MrC_BaiaPenthouse', 'LuandaLuz#2025',
    'No átrio privativo, digite o mesmo PIN de 6 dígitos seguido de # para chamar o elevador exclusivo da cobertura. Utilize o mesmo PIN na porta da Penthouse.',
    '["Check-in autónomo 24h a partir das 15:00", "Respeitar o silêncio após as 22:00", "Proibido realizar festas ou eventos", "Check-out até às 11:00"]'::jsonb,
    '["Terraço Privativo Vista Baía", "Smart Lock August Wi-Fi", "Elevador com Acesso Direto", "Sistema de Som Sonos", "Ar Condicionado Central Invisível", "Cozinha Miele Equipada", "Roupas de Cama em Linho Egípcio", "Workspace Executivo Dedicado"]'::jsonb,
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=85',
    '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=85", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80", "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80", "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1400&q=80"]'::jsonb,
    'lock-august-03',
    '+244 923 880 330 (Concierge Baía)',
    false, true
),
(
    '11111111-1111-4111-8111-111111111104',
    'casa-das-dunas-comporta',
    'Casa das Dunas Cabo Ledo',
    'Arquitetura Orgânica Frente à Praia',
    'Praia dos Surfistas, Cabo Ledo',
    'Litoral Sul',
    'Estrada Costeira de Cabo Ledo, Reserva Privada das Dunas, Lote 7, Angola',
    'Pavilhão de luxo em madeira nobre com piscina de borda infinita privativa sobre o mar de Cabo Ledo.',
    'Fiel ao espírito descontraído e sofisticado da costa atlântica, a Casa das Dunas distribui-se por três pavilhões interligados por decks de madeira sobre a falésia. Conta com piscina exterior climatizada, pérgola de refeições ao ar livre, energia híbrida autónoma e sistema de entrada 100% digital por código PIN.',
    520000.00, 95000.00, 8.00, 10, 5, 6, 5, 480, 2, '15:00', '11:00',
    'MrC_CaboLedoDunas', 'CaboLedoSol#25',
    'Acesso pelo caminho privativo da reserva costeira. No pilar de madeira junto ao portão, insira o PIN de 6 dígitos para abrir o portão e a porta principal.',
    '["Check-in autónomo a partir das 15:00", "Uso cuidadoso das lareiras exteriores", "Proibido fumar nos pavilhões interiores", "Check-out autónomo até às 11:00"]'::jsonb,
    '["Piscina Privada no Deck", "Smart Lock Nuki Ultra", "Acesso Privado à Praia", "Chuveiro Exterior Quente", "Pérgola Gourmet & Churrasqueira", "Wi-Fi Starlink Alta Velocidade", "Serviço de Governança Opcional", "Fogueira Exterior (Fire Pit)"]'::jsonb,
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85',
    '["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85", "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1400&q=80", "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=80", "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1400&q=80"]'::jsonb,
    'lock-nuki-04',
    '+244 923 880 440 (Concierge Cabo Ledo)',
    true, true
)
ON CONFLICT (slug) DO UPDATE SET
    nome = EXCLUDED.nome,
    subtitulo = EXCLUDED.subtitulo,
    localizacao = EXCLUDED.localizacao,
    regiao = EXCLUDED.regiao,
    endereco = EXCLUDED.endereco,
    descricao_curta = EXCLUDED.descricao_curta,
    descricao_completa = EXCLUDED.descricao_completa,
    preco_noite = EXCLUDED.preco_noite,
    taxa_limpeza = EXCLUDED.taxa_limpeza,
    contacto_emergencia = EXCLUDED.contacto_emergencia;

-- INSERIR FECHADURAS INTELIGENTES
INSERT INTO public.fechaduras (
    id, propriedade_id, nome_dispositivo, marca, modelo, device_id, bateria_percentual, status_conexao
) VALUES
('22222222-2222-4222-8222-222222222201', '11111111-1111-4111-8111-111111111101', 'Porta Principal Villa Atlântica', 'Nuki', 'Smart Lock Pro 4.0', 'NUKI-LAD-9941', 96, 'online'),
('22222222-2222-4222-8222-222222222202', '11111111-1111-4111-8111-111111111102', 'Entrada Principal Miradouro', 'Yale', 'Linus Smart Lock L2', 'YALE-TAL-4410', 89, 'online'),
('22222222-2222-4222-8222-222222222203', '11111111-1111-4111-8111-111111111103', 'Acesso Elevador & Penthouse Baía', 'August', 'Wi-Fi Smart Lock 4th Gen', 'AUG-BAI-7723', 92, 'online'),
('22222222-2222-4222-8222-222222222204', '11111111-1111-4111-8111-111111111104', 'Pavilhão Central Cabo Ledo', 'Nuki', 'Smart Lock Ultra', 'NUKI-CBL-1180', 98, 'online')
ON CONFLICT (device_id) DO NOTHING;

-- INSERIR AVALIAÇÕES INICIAIS VERIFICADAS
INSERT INTO public.avaliacoes (
    id, propriedade_id, hospede_nome, nota_geral, nota_limpeza, nota_checkin, nota_localizacao, comentario, publicada
) VALUES
('33333333-3333-4333-8333-333333333301', '11111111-1111-4111-8111-111111111101', 'Henrique & Sofia Monteiro', 5, 5, 5, 5, 'Experiência impecável. Recebemos o código PIN da fechadura 24h antes, chegámos às 21h e entrámos diretamente sem qualquer espera. A piscina aquecida e a vista são extraordinárias.', true),
('33333333-3333-4333-8333-333333333302', '11111111-1111-4111-8111-111111111102', 'Carlos & Mariana Baptista', 5, 5, 5, 5, 'A privacidade e a arquitetura da casa superaram todas as expectativas. O guia digital tinha a password do Wi-Fi e todas as instruções da casa explicadas ao detalhe.', true),
('33333333-3333-4333-8333-333333333303', '11111111-1111-4111-8111-111111111104', 'Diogo Vasconcelos', 5, 5, 5, 5, 'A Casa das Dunas é um verdadeiro refúgio de luxo. O check-in automático funcionou na perfeição para toda a família e a casa estava imaculadamente preparada.', true),
('33333333-3333-4333-8333-333333333304', '11111111-1111-4111-8111-111111111103', 'Elena & Paulo Nogueira', 5, 5, 5, 5, 'Penthouse luminosa com um terraço inesquecível sobre a baía. O acesso digital pelo telemóvel e teclado PIN tornou a nossa chegada super simples.', true)
ON CONFLICT (id) DO NOTHING;
