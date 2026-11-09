import Link from 'next/link';
import { Info, Wallet, FolderKanban, TrendingUp } from 'lucide-react';
import { Role } from '@prisma/client';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from '@/components/dashboard-shell';

export default async function InvestorPortfolioPage() {
  const user = await requireRole(Role.INVESTOR);
  const [investments, payouts] = await Promise.all([
    prisma.investment.findMany({ where: { investorId: user.id }, include: { equipment: true }, orderBy: { createdAt: 'desc' } }),
    prisma.investorPayout.findMany({ where: { investorId: user.id }, include: { distribution: { include: { equipment: true } } }, orderBy: { distribution: { periodEnd: 'desc' } } }),
  ]);
  const total = investments.reduce((sum, row) => sum + Number(row.amount), 0);
  const payoutTotal = payouts.reduce((sum, row) => sum + Number(row.amount), 0);
  const grouped = new Map<string, { title: string; amount: number; raised: number; target: number; status: string }>();
  for (const row of investments) {
    const existing = grouped.get(row.equipmentId) ?? { title: row.equipment.title, amount: 0, raised: Number(row.equipment.amountRaised), target: Number(row.equipment.fundingTarget), status: row.equipment.status };
    existing.amount += Number(row.amount); grouped.set(row.equipmentId, existing);
  }
  return <DashboardShell role="INVESTOR" name={user.name}>
    <div><h1 className="text-2xl font-black text-[#173f30] md:text-3xl">My investment portfolio</h1><p className="mt-2 text-sm text-[#718077]">Your personal investment records and project updates.</p></div>
    <div className="mt-7 grid gap-4 sm:grid-cols-3">
      <Stat icon={<Wallet/>} label="Total invested" value={money(total)} hint="Your recorded contributions"/>
      <Stat icon={<FolderKanban/>} label="Projects supported" value={String(grouped.size)} hint="Distinct equipment projects"/>
      <Stat icon={<TrendingUp/>} label="Recorded illustrative payouts" value={money(payoutTotal)} hint="Past demo distributions only"/>
    </div>
    <div className="mt-8 flex items-center justify-between"><h2 className="text-lg font-extrabold text-[#173f30]">Your projects</h2><Link href="/projects" className="text-sm font-bold text-[#276044]">Explore projects →</Link></div>
    {grouped.size ? <div className="mt-4 space-y-3">{Array.from(grouped.entries()).map(([id,row])=><div key={id} className="rounded-2xl border border-[#e3e9e2] bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><Link href={`/projects/${id}`} className="font-extrabold text-[#244535] hover:underline">{row.title}</Link><p className="mt-1 text-xs text-[#7c8980]">{row.status.replaceAll('_',' ')}</p></div><strong className="text-lg text-[#174b38]">{money(row.amount)}</strong></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-[#edf1ec]"><div className="h-full rounded-full bg-[#d5a832]" style={{width:`${Math.min(100,row.target?row.raised/row.target*100:0)}%`}}/></div><p className="mt-2 text-xs text-[#7c8980]">Project funding: {money(row.raised)} of {money(row.target)}</p></div>)}</div> : <Empty/>}
    <div className="mt-8"><h2 className="text-lg font-extrabold text-[#173f30]">Illustrative payout history</h2>{payouts.length?<div className="mt-4 overflow-hidden rounded-2xl border border-[#e3e9e2] bg-white">{payouts.map(row=><div key={row.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-[#edf0eb] p-4 last:border-0"><div><p className="font-bold text-[#244535]">{row.distribution.equipment.title}</p><p className="text-xs text-[#7c8980]">{row.distribution.periodStart.toLocaleDateString('en-GH')} – {row.distribution.periodEnd.toLocaleDateString('en-GH')}</p></div><strong className="text-[#174b38]">{money(Number(row.amount))}</strong></div>)}</div>:<p className="mt-3 rounded-xl border border-dashed border-[#ccd8ce] bg-white p-6 text-sm text-[#718077]">No payout records yet. Illustrative payouts will appear here when distributions are created in a later phase.</p>}</div>
    <div className="mt-7 flex gap-3 rounded-2xl bg-[#fff4d5] p-4 text-sm text-[#775a18]"><Info className="shrink-0" size={19}/><p><strong>Illustrative only:</strong> Historical demo payouts and any displayed investment figures are not forecasts, promises or guarantees of returns. This prototype does not provide investment advice.</p></div>
  </DashboardShell>;
}
function Stat({icon,label,value,hint}:{icon:React.ReactNode;label:string;value:string;hint:string}){return <div className="rounded-2xl border border-[#e3e9e2] bg-white p-5"><div className="flex items-center justify-between text-[#668071]"><span className="text-sm font-semibold">{label}</span>{icon}</div><p className="mt-4 text-2xl font-black text-[#174b38]">{value}</p><p className="mt-1 text-xs text-[#859188]">{hint}</p></div>}
function Empty(){return <div className="mt-4 rounded-2xl border border-dashed border-[#ccd8ce] bg-white/70 p-8 text-center text-sm text-[#78857c]">You have not invested in any projects yet. Browse the marketplace to explore available equipment.</div>}
function money(value:number){return new Intl.NumberFormat('en-GH',{style:'currency',currency:'GHS'}).format(value)}
