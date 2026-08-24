import { supabase, isSupabaseConfigured } from './supabase';
import {
  Transaction,
  Investment,
  FixedExpense,
  IncomeSource,
  FinancialGoal,
  Category,
  UserProfile,
} from '../types';

/**
 * Interface mapping helpers to convert between Supabase DB column names (snake_case)
 * and Frontend TypeScript models (camelCase).
 */

// ==========================================
// 1. TRANSACTIONS
// ==========================================
export async function getTransactions(): Promise<Transaction[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('[Supabase] Error fetching transactions:', error);
    throw error;
  }

  return (data || []).map((row) => ({
    id: row.id,
    type: row.type,
    description: row.description,
    amount: Number(row.amount),
    date: row.date,
    categoryId: row.category,
    accountId: 'acc-default',
    recurrence: 'single',
    status: row.status,
    notes: row.notes || undefined,
    createdAt: row.created_at,
  }));
}

export async function createTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw new Error('Usuário não autenticado.');

  const payload = {
    user_id: userId,
    type: tx.type,
    description: tx.description,
    amount: tx.amount,
    date: tx.date,
    category: tx.categoryId,
    status: tx.status,
    notes: tx.notes || null,
  };

  const { data, error } = await supabase
    .from('transactions')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error creating transaction:', error);
    throw error;
  }

  return {
    id: data.id,
    type: data.type,
    description: data.description,
    amount: Number(data.amount),
    date: data.date,
    categoryId: data.category,
    accountId: 'acc-default',
    recurrence: 'single',
    status: data.status,
    notes: data.notes || undefined,
    createdAt: data.created_at,
  };
}

export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
  const payload: any = {};
  if (updates.type !== undefined) payload.type = updates.type;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.amount !== undefined) payload.amount = updates.amount;
  if (updates.date !== undefined) payload.date = updates.date;
  if (updates.categoryId !== undefined) payload.category = updates.categoryId;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.notes !== undefined) payload.notes = updates.notes;

  const { error } = await supabase
    .from('transactions')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error('[Supabase] Error updating transaction:', error);
    throw error;
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Supabase] Error deleting transaction:', error);
    throw error;
  }
}

// ==========================================
// 2. INVESTMENTS
// ==========================================
export async function getInvestments(): Promise<Investment[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase] Error fetching investments:', error);
    throw error;
  }

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    institution: row.institution || 'Banco',
    investedAmount: Number(row.amount || row.current_balance || 0),
    currentBalance: Number(row.current_balance || row.amount || 0),
    startDate: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    profitabilityRate: row.profit_percentage ? `${row.profit_percentage}% CDI` : '100% CDI',
    liquidity: row.liquidity || 'daily',
    maturityDate: row.due_date || undefined,
    isEmergencyReserve: Boolean(row.is_emergency_reserve),
    updatedAt: row.created_at,
  }));
}

export async function createInvestment(inv: Omit<Investment, 'id' | 'updatedAt'>): Promise<Investment> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw new Error('Usuário não autenticado.');

  const payload = {
    user_id: userId,
    name: inv.name,
    type: inv.type,
    institution: inv.institution,
    amount: inv.investedAmount,
    current_balance: inv.currentBalance,
    profit: inv.currentBalance - inv.investedAmount,
    profit_percentage: inv.cdiPercentage || 100,
    liquidity: inv.liquidity || 'daily',
    due_date: inv.maturityDate || null,
    is_emergency_reserve: Boolean(inv.isEmergencyReserve),
  };

  const { data, error } = await supabase
    .from('investments')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error creating investment:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    type: data.type,
    institution: data.institution,
    investedAmount: Number(data.amount),
    currentBalance: Number(data.current_balance),
    startDate: data.created_at.split('T')[0],
    profitabilityRate: `${data.profit_percentage || 100}% CDI`,
    liquidity: data.liquidity,
    maturityDate: data.due_date || undefined,
    isEmergencyReserve: Boolean(data.is_emergency_reserve),
    updatedAt: data.created_at,
  };
}

