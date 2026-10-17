export type StatusReserva = 'pendente' | 'confirmada' | 'checkin_ativo' | 'concluida' | 'cancelada';
export type StatusPagamento = 'pendente' | 'aprovado' | 'reembolsado' | 'falhou';
export type StatusCodigoAcesso = 'agendado' | 'ativo' | 'expirado' | 'revogado';

export interface Propriedade {
  id: string;
  slug: string;
  nome: string;
  subtitulo: string;
  localizacao: string;
  regiao: string;
  endereco: string;
  descricao_curta: string;
  descricao_completa: string;
  preco_noite: number;
  taxa_limpeza: number;
  taxa_servico_percentual: number;
  capacidade_maxima: number;
  quartos: number;
  camas: number;
  casas_banho: number;
  area_m2: number;
  estadia_minima_noites: number;
  hora_checkin: string;
  hora_checkout: string;
  wifi_nome: string;
  wifi_senha: string;
  instrucoes_entrada: string;
  regras_casa: string[];
  comodidades: string[];
  imagem_principal: string;
  galeria: string[];
  fechadura_id: string;
  contacto_emergencia: string;
  destaque: boolean;
  ativa: boolean;
}

export interface Fechadura {
  id: string;
  propriedade_id: string;
  nome_dispositivo: string;
  marca: 'Nuki' | 'Yale' | 'August' | 'Schlage';
  modelo: string;
  device_id: string;
  bateria_percentual: number;
  status_conexao: 'online' | 'offline';
  ultima_sincronizacao: string;
}

export interface CodigoAcesso {
  id: string;
  reserva_id: string;
  fechadura_id: string;
  propriedade_id: string;
  pin_code: string;
  valido_de: string;
  valido_ate: string;
  status: StatusCodigoAcesso;
  criado_em: string;
}

export interface Pagamento {
  id: string;
  reserva_id: string;
  valor: number;
  moeda: string;
  metodo: 'cartao_credito' | 'mbway' | 'pix' | 'transferencia';
  status: StatusPagamento;
  referencia_gateway: string;
  comprovativo_url: string;
  pago_em: string;
}

export interface Reserva {
  id: string;
  codigo_reserva: string;
  propriedade_id: string;
  propriedade?: Propriedade;
  hospede_nome: string;
  hospede_email: string;
  hospede_telefone: string;
  hospede_documento: string;
  data_checkin: string;
  data_checkout: string;
  noites: number;
  num_hospedes: number;
  valor_noites: number;
  taxa_limpeza: number;
  taxa_servico: number;
  valor_total: number;
  status: StatusReserva;
  pagamento_status: StatusPagamento;
  pagamento?: Pagamento;
  codigo_acesso?: CodigoAcesso;
  pedidos_especiais?: string;
  checkin_realizado_em?: string;
  checkout_realizado_em?: string;
  criado_em: string;
  /** true quando o hóspede já deixou avaliação para esta estadia */
  avaliada?: boolean;
}

export interface Avaliacao {
  id: string;
  reserva_id: string;
  propriedade_id: string;
  hospede_nome: string;
  nota_geral: number;
  nota_limpeza: number;
  nota_checkin: number;
  nota_localizacao: number;
  comentario: string;
  publicada: boolean;
  criado_em: string;
}

export interface AutomacaoLog {
  id: string;
  reserva_id: string;
  tipo:
    | 'EMAIL_CONFIRMACAO'
    | 'GERACAO_PIN_SMARTLOCK'
    | 'WHATSAPP_INSTRUCOES_24H'
    | 'NOTIFICACAO_CHECKOUT_LIMPEZA'
    | 'REVOGACAO_PIN_CHECKOUT'
    | 'PEDIDO_AVALIACAO_POS_ESTADIA';
  canal: 'Email' | 'WhatsApp' | 'SmartLock API' | 'Sistema Interno';
  destinatario: string;
  descricao: string;
  status: 'enviado' | 'concluido' | 'agendado' | 'erro';
  data_execucao: string;
}

export interface BloqueioCalendario {
  id: string;
  propriedade_id: string;
  data_inicio: string;
  data_fim: string;
  motivo: string;
}

export interface CalculoReserva {
  noites: number;
  preco_noite: number;
  subtotal_noites: number;
  taxa_limpeza: number;
  taxa_servico: number;
  valor_total: number;
  disponivel: boolean;
  motivo_indisponivel?: string;
}
