import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SetupForm } from './components/SetupForm';
import { Dashboard } from './components/Dashboard';
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
    <QueryClientProvider client={queryClient}>
      {setup ? (
        <Dashboard setup={setup} onBack={() => setSetup(null)} />
      ) : (
        <SetupForm initial={savedSetup ?? undefined} onSubmit={handleSubmit} />
      )}
    </QueryClientProvider>
  );
}
