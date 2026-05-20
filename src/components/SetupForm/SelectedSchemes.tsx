import type { SchemeListItem } from '../../types';

interface Props {
  schemes: SchemeListItem[];
  onRemove: (code: number) => void;
  sipAmounts: Record<number, number>;
  onSipChange: (code: number, amount: number) => void;
}

const COLORS = ['bg-indigo-100 text-indigo-700', 'bg-amber-100 text-amber-700', 'bg-emerald-100 text-emerald-700', 'bg-red-100 text-red-700', 'bg-violet-100 text-violet-700'];

export function SelectedSchemes({ schemes, onRemove, sipAmounts, onSipChange }: Props) {
  if (schemes.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 mt-3">
      {schemes.map((s, i) => (
        <div
          key={s.schemeCode}
          className="flex flex-col gap-2 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${COLORS[i % COLORS.length]}`}>
                {i + 1}
              </span>
              <span className="text-sm text-slate-700 truncate">{s.schemeName}</span>
            </div>
            <button
              type="button"
              onClick={() => onRemove(s.schemeCode)}
              className="shrink-0 text-slate-400 hover:text-red-500 transition-colors text-lg leading-none"
              aria-label="Remove"
            >
              ×
            </button>
          </div>
          <div className="flex items-center gap-2 pl-9">
            <span className="text-xs text-slate-500 shrink-0">Monthly SIP</span>
            <div className="relative flex-1 max-w-36">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">₹</span>
              <input
                type="number"
                min={0}
                step={500}
                value={sipAmounts[s.schemeCode] || ''}
                onChange={e => onSipChange(s.schemeCode, Math.max(0, Number(e.target.value)))}
                placeholder="optional"
                className="w-full pl-6 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-xs shadow-sm"
              />
            </div>
            <span className="text-xs text-slate-400">/month</span>
          </div>
        </div>
      ))}
    </div>
  );
}
