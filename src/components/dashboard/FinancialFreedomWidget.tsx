import React from 'react';
import { Check, Lock, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export const FinancialFreedomWidget: React.FC = () => {
  const { user } = useAuth();
  const { emergencyReserve, essentialMonthlyExpenses, monthsOfSafety, financialFreedomLevels } = useFinance();

  const targetGoal = user?.emergencyGoal || 40000;
  const progressPercent = Math.min(100, Math.max(0, (emergencyReserve / targetGoal) * 100));

  return (
    <div className="bg-[#141112] rounded-3xl p-5 sm:p-6 border border-white/10 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Minha Segurança Financeira
            </h3>
          </div>
          <p className="text-xs text-[#a7a7a7] mt-1">
            Você já possui <strong className="text-emerald-400 font-semibold">{monthsOfSafety} meses</strong> do seu custo de vida protegidos.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs font-semibold text-[#a7a7a7] block">
            Reserva Atual / Meta
          </span>
          <span className="text-sm font-bold text-white">
            {formatCurrency(emergencyReserve)}{' '}
            <span className="text-[#a7a7a7] font-normal">/ {formatCurrency(targetGoal)}</span>
          </span>
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-[#d9d9d9]">Progresso da Meta</span>
          <span className="text-emerald-400 text-sm font-bold">
            {formatPercent(progressPercent, 0)}
          </span>
        </div>
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-[#f74603] rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Milestones / Levels */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#a7a7a7] block mb-3">
          Níveis de Proteção
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {financialFreedomLevels.map((lvl) => {
            return (
              <div
                key={lvl.amount}
                className={`p-3 rounded-2xl border transition-all ${
                  lvl.unlocked
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-[#1a1617]/60 border-white/5 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white">
                    {formatCurrency(lvl.amount)}
                  </span>
                  {lvl.unlocked ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center">
                      <Lock className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-[#d9d9d9]">
                  {lvl.title}
                </p>
                <p className="text-[10px] text-[#a7a7a7] mt-0.5 leading-tight">
                  ~{lvl.monthsCovered} meses protegidos
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

