import { NextResponse } from 'next/server';
import { Role, UserStatus } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const csv = (value: unknown) => `"${String(value ?? '').replaceAll('"','""')}"`;
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  if (user.role !== Role.ADMIN || user.status !== UserStatus.VERIFIED) return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  const [distributions, payments, expenses] = await Promise.all([
    prisma.distribution.findMany({ include: { equipment: true, payouts: { include: { investor: true } } }, orderBy: { periodStart: 'desc' } }),
    prisma.payment.findMany({ where: { status: 'SUCCESSFUL' }, include: { job: { include: { equipment: true } }, payer: true }, orderBy: { createdAt: 'desc' } }),
    prisma.expense.findMany({ include: { equipment: true, recorder: true }, orderBy: { createdAt: 'desc' } }),
  ]);
  const rows = [['record_type','project','period_or_date','gross_revenue_ghs','expenses_ghs','net_revenue_ghs','platform_ghs','operator_ghs','investor_pool_ghs','party','amount_ghs','reference']];
  for (const d of distributions) {
    rows.push(['DISTRIBUTION',d.equipment.title,`${d.periodStart.toISOString()} - ${d.periodEnd.toISOString()}`,String(d.grossRevenue),String(d.expenses),String(d.netRevenue),String(d.platformAmount),String(d.operatorAmount),String(d.investorPool),'', '', d.id]);
    for (const p of d.payouts) rows.push(['INVESTOR_PAYOUT',d.equipment.title,d.periodStart.toISOString(),'','','','','','',p.investor.email,String(p.amount),d.id]);
  }
  for (const p of payments) rows.push(['PAYMENT',p.job.equipment.title,p.createdAt.toISOString(),String(p.amount),'','','','','',p.payer.email,String(p.amount),p.reference]);
  for (const e of expenses) rows.push(['EXPENSE',e.equipment.title,e.createdAt.toISOString(),'','',String(e.amount),'','','',e.recorder.email,String(e.amount),e.id]);
  await prisma.auditLog.create({ data: { adminId: user.id, action: 'Exported financial CSV report', targetType: 'FinancialReport', targetId: 'all' } });
  const body = rows.map(row => row.map(csv).join(',')).join('\r\n');
  return new NextResponse(body, { headers: { 'Content-Type':'text/csv; charset=utf-8', 'Content-Disposition':'attachment; filename="processlink-financial-report.csv"', 'Cache-Control':'no-store' } });
}
