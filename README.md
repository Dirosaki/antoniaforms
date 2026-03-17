# MVP Fase 1 — Pré-agendamento Nutricionista (Pix)

Sistema de pré-agendamento em **Next.js 16** com formulário em português do Brasil, integração Pix (AbacatePay v2), persistência em Supabase e webhook idempotente para confirmação de pagamento.

## 1) Arquitetura resumida

- **Frontend App Router** (`app/(public)/agendamento`): formulário responsivo com React Hook Form + Zod.
- **API interna** (`app/api/payments`): valida dados, cria agendamento, gera cobrança Pix, salva payload do pagamento.
- **Webhook** (`app/api/webhooks/abacatepay`): valida assinatura (quando configurada), grava logs e atualiza status com idempotência.
- **Camada de pagamento extensível** (`lib/payments`): preparada para adicionar cartão na Fase 2 sem refatoração ampla.
- **Banco Supabase** (`supabase/schema.sql`): tabelas `appointments` e `payment_logs`, enums e índices.

---

## 2) Como visualizar a aplicação localmente (passo a passo)

> Pré-requisitos: Node 20+, npm 10+, conta Supabase e conta AbacatePay.

### Passo 1 — Clonar e entrar no projeto

```bash
git clone <URL_DO_REPOSITORIO>
cd antoniaforms
```

### Passo 2 — Instalar dependências

```bash
npm install
```

### Passo 3 — Criar arquivo de ambiente

```bash
cp .env.example .env.local
```

### Passo 4 — Preencher variáveis do `.env.local`

Use os valores reais da sua conta:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESERVATION_FEE_CENTS`
- `FULL_APPOINTMENT_FEE_CENTS`
- `ABACATEPAY_BASE_URL` (padrão: `https://api.abacatepay.com/v2`)
- `ABACATEPAY_API_KEY`
- `ABACATEPAY_WEBHOOK_SECRET` (se disponível no painel)

### Passo 5 — Validar variáveis antes de iniciar

```bash
npm run check:env
```

### Passo 6 — Aplicar schema no Supabase

1. Acesse o projeto no Supabase.
2. Abra **SQL Editor**.
3. Copie e execute o conteúdo de `supabase/schema.sql`.

### Passo 7 — Rodar o projeto

```bash
npm run dev
```

### Passo 8 — Abrir no navegador

Acesse:

- `http://localhost:3000/agendamento`

---

## 3) Como configurar Supabase (detalhado)

1. Crie um projeto no Supabase.
2. Em **Project Settings → API**:
   - copie `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - copie `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
3. Rode o SQL de `supabase/schema.sql` no SQL Editor.
4. Verifique se as tabelas existem:
   - `appointments`
   - `payment_logs`

---

## 4) Como configurar AbacatePay (detalhado)

1. Gere/obtenha a chave secreta da API v2 no painel.
2. Configure `ABACATEPAY_API_KEY` no `.env.local`.
3. Se o painel fornecer assinatura de webhook, configure `ABACATEPAY_WEBHOOK_SECRET`.
4. Crie o webhook para o endpoint:
   - local (com túnel): `https://SEU_TUNEL/api/webhooks/abacatepay`
   - produção: `https://SEU_DOMINIO/api/webhooks/abacatepay`

> **Importante:** a integração está isolada em `lib/payments/abacatepay/provider.ts` e contém suposições de campos v2 para validação final com a documentação oficial.

---

## 5) Teste do webhook em ambiente local

Para receber webhook localmente, use um túnel público (ex.: ngrok, Cloudflare Tunnel):

```bash
ngrok http 3000
```

Depois, registre no AbacatePay a URL pública + `/api/webhooks/abacatepay`.

---

## 6) Deploy na Vercel (passo a passo)

### Opção A — Pelo painel (mais simples)

1. Faça push da branch para GitHub/GitLab/Bitbucket.
2. Na Vercel, clique em **Add New Project**.
3. Importe o repositório.
4. Em **Environment Variables**, adicione todas as chaves da `.env.example`.
5. Deploy.
6. Após deploy, configure o webhook do AbacatePay para:
   - `https://SEU_DOMINIO/api/webhooks/abacatepay`

### Opção B — Pela CLI da Vercel

```bash
npm i -g vercel
vercel login
vercel
vercel --prod
```

Em seguida, configure variáveis:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add RESERVATION_FEE_CENTS production
vercel env add FULL_APPOINTMENT_FEE_CENTS production
vercel env add ABACATEPAY_BASE_URL production
vercel env add ABACATEPAY_API_KEY production
vercel env add ABACATEPAY_WEBHOOK_SECRET production
```

---

## 7) Segurança e boas práticas

- Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` e `ABACATEPAY_API_KEY` no frontend.
- Rotas de pagamento/webhook são server-side.
- Valores monetários sempre em centavos (`amount_cents`) e moeda BRL.
- Webhook é idempotente via `payment_logs.payload_hash`.

---

## 8) Checklist rápido de validação (fim a fim)

- [ ] Formulário valida campos obrigatórios e consentimentos.
- [ ] Submit gera registro em `appointments` com `pending_payment`.
- [ ] Tela de confirmação exibe QR Code e/ou Pix copia e cola.
- [ ] Webhook altera status para `paid_reservation` ou `paid_full`.
- [ ] Reenvio do mesmo webhook não duplica efeitos.
- [ ] Dados sensíveis não aparecem no cliente.

---

## 9) Troubleshooting rápido

- **Erro de variável faltando:** rode `npm run check:env`.
- **Webhook não atualiza status:**
  - confira URL pública do endpoint
  - confira `ABACATEPAY_WEBHOOK_SECRET`
  - veja logs na Vercel / terminal
- **Falha de conexão com Supabase:** confirme URL e service role key.

