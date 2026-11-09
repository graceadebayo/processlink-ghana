import { NextResponse } from 'next/server';
import { isSameOriginMutation } from '@/lib/security';
import { JobStatus, Role, UserStatus } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { jobStatusSchema } from '@/features/jobs/schemas';
import { jobTransitions } from '@/features/jobs/workflow';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  const { id } = await context.params;
  const parsed = jobStatusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid job action.' }, { status: 400 });
  const job = await prisma.job.findUnique({ where: { id }, include: { customer: true, operator: true, equipment: true } });
  if (!job) return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
  if (user.status !== UserStatus.VERIFIED) return NextResponse.json({ error: 'Your account must be verified to manage jobs.' }, { status: 403 });
  const isAssignedOperator = user.role === Role.OPERATOR && job.operatorId === user.id;
  const isCustomerCancellation = parsed.data.action === 'CANCEL' && user.role === Role.CUSTOMER && job.customerId === user.id;
  if (!isAssignedOperator && !isCustomerCancellation) return NextResponse.json({ error: 'Only the assigned operator or requesting customer can perform this action.' }, { status: 403 });
  const transition = jobTransitions[parsed.data.action];
  if (!transition.from.includes(job.status)) return NextResponse.json({ error: `Cannot ${parsed.data.action.toLowerCase()} a job in ${job.status} status.` }, { status: 409 });
  try {
  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.job.updateMany({ where: { id, status: { in: transition.from } }, data: { status: transition.to, ...(transition.to === JobStatus.COMPLETED ? { completedAt: new Date() } : {}) } });
    if (result.count !== 1) throw new Error('JOB_STATE_CHANGED');
    const recipientId = isCustomerCancellation ? job.operatorId : job.customerId;
    const message = isCustomerCancellation ? 'The customer cancelled the processing request.' : transition.customerMessage;
    await tx.notification.create({ data: { userId: recipientId, message: `${message} Job: ${job.produceType} (${job.id}).` } });
    return tx.job.findUnique({ where: { id } });
  });
  return NextResponse.json({ job: updated });
  } catch (error) {
    if (error instanceof Error && error.message === 'JOB_STATE_CHANGED') return NextResponse.json({ error: 'This job was updated by another action. Refresh and try again.' }, { status: 409 });
    console.error('Job status update failed', error);
    return NextResponse.json({ error: 'Could not update this job.' }, { status: 500 });
  }
}
