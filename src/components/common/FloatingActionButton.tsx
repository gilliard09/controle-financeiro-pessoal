import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Plus, TrendingUp, X } from 'lucide-react';
import { TransactionType } from '../../types';

interface FloatingActionButtonProps {
  onSelectAction?: (type: TransactionType) => void;
  onOpenQuickAdd?: (type?: TransactionType) => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onSelectAction,
  onOpenQuickAdd,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (type: TransactionType) => {
    setIsOpen(false);
    if (onSelectAction) onSelectAction(type);
    else if (onOpenQuickAdd) onOpenQuickAdd(type);
  };

  const actions = [
    {
      type: 'expense' as TransactionType,
      label: 'Nova Despesa',
      icon: ArrowDownLeft,
      color: 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg',
      badgeColor: 'bg-rose-950/80 text-rose-300 border border-rose-500/30',
    },
    {
      type: 'income' as TransactionType,
      label: 'Nova Entrada / Renda',
      icon: ArrowUpRight,
      color: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg',
      badgeColor: 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30',
    },
    {
      type: 'investment' as TransactionType,
      label: 'Novo Aporte / Investimento',
      icon: TrendingUp,
      color: 'bg-[#f74603] hover:bg-[#e85002] text-white shadow-lg glow-orange-sm',
      badgeColor: 'bg-[#55100d]/80 text-orange-200 border border-[#f74603]/40',
    },
  ];

  return (
    <div className="fixed bottom-20 lg:bottom-8 right-4 sm:right-8 z-40 flex flex-col items-end">
      {/* Expanded action buttons */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />
          <div className="flex flex-col items-end gap-2.5 mb-3 z-40 animate-in slide-in-from-bottom-3 duration-200">
            {actions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.type}
                  onClick={() => handleAction(act.type)}
                  className="flex items-center gap-2.5 group focus:outline-none"
                >
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl backdrop-blur-md ${act.badgeColor}`}>
                    {act.label}
                  </span>
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl transition-transform group-hover:scale-110 active:scale-95 ${act.color}`}
                  >
                    <Icon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Main "+" Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-2xl text-white transition-all duration-300 z-40 focus:outline-none glow-orange ${
          isOpen
            ? 'bg-[#141112] border border-white/20 rotate-45 scale-105'
            : 'bg-gradient-to-tr from-[#55100d] via-[#e85002] to-[#f74603] hover:brightness-110 active:scale-95'
        }`}
        title="Lançamento Rápido"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </button>
    </div>
  );
};

