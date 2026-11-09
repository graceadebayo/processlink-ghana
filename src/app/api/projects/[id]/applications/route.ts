import { NextResponse } from 'next/server';
import { isSameOriginMutation } from '@/lib/security';
import { ApplicationStatus, ProjectStatus, Role, UserStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { applicationSchema } from '@/features/projects/schemas';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  const user = await getCurrentUser();
  if (!user || user.role !== Role.OPERATOR) return NextResponse.json({ error: 'Only operators can apply to manage equipment.' }, { status: 403 });
  if (user.status !== UserStatus.VERIFIED) return NextResponse.json({ error: 'Your account must be verified before applying.' }, { status: 403 });
  const { id } = await params;
  const parsed = applicationSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Check your application.' }, { status: 400 });
  const project = await prisma.equipment.findUnique({ where: { id } });
  if (!project || ![ProjectStatus.FUNDING, ProjectStatus.FUNDED, ProjectStatus.ACTIVE].includes(project.status)) return NextResponse.json({ error: 'This project is not accepting operator applications.' }, { status: 404 });
  if (project.operatorId === user.id) return NextResponse.json({ error: 'You are already assigned to this project.' }, { status: 409 });
  try {
    const application = await prisma.operatorApplication.create({ data: { operatorId: user.id, equipmentId: id, experience: parsed.data.experience, status: ApplicationStatus.PENDING } });
    return NextResponse.json({ applicationId: application.id, message: 'Your application has been submitted.' }, { status: 201 });
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') return NextResponse.json({ error: 'You have already applied to this project.' }, { status: 409 });
    return NextResponse.json({ error: 'Unable to submit application.' }, { status: 500 });
  }
}
