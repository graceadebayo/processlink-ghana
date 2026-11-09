# ProcessLink Ghana — Review of Supplied Files

## What was reviewed
- ProcessLink Ghana presentation.
- ProcessLink Ghana explanation guide.
- Standalone `index.html` clickable demo and clickable-prototype ZIP.
- Phase 1, Phase 2, Phase 3, Phase 4, Phase 5 and Phase 6 ZIP archives.

## Which files should the team use?
**Use `processlink-ghana-phase6.zip` as the starting application source.** It is explicitly labelled as the cumulative Phases 1–6 project and contains the broadest application source tree, documentation, Prisma schema/seed, API routes, dashboards and tests.

Do not unzip Phase 1 through Phase 6 on top of each other. The phase archives contain overlapping copies and the early Phase 1 archive uses older dependency versions and a different authentication setup. Mixing them risks overwriting newer code with older files.

The separate clickable HTML demo is useful for explaining the idea and comparing user journeys. It is not the database-backed Next.js application. The standalone `index.html` file is also a browser-only demonstration; it stores example activity in JavaScript memory.

## Phase 6 technology seen in the supplied files
- Next.js 15.5.6
- React 19
- TypeScript 5.9
- Tailwind CSS 4
- PostgreSQL
- Prisma 6
- Zod validation
- bcrypt password hashing
- Recharts
- Vitest tests

## What appears to be implemented in source
- User model, roles, account status, sessions and password reset tokens.
- Equipment, operator applications, investments, jobs, payments, expenses, distributions, payouts, reviews, notifications and audit log models.
- Auth routes and role dashboards.
- Project and operator application APIs.
- Simulated investment/payment provider.
- Job workflow and expense handling.
- Revenue distribution calculation with integer-pesewa allocation and tests.
- Reports, CSV export, security headers and a same-origin mutation check.
- Deployment and demo documentation.

## Important gaps and checks
1. **Not verified by running:** The supplied project could not be installed and built in this review environment. The first team milestone must be a clean `npm install`, database setup, `npm run lint`, `npm test` and `npm run build`. Do not assume a ZIP being present means it compiles.
2. **No lockfile in the supplied Phase 6 archive:** Run `npm install` successfully and commit the generated `package-lock.json` so all four people use consistent dependency versions.
3. **No Prisma migrations in the supplied archive:** `prisma db push` is documented for prototype setup. Before a maintained deployment, create and commit migrations and use `prisma migrate deploy`.
4. **Account verification needs a product decision:** New users are created with the default `PENDING` status. Some actions require `VERIFIED`, but the team should confirm and implement the full admin verification workflow and explain how a new user becomes verified.
5. **Password reset is described as simulated:** A real transactional email provider and secure token delivery/consumption flow must be verified before production.
6. **Receipt upload storage is local:** The deployment guide itself says local `.data/receipts` is not durable on serverless hosting. Replace it with private object storage and enforce authorization before reading receipts.
7. **Security hardening remains:** Add rate limiting, email verification, session rotation/revocation policy, stronger CSRF/origin controls, monitoring, backups and an independent security review.
8. **Financial and regulatory risk:** This product touches funding and possible investment-like arrangements. Percentages and returns are only prototype assumptions. Equipment ownership, custody of funds, investor rights, loss allocation, fees, disputes and any licensing/regulatory obligations require qualified Ghanaian legal/compliance review before real funds or returns are involved.
9. **Data protection:** Prepare privacy, consent, retention and data-subject request procedures and obtain an appropriate review under applicable Ghanaian data-protection requirements.
10. **Production payment integration is absent:** The payment adapter is deliberately simulated. Do not enter real Mobile Money PINs or describe a simulated payment as a completed real transaction.

## Financial example from the supplied presentation
The illustrative example uses GH₵1,000 in paid jobs less GH₵200 in expenses = GH₵800 net revenue. At the prototype's sample 10% platform / 40% operator / 50% investor pool, the split is GH₵80 / GH₵320 / GH₵400. These values are examples only, not agreed terms or guaranteed returns.

## Product acceptance journey
The team should test this full journey with seeded sample accounts:
1. Admin signs in and reviews an equipment project.
2. Admin approves the project.
3. Investor browses the approved project and simulates a contribution.
4. Operator applies and admin approves/assigns the operator.
5. Customer finds equipment and submits a processing request.
6. Operator accepts, starts and completes the job.
7. Customer records a simulated payment.
8. Operator records expenses and receipt evidence.
9. Admin runs an illustrative distribution for a period.
10. Investor sees the illustrative payout record; admin can inspect audit/report output.

Keep the prototype notice visible throughout the demo.
