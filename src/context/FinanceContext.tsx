import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Account,
  AlertNotification,
  Category,
  FinancialGoal,
  FixedExpense,
  IncomeSource,
  Investment,
  Transaction,
  TransactionStatus,
} from '../types';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  getTransactions,
  createTransaction,
  updateTransaction as apiUpdateTransaction,
  deleteTransaction as apiDeleteTransaction,
  getInvestments,
  createInvestment,
  updateInvestment as apiUpdateInvestment,
  deleteInvestment as apiDeleteInvestment,
  getRecurringExpenses,
  createRecurringExpense,
  updateRecurringExpense as apiUpdateRecurringExpense,
  deleteRecurringExpense as apiDeleteRecurringExpense,
  getIncomeSources,
  createIncomeSource,
  updateIncomeSource as apiUpdateIncomeSource,
  deleteIncomeSource as apiDeleteIncomeSource,
  getGoals,
  createGoal,
  updateGoal as apiUpdateGoal,
  deleteGoal as apiDeleteGoal,
  getCategories,
  createCategory,
  deleteCategory as apiDeleteCategory,
  migrateLocalDataToSupabase,
} from '../lib/supabaseService';
import {
  getInitialSeedData,
  DEFAULT_CATEGORIES,
  DEFAULT_ACCOUNTS,
  DEFAULT_BLANK_ACCOUNTS,
} from '../utils/defaultData';
import {
  calculateEmergencyReserve,
  calculateEssentialMonthlyExpenses,
  calculateMonthsOfSafety,
  calculateMonthlyCashFlow,
  calculatePlannedVsActualIncome,
  calculateTotalWealth,
  getFinancialFreedomLevels,
  getDebtsSummary,
  calculate503020Budget,
  MonthlyCashFlowSummary,
  Budget503020Summary,
  DebtSummary,
} from '../utils/calculations';
import { getCurrentYearMonth } from '../utils/formatters';

interface CelebrationState {
  isOpen: boolean;
  title: string;
  message: string;
  badgeText?: string;
  releasedAmount?: number;
}

interface ToastMessage {
  id: string;
  type: 'error' | 'success' | 'info';
  text: string;
}

interface FinanceContextType {
  // Data
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  fixedExpenses: FixedExpense[];
  incomeSources: IncomeSource[];
  investments: Investment[];
  goals: FinancialGoal[];
  alerts: AlertNotification[];

  // Loading & Sync Status
  isDataLoading: boolean;
  toast: ToastMessage | null;
  dismissToast: () => void;
  showToast: (text: string, type?: 'error' | 'success' | 'info') => void;

  // Selected Date Filter
  selectedYear: number;
  selectedMonth: number;
  setSelectedYear: (y: number) => void;
  setSelectedMonth: (m: number) => void;
  goToCurrentMonth: () => void;

  // Calculated Metrics
  totalWealth: number;
  emergencyReserve: number;
  essentialMonthlyExpenses: number;
  monthsOfSafety: number;
  monthlyCashFlow: MonthlyCashFlowSummary;
  prevMonthCashFlow: MonthlyCashFlowSummary;
  plannedVsActual: { plannedIncome: number; actualIncome: number; difference: number };
  budget503020: Budget503020Summary;
  debtsSummary: {
    debts: DebtSummary[];
    totalMonthlyDebtCost: number;
    totalPendingDebtAmount: number;
    totalReleasedAfterAllDebts: number;
  };
  financialFreedomLevels: ReturnType<typeof getFinancialFreedomLevels>;

  // CRUD Actions - Transactions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<Transaction | null>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  toggleTransactionStatus: (id: string) => Promise<void>;

  // CRUD Actions - Fixed Expenses & Debts
  addFixedExpense: (exp: Omit<FixedExpense, 'id'>) => Promise<FixedExpense | null>;
  updateFixedExpense: (id: string, updates: Partial<FixedExpense>) => Promise<void>;
  deleteFixedExpense: (id: string) => Promise<void>;
  payDebtInstallment: (id: string) => Promise<void>;

