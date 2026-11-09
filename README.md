# ProcessLink Ghana — Full Prototype (Phases 1–6)

A mobile-first university project prototype connecting equipment investors, operators and agricultural processing customers in Ghana. **Prototype: payments are simulated.** No real money moves. Any investor figures are illustrative and are not a promise or guarantee of returns.

## Prototype scope

- Next.js App Router + TypeScript + Tailwind CSS
- PostgreSQL data model managed by Prisma
- Seed accounts and demonstration records
- Credentials registration/login/logout and a simulated-email password reset flow
- bcrypt password hashing and database-backed opaque sessions
- Role-protected investor, operator, customer and admin dashboards
- Role-aware navigation and persistent prototype banner

Phase 2 adds project submission and admin approval, operator applications and assignment, public project discovery with filters, and project detail pages. The prototype now includes simulated investment checkout, job lifecycle and expense capture, financial distributions and reporting, plus final hardening guidance. Payments remain simulated; no real money moves.

## Requirements

- Node.js 20.9 or newer
- npm
- PostgreSQL 14 or newer (local or hosted, e.g. Supabase)

## Setup

1. Create a PostgreSQL database named `processlink` (or choose your own database name).
2. Copy `.env.example` to `.env` and set `DATABASE_URL` and a long random `SESSION_SECRET`.
3. Install packages:

   ```bash
   npm install
   ```

4. Generate the Prisma client and create the database schema:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

   For a migration-based workflow, use `npx prisma migrate dev --name init` instead of `db push`.
5. Seed the demo data:

   ```bash
   npm run db:seed
   ```
6. Start the development server:

   ```bash
   npm run dev
   ```
7. Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Deployment secret placeholder; generate a unique random value of at least 32 characters |
| `NEXT_PUBLIC_APP_URL` | Local or deployed application URL |

For Supabase, use the appropriate PostgreSQL connection string. Use a pooled connection URL for runtime if required by your hosting setup and a direct connection URL for migrations where recommended by your provider.

## Demo accounts

All accounts use the password `ProcessLink123!`.

| Role | Name | Email |
|---|---|---|
| Admin | ProcessLink Admin | `admin@processlink.gh` |
| Investor | Ama Mensah | `ama.investor@processlink.gh` |
| Investor | Kojo Asare | `kojo.investor@processlink.gh` |
| Investor | Esi Boateng | `esi.investor@processlink.gh` |
| Operator | Kwame Owusu | `kwame.operator@processlink.gh` |
| Operator | Abena Frimpong | `abena.operator@processlink.gh` |
| Customer | Yaw Addo | `yaw.customer@processlink.gh` |
| Customer | Akosua Nyarko | `akosua.customer@processlink.gh` |
| Customer | Kofi Baah | `kofi.customer@processlink.gh` |
| Customer | Adwoa Sarpong | `adwoa.customer@processlink.gh` |

These are public demo credentials, not production credentials. Do not deploy seeded accounts to a public production environment.

## Security notes

- Passwords are hashed using bcrypt (12 rounds).
- Sessions use high-entropy random tokens; only SHA-256 token hashes are stored in PostgreSQL. Cookies are HttpOnly, SameSite=Lax and Secure in production.
- API inputs are validated server-side with Zod and Prisma uses parameterised queries.
- Public registration cannot create ADMIN accounts.
- Suspended accounts cannot use a session.
- Role checks are performed in each role dashboard server component. Future APIs/server actions must call the same role guard or an equivalent central policy check.
- This is a prototype foundation, not a completed production security review. Add rate limiting, email verification, session rotation/revocation policy, security headers and stricter CSRF/origin checks before public launch.

## Tests and quality checks

Run `npm run lint`, `npm test`, and `npm run build`. Tests cover the distribution engine's pesewa arithmetic and pro-rata investor allocation, job status transitions, simulated payment provider behaviour, and same-origin mutation protection. Run all checks before merging a feature branch. The application has not yet received an independent production security audit.

## Suggested Git workflow

Create a shared `main` branch and use short-lived feature branches. For Phase 1, split work as follows:

- `feature/database-schema-seed` — Prisma schema, seed records and database setup.
- `feature/auth-sessions` — registration, login, logout, password hashing and sessions.
- `feature/role-dashboards` — role layouts, navigation and dashboard summaries.
- `feature/landing-ui` — landing page, responsive styling and prototype notice.

Suggested commit messages:

- `chore: scaffold Next.js TypeScript application`
- `feat(db): add ProcessLink relational schema and demo seed data`
- `feat(auth): add bcrypt credentials and database sessions`
- `feat(ui): add role-specific dashboard layouts`
- `docs: add Phase 1 setup and demo account guide`

