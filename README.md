# Anamnese Inteligente

SaaS para Personal Trainers: cadastro de alunos, anamnese conversacional inteligente, relatórios gerados por IA (Claude), insights, alertas, check-ins e automações de WhatsApp/e-mail.

## Stack
- Next.js 14 (App Router) + TypeScript estrito
- Tailwind CSS + shadcn/ui + Framer Motion
- Supabase (Postgres + Auth + RLS)
- Anthropic Claude API (`claude-sonnet-4-6`) para os relatórios
- Resend (e-mail) e gateway de WhatsApp (opcional)

## Variáveis de ambiente (Vercel)
Veja `.env.example`. Configure:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
WHATSAPP_API_URL=        # opcional
WHATSAPP_API_KEY=        # opcional
NEXT_PUBLIC_APP_URL=     # ex: https://seuapp.vercel.app
CRON_SECRET=             # opcional, protege /api/cron/automacoes
```

## Supabase
1. Crie um projeto no Supabase.
2. No SQL Editor, rode na ordem:
   - `supabase/migrations/0001_init.sql` (tabelas, índices, RLS)
   - `supabase/migrations/0002_auth_trigger.sql` (cria o perfil do personal no sign-up)
3. Copie URL, anon key e service role key para as variáveis de ambiente.

O `service_role` é usado apenas no servidor para o acesso por token do aluno
(sem login) e para a geração de relatórios — nunca é exposto ao navegador.

## Rodando localmente
```bash
npm install
cp .env.example .env   # preencha os valores
npm run dev
```
- `npm run typecheck` — checagem de tipos
- `npm run build` — build de produção

## Como funciona
- **Personal** entra via Supabase Auth. Cadastra alunos → gera link único `/anamnese/[token]`.
- **Aluno** responde a anamnese conversacional (uma pergunta por vez, com ramificações condicionais). Respostas têm autosave.
- Triagem cardiovascular positiva cria **alerta crítico** imediatamente.
- Ao concluir, um **relatório IA** é gerado de forma assíncrona (16 seções) e fica visível só para o personal.
- Check-ins semanais; dor relatada gera alerta ortopédico.
- **Insights** categoriza alunos (em risco, engajados, com dores, inativos, precisam contato).
- **Automações** (cron diário em `/api/cron/automacoes`): lembrete de anamnese, check-in semanal, motivacional, reavaliação.

## Deploy (Vercel)
Conecte o repositório, configure as variáveis e faça deploy. O `vercel.json`
já registra o cron diário das automações.
