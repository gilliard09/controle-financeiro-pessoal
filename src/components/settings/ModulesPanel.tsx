import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { useModules } from '../../context/ModuleContext';
import { MODULES, GROUP_LABELS, GROUP_ORDER } from '../../lib/modules';

export const ModulesPanel: React.FC = () => {
  const { isEnabled, toggle } = useModules();

  return (
    <div className="bg-[#141112] rounded-3xl p-5 sm:p-6 border border-white/10 shadow-2xl space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-white/10">
        <div className="p-2.5 rounded-xl bg-[#f74603]/15 text-[#f74603] border border-[#f74603]/30">
          <LayoutGrid className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Módulos (KingdomOS)</p>
          <p className="text-xs text-[#a7a7a7]">Ative só o que você usa — o resto fica fora do caminho</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {GROUP_ORDER.filter((g) => g !== 'financas').map((group) => (
          <div key={group}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b6b6b] mb-2">
              {GROUP_LABELS[group]}
            </p>
            <div className="space-y-1.5">
              {MODULES.filter((m) => m.group === group).map((m) => {
                const Icon = m.icon;
                const on = isEnabled(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => toggle(m.id)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold text-white">
                      <Icon className="w-3.5 h-3.5 text-[#f74603]" />
                      {m.label}
                    </span>
                    <span
                      className={`w-8 h-4.5 rounded-full flex items-center px-0.5 transition-colors ${
                        on ? 'bg-[#f74603] justify-end' : 'bg-white/15 justify-start'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-white" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
