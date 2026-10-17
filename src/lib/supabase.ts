import { createClient } from '@supabase/supabase-js';
import {
  Propriedade,
  Fechadura,
  Reserva,
  CodigoAcesso,
  Pagamento,
  Avaliacao,
  AutomacaoLog,
  BloqueioCalendario,
  CalculoReserva,
} from '@/types/casa';
import {
  PROPRIEDADES_INICIAIS,
  FECHADURAS_INICIAIS,
  RESERVAS_INICIAIS,
  CODIGOS_ACESSO_INICIAIS,
  PAGAMENTOS_INICIAIS,
  AVALIACOES_INICIAIS,
  AUTOMACOES_LOGS_INICIAIS,
  BLOQUEIOS_INICIAIS,
} from './constants';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('seu-projeto') &&
    !supabaseUrl.includes('SEU-PROJETO')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Formata valores monetários em Kwanzas Angolanos (AOA / Kz)
 * Ex: 450000 -> "450.000 Kz"
 */
export function formatarKz(valor: number): string {
  const num = Number(valor) || 0;
  return `${Math.round(num).toLocaleString('pt-PT')} Kz`;
}

/**
 * Confirma que a sessão atual pertence a um administrador
 * (email presente na tabela public.administradores — ver supabase/seguranca.sql).
 */
export async function verificarAdmin(): Promise<{ ok: boolean; motivo?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, motivo: 'Supabase não está configurado (.env.local).' };
  }
  const { data: sessao } = await supabase.auth.getSession();
  if (!sessao.session) return { ok: false };

  const { data, error } = await supabase.rpc('is_admin');
  if (error) {
    return {
      ok: false,
      motivo:
        'Falta configurar a segurança na base de dados. Execute o ficheiro supabase/seguranca.sql no Supabase.',
    };
  }
  if (data !== true) {
    return {
      ok: false,
      motivo: 'Esta conta não tem permissões de administrador.',
    };
  }
  return { ok: true };
}

const STORAGE_KEYS = {
  PROPRIEDADES: 'casa_aoa_v2_propriedades',
  FECHADURAS: 'casa_aoa_v2_fechaduras',
  RESERVAS: 'casa_aoa_v2_reservas',
  CODIGOS: 'casa_aoa_v2_codigos',
  PAGAMENTOS: 'casa_aoa_v2_pagamentos',
  AVALIACOES: 'casa_aoa_v2_avaliacoes',
  LOGS: 'casa_aoa_v2_logs',
  BLOQUEIOS: 'casa_aoa_v2_bloqueios',
};

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      window.localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch {
    throw new Error(
      'Espaço de armazenamento local esgotado. Configure o Supabase para guardar fotografias sem limites.'
    );
  }
}

export function gerarPinUnico6Digitos(): string {
  const random = Math.floor(100000 + Math.random() * 900000);
  return String(random);
}

export function gerarCodigoReserva(): string {
  const ano = new Date().getFullYear();
  const num = Math.floor(1000 + Math.random() * 9000);
  return `CAS-${ano}-${num}`;
}