export async function updateInvestment(id: string, updates: Partial<Investment>): Promise<void> {
  const payload: any = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.type !== undefined) payload.type = updates.type;
  if (updates.institution !== undefined) payload.institution = updates.institution;
  if (updates.investedAmount !== undefined) payload.amount = updates.investedAmount;
  if (updates.currentBalance !== undefined) payload.current_balance = updates.currentBalance;
  if (updates.isEmergencyReserve !== undefined) payload.is_emergency_reserve = updates.isEmergencyReserve;
  if (updates.liquidity !== undefined) payload.liquidity = updates.liquidity;
  if (updates.maturityDate !== undefined) payload.due_date = updates.maturityDate;

  const { error } = await supabase
    .from('investments')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error('[Supabase] Error updating investment:', error);
    throw error;
  }
}

export async function deleteInvestment(id: string): Promise<void> {
  const { error } = await supabase
    .from('investments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Supabase] Error deleting investment:', error);
    throw error;
  }
}

// ==========================================
// 3. RECURRING EXPENSES & DEBTS
// ==========================================
export async function getRecurringExpenses(): Promise<FixedExpense[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('recurring_expenses')
    .select('*')
    .order('due_day', { ascending: true });

  if (error) {
    console.error('[Supabase] Error fetching recurring expenses:', error);
    throw error;
  }

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    dueDay: row.due_day,
    categoryId: row.category || 'Contas Fixas',
    accountId: 'acc-default',
    recurrence: 'monthly',
    active: row.active ?? true,
    isDebt: Boolean(row.installments_total && row.installments_total > 1),
    totalInstallments: row.installments_total || undefined,
    currentInstallment: row.installments_total && row.installments_remaining !== null
      ? row.installments_total - row.installments_remaining
      : undefined,
    completed: row.installments_remaining === 0,
  }));
}

export async function createRecurringExpense(exp: Omit<FixedExpense, 'id'>): Promise<FixedExpense> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw new Error('Usuário não autenticado.');

  const remaining = exp.isDebt && exp.totalInstallments
    ? exp.totalInstallments - (exp.currentInstallment || 0)
    : null;

  const payload = {
    user_id: userId,
    name: exp.name,
    amount: exp.amount,
    due_day: exp.dueDay,
    category: exp.categoryId,
    active: exp.active ?? true,
    installments_total: exp.isDebt ? exp.totalInstallments || null : null,
    installments_remaining: remaining,
  };

  const { data, error } = await supabase
    .from('recurring_expenses')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error creating recurring expense:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    amount: Number(data.amount),
    dueDay: data.due_day,
    categoryId: data.category,
    accountId: 'acc-default',
    recurrence: 'monthly',
    active: data.active,
    isDebt: Boolean(data.installments_total && data.installments_total > 1),
    totalInstallments: data.installments_total || undefined,
    currentInstallment: exp.currentInstallment,
    completed: data.installments_remaining === 0,
  };
}

export async function updateRecurringExpense(id: string, updates: Partial<FixedExpense>): Promise<void> {
  const payload: any = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.amount !== undefined) payload.amount = updates.amount;
  if (updates.dueDay !== undefined) payload.due_day = updates.dueDay;
  if (updates.categoryId !== undefined) payload.category = updates.categoryId;
  if (updates.active !== undefined) payload.active = updates.active;
  if (updates.totalInstallments !== undefined) payload.installments_total = updates.totalInstallments;

  if (updates.currentInstallment !== undefined && updates.totalInstallments !== undefined) {
    payload.installments_remaining = Math.max(0, updates.totalInstallments - updates.currentInstallment);
  } else if (updates.completed !== undefined && updates.completed) {
    payload.installments_remaining = 0;
    payload.active = false;
  }

  const { error } = await supabase
    .from('recurring_expenses')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error('[Supabase] Error updating recurring expense:', error);
    throw error;
  }
}

export async function deleteRecurringExpense(id: string): Promise<void> {
  const { error } = await supabase
    .from('recurring_expenses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Supabase] Error deleting recurring expense:', error);
    throw error;
  }
}

// ==========================================
// 4. INCOME SOURCES
// ==========================================
export async function getIncomeSources(): Promise<IncomeSource[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('income_sources')
    .select('*')
    .order('due_day', { ascending: true });

  if (error) {
    console.error('[Supabase] Error fetching income sources:', error);
    throw error;
  }

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    amount: Number(row.expected_amount),
    type: row.is_variable ? 'variable' : 'fixed',
    receiveDay: row.due_day,
    categoryId: 'cat-salario',
    accountId: 'acc-default',
    active: row.active ?? true,
  }));
}

