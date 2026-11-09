# ProcessLink Ghana — Team Playbook

## Why this document exists
This is the shared working agreement for Angela and the three contributors. Read this before changing code. The project is a Next.js + TypeScript application using PostgreSQL and Prisma. The Phase 6 folder is the cumulative application. Do not merge the separate phase ZIP files together.

## Product in one sentence
ProcessLink Ghana connects people who finance agricultural processing equipment, approved operators who run it, and farmers/businesses who pay to use processing services. An administrator reviews projects, operators and platform activity.

## What is already in the Phase 6 code
- Next.js App Router, React, TypeScript and Tailwind.
- PostgreSQL data model through Prisma.
- Registration, login, logout, password hashing and database sessions.
- Investor, operator, customer and administrator dashboards.
- Equipment project submission, marketplace, approval and operator applications.
- Simulated investment checkout and funding progress.
- Processing job requests and status workflow.
- Expense recording and receipt upload.
- Simulated customer payment, reviews and notifications.
- Revenue distribution calculation, reports, audit records and CSV export.
- Unit tests for selected financial, job and security logic.

This is a substantial prototype foundation, not a verified production-ready service. The team must install, run, test and review it locally before saying it works end-to-end.

## Product rules nobody should silently change
1. Keep the notice “Prototype: payments are simulated. No real money moves.” visible in demo environments.
2. Do not describe investor figures, payout amounts or the 10% / 40% / 50% example as guaranteed returns or final commercial terms.
3. Never connect real Mobile Money or accept real investor funds without a separately approved payment-provider, legal, regulatory, risk and operational plan.
4. Do not expose demo credentials or real secrets in a public repository.
5. Only approved/public equipment projects should appear in the customer/investor marketplace.
6. Role permissions must be checked on the server/API, not just hidden in the user interface.
7. Any important administrator decision or financial distribution must be auditable.
8. Financial arithmetic must reconcile exactly in pesewas; do not use floating-point arithmetic for money calculations.

## Team roles (4 people)
### Angela — Product owner, team lead and integration owner
- Own the product decisions, scope, priorities and acceptance criteria.
- Create and manage the GitHub repository and invite the three contributors.
- Maintain `main`, review pull requests and coordinate releases.
- Own integration, end-to-end testing, demo readiness and project documentation.
- Coordinate finance/business assumptions with the supervisor/advisers. Do not invent investor terms.

### Contributor 1 — Accounts, authentication and trust
Own:
- Registration/login/logout and password reset flow.
- User profile, account status and verification workflow.
- Role and permission tests.
- Security improvements such as rate limiting, email verification and session lifecycle.
Coordinate before editing shared `src/lib/auth.ts`, `src/lib/security.ts`, `src/features/auth/` or auth API routes.

### Contributor 2 — Equipment marketplace and funding
Own:
- Equipment project creation/editing and project details.
- Marketplace search/filtering and project status display.
- Operator applications and admin approval experience.
- Investment contribution flow and funding progress (still simulated).
Coordinate before editing `prisma/schema.prisma`, project APIs, investment APIs or shared project components.

### Contributor 3 — Processing operations
Own:
- Customer processing request flow.
- Operator job inbox and job status updates.
- Equipment assignment visibility.
- Expense capture, receipt handling, reviews and notifications.
Coordinate before editing job/expense APIs, workflow logic, and shared dashboard navigation.

### Angela + contributors by agreement — Finance, reporting and integration
The financial distribution engine, admin reporting, audit log, data model and final integration touch multiple modules. Angela coordinates this area. A contributor may take a clearly scoped issue, but only one person edits the same financial/schema files at a time.

## How we work
- One GitHub repository; one shared `main` branch.
- Nobody works directly on `main`.
- Each task gets its own short-lived branch and GitHub Issue.
- Keep a branch focused on one task.
- Open a Pull Request (PR) when the task is ready.
- At least one other teammate reviews the PR.
- Angela merges after checks pass.
- Everyone pulls the latest `main` before starting the next task.
- Do not email ZIP files back and forth. GitHub is the shared source of truth.

## Definition of Done
A task is done only when:
- It meets the written acceptance criteria.
- It works on a fresh local run, not only on the author's machine.
- Server-side permissions and input validation are present where needed.
- Loading, empty, error and success states are handled.
- Mobile layout has been checked.
- `npm run lint`, `npm test` and `npm run build` pass, or any known failure is documented.
- No `.env`, passwords, tokens, personal data or generated `node_modules` are committed.
- The contributor opens a PR with screenshots/steps to test and a short explanation.

## Current known limitations / work still required
- This is not a production-ready financial platform.
- All payment activity is simulated; there is no real Mobile Money gateway.
- Reset-password delivery is a demo flow, not a confirmed live email service.
- Receipt uploads are written to local disk; this is not durable storage on serverless hosting.
- The README recommends `prisma db push` for prototype setup; a maintained deployment should use committed Prisma migrations.
- Security hardening is incomplete: rate limiting, email verification, session rotation/revocation policy, stronger CSRF/origin controls, monitoring and independent security review remain.
- The project ZIP does not include a `package-lock.json` or committed Prisma migration history. The team must create and commit a lockfile after dependency installation and adopt migrations before production.
- The code has not been successfully installed/built/tested in this review environment. The first team task is to run the setup and record actual results.
- The HTML clickable demo is separate from the database-backed Next.js code. Keep it as a visual/presentation reference; do not copy its browser-only data logic into the backend app.

## Suggested first two weeks
1. Day 1: Angela creates GitHub repo, invites team and uploads Phase 6 source.
2. Day 2: All four clone the repo and run the app locally; log setup blockers.
3. Days 3–4: Fix install/build/schema/seed blockers before feature work.
4. Days 5–7: Each contributor takes one isolated workstream above.
5. Days 8–9: Pull requests, reviews and integration.
6. Day 10: Full role-by-role demo and bug list.
7. Following week: Fix bugs, add missing verification/production safeguards, test mobile screens and prepare the presentation.

## Communication rhythm
- Daily written update in the team WhatsApp/Slack group:
  - Yesterday I completed…
  - Today I am working on…
  - I am blocked by…
  - My branch/PR link is…
- Hold a 20–30 minute team check-in twice a week.
- Record decisions in GitHub Issues or `docs/DECISIONS.md`, not only in private chats.
