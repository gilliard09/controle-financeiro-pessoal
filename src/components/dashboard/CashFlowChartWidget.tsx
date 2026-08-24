import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, getMonthName } from '../../utils/formatters';
import { calculateMonthlyCashFlow } from '../../utils/calculations';

type FlowPeriod = 'current' | 'previous' | '6months' | 'year';

export const CashFlowChartWidget: React.FC = () => {
  const { transactions, categories, selectedYear, selectedMonth } = useFinance();
  const [period, setPeriod] = useState<FlowPeriod>('6months');

  const chartData = useMemo(() => {
    if (period === 'current') {
      const summary = calculateMonthlyCashFlow(transactions, categories, selectedYear, selectedMonth);
      return [
        {
          name: `${getMonthName(selectedMonth - 1).slice(0, 3)}/${selectedYear}`,
          Entradas: summary.income,
          Despesas: summary.expenses,
          Investimentos: summary.investments,
          Lazer: summary.leisure,
        },
      ];
    }

    if (period === 'previous') {
      const prevM = selectedMonth === 1 ? 12 : selectedMonth - 1;
      const prevY = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
      const summary = calculateMonthlyCashFlow(transactions, categories, prevY, prevM);
      return [
        {
          name: `${getMonthName(prevM - 1).slice(0, 3)}/${prevY}`,
          Entradas: summary.income,
          Despesas: summary.expenses,
          Investimentos: summary.investments,
          Lazer: summary.leisure,
        },
      ];
    }

    const count = period === '6months' ? 6 : 12;
    const points = [];

    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(selectedYear, selectedMonth - 1 - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const summary = calculateMonthlyCashFlow(transactions, categories, y, m);

      points.push({
        name: `${getMonthName(m - 1).slice(0, 3)}/${String(y).slice(2)}`,
        Entradas: summary.income,
        Despesas: summary.expenses,
        Investimentos: summary.investments,
        Lazer: summary.leisure,
      });
    }

    return points;
  }, [period, transactions, categories, selectedYear, selectedMonth]);

  return (
    <div className="bg-[#141112] rounded-3xl p-5 sm:p-6 border border-white/10 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-orange-500/10 text-[#f74603] border border-orange-500/20">
            <BarChart3 className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Fluxo de Caixa
            </h3>
            <p className="text-[11px] text-[#a7a7a7]">
              Entradas, Despesas, Investimentos e Lazer
            </p>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-black/40 border border-white/10 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setPeriod('current')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              period === 'current'
                ? 'bg-[#f74603] text-white shadow-md'
                : 'text-[#a7a7a7] hover:text-white'
            }`}
          >
            Mês Atual
          </button>
          <button
            onClick={() => setPeriod('previous')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              period === 'previous'
                ? 'bg-[#f74603] text-white shadow-md'
                : 'text-[#a7a7a7] hover:text-white'
            }`}
          >
            Mês Anterior
          </button>
          <button
            onClick={() => setPeriod('6months')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              period === '6months'
                ? 'bg-[#f74603] text-white shadow-md'
                : 'text-[#a7a7a7] hover:text-white'
            }`}
          >
            6 Meses
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              period === 'year'
                ? 'bg-[#f74603] text-white shadow-md'
                : 'text-[#a7a7a7] hover:text-white'
            }`}
          >
            1 Ano
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#1c1819] p-3 rounded-2xl shadow-2xl border border-white/15 text-xs space-y-1.5 backdrop-blur-md">
                      <p className="font-bold text-white border-b border-white/10 pb-1 mb-1">
                        {label}
                      </p>
                      {payload.map((entry) => (
                        <div key={entry.name} className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-[#a7a7a7]">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            {entry.name}:
                          </span>
                          <span className="font-bold text-white">
                            {formatCurrency(Number(entry.value))}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              iconType="circle"
              iconSize={8}
            />
            <Bar dataKey="Entradas" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={28} />
            <Bar dataKey="Despesas" fill="#EF4444" radius={[6, 6, 0, 0]} maxBarSize={28} />
            <Bar dataKey="Investimentos" fill="#F74603" radius={[6, 6, 0, 0]} maxBarSize={28} />
            <Bar dataKey="Lazer" fill="#F59E0B" radius={[6, 6, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

