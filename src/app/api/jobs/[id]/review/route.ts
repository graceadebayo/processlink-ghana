import { NextResponse } from 'next/server';
import { isSameOriginMutation } from '@/lib/security';
import { JobStatus, Role, UserStatus } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { reviewSchema } from '@/features/jobs/schemas';
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  if (user.status !== UserStatus.VERIFIED) return NextResponse.json({ error: 'Your account must be verified to submit a review.' }, { status: 403 });
  if (user.role !== Role.CUSTOMER) return NextResponse.json({ error: 'Only customers can review processing jobs.' }, { status: 403 });
  const { id } = await context.params;
  const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid review.' }, { status: 400 });
  const job = await prisma.job.findFirst({ where: { id, customerId: user.id }, select: { id: true, status: true, operatorId: true } });
  if (!job || job.status !== JobStatus.PAID) return NextResponse.json({ error: 'You can review a job after payment.' }, { status: 409 });
  try {
    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({ data: { jobId: id, customerId: user.id, operatorId: job.operatorId, rating: parsed.data.rating, comment: parsed.data.comment } });
      await tx.notification.create({ data: { userId: job.operatorId, message: `You received a ${parsed.data.rating}-star customer review for job ${id}.` } });
      return created;
    });
    return NextResponse.json({ review }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'A review has already been submitted for this job.' }, { status: 409 });
  }
}
