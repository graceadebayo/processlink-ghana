import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from '@/components/dashboard-shell';
export default async function OperatorApplicationsPage(){
 const user=await requireRole(Role.OPERATOR);
 const applications=await prisma.operatorApplication.findMany({where:{operatorId:user.id},include:{equipment:true},orderBy:{createdAt:'desc'}});
 return <DashboardShell role="OPERATOR" name={user.name}><h1 className="text-2xl font-black text-[#173f30]">My applications</h1><p className="mt-2 text-sm text-[#718077]">Track your requests to operate equipment.</p>{applications.length?<div className="mt-6 space-y-3">{applications.map(a=><div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e3e9e2] bg-white p-5"><div><h2 className="font-bold text-[#244535]">{a.equipment.title}</h2><p className="mt-1 text-xs text-[#718077]">{a.equipment.equipmentType} · {a.equipment.town}, {a.equipment.region}</p></div><span className="rounded-full bg-[#edf3ed] px-3 py-1 text-xs font-bold text-[#315c43]">{a.status}</span></div>)}</div>:<div className="mt-6 rounded-2xl border border-dashed border-[#ccd8ce] bg-white p-8 text-center"><p className="text-sm text-[#718077]">You have not applied to any projects yet.</p><Link href="/projects" className="mt-3 inline-block text-sm font-bold text-[#174b38]">Explore equipment projects →</Link></div>}</DashboardShell>;
}
