# ProcessLink Ghana — 8-minute university demo

Keep the visible banner **Prototype: payments are simulated.** in view during the presentation. No real money is collected or transferred.

## Before presenting

1. Start PostgreSQL and set the local `.env` values.
2. Run `npm install`, `npx prisma generate`, `npx prisma db push`, and `npm run db:seed`.
3. Run `npm run dev` and open `http://localhost:3000`.
4. Use a separate browser profile or log out between role demonstrations.

All seeded demo accounts use `ProcessLink123!`.

## Demo sequence

1. **Landing page (45 sec):** Explain the three groups — investors fund equipment, operators run it, and farmers/processors request jobs. Point out the prototype notice.
2. **Investor (90 sec):** Sign in as `ama.investor@processlink.gh`. Browse projects, inspect funding progress and portfolio. Explain that payout figures are illustrative.
3. **Operator (90 sec):** Sign in as `kwame.operator@processlink.gh`. Show assigned equipment, incoming jobs, status updates and expense entry.
4. **Customer (90 sec):** Sign in as `yaw.customer@processlink.gh`. Show job requests, job tracking, simulated payment and review flow.
5. **Admin (120 sec):** Sign in as `admin@processlink.gh`. Show project/application approvals, financial distribution reports, CSV export and audit activity.
6. **Close (45 sec):** Explain how the distribution engine deducts expenses and allocates net revenue using configured shares. Reiterate that the prototype does not move real money and does not guarantee investment returns.

## Suggested explanation

"ProcessLink Ghana is a digital coordination and accountability platform for shared agricultural processing equipment. It connects capital, equipment operations and processing demand in one auditable workflow. The prototype demonstrates the end-to-end process, while all payment events are simulated for academic demonstration."
