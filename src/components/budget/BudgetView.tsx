import React, { useState } from 'react';
import {
  CheckCircle2,
  HeartPulse,
  PieChart,
  PiggyBank,
  ShieldCheck,
  Sliders,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { Category } from '../../types';
import { formatCurrency, formatPercent, getMonthName } from '../../utils/formatters';

export const BudgetView: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const {
    budget503020,
    transactions,
    categories,
    selectedMonth,
    selectedYear,
  } = useFinance();

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [necPercent, setNecPercent] = useState(user?.budgetRule?.necessitiesPercent || 50);
  const [leisurePercent, setLeisurePercent] = useState(user?.budgetRule?.leisurePercent || 30);
  const [invPercent, setInvPercent] = useState(user?.budgetRule?.investmentsPercent || 20);

  const totalPercent = necPercent + leisurePercent + invPercent;

  const handleSaveRule = () => {
    if (totalPercent !== 100) return;
    updateProfile({
      budgetRule: {
        necessitiesPercent: necPercent,
        leisurePercent,
        investmentsPercent: invPercent,
      },
    });
    setIsCustomizing(false);
  };

  const setPreset = (nec: number, lei: number, inv: number) => {
    setNecPercent(nec);
    setLeisurePercent(lei);
    setInvPercent(inv);
  };

  // Group transactions by category inside each bucket for selected month
  const categoryMap = new Map<string, Category>(categories.map((c) => [c.id, c]));
  const groupTotals: Record<string, number> = {};

  transactions.forEach((tx) => {
    if (tx.status !== 'paid') return;
    const d = new Date(tx.date.includes('T') ? tx.date : `${tx.date}T12:00:00`);
    if (d.getFullYear() !== selectedYear || d.getMonth() + 1 !== selectedMonth) return;

    if (tx.type === 'expense' || tx.type === 'investment') {
      const cat = categoryMap.get(tx.categoryId);
      const key = cat?.name || 'Outros';
      groupTotals[key] = (groupTotals[key] || 0) + tx.amount;
    }
  });

  const buckets = [
    {
      data: budget503020.necessities,
      icon: Zap,
      color: 'bg-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-900/50',
      textColor: 'text-blue-700 dark:text-blue-300',
      desc: 'Moradia, alimentação, contas fixas, saúde e transporte.',
    },
    {
      data: budget503020.leisure,
      icon: Sparkles,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      borderColor: 'border-amber-200 dark:border-amber-900/50',
      textColor: 'text-amber-700 dark:text-amber-300',
      desc: 'Lazer, restaurantes, compras pessoais, passeios e assinaturas.',
    },
    {
      data: budget503020.investments,
      icon: PiggyBank,
      color: 'bg-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      borderColor: 'border-emerald-200 dark:border-emerald-900/50',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      desc: 'Aportes, reserva de emergência e investimentos de longo prazo.',
    },
  ];

  return (
    <div className="space-y-6 pb-24 lg:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Orçamento 50 / 30 / 20
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-0.5">
            Distribuição equilibrada da sua renda mensal em {getMonthName(selectedMonth - 1)} de {selectedYear}
          </p>
        </div>

        <button
          onClick={() => setIsCustomizing(!isCustomizing)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-brand-orange/20 text-white/90 hover:text-brand-orange border border-white/10 hover:border-brand-orange/40 text-xs font-bold transition-all self-start sm:self-auto"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{isCustomizing ? 'Fechar Ajuste' : 'Personalizar Regra'}</span>
        </button>
      </div>

      {/* Custom Rule Editor */}
      {isCustomizing && (
        <div className="bg-[#141112] rounded-2xl p-5 border border-white/10 shadow-2xl animate-in slide-in-from-top duration-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">
              Ajustar Percentuais da Regra
            </h3>
            <span
              className={`text-xs font-bold ${
                totalPercent === 100 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              Soma: {totalPercent}% {totalPercent !== 100 ? '(Deve totalizar 100%)' : '✓'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPreset(50, 30, 20)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-white/80 border border-white/10"
            >
              Padrão 50/30/20
            </button>
            <button
              onClick={() => setPreset(60, 20, 20)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-white/80 border border-white/10"
            >
              Conservador 60/20/20
            </button>
            <button
              onClick={() => setPreset(40, 20, 40)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-white/80 border border-white/10"
            >
              Acelerador 40/20/40
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-blue-400 mb-1">
                Necessidades ({necPercent}%)
              </label>
              <input
                type="range"
                min="20"
                max="80"
                value={necPercent}
                onChange={(e) => setNecPercent(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-amber-400 mb-1">
                Lazer & Desejos ({leisurePercent}%)
              </label>
              <input
                type="range"
                min="5"
                max="60"
                value={leisurePercent}
                onChange={(e) => setLeisurePercent(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-400 mb-1">
                Investimentos ({invPercent}%)
              </label>
              <input
                type="range"
                min="5"
                max="60"
                value={invPercent}
                onChange={(e) => setInvPercent(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <button
              onClick={() => setIsCustomizing(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveRule}
              disabled={totalPercent !== 100}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#f74603] to-[#e85002] disabled:opacity-50 text-white text-xs font-bold shadow-[0_0_15px_rgba(247,70,3,0.35)]"
            >
              Aplicar Nova Regra
            </button>
          </div>
        </div>
      )}

      {/* Renda Base Information */}
      <div className="bg-[#141112] rounded-2xl p-4 sm:p-5 border border-white/10 shadow-lg flex items-center justify-between">
        <div>
          <span className="text-xs text-white/50 font-medium">
            Renda Base para Divisão
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {formatCurrency(budget503020.totalIncomeBase)}
          </p>
        </div>
        <div className="text-right text-xs">
          <span className="px-3 py-1 rounded-full bg-brand-orange/15 border border-brand-orange/30 text-brand-orange font-extrabold">
            {user?.budgetRule?.necessitiesPercent || 50}% / {user?.budgetRule?.leisurePercent || 30}% / {user?.budgetRule?.investmentsPercent || 20}%
          </span>
        </div>
      </div>

      {/* 3 Main Buckets Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {buckets.map((b) => {
          const item = b.data;
          const Icon = b.icon;
          const isOver = item.isOverBudget;

          return (
            <div
              key={item.title}
              className={`rounded-2xl p-5 sm:p-6 border transition-all duration-200 shadow-lg ${
                isOver
                  ? 'bg-[#181112] border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                  : 'bg-[#141112] hover:bg-[#181415] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2.5 rounded-xl ${b.bgColor} ${b.textColor} border border-white/5`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {item.title}
                    </h3>
                    <span className="text-[11px] font-semibold text-white/40">
                      Meta: {item.targetPercent}% da renda
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                    isOver
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-white/5 text-white/80 border-white/10'
                  }`}
                >
                  {item.percentUsed.toFixed(0)}% usado
                </span>
              </div>

              <p className="text-xs text-white/50 mb-4 min-h-[32px] leading-relaxed">
                {b.desc}
              </p>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden p-0.5 mb-3 border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOver ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : b.color
                  }`}
                  style={{ width: `${Math.min(100, item.percentUsed)}%` }}
                />
              </div>

              {/* Numbers */}
              <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/40">Utilizado até agora:</span>
                  <span className="font-bold text-white">
                    {formatCurrency(item.spentAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Limite do orçamento:</span>
                  <span className="font-semibold text-white/80">
                    {formatCurrency(item.targetAmount)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold pt-1 border-t border-dashed border-white/10">
                  <span className={isOver ? 'text-rose-400' : 'text-emerald-400'}>
                    {isOver ? 'Excedido em:' : 'Disponível:'}
                  </span>
                  <span className={isOver ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {formatCurrency(Math.abs(item.remainingAmount))}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Breakdown & Distribution Summary */}
      <div className="bg-[#141112] rounded-2xl p-5 sm:p-6 border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center text-brand-orange shrink-0 shadow-[0_0_15px_rgba(247,70,3,0.2)]">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Detalhamento dos Gastos por Categoria
              </h3>
              <p className="text-xs text-white/50">
                Consolidado das despesas e aportes em {getMonthName(selectedMonth - 1)} de {selectedYear}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
            {Object.keys(groupTotals).length} categorias com lançamentos
          </span>
        </div>

        {Object.keys(groupTotals).length === 0 ? (
          <div className="py-8 text-center text-xs text-white/40 space-y-1">
            <p className="font-semibold text-white/60">Nenhuma despesa paga neste mês ainda.</p>
            <p>Os gastos lançados aparecerão organizados aqui automaticamente conforme a regra 50/30/20.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {Object.entries(groupTotals)
              .sort(([, a], [, b]) => b - a)
              .map(([catName, amount]) => {
                const percentOfIncome =
                  budget503020.totalIncomeBase > 0
                    ? (amount / budget503020.totalIncomeBase) * 100
                    : 0;

                return (
                  <div
                    key={catName}
                    className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-white">{catName}</span>
                      <span className="text-[10px] text-white/40 block">
                        {percentOfIncome.toFixed(1)}% da renda
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-white">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};
