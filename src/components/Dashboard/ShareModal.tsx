import { useState } from 'react';
import type { SetupFormData } from '../../types';

interface Props {
  setup: SetupFormData;
  onClose: () => void;
}

export function ShareModal({ setup, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const encoded = btoa(JSON.stringify(setup));
  const url = `${window.location.origin}${window.location.pathname}?share=${encoded}`;

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      className="fixed inset-0 z-50"
      onClick={onClose}
    >
      <div
        className="absolute top-16 right-5 card w-80 p-5 fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-ink">Share Analysis</h2>
            <p className="text-xs text-ink-tertiary mt-0.5">Anyone with this link can view this analysis.</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink transition-colors shrink-0"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            aria-label="Close"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex gap-2">
          <input
            readOnly
            value={url}
            onFocus={e => e.target.select()}
            className="input-base text-xs font-mono flex-1 min-w-0"
            style={{ color: 'var(--ink-tertiary)' }}
          />
          <button
            onClick={handleCopy}
            className="btn-primary shrink-0 text-xs px-4"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}