## GitHub Issues — Phase 1

1. Scaffold Next.js App Router, TypeScript and Tailwind.
2. Define Prisma schema, enums, relations and indexes.
3. Add reproducible seed data for all four roles and sample records.
4. Implement Zod-validated registration and bcrypt password hashing.
5. Implement login/logout and opaque database-backed sessions.
6. Add server-side role protection and role-specific dashboards.
7. Build responsive landing, authentication and dashboard navigation.
8. Add setup documentation and review security assumptions.

## Phase plan

- [x] Phase 1 — foundation, schema, seed data, authentication and role dashboards
- [x] Phase 2 — projects, approvals, operator applications and project discovery
- [x] Phase 3 — simulated payments, investments, funding logic and investor portfolio
- [x] Phase 4 — jobs, expenses, reviews and notifications
- [x] Phase 5 — distribution engine, reports, charts, audit log and CSV export
- [x] Phase 6 — security headers, CSRF origin guard, tests, README and deployment guide


## Phase 2 — Equipment projects and approvals

- Investors with verified accounts can submit equipment projects. Submissions start as `PENDING_APPROVAL` and are not publicly visible until an administrator approves them.
- Admins can approve or reject pending projects. Every decision is recorded in `AuditLog`, and the submitter receives a notification.
- Verified operators can apply to manage approved projects. Duplicate applications are prevented by the database unique constraint.
- Admins can approve or reject operator applications. Approval assigns the operator to the equipment, with a guard against assigning an already-operated project to a different operator.
- `/projects` lists only approved/public project states and supports equipment type, region and status filters.
- `/projects/[id]` shows project details, funding progress, assigned operator, and recent jobs. Operators can apply from the detail page.

### Phase 2 routes

- `GET /projects` — public approved project catalogue.
- `GET /projects/[id]` — project detail.
- `POST /api/projects` — verified investor/admin project submission.
- `POST /api/projects/[id]/applications` — verified operator application.
- `POST /api/admin/projects/[id]/decision` — admin project approval/rejection.
- `POST /api/admin/applications/[id]/decision` — admin operator application approval/rejection.

### Phase 2 Git branches and issues

Suggested branches: `feature/project-submission`, `feature/project-marketplace`, `feature/operator-applications`, `feature/admin-approvals`.

Suggested commits: `feat(projects): add equipment submission workflow`; `feat(projects): add searchable public marketplace`; `feat(operators): add project application workflow`; `feat(admin): add approval queues and audit events`.

GitHub Issues:
1. Add project submitter relation and submission validation.
2. Implement verified investor project submission with pending approval state.
3. Build project catalogue filters and funding progress display.
4. Build project detail page with operator and recent job information.
5. Implement operator applications and duplicate prevention.
6. Add admin project approval/rejection with audit logs and notifications.
7. Add admin operator application decisions and equipment assignment.
8. Add operator application history and navigation.


## Phase 3 — simulated investments

- Investors with verified accounts can invest in projects with `FUNDING` status.
- `PaymentProvider` is the provider boundary; `SimulatedProvider` returns a fake `SIM-XXXXXX` reference and never contacts a payment network.
- The investment and project funding balance are written in one serializable Prisma transaction. The API rechecks the remaining target and refuses over-funding.
- Investor portfolio data is scoped to the signed-in investor. Payout history is explicitly illustrative.
- The Mobile Money number is used only for the simulation and is not persisted. Never collect or store a payment PIN.

### Phase 3 API

`POST /api/investments` — authenticated, verified INVESTOR only. Body: `{ "equipmentId": "...", "amount": 250.00, "phone": "0240000000" }`. Returns a simulated reference on success.

### Phase 3 checks

`npm test` runs the simulated provider tests. `npm run lint` runs the TypeScript check.

## Phase 4 — jobs, expenses, reviews and notifications

- Verified customers can request processing from active equipment with an assigned verified operator. Requests capture produce type, quantity, location, preferred date and the agreed indicative price.
- Assigned operators can accept or decline requests, start accepted jobs and mark in-progress jobs complete. Transitions are enforced server-side and guarded with conditional database updates.
- Customers can pay only after a job reaches `COMPLETED`. The existing `PaymentProvider` / `SimulatedProvider` boundary is reused. A successful simulation records a payment and changes the job to `PAID` in one transaction. No real money moves.
- Operators can record fuel, maintenance, repairs, labour and other expenses against equipment, optionally linking a job.
- Operators can upload receipt images. The prototype accepts JPEG, PNG and WebP up to 2 MB and checks image signatures. Files are stored outside the public web root under `.data/receipts` for local development and are served only through an authenticated, owner-scoped route (admins can view all). This local filesystem approach is not durable on Vercel/serverless deployments. Phase 6 deployment should replace it with private object storage such as Supabase Storage and signed access URLs.
- Customers can leave one 1–5 star review after payment. Reviews and notifications are scoped to the appropriate users.
- Each user has a private notifications centre and can mark individual notifications or all notifications read.
- `DECLINED` was added to `JobStatus` so an operator declining a request is distinguishable from a customer cancellation.

