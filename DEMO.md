# ProcessLink Ghana: Demo Guide

Two ways to demo. Pick the one that fits the situation.

| | Option A: Instant demo | Option B: Full app demo |
|---|---|---|
| Setup time | 30 seconds | About 10 minutes (first time) |
| Needs | A web browser | Node.js, Docker (or a hosted database), a terminal |
| Real database | No (data lives in the page) | Yes (PostgreSQL) |
| Best for | Presenting to your supervisor, showing every role quickly | Showing that the real database, login and API work |

> **Keep this in view during any demo:** *Prototype: payments are simulated. No real money moves.*

---

## Option A: Instant demo (no setup)

1. Open `public/processlink-prototype.html` in Chrome, Edge or Firefox.
2. Click a demo account on the sign-in screen (password for all: `demo1234`), or choose **Visitor** to browse without logging in.
3. Click **Guided demo** (top right) for a step-by-step walkthrough, or use the **Preview role** box in the sidebar to jump between roles.

Suggested 5-minute order: Visitor, Investor, Customer, Operator, Admin. Details are in `docs/DEMO_SCRIPT.md`.

---

## Option B: Full app with a real database

### One-time setup

```bash
# 1. Start a local PostgreSQL database (needs Docker Desktop running)
docker compose up -d

# 2. Create your environment file
cp .env.example .env
#    Open .env and replace SESSION_SECRET with any long random text (32+ characters).
#    DATABASE_URL already matches the Docker database. Leave it as it is.

# 3. Install packages
npm install

# 4. Create the tables and load the demo data
npm run demo:setup

# 5. Start the app
npm run dev
```

Open <http://localhost:3000>.

**No Docker?** Create a free PostgreSQL database on Neon (neon.tech), paste its connection string into `DATABASE_URL` in `.env`, then continue from step 3.

### Next time

```bash
docker compose up -d
npm run dev
```

### Start fresh (reset the demo data)

```bash
npm run demo:setup
```

This wipes and reloads the demo data. Use it only on your demo database, never a real one.

### Demo accounts (password for all: `ProcessLink123!`)

| Role | Email |
|---|---|
| Admin | `admin@processlink.gh` |
| Investor | `ama.investor@processlink.gh` |
| Operator | `kwame.operator@processlink.gh` |
| Customer | `yaw.customer@processlink.gh` |

More accounts: `kojo.investor@`, `esi.investor@`, `abena.operator@`, `akosua.customer@`, `kofi.customer@`, `adwoa.customer@` (all `@processlink.gh`).

### What the demo data contains

| Project | Status | Good for showing |
|---|---|---|
| Kumasi Cassava Hub | ACTIVE, fully funded (GH₵85,000) | Jobs, payments, expenses, a finished revenue split |
| Cape Coast Palm Press | FUNDING (GH₵31,000 of GH₵62,000) | **Investing** live; Abena has a pending operator application for the admin to approve |
| Tamale Maize Mill | PENDING_APPROVAL | Admin approving a project |
| Koforidua Cassava Line | DRAFT | Not visible to the public yet |

Jobs on the Kumasi hub: one **PAID**, one **COMPLETED** (customer can pay now), one **REQUESTED** (operator can accept), one **ACCEPTED**.

### Walkthrough (about 8 minutes)

1. **Visitor.** Open the home page and the project marketplace. Filter by region or equipment type.
2. **Investor** (`ama.investor@`). Open *Cape Coast Palm Press*, invest a small amount with any phone number (simulated payment), then open *My portfolio* to see it recorded.
3. **Customer** (`akosua.customer@`). Open *My jobs*. Her cassava job is COMPLETED, so press pay (simulated) and watch it become PAID. Then leave a review.
4. **Operator** (`kwame.operator@`). Open the jobs list. Accept Kofi's REQUESTED job, then start and complete it. Record an expense.
5. **Admin** (`admin@processlink.gh`). Approve *Tamale Maize Mill* and Abena's operator application. Open *Financial reports*: the Kumasi hub shows GH₵900 revenue, GH₵200 expenses, GH₵700 net, split 70 / 280 / 350, and the investor payouts add up to the GH₵350 pool. Download the CSV and look at the audit log on the overview page.

### How to explain the data flow (for your supervisor)

When you click something in the browser:

1. The **page** (Next.js / React) sends a request to an **API route** in `src/app/api/...`.
2. The API route checks **who you are** (session cookie) and **your role**, and validates the input.
3. It reads or writes the **PostgreSQL** database through **Prisma**.
4. The page then shows the saved result.

You can prove this live: invest as Ama, then open the database (`npx prisma studio`) and show the new row in the `Investment` table, and the changed `amountRaised` on the project.

### Admin analytics page (optional)

The *Financial reports* page also calls the Python analytics service. To see that part:

```bash
cd services/analytics
pip install -r requirements.txt
ANALYTICS_API_KEY=demo-key uvicorn app:app --port 8000
```

Then in `.env` set `PYTHON_ANALYTICS_URL="http://127.0.0.1:8000"` and `PYTHON_ANALYTICS_API_KEY="demo-key"`, and restart `npm run dev`.

---

## Known limitations to mention honestly

- **New sign-ups cannot do anything yet.** Accounts created through the register page start as `PENDING`, and every action (invest, request a job, pay) requires `VERIFIED`. The app has no screen where an admin verifies users yet. For the demo, use the seeded accounts. This is the next feature to build.
- Payments are simulated and no returns are guaranteed.
- Receipt uploads are stored on local disk, so they will not persist on Vercel.
