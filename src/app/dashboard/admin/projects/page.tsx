import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { Role, ProjectStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from '@/components/dashboard-shell';
import { AdminDecisionButtons } from '@/components/projects/admin-decision-buttons';
export default async function AdminProjectsPage(){
 const admin=await requireRole(Role.ADMIN);
 const projects=await prisma.equipment.findMany({where:{status:ProjectStatus.PENDING_APPROVAL},include:{submittedBy:true},orderBy:{createdAt:'asc'}});
 return <DashboardShell role="ADMIN" name={admin.name}><div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-black text-[#173f30]">Project approvals</h1><p className="mt-2 text-sm text-[#718077]">Review equipment submissions before they enter the public marketplace.</p></div><Link href="/projects" className="text-sm font-bold text-[#315c43]">View marketplace →</Link></div>
 {projects.length?<div className="mt-6 space-y-4">{projects.map(p=><article key={p.id} className="rounded-2xl border border-[#e3e9e2] bg-white p-5"><div className="flex flex-wrap justify-between gap-3"><div><span className="rounded-full bg-[#fff2cb] px-3 py-1 text-xs font-bold text-[#795b12]">Awaiting approval</span><h2 className="mt-3 text-lg font-extrabold text-[#244535]">{p.title}</h2><p className="mt-1 text-sm text-[#718077]">{p.equipmentType} · {p.town}, {p.region}</p></div><div className="text-right"><p className="text-xs text-[#829087]">Funding target</p><p className="font-black text-[#174b38]">{money(Number(p.fundingTarget))}</p></div></div><p className="mt-4 text-sm leading-6 text-[#65736a]">{p.description}</p><div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0eb] pt-4"><p className="text-xs text-[#718077]">Submitted by: {p.submittedBy?.name??'Administrator'} · {p.createdAt.toLocaleDateString('en-GH')}</p><AdminDecisionButtons id={p.id} endpoint="projects"/></div></article>)}</div>:<div className="mt-6 rounded-2xl border border-dashed border-[#ccd8ce] bg-white p-10 text-center text-sm text-[#718077]">No projects are waiting for approval.</div>}</DashboardShell>;
}
function money(n:number){return new Intl.NumberFormat('en-GH',{style:'currency',currency:'GHS'}).format(n)}
