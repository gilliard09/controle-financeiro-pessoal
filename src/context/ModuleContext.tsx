import React, { createContext, useContext, useEffect, useState } from 'react';
import { MODULES } from '../lib/modules';

interface ModuleContextValue {
  enabled: Set<string>;
  toggle: (id: string) => void;
  isEnabled: (id: string) => boolean;
}

const ModuleContext = createContext<ModuleContextValue | null>(null);
const STORAGE_KEY = 'financas-pro:enabled-modules';

export const ModuleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enabled, setEnabled] = useState<Set<string>>(
    () => new Set(MODULES.filter((m) => m.enabledByDefault).map((m) => m.id))
  );

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const ids: string[] = JSON.parse(stored);
        const core = MODULES.filter((m) => m.core).map((m) => m.id);
        setEnabled(new Set([...core, ...ids]));
      } catch {
        // ignora storage corrompido
      }
    }
  }, []);

  const toggle = (id: string) => {
    const mod = MODULES.find((m) => m.id === id);
    if (mod?.core) return; // módulos core não desativam
    setEnabled((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next].filter((mid) => !MODULES.find((m) => m.id === mid)?.core)));
      return next;
    });
  };

  return (
    <ModuleContext.Provider value={{ enabled, toggle, isEnabled: (id) => enabled.has(id) }}>
      {children}
    </ModuleContext.Provider>
  );
};

export function useModules() {
  const ctx = useContext(ModuleContext);
  if (!ctx) throw new Error('useModules deve estar dentro de ModuleProvider');
  return ctx;
}
