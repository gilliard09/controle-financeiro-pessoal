import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Calculator,
  Compass,
  DollarSign,
  LineChart,
  Percent,
  PiggyBank,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { calculateCompoundGrowth } from '../../utils/calculations';

export const ProjectionsView: React.FC = () => {
  const { totalWealth, monthlyCashFlow } = useFinance();

  const [initialAmount, setInitialAmount] = useState(totalWealth || 21650);
  const [monthlyDeposit, setMonthlyDeposit] = useState(
    monthlyCashFlow.investments > 0 ? monthlyCashFlow.investments : 2100
  );
  const [annualRate, setAnnualRate] = useState(11.25); // CDI / Selic benchmark in Brazil
  const [years, setYears] = useState(10);

  const projection = useMemo(() => {
    return calculateCompoundGrowth(initialAmount, monthlyDeposit, annualRate, years);
  }, [initialAmount, monthlyDeposit, annualRate, years]);

  const milestones = [
    { label: '6 meses', months: 6 },
    { label: '1 ano', months: 12 },
    { label: '2 anos', months: 24 },
    { label: '5 anos', months: 60 },
    { label: '10 anos', months: 120 },
  ];

  return (
    <div className="space-y-6 pb-24 lg:pb-12 animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
          Simulador de Projeção Patrimonial
        </h1>
        <p className="text-xs sm:text-sm text-white/50 mt-0.5">
          Veja o poder exponencial dos juros compostos multiplicando seus aportes ao longo dos anos
        </p>
      </div>

      {/* Simulator Controls */}
      <div className="bg-[#141112] rounded-3xl p-5 sm:p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
          <div className="p-2 rounded-xl bg-[#f74603]/15 text-[#f74603] border border-[#f74603]/25">
            <Calculator className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Parâmetros da Simulação
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
              Patrimônio Inicial (R$)
            </label>
            <input
              type="number"
              value={initialAmount}
              onChange={(e) => setInitialAmount(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/40 text-xs font-extrabold text-white focus:outline-none focus:border-[#f74603]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
              Aporte Mensal (R$)
            </label>
            <input
              type="number"
              value={monthlyDeposit}
              onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/40 text-xs font-extrabold text-[#f74603] focus:outline-none focus:border-[#f74603]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
              Taxa de Rendimento (% a.a.)
            </label>
            <input
              type="number"
              step="0.25"
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/40 text-xs font-extrabold text-emerald-400 focus:outline-none focus:border-[#f74603]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
              Período de Análise
            </label>
            <select
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/40 text-xs font-bold text-white focus:outline-none focus:border-[#f74603]"
            >
              <option value={2}>2 Anos</option>
              <option value={5}>5 Anos</option>
              <option value={10}>10 Anos</option>
              <option value={20}>20 Anos</option>
              <option value={30}>30 Anos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Milestone Cards (6m, 1y, 2y, 5y, 10y) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {milestones.map((m) => {
          if (m.months > years * 12) return null;
          const point = projection[m.months];
          if (!point) return null;

          return (
            <div
              key={m.label}
              className="bg-[#141112] p-4 sm:p-5 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden group hover:border-[#f74603]/30 transition-colors"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#f74603]/5 rounded-full blur-xl pointer-events-none group-hover:bg-[#f74603]/10 transition-colors" />
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-white/40 block mb-1">
                Em {m.label}
              </span>
              <p className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                {formatCurrency(point.total)}
              </p>
              <span className="text-[10px] text-emerald-400 font-bold block mt-1">
                Juros: +{formatCurrency(point.interest)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-[#141112] rounded-3xl p-5 sm:p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#f74603]/15 text-[#f74603] border border-[#f74603]/25">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Curva de Acumulação e Juros Compostos
            </h3>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-white/50">
              <span className="w-2.5 h-2.5 rounded-full bg-white/30" /> Total Aportado
            </span>
            <span className="flex items-center gap-1.5 text-[#f74603]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f74603]" /> Total com Rendimentos
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={projection.filter((_, idx) => idx % (years > 5 ? 6 : 1) === 0)}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f74603" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#f74603" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                stroke="#555555"
                fontSize={11}
                tickFormatter={(v) => `${Math.floor(v / 12)}a`}
              />
              <YAxis
                stroke="#555555"
                fontSize={11}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#181415] p-3.5 rounded-2xl shadow-2xl border border-white/15 text-xs space-y-1.5 backdrop-blur-xl">
                        <p className="font-bold text-white border-b border-white/10 pb-1">
                          Mês {data.month} ({Math.floor(data.month / 12)} anos e {data.month % 12} meses)
                        </p>
                        <p className="text-white/70">
                          Total Acumulado: <strong className="text-[#f74603] font-extrabold">{formatCurrency(data.total)}</strong>
                        </p>
                        <p className="text-white/50">
                          Aportes: {formatCurrency(data.invested)}
                        </p>
                        <p className="text-emerald-400 font-bold">
                          Juros Ganhos: +{formatCurrency(data.interest)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="invested"
                stroke="#666666"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#colorInvested)"
                name="Total Aportado"
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#f74603"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorTotal)"
                name="Total Acumulado"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
