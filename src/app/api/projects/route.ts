
import { NextResponse } from 'next/server';
import { isSameOriginMutation } from '@/lib/security';
import { Role, ProjectStatus, UserStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createProjectSchema } from '@/features/projects/schemas';

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json(
      { error: 'Cross-origin request rejected.' },
      { status: 403 }
    );
  }

  const user = await getCurrentUser();

  const allowedRoles: Role[] = [Role.INVESTOR, Role.ADMIN];

  if (!user || !allowedRoles.includes(user.role)) {
    return NextResponse.json(
      {
        error:
          'Only investors and administrators can submit equipment projects.',
      },
      { status: 403 }
    );
  }

  if (
    user.role !== Role.ADMIN &&
    user.status !== UserStatus.VERIFIED
  ) {
    return NextResponse.json(
      {
        error:
          'Your account must be verified before submitting a project.',
      },
      { status: 403 }
    );
  }

  const parsed = createProjectSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ??
          'Check the project details.',
      },
      { status: 400 }
    );
  }

  const p = parsed.data;

  const project = await prisma.equipment.create({
    data: {
      title: p.title,
      equipmentType: p.equipmentType,
      description: p.description,
      region: p.region,
      town: p.town,
      cost: p.cost,
      fundingTarget: p.fundingTarget,
      fundingDeadline: p.fundingDeadline
        ? new Date(p.fundingDeadline)
        : null,
      status: ProjectStatus.PENDING_APPROVAL,
      submittedById: user.id,
    },
  });

  return NextResponse.json(
    {
      projectId: project.id,
      message: 'Project submitted for admin approval.',
    },
    { status: 201 }
  );
}
