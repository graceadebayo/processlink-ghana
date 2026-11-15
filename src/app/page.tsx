import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  Cog,
  MapPin,
  Sprout,
  Tractor,
} from 'lucide-react';

const roles = [
  {
    icon: Tractor,
    title: 'Farmers and processors',
    description: 'Find nearby equipment and request the processing services you need.',
  },
  {
    icon: Cog,
    title: 'Equipment operators',
    description: 'Manage assigned equipment, respond to jobs, and record operating costs.',
  },
  {
    icon: Sprout,
    title: 'Investors',
    description: 'Explore equipment projects and follow illustrative funding reports.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Fund equipment',
    description:
      'Investors contribute toward equipment projects and can follow funding progress.',
  },
  {
    number: '02',
    title: 'Connect an operator',
    description:
      'Approved operators manage equipment, respond to processing requests, and record expenses.',
  },
  {
    number: '03',
    title: 'Process produce',
    description:
      'Customers request a job, track its progress, and complete a simulated payment.',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f6ef]">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 text-lg font-black tracking-tight text-[#174b38]"
          aria-label="ProcessLink Ghana home"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-[#174b38] text-lg text-white">
            P
          </span>
          <span>
            Process<span className="text-[#d69c22]">Link</span>
            <span className="ml-1 font-semibold text-[#6c796f]">Ghana</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-bold text-[#53645a] md:flex">
          <Link className="transition hover:text-[#174b38]" href="/projects">
            Marketplace
          </Link>
          <Link className="transition hover:text-[#174b38]" href="#how-it-works">
            How it works
          </Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-xl px-3 py-2.5 text-sm font-bold text-[#174b38] transition hover:bg-[#e9f2ec]"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-[#174b38] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#23684e]"
          >
            Get started
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-16 lg:grid-cols-[1.08fr_.92fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#dce7dc] bg-white/80 px-3.5 py-2 text-xs font-extrabold uppercase tracking-[.12em] text-[#23684e]">
            <MapPin size={14} aria-hidden="true" />
            Agricultural processing network
          </div>
          <h1 className="mt-6 max-w-3xl text-[2.7rem] font-black leading-[1.06] tracking-[-.055em] text-[#153d2e] sm:text-6xl lg:text-[4.25rem]">
            More access to equipment. More value from every harvest.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[#5e6c63] sm:text-lg sm:leading-8">
            ProcessLink Ghana connects the people who fund processing equipment,
            the operators who run it, and the farmers and processors who need it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="btn-primary gap-2 px-5 py-3.5 shadow-md shadow-[#174b38]/10"
            >
              Join ProcessLink <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-xl border border-[#cbd5cc] bg-white/70 px-5 py-3.5 font-bold text-[#174b38] transition hover:bg-white"
            >
              Explore projects <ArrowDownRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-[#718078]">
            <span className="inline-flex items-center gap-1.5">
              <Check size={14} className="text-[#23684e]" aria-hidden="true" />
              Built around local processing needs
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check size={14} className="text-[#23684e]" aria-hidden="true" />
              Clear records for every role
            </span>
          </div>
        </div>

        <div className="relative">
          <div
            className="absolute -right-10 -top-10 size-40 rounded-full bg-[#e6b84c]/20 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative overflow-hidden rounded-[2rem] bg-[#174b38] p-6 text-white shadow-2xl shadow-[#174b38]/15 sm:p-9">
            <div className="absolute -bottom-24 -right-16 size-64 rounded-full border border-white/10" aria-hidden="true" />
            <div className="absolute -bottom-14 -right-6 size-44 rounded-full border border-white/10" aria-hidden="true" />
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[.16em] text-[#eac45e]">
                  The ProcessLink network
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                  One connected ecosystem.
                </h2>
              </div>
              <Sprout className="shrink-0 text-[#eac45e]" size={30} aria-hidden="true" />
            </div>
            <div className="relative mt-7 grid gap-3">
              {roles.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex items-start gap-4 rounded-2xl border border-white/15 bg-white/[.06] p-4 sm:p-5"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eac45e]/15 text-[#eac45e]">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-extrabold">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-white/70">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="relative mt-6 border-t border-white/15 pt-5 text-sm text-white/65">
              Follow jobs, operating costs, and project activity in one place.
            </p>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-y border-[#e5e8df] bg-white px-5 py-16 sm:px-8 sm:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[.16em] text-[#a67a1b]">
            How it works
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
            <h2 className="max-w-2xl text-3xl font-black tracking-tight text-[#153d2e] sm:text-4xl">
              From equipment funding to processing work.
            </h2>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm font-extrabold text-[#174b38] hover:text-[#23684e]"
            >
              Browse the marketplace <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <article
                key={step.number}
                className="rounded-2xl border border-[#e4e9e3] bg-[#fbfcf9] p-6 sm:p-7"
              >
                <span className="text-sm font-black tracking-[.12em] text-[#b58a2b]">
                  {step.number}
                </span>
                <h3 className="mt-5 text-lg font-extrabold text-[#174b38]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#68766d]">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-14 sm:px-8 sm:py-16 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[.16em] text-[#a67a1b]">
            Start exploring
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-[#153d2e] sm:text-3xl">
            Find your place in the network.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#68766d]">
            Create an account to join as a customer, operator, or investor.
          </p>
        </div>
        <Link href="/register" className="btn-primary gap-2 self-start md:self-auto">
          Create an account <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>

      <footer className="border-t border-[#e5e8df] px-5 py-7 text-center text-xs text-[#77847b] sm:px-8">
        <p>© {new Date().getFullYear()} ProcessLink Ghana · Prototype for academic demonstration</p>
        <p className="mt-2">
          Payments are simulated. Investor figures are illustrative and do not guarantee returns.
        </p>
      </footer>
    </main>
  );
}
