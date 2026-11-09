# ProcessLink Ghana — deployment guide

This is a university-project prototype. **Prototype: payments are simulated.** No real money moves. Investor projections and payouts are illustrative, not guaranteed returns.

## 1. Prepare PostgreSQL

Create a hosted PostgreSQL database (for example, Supabase). Keep the database password private. Use the provider's pooled URL for application runtime if required and a direct URL for schema migration commands. The current Prisma datasource reads `DATABASE_URL`.

## 2. Configure Vercel

1. Push the project to a private GitHub repository.
2. Import the repository into Vercel and select the Next.js framework preset.
3. Set these environment variables in Preview and Production:
   - `DATABASE_URL`: hosted PostgreSQL connection string.
   - `SESSION_SECRET`: a cryptographically random secret of at least 32 characters. Do not commit it.
   - `NEXT_PUBLIC_APP_URL`: the exact deployed HTTPS origin, e.g. `https://your-project.vercel.app`.
4. Deploy a Preview environment first.
5. Apply the Prisma schema from a trusted local/CI environment with database access: `npx prisma generate` then `npx prisma db push` for this prototype. For a maintained deployment, commit Prisma migrations and use `npx prisma migrate deploy` instead.
6. Do not run the demo seed against production. Seed only a disposable demo database.
7. Verify login, role access, project approval, simulated investments, job lifecycle, reports and CSV download in Preview before promoting to Production.

## 3. Persistent receipt storage

Phase 4's receipt upload uses local disk storage under `.data/receipts`. Serverless filesystems are ephemeral and must not be used for durable production uploads. Before Vercel deployment, replace this adapter with a private object-storage bucket (e.g. Supabase Storage):

- Accept only JPEG, PNG and WebP; enforce the 2 MB cap and verify file signatures on the server.
- Generate random object keys; never trust user-provided filenames.
- Keep the bucket private. Store only the object key in PostgreSQL.
- Authorise every read against the associated equipment/job and current user; issue short-lived signed URLs only after authorisation.
- Add malware scanning if the prototype is opened to public uploads.

## 4. Production hardening checklist

- [ ] Replace simulated reset-link preview with a real transactional email provider.
- [ ] Add rate limiting for login, registration, reset requests and payment simulation endpoints.
- [ ] Add email verification and a documented admin onboarding process; never expose admin registration.
- [ ] Add operational logging, error monitoring, database backups and restore testing.
- [ ] Use Prisma migrations rather than `db push` for controlled schema changes.
- [ ] Review privacy notice, retention, consent and Ghana Data Protection Act obligations with the project supervisor/legal adviser.
- [ ] Perform dependency, security and accessibility reviews.
- [ ] Keep all payments simulated unless a regulated payment provider integration and compliance review are completed.
- [ ] Review financial terms and distribution contracts; illustrative projections are not investment advice or guaranteed returns.

## 5. Local development

```bash
cp .env.example .env
# Set DATABASE_URL and SESSION_SECRET
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Run quality checks:

```bash
npm run lint
npm test
npm run build
```

## 6. Demo safety

Seed accounts are public demonstration credentials. Do not deploy them to a public production database. The seed script is destructive to existing demo records; use only against a disposable development database.
