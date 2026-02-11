# Neat Curb Production Release Checklist

## 1) Vercel Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `TWILIO_ACCOUNT_SID` (optional if SMS enabled)
- `TWILIO_AUTH_TOKEN` (optional if SMS enabled)
- `TWILIO_FROM_NUMBER` (optional if SMS enabled)

## 2) Supabase Auth Configuration
- Site URL: `https://neatcurbllc.com`
- Redirect URLs:
  - `https://neatcurbllc.com/admin/change-password`
  - `https://www.neatcurbllc.com/admin/change-password`
  - `https://neatcurbllc.com/admin/login`
  - `https://www.neatcurbllc.com/admin/login`
- Confirm Email enabled if desired.
- Custom SMTP configured and tested.

## 3) Resend DNS + Domain
- Domain `neatcurbllc.com` must be **Verified** in Resend.
- If SMTP return path uses `send.neatcurbllc.com`, that subdomain must also be verified.
- SPF/DKIM/DMARC records present in Namecheap.

## 4) Supabase Schema + Policies
- Run `/supabase/schema.sql` for fresh projects.
- Run `/supabase/hardening.sql` on existing projects.
- Run `/supabase/verify.sql` and confirm all checks return expected values.

## 5) Stripe Webhook
- Endpoint URL:
  - `https://neatcurbllc.com/api/stripe/webhook`
- Event:
  - `checkout.session.completed`
- Replay event test confirms idempotency (no duplicate clients/jobs/payments).

## 6) Smoke Checks
- Public quote submit works from `/request-quote`.
- Admin login works from `/admin/login`.
- Forced password flow routes to `/admin/change-password` when required.
- Admin dashboard loads with role-scoped access.

## 7) Build + Test
- `npm run lint`
- `npm run build`
- `npm run test:e2e` (optional in CI environment)
