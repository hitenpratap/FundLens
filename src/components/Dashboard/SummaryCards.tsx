import type { SchemeReturns } from '../../types';

interface Props {
  schemes: SchemeReturns[];
  portfolioReturn: number;
  portfolioCagr: number;
  portfolioXirr: number | null;
  years: number;
  portfolioTotalInvested: number;
  portfolioCurrentValue: number;
}

function ReturnBadge({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
        positive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
      }`}
    >
      {positive ? '▲' : '▼'} {Math.abs(value).toFixed(2)}%
    </span>
  );
}

function inr(n: number) {
  return n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function SummaryCards({ schemes, portfolioReturn, portfolioCagr, portfolioXirr, years, portfolioTotalInvested, portfolioCurrentValue }: Props) {
  const portfolioGain = portfolioCurrentValue - portfolioTotalInvested;
  const hasSIP = portfolioTotalInvested > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
      {/* Portfolio card */}
      <div className="sm:col-span-2 xl:col-span-3 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-indigo-200 text-xs font-medium uppercase tracking-wider mb-1">Portfolio ({years}Y)</div>
            <div className="text-3xl font-bold">
              {portfolioReturn >= 0 ? '+' : ''}{portfolioReturn.toFixed(2)}%
            </div>
            <div className="text-indigo-200 text-sm mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
              <span>CAGR: {portfolioCagr >= 0 ? '+' : ''}{portfolioCagr.toFixed(2)}% p.a.</span>
              {portfolioXirr != null && (
                <span>XIRR: {portfolioXirr >= 0 ? '+' : ''}{portfolioXirr.toFixed(2)}% p.a.</span>
              )}
            </div>
            {hasSIP && (
              <div className="mt-3 pt-3 border-t border-indigo-400/40 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-indigo-300 text-xs">Total Invested</div>
                  <div className="font-semibold">₹{inr(portfolioTotalInvested)}</div>
                </div>
                <div>
                  <div className="text-indigo-300 text-xs">Current Value</div>
                  <div className="font-semibold">₹{inr(portfolioCurrentValue)}</div>
                </div>
                <div>
                  <div className="text-indigo-300 text-xs">Gain / Loss</div>
                  <div className={`font-semibold ${portfolioGain >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                    {portfolioGain >= 0 ? '+' : ''}₹{inr(portfolioGain)}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="text-indigo-300 text-5xl font-black opacity-30 select-none">∑</div>
        </div>
      </div>

      {/* Per-scheme cards */}
      {schemes.map(s => (
        <div key={s.schemeCode} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div
              className="w-3 h-3 rounded-full mt-1 shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-500 truncate">{s.fundHouse}</div>
              <div className="text-sm font-semibold text-slate-800 leading-snug mt-0.5 line-clamp-2">
                {s.schemeName}
              </div>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {s.absoluteReturn >= 0 ? '+' : ''}{s.absoluteReturn.toFixed(2)}%
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-x-3">
                <span>CAGR: {s.cagr.toFixed(2)}% p.a.</span>
                {s.xirr != null && (
                  <span className="text-indigo-500">XIRR: {s.xirr.toFixed(2)}% p.a.</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">NAV</div>
              <div className="text-sm font-medium text-slate-700">₹{s.currentNav.toFixed(2)}</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-400">
            <span>Start: ₹{s.startNav.toFixed(2)}</span>
            <ReturnBadge value={s.absoluteReturn} />
          </div>
          {s.sipAmount > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-slate-400">Invested</div>
                <div className="font-semibold text-slate-700">₹{inr(s.totalInvested)}</div>
                <div className="text-slate-400 mt-0.5">₹{inr(s.sipAmount)}/mo × {s.monthlyNavs.length}m</div>
              </div>
              <div>
                <div className="text-slate-400">Value</div>
                <div className="font-semibold text-slate-700">₹{inr(s.currentValue)}</div>
              </div>
              <div>
                <div className="text-slate-400">Gain</div>
                <div className={`font-semibold ${s.absoluteGainINR >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {s.absoluteGainINR >= 0 ? '+' : ''}₹{inr(s.absoluteGainINR)}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
