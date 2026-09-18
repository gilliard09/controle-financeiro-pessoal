import React, { useMemo } from 'react';
import { ArrowDownLeft, ArrowUpRight, Calendar, ChevronRight, CreditCard, Loader2, Plus, TrendingUp, Wallet } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, getGreeting, getMonthName } from '../../utils/formatters';
import { TransactionType } from '../../types';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenQuickAdd: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenQuickAdd }) => {
  const { user } = useAuth();
  const {
    accounts,
    transactions,
    fixedExpenses,
    monthlyCashFlow,
    selectedMonth,
    selectedYear,
    isDataLoading,
  } = useFinance();

  const accountBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + (Number(account.balance) || 0), 0),
    [accounts]
  );

  const monthTransactions = useMemo(
    () =>
      transactions.filter((tx) => {
        const d = new Date(tx.date.includes('T') ? tx.date : `${tx.date}T12:00:00`);
        return d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth;
      }),
    [transactions, selectedMonth, selectedYear]
  );

  const latestTransactions = useMemo(
    () =>
      [...monthTransactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 6),
    [monthTransactions]
  );

  const activeBills = useMemo(
    () => fixedExpenses.filter((expense) => expense.active && !expense.completed),
    [fixedExpenses]
  );

  const paidBills = useMemo(() => {
    return activeBills.filter((expense) =>
      monthTransactions.some(
        (tx) =>
          tx.status === 'paid' &&
          tx.type === 'expense' &&
          (tx.fixedExpenseId === expense.id || tx.description.trim().toLowerCase() === expense.name.trim().toLowerCase())
      )
    );
  }, [activeBills, monthTransactions]);

  if (isDataLoading) {
    return (
      <div className="min-h-[55vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#f74603] animate-spin" />
      </div>
    );
  }

  const formatAmount = (type: TransactionType, amount: number) =>
    type === 'income' ? `+${formatCurrency(amount)}` : `-${formatCurrency(amount)}`;

  return (
    <div className="space-y-5 pb-24 lg:pb-12 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/45">{getGreeting(user?.name || 'Usuário')}</p>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Visão geral</h1>
          <p className="text-xs text-white/40 mt-0.5">
            {getMonthName(selectedMonth - 1)} de {selectedYear}
          </p>
        </div>
        <button
          onClick={onOpenQuickAdd}
          className="w-11 h-11 rounded-2xl bg-[#f74603] text-white flex items-center justify-center shadow-lg shadow-[#f74603]/20 active:scale-95 transition-transform"
          aria-label="Novo lançamento"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Saldo em contas */}
      <section className="rounded-3xl bg-[#141112] border border-white/10 p-5 shadow-xl">
        <span className="text-[11px] uppercase tracking-wider font-bold text-white/40">Saldo em contas</span>
        <p className="text-3xl sm:text-4xl font-extrabold text-white mt-1 tracking-tight">
          {formatCurrency(accountBalance)}
        </p>
        <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-white/10">
          <div>
            <span className="text-[10px] uppercase font-bold text-white/35">Entradas</span>
            <p className="text-sm font-bold text-emerald-400 mt-1">+{formatCurrency(monthlyCashFlow.income)}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-white/35">Despesas</span>
            <p className="text-sm font-bold text-rose-400 mt-1">-{formatCurrency(monthlyCashFlow.expenses)}</p>
          </div>
        </div>
      </section>

      {/* Últimos lançamentos */}
      <section className="rounded-3xl bg-[#141112] border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <h2 className="text-sm font-bold text-white">Últimos lançamentos</h2>
            <p className="text-[11px] text-white/35 mt-0.5">Movimentações deste mês</p>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-[11px] font-bold text-[#f74603] flex items-center gap-1"
          >
            Ver todas <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {latestTransactions.length === 0 ? (
          <div className="py-10 text-center px-5">
            <Wallet className="w-6 h-6 mx-auto text-white/20 mb-2" />
            <p className="text-xs text-white/40">Nenhum lançamento neste mês.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {latestTransactions.map((tx) => (
              <button
                key={tx.id}
                onClick={() => onNavigate('transactions')}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-white/[0.03] transition-colors"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  tx.type === 'income'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : tx.type === 'investment'
                    ? 'bg-[#f74603]/10 text-[#f74603]'
                    : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> :
                   tx.type === 'investment' ? <TrendingUp className="w-4 h-4" /> :
                   <ArrowDownLeft className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{tx.description}</p>
                  <p className="text-[10px] text-white/35 mt-0.5">{formatDate(tx.date)}</p>
                </div>
                <span className={`text-xs font-extrabold shrink-0 ${
                  tx.type === 'income' ? 'text-emerald-400' : tx.type === 'investment' ? 'text-[#f74603]' : 'text-rose-400'
                }`}>
                  {formatAmount(tx.type, tx.amount)}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Contas do mês */}
      <section className="rounded-3xl bg-[#141112] border border-white/10 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-4 h-4 text-[#f74603]" />
            <div>
              <h2 className="text-sm font-bold text-white">Contas do mês</h2>
              <p className="text-[11px] text-white/35 mt-0.5">{paidBills.length} de {activeBills.length} pagas</p>
            </div>
          </div>
          <button onClick={() => onNavigate('accounts')} className="text-[#f74603]">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-[#f74603] rounded-full transition-all"
            style={{ width: `${activeBills.length ? (paidBills.length / activeBills.length) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-white/35 mt-2">
          <span>{paidBills.length} pagas</span>
          <span>{Math.max(0, activeBills.length - paidBills.length)} pendentes</span>
        </div>
      </section>

      <button
        onClick={() => onNavigate('investments')}
        className="w-full flex items-center justify-between rounded-3xl bg-[#141112] border border-white/10 p-5 text-left hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f74603]/10 text-[#f74603] flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Investimentos</p>
            <p className="text-[11px] text-white/35 mt-0.5">Acompanhe sua carteira e reserva</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-white/30" />
      </button>
    </div>
  );
};
