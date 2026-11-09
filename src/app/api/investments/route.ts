import { NextResponse } from 'next/server';
import { isSameOriginMutation } from '@/lib/security';
import { Prisma, ProjectStatus, Role, UserStatus } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { investmentSchema } from '@/features/investments/schemas';
import { paymentProvider } from '@/features/investments/payment-provider';

const cents = (value: Prisma.Decimal | number | string) => Math.round(Number(value) * 100);

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  if (user.role !== Role.INVESTOR) return NextResponse.json({ error: 'Only investors can invest.' }, { status: 403 });
  if (user.status !== UserStatus.VERIFIED) return NextResponse.json({ error: 'Your account must be verified before investing.' }, { status: 403 });

  const parsed = investmentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid investment details.' }, { status: 400 });
  const amountCents = Math.round(parsed.data.amount * 100);
  if (!Number.isSafeInteger(amountCents) || amountCents < 1) return NextResponse.json({ error: 'Enter a valid amount.' }, { status: 400 });

  const project = await prisma.equipment.findUnique({ where: { id: parsed.data.equipmentId }, select: { id: true, title: true, status: true } });
  if (!project || project.status !== ProjectStatus.FUNDING) return NextResponse.json({ error: 'This project is not currently accepting investments.' }, { status: 409 });

  // Simulated payment is completed before recording the investment. The transaction below
  // rechecks capacity under a serializable isolation level to prevent concurrent over-funding.
  const payment = await paymentProvider.collect({ amount: amountCents / 100, phone: parsed.data.phone, description: `Investment in ${project.title}` });
  if (!payment.successful) return NextResponse.json({ error: payment.message }, { status: 402 });

  try {
    const investment = await prisma.$transaction(async (tx) => {
      const current = await tx.equipment.findUnique({ where: { id: project.id } });
      if (!current || current.status !== ProjectStatus.FUNDING) throw new Error('PROJECT_NOT_OPEN');
      const remainingCents = cents(current.fundingTarget) - cents(current.amountRaised);
      if (amountCents > remainingCents) throw new Error('AMOUNT_EXCEEDS_REMAINING');

      const updatedRaised = cents(current.amountRaised) + amountCents;
      const fullyFunded = updatedRaised >= cents(current.fundingTarget);
      const created = await tx.investment.create({ data: {
        investorId: user.id,
        equipmentId: current.id,
        amount: new Prisma.Decimal((amountCents / 100).toFixed(2)),
        simulatedPaymentRef: payment.reference,
      } });
      await tx.equipment.update({ where: { id: current.id }, data: {
        amountRaised: new Prisma.Decimal((updatedRaised / 100).toFixed(2)),
        ...(fullyFunded ? { status: ProjectStatus.FUNDED } : {}),
      } });
      await tx.notification.create({ data: { userId: user.id, message: `Your investment of GHS ${(amountCents / 100).toFixed(2)} in ${current.title} was recorded. Reference: ${payment.reference}.` } });
      return created;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 10000, timeout: 15000 });

    return NextResponse.json({ success: true, reference: payment.reference, investmentId: investment.id, message: 'Simulated payment successful. Your investment has been recorded. No real money moved.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'AMOUNT_EXCEEDS_REMAINING') return NextResponse.json({ error: 'The requested amount is greater than the remaining funding target. Refresh the project and try again.' }, { status: 409 });
    if (message === 'PROJECT_NOT_OPEN') return NextResponse.json({ error: 'This project is no longer accepting investments.' }, { status: 409 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') return NextResponse.json({ error: 'Another investment was processed at the same time. Please refresh and try again.' }, { status: 409 });
    console.error('Investment transaction failed', error);
    return NextResponse.json({ error: 'We could not record this investment. Please contact support with your simulated payment reference: ' + payment.reference }, { status: 500 });
  }
}
