'use client';

import { createBrowserClient } from '@supabase/ssr';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const SupabaseContext = createContext<SupabaseConfig | null>(null);

export function SupabaseConfigProvider({
  url,
  anonKey,
  children,
}: SupabaseConfig & { children: ReactNode }) {
  return (
    <SupabaseContext.Provider value={{ url, anonKey }}>{children}</SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const config = useContext(SupabaseContext);
  if (!config || !config.url || !config.anonKey) {
    throw new Error('Supabase is not configured. Fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }
  return useMemo(() => createBrowserClient(config.url, config.anonKey), [config.url, config.anonKey]);
}
