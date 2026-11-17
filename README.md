ProcessLink Ghana
Fund the machine. Process the harvest.

ProcessLink Ghana is a web platform that connects four groups around shared agricultural processing equipment (cassava graters, palm fruit presses, maize mills and similar machines):

Investors fund the equipment.
Operators run it.
Customers (farmers and small processors) pay to have their produce processed.
Admins approve projects and users, and oversee the money.
Every step is recorded, so each party can see who invested, who operated the machine, what customers paid, what was spent, and how the revenue was shared.

Prototype notice: All payments are simulated. No real money moves, no returns are guaranteed, and all figures are illustrative. The project needs legal, regulatory and security review before any real-world use.

University project by Group One: Bernard Titus Quansah, Yahaya Innocent Adam, Grace Adebayo and Ransford Paanii Tetteh.

Table of contents
The problem
How it works
Quick demo (no setup)
Demo accounts
Revenue split
Tech stack
Run the full application
Project structure
Database design
Python analytics service
Security
Testing
Deployment
Limitations and next steps
Team
The problem
Machines are expensive. One farmer or small business often cannot afford a grater, press or mill alone.
Funders cannot see where money goes. People willing to invest have no clear record of how a machine is used.
Farmers cannot find nearby equipment. Produce is lost or sold cheaply because processing is far away.
ProcessLink turns each machine into a project that investors fund, an operator runs, and many farmers use, with a transparent record of every cedi.

How it works
One machine, from start to finish:

1. Project submitted

2. Admin approves

3. Investors fund it

4. Operator assigned

5. Customer books and pays

6. Money is split





Role	What they can do
Visitor	Browse the marketplace and filter equipment projects (read-only).
Investor	Fund a project (alone or as a group) with a simulated Mobile Money payment, then track the portfolio and payouts.
Operator	Apply to run a machine, accept or decline jobs, start and complete them, and record expenses (with receipt upload).
Customer	Request processing online (or via simulated USSD / WhatsApp), pay, follow job status, and leave a review.
Admin	Approve users, projects and operator applications; run revenue distributions; view reports and analytics; export CSV; see the audit log.
Project lifecycle: DRAFT → PENDING_APPROVAL → FUNDING → FUNDED → ACTIVE → CLOSED (or REJECTED).

Job lifecycle: REQUESTED → ACCEPTED → IN_PROGRESS → COMPLETED → PAID (or DECLINED / CANCELLED).

Quick demo (no setup)
The easiest way to see what each user sees is the standalone interactive prototype. It is a single HTML file with no database or server needed.

Open public/processlink-prototype.html in any modern browser (double-click it).
Sign in with one of the demo accounts, or browse as a Visitor.
Click Guided demo (top right) for a step-by-step walkthrough.
Use the Preview role switcher in the sidebar to jump between Investor, Operator, Customer, Admin and Visitor views.
Things worth trying:

Stop	What to do
Visitor	Open the marketplace and filter equipment projects.
Investor	Fund a project alone or as a group (simulated payment), then open My portfolio.
Customer	Request a job online, or through the simulated USSD / WhatsApp flow, then follow its status.
Operator	Accept the job, complete it, and record an expense.
Admin	Approve users and projects, view the revenue split and reports.
Cold chain	Open Solar Cold Room, Techiman and press Simulate power cut to see the temperature alert.
A wrong password shows an error before letting you in, just like the real build.

Demo accounts
Role	Name	Email
Investor	Ama Mensah	ama.investor@processlink.gh
Operator	Kwame Owusu	kwame.operator@processlink.gh
Customer	Yaw Addo	yaw.customer@processlink.gh
Admin	ProcessLink Admin	admin@processlink.gh
Where	Password
Standalone prototype (public/processlink-prototype.html)	demo1234
Full app after npm run db:seed	ProcessLink123!
The full-app seed also creates more users (for example kojo.investor@, esi.investor@, abena.operator@, akosua.customer@, kofi.customer@, adwoa.customer@, all at @processlink.gh). These are public demo credentials: never use them on a real production database.

