
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProjectStatus, Role, UserStatus } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { OperatorApplicationForm } from '@/components/projects/operator-application-form';
import { InvestmentForm } from '@/components/projects/investment-form';

const visible: ProjectStatus[] = [
  ProjectStatus.FUNDING,
  ProjectStatus.FUNDED,
  ProjectStatus.ACTIVE,
  ProjectStatus.CLOSED,
];

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { id } = await params;
  const q = await searchParams;
  const user = await getCurrentUser();

  const p = await prisma.equipment.findUnique({
    where: { id },
    include: {
      operator: true,
      jobs: {
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      investments: {
        select: { id: true },
      },
    },
  });

  if (
    !p ||
    (!visible.includes(p.status) &&
      user?.role !== 'ADMIN' &&
      p.submittedById !== user?.id)
  ) {
    notFound();
  }

  const raised = Number(p.amountRaised);
  const target = Number(p.fundingTarget);
  const pct = Math.min(100, target ? (raised / target) * 100 : 0);

  const existing =
    user?.role === 'OPERATOR'
      ? await prisma.operatorApplication.findUnique({
          where: {
            operatorId_equipmentId: {
              operatorId: user.id,
              equipmentId: id,
            },
          },
        })
      : null;

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/projects"
          className="text-sm font-bold text-[#315c43]"
        >
          ← All projects
        </Link>

        {q.submitted === '1' && (
          <p className="mt-4 rounded-xl bg-[#edf4ed] p-4 text-sm font-semibold text-[#24583e]">
            Project submitted successfully. It is awaiting admin approval
            and is not yet publicly listed.
          </p>
        )}

        <div className="mt-5 grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
          <section className="rounded-3xl border border-[#e3e9e2] bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-[#edf3ed] px-3 py-1 text-xs font-bold uppercase text-[#315c43]">
                {p.status.replaceAll('_', ' ')}
              </span>
              <span className="text-sm text-[#718077]">
                {p.region} Region
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-black text-[#153d2e]">
              {p.title}
            </h1>

            <p className="mt-2 text-sm text-[#718077]">
              {p.equipmentType} · {p.town}
            </p>

            <p className="mt-6 whitespace-pre-line text-sm leading-7 text-[#5f6f65]">
              {p.description}
            </p>

            <div className="mt-8 grid gap-4 border-t border-[#edf0eb] pt-6 sm:grid-cols-2">
              <Fact label="Equipment cost" value={money(Number(p.cost))} />
              <Fact label="Funding target" value={money(target)} />
              <Fact
                label="Funding deadline"
                value={
                  p.fundingDeadline
                    ? p.fundingDeadline.toLocaleDateString('en-GH')
                    : 'Not specified'
                }
              />
              <Fact
                label="Operator"
                value={p.operator?.name ?? 'Not yet assigned'}
              />
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-3xl bg-[#174b38] p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-[#eac45e]">
                Funding progress
              </p>

              <p className="mt-4 text-3xl font-black">
                {money(raised)}
              </p>

              <p className="mt-1 text-sm text-white/65">
                raised of {money(target)}
              </p>

              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-[#eac45e]"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <p className="mt-2 text-right text-xs font-bold text-[#f1d88e]">
                {pct.toFixed(1)}% funded
              </p>

              <p className="mt-5 text-xs leading-5 text-white/60">
                Investment figures and any future returns are illustrative
                only and are not guaranteed.
              </p>
            </div>

            {user?.role === Role.INVESTOR &&
              user.status === UserStatus.VERIFIED &&
              p.status === ProjectStatus.FUNDING && (
                <InvestmentForm
                  projectId={id}
                  remaining={Math.max(0, target - raised)}
                />
              )}

            {user?.role === Role.OPERATOR && visible.includes(p.status) && (
              <>
                {existing ? (
                  <div className="rounded-2xl border border-[#e3e9e2] bg-white p-5 text-sm text-[#315c43]">
                    Your application status:{' '}
                    <strong>{existing.status}</strong>
                  </div>
                ) : (
                  <OperatorApplicationForm projectId={id} />
                )}
              </>
            )}
          </aside>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-black text-[#153d2e]">
            Recent processing jobs
          </h2>

          {p.jobs.length ? (
            <div className="mt-4 space-y-3">
              {p.jobs.map((j) => (
                <div
                  key={j.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e3e9e2] bg-white p-4"
                >
                  <div>
                    <p className="font-bold text-[#244535]">
                      {j.produceType} ·{' '}
                      {Number(j.quantityKg).toLocaleString('en-GH')} kg
                    </p>
                    <p className="mt-1 text-xs text-[#718077]">
                      {j.location} · {j.customer.name}
                    </p>
                  </div>

                  <span className="rounded-full bg-[#edf3ed] px-3 py-1 text-xs font-bold text-[#315c43]">
                    {j.status.replaceAll('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-xl border border-dashed border-[#ccd8ce] bg-white p-6 text-sm text-[#718077]">
              No processing jobs have been recorded for this equipment yet.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#829087]">
        {label}
      </p>
      <p className="mt-1 font-extrabold text-[#244535]">{value}</p>
    </div>
  );
}

function money(n: number) {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(n);
}
