export type TransactionType = 'income' | 'expense' | 'investment' | 'transfer';
export type RecurrenceType = 'single' | 'monthly';
export type TransactionStatus = 'paid' | 'pending';
export type IncomeType = 'fixed' | 'variable' | 'estimated';

export type InvestmentType =
  | 'CDB'
  | 'Tesouro Direto'
  | 'Poupança'
  | 'Fundo'
  | 'Ações'
  | 'ETFs'
  | 'Criptomoedas'
  | 'Outros';

export type BudgetCategory = 'necessities' | 'leisure' | 'investments';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
  budgetGroup: BudgetCategory; // 50/30/20 classification
}

export interface Account {
  id: string;
  name: string;
  institution: string;
  type: 'checking' | 'investment' | 'wallet' | 'card';
  balance: number;
  color: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  categoryId: string;
  accountId: string;
  recurrence: RecurrenceType;
  status: TransactionStatus;
  notes?: string;
  investmentId?: string;
  fixedExpenseId?: string;
  createdAt: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // 1 - 31
  categoryId: string;
  accountId: string;
  recurrence: RecurrenceType;
  active: boolean;
  isDebt?: boolean;
  totalInstallments?: number;
  currentInstallment?: number; // e.g. 19 of 20
  interestRate?: number;
  notes?: string;
  completed?: boolean;
}

export interface IncomeSource {
  id: string;
  name: string;
  amount: number; // base or estimated
  type: IncomeType;
  receiveDay: number; // 1 - 31
  categoryId: string;
  accountId: string;
  active: boolean;
  notes?: string;
}

export interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  institution: string;
  investedAmount: number;
  currentBalance: number;
  startDate: string;
  profitabilityRate?: string; // e.g. "100% CDI" or "IPCA + 6.5%"
  liquidity?: 'daily' | 'maturity' | 'd+1' | 'd+30' | string;
  maturityDate?: string;
  isEmergencyReserve: boolean;
  cdiPercentage?: number; // for CDB e.g. 100
  notes?: string;
  updatedAt: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category: string;
  description?: string;
  color: string;
  icon?: string;
}

export interface BudgetRuleConfig {
  necessitiesPercent: number; // default 50
  leisurePercent: number;     // default 30
  investmentsPercent: number; // default 20
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  emergencyGoal: number; // default 40000
  monthlyInvestmentGoalPercent: number; // default 20
  budgetRule: BudgetRuleConfig;
  hasCompletedOnboarding: boolean;
  createdAt: string;
}

export interface FinancialFreedomLevel {
  amount: number;
  title: string;
  description: string;
  monthsCovered: number;
  unlocked: boolean;
}

export interface AlertNotification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'celebration';
  title: string;
  message: string;
  date: string;
  read: boolean;
  actionUrl?: string;
}


