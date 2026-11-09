'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const regions = ['Ahafo','Ashanti','Bono','Bono East','Central','Eastern','Greater Accra','North East','Northern','Oti','Savannah','Upper East','Upper West','Volta','Western','Western North'];
export function ProjectSubmitForm() {
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const router = useRouter();
  async function submit(formData: FormData) {
    setBusy(true); setError('');
    const raw = Object.fromEntries(formData.entries());
    if (raw.fundingDeadline) raw.fundingDeadline = new Date(`${raw.fundingDeadline}T23:59:00`).toISOString();
    const response = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(raw) });
    const result = await response.json(); setBusy(false);
    if (!response.ok) { setError(result.error ?? 'Unable to submit project.'); return; }
    router.push(`/projects/${result.projectId}?submitted=1`); router.refresh();
  }
  return <form action={submit} className="mt-6 grid gap-4 rounded-2xl border border-[#e3e9e2] bg-white p-5 sm:grid-cols-2">
    <Field label="Project title" name="title" placeholder="Ejisu cassava processing centre" required />
    <label className="field-label">Equipment type<select className="field" name="equipmentType" required><option value="">Choose equipment</option>{['Cassava grater','Palm fruit press','Maize mill','Cassava press','Multi-crop dryer','Other'].map(x=><option key={x}>{x}</option>)}</select></label>
    <Field label="Town" name="town" placeholder="Ejisu" required />
    <label className="field-label">Region<select className="field" name="region" required><option value="">Choose region</option>{regions.map(x=><option key={x}>{x}</option>)}</select></label>
    <Field label="Equipment cost (GHS)" name="cost" type="number" min="1" step="0.01" required />
    <Field label="Funding target (GHS)" name="fundingTarget" type="number" min="1" step="0.01" required />
    <Field label="Funding deadline (optional)" name="fundingDeadline" type="date" />
    <label className="field-label sm:col-span-2">Project description<textarea className="field min-h-28" name="description" minLength={20} maxLength={2000} placeholder="Describe the equipment, intended use and local processing need." required /></label>
    {error && <p role="alert" className="sm:col-span-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-[#7a877e]">Your project will remain private until an administrator approves it.</p><button disabled={busy} className="btn-primary" type="submit">{busy ? 'Submitting…' : 'Submit for approval'}</button></div>
  </form>;
}
function Field({label,name,placeholder,type='text',...props}:{label:string;name:string;placeholder?:string;type?:string;[key:string]:any}) { return <label className="field-label">{label}<input className="field" name={name} type={type} placeholder={placeholder} {...props}/></label>; }
