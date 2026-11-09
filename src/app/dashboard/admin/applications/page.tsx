import { requireRole } from '@/lib/auth';
import { Role, ApplicationStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from '@/components/dashboard-shell';
import { AdminDecisionButtons } from '@/components/projects/admin-decision-buttons';
export default async function AdminApplicationsPage(){
 const admin=await requireRole(Role.ADMIN);
 const applications=await prisma.operatorApplication.findMany({where:{status:ApplicationStatus.PENDING},include:{operator:true,equipment:true},orderBy:{createdAt:'asc'}});
 return <DashboardShell role="ADMIN" name={admin.name}><h1 className="text-2xl font-black text-[#173f30]">Operator applications</h1><p className="mt-2 text-sm text-[#718077]">Review operator experience and assign approved applicants to equipment.</p>{applications.length?<div className="mt-6 space-y-4">{applications.map(a=><article key={a.id} className="rounded-2xl border border-[#e3e9e2] bg-white p-5"><h2 className="font-extrabold text-[#244535]">{a.operator.name} · {a.equipment.title}</h2><p className="mt-1 text-xs text-[#718077]">{a.operator.email} · {a.equipment.town}, {a.equipment.region}</p><p className="mt-4 whitespace-pre-line text-sm leading-6 text-[#65736a]">{a.experience}</p><div className="mt-4 flex justify-end border-t border-[#edf0eb] pt-4"><AdminDecisionButtons id={a.id} endpoint="applications"/></div></article>)}</div>:<div className="mt-6 rounded-2xl border border-dashed border-[#ccd8ce] bg-white p-10 text-center text-sm text-[#718077]">No operator applications are waiting for review.</div>}</DashboardShell>;
}
