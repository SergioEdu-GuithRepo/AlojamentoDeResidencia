'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { VideoHeroHeader } from '@/components/BrandMotifs';
import { CasaService } from '@/lib/supabase';
import { lembrarEmailReserva } from '@/lib/hospede';
import { ArrowRight, KeyRound, Mail, ShieldCheck, Wifi } from 'lucide-react';

export default function MinhasReservasPage() {
  const router = useRouter();
  const [codigo, setCodigo] = useState('');
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [aProcurar, setAProcurar] = useState(false);

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    const c = codigo.trim().toUpperCase();
    const m = email.trim().toLowerCase();
    if (!c || !m) return;

    setAProcurar(true);
    setErro('');
    try {
      const reserva = await CasaService.getReservaByCodigo(c, m);
      if (!reserva) {
        setErro('Não encontrámos nenhuma reserva com este código e email. Verifique os dados do email de confirmação.');
        return;
      }
      lembrarEmailReserva(reserva.codigo_reserva, m);
      router.push(`/reserva/${reserva.codigo_reserva}`);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível consultar a reserva.');
    } finally {
      setAProcurar(false);
    }
  };

  const campo =
    'w-full border border-mrc-terracotta/35 bg-white pl-12 pr-4 py-4 text-base text-mrc-charcoal focus:outline-none focus:border-mrc-terracotta transition-colors';

  return (
    <div className="min-h-screen bg-mrc-cream text-mrc-charcoal">
      <Navbar />

      <VideoHeroHeader minHeight="min-h-[460px] xl:min-h-[560px]">
        <div className="min-h-[460px] xl:min-h-[560px] flex flex-col items-center justify-center pt-36 xl:pt-64 pb-12 px-6 md:px-14 text-center text-white">
          <div className="max-w-3xl mx-auto space-y-4 animate-fade-up">
            <p className="text-xs font-semibold tracking-[0.28em] uppercase text-white/90">
              PORTAL DO HÓSPEDE
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-normal tracking-[0.08em] uppercase">
              ACESSO À SUA ESTADIA
            </h1>
            <p className="text-base md:text-lg text-white/90 font-normal max-w-xl mx-auto">
              Consulte o código PIN da fechadura, as credenciais Wi-Fi e o guia privado da residência.
            </p>
          </div>
        </div>
      </VideoHeroHeader>

      <section className="py-20 max-w-[880px] mx-auto px-6 md:px-14 space-y-12">
        <form
          onSubmit={handleBuscar}
          className="bg-white border border-mrc-terracotta/25 p-8 md:p-12 shadow-md space-y-7"
          data-reveal
        >
          <div className="space-y-2">
            <h2 className="font-serif text-2xl md:text-3xl uppercase tracking-[0.06em] text-mrc-charcoal">
              Encontrar a minha reserva
            </h2>
            <p className="text-base text-mrc-muted">
              Introduza o código e o email indicados no momento da reserva.
            </p>
          </div>

          {erro && (
            <div role="alert" className="p-4 bg-red-50 border border-red-300 text-red-900 text-sm">
              {erro}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <label className="block space-y-2">
              <span className="block text-xs font-semibold tracking-[0.22em] uppercase text-mrc-terracotta">
                Código da reserva
              </span>
              <span className="relative block">
                <KeyRound className="w-5 h-5 text-mrc-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="CAS-2026-A1B2C3"
                  className={`${campo} uppercase tracking-wider`}
                />
              </span>
            </label>

            <label className="block space-y-2">
              <span className="block text-xs font-semibold tracking-[0.22em] uppercase text-mrc-terracotta">
                Email do titular
              </span>
              <span className="relative block">
                <Mail className="w-5 h-5 text-mrc-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@exemplo.com"
                  className={campo}
                />
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={aProcurar}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-mrc-terracotta hover:bg-mrc-espresso disabled:opacity-60 text-white px-10 py-4 text-xs font-semibold tracking-[0.25em] uppercase transition-colors duration-300"
          >
            {aProcurar ? 'A PROCURAR…' : 'ACEDER AO PORTAL'}
            {!aProcurar && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center" data-reveal>
          {[
            { icone: KeyRound, titulo: 'PIN da fechadura', texto: 'Ativo do check-in ao check-out.' },
            { icone: Wifi, titulo: 'Wi-Fi & guia', texto: 'Credenciais e instruções de entrada.' },
            { icone: ShieldCheck, titulo: 'Acesso privado', texto: 'Só com o código e o seu email.' },
          ].map(({ icone: Icone, titulo, texto }) => (
            <div key={titulo} className="space-y-2 px-4">
              <Icone className="w-6 h-6 text-mrc-terracotta mx-auto" />
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-mrc-charcoal">{titulo}</p>
              <p className="text-sm text-mrc-muted">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
