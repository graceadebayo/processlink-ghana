'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type Mode = 'login' | 'register';
export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setBusy(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch(`/api/auth/${mode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');
      router.push(data.redirectTo); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong'); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="space-y-4">
    {mode === 'register' && <>
      <Field label="Full name" name="name" placeholder="Your full name" />
      <Field label="Phone number (optional)" name="phone" placeholder="e.g. 024 000 0000" />
      <label className="field-label">I want to join as<select className="field" name="role" defaultValue="CUSTOMER"><option value="CUSTOMER">Customer / Farmer</option><option value="INVESTOR">Investor</option><option value="OPERATOR">Equipment operator</option></select></label>
    </>}
    <Field label="Email address" name="email" type="email" placeholder="you@example.com" />
    <Field label="Password" name="password" type="password" placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'} />
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <button disabled={busy} className="btn-primary w-full">{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
  </form>;
}
function Field({ label, name, type = 'text', placeholder }: { label: string; name: string; type?: string; placeholder: string }) {
  return <label className="field-label">{label}<input className="field" name={name} type={type} placeholder={placeholder} required={name !== 'phone'} autoComplete={name === 'password' ? 'current-password' : name === 'email' ? 'email' : 'off'} /></label>;
}
