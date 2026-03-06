# Neat Curb Operations Hub

Production web + admin platform for Neat Curb LLC.

Stack:
- Next.js App Router + TypeScript + Tailwind CSS
- Supabase (Auth + Postgres + RLS)
- Stripe (deposit flow + webhook conversion)
- Resend (transactional email)
- Optional Twilio (SMS)

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Core Flows
- Public landing + quote intake with pricing metadata.
- Admin login with role gating (`admin`, `staff`) and forced password change support.
- Lead -> deposit -> converted client pipeline via Stripe webhook.
- Admin messaging (email/SMS) with audit logging.
- Merkle-style audit timeline.

## Environment Variables
Required for build/runtime:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Recommended for production:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`

## Database Setup
Fresh project:
1. Run `supabase/schema.sql`.
2. (Optional) run `supabase/seed.sql`.

Existing project upgrades:
1. Run `supabase/hardening.sql`.
2. Run `supabase/verify.sql` and confirm checks.

## QA Commands
```bash
npm run lint
npm run build
npm run test:e2e
```

## Deployment Notes
- Primary domain: `https://neatcurbllc.com`
- Keep `www` as redirect alias.
- Stripe webhook endpoint:
  - `https://neatcurbllc.com/api/stripe/webhook`

Release runbook: `docs/release-checklist.md`
