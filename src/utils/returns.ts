import type { NavRecord, MonthlyNav, SchemeDetail, SchemeReturns, PortfolioMonth } from '../types';

const MS_PER_YEAR = 365.25 * 24 * 3600 * 1000;

function computeXIRR(cashflows: { amount: number; date: Date }[]): number | null {
  if (cashflows.length < 2) return null;
  const t0 = cashflows[0].date.getTime();

  function npv(rate: number): number {
    return cashflows.reduce((sum, { amount, date }) => {
      const t = (date.getTime() - t0) / MS_PER_YEAR;
      return sum + amount / Math.pow(1 + rate, t);
    }, 0);
  }

  function dnpv(rate: number): number {
    return cashflows.reduce((sum, { amount, date }) => {
      const t = (date.getTime() - t0) / MS_PER_YEAR;
      return sum - (t * amount) / Math.pow(1 + rate, t + 1);
    }, 0);
  }

  let rate = 0.1;
  for (let i = 0; i < 300; i++) {
    const df = dnpv(rate);
    if (Math.abs(df) < 1e-12) break;
    const next = rate - npv(rate) / df;
    if (Math.abs(next - rate) < 1e-8) return next * 100;
    rate = next;
    if (rate <= -1) rate = -0.9999;
  }
  return null;
}

const SCHEME_COLORS = [
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
];

export function getSchemeColor(index: number): string {
  return SCHEME_COLORS[index % SCHEME_COLORS.length];
}

function parseNavDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleString('en-IN', { month: 'short', year: 'numeric' });
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function computeSchemeReturns(
  detail: SchemeDetail,
  years: number,
  colorIndex: number,
  sipAmount: number = 0
): SchemeReturns {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - years);
  cutoff.setDate(1);
  cutoff.setHours(0, 0, 0, 0);

  // Filter records within range, data is newest-first → reverse to oldest-first
  const inRange: NavRecord[] = detail.data
    .filter(r => parseNavDate(r.date) >= cutoff)
    .reverse();

  // Group by month: take the last record per month
  const byMonth = new Map<string, NavRecord>();
  for (const r of inRange) {
    const d = parseNavDate(r.date);
    byMonth.set(monthKey(d), r);
  }

  const sortedMonths = Array.from(byMonth.entries()).sort(([a], [b]) => a.localeCompare(b));

  if (sortedMonths.length === 0) {
    return {
      schemeCode: detail.meta.scheme_code,
      schemeName: detail.meta.scheme_name,
      fundHouse: detail.meta.fund_house,
      monthlyNavs: [],
      startNav: 0,
      currentNav: 0,
      absoluteReturn: 0,
      cagr: 0,
      actualYears: 0,
      xirr: null,
      color: getSchemeColor(colorIndex),
      sipAmount: 0,
      totalInvested: 0,
      currentValue: 0,
      absoluteGainINR: 0,
    };
  }

  const startNav = parseFloat(sortedMonths[0][1].nav);
  const currentNav = parseFloat(sortedMonths[sortedMonths.length - 1][1].nav);

  let cumulativeUnits = 0;
  let cumulativeInvested = 0;

  const monthlyNavs: MonthlyNav[] = sortedMonths.map(([key, record], i) => {
    const nav = parseFloat(record.nav);
    const normalizedValue = (nav / startNav) * 100;
    const prevNav = i > 0 ? parseFloat(sortedMonths[i - 1][1].nav) : null;
    const monthlyReturn = prevNav !== null ? ((nav - prevNav) / prevNav) * 100 : null;
    const d = parseNavDate(record.date);

    // Gain on units already held before this month's SIP
    const marketGainINR =
      prevNav !== null && sipAmount > 0 && cumulativeUnits > 0
        ? cumulativeUnits * (nav - prevNav)
        : null;

    if (sipAmount > 0) {
      cumulativeUnits += sipAmount / nav;
      cumulativeInvested += sipAmount;
    }

    return {
      month: key,
      label: formatMonthLabel(d),
      nav,
      normalizedValue,
      monthlyReturn,
      investedToDate: cumulativeInvested,
      fundValueToDate: sipAmount > 0 ? cumulativeUnits * nav : 0,
      marketGainINR,
    };
  });

  const absoluteReturn = ((currentNav - startNav) / startNav) * 100;

  // CAGR based on actual data span, not user-selected years
  const firstDate = parseNavDate(sortedMonths[0][1].date);
  const lastDate = parseNavDate(sortedMonths[sortedMonths.length - 1][1].date);
  const actualYears = (lastDate.getTime() - firstDate.getTime()) / (365.25 * 24 * 3600 * 1000);
  const cagr = actualYears > 1 / 12 ? (Math.pow(currentNav / startNav, 1 / actualYears) - 1) * 100 : 0;

  const totalInvested = cumulativeInvested;
  const currentValue = sipAmount > 0 ? cumulativeUnits * currentNav : 0;
  const absoluteGainINR = currentValue - totalInvested;

  let xirr: number | null = null;
  if (sipAmount > 0 && currentValue > 0 && sortedMonths.length >= 2) {
    const cfs = sortedMonths.map(([, record]) => ({
      amount: -sipAmount,
      date: parseNavDate(record.date),
    }));
    cfs.push({ amount: currentValue, date: parseNavDate(sortedMonths[sortedMonths.length - 1][1].date) });
    xirr = computeXIRR(cfs);
  }

  return {
    schemeCode: detail.meta.scheme_code,
    schemeName: detail.meta.scheme_name,
    fundHouse: detail.meta.fund_house,
    monthlyNavs,
    startNav,
    currentNav,
    absoluteReturn,
    cagr,
    actualYears,
    xirr,
    color: getSchemeColor(colorIndex),
    sipAmount,
    totalInvested,
    currentValue,
    absoluteGainINR,
  };
}

