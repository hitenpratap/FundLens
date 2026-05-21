import { useState } from 'react';
import { useSchemeList } from '../../hooks/useSchemeList';
import { SchemeSearch } from './SchemeSearch';
import { SelectedSchemes } from './SelectedSchemes';
import { ThemeToggle } from '../ThemeToggle';
import type { SchemeListItem, SetupFormData } from '../../types';

interface Props {
  initial?: SetupFormData;
  onSubmit: (data: SetupFormData) => void;
}

const YEAR_OPTIONS = [1, 2, 3, 5, 7, 10];
const MAX_SCHEMES = 5;
const STEPS = ['Identity', 'Period', 'Schemes', 'Review'] as const;

function inr(n: number) {
  return n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function SetupForm({ initial, onSubmit }: Props) {
  const { data: schemes = [], isLoading } = useSchemeList();
  const [step, setStep] = useState(0);
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

  const canAdvance: boolean =
    (step === 0 && investorName.trim().length > 0) ||
    (step === 1 && years > 0) ||
    (step === 2 && selected.length > 0) ||
    step === 3;

  function submit() {
    if (!investorName.trim() || selected.length === 0) return;
    onSubmit({ investorName: investorName.trim(), years, selectedSchemes: selected, sipAmounts });
  }

  const totalSip = Object.entries(sipAmounts).reduce((sum, [code, amt]) => {
    if (selected.find(s => s.schemeCode === Number(code))) return sum + amt;
    return sum;
  }, 0);

  return (
    <div className="min-h-screen bg-app relative overflow-hidden">
      <div className="grid-noise" />
      <div className="glow-mint" style={{ top: '-200px', right: '-100px' }} />
      <div className="glow-mint" style={{ bottom: '-200px', left: '-100px', opacity: 0.5 }} />

      <header className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Logo />
          <div className="text-sm font-semibold tracking-tight">FundLens</div>
        </div>
        <ThemeToggle />
      </header>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-16">
        <div className="text-center mb-10 fade-in">
          <div className="inline-flex items-center gap-2 chip" style={{ background: 'var(--surface-2)', color: 'var(--ink-tertiary)', border: '1px solid var(--border)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-positive-soft" style={{ background: 'var(--accent)' }} />
            Returns analyzer
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-tight mt-5 leading-[1.05]">
            See your funds<br />
            <em className="text-accent not-italic" style={{ fontStyle: 'italic' }}>compound clearly.</em>
          </h1>
          <p className="text-ink-tertiary text-sm mt-4 max-w-sm mx-auto">
            Month-by-month returns across up to 5 mutual fund schemes, calculated from raw NAV data.
          </p>
        </div>

        <StepIndicator current={step} onJump={(s) => s <= step && setStep(s)} />

        <div className="card p-5 sm:p-7 mt-6 fade-in-delay-1" style={{ minHeight: 340 }}>
          {step === 0 && (
            <StepIdentity
              value={investorName}
              onChange={setInvestorName}
              onEnter={() => canAdvance && setStep(1)}
            />
          )}
          {step === 1 && (
            <StepPeriod value={years} onChange={setYears} />
          )}
          {step === 2 && (
            <StepSchemes
              isLoading={isLoading}
              schemes={schemes}
              selected={selected}
              sipAmounts={sipAmounts}
              onAdd={addScheme}
              onRemove={removeScheme}
              onSip={setSipAmount}
            />
          )}
          {step === 3 && (
            <StepReview
              name={investorName}
              years={years}
              selected={selected}
              sipAmounts={sipAmounts}
              totalSip={totalSip}
            />
          )}
        </div>

        <div className="flex items-center justify-between gap-3 mt-5">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            style={{ visibility: step === 0 ? 'hidden' : 'visible' }}
          >
            ← Back
          </button>

          <div className="text-xs text-ink-muted font-mono">
            {String(step + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
          </div>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              className="btn-primary"
              disabled={!canAdvance}
              onClick={() => setStep(s => s + 1)}
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              disabled={!investorName.trim() || selected.length === 0}
              onClick={submit}
            >
              Analyze →
            </button>
          )}
        </div>

        <p className="text-center text-xs text-ink-muted mt-8">
          Data from{' '}
          <a href="https://www.mfapi.in/" target="_blank" rel="noreferrer" className="underline hover:text-ink-tertiary transition-colors">
            mfapi.in
          </a>
        </p>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="6" fill="var(--accent)" />
      <path d="M6 16L10 11L13 14L18 8" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="8" r="1.5" fill="#000" />
    </svg>
  );
}

function StepIndicator({ current, onJump }: { current: number; onJump: (i: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((label, i) => {
        const isActive = i === current;
        const isDone = i < current;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onJump(i)}
            className="flex-1 flex items-center gap-2 group"
            disabled={i > current}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono shrink-0 transition-all"
              style={{
                background: isActive ? 'var(--accent)' : isDone ? 'var(--accent-soft)' : 'var(--surface-2)',
                color: isActive ? '#000' : isDone ? 'var(--accent)' : 'var(--ink-muted)',
                border: `1px solid ${isActive ? 'var(--accent)' : isDone ? 'var(--accent-soft)' : 'var(--border)'}`,
              }}
            >
              {isDone ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:inline ${isActive ? 'text-ink' : 'text-ink-muted'}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className="flex-1 h-px ml-1 transition-colors"
                style={{ background: isDone ? 'var(--accent-soft)' : 'var(--border)' }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function StepIdentity({
  value,
  onChange,
  onEnter,
}: { value: string; onChange: (s: string) => void; onEnter: () => void }) {
  return (
    <div className="fade-in">
      <div className="text-xs uppercase tracking-wider text-ink-muted font-mono mb-2">Step 01</div>
      <h2 className="text-2xl font-semibold tracking-tight mb-1">Who's investing?</h2>
      <p className="text-sm text-ink-tertiary mb-7">Your name will appear on the dashboard header.</p>
      <input
        autoFocus
        type="text"
        className="input-base text-lg"
        placeholder="e.g. Hiten Singh"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), onEnter())}
      />
    </div>
  );
}

function StepPeriod({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="fade-in">
      <div className="text-xs uppercase tracking-wider text-ink-muted font-mono mb-2">Step 02</div>
      <h2 className="text-2xl font-semibold tracking-tight mb-1">Time horizon</h2>
      <p className="text-sm text-ink-tertiary mb-7">
        Look back over <span className="font-mono text-accent">{value}{value === 1 ? ' year' : ' years'}</span> of monthly NAV data.
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {YEAR_OPTIONS.map(y => (
          <button
            key={y}
            type="button"
            className={`pill ${value === y ? 'pill-active' : ''}`}
            onClick={() => onChange(y)}
          >
            {y}Y
          </button>
        ))}
      </div>
      <div className="mt-6 p-3 rounded-lg bg-surface-2 text-xs text-ink-tertiary leading-relaxed">
        CAGR is computed on the actual data span (some schemes have less history than the full period).
      </div>
    </div>
  );
}

interface StepSchemesProps {
  isLoading: boolean;
  schemes: SchemeListItem[];
  selected: SchemeListItem[];
  sipAmounts: Record<number, number>;
  onAdd: (s: SchemeListItem) => void;
  onRemove: (code: number) => void;
  onSip: (code: number, amt: number) => void;
}

function StepSchemes({ isLoading, schemes, selected, sipAmounts, onAdd, onRemove, onSip }: StepSchemesProps) {
  return (
    <div className="fade-in">
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-xs uppercase tracking-wider text-ink-muted font-mono">Step 03</div>
        <div className="text-xs font-mono text-ink-tertiary">
          {selected.length} / {MAX_SCHEMES}
        </div>
      </div>
      <h2 className="text-2xl font-semibold tracking-tight mb-1">Pick schemes</h2>
      <p className="text-sm text-ink-tertiary mb-5">
        Search 10,000+ schemes. Optionally add monthly SIP amounts for invested-value analysis.
      </p>

      {isLoading ? (
        <div className="shimmer rounded-xl h-12" />
      ) : (
        <SchemeSearch
          schemes={schemes}
          selected={selected}
          onSelect={onAdd}
          disabled={selected.length >= MAX_SCHEMES}
        />
      )}
      <SelectedSchemes
        schemes={selected}
        onRemove={onRemove}
        sipAmounts={sipAmounts}
        onSipChange={onSip}
      />
      {selected.length >= MAX_SCHEMES && (
        <p className="text-xs mt-3 text-accent">Maximum {MAX_SCHEMES} schemes reached.</p>
      )}
    </div>
  );
}

interface StepReviewProps {
  name: string;
  years: number;
  selected: SchemeListItem[];
  sipAmounts: Record<number, number>;
  totalSip: number;
}

function StepReview({ name, years, selected, sipAmounts, totalSip }: StepReviewProps) {
  return (
    <div className="fade-in space-y-5">
      <div>
        <div className="text-xs uppercase tracking-wider text-ink-muted font-mono mb-2">Step 04</div>
        <h2 className="text-2xl font-semibold tracking-tight">Review</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-surface-2">
          <div className="text-[11px] uppercase tracking-wider text-ink-muted font-mono mb-1">Investor</div>
          <div className="text-sm font-semibold truncate">{name || '—'}</div>
        </div>
        <div className="p-4 rounded-xl bg-surface-2">
          <div className="text-[11px] uppercase tracking-wider text-ink-muted font-mono mb-1">Period</div>
          <div className="text-sm font-semibold">{years} {years === 1 ? 'year' : 'years'}</div>
        </div>
      </div>

      <div>
        <div className="text-[11px] uppercase tracking-wider text-ink-muted font-mono mb-2">
          {selected.length} {selected.length === 1 ? 'scheme' : 'schemes'}
          {totalSip > 0 && <> · ₹{inr(totalSip)}/mo SIP</>}
        </div>
        <div className="space-y-1.5">
          {selected.map((s, i) => {
            const sip = sipAmounts[s.schemeCode] ?? 0;
            return (
              <div key={s.schemeCode} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-2">
                <div className="font-mono text-xs text-ink-muted w-5">{String(i + 1).padStart(2, '0')}</div>
                <div className="flex-1 min-w-0 text-sm truncate">{s.schemeName}</div>
                {sip > 0 && (
                  <div className="font-mono text-xs text-accent shrink-0">₹{inr(sip)}/mo</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
