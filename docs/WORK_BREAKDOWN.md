# ProcessLink Ghana — Work Breakdown and Acceptance Checklist

This is the initial division for four people. Adjust names and dates in the team meeting, but keep one owner per task.

| Owner | Workstream | First tasks | Main areas |
|---|---|---|---|
| Angela (lead) | Product, integration, finance, release | Create repo; establish acceptance criteria; validate end-to-end flow; own final merge/release | README, docs, admin/finance integration, shared schema coordination |
| Contributor 1 | Accounts and trust | Verify registration/login; define account verification; implement safe reset delivery; role-permission tests | `src/features/auth/`, `src/lib/auth.ts`, auth API/routes |
| Contributor 2 | Equipment and funding | Improve project creation/details/search; test approval and operator application; test investment/funding cap | `src/features/projects/`, project APIs/pages, investment flow |
| Contributor 3 | Processing operations | Test customer requests; operator accept/start/complete/decline; expenses/receipts; reviews/notifications | `src/features/jobs/`, jobs/expenses APIs and components |

## Work order (do not build everything at once)

### Stage 0 — Make the existing app run
Acceptance:
- Each contributor can clone the repository.
- `npm install` completes and a lockfile is committed.
- PostgreSQL connection works.
- Prisma client generates.
- Schema can be applied to a disposable development database.
- Seed script completes.
- `npm run dev` opens the app.
- `npm run lint`, `npm test` and `npm run build` results are recorded.
- All known failures become GitHub Issues with exact error output.

### Stage 1 — Confirm the business workflow
Acceptance:
- Investor can see only projects that should be visible to that role.
- Admin can review project submissions.
- Operator can apply and be assigned.
- Customer can request a job against an eligible equipment project.
- Operator can accept, decline, start and complete jobs using valid state transitions.
- Customer can record a simulated payment only after completion.
- Expenses are associated with the correct equipment/job.
- Admin can generate a distribution for a valid period and the figures reconcile in pesewas.
- Audit records and notifications are generated for important actions.

### Stage 2 — Close product gaps
Create separate GitHub issues for:
- User verification workflow: define who verifies accounts, what evidence is required, status changes and appeal/contact process.
- Real password-reset email delivery (use a provider; do not reveal reset tokens on screen in production).
- Rate limiting for login, registration and reset requests.
- Session expiry, logout-all-devices and revocation policy.
- Profile editing and account support/contact experience.
- Error, empty and loading states on every dashboard.
- Mobile responsive QA for all roles.
- Receipt storage adapter that uses private durable object storage in deployment.
- Prisma migrations and safe migration deployment.
- Monitoring, backups and restore test.
- Accessibility review.
- Data privacy notice, retention, consent and Ghana Data Protection Act review with an appropriate adviser.
- Financial model, equipment ownership, investor risk, dispute, downtime, insurance and operator responsibilities documented and legally reviewed.

### Stage 3 — Release readiness (not the same as prototype demo readiness)
Do not call it production-ready until:
- Security review is complete.
- Payment/legal/regulatory path is approved before real-money features.
- All money calculations and reconciliation are tested.
- Database migrations and backups are in place.
- File uploads use private durable storage and access checks.
- Rate limits, monitoring and alerting are active.
- Privacy and support processes are published.
- Realistic user acceptance tests are signed off.
- No public demo credentials remain enabled.
- Production deployment and rollback are rehearsed.

## Suggested GitHub labels
`good first issue`, `frontend`, `backend`, `database`, `security`, `testing`, `documentation`, `blocked`, `needs product decision`.

## PR template
Copy this into each pull request:

### What changed?
Describe the change in plain English.

### Why?
Which user problem or GitHub Issue does it address?

### How to test
1. …
2. …
3. …

### Checklist
- [ ] I pulled the latest `main` before starting.
- [ ] I worked on a feature branch.
- [ ] I did not commit `.env`, passwords or private data.
- [ ] I checked role permissions and server-side validation.
- [ ] I tested mobile layout where relevant.
- [ ] `npm run lint` passes.
- [ ] `npm test` passes.
- [ ] `npm run build` passes.
- [ ] I added screenshots or exact test evidence.
