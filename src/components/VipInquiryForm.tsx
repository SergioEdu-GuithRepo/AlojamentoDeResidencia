'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { BartenderIllustration } from './BrandMotifs';

export default function VipInquiryForm() {
  const [submitted, setSubmitted] = useState(false);
  const [nome, setNome] = useState('');
  const [apelido, setApelido] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [morada, setMorada] = useState('');
  const [cidade, setCidade] = useState('');
  const [residencia, setResidencia] = useState('');
  const [orcamento, setOrcamento] = useState('');
  const [canal, setCanal] = useState('');
  const [perfil, setPerfil] = useState<'HÓSPEDE DIRETO' | 'CONCIERGE / AGENTE'>('HÓSPEDE DIRETO');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email) return;
    setSubmitted(true);
  };

  return (
    <section id="inquire" className="bg-mrc-blush py-24 sm:py-32 px-6">
      <div className="max-w-[760px] mx-auto">
        {/* Ilustração do Bartender no Topo (estilo mrcresidencesbocaraton.com) */}
        <div className="flex flex-col items-center text-center mb-14">
          <BartenderIllustration variant="terracotta" className="w-12 h-24 mb-5" />
          <p className="text-base sm:text-lg text-mrc-terracotta font-normal tracking-wide max-w-lg leading-relaxed">
            Seja o primeiro a receber disponibilidades privadas, tarifas sazonais em Kwanzas (AOA) e novidades exclusivas da Mr. C Residências.
          </p>
        </div>

        {submitted ? (
          <div className="border border-mrc-terracotta/30 bg-white p-12 text-center space-y-4 animate-fade-up shadow-sm">
            <div className="w-12 h-12 mx-auto border border-mrc-terracotta flex items-center justify-center text-mrc-terracotta">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-xl text-mrc-charcoal uppercase tracking-[0.16em] font-medium">
              PEDIDO REGISTADO COM SUCESSO
            </h3>
            <p className="text-base text-mrc-muted font-normal max-w-md mx-auto leading-relaxed">
              Obrigado, {nome}. A nossa equipa de Concierge Privado entrará em contacto brevemente através do email {email}.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 text-xs font-semibold tracking-[0.24em] uppercase text-mrc-terracotta underline underline-offset-8"
            >
              ENVIAR NOVA CONSULTA
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Primeiro Nome *"
                className="mrc-input-underline"
              />
              <input
                type="text"
                required
                value={apelido}
                onChange={(e) => setApelido(e.target.value)}
                placeholder="Apelido *"
                className="mrc-input-underline"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email *"
                className="mrc-input-underline"
              />
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="Telefone / WhatsApp (+244) *"
                className="mrc-input-underline"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <input
                type="text"
                value={morada}
                onChange={(e) => setMorada(e.target.value)}
                placeholder="Morada / Empresa"
                className="mrc-input-underline"
              />
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Cidade / Província (Ex: Luanda)"
                className="mrc-input-underline"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <select
                value={residencia}
                onChange={(e) => setResidencia(e.target.value)}
                className="mrc-input-underline bg-transparent cursor-pointer"
              >
                <option value="">Residência de Interesse *</option>
                <option value="Villa Atlântica Mussulo">Villa Atlântica Mussulo (450.000 Kz / noite)</option>
                <option value="Residência Miradouro Talatona">Residência Miradouro Talatona (380.000 Kz / noite)</option>
                <option value="Penthouse Baía Atelier">Penthouse Baía Atelier (290.000 Kz / noite)</option>
                <option value="Casa das Dunas Cabo Ledo">Casa das Dunas Cabo Ledo (520.000 Kz / noite)</option>
              </select>

              <select
                value={orcamento}
                onChange={(e) => setOrcamento(e.target.value)}
                className="mrc-input-underline bg-transparent cursor-pointer"
              >
                <option value="">Duração Pretendida *</option>
                <option value="2-4 Noites">Fim de Semana (2 – 4 Noites)</option>
                <option value="5-10 Noites">Estadia Semanal (5 – 10 Noites)</option>
                <option value="14+ Noites">Longa Duração / Corporativo (14+ Noites)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start pt-2">
              <div className="space-y-2.5">
                <p className="text-xs font-medium tracking-[0.14em] text-mrc-charcoal">
                  Perfil de Reserva *
                </p>
                <div className="flex flex-col space-y-2 text-xs text-mrc-charcoal">
                  <label className="inline-flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="perfil"
                      checked={perfil === 'HÓSPEDE DIRETO'}
                      onChange={() => setPerfil('HÓSPEDE DIRETO')}
                      className="accent-[#1A4734] w-3.5 h-3.5"
                    />
                    <span>Hóspede Particular (Acesso Direto Smart Lock)</span>
                  </label>
                  <label className="inline-flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="perfil"
                      checked={perfil === 'CONCIERGE / AGENTE'}
                      onChange={() => setPerfil('CONCIERGE / AGENTE')}
                      className="accent-[#1A4734] w-3.5 h-3.5"
                    />
                    <span>Concierge Corporativo / Agência de Viagens</span>
                  </label>
                </div>
              </div>

              <div>
                <select
                  value={canal}
                  onChange={(e) => setCanal(e.target.value)}
                  className="mrc-input-underline bg-transparent cursor-pointer"
                >
                  <option value="">Como conheceu a Mr. C Residências? *</option>
                  <option value="Membro Mr. C">Membro / Hóspede Anterior</option>
                  <option value="Imprensa & Arquitetura">Imprensa &amp; Arquitetura</option>
                  <option value="Recomendação Privada">Recomendação Privada</option>
                </select>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                className="w-full rounded-full bg-mrc-terracotta hover:bg-mrc-espresso text-white py-4 text-xs font-semibold tracking-[0.28em] uppercase transition-all duration-300 shadow-md"
              >
                ENVIAR SOLICITAÇÃO
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
