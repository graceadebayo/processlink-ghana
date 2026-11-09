import { requireRole } from '@/lib/auth';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from '@/components/dashboard-shell';
export default async function OperatorDashboard() {
  const user = await requireRole(Role.OPERATOR);
  const [equipment, jobs, expenses, paidEarnings] = await Promise.all([
    prisma.equipment.findMany({ where: { operatorId: user.id }, orderBy: { createdAt: 'desc' } }),
    prisma.job.findMany({ where: { operatorId: user.id }, include: { customer: true, equipment: true }, orderBy: { createdAt: 'desc' }, take: 8 }),
    prisma.expense.aggregate({ where: { recordedBy: user.id }, _sum: { amount: true } }),
    prisma.job.aggregate({ where: { operatorId: user.id, status: 'PAID' }, _sum: { price: true } }),
  ]);
  return <DashboardShell role="OPERATOR" name={user.name}><h1 className="text-2xl font-black text-[#173f30] md:text-3xl">Operator dashboard</h1><p className="mt-2 text-sm text-[#718077]">Manage your assigned equipment and processing activity.</p><div className="mt-7 grid gap-4 sm:grid-cols-3"><Metric label="Assigned equipment" value={String(equipment.length)}/><Metric label="Jobs on record" value={String(jobs.length)}/><Metric label="Expenses recorded" value={money(Number(expenses._sum.amount ?? 0))}/><Metric label="Paid job earnings" value={money(Number(paidEarnings._sum.price ?? 0))}/></div><section id="equipment" className="mt-9"><h2 className="text-lg font-extrabold text-[#173f30]">My equipment</h2>{equipment.length ? <div className="mt-3 grid gap-3 sm:grid-cols-2">{equipment.map(p=><div key={p.id} className="rounded-2xl border border-[#e3e9e2] bg-white p-5"><h3 className="font-bold text-[#244535]">{p.title}</h3><p className="mt-1 text-sm text-[#78857c]">{p.equipmentType} · {p.town}</p><p className="mt-3 text-xs font-bold uppercase tracking-wide text-[#668071]">{p.status.replaceAll('_',' ')}</p></div>)}</div>:<Empty text="No equipment has been assigned to you yet. You can apply to manage projects in Phase 2."/>}</section><section id="jobs" className="mt-9"><h2 className="text-lg font-extrabold text-[#173f30]">Recent jobs</h2>{jobs.length ? <div className="mt-3 space-y-3">{jobs.map(j=><div key={j.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e3e9e2] bg-white p-4"><div><p className="font-bold text-[#244535]">{j.produceType} · {Number(j.quantityKg).toLocaleString()} kg</p><p className="mt-1 text-xs text-[#78857c]">{j.customer.name} · {j.equipment.title}</p></div><span className="rounded-full bg-[#edf3ed] px-3 py-1 text-xs font-bold text-[#315c43]">{j.status.replaceAll('_',' ')}</span></div>)}</div>:<Empty text="No jobs yet. Customer requests will appear here."/>}</section></DashboardShell>;
}
function Metric({label,value}:{label:string;value:string}){return <div className="rounded-2xl border border-[#e3e9e2] bg-white p-5"><p className="text-sm font-semibold text-[#718077]">{label}</p><p className="mt-3 text-2xl font-black text-[#174b38]">{value}</p></div>}
function Empty({text}:{text:string}){return <div className="mt-3 rounded-2xl border border-dashed border-[#ccd8ce] p-7 text-center text-sm text-[#78857c]">{text}</div>}
function money(n:number){return new Intl.NumberFormat('en-GH',{style:'currency',currency:'GHS'}).format(n)}