  // CRUD Actions - Income Sources
  addIncomeSource: (src: Omit<IncomeSource, 'id'>) => Promise<IncomeSource | null>;
  updateIncomeSource: (id: string, updates: Partial<IncomeSource>) => Promise<void>;
  deleteIncomeSource: (id: string) => Promise<void>;

  // CRUD Actions - Investments
  addInvestment: (inv: Omit<Investment, 'id' | 'updatedAt'>) => Promise<Investment | null>;
  updateInvestment: (id: string, updates: Partial<Investment>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  updateInvestmentBalance: (id: string, newBalance: number) => Promise<void>;

  // CRUD Actions - Goals
  addGoal: (goal: Omit<FinancialGoal, 'id'>) => Promise<FinancialGoal | null>;
  updateGoal: (id: string, updates: Partial<FinancialGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  // CRUD Actions - Categories & Accounts
  addCategory: (cat: Omit<Category, 'id'>) => Promise<Category | null>;
  deleteCategory: (id: string) => Promise<void>;
  addAccount: (acc: Omit<Account, 'id'>) => Account;

  // Cloud Migration & Helpers
  migrateFromDeviceToCloud: () => Promise<{ success: boolean; count: number; message: string }>;
  celebration: CelebrationState | null;
  closeCelebration: () => void;
  triggerConfetti: () => void;
  resetAllUserData: () => void;
  importInitialPreset: () => void;
  exportDataJson: () => string;
  importDataJson: (jsonString: string) => boolean;
  resetToDefaultData: () => void;
  refreshData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || 'guest';

  const STORAGE_PREFIX = `cfp_data_${userId}_`;

  const { year: currentYear, month: currentMonth } = useMemo(() => getCurrentYearMonth(), []);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth + 1); // 1-12

  // State slices
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [celebration, setCelebration] = useState<CelebrationState | null>(null);

  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((text: string, type: 'error' | 'success' | 'info' = 'error') => {
    const id = `toast-${Date.now()}`;
    setToast({ id, type, text });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 4500);
  }, []);

  const dismissToast = () => setToast(null);

  // Fetch all data from Supabase
  const loadSupabaseData = useCallback(async (isInitial = false) => {
    if (isInitial) setIsDataLoading(true);

    try {
      if (isSupabaseConfigured() && user) {
        const [txList, invList, expList, incList, goalList, catList] = await Promise.all([
          getTransactions().catch((e) => {
            console.error('Err tx:', e);
            return [] as Transaction[];
          }),
          getInvestments().catch((e) => {
            console.error('Err inv:', e);
            return [] as Investment[];
          }),
          getRecurringExpenses().catch((e) => {
            console.error('Err exp:', e);
            return [] as FixedExpense[];
          }),
          getIncomeSources().catch((e) => {
            console.error('Err inc:', e);
            return [] as IncomeSource[];
          }),
          getGoals().catch((e) => {
            console.error('Err goals:', e);
            return [] as FinancialGoal[];
          }),
          getCategories().catch((e) => {
            console.error('Err cat:', e);
            return [] as Category[];
          }),
        ]);

        setTransactions(txList);
        setInvestments(invList);
        setFixedExpenses(expList);
        setIncomeSources(incList);
        setGoals(goalList);

        if (catList.length > 0) {
          // Merge custom categories with default categories
          const catMap = new Map<string, Category>();
          DEFAULT_CATEGORIES.forEach((c) => catMap.set(c.id, c));
          catList.forEach((c) => catMap.set(c.id, c));
          setCategories(Array.from(catMap.values()));
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }

        // Cache locally for backup/offline speed
        localStorage.setItem(`${STORAGE_PREFIX}transactions`, JSON.stringify(txList));
        localStorage.setItem(`${STORAGE_PREFIX}investments`, JSON.stringify(invList));
        localStorage.setItem(`${STORAGE_PREFIX}fixed_expenses`, JSON.stringify(expList));
        localStorage.setItem(`${STORAGE_PREFIX}income_sources`, JSON.stringify(incList));
        localStorage.setItem(`${STORAGE_PREFIX}goals`, JSON.stringify(goalList));
      } else {
        // Local mode fallback
        const storedTx = localStorage.getItem(`${STORAGE_PREFIX}transactions`);
        const storedExp = localStorage.getItem(`${STORAGE_PREFIX}fixed_expenses`);
        const storedInc = localStorage.getItem(`${STORAGE_PREFIX}income_sources`);
        const storedInv = localStorage.getItem(`${STORAGE_PREFIX}investments`);
        const storedGoals = localStorage.getItem(`${STORAGE_PREFIX}goals`);

        if (storedTx && storedExp) {
          setTransactions(JSON.parse(storedTx));
          setFixedExpenses(JSON.parse(storedExp));
          setIncomeSources(storedInc ? JSON.parse(storedInc) : []);
          setInvestments(storedInv ? JSON.parse(storedInv) : []);
          setGoals(storedGoals ? JSON.parse(storedGoals) : []);
        } else {
          setTransactions([]);
          setFixedExpenses([]);
          setIncomeSources([]);
          setInvestments([]);
          setGoals([]);
        }
      }
    } catch (err: any) {
      console.error('[FinanceContext] Error loading data:', err);
      showToast('Falha ao sincronizar dados com o Supabase.', 'error');
    } finally {
      setIsDataLoading(false);
    }
  }, [user, STORAGE_PREFIX, showToast]);

