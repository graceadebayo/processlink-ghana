import { NextResponse } from 'next/server';
import { isSameOriginMutation } from '@/lib/security';
import { Prisma, Role, UserStatus } from '@prisma/client';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateDistribution, fromPesewas, toPesewas } from '@/features/distribution/engine';

const schema = z.object({
  equipmentId: z.string().min(1),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
}).refine(v => v.periodStart < v.periodEnd, { message: 'Period end must be after period start.' });

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  if (user.role !== Role.ADMIN || user.status !== UserStatus.VERIFIED) return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid distribution period.' }, { status: 400 });
  const { equipmentId, periodStart, periodEnd } = parsed.data;
  try {
    const result = await prisma.$transaction(async tx => {
      const equipment = await tx.equipment.findUnique({ where: { id: equipmentId } });
      if (!equipment) throw new Error('Equipment project not found.');
      if (equipment.status !== 'ACTIVE' && equipment.status !== 'FUNDED' && equipment.status !== 'CLOSED') throw new Error('Only funded, active or closed projects can be distributed.');
      const grossAggregate = await tx.payment.aggregate({ where: { status: 'SUCCESSFUL', createdAt: { gte: periodStart, lt: periodEnd }, job: { equipmentId } }, _sum: { amount: true } });
      const expenseAggregate = await tx.expense.aggregate({ where: { equipmentId, createdAt: { gte: periodStart, lt: periodEnd } }, _sum: { amount: true } });
      const investments = await tx.investment.groupBy({ by: ['investorId'], where: { equipmentId }, _sum: { amount: true } });
      const calculation = calculateDistribution({
        grossRevenuePesewas: toPesewas(grossAggregate._sum.amount ?? 0),
        expensesPesewas: toPesewas(expenseAggregate._sum.amount ?? 0),
        platformFeePct: Number(equipment.platformFeePct), operatorSharePct: Number(equipment.operatorSharePct), investorSharePct: Number(equipment.investorSharePct),
        investors: investments.map(i => ({ investorId: i.investorId, contributionPesewas: toPesewas(i._sum.amount ?? 0) })),
      });
      const distribution = await tx.distribution.create({ data: {
        equipmentId, periodStart, periodEnd,
        grossRevenue: fromPesewas(calculation.grossRevenuePesewas), expenses: fromPesewas(calculation.expensesPesewas), netRevenue: fromPesewas(calculation.netRevenuePesewas),
        platformAmount: fromPesewas(calculation.platformAmountPesewas), operatorAmount: fromPesewas(calculation.operatorAmountPesewas), investorPool: fromPesewas(calculation.investorPoolPesewas),
        payouts: { create: calculation.payouts.map(p => ({ investorId: p.investorId, amount: fromPesewas(p.amountPesewas) })) },
      }, include: { payouts: true, equipment: { select: { title: true } } } });
      await tx.auditLog.create({ data: { adminId: user.id, action: 'Created financial distribution', targetType: 'Distribution', targetId: distribution.id } });
      for (const payout of distribution.payouts) await tx.notification.create({ data: { userId: payout.investorId, message: `An illustrative distribution of GHS ${Number(payout.amount).toFixed(2)} has been recorded for ${distribution.equipment.title}. This is not a guaranteed return.` } });
      return distribution;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return NextResponse.json({ distribution: result }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return NextResponse.json({ error: 'A distribution already exists for this project and period.' }, { status: 409 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') return NextResponse.json({ error: 'A concurrent financial update occurred. Please retry.' }, { status: 409 });
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not create distribution.' }, { status: 400 });
  }
}
