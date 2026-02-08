# Neat Curb Admin Command Center

This is the Neat Curb LLC admin dashboard app shell built with Next.js + Tailwind CSS.

## Quick start

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Key features included
- Master Admin Dashboard with KPIs, revenue monitor, weather intelligence, and dispatch control.
- Lead Intake & Pricing Logic using the 2-3 inch snow standard and surcharge rules.
- Business AI chat widget for revenue, lead, and dispatch prompts (proxy to Going Digital engine via `BUSINESS_AI_ENGINE_URL`).
- Merkle-audit security utilities with an audit demo page.
- Public SEO/GEO page with JSON-LD LocalBusiness schema at `/site`.
- CRM, Schedule, Routes, Invoices, and Marketing placeholder modules ready for data wiring.
- Brand assets (RGB + CMYK) archived in `brand-assets/`.

## Next steps
- Connect Supabase for real data.
- Wire Stripe, Twilio, and Maps APIs.
- Add authentication and role-based access control.

## Supabase setup (required for live data)
1. Create a Supabase project.
2. Run the SQL in `supabase/schema.sql`.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`.
4. Create the admin user `neatcurb@gmail.com` in Supabase Auth.
5. Run `supabase/seed.sql` to mark the account for a forced password change.

Schema uses these tables: `profiles`, `leads`, `clients`, `jobs`.