Revenue split
Revenue is shared in a fixed, visible way. Defaults are 10% platform / 40% operator / 50% investor pool, configurable per equipment project and required to total exactly 100%.

Paid jobs      GH₵1,000
- Expenses     GH₵  200
= Net revenue  GH₵  800

Platform  10%  ->  GH₵ 80
Operator  40%  ->  GH₵320
Investors 50%  ->  GH₵400   (shared by how much each investor put in)

The engine (src/features/distribution/engine.ts) works in whole pesewas (integers, never floating-point cedis) and uses largest-remainder allocation, so the parts always add up exactly to the net revenue. If expenses exceed revenue, nothing is distributed.

Tech stack
Layer	Technology
Website	Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4
Database	PostgreSQL (hosted on Neon) accessed with Prisma ORM
Auth and roles	Email and password with bcrypt hashing, signed session cookies (jose), role-based access
Validation	Zod schemas on every API input
Charts	Recharts
Analytics	Python FastAPI microservice (Render)
Testing	Vitest (TypeScript) and pytest (Python)
Hosting	GitHub, Vercel (web) and Render (analytics)
Run the full application
Prerequisites
Node.js 20 or newer
PostgreSQL (local, or a hosted database such as Neon)
Python 3.10 or newer (only for the analytics service)
Steps
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
#    then edit .env (see the table below)

# 3. Create the database tables
npx prisma generate
npx prisma db push

# 4. Load demo data (users, projects, investments, jobs, a sample distribution)
npm run db:seed

# 5. Start the app
npm run dev

Open http://localhost:3000 and sign in with a demo account.

Environment variables
Variable	Purpose
DATABASE_URL	PostgreSQL connection string.
SESSION_SECRET	Random secret of at least 32 characters for signing sessions.
NEXT_PUBLIC_APP_URL	Public URL of the app, e.g. http://localhost:3000.
PYTHON_ANALYTICS_URL	Base URL of the analytics service, e.g. http://127.0.0.1:8000.
PYTHON_ANALYTICS_API_KEY	Shared secret between the web app and the analytics service.
Never commit .env. Only .env.example belongs in Git.

Useful scripts
Command	What it does
npm run dev	Start the development server.
npm run build	Generate the Prisma client and build for production.
npm run lint	Type-check with tsc --noEmit.
npm test	Run the unit tests.
npm run db:push	Push the Prisma schema to the database.
npm run db:migrate	Create and apply a Prisma migration.
npm run db:seed	Reset and load demo data. Destructive: use only on a disposable database.
Project structure
processlink-ghana/
├── prisma/
│   ├── schema.prisma          # Database models and enums
│   ├── migrations/            # SQL migrations
│   └── seed.ts                # Demo data
├── public/
│   └── processlink-prototype.html   # Standalone interactive demo (no setup)
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login, register, forgot/reset password
│   │   ├── projects/          # Public marketplace and project detail pages
│   │   ├── dashboard/         # Investor, operator, customer, admin workspaces
│   │   └── api/               # REST endpoints (auth, projects, investments,
│   │                          #   jobs, expenses, notifications, admin)
│   ├── components/            # UI components (admin, jobs, projects, shell)
│   ├── features/              # Business logic and Zod schemas
│   │   ├── distribution/      # Revenue split engine (+ tests)
│   │   ├── investments/       # Simulated payment provider (+ tests)
│   │   ├── jobs/              # Job status workflow (+ tests)
│   │   ├── auth/ projects/    # Validation schemas
│   └── lib/                   # Auth, Prisma client, security helpers
├── services/analytics/        # Python FastAPI analytics service (+ tests)
├── docs/
│   ├── DEPLOYMENT.md          # Full deployment guide
│   └── DEMO_SCRIPT.md         # 8-minute presentation script
├── DOCS/TEAM/                 # Team member profiles
└── (*.php, database.sql, CODE_EXPLAINED.md)   # Early PHP/MySQL prototype, see note below

Note on the PHP files. The root-level *.php files, database.sql and CODE_EXPLAINED.md are the project's earlier PHP and MySQL prototype (register, login, portal, admin). The current application is the Next.js and PostgreSQL build described in this README. CODE_EXPLAINED.md is still a useful, beginner-friendly walkthrough of how sign-up, login, sessions and role guards work. If the PHP prototype is no longer needed, consider moving it into a legacy-php/ folder.

