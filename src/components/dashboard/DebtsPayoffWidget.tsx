import React from 'react';
import { CheckCircle2, CreditCard, PartyPopper, Sparkles, TrendingUp } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export const DebtsPayoffWidget: React.FC = () => {
  const { fixedExpenses, debtsSummary, payDebtInstallment } = useFinance();

  const debts = fixedExpenses.filter((e) => e.isDebt);

  if (debts.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#141112] rounded-3xl p-5 sm:p-6 border border-white/10 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <CreditCard className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Quitação de Dívidas & Financiamentos
            </h3>
            <p className="text-[11px] text-[#a7a7a7]">
              Acompanhe o encerramento das parcelas e o dinheiro liberado
            </p>
          </div>
        </div>

        {debtsSummary.totalReleasedAfterAllDebts > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Potencial liberado: +{formatCurrency(debtsSummary.totalReleasedAfterAllDebts)}/mês</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {debts.map((debt) => {
          const totalInst = debt.totalInstallments || 1;
          const currentInst = debt.currentInstallment || 0;
          const remainingInst = Math.max(0, totalInst - currentInst);
          const isCompleted = debt.completed || currentInst >= totalInst;
          const progressPercent = Math.min(100, (currentInst / totalInst) * 100);
          const isLast = remainingInst === 1;

          return (
            <div
              key={debt.id}
              className={`p-4 rounded-2xl border transition-all ${
                isCompleted
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : isLast
                  ? 'bg-amber-950/25 border-amber-500/30'
                  : 'bg-[#1a1617]/80 border-white/5'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {debt.name}
                    </span>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700/40">
                        <PartyPopper className="w-3 h-3" />
                        Dívida Quitada!
                      </span>
                    ) : isLast ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f74603]/20 text-[#f74603] border border-[#f74603]/40 animate-pulse">
                        Última Parcela!
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-[#a7a7a7] mt-0.5">
                    Parcela mensal: <strong className="text-white">{formatCurrency(debt.amount)}</strong> • Vencimento: Dia {debt.dueDay}
                  </p>
                </div>

                {/* Progress numbers & pay button */}
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-xs font-bold text-white block">
                      {currentInst}/{totalInst} parcelas
                    </span>
                    <span className="text-[10px] text-[#a7a7a7]">
                      {isCompleted ? '100% pago' : `Restam ${remainingInst} ${remainingInst === 1 ? 'mês' : 'meses'}`}
                    </span>
                  </div>

                  {!isCompleted && (
                    <button
                      onClick={() => payDebtInstallment(debt.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                        isLast
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 glow-orange-sm'
                          : 'bg-[#f74603] hover:bg-[#e85002] text-white glow-orange-sm'
                      }`}
                    >
                      {isLast ? 'Quitar Dívida 🎉' : 'Pagar Parcela'}
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCompleted
                      ? 'bg-emerald-500'
                      : isLast
                      ? 'bg-gradient-to-r from-amber-500 to-emerald-500'
                      : 'bg-gradient-to-r from-[#55100d] via-[#e85002] to-[#f74603]'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {isCompleted && (
                <p className="text-[11px] font-medium text-emerald-300 mt-2">
                  🎉 Obrigação encerrada automaticamente. Você liberou <strong className="text-emerald-400">+{formatCurrency(debt.amount)}/mês</strong> em seu fluxo de caixa!
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

