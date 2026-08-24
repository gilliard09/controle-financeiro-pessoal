import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  CreditCard,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, parseCurrencyInput } from '../../utils/formatters';

export const OnboardingWizard: React.FC = () => {
  const { user, updateProfile, completeOnboarding } = useAuth();
  const { addIncomeSource, addFixedExpense, addInvestment, triggerConfetti } = useFinance();

  const [step, setStep] = useState(1);

  // Step 1: Profile & Name
  const [name, setName] = useState(user?.name || 'Jeferson');

  // Step 2: Main Income
  const [incomeName, setIncomeName] = useState('Salário Principal');
  const [incomeAmountStr, setIncomeAmountStr] = useState('11000');
  const [incomeDay, setIncomeDay] = useState(5);

  // Step 3: Fixed Expenses
  const [fixedAmountStr, setFixedAmountStr] = useState('6229');

  // Step 4: Emergency Reserve
  const [reserveBalanceStr, setReserveBalanceStr] = useState('18430');
  const [reserveGoalStr, setReserveGoalStr] = useState('40000');
  const [targetMonths, setTargetMonths] = useState(6);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Finalize Onboarding
      updateProfile({
        name: name.trim() || 'Jeferson',
        emergencyGoal: parseCurrencyInput(reserveGoalStr) || 40000,
        emergencyTargetMonths: targetMonths || 6,
      });

      triggerConfetti();
      completeOnboarding();
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 selection:bg-[#f74603] selection:text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#f74603]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-[#141112] border border-white/10 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6 relative z-10 animate-in zoom-in-95 duration-200">
        {/* Header Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span className="font-bold">Passo {step} de 4</span>
            <button
              onClick={() => completeOnboarding()}
              className="text-[#f74603] hover:text-[#ff7d45] font-bold transition-colors"
            >
              Usar dados padrão de demonstração →
            </button>
          </div>
          <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-[#f74603] to-[#ff7d45] rounded-full transition-all duration-300 glow-orange-sm"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Welcome & Name */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-[#f74603]/15 text-[#f74603] border border-[#f74603]/25 flex items-center justify-center mb-2">
              <User className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Bem-vindo ao seu novo painel financeiro!
            </h2>
            <p className="text-xs sm:text-sm text-white/50">
              Vamos configurar seus números em menos de 1 minuto para dar clareza total à sua vida financeira.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">
                Como devemos te chamar?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome..."
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm font-semibold text-white placeholder:text-white/30 focus:outline-none focus:border-[#f74603]"
              />
            </div>
          </div>
        )}

        {/* Step 2: Income */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center mb-2">
              <Wallet className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">Qual é a sua renda mensal estimada?</h2>
            <p className="text-xs sm:text-sm text-white/50">
              Você pode somar salário, comissões ou lucros da sua empresa.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">Renda Total Mensal (R$)</label>
                <input
                  type="text"
                  value={incomeAmountStr}
                  onChange={(e) => setIncomeAmountStr(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-base font-extrabold text-emerald-400 placeholder:text-white/30 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Expenses */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/25 flex items-center justify-center mb-2">
              <CreditCard className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">Quanto custa seu mês (Contas Fixas)?</h2>
            <p className="text-xs sm:text-sm text-white/50">
              A soma estimada de moradia, luz, água, cartões, financiamentos e parcelas.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">Total de Contas Fixas (R$)</label>
              <input
                type="text"
                value={fixedAmountStr}
                onChange={(e) => setFixedAmountStr(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-base font-extrabold text-rose-400 placeholder:text-white/30 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        )}

        {/* Step 4: Emergency Reserve */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-[#f74603]/15 text-[#f74603] border border-[#f74603]/25 flex items-center justify-center mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">Sua Reserva de Emergência</h2>
            <p className="text-xs sm:text-sm text-white/50">
              Defina quanto você já possui guardado e qual é a sua meta de tranquilidade financeira.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">Saldo Atual (R$)</label>
                <input
                  type="text"
                  value={reserveBalanceStr}
                  onChange={(e) => setReserveBalanceStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm font-extrabold text-[#f74603] focus:outline-none focus:border-[#f74603]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">Meta Objetivo (R$)</label>
                <input
                  type="text"
                  value={reserveGoalStr}
                  onChange={(e) => setReserveGoalStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm font-extrabold text-white focus:outline-none focus:border-[#f74603]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
              Voltar
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#f74603] to-[#e85002] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#f74603]/30 glow-orange-sm transition-all"
          >
            <span>{step === 4 ? 'Acessar Meu Painel' : 'Continuar'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