  // Initial load
  useEffect(() => {
    loadSupabaseData(true);
  }, [loadSupabaseData]);

  // Setup Supabase Realtime subscriptions
  useEffect(() => {
    if (!isSupabaseConfigured() || !user?.id) return;

    const channelName = `realtime-user-finance-${user.id}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', filter: `user_id=eq.${user.id}` },
        (_payload) => {
          // Refresh data quietly in background when any change occurs in another device
          loadSupabaseData(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, loadSupabaseData]);

  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f74603', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'],
      });
    } catch (e) {
      console.log('Confetti triggered');
    }
  }, []);

  const showCelebration = useCallback((title: string, message: string, badgeText?: string, releasedAmount?: number) => {
    triggerConfetti();
    setCelebration({
      isOpen: true,
      title,
      message,
      badgeText,
      releasedAmount,
    });
  }, [triggerConfetti]);

  const closeCelebration = () => setCelebration(null);

  // Synchronized Calculations
  const totalWealth = useMemo(() => calculateTotalWealth(accounts, investments), [accounts, investments]);
  const emergencyReserve = useMemo(() => calculateEmergencyReserve(investments), [investments]);
  const essentialMonthlyExpenses = useMemo(() => calculateEssentialMonthlyExpenses(fixedExpenses), [fixedExpenses]);
  const monthsOfSafety = useMemo(() => calculateMonthsOfSafety(emergencyReserve, essentialMonthlyExpenses), [emergencyReserve, essentialMonthlyExpenses]);

  const monthlyCashFlow = useMemo(() => {
    return calculateMonthlyCashFlow(transactions, categories, selectedYear, selectedMonth);
  }, [transactions, categories, selectedYear, selectedMonth]);

  const prevMonthCashFlow = useMemo(() => {
    const prevM = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const prevY = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
    return calculateMonthlyCashFlow(transactions, categories, prevY, prevM);
  }, [transactions, categories, selectedYear, selectedMonth]);

  const plannedVsActual = useMemo(() => {
    return calculatePlannedVsActualIncome(incomeSources, transactions, selectedYear, selectedMonth);
  }, [incomeSources, transactions, selectedYear, selectedMonth]);

  const budget503020 = useMemo(() => {
    const baseIncome = monthlyCashFlow.income > 0 ? monthlyCashFlow.income : plannedVsActual.plannedIncome;
    return calculate503020Budget(baseIncome, transactions, categories, user?.budgetRule, selectedYear, selectedMonth);
  }, [monthlyCashFlow.income, plannedVsActual.plannedIncome, transactions, categories, user?.budgetRule, selectedYear, selectedMonth]);

  const debtsSummary = useMemo(() => getDebtsSummary(fixedExpenses), [fixedExpenses]);
  const financialFreedomLevels = useMemo(
    () => getFinancialFreedomLevels(emergencyReserve, essentialMonthlyExpenses, user?.emergencyGoal || 40000),
    [emergencyReserve, essentialMonthlyExpenses, user?.emergencyGoal]
  );

  // Dynamic system alerts
  useEffect(() => {
    const newAlerts: AlertNotification[] = [];
    const today = new Date().getDate();

    fixedExpenses.forEach((exp) => {
      if (!exp.active || exp.completed) return;
      const daysUntilDue = exp.dueDay - today;
      if (daysUntilDue > 0 && daysUntilDue <= 3) {
        newAlerts.push({
          id: `alert-due-${exp.id}`,
          type: 'warning',
          title: 'Conta a vencer',
          message: `${exp.name} (R$ ${exp.amount.toFixed(2).replace('.', ',')}) vence em ${daysUntilDue} ${daysUntilDue === 1 ? 'dia' : 'dias'}.`,
          date: new Date().toISOString(),
          read: false,
        });
      }
    });

    if (budget503020.leisure.percentUsed >= 85) {
      newAlerts.push({
        id: 'alert-leisure-85',
        type: budget503020.leisure.percentUsed >= 100 ? 'warning' : 'info',
        title: budget503020.leisure.percentUsed >= 100 ? 'Orçamento de Lazer Excedido' : 'Atenção ao Lazer',
        message: `Você já utilizou ${budget503020.leisure.percentUsed.toFixed(0)}% do seu limite de lazer este mês.`,
        date: new Date().toISOString(),
        read: false,
      });
    }

    if (emergencyReserve >= 10000 && emergencyReserve < 12000) {
      newAlerts.push({
        id: 'alert-milestone-10k',
        type: 'celebration',
        title: '🎉 Marco de Segurança!',
        message: 'Parabéns! Você ultrapassou R$ 10.000 de reserva de emergência.',
        date: new Date().toISOString(),
        read: false,
      });
    }

    setAlerts(newAlerts);
  }, [fixedExpenses, budget503020.leisure.percentUsed, emergencyReserve]);

  // ==========================================
  // TRANSACTION CRUD
  // ==========================================
  const addTransaction = async (txData: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction | null> => {
    const tempId = `tx-temp-${Date.now()}`;
    const optimisticTx: Transaction = {
      ...txData,
      id: tempId,
      createdAt: new Date().toISOString(),
    };

    const previousList = transactions;
    setTransactions([optimisticTx, ...previousList]);

    try {
      let created: Transaction;
      if (isSupabaseConfigured() && user) {
        created = await createTransaction(txData);
        setTransactions((prev) => prev.map((t) => (t.id === tempId ? created : t)));
      } else {
        created = optimisticTx;
      }

      if (created.type === 'investment') {
        triggerConfetti();
      }

      return created;
    } catch (err: any) {
      console.error('[Supabase Error - addTransaction]:', err);
      setTransactions(previousList);
      showToast('Não foi possível salvar esta movimentação. Tente novamente.', 'error');
      return null;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const previousList = transactions;
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));

    try {
      if (isSupabaseConfigured() && user && !id.startsWith('tx-temp-')) {
        await apiUpdateTransaction(id, updates);
      }
    } catch (err: any) {
      console.error('[Supabase Error - updateTransaction]:', err);
      setTransactions(previousList);
      showToast('Não foi possível atualizar a transação.', 'error');
    }
  };

  const deleteTransaction = async (id: string) => {
    const previousList = transactions;
    setTransactions((prev) => prev.filter((t) => t.id !== id));

    try {
      if (isSupabaseConfigured() && user && !id.startsWith('tx-temp-')) {
        await apiDeleteTransaction(id);
      }
    } catch (err: any) {
      console.error('[Supabase Error - deleteTransaction]:', err);
      setTransactions(previousList);
      showToast('Não foi possível remover a transação.', 'error');
    }
  };

  const toggleTransactionStatus = async (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;
    const newStatus: TransactionStatus = tx.status === 'paid' ? 'pending' : 'paid';
    await updateTransaction(id, { status: newStatus });
  };

  // ==========================================
  // FIXED EXPENSE & DEBTS CRUD
  // ==========================================
  const addFixedExpense = async (expData: Omit<FixedExpense, 'id'>): Promise<FixedExpense | null> => {
    const tempId = `exp-temp-${Date.now()}`;
    const optimisticExp: FixedExpense = { ...expData, id: tempId };
    const previousList = fixedExpenses;
    setFixedExpenses([...previousList, optimisticExp]);

    try {
      let created: FixedExpense;
      if (isSupabaseConfigured() && user) {
        created = await createRecurringExpense(expData);
        setFixedExpenses((prev) => prev.map((e) => (e.id === tempId ? created : e)));
      } else {
        created = optimisticExp;
      }
      return created;
    } catch (err: any) {
      console.error('[Supabase Error - addFixedExpense]:', err);
      setFixedExpenses(previousList);
      showToast('Não foi possível salvar a despesa fixa. Tente novamente.', 'error');
      return null;
    }
  };

  const updateFixedExpense = async (id: string, updates: Partial<FixedExpense>) => {
    const previousList = fixedExpenses;
    setFixedExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));

    try {
      if (isSupabaseConfigured() && user && !id.startsWith('exp-temp-')) {
        await apiUpdateRecurringExpense(id, updates);
      }
    } catch (err: any) {
      console.error('[Supabase Error - updateFixedExpense]:', err);
      setFixedExpenses(previousList);
      showToast('Não foi possível atualizar a despesa fixa.', 'error');
    }
  };

  const deleteFixedExpense = async (id: string) => {
    const previousList = fixedExpenses;
    setFixedExpenses((prev) => prev.filter((e) => e.id !== id));

    try {
      if (isSupabaseConfigured() && user && !id.startsWith('exp-temp-')) {
        await apiDeleteRecurringExpense(id);
      }
    } catch (err: any) {
      console.error('[Supabase Error - deleteFixedExpense]:', err);
      setFixedExpenses(previousList);
      showToast('Não foi possível remover a despesa fixa.', 'error');
    }
  };

  const payDebtInstallment = async (id: string) => {
    const debt = fixedExpenses.find((e) => e.id === id);
    if (!debt || !debt.isDebt) return;

    const current = (debt.currentInstallment || 0) + 1;
    const total = debt.totalInstallments || 1;
    const isNowCompleted = current >= total;

    const updates: Partial<FixedExpense> = {
      currentInstallment: current,
      completed: isNowCompleted,
      active: !isNowCompleted,
    };

    await updateFixedExpense(id, updates);

    await addTransaction({
      type: 'expense',
      description: `${debt.name} (Parc ${current}/${total})`,
      amount: debt.amount,
      date: new Date().toISOString().split('T')[0],
      categoryId: debt.categoryId,
      accountId: debt.accountId,
      recurrence: 'monthly',
      status: 'paid',
      notes: isNowCompleted ? 'Última parcela quitada com sucesso!' : `Parcela ${current} de ${total}`,
    });

    if (isNowCompleted) {
      showCelebration(
        '🎉 Dívida Quitada com Sucesso!',
        `Parabéns! Você finalizou todas as ${total} parcelas de ${debt.name}. Essa cobrança foi encerrada automaticamente e não será mais descontada.`,
        'Liberdade Financeira',
        debt.amount
      );
    }
  };

  // ==========================================
  // INCOME SOURCES CRUD
  // ==========================================
  const addIncomeSource = async (srcData: Omit<IncomeSource, 'id'>): Promise<IncomeSource | null> => {
    const tempId = `inc-temp-${Date.now()}`;
    const optimisticSrc: IncomeSource = { ...srcData, id: tempId };
    const previousList = incomeSources;
    setIncomeSources([...previousList, optimisticSrc]);

    try {
      let created: IncomeSource;
      if (isSupabaseConfigured() && user) {
        created = await createIncomeSource(srcData);
        setIncomeSources((prev) => prev.map((s) => (s.id === tempId ? created : s)));
      } else {
        created = optimisticSrc;
      }
      return created;
    } catch (err: any) {
      console.error('[Supabase Error - addIncomeSource]:', err);
      setIncomeSources(previousList);
      showToast('Não foi possível salvar a fonte de renda.', 'error');
      return null;
    }
  };

  const updateIncomeSource = async (id: string, updates: Partial<IncomeSource>) => {
    const previousList = incomeSources;
    setIncomeSources((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));

    try {
      if (isSupabaseConfigured() && user && !id.startsWith('inc-temp-')) {
        await apiUpdateIncomeSource(id, updates);
      }
    } catch (err: any) {
      console.error('[Supabase Error - updateIncomeSource]:', err);
      setIncomeSources(previousList);
      showToast('Não foi possível atualizar a fonte de renda.', 'error');
    }
  };

  const deleteIncomeSource = async (id: string) => {
    const previousList = incomeSources;
    setIncomeSources((prev) => prev.filter((s) => s.id !== id));

    try {
      if (isSupabaseConfigured() && user && !id.startsWith('inc-temp-')) {
        await apiDeleteIncomeSource(id);
      }
    } catch (err: any) {
      console.error('[Supabase Error - deleteIncomeSource]:', err);
      setIncomeSources(previousList);
      showToast('Não foi possível remover a fonte de renda.', 'error');
    }
  };

  // ==========================================
  // INVESTMENTS CRUD
  // ==========================================
  const addInvestment = async (invData: Omit<Investment, 'id' | 'updatedAt'>): Promise<Investment | null> => {
    const tempId = `inv-temp-${Date.now()}`;
    const optimisticInv: Investment = {
      ...invData,
      id: tempId,
      updatedAt: new Date().toISOString(),
    };
    const previousList = investments;
    setInvestments([...previousList, optimisticInv]);

    try {
      let created: Investment;
      if (isSupabaseConfigured() && user) {
        created = await createInvestment(invData);
        setInvestments((prev) => prev.map((i) => (i.id === tempId ? created : i)));
      } else {
        created = optimisticInv;
      }
      triggerConfetti();
      return created;
    } catch (err: any) {
      console.error('[Supabase Error - addInvestment]:', err);
      setInvestments(previousList);
      showToast('Não foi possível salvar o investimento.', 'error');
      return null;
    }
  };

  const updateInvestment = async (id: string, updates: Partial<Investment>) => {
    const previousList = investments;
    setInvestments((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i)));

    try {
      if (isSupabaseConfigured() && user && !id.startsWith('inv-temp-')) {
        await apiUpdateInvestment(id, updates);
      }
    } catch (err: any) {
      console.error('[Supabase Error - updateInvestment]:', err);
      setInvestments(previousList);
      showToast('Não foi possível atualizar o investimento.', 'error');
    }
  };

  const deleteInvestment = async (id: string) => {
    const previousList = investments;
    setInvestments((prev) => prev.filter((i) => i.id !== id));

    try {
      if (isSupabaseConfigured() && user && !id.startsWith('inv-temp-')) {
        await apiDeleteInvestment(id);
      }
    } catch (err: any) {
      console.error('[Supabase Error - deleteInvestment]:', err);
      setInvestments(previousList);
      showToast('Não foi possível remover o investimento.', 'error');
    }
  };

  const updateInvestmentBalance = async (id: string, newBalance: number) => {
    const inv = investments.find((i) => i.id === id);
    if (!inv) return;
    const diff = newBalance - inv.currentBalance;
    await updateInvestment(id, { currentBalance: newBalance });

    if (inv.isEmergencyReserve && diff > 0) {
      const newTotalReserve = emergencyReserve + diff;
      if (newTotalReserve >= 40000 && emergencyReserve < 40000) {
        showCelebration(
          '🏆 Meta de Reserva Atingida!',
          'Sensacional! Você alcançou sua meta completa de R$ 40.000 de Reserva de Emergência!',
          'Reserva Plena'
        );
      } else if (newTotalReserve >= 10000 && emergencyReserve < 10000) {
        showCelebration(
          '🌱 R$ 10.000 Protegidos!',
          'Você atingiu o marco de R$ 10.000 em sua reserva de segurança.',
          'Reserva Inicial'
        );
      }
    }
  };

  // ==========================================
  // GOALS CRUD
  // ==========================================
  const addGoal = async (goalData: Omit<FinancialGoal, 'id'>): Promise<FinancialGoal | null> => {
    const tempId = `goal-temp-${Date.now()}`;
    const optimisticGoal: FinancialGoal = { ...goalData, id: tempId };
    const previousList = goals;
    setGoals([...previousList, optimisticGoal]);

    try {
      let created: FinancialGoal;
      if (isSupabaseConfigured() && user) {
        created = await createGoal(goalData);
        setGoals((prev) => prev.map((g) => (g.id === tempId ? created : g)));
      } else {
        created = optimisticGoal;
      }
      return created;
    } catch (err: any) {
      console.error('[Supabase Error - addGoal]:', err);
      setGoals(previousList);
      showToast('Não foi possível salvar a meta.', 'error');
      return null;
    }
  };

  const updateGoal = async (id: string, updates: Partial<FinancialGoal>) => {
    const previousList = goals;
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));

    try {
      if (isSupabaseConfigured() && user && !id.startsWith('goal-temp-')) {
        await apiUpdateGoal(id, updates);
      }
    } catch (err: any) {
      console.error('[Supabase Error - updateGoal]:', err);
      setGoals(previousList);
      showToast('Não foi possível atualizar a meta.', 'error');
    }
  };

  const deleteGoal = async (id: string) => {
    const previousList = goals;
    setGoals((prev) => prev.filter((g) => g.id !== id));

    try {
      if (isSupabaseConfigured() && user && !id.startsWith('goal-temp-')) {
        await apiDeleteGoal(id);
      }
    } catch (err: any) {
      console.error('[Supabase Error - deleteGoal]:', err);
      setGoals(previousList);
      showToast('Não foi possível remover a meta.', 'error');
    }
  };

  // ==========================================
  // CATEGORIES & ACCOUNTS
  // ==========================================
  const addCategory = async (catData: Omit<Category, 'id'>): Promise<Category | null> => {
    const tempId = `cat-temp-${Date.now()}`;
    const optimisticCat: Category = { ...catData, id: tempId };
    const previousList = categories;
    setCategories([...previousList, optimisticCat]);

    try {
      let created: Category;
      if (isSupabaseConfigured() && user) {
        created = await createCategory(catData);
        setCategories((prev) => prev.map((c) => (c.id === tempId ? created : c)));
      } else {
        created = optimisticCat;
      }
      return created;
    } catch (err: any) {
      console.error('[Supabase Error - addCategory]:', err);
      setCategories(previousList);
      showToast('Não foi possível criar a categoria.', 'error');
      return null;
    }
  };

  const deleteCategory = async (id: string) => {
    const previousList = categories;
    setCategories((prev) => prev.filter((c) => c.id !== id));

    try {
      if (isSupabaseConfigured() && user && !id.startsWith('cat-temp-') && !id.startsWith('cat-')) {
        await apiDeleteCategory(id);
      }
    } catch (err: any) {
      console.error('[Supabase Error - deleteCategory]:', err);
      setCategories(previousList);
      showToast('Não foi possível remover a categoria.', 'error');
    }
  };

  const addAccount = (accData: Omit<Account, 'id'>): Account => {
    const newAcc: Account = { ...accData, id: `acc-${Date.now()}` };
    setAccounts([...accounts, newAcc]);
    return newAcc;
  };

  const goToCurrentMonth = () => {
    setSelectedYear(currentYear);
    setSelectedMonth(currentMonth + 1);
  };

  // 1-Click Device to Cloud Migration
  const migrateFromDeviceToCloud = async (): Promise<{ success: boolean; count: number; message: string }> => {
    if (!isSupabaseConfigured() || !user) {
      return {
        success: false,
        count: 0,
        message: 'Configure as credenciais do Supabase para migrar seus dados para a nuvem.',
      };
    }

    try {
      const localData = {
        transactions,
        investments,
        fixedExpenses,
        incomeSources,
        goals,
      };

      const result = await migrateLocalDataToSupabase(localData);
      if (result.success) {
        await loadSupabaseData(false);
        showCelebration(
          '☁️ Dados Sincronizados com Sucesso!',
          `${result.count} registros deste dispositivo foram salvos no Supabase. Agora você pode acessar de qualquer celular ou computador!`,
          'Multi-Dispositivo Ativo'
        );
        return {
          success: true,
          count: result.count,
          message: `${result.count} registros migrados com sucesso para o Supabase.`,
        };
      } else {
        showToast(result.error || 'Erro na migração.', 'error');
        return {
          success: false,
          count: 0,
          message: result.error || 'Erro ao sincronizar dados.',
        };
      }
    } catch (err: any) {
      showToast(err.message || 'Falha na migração.', 'error');
      return {
        success: false,
        count: 0,
        message: err.message || 'Erro inesperado.',
      };
    }
  };

  const resetAllUserData = () => {
    setTransactions([]);
    setFixedExpenses([]);
    setIncomeSources([]);
    setInvestments([]);
    setGoals([]);
    setAccounts(DEFAULT_BLANK_ACCOUNTS);
    setCategories(DEFAULT_CATEGORIES);
  };

  const importInitialPreset = () => {
    const seed = getInitialSeedData(user?.name || 'Jeferson', user?.email || 'JefersonRocha998@gmail.com');
    setAccounts(seed.accounts);
    setCategories(seed.categories);
    setTransactions(seed.transactions);
    setFixedExpenses(seed.fixedExpenses);
    setIncomeSources(seed.incomeSources);
    setInvestments(seed.investments);
    setGoals(seed.goals);

    showCelebration('Dados Iniciais Carregados', 'O painel foi configurado com seu perfil inicial completo!');
  };

  const exportDataJson = () => {
    const backupData = {
      version: '2.0-supabase',
      exportedAt: new Date().toISOString(),
      user: { id: user?.id, name: user?.name, email: user?.email },
      accounts,
      categories,
      transactions,
      fixedExpenses,
      incomeSources,
      investments,
      goals,
    };
    return JSON.stringify(backupData, null, 2);
  };

  const importDataJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') return false;

      if (Array.isArray(parsed.transactions)) setTransactions(parsed.transactions);
      if (Array.isArray(parsed.fixedExpenses)) setFixedExpenses(parsed.fixedExpenses);
      if (Array.isArray(parsed.incomeSources)) setIncomeSources(parsed.incomeSources);
      if (Array.isArray(parsed.investments)) setInvestments(parsed.investments);
      if (Array.isArray(parsed.goals)) setGoals(parsed.goals);

      showCelebration('Backup Restaurado!', 'Seus dados foram importados.');
      return true;
    } catch (err) {
      console.error('Error importing data JSON', err);
      return false;
    }
  };

  const resetToDefaultData = () => {
    importInitialPreset();
  };

  const refreshData = async () => {
    await loadSupabaseData(false);
  };

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        categories,
        transactions,
        fixedExpenses,
        incomeSources,
        investments,
        goals,
        alerts,
        isDataLoading,
        toast,
        dismissToast,
        showToast,
        selectedYear,
        selectedMonth,
        setSelectedYear,
        setSelectedMonth,
        goToCurrentMonth,
        totalWealth,
        emergencyReserve,
        essentialMonthlyExpenses,
        monthsOfSafety,
        monthlyCashFlow,
        prevMonthCashFlow,
        plannedVsActual,
        budget503020,
        debtsSummary,
        financialFreedomLevels,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        toggleTransactionStatus,
        addFixedExpense,
        updateFixedExpense,
        deleteFixedExpense,
        payDebtInstallment,
        addIncomeSource,
        updateIncomeSource,
        deleteIncomeSource,
        addInvestment,
        updateInvestment,
        deleteInvestment,
        updateInvestmentBalance,
        addGoal,
        updateGoal,
        deleteGoal,
        addCategory,
        deleteCategory,
        addAccount,
        migrateFromDeviceToCloud,
        celebration,
        closeCelebration,
        triggerConfetti,
        resetAllUserData,
        importInitialPreset,
        exportDataJson,
        importDataJson,
        resetToDefaultData,
        refreshData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
