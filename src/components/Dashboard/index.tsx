import { useMemo, useEffect, useState } from 'react';
import { useSchemeNAVs } from '../../hooks/useSchemeNAV';
import { computeSchemeReturns, computePortfolio, computePortfolioXIRR } from '../../utils/returns';
import { SummaryCards } from './SummaryCards';
import { PortfolioChart } from './PortfolioChart';
import { SchemeChart } from './SchemeChart';
import { MonthlyTable } from './MonthlyTable';
import { PortfolioAllocation } from './PortfolioAllocation';
import { ThemeToggle } from '../ThemeToggle';
import type { SetupFormData } from '../../types';

interface Props {
  setup: SetupFormData;
  onBack: () => void;
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="shimmer h-44 rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="shimmer h-32 rounded-2xl" />
        <div className="shimmer h-32 rounded-2xl" />
        <div className="shimmer h-32 rounded-2xl" />
      </div>
      <div className="shimmer h-80 rounded-2xl" />
    </div>
  );
}

export function Dashboard({ setup, onBack }: Props) {
  const { investorName, years, selectedSchemes, sipAmounts } = setup;
  const schemeCodes = selectedSchemes.map(s => s.schemeCode);
  const navQueries = useSchemeNAVs(schemeCodes);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    <div className="min-h-screen bg-app">
      <header
        className="sticky top-0 z-30 transition-all duration-200"
        style={{
          background: scrolled ? 'color-mix(in srgb, var(--bg) 80%, transparent)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px) saturate(160%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(160%)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        }}
      >
        <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-ink-tertiary hover:text-ink transition-colors shrink-0"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              aria-label="Back"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <Logo />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-ink truncate">{investorName}</div>
              <div className="text-[11px] text-ink-muted font-mono">
                {fmt(startDate)} → {fmt(endDate)} · {years}Y
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isLoading && !hasError && schemeReturns.length > 0 && (
              <span
                className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-ink-tertiary px-2.5 py-1 rounded-md"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--accent)' }} />
                LIVE
              </span>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 py-6 pb-20" id="dashboard-content">
        {isLoading && (
          <div className="space-y-6 fade-in">
            <div className="text-center py-2 text-sm text-ink-tertiary flex items-center justify-center gap-2">
              <svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Fetching NAV data for {selectedSchemes.length} scheme{selectedSchemes.length > 1 ? 's' : ''}…
            </div>
            <Skeleton />
          </div>
        )}

        {hasError && !isLoading && (
          <div
            className="card p-8 text-center fade-in max-w-md mx-auto mt-12"
            style={{ borderColor: 'var(--negative)' }}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 bg-negative-soft">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--negative)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="text-ink font-semibold mb-1">Failed to load NAV data</div>
            <div className="text-ink-tertiary text-sm mb-5">Check your connection and try again.</div>
            <button
              onClick={onBack}
              className="btn-primary"
              style={{ background: 'var(--negative)', color: '#fff' }}
            >
              Go back
            </button>
          </div>
        )}

        {!isLoading && !hasError && schemeReturns.length > 0 && (
          <div className="space-y-5">
            <div className="fade-in">
              <SummaryCards
                schemes={schemeReturns}
                portfolioReturn={portfolioReturn}
                portfolioCagr={portfolioCagr}
                portfolioXirr={portfolioXirr}
                years={years}
                portfolioTotalInvested={portfolioTotalInvested}
                portfolioCurrentValue={portfolioCurrentValue}
              />
            </div>

            <div className="fade-in-delay-2">
              <PortfolioChart schemes={schemeReturns} portfolio={portfolio} />
            </div>

            <div className="fade-in-delay-3">
              <PortfolioAllocation schemes={schemeReturns} />
            </div>

            <div className="fade-in-delay-4">
              <SchemeChart schemes={schemeReturns} />
            </div>

            <div className="fade-in-delay-5">
              <MonthlyTable schemes={schemeReturns} portfolio={portfolio} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Logo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <rect x="2" y="2" width="20" height="20" rx="6" fill="var(--accent)" />
      <path d="M6 16L10 11L13 14L18 8" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="8" r="1.5" fill="#000" />
    </svg>
  );
}
