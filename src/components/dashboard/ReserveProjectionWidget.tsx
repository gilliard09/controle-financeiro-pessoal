import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Calculator, Sparkles, TrendingUp } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { calculateReserveProjection } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';

export const ReserveProjectionWidget: React.FC = () => {
  const { user } = useAuth();
  const { emergencyReserve, monthlyCashFlow } = useFinance();

  const target = user?.emergencyGoal || 40000;
  // Default monthly contribution based on actual recent contributions or fallback to 2000
  const defaultContribution = monthlyCashFlow.investments > 0 ? monthlyCashFlow.investments : 2000;
  const [customContribution, setCustomContribution] = useState<number>(defaultContribution);

  const projection = useMemo(() => {
    return calculateReserveProjection(emergencyReserve, target, customContribution);
  }, [emergencyReserve, target, customContribution]);

  const chartData = projection.projectionPoints;

  return (
    <div className="bg-[#141112] rounded-3xl p-5 sm:p-6 border border-white/10 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 mb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-500/10 text-[#f74603] border border-orange-500/20">
              <Calculator className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Quando vou chegar aos {formatCurrency(target)}?
            </h3>
          </div>
          <p className="text-xs text-[#a7a7a7] mt-1">
            Se você continuar investindo{' '}
            <strong className="text-orange-400 font-bold">
              {formatCurrency(customContribution)}/mês
            </strong>
            , sua meta será atingida em aproximadamente{' '}
            <strong className="text-white font-bold">
              {projection.monthsToGoal === 0
                ? '0 meses (Meta atingida!)'
                : `${projection.monthsToGoal} ${projection.monthsToGoal === 1 ? 'mês' : 'meses'}`}
            </strong>
            .
          </p>
        </div>

        {/* Input slider/number for custom contribution */}
        <div className="flex items-center gap-3 bg-black/40 p-2 px-3 rounded-2xl border border-white/10">
          <span className="text-[11px] text-[#a7a7a7] whitespace-nowrap font-medium">
            Simular Aporte:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[#a7a7a7]">R$</span>
            <input
              type="number"
              min="100"
              max="50000"
              step="100"
              value={customContribution}
              onChange={(e) => setCustomContribution(Number(e.target.value) || 100)}
              className="w-24 px-2 py-1 bg-[#1a1617] rounded-xl border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#f74603]"
            />
          </div>
        </div>
      </div>

      {/* Projection Chart */}
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f74603" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#f74603" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#1c1819] p-3 rounded-2xl shadow-xl border border-white/15 text-xs backdrop-blur-md">
                      <p className="font-semibold text-white">{data.label}</p>
                      <p className="text-orange-400 font-bold mt-1">
                        Patrimônio: {formatCurrency(data.balance)}
                      </p>
                      <p className="text-[11px] text-[#a7a7a7]">
                        Total Aportado: {formatCurrency(data.contributed)}
                      </p>
                      <p className="text-[11px] text-amber-400 font-medium">
                        Meta: {formatCurrency(target)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={target} stroke="#f74603" strokeDasharray="3 3" label={{ value: 'Meta', position: 'insideTopRight', fill: '#f74603', fontSize: 11 }} />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#f74603"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorBalance)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[10px] text-slate-500 text-right mt-2">
        * Projeção estimada com rendimento médio de 10% a.a. e aportes constantes.
      </p>
    </div>
  );
};

