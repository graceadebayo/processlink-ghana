'use client';

import { useEffect, useState } from 'react';
import { BarChart3, MapPin } from 'lucide-react';

type AnalyticsSummary = {
  project_count: number;
  funded_project_count: number;
  total_raised_pesewas: number;
  total_target_pesewas: number;
  funding_progress_percent: number;
  jobs_by_status: Record<string, number>;
  job_count: number;
  completed_job_count: number;
  job_completion_percent: number;
  successful_payments_pesewas: number;
  expenses_pesewas: number;
  net_revenue_pesewas: number;
  regional_funding: Array<{ region: string; raised_pesewas: number }>;
};

export function AnalyticsOverview() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    async function loadSummary() {
      try {
        const response = await fetch('/api/admin/analytics', {
          cache: 'no-store',
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Analytics could not be loaded.');
        }
        setSummary(result as AnalyticsSummary);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Analytics could not be loaded.',
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadSummary();
    return () => controller.abort();
  }, []);

  return (
    <section className="mt-7 rounded-2xl border border-[#e3e9e2] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-extrabold text-[#173f30]">
            <BarChart3 size={19} aria-hidden="true" />
            Platform activity
          </h2>
          <p className="mt-1 text-sm text-[#718077]">
            Project funding and processing activity, calculated by the Python analytics service.
          </p>
        </div>
        <span className="rounded-full bg-[#e9f2ec] px-3 py-1 text-xs font-bold text-[#23684e]">
          All-time totals
        </span>
      </div>

      {loading ? (
        <p className="mt-5 rounded-xl bg-[#f7f8f5] p-4 text-sm text-[#718077]" role="status">
          Loading platform analytics…
        </p>
      ) : error ? (
        <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900" role="alert">
          {error}
        </p>
      ) : summary ? (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              label="Equipment projects"
              value={summary.project_count.toLocaleString()}
              note={`${summary.funded_project_count} funded, active, or closed`}
            />
            <Metric
              label="Funding raised"
              value={money(summary.total_raised_pesewas)}
              note={`${summary.funding_progress_percent.toFixed(1)}% of project targets`}
            />
            <Metric
              label="Processing jobs"
              value={summary.job_count.toLocaleString()}
              note={`${summary.completed_job_count} completed or paid`}
            />
            <Metric
              label="Job completion"
              value={`${summary.job_completion_percent.toFixed(1)}%`}
              note={`${summary.completed_job_count} of ${summary.job_count} jobs`}
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
            <div className="rounded-xl bg-[#f7f8f5] p-4">
              <h3 className="text-sm font-extrabold text-[#174b38]">Revenue and expenses</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <MoneyMetric label="Successful payments" pesewas={summary.successful_payments_pesewas} />
                <MoneyMetric label="Recorded expenses" pesewas={summary.expenses_pesewas} />
                <MoneyMetric label="Net revenue" pesewas={summary.net_revenue_pesewas} />
              </div>
              <p className="mt-3 text-xs leading-5 text-[#718077]">
                Payments are simulated. These all-time totals are operational summaries, not investment returns.
              </p>
            </div>
            <div className="rounded-xl bg-[#f7f8f5] p-4">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#174b38]">
                <MapPin size={16} aria-hidden="true" />
                Funding by region
              </h3>
              {summary.regional_funding.length ? (
                <ul className="mt-2 divide-y divide-[#e5eae5]">
                  {summary.regional_funding.map((region) => (
                    <li key={region.region} className="flex justify-between gap-3 py-2 text-sm">
                      <span className="text-[#5e6c63]">{region.region}</span>
                      <span className="font-bold text-[#174b38]">
                        {money(region.raised_pesewas)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-[#718077]">No project funding recorded yet.</p>
              )}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-[#e8ede7] p-4">
      <p className="text-xs font-semibold text-[#718077]">{label}</p>
      <p className="mt-2 text-xl font-black text-[#174b38]">{value}</p>
      <p className="mt-1 text-xs text-[#718077]">{note}</p>
    </div>
  );
}

function MoneyMetric({ label, pesewas }: { label: string; pesewas: number }) {
  return (
    <div>
      <p className="text-xs text-[#718077]">{label}</p>
      <p className="mt-1 font-extrabold text-[#174b38]">{money(pesewas)}</p>
    </div>
  );
}

function money(pesewas: number) {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(pesewas / 100);
}
