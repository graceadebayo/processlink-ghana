'use client';
import { useState } from 'react';
type Action = 'ACCEPT'|'DECLINE'|'START'|'COMPLETE'|'CANCEL';
export function JobActionButton({ id, action, label }: { id: string; action: Action; label: string }) {
  const [busy,setBusy]=useState(false); const [message,setMessage]=useState('');
  async function run(){ setBusy(true); setMessage(''); try { const r=await fetch(`/api/jobs/${id}/status`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action})}); const d=await r.json(); if(!r.ok) throw new Error(d.error||'Could not update job'); setMessage('Updated'); window.location.reload(); } catch(e){setMessage(e instanceof Error?e.message:'Something went wrong');} finally{setBusy(false);} }
  return <div className="flex flex-col gap-1"><button disabled={busy} onClick={run} className="rounded-lg bg-emerald-800 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy?'Please wait…':label}</button>{message&&<span className="text-xs text-red-700">{message}</span>}</div>;
}
export function PayJobForm({ id }: { id:string }) {
 const [phone,setPhone]=useState(''); const [busy,setBusy]=useState(false); const [message,setMessage]=useState('');
 async function pay(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage('');try{const r=await fetch(`/api/jobs/${id}/payment`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone})});const d=await r.json();if(!r.ok)throw new Error(d.error);setMessage(`${d.message} Ref: ${d.reference}`);window.location.reload();}catch(e){setMessage(e instanceof Error?e.message:'Payment failed');}finally{setBusy(false);}}
 return <form onSubmit={pay} className="mt-2 flex flex-wrap gap-2"><input required value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Mobile Money number" className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm"/><button disabled={busy} className="rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold">{busy?'Processing…':'Pay (simulated)'}</button>{message&&<p className="w-full text-xs">{message}</p>}</form>;
}
export function ReviewForm({ id }: { id:string }) {
 const [rating,setRating]=useState('5');const [comment,setComment]=useState('');const [message,setMessage]=useState('');
 async function submit(e:React.FormEvent){e.preventDefault();const r=await fetch(`/api/jobs/${id}/review`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({rating:Number(rating),comment})});const d=await r.json();setMessage(r.ok?'Thank you for your review.':d.error);if(r.ok)window.location.reload();}
 return <form onSubmit={submit} className="mt-2 flex flex-wrap gap-2"><select value={rating} onChange={e=>setRating(e.target.value)} className="rounded-lg border p-2">{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} stars</option>)}</select><input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add a comment (optional)" className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm"/><button className="rounded-lg bg-emerald-800 px-3 py-2 text-sm text-white">Review</button>{message&&<p className="w-full text-xs">{message}</p>}</form>;
}
