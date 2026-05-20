import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SetupForm } from './components/SetupForm';
import { Dashboard } from './components/Dashboard';
import { ThemeProvider } from './theme/ThemeContext';
import type { SetupFormData } from './types';

const queryClient = new QueryClient();

const STORAGE_KEY = 'mf-tracker-setup';

function loadSetup(): SetupFormData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SetupFormData) : null;
  } catch {
    return null;
  }
}

function saveSetup(data: SetupFormData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export default function App() {
  const [savedSetup] = useState<SetupFormData | null>(loadSetup);
  const [setup, setSetup] = useState<SetupFormData | null>(null);

  function handleSubmit(data: SetupFormData) {
    saveSetup(data);
    setSetup(data);
  }

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <div key={setup ? 'dashboard' : 'setup'} className="fade-in">
          {setup ? (
            <Dashboard setup={setup} onBack={() => setSetup(null)} />
          ) : (
            <SetupForm initial={savedSetup ?? undefined} onSubmit={handleSubmit} />
          )}
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
