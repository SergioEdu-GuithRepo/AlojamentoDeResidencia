# Casa C Residences & Collection — Plataforma de Reservas & Alojamentos de Luxo

Plataforma completa de alojamento local e residências privadas de luxo, desenvolvida com **Next.js 15 (App Router)**, **Tailwind CSS**, **TypeScript** e **Supabase**. O design e a identidade visual foram meticulosamente inspirados no estilo arquitetónico e editorial de **Mr. C Residences (Boca Raton, FL / Cipriani)**.

---

## 🏛️ Identidade Visual & Design (Inspirado nas Referências)

- **Cores Distintas**:
  - `Burgundy / Terracotta` (`#732425` / `#943D39`): Cabeçalhos nobres, botões primários e divisores de destaque.
  - `Warm Cream / Linho` (`#FAF6F0` / `#F4ECE1`): Fundo suave, painéis alternados e tipografia de contraste.
  - `Gold / Bronze` (`#C5A880`): Acentos de luxo, insígnias de estrelas e contornos subtis.
- **Padrão Geométrico Trellis (Lattice)**: Marca d'água refinada presente nos cabeçalhos, rodapés e blocos editoriais alternados (*"Thoughtfully Refined Private Residences"*, *"Wind Down or Repeat"*, *"Boca Raton Authentic Style"*).
- **Galeria Editorial ("The Gallery")**: Abas por categoria (`ALL`, `RESIDENCES`, `EXTERIOR`, `AMENITIES`, `BELLINI`), botões circulares com sinal `+` no canto inferior direito e modal *Lightbox* para visualização em alta resolução.
- **Formulário VIP de Inquérito**: Formulário completo para lista de interesse com tipologias e faixas de preço.

---

## 🚀 Estrutura de Páginas & Funcionalidades

### 1. Página Inicial (`/`)
- Hero banner com tipografia de luxo (*"COME HOME TO CASA MR. C"*).
- Widget de pesquisa rápida de disponibilidade (Destino, Check-in, Check-out e Hóspedes).
- Seções editoriais com padrão geométrico de treliça e fotografia arquitetural.
- Seleção de residências em destaque com detalhes e acesso direto à reserva.
- Secção *The Gallery* com filtros e lightbox interativo.
- Formulário VIP para receção de novidades e pedidos de reserva prioritários.

### 2. Catálogo com Filtros Avançados (`/propriedades`)
- Filtros em tempo real por intervalo de datas, número de hóspedes, comodidades exclusivas (Piscina Infinita, Vista Mar, Doca de Iate, Elevador Privativo, Wi-Fi 1Gbps) e preço máximo.
- Verificação instantânea de disponibilidade com prevenção de sobreposição de datas.

### 3. Página da Residência (`/propriedades/[slug]`)
- Galeria de imagens com seletor interativo de miniaturas.
- Especificações completas: Hóspedes, Quartos, Banheiros e Área em m².
- Descrição arquitetural, lista de comodidades de luxo e regras da casa.
- **Widget de Reserva Flutuante**: Cálculo transparente do número de noites, taxa de limpeza profissional, taxa de serviço e valor total.
- **Validação de Double-Booking**: Bloqueia de imediato datas já ocupadas ou bloqueadas pelo administrador.
- Testemunhos e avaliações reais de clientes com estrelas.

### 4. Checkout Seguro & Pagamento (`/checkout`)
- Formulário com dados do hóspede principal (Nome, Email, Telefone, Documento/Passaporte, Notas especiais).
- Simulação de pagamentos seguros: Cartão de Crédito, MB WAY, Apple Pay e Transferência Bancária.
- **Separação estrita dos estados**: `status_reserva` (confirmada/pendente) e `status_pagamento` (pago/pendente).
- Geração instantânea do código de reserva exclusivo (ex: `CASA-2026-X89K`), criação do PIN temporário da fechadura inteligente e envio simulado de emails de confirmação.

