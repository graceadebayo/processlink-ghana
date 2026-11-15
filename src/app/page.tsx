import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f6ef]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <Link href="/" className="text-xl font-black tracking-tight text-[#174b38]">
          Process<span className="text-[#d69c22]">Link</span> Ghana
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4" aria-label="Main navigation">
          <Link href="/login" className="px-3 py-2 text-sm font-bold text-[#174b38]">
            Log in
          </Link>
          <Link href="/register" className="rounded-xl bg-[#174b38] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#23684e]">
            Create account
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-10 md:grid-cols-[1.1fr_.9fr] md:pb-24 md:pt-16">
        <div>
          <span className="rounded-full bg-[#e8eee8] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#174b38]">
            Ghanaian processing network
          </span>
          <h1 className="mt-6 max-w-2xl text-5xl font-black leading-[1.08] tracking-tight text-[#153d2e] md:text-6xl">
            Fund the machine. Process the harvest.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[#5e6c63]">
            Connect equipment investors, local operators, and the farmers and processors who need them.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="btn-primary inline-flex items-center gap-2">
              Create account <ArrowRight size={17} />
            </Link>
            <Link href="/projects" className="rounded-xl border border-[#cbd5cc] px-5 py-3 font-bold text-[#174b38] transition hover:bg-white">
              Browse marketplace
            </Link>
          </div>
          <p className="mt-4 text-xs text-[#78857c]">
            Browse projects without an account. Payments in this prototype are simulated.
          </p>
        </div>

        <div className="rounded-[2rem] bg-[#174b38] p-7 text-white shadow-xl md:p-9">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#eac45e]">ONE CONNECTED NETWORK</span>
            <span className="text-2xl text-[#eac45e]" aria-hidden="true">✳</span>
          </div>
          <div className="mt-8 space-y-3">
            {[
              ['Investors', 'Help fund processing equipment'],
              ['Operators', 'Run equipment and serve local producers'],
              ['Farmers & processors', 'Access nearby processing services'],
            ].map(([title, description]) => (
              <div key={title} className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/5 p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-[#eac45e]" aria-hidden="true">•</span>
                <div>
                  <h2 className="font-bold">{title}</h2>
                  <p className="mt-0.5 text-sm text-white/70">{description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 border-t border-white/15 pt-5 text-xs leading-5 text-white/65">
            Prototype only: no real payments or guaranteed returns.
          </p>
        </div>
      </section>

      <footer className="border-t border-[#e5e8df] px-5 py-6 text-center text-xs text-[#77847b]">
        ProcessLink Ghana · Prototype for academic demonstration
      </footer>
    </main>
  );
}
