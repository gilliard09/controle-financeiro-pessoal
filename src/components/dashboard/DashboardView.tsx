import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  Compass,
  CreditCard,
  DollarSign,
  Loader2,
  PiggyBank,
  Plus,
  QrCode,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatPercent, getGreeting, getMonthName } from '../../utils/formatters';
import { FinancialFreedomWidget } from './FinancialFreedomWidget';
import { NetWorthLineChartWidget } from './NetWorthLineChartWidget';
import { ReserveProjectionWidget } from './ReserveProjectionWidget';
import { UpcomingCalendarWidget } from './UpcomingCalendarWidget';
import { CashFlowChartWidget } from './CashFlowChartWidget';
import { DebtsPayoffWidget } from './DebtsPayoffWidget';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenQuickAdd: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenQuickAdd }) => {
  const { user } = useAuth();
  const {
    totalWealth,
    emergencyReserve,
    monthsOfSafety,
    monthlyCashFlow,
    prevMonthCashFlow,
    plannedVsActual,
    budget503020,
    selectedMonth,
    selectedYear,
    isDataLoading,
    accounts,
    fixedExpenses,
    transactions,
  } = useFinance();

  const targetEmergencyGoal = user?.emergencyGoal || 40000;
  const reservePercent = Math.min(100, (emergencyReserve / targetEmergencyGoal) * 100);

  // Month performance
  const netSavings = monthlyCashFlow.income - monthlyCashFlow.expenses;
  const savingsRate = monthlyCashFlow.income > 0 ? (netSavings / monthlyCashFlow.income) * 100 : 0;

  if (isDataLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#f74603]/10 border border-[#f74603]/30 flex items-center justify-center text-[#f74603] animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin text-[#f74603]" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Carregando seus dados...</h3>
          <p className="text-xs text-white/50">Sincronizando informações com o Supabase</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28 lg:pb-12">
      {/* 1. HERO CARD (Glowing Molten Orange Atmospheric Card) */}
      <div className="relative overflow-hidden rounded-3xl bg-brand-hero border border-orange-500/20 shadow-2xl glow-orange text-white p-6 sm:p-8">
        {/* Subtle decorative glow mesh */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-orange-500/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-red-700/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top bar inside hero */}
        <div className="relative z-10 flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-[#f74603] p-0.5 shadow-md">
              <div className="w-full h-full rounded-full bg-[#180907] flex items-center justify-center text-xs font-bold text-orange-200">
                {user?.name?.slice(0, 2).toUpperCase() || 'JR'}
              </div>
            </div>
            <div>
              <p className="text-[11px] text-orange-200/80 font-medium">
                {getGreeting(user?.name || 'Usuário')}
              </p>
              <h2 className="text-sm font-bold text-white tracking-tight">
                {getMonthName(selectedMonth - 1)} de {selectedYear}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('budget')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-xs font-semibold text-white transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Orçamento</span> 50/30/20
            </button>
          </div>
        </div>

        {/* Main Balance Display */}
        <div className="relative z-10 text-center sm:text-left my-4 sm:my-6 space-y-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-orange-200/90 block">
            Patrimônio Líquido Total
          </span>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 justify-center sm:justify-start">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">
              {formatCurrency(totalWealth)}
            </h1>
            <div className="inline-flex items-center gap-1 self-center sm:self-auto px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-orange-100 border border-white/15">
              <TrendingUp className="w-3.5 h-3.5 text-orange-300" />
              <span>{savingsRate >= 0 ? `+${savingsRate.toFixed(1)}%` : `${savingsRate.toFixed(1)}%`} taxa de poupança</span>
            </div>
          </div>
        </div>

        {/* Stacked Cards Preview & Floating Details */}
        <div className="relative z-10 pt-2 pb-4">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div>
              <span className="text-[10px] uppercase font-semibold text-orange-200/70 block">
                Entradas
              </span>
              <p className="text-sm sm:text-base font-bold text-white mt-0.5">
                +{formatCurrency(monthlyCashFlow.income)}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-orange-200/70 block">
                Despesas
              </span>
              <p className="text-sm sm:text-base font-bold text-rose-200 mt-0.5">
                -{formatCurrency(monthlyCashFlow.expenses)}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-orange-200/70 block">
                Investido
              </span>
              <p className="text-sm sm:text-base font-bold text-orange-300 mt-0.5">
                {formatCurrency(monthlyCashFlow.investments)}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-orange-200/70 block">
                Segurança
              </span>
              <p className="text-sm sm:text-base font-bold text-emerald-300 mt-0.5">
                {monthsOfSafety} meses
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Pill Buttons */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white text-slate-950 hover:bg-orange-50 font-bold text-xs shadow-lg hover:scale-[1.02] transition-all"
          >
            <Plus className="w-4 h-4 text-[#f74603]" />
            <span>+ Lançamento</span>
          </button>

          <button
            onClick={() => onNavigate('investments')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-black/40 hover:bg-black/60 text-white font-semibold text-xs border border-white/15 backdrop-blur-md hover:scale-[1.02] transition-all"
          >
            <PiggyBank className="w-4 h-4 text-orange-400" />
            <span>Investimentos</span>
          </button>

          <button
            onClick={() => onNavigate('accounts')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-black/40 hover:bg-black/60 text-white font-semibold text-xs border border-white/15 backdrop-blur-md hover:scale-[1.02] transition-all"
          >
            <CreditCard className="w-4 h-4 text-amber-400" />
            <span>Contas & Dívidas</span>
          </button>

          <button
            onClick={() => onNavigate('transactions')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-black/40 hover:bg-black/60 text-white font-semibold text-xs border border-white/15 backdrop-blur-md hover:scale-[1.02] transition-all"
          >
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>Extrato</span>
          </button>
        </div>
      </div>

      {/* 2. Key Pillars Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Reserva de Emergência */}
        <div
          onClick={() => onNavigate('investments')}
          className="bg-[#141112] hover:bg-[#1a1617] rounded-3xl p-5 border border-white/10 hover:border-orange-500/30 shadow-xl cursor-pointer transition-all group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#a7a7a7]">
              Reserva de Emergência
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-extrabold text-white tracking-tight">
              {formatCurrency(emergencyReserve)}
            </p>
            <span className="text-xs text-[#a7a7a7] font-medium">
              / {formatCurrency(targetEmergencyGoal)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${reservePercent}%` }}
            />
          </div>
          <p className="text-[11px] text-emerald-400 font-medium mt-2.5 flex items-center justify-between">
            <span>{reservePercent.toFixed(0)}% concluído</span>
            <span><strong>{monthsOfSafety} meses</strong> protegidos</span>
          </p>
        </div>

        {/* Card 2: Quanto Posso Gastar (Lazer Sem Culpa) */}
        <div
          onClick={() => onNavigate('goals')}
          className="bg-[#141112] hover:bg-[#1a1617] rounded-3xl p-5 border border-white/10 hover:border-orange-500/30 shadow-xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#a7a7a7]">
              Lazer Sem Culpa
            </span>
            <div className="w-9 h-9 rounded-2xl bg-[#f74603]/15 text-[#f74603] border border-[#f74603]/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white tracking-tight mt-1">
            {formatCurrency(Math.max(0, budget503020.leisure.remainingAmount))}
          </p>
          <div className="flex items-center justify-between text-[11px] text-[#a7a7a7] mt-2">
            <span>Orçamento: {formatCurrency(budget503020.leisure.targetAmount)}</span>
            <span>Gasto: {formatCurrency(budget503020.leisure.spentAmount)}</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full mt-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                budget503020.leisure.percentUsed > 90 ? 'bg-rose-500' : 'bg-[#f74603]'
              }`}
              style={{ width: `${Math.min(100, budget503020.leisure.percentUsed)}%` }}
            />
          </div>
        </div>

        {/* Card 3: Investimentos Aportados */}
        <div
          onClick={() => onNavigate('investments')}
          className="bg-[#141112] hover:bg-[#1a1617] rounded-3xl p-5 border border-white/10 hover:border-orange-500/30 shadow-xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#a7a7a7]">
              Investido no Mês
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white tracking-tight mt-1">
            {formatCurrency(monthlyCashFlow.investments)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-[#a7a7a7] mt-2">
            <span>{formatPercent(monthlyCashFlow.investmentRate, 1)} da renda</span>
            <span className="text-amber-400 font-semibold">Meta 50/30/20: 20%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full mt-2.5 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (monthlyCashFlow.investmentRate / 20) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Evolução do Patrimônio Líquido */}
      <NetWorthLineChartWidget />

      {/* 4. Indicador Principal — Liberdade Financeira */}
      <FinancialFreedomWidget />

      {/* 5. Calendário de Próximos Compromissos & Fluxo de Caixa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingCalendarWidget />
        <CashFlowChartWidget />
      </div>

      {/* 6. Projeção da Reserva */}
      <ReserveProjectionWidget />

      {/* 7. Quitação de Dívidas & Financiamentos */}
      <DebtsPayoffWidget />
    </div>
  );
};
