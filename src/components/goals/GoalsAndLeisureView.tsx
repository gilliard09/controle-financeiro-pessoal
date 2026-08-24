import React, { useState } from 'react';
import {
  Car,
  CheckCircle2,
  Edit2,
  Laptop,
  PartyPopper,
  Plane,
  Plus,
  ShieldCheck,
  Smile,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { FinancialGoal } from '../../types';
import { formatCurrency, formatDate, formatPercent, parseCurrencyInput } from '../../utils/formatters';

interface GoalsAndLeisureViewProps {
  onOpenQuickAdd: () => void;
}

export const GoalsAndLeisureView: React.FC<GoalsAndLeisureViewProps> = ({ onOpenQuickAdd }) => {
  const {
    goals,
    budget503020,
    emergencyReserve,
    addGoal,
    updateGoal,
    deleteGoal,
    triggerConfetti,
  } = useFinance();

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);

  const [name, setName] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [currentAmountStr, setCurrentAmountStr] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('Sonhos');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#059669');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Leisure bucket from 50/30/20
  const leisure = budget503020.leisure;

  const openNewGoal = () => {
    setEditingGoal(null);
    setName('');
    setTargetAmountStr('');
    setCurrentAmountStr('');
    setDeadline('');
    setCategory('Projetos');
    setDescription('');
    setColor('#059669');
    setShowGoalModal(true);
  };

  const openEditGoal = (g: FinancialGoal) => {
    setEditingGoal(g);
    setName(g.name);
    setTargetAmountStr(g.targetAmount.toString().replace('.', ','));
    setCurrentAmountStr(g.currentAmount.toString().replace('.', ','));
    setDeadline(g.deadline || '');
    setCategory(g.category);
    setDescription(g.description || '');
    setColor(g.color);
    setShowGoalModal(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseCurrencyInput(targetAmountStr);
    const current = parseCurrencyInput(currentAmountStr);

    if (!name.trim() || target <= 0) return;

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        name: name.trim(),
        targetAmount: target,
        currentAmount: current,
        deadline: deadline || undefined,
        category,
        description: description.trim() || undefined,
        color,
      });
    } else {
      addGoal({
        name: name.trim(),
        targetAmount: target,
        currentAmount: current,
        deadline: deadline || undefined,
        category,
        description: description.trim() || undefined,
        color,
      });
      triggerConfetti();
    }

    setShowGoalModal(false);
  };

  const handleDepositToGoal = (goal: FinancialGoal) => {
    const amountToAdd = 500; // standard quick deposit increment
    const updated = Math.min(goal.targetAmount, goal.currentAmount + amountToAdd);
    updateGoal(goal.id, { currentAmount: updated });
    triggerConfetti();
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-12">
      {/* 1. Lazer Sem Culpa Banner (Atmospheric Molten Orange Glow) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#240e0a] via-[#180f10] to-[#120f10] border border-orange-500/25 p-5 sm:p-7 shadow-2xl glow-orange-sm text-white">
        {/* Subtle decorative glow */}
        <div className="absolute -right-12 -top-12 w-56 h-56 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-red-900/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange shadow-[0_0_12px_rgba(247,70,3,0.3)]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                Lazer Sem Culpa
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-brand-orange/20 text-orange-200 border border-brand-orange/30">
                Regra 30%
              </span>
            </div>
            <p className="text-xs text-orange-100/70 leading-relaxed font-medium">
              Aproveite seu dinheiro com restaurantes, viagens e passeios com tranquilidade e sem culpa, desde que permaneça dentro da sua cota mensal planejada.
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg self-start md:self-auto shrink-0">
            <div>
              <span className="text-[10px] uppercase font-bold text-orange-200/60 block tracking-wider">
                Disponível
              </span>
              <span className="text-sm sm:text-base font-extrabold text-white">
                {formatCurrency(leisure.targetAmount)}
              </span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <span className="text-[10px] uppercase font-bold text-orange-200/60 block tracking-wider">
                Utilizado
              </span>
              <span className="text-sm sm:text-base font-extrabold text-rose-300">
                {formatCurrency(leisure.spentAmount)}
              </span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                Restante
              </span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-400">
                {formatCurrency(Math.max(0, leisure.remainingAmount))}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative z-10 mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-orange-200/70">
            <span>Consumo do Balde de Lazer</span>
            <span className={leisure.percentUsed > 90 ? 'text-rose-300 font-bold' : 'text-brand-orange font-bold'}>
              {leisure.percentUsed.toFixed(0)}% utilizado
            </span>
          </div>
          <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                leisure.percentUsed > 90
                  ? 'bg-gradient-to-r from-rose-500 to-red-600 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                  : 'bg-gradient-to-r from-amber-500 to-[#f74603] shadow-[0_0_10px_rgba(247,70,3,0.5)]'
              }`}
              style={{ width: `${Math.min(100, leisure.percentUsed)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Metas Financeiras */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            Metas & Objetivos Financeiros
          </h2>
          <p className="text-xs sm:text-sm text-white/50 mt-0.5 font-medium">
            Acompanhe o progresso e realize cada um dos seus projetos e conquistas
          </p>
        </div>

        <button
          onClick={openNewGoal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#f74603] to-[#e85002] hover:from-[#e85002] hover:to-[#d03d00] text-white text-xs font-bold shadow-[0_0_20px_rgba(247,70,3,0.35)] self-start sm:self-auto transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Meta</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((g) => {
          const currentVal = g.name.toLowerCase().includes('reserva') ? emergencyReserve : g.currentAmount;
          const progressPercent = Math.min(100, (currentVal / g.targetAmount) * 100);
          const isCompleted = currentVal >= g.targetAmount;
          const remaining = Math.max(0, g.targetAmount - currentVal);
          const isDeleteConfirm = deleteConfirmId === g.id;

          return (
            <div
              key={g.id}
              className={`bg-[#141112] hover:bg-[#181415] rounded-2xl p-5 border transition-all duration-200 shadow-lg ${
                isCompleted
                  ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                  : 'border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 font-bold shadow-md"
                    style={{ backgroundColor: g.color || '#f74603' }}
                  >
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {g.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-semibold text-white/50 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                        {g.category}
                      </span>
                      {g.deadline && (
                        <span className="text-[10px] text-white/40 font-medium">
                          Prazo: {formatDate(g.deadline)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditGoal(g)}
                    className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {isDeleteConfirm ? (
                    <div className="flex items-center gap-1 bg-rose-500/15 p-1 rounded-lg border border-rose-500/30">
                      <button
                        onClick={() => {
                          deleteGoal(g.id);
                          setDeleteConfirmId(null);
                        }}
                        className="text-[10px] font-bold text-rose-400 px-1.5 py-0.5"
                      >
                        Excluir?
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="text-[10px] text-white/50 px-1"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(g.id)}
                      className="p-2 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {g.description && (
                <p className="text-xs text-white/60 mb-3 leading-relaxed">
                  {g.description}
                </p>
              )}

              {/* Progress & Values */}
              <div className="space-y-2 mb-3 bg-[#1c181a] p-3 rounded-xl border border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-white">
                    {formatCurrency(currentVal)}
                  </span>
                  <span className="text-white/40 font-medium">
                    de {formatCurrency(g.targetAmount)} ({formatPercent(progressPercent, 0)})
                  </span>
                </div>

                <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: g.color || '#f74603',
                      boxShadow: `0 0 10px ${g.color || '#f74603'}60`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                <span className="text-[11px] font-medium text-white/50">
                  {isCompleted ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Meta Concluída!
                    </span>
                  ) : (
                    `Faltam ${formatCurrency(remaining)}`
                  )}
                </span>

                {!isCompleted && !g.name.toLowerCase().includes('reserva') && (
                  <button
                    onClick={() => handleDepositToGoal(g)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-white/5 hover:bg-brand-orange/20 text-white/80 hover:text-brand-orange border border-white/10 hover:border-brand-orange/40 transition-all"
                  >
                    + Aportar R$ 500
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Goal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#141112] w-full max-w-md rounded-2xl shadow-2xl border border-white/10 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">
                {editingGoal ? 'Editar Meta Financeira' : 'Criar Nova Meta Financeira'}
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-orange px-2 py-0.5 rounded-full bg-brand-orange/15 border border-brand-orange/30">
                Objetivo
              </span>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-white/60 mb-1">
                  Nome da Meta
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Viagem de Férias, Carro Novo, Computador..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1c181a] text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-1">
                    Valor Objetivo (R$)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0,00"
                    value={targetAmountStr}
                    onChange={(e) => setTargetAmountStr(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1c181a] text-white text-xs font-bold placeholder:text-white/30 focus:outline-none focus:border-brand-orange"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-1">
                    Valor Atual Acumulado (R$)
                  </label>
                  <input
                    type="text"
                    placeholder="0,00"
                    value={currentAmountStr}
                    onChange={(e) => setCurrentAmountStr(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1c181a] text-white text-xs font-bold placeholder:text-white/30 focus:outline-none focus:border-brand-orange"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-1">
                    Prazo Estimado
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1c181a] text-white text-xs focus:outline-none focus:border-brand-orange"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-1">
                    Categoria / Tag
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Viagem, Sonhos, Bens..."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1c181a] text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-brand-orange"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/60 mb-1">
                  Cor de Destaque
                </label>
                <div className="flex items-center gap-2">
                  {['#f74603', '#e85002', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-xl border-2 transition-transform ${
                        color === c ? 'scale-110 border-white' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/60 mb-1">
                  Descrição ou Motivação
                </label>
                <textarea
                  rows={2}
                  placeholder="Por que esta meta é importante para você?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1c181a] text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f74603] to-[#e85002] text-white text-xs font-bold shadow-[0_0_15px_rgba(247,70,3,0.35)] hover:from-[#e85002] hover:to-[#d03d00] transition-all"
                >
                  Salvar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
