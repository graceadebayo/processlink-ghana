import { NextResponse } from 'next/server';
import { isSameOriginMutation } from '@/lib/security';
import { JobStatus, PaymentStatus, Role, UserStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { paymentProvider } from '@/features/investments/payment-provider';
import { z } from 'zod';
const schema = z.object({ phone: z.string().trim().min(7).max(20) });
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  if (user.status !== UserStatus.VERIFIED) return NextResponse.json({ error: 'Your account must be verified to make payments.' }, { status: 403 });
  if (user.role !== Role.CUSTOMER) return NextResponse.json({ error: 'Only customers can pay for jobs.' }, { status: 403 });
  const { id } = await context.params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Enter a valid Mobile Money number.' }, { status: 400 });
  const job = await prisma.job.findFirst({ where: { id, customerId: user.id }, include: { equipment: true } });
  if (!job) return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
  if (job.status !== JobStatus.COMPLETED) return NextResponse.json({ error: 'Payment is available only after the operator marks the job as completed.' }, { status: 409 });
  const payment = await paymentProvider.collect({ amount: Number(job.price), phone: parsed.data.phone, description: `Processing payment for job ${job.id}` });
  if (!payment.successful) return NextResponse.json({ error: payment.message }, { status: 402 });
  try {
    await prisma.$transaction(async (tx) => {
      const current = await tx.job.findUnique({ where: { id } });
      if (!current || current.customerId !== user.id || current.status !== JobStatus.COMPLETED) throw new Error('JOB_NOT_PAYABLE');
      // Claim the completed job with a conditional update so concurrent payment attempts cannot both succeed.
      const claimed = await tx.job.updateMany({ where: { id, customerId: user.id, status: JobStatus.COMPLETED }, data: { status: JobStatus.PAID } });
      if (claimed.count !== 1) throw new Error('JOB_NOT_PAYABLE');
      await tx.payment.create({ data: { jobId: id, payerId: user.id, amount: current.price, status: PaymentStatus.SUCCESSFUL, reference: payment.reference } });
      await tx.notification.create({ data: { userId: current.operatorId, message: `Customer payment was recorded for job ${id}. Simulated reference: ${payment.reference}.` } });
      await tx.notification.create({ data: { userId: user.id, message: `Your simulated payment of GHS ${Number(current.price).toFixed(2)} was successful. Reference: ${payment.reference}.` } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return NextResponse.json({ success: true, reference: payment.reference, message: 'Simulated payment successful. No real money moved.' });
  } catch (error) {
    if (error instanceof Error && error.message === 'JOB_NOT_PAYABLE') return NextResponse.json({ error: 'This job is no longer payable.' }, { status: 409 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return NextResponse.json({ error: 'This job already has a payment.' }, { status: 409 });
    return NextResponse.json({ error: 'Payment could not be recorded.' }, { status: 500 });
  }
}
