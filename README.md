# ProcessLink Ghana

Connecting equipment funding, operators and agricultural processing customers.

**Live demo:** https://processlink-ghana.vercel.app

> **Prototype.** Payments, sensors, USSD and WhatsApp are simulated. No real money moves, no investor return is guaranteed, and all project figures are demo data.

## The problem

- Processing equipment such as a cassava grater, palm fruit press or maize mill is expensive, so one farmer or small business cannot buy it alone.
- People willing to invest have no clear record of how a machine is used or where the money goes.
- Farmers often travel far to find a machine, so produce is lost or sold cheaply.

## What ProcessLink does

ProcessLink turns each machine into a project. Investors fund it, an approved operator runs it, customers pay to use it, and an administrator keeps everything honest. Every step is recorded.

| Role | What they do |
|---|---|
| Investor | Funds a machine toward a target, alone or as a group, and follows a portfolio |
| Operator | Runs the machine, accepts and completes jobs, records expenses |
| Customer | Requests processing, pays, and follows the job status |
| Admin | Approves users and projects, runs the revenue split, views reports and the audit log |

### How one machine moves through the system

1. A project is submitted.
2. The admin approves it and it becomes visible to investors.
3. Investors fund it toward a target.
4. An approved operator is assigned.
5. A customer books a job and pays after it is complete.
6. Net revenue is split between the platform, the operator and the investors.

### How the money is split

Net revenue is paid jobs minus recorded expenses. The default shares are:

| Party | Share | On GH₵800 net |
|---|---|---|
| Platform | 10% | GH₵80 |
| Operator | 40% | GH₵320 |
| Investor pool | 50% | GH₵400 |

The investor pool is shared by how much each investor put in. The shares are configurable prototype settings, not a promise of return.

## Features

- Marketplace of equipment projects with search and filters by region and status
- Four role-based workspaces
- Simulated investment and group funding (GH₵10 to GH₵50 per member)
- Job requests, job tracking and simulated Mobile Money payments
- Simulated USSD and WhatsApp request flow for farmers without smartphones
- Expense recording and revenue distribution
- Admin approvals, reports with CSV export, and an audit log
- Solar cold room project with simulated temperature readings and a power cut alert
- Guided demo that walks through the main steps

## Tech stack

- Next.js and React with TypeScript
- PostgreSQL, hosted on Neon, accessed with Prisma
- GitHub and Vercel, with automatic deployment
- Automated tests for the money calculations

## Getting started

Requires Node.js and a PostgreSQL database (for example, a free Neon project).

```bash
git clone https://github.com/graceadebayo/processlink-ghana.git
cd processlink-ghana
npm install
```

Copy `.env.example` to `.env` and fill in the values, starting with your database connection string:

```bash
cp .env.example .env
```

Set up the database with Prisma, then run the app and open http://localhost:3000:

```bash
npx prisma migrate dev
npm run dev
```

Run the tests:

```bash
npm test
```

## Project structure

| Folder or file | Contents |
|---|---|
| `src/` | Application code |
| `prisma/` | Database schema |
| `docs/` and `DOCS/TEAM/` | Project and team documents |
| `.env.example` | Template for environment settings |

## Demo accounts

The prototype uses demo accounts only. The password for every account is `demo1234`.

| Role | Email |
|---|---|
| Investor | ama.investor@processlink.gh |
| Operator | kwame.operator@processlink.gh |
| Customer | yaw.customer@processlink.gh |
| Admin | admin@processlink.gh |

## Live demo flow

1. **Visitor:** sign in, open the marketplace and filter projects.
2. **Investor:** fund a project, alone or as a group, then view the portfolio.
3. **Customer:** request a job online or by simulated USSD or WhatsApp, and follow its status.
4. **Operator:** accept the job, complete it and record an expense.
5. **Admin:** approve users and projects, view the money split and reports.

## Limits

- Payments are simulated and no Mobile Money network is connected.
- USSD and WhatsApp are simulations. No real code or number is connected.
- No returns are guaranteed and figures are illustrative.
- Legal, regulatory and security review is needed before real use.
- Who owns the equipment must be set out in written agreements before launch.

## Roadmap

- Connect a real Mobile Money provider through a licensed partner
- Legal and regulatory review
- Pilot with real farmers and operators
- Real USSD code and WhatsApp number
- More equipment types and real cold room sensors
- A QR code on every machine showing its jobs, expenses and payouts

## Team

Group One:

- Grace Adebayo 
- Yahaya Innocent Adam
- Bernard Titus Quansah
- Ransford Paanii Tetteh

Work areas: admin and governance, investors and marketplace, jobs and customers, and foundation and presentation. Each member's contributions are tracked in the GitHub commit history.

## Disclaimer

ProcessLink Ghana is a student project and prototype. It is not a bank, a loan app or a licensed investment product.
