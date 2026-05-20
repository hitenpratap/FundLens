import { useMemo } from 'react';
import { useSchemeNAVs } from '../../hooks/useSchemeNAV';
import { computeSchemeReturns, computePortfolio, computePortfolioXIRR } from '../../utils/returns';
import { SummaryCards } from './SummaryCards';
import { PortfolioChart } from './PortfolioChart';
import { SchemeChart } from './SchemeChart';
import { MonthlyTable } from './MonthlyTable';
import { PortfolioAllocation } from './PortfolioAllocation';
import type { SetupFormData } from '../../types';

interface Props {
  setup: SetupFormData;
  onBack: () => void;
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-28 bg-slate-200 rounded-2xl" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-40 bg-slate-200 rounded-2xl" />
        <div className="h-40 bg-slate-200 rounded-2xl" />
      </div>
      <div className="h-64 bg-slate-200 rounded-2xl" />
    </div>
  );
}

export function Dashboard({ setup, onBack }: Props) {
  const { investorName, years, selectedSchemes, sipAmounts } = setup;
  const schemeCodes = selectedSchemes.map(s => s.schemeCode);
  const navQueries = useSchemeNAVs(schemeCodes);

  const isLoading = navQueries.some(q => q.isLoading);
  const hasError = navQueries.some(q => q.isError);

  const schemeReturns = useMemo(() => {
    if (isLoading) return [];
    return navQueries
      .map((q, i) => (q.data ? computeSchemeReturns(q.data, years, i, sipAmounts[selectedSchemes[i].schemeCode] ?? 0) : null))
      .filter(Boolean) as ReturnType<typeof computeSchemeReturns>[];
  }, [navQueries, years, isLoading, sipAmounts, selectedSchemes]);

  const portfolio = useMemo(() => computePortfolio(schemeReturns), [schemeReturns]);

  const portfolioTotalInvested = useMemo(
    () => schemeReturns.reduce((s, r) => s + r.totalInvested, 0),
    [schemeReturns]
  );
  const portfolioCurrentValue = useMemo(
    () => schemeReturns.reduce((s, r) => s + r.currentValue, 0),
    [schemeReturns]
  );

  const portfolioReturn = useMemo(() => {
    if (portfolio.length < 2) return 0;
    const start = portfolio[0].portfolioValue;
    const end = portfolio[portfolio.length - 1].portfolioValue;
    return ((end - start) / start) * 100;
  }, [portfolio]);

  const portfolioXirr = useMemo(() => computePortfolioXIRR(schemeReturns), [schemeReturns]);

  const portfolioCagr = useMemo(() => {
    if (portfolio.length < 2) return 0;
    const start = portfolio[0].portfolioValue;
    const end = portfolio[portfolio.length - 1].portfolioValue;
    const [y1, m1] = portfolio[0].month.split('-').map(Number);
    const [y2, m2] = portfolio[portfolio.length - 1].month.split('-').map(Number);
    const actualYears = (y2 - y1) + (m2 - m1) / 12;
    return actualYears > 0 ? (Math.pow(end / start, 1 / actualYears) - 1) * 100 : 0;
  }, [portfolio]);

  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - years);
  const fmt = (d: Date) => d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              aria-label="Back"
            >
              ←
            </button>
            <div>
              <div className="text-sm font-semibold text-slate-800">{investorName}</div>
              <div className="text-xs text-slate-400">{fmt(startDate)} – {fmt(endDate)} · {years}Y analysis</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6" id="dashboard-content">
        {isLoading && (
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 text-slate-500 text-sm">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Fetching NAV data for {selectedSchemes.length} scheme{selectedSchemes.length > 1 ? 's' : ''}…
              </div>
            </div>
            <Skeleton />
          </div>
        )}

        {hasError && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <div className="text-red-600 font-semibold mb-1">Failed to load NAV data</div>
            <div className="text-red-400 text-sm">Check your connection and try again.</div>
            <button
              onClick={onBack}
              className="mt-4 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
            >
              Go Back
            </button>
          </div>
        )}

        {!isLoading && !hasError && schemeReturns.length > 0 && (
          <>
            <SummaryCards
              schemes={schemeReturns}
              portfolioReturn={portfolioReturn}
              portfolioCagr={portfolioCagr}
              portfolioXirr={portfolioXirr}
              years={years}
              portfolioTotalInvested={portfolioTotalInvested}
              portfolioCurrentValue={portfolioCurrentValue}
            />
            <PortfolioChart schemes={schemeReturns} portfolio={portfolio} />
            <PortfolioAllocation schemes={schemeReturns} />
            <SchemeChart schemes={schemeReturns} />
            <MonthlyTable schemes={schemeReturns} portfolio={portfolio} />
          </>
        )}
      </div>
    </div>
  );
}
