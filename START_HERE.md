# ProcessLink Ghana — Team Starter Pack

Welcome. This folder contains the Phase 6 cumulative Next.js application source and a beginner-friendly team operating guide.

## Start here
1. Read `docs/PROJECT_REVIEW.md` to understand what was supplied and what still needs checking.
2. Read `docs/TEAM_PLAYBOOK.md` so all four teammates agree on the product and rules.
3. Angela follows `docs/GIT_GUIDE_FOR_BEGINNERS.md` to create the GitHub repository and upload the project.
4. Each contributor follows the clone and setup steps in that guide.
5. Use `docs/WORK_BREAKDOWN.md` to divide work without everyone editing the same files.

## Important
Use this Phase 6 project as the single source of truth. Do not merge the separate phase ZIPs together. The HTML prototype is a separate demonstration only.

## Tech and local setup
Requires Node.js 20.9+, npm and PostgreSQL. Copy `.env.example` to `.env`, set `DATABASE_URL` and `SESSION_SECRET`, then run:

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000.

The seed script deletes and recreates records in the connected database. Run it only on a disposable development database, never production or real user data.

## Quality checks
```bash
npm run lint
npm test
npm run build
```

Record the actual output. The supplied code has not yet been verified by a clean install/build in this review.