export function computePortfolio(schemes: SchemeReturns[]): PortfolioMonth[] {
  if (schemes.length === 0) return [];

  // Collect all months across all schemes
  const allMonths = new Set<string>();
  for (const s of schemes) s.monthlyNavs.forEach(m => allMonths.add(m.month));

  const sortedMonths = Array.from(allMonths).sort();

  // Build lookup: schemeCode → month → normalizedValue
  const lookup = new Map<number, Map<string, number>>();
  for (const s of schemes) {
    const m = new Map<string, number>();
    for (const n of s.monthlyNavs) m.set(n.month, n.normalizedValue);
    lookup.set(s.schemeCode, m);
  }

  const result: PortfolioMonth[] = [];
  let prevPortfolioValue: number | null = null;

  for (const month of sortedMonths) {
    const values: number[] = [];
    for (const s of schemes) {
      const v = lookup.get(s.schemeCode)?.get(month);
      if (v !== undefined) values.push(v);
    }
    if (values.length === 0) continue;
    const portfolioValue = values.reduce((a, b) => a + b, 0) / values.length;
    const monthlyReturn =
      prevPortfolioValue !== null
        ? ((portfolioValue - prevPortfolioValue) / prevPortfolioValue) * 100
        : null;

    // Get label from any scheme that has this month
    const anyScheme = schemes.find(s => lookup.get(s.schemeCode)?.has(month));
    const anyNav = anyScheme?.monthlyNavs.find(n => n.month === month);

    result.push({
      month,
      label: anyNav?.label ?? month,
      portfolioValue,
      monthlyReturn,
    });
    prevPortfolioValue = portfolioValue;
  }

  return result;
}

export function computePortfolioXIRR(schemes: SchemeReturns[]): number | null {
  const sipSchemes = schemes.filter(s => s.sipAmount > 0 && s.currentValue > 0);
  if (sipSchemes.length === 0) return null;

  const outflowsByMonth = new Map<string, { date: Date; amount: number }>();
  for (const s of sipSchemes) {
    for (const n of s.monthlyNavs) {
      const [year, month] = n.month.split('-').map(Number);
      const date = new Date(year, month - 1, 15);
      const existing = outflowsByMonth.get(n.month);
      if (existing) {
        existing.amount -= s.sipAmount;
      } else {
        outflowsByMonth.set(n.month, { date, amount: -s.sipAmount });
      }
    }
  }

  const cashflows = Array.from(outflowsByMonth.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
  const totalCurrentValue = sipSchemes.reduce((sum, s) => sum + s.currentValue, 0);
  cashflows.push({ amount: totalCurrentValue, date: cashflows[cashflows.length - 1].date });

  return computeXIRR(cashflows);
}
