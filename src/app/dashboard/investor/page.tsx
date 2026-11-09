import { requireRole } from '@/lib/auth';
import { Role } from '@prisma/client';
import { DashboardShell } from '@/components/dashboard-shell';
import { prisma } from '@/lib/prisma';
import { Wallet, TrendingUp, FolderOpen, Info } from 'lucide-react';
export default async function InvestorDashboard() {
  const user = await requireRole(Role.INVESTOR);
  const investments = await prisma.investment.findMany({ where: { investorId: user.id }, include: { equipment: true }, orderBy: { createdAt: 'desc' } });
  const total = investments.reduce((sum, item) => sum + Number(item.amount), 0);
  return <DashboardShell role="INVESTOR" name={user.name}><Heading title={`Good to see you, ${user.name.split(' ')[0]}`} sub="Your equipment investment overview."/><div className="mt-7 grid gap-4 sm:grid-cols-2"><Stat icon={<Wallet/>} label="Total invested" value={money(total)} hint="Across your projects"/><Stat icon={<FolderOpen/>} label="Projects supported" value={String(investments.length)} hint="Your current portfolio"/></div><div id="portfolio" className="mt-9"><div className="flex items-center justify-between"><h2 className="text-lg font-extrabold text-[#173f30]">Your investments</h2><span className="text-xs text-[#78857c]">Illustrative portfolio</span></div>{investments.length ? <div className="mt-4 space-y-3">{investments.map(item => <div key={item.id} className="rounded-2xl border border-[#e3e9e2] bg-white p-5"><div className="flex flex-wrap justify-between gap-2"><div><h3 className="font-bold text-[#244535]">{item.equipment.title}</h3><p className="mt-1 text-xs text-[#7c8980]">{item.equipment.equipmentType} · {item.equipment.region}</p></div><strong className="text-[#174b38]">{money(Number(item.amount))}</strong></div></div>)}</div> : <Empty text="You haven't invested in a project yet. Project discovery will be available in Phase 2."/>}</div><Notice/></DashboardShell>;
}
function Heading({title,sub}:{title:string;sub:string}){return <div><h1 className="text-2xl font-black text-[#173f30] md:text-3xl">{title}</h1><p className="mt-2 text-sm text-[#718077]">{sub}</p></div>}
function Stat({icon,label,value,hint}:{icon:React.ReactNode;label:string;value:string;hint:string}){return <div className="rounded-2xl border border-[#e3e9e2] bg-white p-5"><div className="flex items-center justify-between text-[#668071]"><span className="text-sm font-semibold">{label}</span>{icon}</div><p className="mt-4 text-3xl font-black text-[#174b38]">{value}</p><p className="mt-1 text-xs text-[#859188]">{hint}</p></div>}
function Empty({text}:{text:string}){return <div className="mt-4 rounded-2xl border border-dashed border-[#ccd8ce] bg-white/70 p-8 text-center text-sm text-[#78857c]">{text}</div>}
function Notice(){return <div className="mt-6 flex gap-3 rounded-2xl bg-[#fff4d5] p-4 text-sm text-[#775a18]"><Info size={19} className="shrink-0"/><p>Any returns or payout figures shown in this prototype are illustrative only and are not a promise or guarantee of investment returns.</p></div>}
function money(amount:number){return new Intl.NumberFormat('en-GH',{style:'currency',currency:'GHS'}).format(amount)}
