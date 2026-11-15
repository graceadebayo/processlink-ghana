import { NextResponse } from 'next/server';
import { Role, UserStatus } from '@prisma/client';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { toPesewas } from '@/features/distribution/engine';

const summarySchema = z.object({
  project_count: z.number().int().nonnegative(),
  funded_project_count: z.number().int().nonnegative(),
  total_raised_pesewas: z.number().int().nonnegative(),
  total_target_pesewas: z.number().int().nonnegative(),
  funding_progress_percent: z.number().nonnegative(),
  jobs_by_status: z.record(z.string(), z.number().int().nonnegative()),
  job_count: z.number().int().nonnegative(),
  completed_job_count: z.number().int().nonnegative(),
  job_completion_percent: z.number().nonnegative(),
  successful_payments_pesewas: z.number().int().nonnegative(),
  expenses_pesewas: z.number().int().nonnegative(),
  net_revenue_pesewas: z.number().int(),
  regional_funding: z.array(
    z.object({
      region: z.string(),
      raised_pesewas: z.number().int().nonnegative(),
    }),
  ),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  }
  if (user.role !== Role.ADMIN || user.status !== UserStatus.VERIFIED) {
    return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  }

  const serviceBaseUrl = process.env.PYTHON_ANALYTICS_URL?.replace(/\/+$/, '');
  const serviceKey = process.env.PYTHON_ANALYTICS_API_KEY;
  if (!serviceBaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: 'The Python analytics service is not configured.' },
      { status: 503 },
    );
  }

  const [projects, jobs, payments, expenses] = await Promise.all([
    prisma.equipment.groupBy({
      by: ['region', 'status'],
      _count: { _all: true },
      _sum: { amountRaised: true, fundingTarget: true },
    }),
    prisma.job.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.payment.aggregate({
      where: { status: 'SUCCESSFUL' },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
    }),
  ]);

  const payload = {
    projects: projects.map((project) => ({
      region: project.region,
      status: project.status,
      count: project._count._all,
      raised_pesewas: toPesewas(project._sum.amountRaised ?? 0),
      target_pesewas: toPesewas(project._sum.fundingTarget ?? 0),
    })),
    jobs: jobs.map((job) => ({
      status: job.status,
      count: job._count._all,
    })),
    successful_payments_pesewas: toPesewas(payments._sum.amount ?? 0),
    expenses_pesewas: toPesewas(expenses._sum.amount ?? 0),
  };

  let endpoint: URL;
  try {
    endpoint = new URL(`${serviceBaseUrl}/v1/reports/summary`);
    if (
      !['http:', 'https:'].includes(endpoint.protocol) ||
      (process.env.NODE_ENV === 'production' && endpoint.protocol !== 'https:')
    ) {
      throw new Error('Use HTTPS for the analytics service in production.');
    }
  } catch (error) {
    console.error('Invalid Python analytics service URL', error);
    return NextResponse.json(
      { error: 'The Python analytics service URL is invalid.' },
      { status: 500 },
    );
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    console.error('Python analytics service request failed', error);
    return NextResponse.json(
      { error: 'The analytics service is currently unavailable.' },
      { status: 502 },
    );
  }

  if (!response.ok) {
    console.error('Python analytics service returned an error', response.status);
    return NextResponse.json(
      { error: 'The analytics service could not process this report.' },
      { status: 502 },
    );
  }

  let result: unknown;
  try {
    result = await response.json();
  } catch (error) {
    console.error('Python analytics service returned invalid JSON', error);
    return NextResponse.json(
      { error: 'The analytics service returned an invalid response.' },
      { status: 502 },
    );
  }

  const parsed = summarySchema.safeParse(result);
  if (!parsed.success) {
    console.error('Python analytics service response did not match the report schema');
    return NextResponse.json(
      { error: 'The analytics service returned an invalid report.' },
      { status: 502 },
    );
  }

  return NextResponse.json(parsed.data, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
