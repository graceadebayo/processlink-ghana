import { NextResponse } from 'next/server';
import { isSameOriginMutation } from '@/lib/security';
import { Prisma, ProjectStatus, Role, UserStatus } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createJobSchema } from '@/features/jobs/schemas';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  const where = user.role === Role.ADMIN ? {} : user.role === Role.CUSTOMER ? { customerId: user.id } : user.role === Role.OPERATOR ? { operatorId: user.id } : { equipment: { investments: { some: { investorId: user.id } } } };
  const jobs = await prisma.job.findMany({ where, include: { equipment: { select: { title: true, region: true, town: true } }, customer: { select: { name: true } }, operator: { select: { name: true } }, review: true, payments: { select: { status: true, reference: true } } }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ jobs });
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  if (user.role !== Role.CUSTOMER) return NextResponse.json({ error: 'Only customers can request processing.' }, { status: 403 });
  if (user.status !== UserStatus.VERIFIED) return NextResponse.json({ error: 'Your account must be verified before requesting a job.' }, { status: 403 });
  const parsed = createJobSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid job details.' }, { status: 400 });
  const equipment = await prisma.equipment.findUnique({ where: { id: parsed.data.equipmentId }, include: { operator: true } });
  if (!equipment || equipment.status !== ProjectStatus.ACTIVE || !equipment.operatorId || !equipment.operator || equipment.operator.status !== UserStatus.VERIFIED) return NextResponse.json({ error: 'This equipment does not currently have an available verified operator.' }, { status: 409 });
  const job = await prisma.$transaction(async (tx) => {
    const created = await tx.job.create({ data: { customerId: user.id, equipmentId: equipment.id, operatorId: equipment.operatorId!, produceType: parsed.data.produceType, quantityKg: new Prisma.Decimal(parsed.data.quantityKg), location: parsed.data.location, preferredDate: parsed.data.preferredDate, price: new Prisma.Decimal(parsed.data.price) } });
    await tx.notification.create({ data: { userId: equipment.operatorId!, message: `New ${parsed.data.produceType} processing request (${created.id}) for ${parsed.data.quantityKg} kg.` } });
    return created;
  });
  return NextResponse.json({ job }, { status: 201 });
}
