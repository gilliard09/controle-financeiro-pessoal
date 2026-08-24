import React, { useState, useEffect } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Check,
  CreditCard,
  Plus,
  Sparkles,
  Tag,
  TrendingUp,
  X,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { RecurrenceType, Transaction, TransactionStatus, TransactionType } from '../../types';
import { formatCurrency, parseCurrencyInput } from '../../utils/formatters';

interface QuickTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TransactionType;
  editingTransaction?: Transaction | null;
}

export const QuickTransactionModal: React.FC<QuickTransactionModalProps> = ({
  isOpen,
  onClose,
  initialType = 'expense',
  editingTransaction = null,
}) => {
  const {
    categories,
    accounts,
    investments,
    addTransaction,
    updateTransaction,
  } = useFinance();

  const [type, setType] = useState<TransactionType>(initialType);
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('single');
  const [status, setStatus] = useState<TransactionStatus>('paid');
  const [notes, setNotes] = useState('');
  const [investmentId, setInvestmentId] = useState('');

  // Reset or initialize state on open
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setDescription(editingTransaction.description);
      setAmountStr(editingTransaction.amount.toString().replace('.', ','));
      setDate(editingTransaction.date.split('T')[0]);
      setCategoryId(editingTransaction.categoryId);
      setAccountId(editingTransaction.accountId);
      setRecurrence(editingTransaction.recurrence);
      setStatus(editingTransaction.status);
      setNotes(editingTransaction.notes || '');
      setInvestmentId(editingTransaction.investmentId || '');
    } else {
      setType(initialType);
      setDescription('');
      setAmountStr('');
      setDate(new Date().toISOString().split('T')[0]);
      setRecurrence('single');
      setStatus('paid');
      setNotes('');
      setInvestmentId('');

      // Pick reasonable default category
      const filteredCats = categories.filter((c) =>
        initialType === 'income' ? c.type === 'income' : c.type === 'expense'
      );
      if (filteredCats.length > 0) {
        setCategoryId(filteredCats[0].id);
      }
      if (accounts.length > 0) {
        setAccountId(accounts[0].id);
      }
    }
  }, [isOpen, initialType, editingTransaction, categories, accounts]);

  // Update default category when type changes
  useEffect(() => {
    if (!editingTransaction) {
      const filtered = categories.filter((c) =>
        type === 'income' ? c.type === 'income' : c.type === 'expense'
      );
      if (filtered.length > 0 && !filtered.some((c) => c.id === categoryId)) {
        setCategoryId(filtered[0].id);
      }
    }
  }, [type, categories, editingTransaction, categoryId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseCurrencyInput(amountStr);

    if (!description.trim() || parsedAmount <= 0) {
      return;
    }

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        type,
        description: description.trim(),
        amount: parsedAmount,
        date,
        categoryId: categoryId || categories[0]?.id || 'cat-outros',
        accountId: accountId || accounts[0]?.id || 'acc-nubank',
        recurrence,
        status,
        notes: notes.trim() || undefined,
        investmentId: type === 'investment' ? investmentId : undefined,
      });
    } else {
      addTransaction({
        type,
        description: description.trim(),
        amount: parsedAmount,
        date,
        categoryId: categoryId || categories[0]?.id || 'cat-outros',
        accountId: accountId || accounts[0]?.id || 'acc-nubank',
        recurrence,
        status,
        notes: notes.trim() || undefined,
        investmentId: type === 'investment' ? investmentId : undefined,
      });
    }

    onClose();
  };

  const relevantCategories = categories.filter((c) => {
    if (type === 'income') return c.type === 'income';
    return c.type === 'expense';
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#141112] w-full max-w-md rounded-3xl shadow-2xl border border-white/15 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                type === 'expense'
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/20'
                  : type === 'income'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                  : 'bg-[#f74603]/15 text-[#f74603] border-[#f74603]/20'
              }`}
            >
              {type === 'expense' ? (
                <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
              ) : type === 'income' ? (
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <TrendingUp className="w-4 h-4 stroke-[2.5]" />
              )}
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              {editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento Rápido'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#a7a7a7] hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-2 bg-black/40 border-b border-white/10">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 text-xs rounded-xl transition-all font-bold ${
              type === 'expense'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-[#a7a7a7] hover:text-white'
            }`}
          >
            Despesa
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 text-xs rounded-xl transition-all font-bold ${
              type === 'income'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-[#a7a7a7] hover:text-white'
            }`}
          >
            Entrada
          </button>
          <button
            type="button"
            onClick={() => setType('investment')}
            className={`py-2 text-xs rounded-xl transition-all font-bold ${
              type === 'investment'
                ? 'bg-[#f74603] text-white shadow-md glow-orange-sm'
                : 'text-[#a7a7a7] hover:text-white'
            }`}
          >
            Investimento
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-[11px] font-semibold text-[#a7a7a7] mb-1">
              Valor
            </label>
            <div className="relative rounded-2xl border border-white/15 bg-black/40 focus-within:border-[#f74603] focus-within:ring-2 focus-within:ring-[#f74603]/20 transition-all">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#a7a7a7]">
                R$
              </span>
              <input
                type="text"
                required
                autoFocus
                placeholder="0,00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-transparent text-xl font-extrabold text-white placeholder:text-white/20 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-[#a7a7a7] mb-1">
              Descrição
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Supermercado, Salário, Aluguel..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-white/15 bg-white/5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#f74603]"
            />
          </div>

          {/* Date & Recurrence Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#a7a7a7] mb-1">
                Data
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-white/15 bg-white/5 text-xs text-white focus:outline-none focus:border-[#f74603]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#a7a7a7] mb-1">
                Recorrência
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-white/15 bg-[#1a1617] text-xs text-white focus:outline-none focus:border-[#f74603]"
              >
                <option value="single">Única</option>
                <option value="monthly">Mensal (Recorrente)</option>
              </select>
            </div>
          </div>

          {/* Category & Account */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#a7a7a7] mb-1">
                Categoria
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-white/15 bg-[#1a1617] text-xs text-white focus:outline-none focus:border-[#f74603] truncate"
              >
                {relevantCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#a7a7a7] mb-1">
                Conta / Meio
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-white/15 bg-[#1a1617] text-xs text-white focus:outline-none focus:border-[#f74603] truncate"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.institution})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* If investment, select destination investment asset */}
          {type === 'investment' && (
            <div>
              <label className="block text-[11px] font-semibold text-[#a7a7a7] mb-1">
                Vincular ao Investimento / Ativo
              </label>
              <select
                value={investmentId}
                onChange={(e) => setInvestmentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-white/15 bg-[#1a1617] text-xs text-white focus:outline-none focus:border-[#f74603]"
              >
                <option value="">Aporte Avulso / Não vinculado</option>
                {investments.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.name} ({inv.institution}) {inv.isEmergencyReserve ? '⭐ Reserva' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Selector */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/10">
            <span className="text-xs font-semibold text-[#a7a7a7]">
              Status do Lançamento:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStatus('paid')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  status === 'paid'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-[#a7a7a7] hover:bg-white/10'
                }`}
              >
                {type === 'income' ? 'Recebido' : 'Pago'}
              </button>
              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  status === 'pending'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-[#a7a7a7] hover:bg-white/10'
                }`}
              >
                Pendente
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-[#a7a7a7] hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#f74603] hover:bg-[#e85002] active:scale-95 text-white text-xs font-bold shadow-lg glow-orange-sm transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{editingTransaction ? 'Salvar Alterações' : 'Registrar Lançamento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

