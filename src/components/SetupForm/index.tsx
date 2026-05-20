import { useState } from 'react';
import { useSchemeList } from '../../hooks/useSchemeList';
import { SchemeSearch } from './SchemeSearch';
import { SelectedSchemes } from './SelectedSchemes';
import type { SchemeListItem, SetupFormData } from '../../types';

interface Props {
  initial?: SetupFormData;
  onSubmit: (data: SetupFormData) => void;
}

const YEAR_OPTIONS = [1, 2, 3, 5, 7, 10];
const MAX_SCHEMES = 5;

export function SetupForm({ initial, onSubmit }: Props) {
  const { data: schemes = [], isLoading } = useSchemeList();
  const [investorName, setInvestorName] = useState(initial?.investorName ?? '');
  const [years, setYears] = useState(initial?.years ?? 3);
  const [selected, setSelected] = useState<SchemeListItem[]>(initial?.selectedSchemes ?? []);
  const [sipAmounts, setSipAmountsState] = useState<Record<number, number>>(initial?.sipAmounts ?? {});

  function addScheme(scheme: SchemeListItem) {
    if (selected.length >= MAX_SCHEMES) return;
    setSelected(prev => [...prev, scheme]);
  }

  function removeScheme(code: number) {
    setSelected(prev => prev.filter(s => s.schemeCode !== code));
    setSipAmountsState(prev => { const n = { ...prev }; delete n[code]; return n; });
  }

  function setSipAmount(code: number, amount: number) {
    setSipAmountsState(prev => ({ ...prev, [code]: amount }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!investorName.trim() || selected.length === 0) return;
    onSubmit({ investorName: investorName.trim(), years, selectedSchemes: selected, sipAmounts });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-lg mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">MF Tracker</h1>
          <p className="text-slate-500 mt-1 text-sm">Analyze mutual fund returns month by month</p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-6"
        >
          {/* Investor name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Investor Name</label>
            <input
              type="text"
              value={investorName}
              onChange={e => setInvestorName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm shadow-sm"
            />
          </div>

          {/* Years */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Time Period — <span className="text-indigo-600">{years} {years === 1 ? 'Year' : 'Years'}</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {YEAR_OPTIONS.map(y => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYears(y)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    years === y
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {y}Y
                </button>
              ))}
            </div>
          </div>

          {/* Scheme search */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Schemes
              <span className="ml-2 text-slate-400 font-normal">({selected.length}/{MAX_SCHEMES})</span>
            </label>
            {isLoading ? (
              <div className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-sm animate-pulse">
                Loading {(10000).toLocaleString()}+ schemes…
              </div>
            ) : (
              <SchemeSearch
                schemes={schemes}
                selected={selected}
                onSelect={addScheme}
                disabled={selected.length >= MAX_SCHEMES}
              />
            )}
            <SelectedSchemes schemes={selected} onRemove={removeScheme} sipAmounts={sipAmounts} onSipChange={setSipAmount} />
            {selected.length >= MAX_SCHEMES && (
              <p className="text-xs text-amber-600 mt-2">Maximum {MAX_SCHEMES} schemes reached.</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!investorName.trim() || selected.length === 0}
            className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-lg hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
          >
            Analyze Returns →
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-4">
          Data from{' '}
          <a href="https://www.mfapi.in/" target="_blank" rel="noreferrer" className="underline hover:text-slate-600">
            mfapi.in
          </a>
        </p>
      </div>
    </div>
  );
}
