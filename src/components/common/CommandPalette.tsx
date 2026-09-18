import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { MODULES } from '../../lib/modules';
import { useModules } from '../../context/ModuleContext';

interface CommandPaletteProps {
  onNavigate: (tab: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onNavigate }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { isEnabled } = useModules();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery('');
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  if (!open) return null;

  const results = MODULES.filter(
    (m) => isEnabled(m.id) && m.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-3"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-[#141112] border border-white/15 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
          <Search className="w-4 h-4 text-[#f74603]" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar módulos..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-[#a7a7a7] outline-none"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 text-[#a7a7a7]">esc</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {results.length === 0 && (
            <p className="px-2 py-4 text-xs text-[#a7a7a7] text-center">Nada encontrado.</p>
          )}
          {results.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => {
                  onNavigate(m.id);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-2xl text-sm text-[#d9d9d9] hover:bg-white/10 hover:text-white text-left transition-colors"
              >
                <Icon className="w-4 h-4 text-[#f74603]" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
