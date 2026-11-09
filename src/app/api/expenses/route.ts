import { NextResponse } from 'next/server';
import { isSameOriginMutation } from '@/lib/security';
import { Prisma, Role, UserStatus } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { expenseSchema } from '@/features/jobs/schemas';
export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  if (user.status !== UserStatus.VERIFIED) return NextResponse.json({ error: 'Your account must be verified to record expenses.' }, { status: 403 });
  if (user.role !== Role.OPERATOR) return NextResponse.json({ error: 'Only operators can record equipment expenses.' }, { status: 403 });
  const parsed = expenseSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid expense details.' }, { status: 400 });
  const equipment = await prisma.equipment.findFirst({ where: { id: parsed.data.equipmentId, operatorId: user.id } });
  if (!equipment) return NextResponse.json({ error: 'You are not assigned to this equipment.' }, { status: 403 });
  if (parsed.data.jobId) {
    const job = await prisma.job.findFirst({ where: { id: parsed.data.jobId, equipmentId: equipment.id, operatorId: user.id } });
    if (!job) return NextResponse.json({ error: 'The selected job does not belong to your equipment.' }, { status: 400 });
  }
  const expense = await prisma.expense.create({ data: { equipmentId: equipment.id, jobId: parsed.data.jobId || null, amount: new Prisma.Decimal(parsed.data.amount), category: parsed.data.category, note: parsed.data.note, receiptImageUrl: parsed.data.receiptImageUrl || null, recordedBy: user.id } });
  return NextResponse.json({ expense }, { status: 201 });
}
