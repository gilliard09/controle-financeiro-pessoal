import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Calendar, Check, Clock, TrendingUp } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';

interface CalendarItem {
  id: string;
  day: number;
  dateStr: string;
  name: string;
  amount: number;
  type: 'income' | 'expense' | 'investment';
  status: 'paid' | 'pending';
  categoryName?: string;
  originalId: string;
}

export const UpcomingCalendarWidget: React.FC = () => {
  const { fixedExpenses, incomeSources, transactions, selectedMonth, selectedYear, addTransaction } = useFinance();

  const currentDay = new Date().getDate();

  // Combine income sources and fixed expenses for the selected month
  const items: CalendarItem[] = [];

  incomeSources.forEach((src) => {
    if (!src.active) return;
    const day = src.receiveDay;
    const isPaid = transactions.some(
      (t) =>
        t.type === 'income' &&
        t.status === 'paid' &&
        t.description.toLowerCase().includes(src.name.toLowerCase())
    );

    items.push({
      id: `src-${src.id}`,
      day,
      dateStr: `${String(day).padStart(2, '0')}/${String(selectedMonth).padStart(2, '0')}`,
      name: src.name,
      amount: src.amount,
      type: 'income',
      status: isPaid ? 'paid' : 'pending',
      originalId: src.id,
    });
  });

  fixedExpenses.forEach((exp) => {
    if (!exp.active || exp.completed) return;
    const day = exp.dueDay;
    const isPaid = transactions.some(
      (t) =>
        t.type === 'expense' &&
        t.status === 'paid' &&
        t.description.toLowerCase().includes(exp.name.toLowerCase())
    );

    items.push({
      id: `exp-${exp.id}`,
      day,
      dateStr: `${String(day).padStart(2, '0')}/${String(selectedMonth).padStart(2, '0')}`,
      name: exp.name,
      amount: exp.amount,
      type: 'expense',
      status: isPaid ? 'paid' : 'pending',
      originalId: exp.id,
    });
  });

  // Sort chronologically by day
  items.sort((a, b) => a.day - b.day);

  const handleQuickPay = (item: CalendarItem) => {
    const yearStr = selectedYear;
    const monthStr = String(selectedMonth).padStart(2, '0');
    const dayStr = String(item.day).padStart(2, '0');
    const dateFormatted = `${yearStr}-${monthStr}-${dayStr}`;

    addTransaction({
      type: item.type,
      description: item.name,
      amount: item.amount,
      date: dateFormatted,
      categoryId: item.type === 'income' ? 'cat-salario' : 'cat-contas',
      accountId: 'acc-nubank',
      recurrence: 'monthly',
      status: 'paid',
      notes: `Registrado via Próximos Compromissos`,
    });
  };

  return (
    <div className="bg-[#141112] rounded-3xl p-5 sm:p-6 border border-white/10 shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-orange-500/10 text-[#f74603] border border-orange-500/20">
            <Calendar className="w-4 h-4" />
          </span>
          <h3 className="text-sm font-bold text-white tracking-tight">
            Próximos Compromissos
          </h3>
        </div>
        <span className="text-[11px] text-[#a7a7a7]">
          Mês {String(selectedMonth).padStart(2, '0')}/{selectedYear}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-[#a7a7a7] text-center py-6">
          Nenhum compromisso agendado para este mês.
        </p>
      ) : (
        <div className="divide-y divide-white/5 max-h-80 overflow-y-auto pr-1">
          {items.map((item) => {
            const isTodayOrPast = item.day <= currentDay;
            return (
              <div
                key={item.id}
                className="py-2.5 flex items-center justify-between gap-2 hover:bg-white/5 rounded-xl px-2 transition-colors"
              >
                {/* Date & Indicator */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold text-center shrink-0 border ${
                      item.status === 'paid'
                        ? 'bg-slate-900 text-slate-500 border-white/5'
                        : isTodayOrPast
                        ? 'bg-[#f74603]/15 text-[#f74603] border-[#f74603]/30'
                        : 'bg-white/5 text-[#d9d9d9] border-white/10'
                    }`}
                  >
                    {item.dateStr}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-white truncate">
                        {item.name}
                      </p>
                      {item.status === 'paid' && (
                        <span className="inline-flex items-center text-[10px] text-emerald-400 font-medium">
                          ✓
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#a7a7a7] capitalize">
                      {item.type === 'income' ? 'Entrada' : item.type === 'expense' ? 'Despesa Fixa' : 'Aporte'}
                    </span>
                  </div>
                </div>

                {/* Amount & Status Action */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={`text-xs font-bold ${
                      item.type === 'income'
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
                  </span>

                  {item.status === 'pending' ? (
                    <button
                      onClick={() => handleQuickPay(item)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/10 hover:bg-[#f74603] hover:text-white text-white border border-white/10 transition-all"
                      title={item.type === 'income' ? 'Confirmar recebimento' : 'Confirmar pagamento'}
                    >
                      {item.type === 'income' ? 'Receber' : 'Pagar'}
                    </button>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-500/20">
                      Concluído
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