### Phase 4 routes

- `GET/POST /api/jobs` — list only the caller's relevant jobs, or create a customer request.
- `POST /api/jobs/[id]/status` — assigned operator workflow actions.
- `POST /api/jobs/[id]/payment` — customer simulated payment after completion only.
- `POST /api/jobs/[id]/review` — customer review after payment.
- `POST /api/expenses` — assigned operator expense entry.
- `POST /api/expenses/receipt` — authenticated operator image upload (2 MB limit).
- `GET /api/expenses/receipt/[filename]` — authenticated, owner-scoped receipt image access (admins can view all).
- `GET/PATCH /api/notifications` — caller's notifications and read state.
- `/dashboard/jobs` — role-scoped job workspace, request form, operator actions and expense form.
- `/dashboard/notifications` — personal notifications centre.

### Phase 4 Git branches and issues

Suggested branches: `feature/jobs-api-workflow`, `feature/simulated-job-payment`, `feature/operator-expenses`, `feature/reviews-notifications`.

Suggested commits: `feat(jobs): add customer requests and operator workflow`; `feat(payments): add simulated job checkout`; `feat(expenses): add operator expense capture and receipt uploads`; `feat(notifications): add personal notification centre and job reviews`.

GitHub Issues:
1. Add customer processing request form and server validation.
2. Enforce operator accept, decline, start and complete transitions.
3. Add completed-job-only simulated payment and atomic payment/job update.
4. Add operator expense recording by category.
5. Add receipt image upload validation and size limits.
6. Add one review per paid job.
7. Notify customer and operator at each workflow milestone.
8. Add private notifications centre and mark-read actions.
9. Add tests for valid and invalid job state transitions.


## Phase 5 — Financial distributions and reporting

- Admin-only distribution endpoint: `POST /api/admin/distributions` with `{ equipmentId, periodStart, periodEnd }` (ISO dates; period end is exclusive).
- Distribution calculations use integer pesewas and largest-remainder allocation. Percentages must total exactly 100%.
- Duplicate project/date periods are blocked by the database unique constraint. Creation, investor payout rows, notifications and audit entry share one serializable transaction.
- Admin reports: `/dashboard/admin/reports`; CSV export: `GET /api/admin/reports`.
- Investor payout history appears in the investor portfolio and is labelled illustrative.
- Run unit tests with `npm test`; distribution engine tests cover the GHS 1,000 example, pro-rata payouts, pesewa rounding, non-positive net revenue and invalid percentages.


## Phase 6 — quality and deployment preparation

- Added common browser security response headers (frame denial, MIME sniffing protection, referrer policy, permissions policy and opener isolation).
- Added a same-origin check to every POST API route when the browser supplies an Origin header, with Fetch Metadata fallback when Origin is absent. Session cookies remain HttpOnly, Secure in production and SameSite=Lax.
- Admin approval endpoints now require a verified administrator account.
- Password reset invalidates existing sessions after changing the password.
- Added tests for cross-origin mutation rejection and same-origin acceptance.
- Added `docs/DEPLOYMENT.md` with Vercel, hosted PostgreSQL, private receipt storage and production-hardening instructions.

### Phase 6 Git branches and issues

Suggested branches: `feature/security-hardening`, `test/role-and-finance-regression`, `docs/deployment-guide`, `fix/accessibility-polish`.

GitHub Issues:
1. Run and resolve TypeScript/Prisma build findings in the team's environment.
2. Add persistent private receipt storage adapter before serverless deployment.
3. Add rate limiting and production email delivery.
4. Conduct end-to-end role and financial-data isolation tests.
5. Complete accessibility and mobile-device review.
6. Verify Vercel Preview deployment and PostgreSQL migration workflow.

### Final prototype disclaimer

**Prototype: payments are simulated.** The application does not move real money, hold deposits or guarantee investment returns. All investor return/payout figures are illustrative only. Do not use seeded demo accounts or the local receipt filesystem in production.