### 5. Portal do Hóspede (`/minhas-reservas` e `/reserva/[codigo]`)
- Localização rápida de estadias por código ou email.
- **Proteção Rigorosa de Dados e Fechadura**:
  - A morada exata e o código PIN temporário permanecem protegidos e encriptados.
  - São revelados apenas dentro do período autorizado (a partir de 24h antes do check-in).
  - Inclui botão de simulação para testar ambos os estados (*"No Período Autorizado"* vs *"Antes de 24h"*).
- Instruções passo a passo de abertura da porta via teclado digital.
- Protocolo de redundância caso a ligação falhe (cofre físico exterior com chave mestra e contacto telefónico 24/7).
- Botão de **Check-out Autónomo**: Revoga o código da fechadura e notifica a equipa de limpeza.
- Formulário para submissão de avaliação pública após a conclusão.

### 6. Painel de Gestão Administrativa (`/admin`)
- **Métricas de Performance**: Receita total confirmada, taxa de ocupação média, contagem de reservas e estado das fechaduras IoT.
- **Aba Reservas & Pagamentos**: Consulta, filtragem por status e ação de cancelamento com estorno.
- **Aba Propriedades**: Consulta de tarifas por noite, taxas de limpeza e especificações.
- **Aba Fechaduras & Códigos IoT**: Monitorização das fechaduras (baterias em %, status online/offline, identificadores) e tabela de códigos temporários com botão de **Revogação Imediata**.
- **Aba Calendários & Bloqueios**: Bloqueio manual de datas para manutenção, uso do proprietário ou sincronização externa (Airbnb/Booking).
- **Aba Logs de Automações**: Histórico de emails e notificações transacionais disparadas pelo sistema.
- **Aba Avaliações**: Moderação e visualização dos comentários enviados pelos clientes.

---

## 🗄️ Esquema Supabase (PostgreSQL)

O ficheiro [`supabase/schema.sql`](file:///Users/administrator/Documents/Casa/supabase/schema.sql) define a estrutura relacional de dados:

1. `propriedades`: Armazena os dados das casas, fotografias, comodidades, preços e regras.
2. `fechaduras`: Cadastro de dispositivos inteligentes (Nuki, Yale, August), níveis de bateria e status.
3. `reservas`: Registo de reservas com separação de status (`status_reserva` e `status_pagamento`).
4. `codigos_acesso`: PINs de 6 dígitos gerados por algoritmo com janela de validade e status.
5. `pagamentos`: Transações associadas às reservas com método e comprovativos.
6. `avaliacoes`: Classificação por estrelas e comentários dos hóspedes.
7. `bloqueios_calendario`: Bloqueios de manutenção e sincronização de calendários.
8. `automacoes_logs`: Registo de emails de confirmação, lembretes de chegada e avisos de limpeza.
9. **Função PL/pgSQL `verificar_disponibilidade()`**: Valida no banco a inexistência de sobreposição de datas (*double-booking prevention*).

O ficheiro [`supabase/seed.sql`](file:///Users/administrator/Documents/Casa/supabase/seed.sql) contém dados iniciais de demonstração prontos a importar.

---

## 💻 Como Executar o Projeto

```bash
# 1. Instalar dependências (já executado)
npm install

# 2. Compilar para produção (já verificado com sucesso)
npm run build

# 3. Iniciar o servidor local (Porta 3001)
npx next start -p 3001
# ou em modo de desenvolvimento:
npm run dev -- -p 3001
```

O site estará disponível em:
- **Página Principal**: [http://localhost:3001](http://localhost:3001)
- **Catálogo de Residências**: [http://localhost:3001/propriedades](http://localhost:3001/propriedades)
- **Portal do Hóspede**: [http://localhost:3001/minhas-reservas](http://localhost:3001/minhas-reservas)
- **Painel de Gestão (Admin)**: [http://localhost:3001/admin](http://localhost:3001/admin)
