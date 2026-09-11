import { createContext, useContext, ReactNode } from 'react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

type TtsApi = ReturnType<typeof useSpeechSynthesis>;

const TtsContext = createContext<TtsApi | null>(null);

export function TtsProvider({ children }: { children: ReactNode }) {
  const api = useSpeechSynthesis();
  return <TtsContext.Provider value={api}>{children}</TtsContext.Provider>;
}

export function useTts(): TtsApi {
  const ctx = useContext(TtsContext);
  if (!ctx) {
    throw new Error('useTts must be used within a TtsProvider');
  }
  return ctx;
}