export async function createIncomeSource(src: Omit<IncomeSource, 'id'>): Promise<IncomeSource> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw new Error('Usuário não autenticado.');

  const payload = {
    user_id: userId,
    name: src.name,
    expected_amount: src.amount,
    due_day: src.receiveDay || 5,
    is_variable: src.type === 'variable',
    active: src.active ?? true,
  };

  const { data, error } = await supabase
    .from('income_sources')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error creating income source:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    amount: Number(data.expected_amount),
    type: data.is_variable ? 'variable' : 'fixed',
    receiveDay: data.due_day,
    categoryId: 'cat-salario',
    accountId: 'acc-default',
    active: data.active,
  };
}

export async function updateIncomeSource(id: string, updates: Partial<IncomeSource>): Promise<void> {
  const payload: any = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.amount !== undefined) payload.expected_amount = updates.amount;
  if (updates.receiveDay !== undefined) payload.due_day = updates.receiveDay;
  if (updates.type !== undefined) payload.is_variable = updates.type === 'variable';
  if (updates.active !== undefined) payload.active = updates.active;

  const { error } = await supabase
    .from('income_sources')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error('[Supabase] Error updating income source:', error);
    throw error;
  }
}

export async function deleteIncomeSource(id: string): Promise<void> {
  const { error } = await supabase
    .from('income_sources')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Supabase] Error deleting income source:', error);
    throw error;
  }
}

// ==========================================
// 5. GOALS
// ==========================================
export async function getGoals(): Promise<FinancialGoal[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase] Error fetching goals:', error);
    throw error;
  }

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount || 0),
    deadline: row.deadline || undefined,
    category: row.category || 'Geral',
    description: row.description || undefined,
    color: '#f74603',
  }));
}

export async function createGoal(goal: Omit<FinancialGoal, 'id'>): Promise<FinancialGoal> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw new Error('Usuário não autenticado.');

  const payload = {
    user_id: userId,
    name: goal.name,
    target_amount: goal.targetAmount,
    current_amount: goal.currentAmount || 0,
    deadline: goal.deadline || null,
    category: goal.category || 'Geral',
    description: goal.description || null,
  };

  const { data, error } = await supabase
    .from('goals')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error creating goal:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    targetAmount: Number(data.target_amount),
    currentAmount: Number(data.current_amount),
    deadline: data.deadline || undefined,
    category: data.category,
    description: data.description || undefined,
    color: '#f74603',
  };
}

export async function updateGoal(id: string, updates: Partial<FinancialGoal>): Promise<void> {
  const payload: any = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.targetAmount !== undefined) payload.target_amount = updates.targetAmount;
  if (updates.currentAmount !== undefined) payload.current_amount = updates.currentAmount;
  if (updates.deadline !== undefined) payload.deadline = updates.deadline;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.description !== undefined) payload.description = updates.description;

  const { error } = await supabase
    .from('goals')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error('[Supabase] Error updating goal:', error);
    throw error;
  }
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Supabase] Error deleting goal:', error);
    throw error;
  }
}

// ==========================================
// 6. CATEGORIES
// ==========================================
export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[Supabase] Error fetching categories:', error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    icon: 'Tag',
    color: row.type === 'income' ? '#10B981' : '#f74603',
    type: row.type as 'expense' | 'income',
    budgetGroup: row.type === 'income' ? 'necessities' : 'necessities',
  }));
}

export async function createCategory(cat: Omit<Category, 'id'>): Promise<Category> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw new Error('Usuário não autenticado.');

  const payload = {
    user_id: userId,
    name: cat.name,
    type: cat.type || 'expense',
  };

  const { data, error } = await supabase
    .from('categories')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error creating category:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    icon: 'Tag',
    color: '#f74603',
    type: data.type,
    budgetGroup: 'necessities',
  };
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Supabase] Error deleting category:', error);
    throw error;
  }
}

