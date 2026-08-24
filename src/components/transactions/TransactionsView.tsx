import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  ChevronDown,
  Edit2,
  Filter,
  Plus,
  Search,
  Tag,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionStatus, TransactionType } from '../../types';
import { formatCurrency, formatDate, getMonthName } from '../../utils/formatters';

interface TransactionsViewProps {
  onOpenQuickAdd: (type?: TransactionType) => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenQuickAdd,
  onEditTransaction,
}) => {
  const {
    transactions,
    categories,
    accounts,
    deleteTransaction,
    toggleTransactionStatus,
    selectedMonth,
    selectedYear,
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);

  // Filtered list
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Date filter by default month/year unless user searches globally
      if (!searchQuery) {
        const d = new Date(tx.date.includes('T') ? tx.date : `${tx.date}T12:00:00`);
        if (d.getFullYear() !== selectedYear || d.getMonth() + 1 !== selectedMonth) {
          return false;
        }
      }

      // Search
      if (searchQuery) {
        const descMatch = tx.description.toLowerCase().includes(searchQuery.toLowerCase());
        const catName = categoryMap.get(tx.categoryId)?.name.toLowerCase() || '';
        const catMatch = catName.includes(searchQuery.toLowerCase());
        if (!descMatch && !catMatch) return false;
      }

      // Type
      if (selectedType !== 'all' && tx.type !== selectedType) {
        return false;
      }

      // Category
      if (selectedCategory !== 'all' && tx.categoryId !== selectedCategory) {
        return false;
      }

      // Status
      if (selectedStatus !== 'all' && tx.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [
    transactions,
    selectedMonth,
    selectedYear,
    searchQuery,
    selectedType,
    selectedCategory,
    selectedStatus,
    categoryMap,
  ]);

  // Summary of filtered list
  const summary = useMemo(() => {
    let income = 0;
    let expenses = 0;
    let investments = 0;

    filteredTransactions.forEach((tx) => {
      if (tx.status === 'paid') {
        if (tx.type === 'income') income += tx.amount;
        else if (tx.type === 'expense') expenses += tx.amount;
        else if (tx.type === 'investment') investments += tx.amount;
      }
    });

    return {
      income,
      expenses,
      investments,
      balance: income - (expenses + investments),
    };
  }, [filteredTransactions]);

  return (
    <div className="space-y-6 pb-24 lg:pb-12 animate-in fade-in">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Extrato de Movimentações
          </h1>
          <p className="text-xs sm:text-sm text-[#a7a7a7] mt-0.5 font-medium">
            Lançamentos de {getMonthName(selectedMonth - 1)} de {selectedYear}
          </p>
        </div>

        <button
          onClick={() => onOpenQuickAdd('expense')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f74603] hover:bg-[#e85002] active:scale-95 text-white text-xs font-bold shadow-lg glow-orange-sm self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Novo Lançamento</span>
        </button>
      </div>

      {/* Month Filter Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#141112] p-4 rounded-2xl border border-white/10 shadow-lg">
          <span className="text-[11px] text-[#a7a7a7] block font-semibold">
            Entradas
          </span>
          <span className="text-sm sm:text-base font-extrabold text-emerald-400">
            +{formatCurrency(summary.income)}
          </span>
        </div>

        <div className="bg-[#141112] p-4 rounded-2xl border border-white/10 shadow-lg">
          <span className="text-[11px] text-[#a7a7a7] block font-semibold">
            Despesas
          </span>
          <span className="text-sm sm:text-base font-extrabold text-rose-400">
            -{formatCurrency(summary.expenses)}
          </span>
        </div>

        <div className="bg-[#141112] p-4 rounded-2xl border border-white/10 shadow-lg">
          <span className="text-[11px] text-[#a7a7a7] block font-semibold">
            Investimentos
          </span>
          <span className="text-sm sm:text-base font-extrabold text-[#f74603]">
            {formatCurrency(summary.investments)}
          </span>
        </div>

        <div className="bg-[#141112] p-4 rounded-2xl border border-white/10 shadow-lg">
          <span className="text-[11px] text-[#a7a7a7] block font-semibold">
            Saldo Restante
          </span>
          <span
            className={`text-sm sm:text-base font-extrabold ${
              summary.balance >= 0 ? 'text-white' : 'text-rose-400'
            }`}
          >
            {formatCurrency(summary.balance)}
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#141112] rounded-2xl p-4 border border-white/10 shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-[#a7a7a7] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por descrição ou categoria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-black/40 rounded-xl border border-white/10 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#f74603]"
            />
          </div>

          {/* Quick Filter Selects */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {/* Type */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2.5 bg-black/40 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-[#f74603]"
            >
              <option value="all">Todos os Tipos</option>
              <option value="expense">Despesas</option>
              <option value="income">Entradas</option>
              <option value="investment">Investimentos</option>
            </select>

            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 bg-black/40 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-[#f74603] max-w-[140px] truncate"
            >
              <option value="all">Todas Categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2.5 bg-black/40 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-[#f74603]"
            >
              <option value="all">Todos Status</option>
              <option value="paid">Pagos / Recebidos</option>
              <option value="pending">Pendentes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-[#141112] rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 text-[#a7a7a7] flex items-center justify-center mx-auto mb-3 border border-white/10">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-white">
              Nenhuma movimentação encontrada
            </p>
            <p className="text-xs text-[#a7a7a7] mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'Tente ajustar os filtros de busca para encontrar o que procura.'
                : 'Clique no botão abaixo para adicionar sua primeira movimentação neste mês.'}
            </p>
            <button
              onClick={() => onOpenQuickAdd('expense')}
              className="mt-4 px-4 py-2 rounded-xl bg-[#f74603] hover:bg-[#e85002] text-white text-xs font-bold shadow-md glow-orange-sm"
            >
              Adicionar Lançamento
            </button>
          </div>
        ) : (
          <motion.div layout className="divide-y divide-white/5">
            <AnimatePresence initial={false}>
              {filteredTransactions.map((tx) => {
                const cat = categoryMap.get(tx.categoryId);
                const acc = accountMap.get(tx.accountId);
                const isDeleteConfirm = deleteConfirmId === tx.id;

                return (
                  <motion.div
                    layout
                    key={tx.id}
                    initial={{ opacity: 0, y: -20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{
                      opacity: 0,
                      x: -32,
                      scale: 0.95,
                      height: 0,
                      paddingTop: 0,
                      paddingBottom: 0,
                      transition: { duration: 0.25, ease: 'easeInOut' },
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 32,
                      mass: 0.8,
                    }}
                    className="p-4 sm:px-6 flex items-center justify-between gap-3 hover:bg-white/5 transition-colors overflow-hidden"
                  >
                    {/* Left: Icon & Description */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                          tx.type === 'income'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                            : tx.type === 'investment'
                            ? 'bg-[#f74603]/15 text-[#f74603] border-[#f74603]/20'
                            : 'bg-rose-500/15 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {tx.type === 'income' ? (
                          <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                        ) : tx.type === 'investment' ? (
                          <TrendingUp className="w-5 h-5 stroke-[2.5]" />
                        ) : (
                          <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-white truncate">
                          {tx.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#a7a7a7] mt-0.5">
                          <span>{formatDate(tx.date)}</span>
                          <span>•</span>
                          <span className="font-semibold text-white/80">
                            {cat?.name || 'Sem Categoria'}
                          </span>
                          {acc && (
                            <>
                              <span>•</span>
                              <span>{acc.name}</span>
                            </>
                          )}
                          {tx.recurrence === 'monthly' && (
                            <span className="px-1.5 py-0.2 rounded bg-white/10 text-[10px] font-bold text-white/90">
                              Mensal
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount, Status toggle, Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p
                          className={`text-xs sm:text-sm font-extrabold ${
                            tx.type === 'income'
                              ? 'text-emerald-400'
                              : tx.type === 'investment'
                              ? 'text-[#f74603]'
                              : 'text-white'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                        </p>
                        <button
                          onClick={() => toggleTransactionStatus(tx.id)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all ${
                            tx.status === 'paid'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                          }`}
                          title="Clique para alternar status"
                        >
                          {tx.status === 'paid' ? (tx.type === 'income' ? 'Recebido' : 'Pago') : 'Pendente'}
                        </button>
                      </div>

                      {/* Edit & Delete Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          className="p-1.5 rounded-xl text-[#a7a7a7] hover:text-white hover:bg-white/10 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {isDeleteConfirm ? (
                          <div className="flex items-center gap-1 bg-rose-950/80 p-1 rounded-xl border border-rose-500/40 animate-in fade-in">
                            <button
                              onClick={() => {
                                deleteTransaction(tx.id);
                                setDeleteConfirmId(null);
                              }}
                              className="text-[10px] font-bold text-rose-300 px-1.5 py-0.5 rounded hover:bg-rose-900"
                            >
                              Excluir?
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-[10px] text-[#a7a7a7] px-1 py-0.5 rounded hover:bg-white/10"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(tx.id)}
                            className="p-1.5 rounded-xl text-[#a7a7a7] hover:text-rose-400 hover:bg-rose-500/15 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