export function calcularDiferencaNoites(checkin: string, checkout: string): number {
  if (!checkin || !checkout) return 0;
  const d1 = new Date(checkin + 'T00:00:00');
  const d2 = new Date(checkout + 'T00:00:00');
  const diff = d2.getTime() - d1.getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function mapPropriedadeRow(row: Record<string, unknown>): Propriedade {
  return {
    id: String(row.id),
    slug: String(row.slug),
    nome: String(row.nome),
    subtitulo: String(row.subtitulo),
    localizacao: String(row.localizacao),
    regiao: String(row.regiao),
    endereco: String(row.endereco),
    descricao_curta: String(row.descricao_curta),
    descricao_completa: String(row.descricao_completa),
    preco_noite: Number(row.preco_noite),
    taxa_limpeza: Number(row.taxa_limpeza),
    taxa_servico_percentual: Number(row.taxa_servico_percentual ?? 8),
    capacidade_maxima: Number(row.capacidade_maxima),
    quartos: Number(row.quartos),
    camas: Number(row.camas),
    casas_banho: Number(row.casas_banho),
    area_m2: Number(row.area_m2),
    estadia_minima_noites: Number(row.estadia_minima_noites ?? 2),
    hora_checkin: String(row.hora_checkin ?? '15:00'),
    hora_checkout: String(row.hora_checkout ?? '11:00'),
    wifi_nome: String(row.wifi_nome),
    wifi_senha: String(row.wifi_senha),
    instrucoes_entrada: String(row.instrucoes_entrada),
    regras_casa: Array.isArray(row.regras_casa) ? (row.regras_casa as string[]) : [],
    comodidades: Array.isArray(row.comodidades) ? (row.comodidades as string[]) : [],
    imagem_principal: String(row.imagem_principal),
    galeria: Array.isArray(row.galeria) ? (row.galeria as string[]) : [],
    fechadura_id: String(row.fechadura_id),
    contacto_emergencia: String(row.contacto_emergencia),
    destaque: Boolean(row.destaque),
    ativa: Boolean(row.ativa),
  };
}

export const CasaService = {
  /** Residências visíveis no site público (ativa = true). */
  async getPropriedades(): Promise<Propriedade[]> {
    const todas = await this.getTodasPropriedades();
    return todas.filter((p) => p.ativa);
  },

  /** Todas as residências, incluindo as ocultas (usado no painel admin). */
  async getTodasPropriedades(): Promise<Propriedade[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('propriedades')
        .select('*')
        .order('preco_noite', { ascending: false });

      if (!error && data) {
        return data.map((r) => mapPropriedadeRow(r as Record<string, unknown>));
      }
    }
    return readLocal<Propriedade[]>(STORAGE_KEYS.PROPRIEDADES, PROPRIEDADES_INICIAIS);
  },

  async getPropriedadeBySlug(slug: string): Promise<Propriedade | null> {
    const props = await this.getPropriedades();
    return props.find((p) => p.slug === slug) || null;
  },

  async getPropriedadeById(id: string): Promise<Propriedade | null> {
    const props = await this.getTodasPropriedades();
    return props.find((p) => p.id === id) || null;
  },

  async criarPropriedade(nova: {
    nome: string;
    subtitulo: string;
    localizacao: string;
    regiao: string;
    endereco: string;
    descricao_curta: string;
    descricao_completa: string;
    preco_noite: number;
    taxa_limpeza: number;
    capacidade_maxima: number;
    quartos: number;
    casas_banho: number;
    area_m2: number;
    wifi_nome: string;
    wifi_senha: string;
    instrucoes_entrada: string;
    imagem_principal: string;
    galeria?: string[];
    contacto_emergencia: string;
    marca_fechadura?: 'Nuki' | 'Yale' | 'August' | 'Schlage';
    device_id_fechadura?: string;
  }): Promise<Propriedade> {
    const slug =
      nova.nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Math.floor(100 + Math.random() * 900);

    // Galeria: apenas as fotografias carregadas pelo administrador
    const galeriaPadrao = (nova.galeria || []).filter((url) => url && url !== nova.imagem_principal);

    const comodidadesPadrao = [
      'Piscina Privada Climatizada',
      `Smart Lock ${nova.marca_fechadura || 'Nuki'} Conectada`,
      'Wi-Fi Fibra Alta Velocidade',
      'Cozinha Equipada Premium',
      'Ar Condicionado Central',
      'Gerador & Energia Autónoma',
      'Estacionamento Privado',
      'Check-in Digital 24/7',
    ];

    const regrasPadrao = [
      'Check-in autónomo a partir das 15:00 com código PIN exclusivo',
      'Check-out autónomo até às 11:00',
      'Não são permitidas festas ou eventos sem autorização prévia',
      'Proibido fumar no interior da residência',
    ];

    const deviceId =
      nova.device_id_fechadura ||
      `${(nova.marca_fechadura || 'NUKI').toUpperCase()}-AO-${Math.floor(1000 + Math.random() * 9000)}`;

    if (isSupabaseConfigured && supabase) {
      const { data: propRow, error } = await supabase
        .from('propriedades')
        .insert({
          slug,
          nome: nova.nome,
          subtitulo: nova.subtitulo,
          localizacao: nova.localizacao,
          regiao: nova.regiao,
          endereco: nova.endereco,
          descricao_curta: nova.descricao_curta,
          descricao_completa: nova.descricao_completa || nova.descricao_curta,
          preco_noite: nova.preco_noite,
          taxa_limpeza: nova.taxa_limpeza,
          taxa_servico_percentual: 8,
          capacidade_maxima: nova.capacidade_maxima,
          quartos: nova.quartos,
          camas: nova.quartos + 1,
          casas_banho: nova.casas_banho,
          area_m2: nova.area_m2,
          estadia_minima_noites: 2,
          hora_checkin: '15:00',
          hora_checkout: '11:00',
          wifi_nome: nova.wifi_nome,
          wifi_senha: nova.wifi_senha,
          instrucoes_entrada: nova.instrucoes_entrada,
          regras_casa: regrasPadrao,
          comodidades: comodidadesPadrao,
          imagem_principal: nova.imagem_principal,
          galeria: galeriaPadrao,
          fechadura_id: deviceId,
          contacto_emergencia: nova.contacto_emergencia,
          destaque: true,
          ativa: true,
        })
        .select('*')
        .single();

      if (!error && propRow) {
        const createdProp = mapPropriedadeRow(propRow as Record<string, unknown>);
        await supabase.from('fechaduras').insert({
          propriedade_id: createdProp.id,
          nome_dispositivo: `Porta Principal ${nova.nome}`,
          marca: nova.marca_fechadura || 'Nuki',
          modelo: 'Smart Lock Pro Wi-Fi',
          device_id: deviceId,
          bateria_percentual: 100,
          status_conexao: 'online',
        });
        return createdProp;
      }
      throw new Error(`Erro ao guardar a residência: ${error?.message || 'desconhecido'}`);
    }

    const novaPropLocal: Propriedade = {
      id: `prop-${Date.now()}`,
      slug,
      nome: nova.nome,
      subtitulo: nova.subtitulo,
      localizacao: nova.localizacao,
      regiao: nova.regiao,
      endereco: nova.endereco,
      descricao_curta: nova.descricao_curta,
      descricao_completa: nova.descricao_completa || nova.descricao_curta,
      preco_noite: nova.preco_noite,
      taxa_limpeza: nova.taxa_limpeza,
      taxa_servico_percentual: 8,
      capacidade_maxima: nova.capacidade_maxima,
      quartos: nova.quartos,
      camas: nova.quartos + 1,
      casas_banho: nova.casas_banho,
      area_m2: nova.area_m2,
      estadia_minima_noites: 2,
      hora_checkin: '15:00',
      hora_checkout: '11:00',
      wifi_nome: nova.wifi_nome,
      wifi_senha: nova.wifi_senha,
      instrucoes_entrada: nova.instrucoes_entrada,
      regras_casa: regrasPadrao,
      comodidades: comodidadesPadrao,
      imagem_principal: nova.imagem_principal,
      galeria: galeriaPadrao,
      fechadura_id: deviceId,
      contacto_emergencia: nova.contacto_emergencia,
      destaque: true,
      ativa: true,
    };

    const atuais = readLocal<Propriedade[]>(STORAGE_KEYS.PROPRIEDADES, PROPRIEDADES_INICIAIS);
    writeLocal(STORAGE_KEYS.PROPRIEDADES, [novaPropLocal, ...atuais]);

    const fechadurasAtuais = readLocal<Fechadura[]>(STORAGE_KEYS.FECHADURAS, FECHADURAS_INICIAIS);
    writeLocal(STORAGE_KEYS.FECHADURAS, [
      {
        id: `lock-${Date.now()}`,
        propriedade_id: novaPropLocal.id,
        nome_dispositivo: `Porta Principal ${nova.nome}`,
        marca: nova.marca_fechadura || 'Nuki',
        modelo: 'Smart Lock Pro Wi-Fi',
        device_id: deviceId,
        bateria_percentual: 100,
        status_conexao: 'online',
        ultima_sincronizacao: 'Agora mesmo',
      },
      ...fechadurasAtuais,
    ]);

    return novaPropLocal;
  },

  async criarFechadura(nova: {
    propriedade_id: string;
    nome_dispositivo: string;
    marca: 'Nuki' | 'Yale' | 'August' | 'Schlage';
    modelo: string;
    device_id: string;
  }): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('fechaduras').insert({
        propriedade_id: nova.propriedade_id,
        nome_dispositivo: nova.nome_dispositivo,
        marca: nova.marca,
        modelo: nova.modelo,
        device_id: nova.device_id,
        bateria_percentual: 100,
        status_conexao: 'online',
      });
      return;
    }

    const atuais = readLocal<Fechadura[]>(STORAGE_KEYS.FECHADURAS, FECHADURAS_INICIAIS);
    writeLocal(STORAGE_KEYS.FECHADURAS, [
      {
        id: `lock-${Date.now()}`,
        propriedade_id: nova.propriedade_id,
        nome_dispositivo: nova.nome_dispositivo,
        marca: nova.marca,
        modelo: nova.modelo,
        device_id: nova.device_id,
        bateria_percentual: 100,
        status_conexao: 'online',
        ultima_sincronizacao: 'Agora mesmo',
      },
      ...atuais,
    ]);
  },

  async removerBloqueio(bloqueioId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('bloqueios_calendario').delete().eq('id', bloqueioId);
      return;
    }
    const atuais = readLocal<BloqueioCalendario[]>(STORAGE_KEYS.BLOQUEIOS, BLOQUEIOS_INICIAIS);
    writeLocal(
      STORAGE_KEYS.BLOQUEIOS,
      atuais.filter((b) => b.id !== bloqueioId)
    );
  },

  async getReservasPorPropriedade(propriedadeId: string): Promise<Reserva[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .eq('propriedade_id', propriedadeId)
        .neq('status', 'cancelada');
      if (!error && data) {
        return data as unknown as Reserva[];
      }
    }
    const todas = readLocal<Reserva[]>(STORAGE_KEYS.RESERVAS, RESERVAS_INICIAIS);
    return todas.filter((r) => r.propriedade_id === propriedadeId && r.status !== 'cancelada');
  },

  async getBloqueiosPorPropriedade(propriedadeId: string): Promise<BloqueioCalendario[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('bloqueios_calendario')
        .select('*')
        .eq('propriedade_id', propriedadeId);
      if (!error && data) {
        return data as unknown as BloqueioCalendario[];
      }
    }
    const todos = readLocal<BloqueioCalendario[]>(STORAGE_KEYS.BLOQUEIOS, BLOQUEIOS_INICIAIS);
    return todos.filter((b) => b.propriedade_id === propriedadeId);
  },

  /** Períodos ocupados (reservas + bloqueios) sem quaisquer dados pessoais. */
  async getDatasOcupadas(propriedadeId: string): Promise<{ inicio: string; fim: string }[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc('datas_ocupadas', {
        p_propriedade_id: propriedadeId,
      });
      if (error) throw new Error('Não foi possível verificar a disponibilidade. Tente novamente.');
      return ((data || []) as { inicio: string; fim: string }[]).map((d) => ({
        inicio: String(d.inicio),
        fim: String(d.fim),
      }));
    }
    const reservas = readLocal<Reserva[]>(STORAGE_KEYS.RESERVAS, RESERVAS_INICIAIS)
      .filter((r) => r.propriedade_id === propriedadeId && r.status !== 'cancelada')
      .map((r) => ({ inicio: r.data_checkin, fim: r.data_checkout }));
    const bloqueios = readLocal<BloqueioCalendario[]>(STORAGE_KEYS.BLOQUEIOS, BLOQUEIOS_INICIAIS)
      .filter((b) => b.propriedade_id === propriedadeId)
      .map((b) => ({ inicio: b.data_inicio, fim: b.data_fim }));
    return [...reservas, ...bloqueios];
  },

  async verificarDisponibilidade(
    propriedadeId: string,
    checkin: string,
    checkout: string
  ): Promise<CalculoReserva> {
    const prop = await this.getPropriedadeById(propriedadeId);
    if (!prop) {
      return {
        noites: 0,
        preco_noite: 0,
        subtotal_noites: 0,
        taxa_limpeza: 0,
        taxa_servico: 0,
        valor_total: 0,
        disponivel: false,
        motivo_indisponivel: 'Propriedade não encontrada.',
      };
    }

    const noites = calcularDiferencaNoites(checkin, checkout);
    if (noites <= 0) {
      return {
        noites: 0,
        preco_noite: prop.preco_noite,
        subtotal_noites: 0,
        taxa_limpeza: prop.taxa_limpeza,
        taxa_servico: 0,
        valor_total: 0,
        disponivel: false,
        motivo_indisponivel: 'Selecione uma data de check-out posterior ao check-in.',
      };
    }

    if (noites < prop.estadia_minima_noites) {
      return {
        noites,
        preco_noite: prop.preco_noite,
        subtotal_noites: noites * prop.preco_noite,
        taxa_limpeza: prop.taxa_limpeza,
        taxa_servico: 0,
        valor_total: 0,
        disponivel: false,
        motivo_indisponivel: `Estadia mínima de ${prop.estadia_minima_noites} noites para esta residência.`,
      };
    }

    const subtotal = Math.round(noites * prop.preco_noite);
    const taxaServico = Math.round((subtotal * prop.taxa_servico_percentual) / 100);
    const total = Math.round(subtotal + prop.taxa_limpeza + taxaServico);

    let motivo = '';
    try {
      const ocupadas = await this.getDatasOcupadas(propriedadeId);
      if (ocupadas.some((o) => checkin < o.fim && checkout > o.inicio)) {
        motivo = 'As datas selecionadas já se encontram reservadas ou bloqueadas no calendário.';
      }
    } catch (err) {
      motivo = err instanceof Error ? err.message : 'Não foi possível verificar a disponibilidade.';
    }

    if (motivo) {
      return {
        noites,
        preco_noite: prop.preco_noite,
        subtotal_noites: subtotal,
        taxa_limpeza: prop.taxa_limpeza,
        taxa_servico: taxaServico,
        valor_total: total,
        disponivel: false,
        motivo_indisponivel: motivo,
      };
    }

    return {
      noites,
      preco_noite: prop.preco_noite,
      subtotal_noites: subtotal,
      taxa_limpeza: prop.taxa_limpeza,
      taxa_servico: taxaServico,
      valor_total: total,
      disponivel: true,
    };
  },

  async criarReservaComPagamento(payload: {
    propriedade_id: string;
    hospede_nome: string;
    hospede_email: string;
    hospede_telefone: string;
    hospede_documento: string;
    data_checkin: string;
    data_checkout: string;
    num_hospedes: number;
    metodo_pagamento: 'cartao_credito' | 'mbway' | 'pix' | 'transferencia';
    pedidos_especiais?: string;
  }): Promise<{ reserva: Reserva; codigoAcesso?: CodigoAcesso; pagamento?: Pagamento }> {
    // 1. SUPABASE: tudo é validado e gravado no servidor (função criar_reserva)
    if (isSupabaseConfigured && supabase) {
      const { data: codigo, error } = await supabase.rpc('criar_reserva', {
        p_propriedade_id: payload.propriedade_id,
        p_nome: payload.hospede_nome,
        p_email: payload.hospede_email,
        p_telefone: payload.hospede_telefone,
        p_documento: payload.hospede_documento,
        p_checkin: payload.data_checkin,
        p_checkout: payload.data_checkout,
        p_num_hospedes: payload.num_hospedes,
        p_metodo: payload.metodo_pagamento,
        p_pedidos: payload.pedidos_especiais || '',
      });
      if (error || !codigo) {
        throw new Error(error?.message || 'Não foi possível concluir a reserva.');
      }
      const reserva = await this.getReservaByCodigo(String(codigo), payload.hospede_email);
      if (!reserva) throw new Error('Reserva criada, mas não foi possível carregá-la.');
      return { reserva, codigoAcesso: reserva.codigo_acesso, pagamento: reserva.pagamento };
    }

    const calculo = await this.verificarDisponibilidade(
      payload.propriedade_id,
      payload.data_checkin,
      payload.data_checkout
    );

    if (!calculo.disponivel) {
      throw new Error(calculo.motivo_indisponivel || 'Datas indisponíveis.');
    }

    const prop = await this.getPropriedadeById(payload.propriedade_id);
    if (!prop) throw new Error('Propriedade inválida.');

    const codigoReserva = gerarCodigoReserva();
    const pinCode = gerarPinUnico6Digitos();
    const agora = new Date().toISOString();
    const validoDe = `${payload.data_checkin}T${prop.hora_checkin}:00Z`;
    const validoAte = `${payload.data_checkout}T${prop.hora_checkout}:00Z`;
    const refGateway = `AOA_${payload.metodo_pagamento.toUpperCase()}_${Math.floor(10000000 + Math.random() * 90000000)}`;

    // 2. MODO LOCAL (sem Supabase)
    const reservaId = `res-${Date.now()}`;
    const pinId = `pin-${Date.now()}`;
    const pagId = `pag-${Date.now()}`;

    const novoCodigo: CodigoAcesso = {
      id: pinId,
      reserva_id: reservaId,
      fechadura_id: prop.fechadura_id,
      propriedade_id: prop.id,
      pin_code: pinCode,
      valido_de: validoDe,
      valido_ate: validoAte,
      status: 'ativo',
      criado_em: agora,
    };

    const novoPagamento: Pagamento = {
      id: pagId,
      reserva_id: reservaId,
      valor: calculo.valor_total,
      moeda: 'AOA',
      metodo: payload.metodo_pagamento,
      status: 'aprovado',
      referencia_gateway: refGateway,
      comprovativo_url: `/reserva/${codigoReserva}`,
      pago_em: agora,
    };

    const novaReserva: Reserva = {
      id: reservaId,
      codigo_reserva: codigoReserva,
      propriedade_id: prop.id,
      hospede_nome: payload.hospede_nome,
      hospede_email: payload.hospede_email,
      hospede_telefone: payload.hospede_telefone,
      hospede_documento: payload.hospede_documento,
      data_checkin: payload.data_checkin,
      data_checkout: payload.data_checkout,
      noites: calculo.noites,
      num_hospedes: payload.num_hospedes,
      valor_noites: calculo.subtotal_noites,
      taxa_limpeza: calculo.taxa_limpeza,
      taxa_servico: calculo.taxa_servico,
      valor_total: calculo.valor_total,
      status: 'confirmada',
      pagamento_status: 'aprovado',
      pedidos_especiais: payload.pedidos_especiais,
      criado_em: agora,
    };

    const reservasAtuais = readLocal<Reserva[]>(STORAGE_KEYS.RESERVAS, RESERVAS_INICIAIS);
    writeLocal(STORAGE_KEYS.RESERVAS, [novaReserva, ...reservasAtuais]);

    const codigosAtuais = readLocal<CodigoAcesso[]>(STORAGE_KEYS.CODIGOS, CODIGOS_ACESSO_INICIAIS);
    writeLocal(STORAGE_KEYS.CODIGOS, [novoCodigo, ...codigosAtuais]);

    const pagamentosAtuais = readLocal<Pagamento[]>(STORAGE_KEYS.PAGAMENTOS, PAGAMENTOS_INICIAIS);
    writeLocal(STORAGE_KEYS.PAGAMENTOS, [novoPagamento, ...pagamentosAtuais]);

    return {
      reserva: novaReserva,
      codigoAcesso: novoCodigo,
      pagamento: novoPagamento,
    };
  },

  /**
   * Portal do hóspede: devolve a reserva apenas se o CÓDIGO e o EMAIL coincidirem.
   * (Administradores autenticados podem omitir o email.)
   */
  async getReservaByCodigo(codigo: string, email: string): Promise<Reserva | null> {
    const clean = codigo.trim().toUpperCase();
    const emailLimpo = email.trim().toLowerCase();
    if (!clean) return null;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc('obter_reserva', {
        p_codigo: clean,
        p_email: emailLimpo,
      });
      if (error) throw new Error('Não foi possível consultar a reserva. Tente novamente.');
      if (!data) return null;

      const row = data as Record<string, unknown>;
      return {
        ...(row as unknown as Reserva),
        propriedade: row.propriedade
          ? mapPropriedadeRow(row.propriedade as Record<string, unknown>)
          : undefined,
        codigo_acesso: (row.codigo_acesso as CodigoAcesso | null) || undefined,
        pagamento: (row.pagamento as Pagamento | null) || undefined,
        avaliada: Boolean(row.avaliada),
      };
    }

    const reservas = readLocal<Reserva[]>(STORAGE_KEYS.RESERVAS, RESERVAS_INICIAIS);
    const codigos = readLocal<CodigoAcesso[]>(STORAGE_KEYS.CODIGOS, CODIGOS_ACESSO_INICIAIS);
    const pagamentos = readLocal<Pagamento[]>(STORAGE_KEYS.PAGAMENTOS, PAGAMENTOS_INICIAIS);
    const avaliacoes = readLocal<Avaliacao[]>(STORAGE_KEYS.AVALIACOES, AVALIACOES_INICIAIS);
    const props = await this.getTodasPropriedades();

    const encontrada = reservas.find(
      (r) =>
        r.codigo_reserva.toUpperCase() === clean &&
        r.hospede_email.trim().toLowerCase() === emailLimpo
    );
    if (!encontrada) return null;

    return {
      ...encontrada,
      propriedade: props.find((p) => p.id === encontrada.propriedade_id),
      codigo_acesso: codigos.find((c) => c.reserva_id === encontrada.id),
      pagamento: pagamentos.find((p) => p.reserva_id === encontrada.id),
      avaliada: avaliacoes.some((a) => a.reserva_id === encontrada.id),
    };
  },

  async realizarCheckOutAutonomo(codigo: string, email: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.rpc('checkout_autonomo', {
        p_codigo: codigo.trim().toUpperCase(),
        p_email: email.trim().toLowerCase(),
      });
      if (error) throw new Error(error.message);
      return;
    }

    const agora = new Date().toISOString();
    const reserva = await this.getReservaByCodigo(codigo, email);
    if (!reserva) throw new Error('Reserva não encontrada.');
    const reservas = readLocal<Reserva[]>(STORAGE_KEYS.RESERVAS, RESERVAS_INICIAIS);
    const codigos = readLocal<CodigoAcesso[]>(STORAGE_KEYS.CODIGOS, CODIGOS_ACESSO_INICIAIS);
    writeLocal(
      STORAGE_KEYS.RESERVAS,
      reservas.map((r) =>
        r.id === reserva.id
          ? { ...r, status: 'concluida' as const, checkout_realizado_em: agora }
          : r
      )
    );
    writeLocal(
      STORAGE_KEYS.CODIGOS,
      codigos.map((c) =>
        c.reserva_id === reserva.id ? { ...c, status: 'expirado' as const } : c
      )
    );
  },

  async getAvaliacoes(propriedadeId?: string): Promise<Avaliacao[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from('avaliacoes')
        .select('*')
        .eq('publicada', true)
        .order('criado_em', { ascending: false });

      if (propriedadeId) {
        query = query.eq('propriedade_id', propriedadeId);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((a) => ({
          ...(a as unknown as Avaliacao),
          criado_em: String(a.criado_em).slice(0, 10),
        }));
      }
    }

    const todas = readLocal<Avaliacao[]>(STORAGE_KEYS.AVALIACOES, AVALIACOES_INICIAIS);
    const publicadas = todas.filter((a) => a.publicada);
    if (!propriedadeId) return publicadas;
    return publicadas.filter((a) => a.propriedade_id === propriedadeId);
  },

  /** Avaliação do hóspede — exige código + email da reserva (uma por estadia). */
  async adicionarAvaliacao(
    credenciais: { codigo: string; email: string },
    notas: {
      nota_geral: number;
      nota_limpeza: number;
      nota_checkin: number;
      nota_localizacao: number;
      comentario: string;
    }
  ): Promise<Avaliacao> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc('adicionar_avaliacao', {
        p_codigo: credenciais.codigo.trim().toUpperCase(),
        p_email: credenciais.email.trim().toLowerCase(),
        p_nota_geral: notas.nota_geral,
        p_nota_limpeza: notas.nota_limpeza,
        p_nota_checkin: notas.nota_checkin,
        p_nota_localizacao: notas.nota_localizacao,
        p_comentario: notas.comentario,
      });
      if (error || !data) throw new Error(error?.message || 'Não foi possível enviar a avaliação.');
      const row = data as Record<string, unknown>;
      return {
        ...(row as unknown as Avaliacao),
        criado_em: String(row.criado_em).slice(0, 10),
      };
    }

    const reserva = await this.getReservaByCodigo(credenciais.codigo, credenciais.email);
    if (!reserva) throw new Error('Reserva não encontrada.');
    if (reserva.avaliada) throw new Error('Esta estadia já foi avaliada. Obrigado!');

    const todas = readLocal<Avaliacao[]>(STORAGE_KEYS.AVALIACOES, AVALIACOES_INICIAIS);
    const nova: Avaliacao = {
      ...notas,
      reserva_id: reserva.id,
      propriedade_id: reserva.propriedade_id,
      hospede_nome: reserva.hospede_nome,
      id: `av-${Date.now()}`,
      publicada: true,
      criado_em: new Date().toISOString().slice(0, 10),
    };
    writeLocal(STORAGE_KEYS.AVALIACOES, [nova, ...todas]);
    return nova;
  },

  async getAdminData() {
    const propriedades = await this.getTodasPropriedades();

    if (isSupabaseConfigured && supabase) {
      const [resReq, lockReq, pinReq, pagReq, avReq, logReq, bloqReq] = await Promise.all([
        supabase.from('reservas').select('*').order('criado_em', { ascending: false }),
        supabase.from('fechaduras').select('*'),
        supabase.from('codigos_acesso').select('*').order('criado_em', { ascending: false }),
        supabase.from('pagamentos').select('*').order('pago_em', { ascending: false }),
        supabase.from('avaliacoes').select('*').order('criado_em', { ascending: false }),
        supabase.from('automacoes_logs').select('*').order('data_execucao', { ascending: false }),
        supabase.from('bloqueios_calendario').select('*').order('data_inicio', { ascending: true }),
      ]);

      const reservasRows = (resReq.data || []) as unknown as Reserva[];
      const codigosRows = (pinReq.data || []) as unknown as CodigoAcesso[];
      const pagamentosRows = (pagReq.data || []) as unknown as Pagamento[];

      const reservasPop = reservasRows.map((r) => ({
        ...r,
        propriedade: propriedades.find((p) => p.id === r.propriedade_id),
        codigo_acesso: codigosRows.find((c) => c.reserva_id === r.id),
        pagamento: pagamentosRows.find((p) => p.reserva_id === r.id),
      }));

      return {
        propriedades,
        fechaduras: ((lockReq.data || []) as unknown as Fechadura[]) || FECHADURAS_INICIAIS,
        reservas: reservasPop,
        codigos: codigosRows,
        pagamentos: pagamentosRows,
        avaliacoes: (avReq.data || []) as unknown as Avaliacao[],
        logs: (logReq.data || []) as unknown as AutomacaoLog[],
        bloqueios: (bloqReq.data || []) as unknown as BloqueioCalendario[],
      };
    }

    const fechaduras = readLocal<Fechadura[]>(STORAGE_KEYS.FECHADURAS, FECHADURAS_INICIAIS);
    const reservas = readLocal<Reserva[]>(STORAGE_KEYS.RESERVAS, RESERVAS_INICIAIS);
    const codigos = readLocal<CodigoAcesso[]>(STORAGE_KEYS.CODIGOS, CODIGOS_ACESSO_INICIAIS);
    const pagamentos = readLocal<Pagamento[]>(STORAGE_KEYS.PAGAMENTOS, PAGAMENTOS_INICIAIS);
    const avaliacoes = readLocal<Avaliacao[]>(STORAGE_KEYS.AVALIACOES, AVALIACOES_INICIAIS);
    const logs = readLocal<AutomacaoLog[]>(STORAGE_KEYS.LOGS, AUTOMACOES_LOGS_INICIAIS);
    const bloqueios = readLocal<BloqueioCalendario[]>(STORAGE_KEYS.BLOQUEIOS, BLOQUEIOS_INICIAIS);

    const reservasPop = reservas.map((r) => ({
      ...r,
      propriedade: propriedades.find((p) => p.id === r.propriedade_id),
      codigo_acesso: codigos.find((c) => c.reserva_id === r.id),
      pagamento: pagamentos.find((p) => p.reserva_id === r.id),
    }));

    return {
      propriedades,
      fechaduras,
      reservas: reservasPop,
      codigos,
      pagamentos,
      avaliacoes,
      logs,
      bloqueios,
    };
  },

  async atualizarStatusReserva(
    reservaId: string,
    novoStatus: 'confirmada' | 'checkin_ativo' | 'concluida' | 'cancelada'
  ): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('reservas').update({ status: novoStatus }).eq('id', reservaId);
      if (novoStatus === 'cancelada' || novoStatus === 'concluida') {
        await supabase
          .from('codigos_acesso')
          .update({ status: novoStatus === 'cancelada' ? 'revogado' : 'expirado' })
          .eq('reserva_id', reservaId);
      }
      return;
    }

    const reservas = readLocal<Reserva[]>(STORAGE_KEYS.RESERVAS, RESERVAS_INICIAIS);
    const codigos = readLocal<CodigoAcesso[]>(STORAGE_KEYS.CODIGOS, CODIGOS_ACESSO_INICIAIS);

    writeLocal(
      STORAGE_KEYS.RESERVAS,
      reservas.map((r) => (r.id === reservaId ? { ...r, status: novoStatus } : r))
    );

    if (novoStatus === 'cancelada' || novoStatus === 'concluida') {
      writeLocal(
        STORAGE_KEYS.CODIGOS,
        codigos.map((c) =>
          c.reserva_id === reservaId
            ? { ...c, status: novoStatus === 'cancelada' ? 'revogado' : 'expirado' }
            : c
        )
      );
    }
  },

  async revogarCodigoManual(codigoId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('codigos_acesso').update({ status: 'revogado' }).eq('id', codigoId);
      return;
    }
    const codigos = readLocal<CodigoAcesso[]>(STORAGE_KEYS.CODIGOS, CODIGOS_ACESSO_INICIAIS);
    writeLocal(
      STORAGE_KEYS.CODIGOS,
      codigos.map((c) => (c.id === codigoId ? { ...c, status: 'revogado' as const } : c))
    );
  },

  async adicionarBloqueio(
    propriedadeId: string,
    dataInicio: string,
    dataFim: string,
    motivo: string
  ): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('bloqueios_calendario').insert({
        propriedade_id: propriedadeId,
        data_inicio: dataInicio,
        data_fim: dataFim,
        motivo,
      });
      return;
    }
    const bloqueios = readLocal<BloqueioCalendario[]>(STORAGE_KEYS.BLOQUEIOS, BLOQUEIOS_INICIAIS);
    const novo: BloqueioCalendario = {
      id: `bloq-${Date.now()}`,
      propriedade_id: propriedadeId,
      data_inicio: dataInicio,
      data_fim: dataFim,
      motivo,
    };
    writeLocal(STORAGE_KEYS.BLOQUEIOS, [novo, ...bloqueios]);
  },

  async atualizarPrecoPropriedade(
    propriedadeId: string,
    novoPrecoNoite: number,
    novaTaxaLimpeza: number
  ): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('propriedades')
        .update({ preco_noite: novoPrecoNoite, taxa_limpeza: novaTaxaLimpeza })
        .eq('id', propriedadeId);
      return;
    }
    const props = readLocal<Propriedade[]>(STORAGE_KEYS.PROPRIEDADES, PROPRIEDADES_INICIAIS);
    writeLocal(
      STORAGE_KEYS.PROPRIEDADES,
      props.map((p) =>
        p.id === propriedadeId
          ? { ...p, preco_noite: novoPrecoNoite, taxa_limpeza: novaTaxaLimpeza }
          : p
      )
    );
  },

  /**
   * Atualiza qualquer campo da residência (texto, tarifas, fotografias, visibilidade).
   * Fotografias do Storage que deixaram de ser usadas são apagadas automaticamente.
   */
  async atualizarPropriedade(
    propriedadeId: string,
    alteracoes: Partial<Omit<Propriedade, 'id' | 'slug'>>
  ): Promise<void> {
    const anterior = await this.getPropriedadeById(propriedadeId);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('propriedades')
        .update(alteracoes)
        .eq('id', propriedadeId);
      if (error) throw new Error(`Erro ao atualizar a residência: ${error.message}`);
    } else {
      const props = readLocal<Propriedade[]>(STORAGE_KEYS.PROPRIEDADES, PROPRIEDADES_INICIAIS);
      writeLocal(
        STORAGE_KEYS.PROPRIEDADES,
        props.map((p) => (p.id === propriedadeId ? { ...p, ...alteracoes } : p))
      );
    }

    if (anterior && (alteracoes.imagem_principal !== undefined || alteracoes.galeria !== undefined)) {
      const novas = new Set([
        alteracoes.imagem_principal ?? anterior.imagem_principal,
        ...(alteracoes.galeria ?? anterior.galeria),
      ]);
      const removidas = [anterior.imagem_principal, ...anterior.galeria].filter((u) => !novas.has(u));
      const { removerFicheiros } = await import('./media');
      await removerFicheiros(removidas);
    }
  },

  /**
   * Elimina definitivamente a residência, a fechadura, reservas, PINs, bloqueios,
   * avaliações associadas e as fotografias carregadas no Storage.
   */
  async eliminarPropriedade(propriedadeId: string): Promise<void> {
    const prop = await this.getPropriedadeById(propriedadeId);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('propriedades').delete().eq('id', propriedadeId);
      if (error) {
        throw new Error(
          error.code === '23503'
            ? 'Esta residência tem reservas associadas. Execute o ficheiro supabase/media.sql para permitir a eliminação, ou oculte-a do site.'
            : `Erro ao eliminar: ${error.message}`
        );
      }
    } else {
      const props = readLocal<Propriedade[]>(STORAGE_KEYS.PROPRIEDADES, PROPRIEDADES_INICIAIS);
      writeLocal(STORAGE_KEYS.PROPRIEDADES, props.filter((p) => p.id !== propriedadeId));

      const reservas = readLocal<Reserva[]>(STORAGE_KEYS.RESERVAS, RESERVAS_INICIAIS);
      const idsReservas = new Set(
        reservas.filter((r) => r.propriedade_id === propriedadeId).map((r) => r.id)
      );
      writeLocal(STORAGE_KEYS.RESERVAS, reservas.filter((r) => !idsReservas.has(r.id)));
      writeLocal(
        STORAGE_KEYS.CODIGOS,
        readLocal<CodigoAcesso[]>(STORAGE_KEYS.CODIGOS, CODIGOS_ACESSO_INICIAIS).filter(
          (c) => c.propriedade_id !== propriedadeId
        )
      );
      writeLocal(
        STORAGE_KEYS.PAGAMENTOS,
        readLocal<Pagamento[]>(STORAGE_KEYS.PAGAMENTOS, PAGAMENTOS_INICIAIS).filter(
          (p) => !idsReservas.has(p.reserva_id)
        )
      );
      writeLocal(
        STORAGE_KEYS.FECHADURAS,
        readLocal<Fechadura[]>(STORAGE_KEYS.FECHADURAS, FECHADURAS_INICIAIS).filter(
          (f) => f.propriedade_id !== propriedadeId
        )
      );
      writeLocal(
        STORAGE_KEYS.BLOQUEIOS,
        readLocal<BloqueioCalendario[]>(STORAGE_KEYS.BLOQUEIOS, BLOQUEIOS_INICIAIS).filter(
          (b) => b.propriedade_id !== propriedadeId
        )
      );
      writeLocal(
        STORAGE_KEYS.AVALIACOES,
        readLocal<Avaliacao[]>(STORAGE_KEYS.AVALIACOES, AVALIACOES_INICIAIS).filter(
          (a) => a.propriedade_id !== propriedadeId
        )
      );
    }

    if (prop) {
      const { removerFicheiros } = await import('./media');
      await removerFicheiros([prop.imagem_principal, ...prop.galeria]);
    }
  },

  async alternarPublicacaoAvaliacao(avaliacaoId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { data: row } = await supabase
        .from('avaliacoes')
        .select('publicada')
        .eq('id', avaliacaoId)
        .maybeSingle();
      if (row) {
        await supabase
          .from('avaliacoes')
          .update({ publicada: !row.publicada })
          .eq('id', avaliacaoId);
      }
      return;
    }
    const avs = readLocal<Avaliacao[]>(STORAGE_KEYS.AVALIACOES, AVALIACOES_INICIAIS);
    writeLocal(
      STORAGE_KEYS.AVALIACOES,
      avs.map((a) => (a.id === avaliacaoId ? { ...a, publicada: !a.publicada } : a))
    );
  },
};