Database design
Defined in prisma/schema.prisma (PostgreSQL). Main models:

Model	Purpose
User	Account with role (INVESTOR, OPERATOR, CUSTOMER, ADMIN) and status (PENDING, VERIFIED, SUSPENDED).
Session	Server-side sessions for logged-in users.
Equipment	A funding project: machine type, region, target, status, and the platform / operator / investor share percentages.
OperatorApplication	An operator's application to run a machine; approved or rejected by an admin.
Investment	One investor's contribution to one project, with a simulated payment reference.
Job	A customer's processing request, with produce type, quantity and status.
Payment	A simulated payment for a job (SUCCESSFUL payments feed revenue).
Expense	A cost recorded by an operator (fuel, maintenance, etc.), with optional receipt.
Distribution	One revenue split for a project and period: gross, expenses, net, and each party's amount.
InvestorPayout	Each investor's share of a distribution.
Review	Customer rating and comment on a completed job.
Notification	In-app messages (for example "your job was accepted").
AuditLog	Record of admin actions such as approvals and CSV exports.
PasswordResetToken	Single-use tokens for password reset.
Python analytics service
The admin Financial reports page calls a separate FastAPI service in services/analytics/.

The Next.js server sends only aggregated project, job, payment and expense totals. The service never connects to the database and never receives personal data.
Requests are authenticated with a shared API key. A /health endpoint is available for health checks.
Run it locally:

cd services/analytics
pip install -r requirements.txt
export ANALYTICS_API_KEY="the-same-value-as-PYTHON_ANALYTICS_API_KEY"
uvicorn app:app --host 127.0.0.1 --port 8000

Run its tests with pytest from the same folder. See docs/DEPLOYMENT.md for deploying to Render.

Security
Passwords are hashed with bcrypt; sessions use signed, SameSite=Lax cookies.
Role-based access is enforced on the server for every dashboard and API route (for example, admin endpoints require a verified admin).
Cross-origin mutation requests are rejected as a second CSRF layer.
All inputs are validated with Zod.
Security headers are set globally (X-Frame-Options: DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Cross-Origin-Opener-Policy).
Admin actions are written to an audit log.
Payments go through a PaymentProvider interface. Only a SimulatedProvider exists, so a licensed gateway can be added later without changing investment logic.
Testing
npm test                      # Vitest: distribution engine, jobs workflow,
                              #   payment provider, security helpers
cd services/analytics && pytest   # Python analytics tests

The most important tests cover the money logic: the split must always reconcile exactly, even with awkward amounts.

Deployment
The app is designed for Vercel (web), a hosted PostgreSQL database (Neon), and Render (analytics). The full step-by-step guide, including environment variables, the analytics setup and a production hardening checklist, is in docs/DEPLOYMENT.md.

Two things to know before deploying:

Receipt uploads currently use local disk (.data/receipts). Serverless hosting has no durable disk, so switch to private object storage first.
Never run npm run db:seed against a production database.
Limitations and next steps
Honest limits

Payments are simulated.
No returns are guaranteed, and figures are illustrative.
Needs legal, regulatory and security review before real use.
Next steps

Connect a real Mobile Money provider.
Legal and regulatory review.
Pilot with real farmers and operators.
Add more equipment types.
Ideas for growth

Cold chain: solar-powered cold rooms for crates of produce, with temperature alerts (demoed with simulated sensors).
Group investing: church or market groups pooling small amounts (from GH₵10).
Access without a smartphone: a real USSD code and WhatsApp number (currently simulated).
QR code on every machine to view its jobs, expenses and payouts.
Team
Member	Focus
Bernard Titus Quansah	Group One member
Yahaya Innocent Adam	Backend, database and deployment
Grace Adebayo	Group One member
Ransford Paanii Tetteh	Testing and user experience review
Profiles are in DOCS/TEAM/ and docs/team/.

Prototype: payments are simulated. No guaranteed returns.

