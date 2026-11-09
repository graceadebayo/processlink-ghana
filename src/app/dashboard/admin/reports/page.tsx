import Link from 'next/link';
import { Role } from '@prisma/client';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from '@/components/dashboard-shell';
import { DistributionConsole } from '@/components/admin/distribution-console';
import { RevenueChart } from '@/components/admin/revenue-chart';

export default async function AdminReportsPage(){
 const user=await requireRole(Role.ADMIN);
 const [projects,distributions,payouts]=await Promise.all([
  prisma.equipment.findMany({where:{status:{in:['FUNDED','ACTIVE','CLOSED']}},select:{id:true,title:true},orderBy:{title:'asc'}}),
  prisma.distribution.findMany({include:{equipment:true},orderBy:{periodStart:'desc'},take:12}),
  prisma.investorPayout.aggregate({_sum:{amount:true}}),
 ]);
 const chartData=[...distributions].reverse().map(d=>({period:`${d.equipment.title.slice(0,12)} · ${d.periodStart.toLocaleDateString('en-GH',{month:'short',year:'2-digit'})}`,gross:Number(d.grossRevenue),expenses:Number(d.expenses),net:Number(d.netRevenue)}));
 const totalFees=distributions.reduce((s,d)=>s+Number(d.platformAmount),0);
 return <DashboardShell role="ADMIN" name={user.name}><div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-black text-[#173f30] md:text-3xl">Financial reports</h1><p className="mt-2 text-sm text-[#718077]">Distributions, platform fees and investor allocations.</p></div><a href="/api/admin/reports" className="rounded-xl border border-[#dce5dc] bg-white px-4 py-3 text-sm font-bold text-[#174b38]">Export CSV ↓</a></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><Metric label="Platform fees recorded" value={money(totalFees)}/><Metric label="Illustrative investor payouts" value={money(Number(payouts._sum.amount??0))}/></div><div className="mt-6"><DistributionConsole projects={projects}/></div><div className="mt-6"><RevenueChart data={chartData}/></div><section className="mt-7"><h2 className="font-extrabold text-[#173f30]">Distribution history</h2>{distributions.length?<div className="mt-3 overflow-x-auto rounded-2xl border border-[#e3e9e2] bg-white"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-[#f5f8f3] text-xs uppercase text-[#718077]"><tr>{['Project','Period','Gross','Expenses','Net','Platform fee'].map(h=><th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{distributions.map(d=><tr key={d.id} className="border-t border-[#edf0eb]"><td className="p-3 font-semibold">{d.equipment.title}</td><td className="p-3">{d.periodStart.toLocaleDateString('en-GH')} – {d.periodEnd.toLocaleDateString('en-GH')}</td><td className="p-3">{money(Number(d.grossRevenue))}</td><td className="p-3">{money(Number(d.expenses))}</td><td className="p-3 font-bold">{money(Number(d.netRevenue))}</td><td className="p-3">{money(Number(d.platformAmount))}</td></tr>)}</tbody></table></div>:<p className="mt-3 rounded-xl bg-white p-5 text-sm text-[#718077]">No distributions have been run yet.</p>}</section><p className="mt-6 text-xs text-[#718077]">Investor allocations are illustrative records, not guaranteed returns. Prototype payments are simulated.</p><Link href="/dashboard/admin" className="mt-5 inline-block text-sm font-bold text-[#315c43]">← Back to admin overview</Link></DashboardShell>
}
function Metric({label,value}:{label:string;value:string}){return <div className="rounded-2xl border border-[#e3e9e2] bg-white p-5"><p className="text-sm text-[#718077]">{label}</p><p className="mt-2 text-2xl font-black text-[#174b38]">{value}</p></div>}
function money(n:number){return new Intl.NumberFormat('en-GH',{style:'currency',currency:'GHS'}).format(n)}
