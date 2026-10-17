'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BrandLogo, VideoHeroHeader } from '@/components/BrandMotifs';
import {
  CasaService,
  formatarKz,
  isSupabaseConfigured,
  supabase,
  verificarAdmin,
} from '@/lib/supabase';
import {
  Propriedade,
  Reserva,
  Fechadura,
  CodigoAcesso,
  AutomacaoLog,
  Avaliacao,
  BloqueioCalendario,
} from '@/types/casa';
import {
  BatteryCharging,
  Calendar,
  KeyRound,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
  Wifi,
  CheckCircle2,
  Lock,
  LogOut,
  PlusCircle,
  Home,
  Trash2,
  Eye,
  EyeOff,
  Pencil,
  X,
  ShieldCheck,
} from 'lucide-react';
import PropertyEditor, { opcoesEliminarResidencia } from '@/components/admin/PropertyEditor';
import { useConfirmar } from '@/components/ConfirmDialog';
import SiteMediaManager from '@/components/admin/SiteMediaManager';
import UploadButton from '@/components/admin/UploadButton';
import { carregarFicheiro, removerFicheiros } from '@/lib/media';

export default function AdminDashboardPage() {
  const confirmar = useConfirmar();
  // Estado de Autenticação
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [loggingIn, setLoggingIn] = useState<boolean>(false);

  // Estado do Painel
  const [tab, setTab] = useState<
    'RESERVAS' | 'RESIDENCIAS' | 'FECHADURAS' | 'BLOQUEIOS' | 'LOGS' | 'MEDIA'
  >('RESERVAS');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [propriedades, setPropriedades] = useState<Propriedade[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [fechaduras, setFechaduras] = useState<Fechadura[]>([]);
  const [codigos, setCodigos] = useState<CodigoAcesso[]>([]);
  const [logs, setLogs] = useState<AutomacaoLog[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [bloqueios, setBloqueios] = useState<BloqueioCalendario[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  // 1. Formulário: Criar Reserva Manual / VIP pelo Admin
  const [mostrarFormReserva, setMostrarFormReserva] = useState(false);
  const [resPropId, setResPropId] = useState('');
  const [resNome, setResNome] = useState('');
  const [resEmail, setResEmail] = useState('');
  const [resTelefone, setResTelefone] = useState('+244 ');
  const [resDoc, setResDoc] = useState('');
  const [resCheckin, setResCheckin] = useState('');
  const [resCheckout, setResCheckout] = useState('');
  const [resHospedes, setResHospedes] = useState(2);

  // 2. Formulário: Cadastrar Nova Residência
  const [mostrarFormProp, setMostrarFormProp] = useState(false);
  const [novaNome, setNovaNome] = useState('');
  const [novaSubtitulo, setNovaSubtitulo] = useState('');
  const [novaLocalizacao, setNovaLocalizacao] = useState('Talatona, Luanda');
  const [novaRegiao, setNovaRegiao] = useState('Luanda Sul');
  const [novaEndereco, setNovaEndereco] = useState('');
  const [novaDescCurta, setNovaDescCurta] = useState('');
  const [novaPrecoNoite, setNovaPrecoNoite] = useState(400000);
  const [novaTaxaLimpeza, setNovaTaxaLimpeza] = useState(75000);
  const [novaCapacidade, setNovaCapacidade] = useState(6);
  const [novaQuartos, setNovaQuartos] = useState(3);
  const [novaBanhos, setNovaBanhos] = useState(4);
  const [novaArea, setNovaArea] = useState(320);
  const [novaWifiNome, setNovaWifiNome] = useState('MrC_Residence_5G');
  const [novaWifiSenha, setNovaWifiSenha] = useState('MrC#2025!');
  const [novaInstrucoes, setNovaInstrucoes] = useState(
    'Digite o código PIN de 6 dígitos seguido de # no teclado da fechadura inteligente da entrada principal.'
  );
  const [novaImagem, setNovaImagem] = useState('');
  const [novaGaleria, setNovaGaleria] = useState<string[]>([]);
  const [novaContacto, setNovaContacto] = useState('+244 923 880 550 (Concierge 24h)');
  const [novaMarcaLock, setNovaMarcaLock] = useState<'Nuki' | 'Yale' | 'August' | 'Schlage'>('Nuki');

  // 3. Formulário: Cadastrar Nova Fechadura Inteligente
  const [lockPropId, setLockPropId] = useState('');
  const [lockNome, setLockNome] = useState('');
  const [lockMarca, setLockMarca] = useState<'Nuki' | 'Yale' | 'August' | 'Schlage'>('Nuki');
  const [lockModelo, setLockModelo] = useState('Smart Lock Pro 4.0');
  const [lockDeviceId, setLockDeviceId] = useState('');

  // 4. Formulário: Bloquear Datas no Calendário
  const [propBloqueio, setPropBloqueio] = useState('');
  const [inicioBloqueio, setInicioBloqueio] = useState('2025-09-01');
  const [fimBloqueio, setFimBloqueio] = useState('2025-09-05');
  const [motivoBloqueio, setMotivoBloqueio] = useState('Manutenção Preventiva / Uso Proprietário');

  const notificar = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 5000);
  };

  const carregarDados = () => {
    CasaService.getAdminData().then((data) => {
      setPropriedades(data.propriedades);
      setReservas(data.reservas);
      setFechaduras(data.fechaduras);
      setCodigos(data.codigos);
      setLogs(data.logs);
      setAvaliacoes(data.avaliacoes);
      setBloqueios(data.bloqueios);
      if (data.propriedades.length > 0) {
        if (!propBloqueio) setPropBloqueio(data.propriedades[0].id);
        if (!resPropId) setResPropId(data.propriedades[0].id);
        if (!lockPropId) setLockPropId(data.propriedades[0].id);
      }
    });
  };

  useEffect(() => {
    const today = new Date();
    const d1 = new Date(today);
    d1.setDate(today.getDate() + 14);
    const d2 = new Date(today);
    d2.setDate(today.getDate() + 17);
    setResCheckin(d1.toISOString().split('T')[0]);
    setResCheckout(d2.toISOString().split('T')[0]);

    // Sessão real do Supabase Auth + confirmação de administrador na base de dados
    localStorage.removeItem('casa_admin_authenticated'); // limpa a flag antiga (modo demo)
    verificarAdmin().then((res) => {
      if (res.ok) {
        setIsAuthenticated(true);
        carregarDados();
      }
      setAuthChecking(false);
    });

    const sub = supabase?.auth.onAuthStateChange((evento) => {
      if (evento === 'SIGNED_OUT') setIsAuthenticated(false);
    });
    return () => sub?.data.subscription.unsubscribe();
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');

    try {
      if (!isSupabaseConfigured || !supabase) {
        setLoginError('Serviço temporariamente indisponível. Contacte o suporte técnico.');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      if (error) {
        setLoginError('Email ou palavra-passe incorretos.');
        return;
      }

      const res = await verificarAdmin();
      if (!res.ok) {
        await supabase.auth.signOut();
        setLoginError(res.motivo || 'Esta conta não tem permissões de administrador.');
        return;
      }

      setLoginPassword('');
      setIsAuthenticated(true);
      carregarDados();
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
  };

  const handleCriarReservaManual = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await CasaService.criarReservaComPagamento({
        propriedade_id: resPropId,
        hospede_nome: resNome,
        hospede_email: resEmail,
        hospede_telefone: resTelefone,
        hospede_documento: resDoc || 'BI-VIP-ADMIN',
        data_checkin: resCheckin,
        data_checkout: resCheckout,
        num_hospedes: resHospedes,
        metodo_pagamento: 'transferencia',
        pedidos_especiais: 'Reserva criada manualmente pelo Painel Administrativo.',
      });
      setMostrarFormReserva(false);
      setResNome('');
      setResEmail('');
      carregarDados();
      notificar(
        res.codigoAcesso
          ? `Reserva ${res.reserva.codigo_reserva} criada com sucesso! PIN gerado: ${res.codigoAcesso.pin_code}#`
          : `Reserva ${res.reserva.codigo_reserva} criada com sucesso! (Sem fechadura associada — PIN não emitido.)`
      );
    } catch (err: unknown) {
      notificar(err instanceof Error ? err.message : 'Erro ao criar reserva manual.');
    }
  };

  const handleCadastrarPropriedade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaNome) return;
    if (!novaImagem) {
      notificar('Carregue a fotografia de capa da residência antes de guardar.');
      return;
    }
    try {
      const criada = await CasaService.criarPropriedade({
        nome: novaNome,
        subtitulo: novaSubtitulo || 'Residência Privada de Arquitetura Contemporânea',
        localizacao: novaLocalizacao,
        regiao: novaRegiao,
        endereco: novaEndereco || novaLocalizacao,
        descricao_curta:
          novaDescCurta ||
          'Residência de luxo com piscina privativa, check-in autónomo 24/7 via Smart Lock e Wi-Fi de alta velocidade.',
        descricao_completa:
          novaDescCurta ||
          'Concebida para proporcionar privacidade absoluta e conforto cinco estrelas, esta propriedade dispõe de fechadura inteligente sincronizada automaticamente com cada reserva.',
        preco_noite: Number(novaPrecoNoite),
        taxa_limpeza: Number(novaTaxaLimpeza),
        capacidade_maxima: Number(novaCapacidade),
        quartos: Number(novaQuartos),
        casas_banho: Number(novaBanhos),
        area_m2: Number(novaArea),
        wifi_nome: novaWifiNome,
        wifi_senha: novaWifiSenha,
        instrucoes_entrada: novaInstrucoes,
        imagem_principal: novaImagem,
        galeria: novaGaleria,
        contacto_emergencia: novaContacto,
        marca_fechadura: novaMarcaLock,
      });
      setMostrarFormProp(false);
      setNovaNome('');
      setNovaSubtitulo('');
      setNovaImagem('');
      setNovaGaleria([]);
      carregarDados();
      notificar('Nova residência e respetiva fechadura Smart Lock cadastradas com sucesso!');
      setEditandoId(criada.id);
    } catch (err) {
      notificar(err instanceof Error ? err.message : 'Erro ao cadastrar residência.');
    }
  };

  // Fotografias do formulário de nova residência (carregadas antes de guardar)
  const handleUploadNovaCapa = async (files: File[]) => {
    try {
      const url = await carregarFicheiro(files[0], 'residencias/novas');
      if (novaImagem) await removerFicheiros([novaImagem]);
      setNovaImagem(url);
    } catch (err) {
      notificar(err instanceof Error ? err.message : 'Erro no envio da fotografia.');
    }
  };

  const handleUploadNovaGaleria = async (files: File[]) => {
    for (const f of files) {
      try {
        const url = await carregarFicheiro(f, 'residencias/novas');
        setNovaGaleria((g) => [...g, url]);
      } catch (err) {
        notificar(err instanceof Error ? err.message : 'Erro no envio da fotografia.');
      }
    }
  };

  const handleToggleFormProp = async () => {
    // Ao cancelar, apaga as fotografias carregadas que não chegaram a ser usadas
    if (mostrarFormProp && (novaImagem || novaGaleria.length > 0)) {
      await removerFicheiros([novaImagem, ...novaGaleria]);
      setNovaImagem('');
      setNovaGaleria([]);
    }
    setMostrarFormProp(!mostrarFormProp);
  };

  const handleAlternarVisibilidade = async (p: Propriedade) => {
    try {
      await CasaService.atualizarPropriedade(p.id, { ativa: !p.ativa });
      carregarDados();
      notificar(p.ativa ? `"${p.nome}" ocultada do site.` : `"${p.nome}" publicada no site.`);
    } catch (err) {
      notificar(err instanceof Error ? err.message : 'Erro ao alterar visibilidade.');
    }
  };

  const handleEliminarPropriedade = async (p: Propriedade) => {
    const ok = await confirmar(opcoesEliminarResidencia(p));
    if (!ok) return;
    try {
      await CasaService.eliminarPropriedade(p.id);
      carregarDados();
      notificar(`Residência "${p.nome}" eliminada.`);
    } catch (err) {
      notificar(err instanceof Error ? err.message : 'Erro ao eliminar residência.');
    }
  };

  const handleCadastrarFechadura = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lockPropId || !lockNome || !lockDeviceId) return;
    await CasaService.criarFechadura({
      propriedade_id: lockPropId,
      nome_dispositivo: lockNome,
      marca: lockMarca,
      modelo: lockModelo,
      device_id: lockDeviceId.toUpperCase(),
    });
    setLockNome('');
    setLockDeviceId('');
    carregarDados();
    notificar('Nova fechadura inteligente cadastrada e sincronizada com sucesso!');
  };

  const handleRevogarPin = async (codigoId: string) => {
    await CasaService.revogarCodigoManual(codigoId);
    carregarDados();
    notificar('Código PIN revogado imediatamente na fechadura inteligente.');
  };

  const handleMudarStatusReserva = async (
    reservaId: string,
    novoStatus: 'confirmada' | 'checkin_ativo' | 'concluida' | 'cancelada'
  ) => {
    await CasaService.atualizarStatusReserva(reservaId, novoStatus);
    carregarDados();
    notificar(`Estado da reserva atualizado para ${novoStatus.toUpperCase()}.`);
  };

  const handleAdicionarBloqueio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propBloqueio || !inicioBloqueio || !fimBloqueio) return;
    await CasaService.adicionarBloqueio(propBloqueio, inicioBloqueio, fimBloqueio, motivoBloqueio);
    carregarDados();
    notificar('Datas bloqueadas no calendário com sucesso!');
  };

  const handleRemoverBloqueio = async (id: string) => {
    await CasaService.removerBloqueio(id);
    carregarDados();
    notificar('Bloqueio de calendário removido.');
  };

  const handleAtualizarPreco = async (propId: string, novoPreco: number, novaLimpeza: number) => {
    await CasaService.atualizarPrecoPropriedade(propId, novoPreco, novaLimpeza);
    carregarDados();
    notificar('Tarifas em Kwanzas (AOA) atualizadas com sucesso!');
  };

  const receitaTotal = reservas
    .filter((r) => r.status !== 'cancelada')
    .reduce((acc, r) => acc + Number(r.valor_total), 0);

  if (authChecking) {
    return <div className="min-h-screen bg-mrc-espresso" />;
  }

  // ============================================================================
  // ECRÃ DE LOGIN DO ADMINISTRADOR
  // ============================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-mrc-cream text-mrc-charcoal flex flex-col justify-between">
        <Navbar />

        <VideoHeroHeader minHeight="min-h-screen">
          <div className="min-h-screen flex items-center justify-center pt-36 xl:pt-64 pb-16 px-6">
            <div className="w-full max-w-lg bg-mrc-cream/95 backdrop-blur-md border border-mrc-terracotta/35 p-10 md:p-12 shadow-2xl space-y-8 animate-fade-up">
              <div className="text-center space-y-3">
                <div className="flex justify-center mb-3">
                  <BrandLogo light={false} size="sm" />
                </div>
                <p className="text-xs font-semibold tracking-[0.28em] uppercase text-mrc-terracotta">
                  ACESSO RESTRITO · GESTÃO EXECUTIVA
                </p>
                <h1 className="font-serif text-3xl text-mrc-charcoal uppercase tracking-[0.08em]">
                  LOGIN ADMINISTRAÇÃO
                </h1>
                <p className="text-sm text-mrc-muted font-normal">
                  Autentique-se para gerir residências, fotografias, reservas e fechaduras inteligentes.
                </p>
              </div>

              {loginError && (
                <div className="p-4 bg-red-50 border border-red-300 text-red-900 text-sm">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold tracking-[0.22em] uppercase text-mrc-terracotta mb-2">
                    EMAIL DO ADMINISTRADOR
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@casaresidences.com"
                    className="w-full border border-mrc-terracotta/40 bg-white px-4 py-3.5 text-sm text-mrc-charcoal font-medium focus:outline-none focus:border-mrc-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-[0.22em] uppercase text-mrc-terracotta mb-2">
                    PALAVRA-PASSE
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-mrc-terracotta/40 bg-white px-4 py-3.5 text-sm text-mrc-charcoal font-medium focus:outline-none focus:border-mrc-terracotta"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loggingIn}
                  className="w-full bg-mrc-terracotta hover:bg-mrc-espresso text-white py-4 text-xs font-semibold tracking-[0.26em] uppercase transition-all duration-300 flex items-center justify-center gap-2.5"
                >
                  <Lock className="w-4 h-4" />
                  {loggingIn ? 'A VALIDAR CREDENCIAIS...' : 'ENTRAR NO PAINEL DE CONTROLO'}
                </button>
              </form>

              <div className="pt-5 border-t border-mrc-terracotta/20 flex items-center justify-center gap-1.5 text-xs text-mrc-muted">
                <ShieldCheck className="w-3.5 h-3.5 text-mrc-terracotta" />
                <span>Acesso reservado a administradores autorizados.</span>
              </div>
            </div>
          </div>
        </VideoHeroHeader>

        <Footer />
      </div>
    );
  }

  // ============================================================================
  // PAINEL ADMINISTRATIVO COMPLETO (AUTENTICADO)
  // ============================================================================
  return (
    <div className="min-h-screen bg-mrc-cream text-mrc-charcoal">
      <Navbar />

      {/* Cabeçalho Executivo com Vídeo */}
      <VideoHeroHeader minHeight="min-h-[420px] xl:min-h-[540px]">
        <div className="min-h-[420px] xl:min-h-[540px] flex flex-col justify-end pt-36 xl:pt-64 pb-10 px-6 md:px-14 max-w-[1440px] mx-auto text-white">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-[0.22em] uppercase text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ÁREA RESERVADA</span>
              </div>
              <h1 className="font-serif text-3xl md:text-5xl font-normal tracking-[0.08em] uppercase">
                CENTRO DE OPERAÇÕES &amp; ADMINISTRAÇÃO
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={carregarDados}
                className="inline-flex items-center gap-2 border border-white/40 bg-white/10 backdrop-blur-sm hover:bg-white hover:text-mrc-espresso px-5 py-3 text-xs font-semibold tracking-[0.22em] uppercase transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                ATUALIZAR DADOS
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 border border-white/40 bg-mrc-espresso/80 hover:bg-red-900 text-white px-5 py-3 text-xs font-semibold tracking-[0.22em] uppercase transition-all"
              >
                <LogOut className="w-4 h-4" />
                TERMINAR SESSÃO
              </button>
            </div>
          </div>
        </div>
      </VideoHeroHeader>

      {/* Notificação de Sucesso */}
      {feedbackMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 left-6 sm:left-auto sm:max-w-md z-[70] bg-mrc-espresso text-white px-6 py-4 text-xs font-semibold tracking-[0.16em] uppercase shadow-2xl border-l-4 border-emerald-400 animate-fade-up"
        >
          {feedbackMsg}
        </div>
      )}

      {/* Métricas KPI em Kwanzas (AOA) */}
      <section className="border-b border-mrc-terracotta/25 bg-mrc-blush/55">
        <div className="max-w-[1440px] mx-auto px-6 md:px-14 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-mrc-terracotta/25 p-6 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold tracking-[0.22em] uppercase text-mrc-muted">
              <span>RECEITA CONFIRMADA (AOA)</span>
              <TrendingUp className="w-4 h-4 text-mrc-terracotta" />
            </div>
            <p className="font-serif text-2xl sm:text-3xl text-mrc-charcoal">
              {formatarKz(receitaTotal)}
            </p>
            <p className="text-xs font-medium tracking-[0.16em] uppercase text-mrc-terracotta">
              PAGAMENTOS LIQUIDADOS EM KWANZAS
            </p>
          </div>

          <div className="bg-white border border-mrc-terracotta/25 p-6 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold tracking-[0.22em] uppercase text-mrc-muted">
              <span>RESERVAS REGISTADAS</span>
              <Calendar className="w-4 h-4 text-mrc-terracotta" />
            </div>
            <p className="font-serif text-3xl text-mrc-charcoal">{reservas.length}</p>
            <p className="text-xs font-medium tracking-[0.16em] uppercase text-mrc-terracotta">
              EM {propriedades.filter((p) => p.ativa).length} RESIDÊNCIAS ATIVAS
            </p>
          </div>

          <div className="bg-white border border-mrc-terracotta/25 p-6 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold tracking-[0.22em] uppercase text-mrc-muted">
              <span>SMART LOCKS ONLINE</span>
              <Wifi className="w-4 h-4 text-mrc-terracotta" />
            </div>
            <p className="font-serif text-3xl text-mrc-charcoal">
              {fechaduras.length} / {fechaduras.length}
            </p>
            <p className="text-xs font-medium tracking-[0.16em] uppercase text-mrc-terracotta">
              NUKI · YALE · AUGUST CONECTADAS
            </p>
          </div>

          <div className="bg-white border border-mrc-terracotta/25 p-6 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold tracking-[0.22em] uppercase text-mrc-muted">
              <span>CÓDIGOS PIN ATIVOS</span>
              <KeyRound className="w-4 h-4 text-mrc-terracotta" />
            </div>
            <p className="font-serif text-3xl text-mrc-charcoal">
              {codigos.filter((c) => c.status === 'ativo' || c.status === 'agendado').length}
            </p>
            <p className="text-xs font-medium tracking-[0.16em] uppercase text-mrc-terracotta">
              SINCRONIZAÇÃO AUTOMÁTICA 24/7
            </p>
          </div>
        </div>
      </section>

      {/* Separadores de Gestão Baseados no Modelo de Negócio */}
      <section className="border-b border-mrc-terracotta/25 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-14 flex flex-wrap gap-6 sm:gap-8">
          {(
            [
              { id: 'RESERVAS', label: '01. RESERVAS & CRIAR RESERVA VIP' },
              { id: 'RESIDENCIAS', label: '02. RESIDÊNCIAS, FOTOGRAFIAS & TARIFAS' },
              { id: 'FECHADURAS', label: '03. SMART LOCKS & CÓDIGOS PIN' },
              { id: 'BLOQUEIOS', label: '04. BLOQUEIOS DE CALENDÁRIO' },
              { id: 'LOGS', label: '05. AUTOMAÇÕES & AVALIAÇÕES' },
              { id: 'MEDIA', label: '06. FOTOGRAFIAS DO SITE' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`py-5 text-xs font-semibold tracking-[0.2em] uppercase border-b-2 transition-colors ${
                tab === item.id
                  ? 'border-mrc-terracotta text-mrc-terracotta'
                  : 'border-transparent text-mrc-muted hover:text-mrc-charcoal'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* Conteúdo da Aba Selecionada */}
      <section className="py-14 max-w-[1440px] mx-auto px-6 md:px-14">
        {/* ===================================================================
            ABA 1: RESERVAS & CRIAR RESERVA MANUAL / VIP
        =================================================================== */}
        {tab === 'RESERVAS' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl text-mrc-charcoal uppercase tracking-[0.06em]">
                  GESTÃO DE RESERVAS E ACESSOS DIGITAIS
                </h2>
                <p className="text-sm text-mrc-muted">
                  Acompanhe reservas online ou registe reservas diretas de clientes VIP / telefone com geração imediata de PIN.
                </p>
              </div>
              <button
                onClick={() => setMostrarFormReserva(!mostrarFormReserva)}
                className="inline-flex items-center gap-2 bg-mrc-terracotta hover:bg-mrc-espresso text-white px-6 py-3.5 text-xs font-semibold tracking-[0.22em] uppercase transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                {mostrarFormReserva ? 'FECHAR FORMULÁRIO' : 'CRIAR RESERVA MANUAL / VIP'}
              </button>
            </div>

            {/* Formulário de Criação de Reserva Manual pelo Admin */}
            {mostrarFormReserva && (
              <form
                onSubmit={handleCriarReservaManual}
                className="bg-white border-2 border-mrc-terracotta/40 p-8 space-y-6 shadow-lg animate-fade-up"
              >
                <h3 className="text-xs font-semibold tracking-[0.24em] uppercase text-mrc-terracotta border-b border-mrc-terracotta/20 pb-3">
                  NOVA RESERVA DIRETA / WALK-IN / VIP (EMITE CÓDIGO PIN AUTOMÁTICO)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div>
                    <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-mrc-terracotta mb-1.5">
                      RESIDÊNCIA*
                    </label>
                    <select
                      value={resPropId}
                      onChange={(e) => setResPropId(e.target.value)}
                      className="w-full border border-mrc-terracotta/35 px-3 py-2.5 text-xs font-semibold uppercase bg-transparent"
                    >
                      {propriedades.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome} ({formatarKz(p.preco_noite)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-mrc-terracotta mb-1.5">
                      NOME DO HÓSPEDE*
                    </label>
                    <input
                      type="text"
                      required
                      value={resNome}
                      onChange={(e) => setResNome(e.target.value)}
                      placeholder="Ex: Embaixador João Silva"
                      className="w-full border border-mrc-terracotta/35 px-3 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-mrc-terracotta mb-1.5">
                      EMAIL DO HÓSPEDE*
                    </label>
                    <input
                      type="email"
                      required
                      value={resEmail}
                      onChange={(e) => setResEmail(e.target.value)}
                      placeholder="cliente@empresa.co.ao"
                      className="w-full border border-mrc-terracotta/35 px-3 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-mrc-terracotta mb-1.5">
                      TELEFONE / WHATSAPP*
                    </label>
                    <input
                      type="tel"
                      required
                      value={resTelefone}
                      onChange={(e) => setResTelefone(e.target.value)}
                      className="w-full border border-mrc-terracotta/35 px-3 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-mrc-terracotta mb-1.5">
                      DATA CHECK-IN*
                    </label>
                    <input
                      type="date"
                      required
                      value={resCheckin}
                      onChange={(e) => setResCheckin(e.target.value)}
                      className="w-full border border-mrc-terracotta/35 px-3 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-mrc-terracotta mb-1.5">
                      DATA CHECK-OUT*
                    </label>
                    <input
                      type="date"
                      required
                      value={resCheckout}
                      onChange={(e) => setResCheckout(e.target.value)}
                      className="w-full border border-mrc-terracotta/35 px-3 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-mrc-terracotta mb-1.5">
                      BI / PASSAPORTE / NIF
                    </label>
                    <input
                      type="text"
                      value={resDoc}
                      onChange={(e) => setResDoc(e.target.value)}
                      placeholder="AO-0019283LA041"
                      className="w-full border border-mrc-terracotta/35 px-3 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-mrc-terracotta mb-1.5">
                      HÓSPEDES
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={resHospedes}
                      onChange={(e) => setResHospedes(Number(e.target.value))}
                      className="w-full border border-mrc-terracotta/35 px-3 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-mrc-terracotta hover:bg-mrc-espresso text-white px-8 py-3.5 text-xs font-semibold tracking-[0.24em] uppercase transition-all"
                >
                  CONFIRMAR RESERVA &amp; PROGRAMAR PIN SMART LOCK
                </button>
              </form>
            )}

            <div className="bg-white border border-mrc-terracotta/25 overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-mrc-terracotta/25 bg-mrc-blush/50 text-xs font-semibold tracking-[0.2em] uppercase text-mrc-terracotta">
                    <th className="p-4">CÓDIGO</th>
                    <th className="p-4">RESIDÊNCIA</th>
                    <th className="p-4">HÓSPEDE TITULAR</th>
                    <th className="p-4">CHECK-IN / OUT</th>
                    <th className="p-4">PIN SMART LOCK</th>
                    <th className="p-4">VALOR (AOA)</th>
                    <th className="p-4">ESTADO</th>
                    <th className="p-4">AÇÃO RÁPIDA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mrc-terracotta/15 text-sm">
                  {reservas.map((r) => (
                    <tr key={r.id} className="hover:bg-mrc-blush/25 transition-colors">
                      <td className="p-4 font-semibold tracking-wider text-mrc-terracotta">
                        {r.codigo_reserva}
                      </td>
                      <td className="p-4 font-medium text-mrc-charcoal">
                        {r.propriedade?.nome}
                      </td>
                      <td className="p-4">
                        <p className="text-mrc-charcoal font-medium">{r.hospede_nome}</p>
                        <p className="text-xs text-mrc-muted">{r.hospede_email}</p>
                      </td>
                      <td className="p-4 text-xs font-medium tracking-wider uppercase text-mrc-muted">
                        {r.data_checkin} → {r.data_checkout} ({r.noites}n)
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-mrc-blush border border-mrc-terracotta/25 text-xs font-semibold tracking-[0.2em] text-mrc-charcoal">
                          <KeyRound className="w-3.5 h-3.5 text-mrc-terracotta" />
                          {r.codigo_acesso?.pin_code
                            ? `${r.codigo_acesso.pin_code}# (${r.codigo_acesso.status})`
                            : 'N/A'}
                        </span>
                      </td>
                      <td className="p-4 font-serif text-base sm:text-lg text-mrc-charcoal font-medium">
                        {formatarKz(r.valor_total)}
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-semibold tracking-[0.18em] uppercase px-3 py-1 bg-mrc-blush/80 text-mrc-charcoal">
                          {r.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={r.status}
                          onChange={(e) =>
                            handleMudarStatusReserva(
                              r.id,
                              e.target.value as
                                | 'confirmada'
                                | 'checkin_ativo'
                                | 'concluida'
                                | 'cancelada'
                            )
                          }
                          className="border border-mrc-terracotta/35 bg-transparent px-3 py-2 text-xs font-semibold tracking-[0.16em] uppercase text-mrc-charcoal"
                        >
                          <option value="confirmada">CONFIRMADA</option>
                          <option value="checkin_ativo">CHECK-IN ATIVO</option>
                          <option value="concluida">CONCLUÍDA (EXPIRAR PIN)</option>
                          <option value="cancelada">CANCELAR (REVOGAR PIN)</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================================================================
            ABA 2: CADASTRAR RESIDÊNCIAS & EDITAR TARIFAS EM KWANZAS (KZ)
        =================================================================== */}
        {tab === 'RESIDENCIAS' && (
          <div className="space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl text-mrc-charcoal uppercase tracking-[0.06em]">
                  PORTFÓLIO DE RESIDÊNCIAS &amp; TARIFÁRIO EM KWANZAS (AOA)
                </h2>
                <p className="text-sm text-mrc-muted">
                  Cadastre, edite, oculte ou elimine residências. Carregue e substitua fotografias diretamente do seu computador.
                </p>
              </div>
              <button
                onClick={handleToggleFormProp}
                className="inline-flex items-center gap-2 bg-mrc-terracotta hover:bg-mrc-espresso text-white px-6 py-3.5 text-xs font-semibold tracking-[0.22em] uppercase transition-all"
              >
                <Home className="w-4 h-4" />
                {mostrarFormProp ? 'FECHAR FORMULÁRIO' : '+ CADASTRAR NOVA RESIDÊNCIA'}
              </button>
            </div>

            {mostrarFormProp && (
              <form
                onSubmit={handleCadastrarPropriedade}
                className="bg-white border-2 border-mrc-terracotta/40 p-8 space-y-6 shadow-lg animate-fade-up"
              >
                <h3 className="text-xs font-semibold tracking-[0.24em] uppercase text-mrc-terracotta border-b border-mrc-terracotta/20 pb-3">
                  CADASTRAR NOVA PROPRIEDADE + FECHADURA SMART LOCK
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-mrc-terracotta mb-1.5">
                      NOME DA RESIDÊNCIA*
                    </label>
                    <input
                      type="text"
                      required
                      value={novaNome}
                      onChange={(e) => setNovaNome(e.target.value)}
                      placeholder="Ex: Villa Esmeralda Palmeirinhas"
                      className="w-full border border-mrc-terracotta/35 px-3.5 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-mrc-terracotta mb-1.5">
                      SUBTÍTULO EDITORIAL*
                    </label>
                    <input
                      type="text"
                      required
                      value={novaSubtitulo}
                      onChange={(e) => setNovaSubtitulo(e.target.value)}
                      placeholder="Ex: Refúgio Privado Frente à Lagoa"
                      className="w-full border border-mrc-terracotta/35 px-3.5 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-mrc-terracotta mb-1.5">
                      LOCALIZAÇÃO*
                    </label>
                    <input
                      type="text"
                      required
                      value={novaLocalizacao}
                      onChange={(e) => setNovaLocalizacao(e.target.value)}
                      placeholder="Ex: Talatona, Luanda"
                      className="w-full border border-mrc-terracotta/35 px-3.5 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-mrc-terracotta mb-1.5">
                      PREÇO POR NOITE (KZ / AOA)*
                    </label>
                    <input
                      type="number"
                      required
                      value={novaPrecoNoite}
                      onChange={(e) => setNovaPrecoNoite(Number(e.target.value))}
                      className="w-full border border-mrc-terracotta/35 px-3.5 py-2.5 text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-mrc-terracotta mb-1.5">
                      TAXA DE LIMPEZA (KZ / AOA)*
                    </label>
                    <input
                      type="number"
                      required
                      value={novaTaxaLimpeza}
                      onChange={(e) => setNovaTaxaLimpeza(Number(e.target.value))}
                      className="w-full border border-mrc-terracotta/35 px-3.5 py-2.5 text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-mrc-terracotta mb-1.5">
                      MARCA DA SMART LOCK*
                    </label>
                    <select
                      value={novaMarcaLock}
                      onChange={(e) =>
                        setNovaMarcaLock(e.target.value as 'Nuki' | 'Yale' | 'August' | 'Schlage')
                      }
                      className="w-full border border-mrc-terracotta/35 px-3.5 py-2.5 text-sm bg-transparent"
                    >
                      <option value="Nuki">Nuki Smart Lock Pro</option>
                      <option value="Yale">Yale Linus Smart Lock</option>
                      <option value="August">August Wi-Fi Smart Lock</option>
                      <option value="Schlage">Schlage Encode Wi-Fi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-mrc-terracotta mb-1.5">
                      SUÍTES / QUARTOS
                    </label>
                    <input
                      type="number"
                      value={novaQuartos}
                      onChange={(e) => setNovaQuartos(Number(e.target.value))}
                      className="w-full border border-mrc-terracotta/35 px-3.5 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-mrc-terracotta mb-1.5">
                      CAPACIDADE MÁXIMA (HÓSPEDES)
                    </label>
                    <input
                      type="number"
                      value={novaCapacidade}
                      onChange={(e) => setNovaCapacidade(Number(e.target.value))}
                      className="w-full border border-mrc-terracotta/35 px-3.5 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-mrc-terracotta mb-1.5">
                      ÁREA PRIVATIVA (M²)
                    </label>
                    <input
                      type="number"
                      value={novaArea}
                      onChange={(e) => setNovaArea(Number(e.target.value))}
                      className="w-full border border-mrc-terracotta/35 px-3.5 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-mrc-terracotta mb-1.5">
                      REDE WI-FI
                    </label>
                    <input
                      type="text"
                      value={novaWifiNome}
                      onChange={(e) => setNovaWifiNome(e.target.value)}
                      className="w-full border border-mrc-terracotta/35 px-3.5 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-mrc-terracotta mb-1.5">
                      PASSWORD WI-FI
                    </label>
                    <input
                      type="text"
                      value={novaWifiSenha}
                      onChange={(e) => setNovaWifiSenha(e.target.value)}
                      className="w-full border border-mrc-terracotta/35 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                </div>

                {/* Fotografias carregadas do computador */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border-t border-mrc-terracotta/15 pt-6">
                  <div className="lg:col-span-4 space-y-3">
                    <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-mrc-terracotta">
                      FOTOGRAFIA DE CAPA*
                    </label>
                    <div className="aspect-[4/3] bg-mrc-blush border border-mrc-terracotta/25 overflow-hidden flex items-center justify-center">
                      {novaImagem ? (
                        <img src={novaImagem} alt="Capa" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-mrc-muted">Nenhuma fotografia carregada</span>
                      )}
                    </div>
                    <UploadButton
                      onFiles={handleUploadNovaCapa}
                      label={novaImagem ? 'SUBSTITUIR CAPA' : 'CARREGAR CAPA DO COMPUTADOR'}
                      className="w-full"
                    />
                  </div>
                  <div className="lg:col-span-8 space-y-3">
                    <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-mrc-terracotta">
                      GALERIA DE FOTOGRAFIAS ({novaGaleria.length})
                    </label>
                    {novaGaleria.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {novaGaleria.map((url, i) => (
                          <div key={url} className="relative aspect-[4/3] overflow-hidden bg-mrc-blush">
                            <img src={url} alt={`Fotografia ${i + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              aria-label="Remover fotografia"
                              onClick={async () => {
                                await removerFicheiros([url]);
                                setNovaGaleria((g) => g.filter((u) => u !== url));
                              }}
                              className="absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center bg-mrc-espresso/85 text-white hover:bg-red-700"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <UploadButton
                      onFiles={handleUploadNovaGaleria}
                      multiple
                      variant="dropzone"
                      label="ADICIONAR FOTOGRAFIAS À GALERIA"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-mrc-terracotta mb-1.5">
                      DESCRIÇÃO DA RESIDÊNCIA
                    </label>
                    <input
                      type="text"
                      value={novaDescCurta}
                      onChange={(e) => setNovaDescCurta(e.target.value)}
                      placeholder="Arquitetura contemporânea, piscina climatizada e acesso digital 24/7."
                      className="w-full border border-mrc-terracotta/35 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-mrc-terracotta mb-1.5">
                      INSTRUÇÕES DE CHEGADA / PIN
                    </label>
                    <input
                      type="text"
                      value={novaInstrucoes}
                      onChange={(e) => setNovaInstrucoes(e.target.value)}
                      className="w-full border border-mrc-terracotta/35 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-mrc-terracotta hover:bg-mrc-espresso text-white px-10 py-4 text-xs font-semibold tracking-[0.24em] uppercase transition-all"
                >
                  GUARDAR RESIDÊNCIA
                </button>
              </form>
            )}

            {propriedades.length === 0 && (
              <div className="bg-white border border-dashed border-mrc-terracotta/40 p-10 text-center text-sm text-mrc-muted">
                Ainda não existem residências. Clique em &quot;+ CADASTRAR NOVA RESIDÊNCIA&quot; para começar.
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {propriedades.map((p) => (
                <div
                  key={p.id}
                  className={`bg-white border p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 shadow-sm ${
                    p.ativa ? 'border-mrc-terracotta/25' : 'border-dashed border-mrc-muted/50 bg-mrc-cream/60'
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className="relative w-28 h-20 flex-shrink-0 bg-mrc-espresso overflow-hidden">
                      {p.imagem_principal && (
                        <img
                          src={p.imagem_principal}
                          alt={p.nome}
                          className={`w-full h-full object-cover ${p.ativa ? '' : 'grayscale opacity-70'}`}
                        />
                      )}
                      <span className="absolute bottom-1 right-1 bg-mrc-espresso/85 text-white text-[10px] px-1.5 py-0.5">
                        {Array.from(new Set([p.imagem_principal, ...p.galeria].filter(Boolean))).length} FOTOS
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-[0.2em] uppercase text-mrc-terracotta">
                        {p.localizacao} · {p.quartos} SUÍTES · ATÉ {p.capacidade_maxima} HÓSPEDES
                      </p>
                      <h4 className="font-serif text-xl text-mrc-charcoal uppercase flex items-center gap-3 flex-wrap">
                        {p.nome}
                        {!p.ativa && (
                          <span className="font-sans text-[10px] font-semibold tracking-[0.18em] bg-mrc-muted text-white px-2 py-0.5">
                            OCULTA DO SITE
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-mrc-muted mt-0.5">
                        Wi-Fi: {p.wifi_nome} | Tarifa atual: {formatarKz(p.preco_noite)} / noite
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-end gap-4">
                    <div>
                      <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-mrc-muted mb-1">
                        PREÇO / NOITE (KZ)
                      </label>
                      <input
                        key={`preco-${p.id}-${p.preco_noite}`}
                        type="number"
                        defaultValue={p.preco_noite}
                        onBlur={(e) =>
                          Number(e.target.value) !== p.preco_noite &&
                          handleAtualizarPreco(p.id, Number(e.target.value), p.taxa_limpeza)
                        }
                        className="w-36 border border-mrc-terracotta/35 px-3 py-2 text-sm font-semibold text-mrc-charcoal"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-mrc-muted mb-1">
                        TAXA LIMPEZA (KZ)
                      </label>
                      <input
                        key={`limpeza-${p.id}-${p.taxa_limpeza}`}
                        type="number"
                        defaultValue={p.taxa_limpeza}
                        onBlur={(e) =>
                          Number(e.target.value) !== p.taxa_limpeza &&
                          handleAtualizarPreco(p.id, p.preco_noite, Number(e.target.value))
                        }
                        className="w-32 border border-mrc-terracotta/35 px-3 py-2 text-sm font-semibold text-mrc-charcoal"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setEditandoId(p.id)}
                        className="inline-flex items-center gap-2 bg-mrc-terracotta hover:bg-mrc-espresso text-white px-4 py-2.5 text-[11px] font-semibold tracking-[0.18em] uppercase transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        EDITAR DADOS &amp; FOTOGRAFIAS
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAlternarVisibilidade(p)}
                        className="inline-flex items-center gap-2 border border-mrc-terracotta/50 text-mrc-terracotta hover:bg-mrc-blush px-4 py-2.5 text-[11px] font-semibold tracking-[0.18em] uppercase transition-colors"
                      >
                        {p.ativa ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {p.ativa ? 'OCULTAR' : 'PUBLICAR'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEliminarPropriedade(p)}
                        aria-label={`Eliminar ${p.nome}`}
                        className="inline-flex items-center gap-2 border border-red-700 text-red-700 hover:bg-red-700 hover:text-white px-4 py-2.5 text-[11px] font-semibold tracking-[0.18em] uppercase transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        ELIMINAR
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            ABA 3: SMART LOCKS & CÓDIGOS PIN
        =================================================================== */}
        {tab === 'FECHADURAS' && (
          <div className="space-y-12">
            {/* Cartões das Fechaduras Conectadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {fechaduras.map((f) => {
                const prop = propriedades.find((p) => p.id === f.propriedade_id);
                return (
                  <div
                    key={f.id}
                    className="bg-white border border-mrc-terracotta/25 p-6 space-y-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold tracking-[0.2em] uppercase text-mrc-terracotta">
                        {f.marca} · {f.device_id}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold tracking-[0.18em] uppercase text-emerald-800">
                        <CheckCircle2 className="w-4 h-4" />
                        ONLINE
                      </span>
                    </div>
                    <h3 className="font-serif text-xl text-mrc-charcoal uppercase">
                      {prop?.nome || f.nome_dispositivo}
                    </h3>
                    <p className="text-sm text-mrc-muted font-normal">{f.nome_dispositivo}</p>
                    <div className="pt-4 border-t border-mrc-terracotta/20 flex items-center justify-between text-xs font-semibold tracking-[0.18em] uppercase text-mrc-charcoal">
                      <span className="flex items-center gap-1.5">
                        <BatteryCharging className="w-4 h-4 text-mrc-terracotta" />
                        BATERIA: {f.bateria_percentual}%
                      </span>
                      <span>SYNC OK</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Formulário para Cadastrar Nova Fechadura Smart Lock */}
            <form
              onSubmit={handleCadastrarFechadura}
              className="bg-white border border-mrc-terracotta/30 p-8 space-y-5 shadow-sm"
            >
              <h3 className="text-xs font-semibold tracking-[0.24em] uppercase text-mrc-terracotta">
                + VINCULAR NOVA FECHADURA INTELIGENTE (IOT SMART LOCK)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold tracking-[0.16em] uppercase text-mrc-muted mb-1">
                    RESIDÊNCIA
                  </label>
                  <select
                    value={lockPropId}
                    onChange={(e) => setLockPropId(e.target.value)}
                    className="w-full border border-mrc-terracotta/35 px-3 py-2.5 text-xs font-semibold uppercase bg-transparent"
                  >
                    {propriedades.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-[0.16em] uppercase text-mrc-muted mb-1">
                    NOME DA PORTA
                  </label>
                  <input
                    type="text"
                    required
                    value={lockNome}
                    onChange={(e) => setLockNome(e.target.value)}
                    placeholder="Ex: Portão Praia / Suíte"
                    className="w-full border border-mrc-terracotta/35 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-[0.16em] uppercase text-mrc-muted mb-1">
                    FABRICANTE
                  </label>
                  <select
                    value={lockMarca}
                    onChange={(e) =>
                      setLockMarca(e.target.value as 'Nuki' | 'Yale' | 'August' | 'Schlage')
                    }
                    className="w-full border border-mrc-terracotta/35 px-3 py-2.5 text-xs font-semibold uppercase bg-transparent"
                  >
                    <option value="Nuki">Nuki</option>
                    <option value="Yale">Yale</option>
                    <option value="August">August</option>
                    <option value="Schlage">Schlage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-[0.16em] uppercase text-mrc-muted mb-1">
                    DEVICE ID (SÉRIE)
                  </label>
                  <input
                    type="text"
                    required
                    value={lockDeviceId}
                    onChange={(e) => setLockDeviceId(e.target.value)}
                    placeholder="NUKI-AO-8821"
                    className="w-full border border-mrc-terracotta/35 px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-mrc-terracotta hover:bg-mrc-espresso text-white py-2.5 px-5 text-xs font-semibold tracking-[0.2em] uppercase transition-all"
                >
                  CADASTRAR LOCK
                </button>
              </div>
            </form>

            {/* Tabela de Códigos PIN */}
            <div className="space-y-4">
              <h3 className="font-serif text-2xl text-mrc-charcoal uppercase tracking-[0.06em]">
                CREDENCIAIS PIN EMITIDAS NAS FECHADURAS
              </h3>
              <div className="bg-white border border-mrc-terracotta/25 overflow-x-auto shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-mrc-terracotta/25 bg-mrc-blush/50 text-xs font-semibold tracking-[0.2em] uppercase text-mrc-terracotta">
                      <th className="p-4">CÓDIGO PIN</th>
                      <th className="p-4">DISPOSITIVO</th>
                      <th className="p-4">JANELA DE VALIDADE</th>
                      <th className="p-4">ESTADO</th>
                      <th className="p-4">CONTROLO DE SEGURANÇA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-mrc-terracotta/15 text-sm">
                    {codigos.map((c) => {
                      const lock = fechaduras.find((f) => f.id === c.fechadura_id);
                      return (
                        <tr key={c.id}>
                          <td className="p-4 font-serif text-xl tracking-[0.18em] text-mrc-charcoal font-medium">
                            {c.pin_code}#
                          </td>
                          <td className="p-4 text-xs font-semibold tracking-wider uppercase text-mrc-muted">
                            {lock?.nome_dispositivo || c.fechadura_id}
                          </td>
                          <td className="p-4 text-xs font-medium tracking-wider uppercase text-mrc-muted">
                            {c.valido_de.slice(0, 10)} → {c.valido_ate.slice(0, 10)}
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-semibold tracking-[0.18em] uppercase px-3 py-1 bg-mrc-blush text-mrc-charcoal">
                              {c.status}
                            </span>
                          </td>
                          <td className="p-4">
                            {c.status !== 'revogado' && c.status !== 'expirado' ? (
                              <button
                                onClick={() => handleRevogarPin(c.id)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.2em] uppercase text-red-800 hover:underline"
                              >
                                <ShieldAlert className="w-4 h-4" />
                                REVOGAR PIN IMEDIATAMENTE
                              </button>
                            ) : (
                              <span className="text-xs font-medium tracking-[0.18em] uppercase text-mrc-muted">
                                CREDENCIAL INATIVA
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            ABA 4: BLOQUEIOS DE CALENDÁRIO & MANUTENÇÃO
        =================================================================== */}
        {tab === 'BLOQUEIOS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5 space-y-6">
              <h3 className="font-serif text-2xl text-mrc-charcoal uppercase tracking-[0.06em]">
                BLOQUEAR DATAS NO CALENDÁRIO
              </h3>
              <form
                onSubmit={handleAdicionarBloqueio}
                className="bg-white border border-mrc-terracotta/25 p-8 space-y-5 shadow-sm"
              >
                <div>
                  <label className="block text-xs font-semibold tracking-[0.2em] uppercase text-mrc-terracotta mb-2">
                    RESIDÊNCIA
                  </label>
                  <select
                    value={propBloqueio}
                    onChange={(e) => setPropBloqueio(e.target.value)}
                    className="w-full border border-mrc-terracotta/35 px-3.5 py-3 text-xs font-semibold tracking-wider uppercase bg-transparent"
                  >
                    {propriedades.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold tracking-[0.2em] uppercase text-mrc-terracotta mb-2">
                      DATA INÍCIO
                    </label>
                    <input
                      type="date"
                      value={inicioBloqueio}
                      onChange={(e) => setInicioBloqueio(e.target.value)}
                      className="w-full border border-mrc-terracotta/35 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-[0.2em] uppercase text-mrc-terracotta mb-2">
                      DATA FIM
                    </label>
                    <input
                      type="date"
                      value={fimBloqueio}
                      onChange={(e) => setFimBloqueio(e.target.value)}
                      className="w-full border border-mrc-terracotta/35 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-[0.2em] uppercase text-mrc-terracotta mb-2">
                    MOTIVO DO BLOQUEIO
                  </label>
                  <input
                    type="text"
                    value={motivoBloqueio}
                    onChange={(e) => setMotivoBloqueio(e.target.value)}
                    className="w-full border border-mrc-terracotta/35 px-3.5 py-2.5 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-mrc-terracotta hover:bg-mrc-espresso text-white py-4 text-xs font-semibold tracking-[0.24em] uppercase transition-all duration-300"
                >
                  ADICIONAR BLOQUEIO DE CALENDÁRIO
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <h3 className="font-serif text-2xl text-mrc-charcoal uppercase tracking-[0.06em]">
                PERÍODOS BLOQUEADOS ATIVOS ({bloqueios.length})
              </h3>
              {bloqueios.length === 0 ? (
                <div className="bg-white border border-mrc-terracotta/20 p-8 text-sm text-mrc-muted">
                  Não existem bloqueios de manutenção registados neste momento.
                </div>
              ) : (
                <div className="space-y-4">
                  {bloqueios.map((b) => {
                    const prop = propriedades.find((p) => p.id === b.propriedade_id);
                    return (
                      <div
                        key={b.id}
                        className="bg-white border border-mrc-terracotta/25 p-6 flex items-center justify-between gap-4 shadow-sm"
                      >
                        <div className="space-y-1">
                          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-mrc-terracotta">
                            {prop?.nome || 'Residência'}
                          </p>
                          <p className="text-sm font-semibold text-mrc-charcoal">
                            {b.data_inicio} até {b.data_fim}
                          </p>
                          <p className="text-xs text-mrc-muted">Motivo: {b.motivo}</p>
                        </div>
                        <button
                          onClick={() => handleRemoverBloqueio(b.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.18em] uppercase text-red-800 hover:underline"
                        >
                          <Trash2 className="w-4 h-4" />
                          DESBLOQUEAR
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================
            ABA 5: LOGS DE AUTOMAÇÃO & MODERAÇÃO DE AVALIAÇÕES
        =================================================================== */}
        {tab === 'LOGS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-serif text-2xl text-mrc-charcoal uppercase tracking-[0.06em]">
                AUDITORIA DE AUTOMAÇÕES (EMAIL · WHATSAPP · SMART LOCK)
              </h3>
              <div className="bg-white border border-mrc-terracotta/25 divide-y divide-mrc-terracotta/15 shadow-sm">
                {logs.map((l) => (
                  <div key={l.id} className="p-5 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold tracking-[0.2em] uppercase text-mrc-terracotta">
                        [{l.canal}] · {l.tipo}
                      </span>
                      <p className="text-sm text-mrc-charcoal font-medium">{l.descricao}</p>
                      <p className="text-xs text-mrc-muted">Destino: {l.destinatario}</p>
                    </div>
                    <span className="text-xs font-semibold tracking-[0.18em] uppercase px-2.5 py-1 bg-mrc-blush text-mrc-charcoal">
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-serif text-2xl text-mrc-charcoal uppercase tracking-[0.06em]">
                MODERAÇÃO DE AVALIAÇÕES ({avaliacoes.length})
              </h3>
              <div className="space-y-4">
                {avaliacoes.map((av) => (
                  <div
                    key={av.id}
                    className="bg-white border border-mrc-terracotta/25 p-6 space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold tracking-[0.2em] uppercase text-mrc-charcoal">
                        {av.hospede_nome} ({av.nota_geral} ★)
                      </span>
                      <button
                        onClick={async () => {
                          await CasaService.alternarPublicacaoAvaliacao(av.id);
                          carregarDados();
                        }}
                        className="text-xs font-semibold tracking-[0.18em] uppercase text-mrc-terracotta underline"
                      >
                        {av.publicada ? 'OCULTAR DO SITE' : 'PUBLICAR NO SITE'}
                      </button>
                    </div>
                    <p className="text-sm text-mrc-muted font-normal italic">
                      &ldquo;{av.comentario}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            ABA 6: FOTOGRAFIAS & VÍDEO DO SITE
        =================================================================== */}
        {tab === 'MEDIA' && <SiteMediaManager notificar={notificar} />}
      </section>

      {/* Editor de Residência (dados + fotografias) */}
      {editandoId &&
        (() => {
          const prop = propriedades.find((p) => p.id === editandoId);
          return prop ? (
            <PropertyEditor
              key={prop.id}
              propriedade={prop}
              onClose={() => setEditandoId(null)}
              onChanged={(msg) => {
                carregarDados();
                notificar(msg);
              }}
              onDeleted={(msg) => {
                setEditandoId(null);
                carregarDados();
                notificar(msg);
              }}
            />
          ) : null;
        })()}

      <Footer />
    </div>
  );
}
