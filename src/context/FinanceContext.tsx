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
  TransactionType,
  TransactionStatus,
} from '../types';
import { useAuth } from './AuthContext';
import { getInitialSeedData, getBlankUserData, DEFAULT_CATEGORIES, DEFAULT_ACCOUNTS, DEFAULT_BLANK_ACCOUNTS } from '../utils/defaultData';
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
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Transaction;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  toggleTransactionStatus: (id: string) => void;

  // CRUD Actions - Fixed Expenses & Debts
  addFixedExpense: (exp: Omit<FixedExpense, 'id'>) => FixedExpense;
  updateFixedExpense: (id: string, updates: Partial<FixedExpense>) => void;
  deleteFixedExpense: (id: string) => void;
  payDebtInstallment: (id: string) => void;

  // CRUD Actions - Income Sources
  addIncomeSource: (src: Omit<IncomeSource, 'id'>) => IncomeSource;
  updateIncomeSource: (id: string, updates: Partial<IncomeSource>) => void;
  deleteIncomeSource: (id: string) => void;

  // CRUD Actions - Investments
  addInvestment: (inv: Omit<Investment, 'id' | 'updatedAt'>) => Investment;
  updateInvestment: (id: string, updates: Partial<Investment>) => void;
  deleteInvestment: (id: string) => void;
  updateInvestmentBalance: (id: string, newBalance: number) => void;

  // CRUD Actions - Goals
  addGoal: (goal: Omit<FinancialGoal, 'id'>) => FinancialGoal;
  updateGoal: (id: string, updates: Partial<FinancialGoal>) => void;
  deleteGoal: (id: string) => void;

  // CRUD Actions - Categories & Accounts
  addCategory: (cat: Omit<Category, 'id'>) => Category;
  addAccount: (acc: Omit<Account, 'id'>) => Account;

  // Celebration & Helpers
  celebration: CelebrationState | null;
  closeCelebration: () => void;
  triggerConfetti: () => void;
  resetAllUserData: () => void;
  importInitialPreset: () => void;
  exportDataJson: () => string;
  importDataJson: (jsonString: string) => boolean;
  resetToDefaultData: () => void;
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

  // Load user data on user switch
  useEffect(() => {
    try {
      const storedTx = localStorage.getItem(`${STORAGE_PREFIX}transactions`);
      const storedExp = localStorage.getItem(`${STORAGE_PREFIX}fixed_expenses`);
      const storedInc = localStorage.getItem(`${STORAGE_PREFIX}income_sources`);
      const storedInv = localStorage.getItem(`${STORAGE_PREFIX}investments`);
      const storedGoals = localStorage.getItem(`${STORAGE_PREFIX}goals`);
      const storedAcc = localStorage.getItem(`${STORAGE_PREFIX}accounts`);
      const storedCat = localStorage.getItem(`${STORAGE_PREFIX}categories`);

      if (storedTx && storedExp) {
        setTransactions(JSON.parse(storedTx));
        setFixedExpenses(JSON.parse(storedExp));
        setIncomeSources(storedInc ? JSON.parse(storedInc) : []);
        setInvestments(storedInv ? JSON.parse(storedInv) : []);
        setGoals(storedGoals ? JSON.parse(storedGoals) : []);
        if (storedAcc) setAccounts(JSON.parse(storedAcc));
        if (storedCat) setCategories(JSON.parse(storedCat));
      } else {
        // Initialize with clean blank state for manual entry
        const blank = getBlankUserData(user?.name || 'Jeferson Rocha', user?.email || 'jefersonrocha998@gmail.com');
        setAccounts(blank.accounts);
        setCategories(blank.categories);
        setTransactions(blank.transactions);
        setFixedExpenses(blank.fixedExpenses);
        setIncomeSources(blank.incomeSources);
        setInvestments(blank.investments);
        setGoals(blank.goals);

        // Save into local storage
        localStorage.setItem(`${STORAGE_PREFIX}accounts`, JSON.stringify(blank.accounts));
        localStorage.setItem(`${STORAGE_PREFIX}categories`, JSON.stringify(blank.categories));
        localStorage.setItem(`${STORAGE_PREFIX}transactions`, JSON.stringify(blank.transactions));
        localStorage.setItem(`${STORAGE_PREFIX}fixed_expenses`, JSON.stringify(blank.fixedExpenses));
        localStorage.setItem(`${STORAGE_PREFIX}income_sources`, JSON.stringify(blank.incomeSources));
        localStorage.setItem(`${STORAGE_PREFIX}investments`, JSON.stringify(blank.investments));
        localStorage.setItem(`${STORAGE_PREFIX}goals`, JSON.stringify(blank.goals));
      }
    } catch (e) {
      console.error('Failed to load user financial data:', e);
    }
  }, [userId, user?.name, user?.email]);

  // Persist helper
  const saveState = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to save ${key}:`, e);
    }
  }, [STORAGE_PREFIX]);

  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'],
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

  // Generate dynamic system alerts based on current state
  useEffect(() => {
    const newAlerts: AlertNotification[] = [];
    const today = new Date().getDate();

    // 1. Check fixed expenses due soon
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

    // 2. Check leisure budget percentage
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

    // 3. Check milestone achievements
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

    // 4. Check ending debt
    const closingDebt = fixedExpenses.find(
      (e) => e.isDebt && e.active && !e.completed && (e.currentInstallment || 0) >= (e.totalInstallments || 1) - 1
    );
    if (closingDebt) {
      newAlerts.push({
        id: `alert-debt-close-${closingDebt.id}`,
        type: 'info',
        title: 'Quitação próxima!',
        message: `${closingDebt.name} está em sua última parcela este mês!`,
        date: new Date().toISOString(),
        read: false,
      });
    }

    setAlerts(newAlerts);
  }, [fixedExpenses, budget503020.leisure.percentUsed, emergencyReserve]);

  // Transaction CRUD
  const addTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };

    const nextList = [newTx, ...transactions];
    setTransactions(nextList);
    saveState('transactions', nextList);

    // If it's an investment transaction with an linked investment, update the investment balance
    if (newTx.type === 'investment' && newTx.investmentId && newTx.status === 'paid') {
      const inv = investments.find((i) => i.id === newTx.investmentId);
      if (inv) {
        updateInvestment(inv.id, {
          currentBalance: inv.currentBalance + newTx.amount,
          investedAmount: inv.investedAmount + newTx.amount,
        });
      }
    }

    // Trigger celebratory confetti if large milestone or investment
    if (newTx.type === 'investment') {
      triggerConfetti();
    }

    return newTx;
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const nextList = transactions.map((t) => (t.id === id ? { ...t, ...updates } : t));
    setTransactions(nextList);
    saveState('transactions', nextList);
  };

  const deleteTransaction = (id: string) => {
    const nextList = transactions.filter((t) => t.id !== id);
    setTransactions(nextList);
    saveState('transactions', nextList);
  };

  const toggleTransactionStatus = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;
    const newStatus: TransactionStatus = tx.status === 'paid' ? 'pending' : 'paid';
    updateTransaction(id, { status: newStatus });
  };

  // Fixed Expense & Debt actions
  const addFixedExpense = (expData: Omit<FixedExpense, 'id'>): FixedExpense => {
    const newExp: FixedExpense = {
      ...expData,
      id: `exp-${Date.now()}`,
    };
    const nextList = [...fixedExpenses, newExp];
    setFixedExpenses(nextList);
    saveState('fixed_expenses', nextList);
    return newExp;
  };

  const updateFixedExpense = (id: string, updates: Partial<FixedExpense>) => {
    const nextList = fixedExpenses.map((e) => (e.id === id ? { ...e, ...updates } : e));
    setFixedExpenses(nextList);
    saveState('fixed_expenses', nextList);
  };

  const deleteFixedExpense = (id: string) => {
    const nextList = fixedExpenses.filter((e) => e.id !== id);
    setFixedExpenses(nextList);
    saveState('fixed_expenses', nextList);
  };

  const payDebtInstallment = (id: string) => {
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

    updateFixedExpense(id, updates);

    // Register transaction for this payment
    addTransaction({
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

  // Income Sources
  const addIncomeSource = (srcData: Omit<IncomeSource, 'id'>): IncomeSource => {
    const newSrc: IncomeSource = { ...srcData, id: `inc-${Date.now()}` };
    const next = [...incomeSources, newSrc];
    setIncomeSources(next);
    saveState('income_sources', next);
    return newSrc;
  };

  const updateIncomeSource = (id: string, updates: Partial<IncomeSource>) => {
    const next = incomeSources.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setIncomeSources(next);
    saveState('income_sources', next);
  };

  const deleteIncomeSource = (id: string) => {
    const next = incomeSources.filter((s) => s.id !== id);
    setIncomeSources(next);
    saveState('income_sources', next);
  };

  // Investments
  const addInvestment = (invData: Omit<Investment, 'id' | 'updatedAt'>): Investment => {
    const newInv: Investment = {
      ...invData,
      id: `inv-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    const next = [...investments, newInv];
    setInvestments(next);
    saveState('investments', next);
    triggerConfetti();
    return newInv;
  };

  const updateInvestment = (id: string, updates: Partial<Investment>) => {
    const next = investments.map((i) => (i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i));
    setInvestments(next);
    saveState('investments', next);
  };

  const deleteInvestment = (id: string) => {
    const next = investments.filter((i) => i.id !== id);
    setInvestments(next);
    saveState('investments', next);
  };

  const updateInvestmentBalance = (id: string, newBalance: number) => {
    const inv = investments.find((i) => i.id === id);
    if (!inv) return;
    const diff = newBalance - inv.currentBalance;
    updateInvestment(id, { currentBalance: newBalance });

    // If reserve crossed a milestone, celebrate
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

  // Goals
  const addGoal = (goalData: Omit<FinancialGoal, 'id'>): FinancialGoal => {
    const newGoal: FinancialGoal = { ...goalData, id: `goal-${Date.now()}` };
    const next = [...goals, newGoal];
    setGoals(next);
    saveState('goals', next);
    return newGoal;
  };

  const updateGoal = (id: string, updates: Partial<FinancialGoal>) => {
    const next = goals.map((g) => (g.id === id ? { ...g, ...updates } : g));
    setGoals(next);
    saveState('goals', next);
  };

  const deleteGoal = (id: string) => {
    const next = goals.filter((g) => g.id !== id);
    setGoals(next);
    saveState('goals', next);
  };

  // Categories & Accounts
  const addCategory = (catData: Omit<Category, 'id'>): Category => {
    const newCat: Category = { ...catData, id: `cat-${Date.now()}` };
    const next = [...categories, newCat];
    setCategories(next);
    saveState('categories', next);
    return newCat;
  };

  const addAccount = (accData: Omit<Account, 'id'>): Account => {
    const newAcc: Account = { ...accData, id: `acc-${Date.now()}` };
    const next = [...accounts, newAcc];
    setAccounts(next);
    saveState('accounts', next);
    return newAcc;
  };

  const goToCurrentMonth = () => {
    setSelectedYear(currentYear);
    setSelectedMonth(currentMonth + 1);
  };

  const resetAllUserData = () => {
    setTransactions([]);
    setFixedExpenses([]);
    setIncomeSources([]);
    setInvestments([]);
    setGoals([]);
    setAccounts(DEFAULT_BLANK_ACCOUNTS);
    setCategories(DEFAULT_CATEGORIES);

    saveState('transactions', []);
    saveState('fixed_expenses', []);
    saveState('income_sources', []);
    saveState('investments', []);
    saveState('goals', []);
    saveState('accounts', DEFAULT_BLANK_ACCOUNTS);
    saveState('categories', DEFAULT_CATEGORIES);
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

    saveState('accounts', seed.accounts);
    saveState('categories', seed.categories);
    saveState('transactions', seed.transactions);
    saveState('fixed_expenses', seed.fixedExpenses);
    saveState('income_sources', seed.incomeSources);
    saveState('investments', seed.investments);
    saveState('goals', seed.goals);

    showCelebration('Dados Iniciais Carregados', 'O painel foi configurado com seu perfil inicial completo!');
  };

  const exportDataJson = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user: { name: user?.name, email: user?.email },
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

      if (Array.isArray(parsed.accounts)) {
        setAccounts(parsed.accounts);
        saveState('accounts', parsed.accounts);
      }
      if (Array.isArray(parsed.categories)) {
        setCategories(parsed.categories);
        saveState('categories', parsed.categories);
      }
      if (Array.isArray(parsed.transactions)) {
        setTransactions(parsed.transactions);
        saveState('transactions', parsed.transactions);
      }
      if (Array.isArray(parsed.fixedExpenses)) {
        setFixedExpenses(parsed.fixedExpenses);
        saveState('fixed_expenses', parsed.fixedExpenses);
      }
      if (Array.isArray(parsed.incomeSources)) {
        setIncomeSources(parsed.incomeSources);
        saveState('income_sources', parsed.incomeSources);
      }
      if (Array.isArray(parsed.investments)) {
        setInvestments(parsed.investments);
        saveState('investments', parsed.investments);
      }
      if (Array.isArray(parsed.goals)) {
        setGoals(parsed.goals);
        saveState('goals', parsed.goals);
      }

      showCelebration('Backup Restaurado!', 'Seus dados foram importados com sucesso.');
      return true;
    } catch (err) {
      console.error('Error importing data JSON', err);
      return false;
    }
  };

  const resetToDefaultData = () => {
    importInitialPreset();
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
        addAccount,
        celebration,
        closeCelebration,
        triggerConfetti,
        resetAllUserData,
        importInitialPreset,
        exportDataJson,
        importDataJson,
        resetToDefaultData,
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