// ==========================================
// 7. USER PROFILE
// ==========================================
export async function getUserProfile(userId: string): Promise<Partial<UserProfile> | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    emergencyGoal: Number(data.emergency_goal || 40000),
    budgetRule: {
      necessitiesPercent: Number(data.necessities_percent || 50),
      leisurePercent: Number(data.leisure_percent || 30),
      investmentsPercent: Number(data.investments_percent || 20),
    },
  };
}

export async function upsertUserProfile(profile: UserProfile): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const payload = {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    emergency_goal: profile.emergencyGoal || 40000,
    necessities_percent: profile.budgetRule?.necessitiesPercent || 50,
    leisure_percent: profile.budgetRule?.leisurePercent || 30,
    investments_percent: profile.budgetRule?.investmentsPercent || 20,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('user_profiles')
    .upsert(payload);

  if (error) {
    console.error('[Supabase] Error upserting user profile:', error);
  }
}

// ==========================================
// 8. MIGRATION HELPER (IMPORT LOCAL TO SUPABASE)
// ==========================================
export async function migrateLocalDataToSupabase(localData: {
  transactions: Transaction[];
  investments: Investment[];
  fixedExpenses: FixedExpense[];
  incomeSources: IncomeSource[];
  goals: FinancialGoal[];
}): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return { success: false, count: 0, error: 'Usuário não autenticado no Supabase.' };

    let totalMigrated = 0;

    // 1. Transactions
    if (localData.transactions?.length > 0) {
      const txRows = localData.transactions.map((t) => ({
        user_id: userId,
        type: t.type,
        description: t.description,
        amount: t.amount,
        date: t.date || new Date().toISOString().split('T')[0],
        category: t.categoryId || 'Geral',
        status: t.status || 'paid',
        notes: t.notes || null,
      }));
      const { error } = await supabase.from('transactions').insert(txRows);
      if (!error) totalMigrated += txRows.length;
    }

    // 2. Investments
    if (localData.investments?.length > 0) {
      const invRows = localData.investments.map((i) => ({
        user_id: userId,
        name: i.name,
        type: i.type,
        institution: i.institution || 'Banco',
        amount: i.investedAmount,
        current_balance: i.currentBalance,
        profit: i.currentBalance - i.investedAmount,
        profit_percentage: i.cdiPercentage || 100,
        liquidity: i.liquidity || 'daily',
        due_date: i.maturityDate || null,
        is_emergency_reserve: Boolean(i.isEmergencyReserve),
      }));
      const { error } = await supabase.from('investments').insert(invRows);
      if (!error) totalMigrated += invRows.length;
    }

    // 3. Recurring Expenses
    if (localData.fixedExpenses?.length > 0) {
      const expRows = localData.fixedExpenses.map((e) => ({
        user_id: userId,
        name: e.name,
        amount: e.amount,
        due_day: e.dueDay || 10,
        category: e.categoryId || 'Contas Fixas',
        active: e.active ?? true,
        installments_total: e.isDebt ? e.totalInstallments || null : null,
        installments_remaining: e.isDebt && e.totalInstallments ? Math.max(0, e.totalInstallments - (e.currentInstallment || 0)) : null,
      }));
      const { error } = await supabase.from('recurring_expenses').insert(expRows);
      if (!error) totalMigrated += expRows.length;
    }

    // 4. Income Sources
    if (localData.incomeSources?.length > 0) {
      const incRows = localData.incomeSources.map((s) => ({
        user_id: userId,
        name: s.name,
        expected_amount: s.amount,
        due_day: s.receiveDay || 5,
        is_variable: s.type === 'variable',
        active: s.active ?? true,
      }));
      const { error } = await supabase.from('income_sources').insert(incRows);
      if (!error) totalMigrated += incRows.length;
    }

    // 5. Goals
    if (localData.goals?.length > 0) {
      const goalRows = localData.goals.map((g) => ({
        user_id: userId,
        name: g.name,
        target_amount: g.targetAmount,
        current_amount: g.currentAmount || 0,
        deadline: g.deadline || null,
        category: g.category || 'Geral',
        description: g.description || null,
      }));
      const { error } = await supabase.from('goals').insert(goalRows);
      if (!error) totalMigrated += goalRows.length;
    }

    return { success: true, count: totalMigrated };
  } catch (err: any) {
    console.error('[Supabase Migration Error]:', err);
    return { success: false, count: 0, error: err.message || 'Erro durante a sincronização.' };
  }
}
