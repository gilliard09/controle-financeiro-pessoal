import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  Sparkles,
  Layers,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import {
  calculate12MonthNetWorthEvolution,
  NetWorthEvolutionPoint,
} from '../../utils/calculations';

type ChartPeriod = '12m' | '6m' | 'ytd';

export const NetWorthLineChartWidget: React.FC = () => {
  const {
    totalWealth,
    investments,
    accounts,
    transactions,
    categories,
    selectedYear,
    selectedMonth,
  } = useFinance();

  const [period, setPeriod] = useState<ChartPeriod>('12m');
  const [showBreakdown, setShowBreakdown] = useState<boolean>(true);

  // Calculate points according to period
  const rawPoints = useMemo(() => {
    const count = period === '6m' ? 6 : 12;
    const allPoints = calculate12MonthNetWorthEvolution(
      totalWealth,
      investments,
      accounts,
      transactions,
      categories,
      selectedYear,
      selectedMonth,
      12
    );

    if (period === '6m') {
      return allPoints.slice(6);
    }
    if (period === 'ytd') {
      // From January of selectedYear up to selectedMonth
      const ytd = allPoints.filter((p) => p.year === selectedYear && p.month <= selectedMonth);
      return ytd.length >= 2 ? ytd : allPoints.slice(6);
    }
    return allPoints;
  }, [
    period,
    totalWealth,
    investments,
    accounts,
    transactions,
    categories,
    selectedYear,
    selectedMonth,
  ]);

  // Aggregate statistics for the period
  const stats = useMemo(() => {
    if (rawPoints.length === 0) {
      return {
        initialWealth: 0,
        currentWealth: totalWealth,
        netChange: 0,
        percentChange: 0,
        avgMonthlyGrowth: 0,
        maxWealth: totalWealth,
      };
    }

    const first = rawPoints[0].totalWealth;
    const last = rawPoints[rawPoints.length - 1].totalWealth;
    const netChange = last - first;
    const percentChange = first > 0 ? (netChange / first) * 100 : 0;
    const avgMonthlyGrowth = rawPoints.length > 1 ? netChange / (rawPoints.length - 1) : 0;
    const maxWealth = Math.max(...rawPoints.map((p) => p.totalWealth));

    return {
      initialWealth: first,
      currentWealth: last,
      netChange,
      percentChange,
      avgMonthlyGrowth,
      maxWealth,
    };
  }, [rawPoints, totalWealth]);

  return (
    <div className="bg-[#141112] rounded-3xl p-5 sm:p-6 border border-white/10 shadow-2xl space-y-5 relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#f74603]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#f74603]/20 to-[#f74603]/5 text-[#f74603] border border-[#f74603]/30 glow-orange-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                Evolução do Patrimônio Líquido
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#f74603]/15 border border-[#f74603]/30 text-[#f74603] text-[10px] font-extrabold uppercase tracking-wider">
                12 Meses
              </span>
            </div>
            <p className="text-xs text-white/50 mt-0.5">
              Trajetória acumulada de liquidez em contas e carteira de investimentos
            </p>
          </div>
        </div>

        {/* Controls: Periods & Breakdown Toggle */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Period selector */}
          <div className="flex items-center p-1 bg-black/40 border border-white/10 rounded-2xl">
            <button
              onClick={() => setPeriod('12m')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                period === '12m'
                  ? 'bg-gradient-to-r from-[#f74603] to-[#e85002] text-white shadow-md glow-orange-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              12 Meses
            </button>
            <button
              onClick={() => setPeriod('6m')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                period === '6m'
                  ? 'bg-gradient-to-r from-[#f74603] to-[#e85002] text-white shadow-md glow-orange-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              6 Meses
            </button>
            <button
              onClick={() => setPeriod('ytd')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                period === 'ytd'
                  ? 'bg-gradient-to-r from-[#f74603] to-[#e85002] text-white shadow-md glow-orange-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Ano Atual
            </button>
          </div>

          {/* Detailed lines toggle */}
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-semibold transition-all ${
              showBreakdown
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-black/40 border-white/10 text-white/40 hover:text-white'
            }`}
            title="Exibir ou ocultar linhas de Investimentos e Contas"
          >
            <Layers className="w-3.5 h-3.5 text-[#f74603]" />
            <span className="hidden sm:inline">Detalhamento</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
        <div className="bg-black/40 p-3.5 rounded-2xl border border-white/10">
          <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block">
            Patrimônio Atual
          </span>
          <p className="text-base sm:text-lg font-extrabold text-white tracking-tight mt-0.5">
            {formatCurrency(stats.currentWealth)}
          </p>
        </div>

        <div className="bg-black/40 p-3.5 rounded-2xl border border-white/10">
          <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block">
            Crescimento no Período
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-base sm:text-lg font-extrabold text-emerald-400 tracking-tight">
              +{formatCurrency(stats.netChange)}
            </p>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
              +{stats.percentChange.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-black/40 p-3.5 rounded-2xl border border-white/10">
          <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block">
            Média de Ganho / Mês
          </span>
          <p className="text-base sm:text-lg font-extrabold text-[#f74603] tracking-tight mt-0.5">
            +{formatCurrency(stats.avgMonthlyGrowth)}
          </p>
        </div>

        <div className="bg-black/40 p-3.5 rounded-2xl border border-white/10">
          <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block">
            Pico Registrado
          </span>
          <p className="text-base sm:text-lg font-extrabold text-amber-300 tracking-tight mt-0.5">
            {formatCurrency(stats.maxWealth)}
          </p>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 sm:h-80 w-full pt-2 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={rawPoints}
            margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="lineOrangeGlow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ff7d45" />
                <stop offset="100%" stopColor="#f74603" />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="rgba(255, 255, 255, 0.06)"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              stroke="#555555"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
            />

            <YAxis
              stroke="#555555"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const point: NetWorthEvolutionPoint = payload[0].payload;
                  return (
                    <div className="bg-[#181415]/95 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/15 text-xs space-y-2.5 min-w-[210px]">
                      <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                        <span className="font-extrabold text-white flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#f74603]" />
                          {point.monthName}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          {point.growthPercent >= 0 ? `+${point.growthPercent.toFixed(1)}%` : `${point.growthPercent.toFixed(1)}%`}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-1.5 text-white/70 font-semibold">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#f74603] shadow-sm shadow-[#f74603]" />
                            Patrimônio Total:
                          </span>
                          <span className="font-extrabold text-[#f74603] text-sm">
                            {formatCurrency(point.totalWealth)}
                          </span>
                        </div>

                        {showBreakdown && (
                          <>
                            <div className="flex items-center justify-between gap-3 pl-4 text-white/60">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                Investimentos:
                              </span>
                              <span className="font-bold text-emerald-400">
                                {formatCurrency(point.investments)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 pl-4 text-white/60">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-sky-400" />
                                Saldo em Contas:
                              </span>
                              <span className="font-bold text-sky-300">
                                {formatCurrency(point.liquidAccounts)}
                              </span>
                            </div>
                          </>
                        )}

                        <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
                          <span>Variação no mês:</span>
                          <span className="font-bold text-white/90">
                            {point.growthAmount >= 0 ? `+${formatCurrency(point.growthAmount)}` : `-${formatCurrency(Math.abs(point.growthAmount))}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Main Total Net Worth Line */}
            <Line
              type="monotone"
              dataKey="totalWealth"
              name="Patrimônio Total"
              stroke="#f74603"
              strokeWidth={3.5}
              dot={{
                r: 3.5,
                fill: '#f74603',
                stroke: '#141112',
                strokeWidth: 2,
              }}
              activeDot={{
                r: 7,
                fill: '#ffffff',
                stroke: '#f74603',
                strokeWidth: 3.5,
              }}
            />

            {/* Breakdown lines if enabled */}
            {showBreakdown && (
              <>
                <Line
                  type="monotone"
                  dataKey="investments"
                  name="Investimentos & Reserva"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{
                    r: 2.5,
                    fill: '#10b981',
                    stroke: '#141112',
                    strokeWidth: 1.5,
                  }}
                  activeDot={{
                    r: 5,
                    fill: '#ffffff',
                    stroke: '#10b981',
                    strokeWidth: 2,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="liquidAccounts"
                  name="Saldo em Contas"
                  stroke="#38bdf8"
                  strokeWidth={1.8}
                  strokeDasharray="2 2"
                  dot={{
                    r: 2,
                    fill: '#38bdf8',
                    stroke: '#141112',
                    strokeWidth: 1.5,
                  }}
                  activeDot={{
                    r: 4.5,
                    fill: '#ffffff',
                    stroke: '#38bdf8',
                    strokeWidth: 2,
                  }}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Key Takeaway footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs text-white/50">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 font-semibold text-white">
            <span className="w-3 h-1 rounded-full bg-[#f74603]" />
            Patrimônio Líquido Total
          </span>
          {showBreakdown && (
            <>
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-3 h-1 rounded-full bg-emerald-500" />
                Investimentos & Reserva
              </span>
              <span className="flex items-center gap-1.5 text-sky-400 font-semibold">
                <span className="w-3 h-1 rounded-full bg-sky-400" />
                Liquidez em Contas
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/25 self-start sm:self-auto">
          <ArrowUpRight className="w-4 h-4 stroke-[3]" />
          <span>Tendência de alta consistente</span>
        </div>
      </div>
    </div>
  );
};
