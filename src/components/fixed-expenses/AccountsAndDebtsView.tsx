import React, { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  CreditCard,
  Edit2,
  PartyPopper,
  Plus,
  ShieldAlert,
  Sparkles,
  Trash2,
  Zap,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { FixedExpense, RecurrenceType } from '../../types';
import { formatCurrency, parseCurrencyInput } from '../../utils/formatters';

export const AccountsAndDebtsView: React.FC = () => {
  const {
    fixedExpenses,
    categories,
    accounts,
    addFixedExpense,
    updateFixedExpense,
    deleteFixedExpense,
    payDebtInstallment,
    debtsSummary,
  } = useFinance();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [dueDay, setDueDay] = useState(10);
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-contas');
  const [accountId, setAccountId] = useState(accounts[0]?.id || 'acc-nubank');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('monthly');
  const [active, setActive] = useState(true);
  const [isDebt, setIsDebt] = useState(false);
  const [totalInstallments, setTotalInstallments] = useState(12);
  const [currentInstallment, setCurrentInstallment] = useState(1);
  const [notes, setNotes] = useState('');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Totals calculations
  const totalActiveFixed = fixedExpenses
    .filter((e) => e.active && !e.completed)
    .reduce((sum, e) => sum + e.amount, 0);

  // Post-credit payoff simulation total (without temporary debts)
  const totalAfterEndingDebts = fixedExpenses
    .filter((e) => e.active && !e.completed && (!e.isDebt || (e.totalInstallments || 1) - (e.currentInstallment || 0) > 2))
    .reduce((sum, e) => sum + e.amount, 0);

  const openNewModal = () => {
    setEditingExpense(null);
    setName('');
    setAmountStr('');
    setDueDay(10);
    setCategoryId(categories[0]?.id || 'cat-contas');
    setAccountId(accounts[0]?.id || 'acc-nubank');
    setRecurrence('monthly');
    setActive(true);
    setIsDebt(false);
    setTotalInstallments(12);
    setCurrentInstallment(1);
    setNotes('');
    setShowAddModal(true);
  };

  const openEditModal = (exp: FixedExpense) => {
    setEditingExpense(exp);
    setName(exp.name);
    setAmountStr(exp.amount.toString().replace('.', ','));
    setDueDay(exp.dueDay);
    setCategoryId(exp.categoryId);
    setAccountId(exp.accountId);
    setRecurrence(exp.recurrence);
    setActive(exp.active);
    setIsDebt(!!exp.isDebt);
    setTotalInstallments(exp.totalInstallments || 12);
    setCurrentInstallment(exp.currentInstallment || 1);
    setNotes(exp.notes || '');
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseCurrencyInput(amountStr);
    if (!name.trim() || parsedAmount <= 0) return;

    if (editingExpense) {
      updateFixedExpense(editingExpense.id, {
        name: name.trim(),
        amount: parsedAmount,
        dueDay: Number(dueDay),
        categoryId,
        accountId,
        recurrence,
        active,
        isDebt,
        totalInstallments: isDebt ? Number(totalInstallments) : undefined,
        currentInstallment: isDebt ? Number(currentInstallment) : undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      addFixedExpense({
        name: name.trim(),
        amount: parsedAmount,
        dueDay: Number(dueDay),
        categoryId,
        accountId,
        recurrence,
        active,
        isDebt,
        totalInstallments: isDebt ? Number(totalInstallments) : undefined,
        currentInstallment: isDebt ? Number(currentInstallment) : undefined,
        notes: notes.trim() || undefined,
      });
    }

    setShowAddModal(false);
  };

  const regularExpenses = fixedExpenses.filter((e) => !e.isDebt);
  const debtExpenses = fixedExpenses.filter((e) => e.isDebt);

  return (
    <div className="space-y-6 pb-24 lg:pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Contas & Dívidas
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-0.5">
            Gerencie seus compromissos recorrentes e acompanhe a quitação acelerada de parcelas
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#f74603] to-[#e85002] hover:opacity-95 active:scale-95 text-white text-xs font-bold shadow-lg shadow-[#f74603]/25 glow-orange-sm self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nova Conta Fixa</span>
        </button>
      </div>

      {/* Summary Impact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#141112] p-5 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none group-hover:bg-white/10 transition-colors" />
          <span className="text-xs font-semibold text-white/50 block mb-1">
            Total Atual de Despesas Fixas
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {formatCurrency(totalActiveFixed)}
          </p>
          <span className="text-[11px] text-white/40 mt-1.5 block">
            Inclui moradia, serviços e financiamentos
          </span>
        </div>

        <div className="bg-[#141112] p-5 rounded-3xl border border-emerald-500/30 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-colors" />
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-emerald-400">
              Após Término do Crédito Pessoal
            </span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">
            {formatCurrency(totalAfterEndingDebts)}
          </p>
          <span className="text-[11px] text-emerald-400/80 mt-1.5 block font-semibold">
            Redução definitiva no seu custo de vida!
          </span>
        </div>

        <div className="bg-[#141112] p-5 rounded-3xl border border-[#f74603]/30 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#f74603]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[#f74603]/20 transition-colors" />
          <span className="text-xs font-bold text-[#f74603] block mb-1">
            Dinheiro Liberado pós Quitações
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#f74603] to-[#ff7d45] tracking-tight">
            +{formatCurrency(debtsSummary.totalReleasedAfterAllDebts)}/mês
          </p>
          <span className="text-[11px] text-white/40 mt-1.5 block">
            Valor mensal que será direcionado a investimentos
          </span>
        </div>
      </div>

      {/* 1. Dívidas & Financiamentos com Parcelas Restantes */}
      <div className="bg-[#141112] rounded-3xl p-5 sm:p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[#f74603]/15 text-[#f74603] border border-[#f74603]/25">
              <CreditCard className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Financiamentos & Dívidas Parceladas
              </h3>
              <p className="text-xs text-white/40">
                O sistema encerra a cobrança automaticamente ao atingir a última parcela
              </p>
            </div>
          </div>
        </div>

        {debtExpenses.length === 0 ? (
          <p className="text-xs text-white/40 text-center py-8">
            Nenhuma dívida cadastrada no momento.
          </p>
        ) : (
          <div className="space-y-3">
            {debtExpenses.map((debt) => {
              const totalInst = debt.totalInstallments || 1;
              const currentInst = debt.currentInstallment || 0;
              const remaining = Math.max(0, totalInst - currentInst);
              const isCompleted = debt.completed || currentInst >= totalInst;
              const isLast = remaining === 1;

              return (
                <div
                  key={debt.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
                    isCompleted
                      ? 'bg-emerald-500/5 border-emerald-500/30'
                      : isLast
                      ? 'bg-[#241712] border-[#f74603]/40 shadow-[0_0_20px_rgba(247,70,3,0.15)]'
                      : 'bg-[#181415] hover:bg-[#1c181a] border-white/5'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-bold text-white">
                          {debt.name}
                        </span>
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <PartyPopper className="w-3 h-3" /> Quitado!
                          </span>
                        ) : isLast ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#f74603]/20 text-[#f74603] border border-[#f74603]/40 animate-pulse">
                            🎉 Última Parcela!
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-white/50 mt-0.5">
                        Parcela mensal: <strong className="text-white font-bold">{formatCurrency(debt.amount)}</strong> • Vencimento: Dia {debt.dueDay}
                      </p>
                      {debt.notes && (
                        <p className="text-[11px] text-emerald-400 mt-1">
                          {debt.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="text-right mr-1">
                        <span className="text-xs sm:text-sm font-extrabold text-white block">
                          {currentInst} / {totalInst} parcelas
                        </span>
                        <span className="text-[11px] text-white/40 font-medium">
                          {isCompleted ? 'Finalizado' : `Restam ${remaining} ${remaining === 1 ? 'mês' : 'meses'}`}
                        </span>
                      </div>

                      {!isCompleted && (
                        <button
                          onClick={() => payDebtInstallment(debt.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all ${
                            isLast
                              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white glow-emerald-sm'
                              : 'bg-gradient-to-r from-[#f74603] to-[#e85002] hover:opacity-90 text-white glow-orange-sm'
                          }`}
                        >
                          {isLast ? 'Quitar Dívida 🎉' : 'Pagar Parcela'}
                        </button>
                      )}

                      <button
                        onClick={() => openEditModal(debt)}
                        className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted
                          ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                          : isLast
                          ? 'bg-gradient-to-r from-[#f74603] to-emerald-400 shadow-[0_0_10px_rgba(247,70,3,0.5)]'
                          : 'bg-gradient-to-r from-[#f74603] to-[#ff7d45]'
                      }`}
                      style={{ width: `${Math.min(100, (currentInst / totalInst) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Contas Fixas Recorrentes (Casa, Luz, Água, Nubank, etc.) */}
      <div className="bg-[#141112] rounded-3xl p-5 sm:p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-white/5 text-[#f74603] border border-white/10">
              <Zap className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Contas & Despesas Fixas Regulares
              </h3>
              <p className="text-xs text-white/40">
                Despesas obrigatórias essenciais de moradia, contas básicas e assinaturas
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {regularExpenses.map((exp) => {
            const isDeleteConfirm = deleteConfirmId === exp.id;
            return (
              <div
                key={exp.id}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-white/5 px-3 rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-white font-bold text-xs">
                    {exp.dueDay}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-white">
                      {exp.name}
                    </p>
                    <span className="text-[11px] text-white/40">
                      Vencimento todo dia {exp.dueDay} • Mensal
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs sm:text-sm font-extrabold text-white">
                    {formatCurrency(exp.amount)}
                  </span>

                  <button
                    onClick={() => openEditModal(exp)}
                    className="p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {isDeleteConfirm ? (
                    <div className="flex items-center gap-1 bg-rose-950/80 p-1 rounded-xl border border-rose-500/40 animate-in fade-in">
                      <button
                        onClick={() => {
                          deleteFixedExpense(exp.id);
                          setDeleteConfirmId(null);
                        }}
                        className="text-[10px] font-bold text-rose-300 px-1.5 py-0.5 rounded hover:bg-rose-900"
                      >
                        Excluir?
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="text-[10px] text-white/40 px-1 py-0.5 rounded hover:bg-white/10"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(exp.id)}
                      className="p-1.5 rounded-xl text-white/40 hover:text-rose-400 hover:bg-rose-500/15 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Add / Edit Fixed Expense */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#141112] w-full max-w-md rounded-3xl shadow-2xl border border-white/15 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-extrabold text-white border-b border-white/10 pb-3 tracking-tight">
              {editingExpense ? 'Editar Conta Recorrente' : 'Cadastrar Nova Conta Fixa / Dívida'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
                  Nome da Conta / Despesa
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aluguel, Luz, Empréstimo..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/40 text-xs font-semibold text-white placeholder:text-white/30 focus:outline-none focus:border-[#f74603]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
                    Valor Mensal (R$)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0,00"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/40 text-xs font-extrabold text-[#f74603] placeholder:text-white/30 focus:outline-none focus:border-[#f74603]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
                    Dia de Vencimento
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={dueDay}
                    onChange={(e) => setDueDay(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/40 text-xs font-semibold text-white focus:outline-none focus:border-[#f74603]"
                  />
                </div>
              </div>

              {/* Is Debt Toggle */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isDebt}
                    onChange={(e) => setIsDebt(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#f74603]"
                  />
                  <span className="text-xs font-bold text-white">
                    É uma dívida / financiamento com parcelas limitadas?
                  </span>
                </label>

                {isDebt && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">
                        Parcela Atual
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={currentInstallment}
                        onChange={(e) => setCurrentInstallment(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#1c181a] text-xs font-bold text-white focus:outline-none focus:border-[#f74603]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">
                        Total de Parcelas
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={totalInstallments}
                        onChange={(e) => setTotalInstallments(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#1c181a] text-xs font-bold text-white focus:outline-none focus:border-[#f74603]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f74603] to-[#e85002] text-white text-xs font-bold shadow-lg shadow-[#f74603]/30 glow-orange-sm hover:opacity-95 transition-all"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
