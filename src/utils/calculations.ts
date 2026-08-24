import {
  Account,
  BudgetRuleConfig,
  Category,
  FinancialFreedomLevel,
  FixedExpense,
  IncomeSource,
  Investment,
  Transaction,
} from '../types';

export interface MonthlyCashFlowSummary {
  income: number;
  expenses: number;
  investments: number;
  leisure: number;
  netSavings: number;
  investmentRate: number; // % of income
  expenseRate: number;    // % of income
}

export interface BudgetBucketProgress {
  title: string;
  targetPercent: number;
  targetAmount: number;
  spentAmount: number;
  percentUsed: number;
  remainingAmount: number;
  isOverBudget: boolean;
  color: string;
}

export interface Budget503020Summary {
  totalIncomeBase: number;
  necessities: BudgetBucketProgress;
  leisure: BudgetBucketProgress;
  investments: BudgetBucketProgress;
}

export interface DebtSummary {
  id: string;
  name: string;
  monthlyAmount: number;
  currentInstallment: number;
  totalInstallments: number;
  remainingInstallments: number;
  progressPercent: number;
  isLastInstallment: boolean;
  isCompleted: boolean;
  releasedMonthlyAmount: number;
}

/**
 * Calculates total wealth (Patrimônio Total)
 * Liquid accounts + all current investment balances
 */
export function calculateTotalWealth(accounts: Account[], investments: Investment[]): number {
  const accountsTotal = accounts.reduce((acc, a) => acc + (a.balance || 0), 0);
  const investmentsTotal = investments.reduce((acc, i) => acc + (i.currentBalance || 0), 0);
  return accountsTotal + investmentsTotal;
}

/**
 * Calculates Emergency Reserve from tagged investments
 */
export function calculateEmergencyReserve(investments: Investment[]): number {
  return investments
    .filter((inv) => inv.isEmergencyReserve)
    .reduce((acc, inv) => acc + (inv.currentBalance || 0), 0);
}

/**
 * Calculates essential monthly expenses
 */
export function calculateEssentialMonthlyExpenses(fixedExpenses: FixedExpense[]): number {
  return fixedExpenses
    .filter((exp) => exp.active && !exp.completed)
    .reduce((acc, exp) => acc + exp.amount, 0);
}

/**
 * Calculates how many months of safety the reserve covers
 */
export function calculateMonthsOfSafety(emergencyReserve: number, essentialMonthly: number): number {
  if (!essentialMonthly || essentialMonthly <= 0) return 0;
  return Number((emergencyReserve / essentialMonthly).toFixed(1));
}

/**
 * Calculates monthly cash flow for a specified year and month (1-12)
 */
export function calculateMonthlyCashFlow(
  transactions: Transaction[],
  categories: Category[],
  year: number,
  month: number
): MonthlyCashFlowSummary {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  let income = 0;
  let expenses = 0;
  let investments = 0;
  let leisure = 0;

  transactions.forEach((tx) => {
    if (tx.status !== 'paid') return;
    const txDate = new Date(tx.date.includes('T') ? tx.date : `${tx.date}T12:00:00`);
    if (txDate.getFullYear() !== year || txDate.getMonth() + 1 !== month) return;

    if (tx.type === 'income') {
      income += tx.amount;
    } else if (tx.type === 'investment') {
      investments += tx.amount;
    } else if (tx.type === 'expense') {
      expenses += tx.amount;
      const cat = categoryMap.get(tx.categoryId);
      if (cat?.budgetGroup === 'leisure' || cat?.id === 'cat-lazer' || cat?.id === 'cat-restaurantes' || cat?.id === 'cat-viagem') {
        leisure += tx.amount;
      }
    }
  });

  const netSavings = income - (expenses + investments);
  const investmentRate = income > 0 ? (investments / income) * 100 : 0;
  const expenseRate = income > 0 ? (expenses / income) * 100 : 0;

  return {
    income,
    expenses,
    investments,
    leisure,
    netSavings,
    investmentRate,
    expenseRate,
  };
}

/**
 * Planned vs Actual Income
 */
export function calculatePlannedVsActualIncome(
  incomeSources: IncomeSource[],
  transactions: Transaction[],
  year: number,
  month: number
) {
  const plannedIncome = incomeSources
    .filter((s) => s.active)
    .reduce((acc, s) => acc + s.amount, 0);

  const actualIncome = transactions
    .filter((tx) => {
      if (tx.type !== 'income' || tx.status !== 'paid') return false;
      const d = new Date(tx.date.includes('T') ? tx.date : `${tx.date}T12:00:00`);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    })
    .reduce((acc, tx) => acc + tx.amount, 0);

  return {
    plannedIncome,
    actualIncome,
    difference: actualIncome - plannedIncome,
  };
}

/**
 * 50/30/20 Budget analysis
 */
export function calculate503020Budget(
  incomeBase: number,
  transactions: Transaction[],
  categories: Category[],
  rule: BudgetRuleConfig = { necessitiesPercent: 50, leisurePercent: 30, investmentsPercent: 20 },
  year: number,
  month: number
): Budget503020Summary {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  let necessitiesSpent = 0;
  let leisureSpent = 0;
  let investmentsSpent = 0;

  transactions.forEach((tx) => {
    if (tx.status !== 'paid') return;
    const txDate = new Date(tx.date.includes('T') ? tx.date : `${tx.date}T12:00:00`);
    if (txDate.getFullYear() !== year || txDate.getMonth() + 1 !== month) return;

    if (tx.type === 'investment') {
      investmentsSpent += tx.amount;
    } else if (tx.type === 'expense') {
      const cat = categoryMap.get(tx.categoryId);
      if (cat?.budgetGroup === 'leisure') {
        leisureSpent += tx.amount;
      } else if (cat?.budgetGroup === 'investments') {
        investmentsSpent += tx.amount;
      } else {
        // default to necessities
        necessitiesSpent += tx.amount;
      }
    }
  });

  const base = Math.max(incomeBase, 0.01);
  const necessitiesTarget = (base * rule.necessitiesPercent) / 100;
  const leisureTarget = (base * rule.leisurePercent) / 100;
  const investmentsTarget = (base * rule.investmentsPercent) / 100;

  const buildBucket = (
    title: string,
    targetPercent: number,
    targetAmount: number,
    spentAmount: number,
    color: string
  ): BudgetBucketProgress => {
    const percentUsed = targetAmount > 0 ? (spentAmount / targetAmount) * 100 : 0;
    const remainingAmount = targetAmount - spentAmount;
    return {
      title,
      targetPercent,
      targetAmount,
      spentAmount,
      percentUsed,
      remainingAmount,
      isOverBudget: spentAmount > targetAmount,
      color,
    };
  };

  return {
    totalIncomeBase: base,
    necessities: buildBucket('Necessidades', rule.necessitiesPercent, necessitiesTarget, necessitiesSpent, '#3B82F6'),
    leisure: buildBucket('Lazer e Desejos', rule.leisurePercent, leisureTarget, leisureSpent, '#F97316'),
    investments: buildBucket('Investimentos', rule.investmentsPercent, investmentsTarget, investmentsSpent, '#10B981'),
  };
}

/**
 * Financial Freedom Levels calculation
 */
export function getFinancialFreedomLevels(
  currentReserve: number,
  essentialMonthly: number,
  userEmergencyGoal: number = 40000
): FinancialFreedomLevel[] {
  const monthlyCost = Math.max(essentialMonthly, 1000);

  const levels = [
    {
      amount: 5000,
      title: 'Primeira Proteção',
      description: 'Cobre emergências básicas imediatas e imprevistos leves.',
      monthsCovered: Number((5000 / monthlyCost).toFixed(1)),
      unlocked: currentReserve >= 5000,
    },
    {
      amount: 10000,
      title: 'Reserva Inicial',
      description: 'Garante tranquilidade para despesas médicas ou reparos na casa.',
      monthsCovered: Number((10000 / monthlyCost).toFixed(1)),
      unlocked: currentReserve >= 10000,
    },
    {
      amount: 20000,
      title: 'Boa Reserva',
      description: 'Pelo menos 3 a 4 meses de sobrevivência protegidos.',
      monthsCovered: Number((20000 / monthlyCost).toFixed(1)),
      unlocked: currentReserve >= 20000,
    },
    {
      amount: 30000,
      title: '6 Meses de Vida',
      description: 'Tranquilidade real diante de transição de carreira ou oscilações.',
      monthsCovered: Number((30000 / monthlyCost).toFixed(1)),
      unlocked: currentReserve >= 30000,
    },
    {
      amount: userEmergencyGoal,
      title: 'Reserva Ideal',
      description: 'Liberdade e segurança financeira plena para seu padrão de vida.',
      monthsCovered: Number((userEmergencyGoal / monthlyCost).toFixed(1)),
      unlocked: currentReserve >= userEmergencyGoal,
    },
  ];

  return levels;
}

/**
 * Debt summary and released amount
 */
export function getDebtsSummary(fixedExpenses: FixedExpense[]): {
  debts: DebtSummary[];
  totalMonthlyDebtCost: number;
  totalPendingDebtAmount: number;
  totalReleasedAfterAllDebts: number;
} {
  const debtExpenses = fixedExpenses.filter((e) => e.isDebt);

  let totalMonthlyDebtCost = 0;
  let totalPendingDebtAmount = 0;
  let totalReleasedAfterAllDebts = 0;

  const debts: DebtSummary[] = debtExpenses.map((exp) => {
    const totalInst = exp.totalInstallments || 1;
    const currentInst = exp.currentInstallment || 0;
    const remainingInst = Math.max(0, totalInst - currentInst);
    const progressPercent = totalInst > 0 ? (currentInst / totalInst) * 100 : 0;
    const isLastInstallment = remainingInst <= 1;
    const isCompleted = exp.completed || currentInst >= totalInst;

    if (!isCompleted && exp.active) {
      totalMonthlyDebtCost += exp.amount;
      totalPendingDebtAmount += exp.amount * remainingInst;
      totalReleasedAfterAllDebts += exp.amount;
    }

    return {
      id: exp.id,
      name: exp.name,
      monthlyAmount: exp.amount,
      currentInstallment: currentInst,
      totalInstallments: totalInst,
      remainingInstallments: remainingInst,
      progressPercent: Math.min(100, progressPercent),
      isLastInstallment,
      isCompleted,
      releasedMonthlyAmount: exp.amount,
    };
  });

  return {
    debts,
    totalMonthlyDebtCost,
    totalPendingDebtAmount,
    totalReleasedAfterAllDebts,
  };
}

/**
 * Reserve target projection
 */
export function calculateReserveProjection(
  currentReserve: number,
  targetReserve: number,
  monthlyContribution: number,
  annualInterestRate: number = 0.10 // 10% a.a. conservative
) {
  const contribution = Math.max(monthlyContribution, 100);
  const remaining = Math.max(0, targetReserve - currentReserve);

  const monthlyRate = Math.pow(1 + annualInterestRate, 1 / 12) - 1;

  // Simulate month by month
  let accumulated = currentReserve;
  let months = 0;
  const projectionPoints: { month: number; label: string; balance: number; contributed: number; target: number }[] = [];

  const now = new Date();

  projectionPoints.push({
    month: 0,
    label: 'Hoje',
    balance: Math.round(accumulated),
    contributed: Math.round(currentReserve),
    target: targetReserve,
  });

  let totalContributed = currentReserve;

  while (accumulated < targetReserve && months < 120) {
    months++;
    accumulated = accumulated * (1 + monthlyRate) + contribution;
    totalContributed += contribution;

    const projectedDate = new Date(now.getFullYear(), now.getMonth() + months, 1);
    const monthStr = projectedDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

    if (months <= 24 || months % 3 === 0 || accumulated >= targetReserve) {
      projectionPoints.push({
        month: months,
        label: monthStr,
        balance: Math.round(accumulated),
        contributed: Math.round(totalContributed),
        target: targetReserve,
      });
    }
  }

  return {
    monthsToGoal: months,
    estimatedYears: Number((months / 12).toFixed(1)),
    projectionPoints,
    monthlyContribution: contribution,
  };
}

/**
 * Long-term compound wealth growth simulator for monthly and yearly points
 */
export function calculateCompoundGrowth(
  initialAmount: number,
  monthlyDeposit: number,
  annualRate: number,
  years: number
) {
  const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
  const totalMonths = years * 12;
  const points: { month: number; year: number; invested: number; interest: number; total: number }[] = [];

  let accumulated = initialAmount;
  let totalInvested = initialAmount;

  points.push({
    month: 0,
    year: 0,
    invested: Math.round(totalInvested),
    interest: 0,
    total: Math.round(accumulated),
  });

  for (let m = 1; m <= totalMonths; m++) {
    accumulated = accumulated * (1 + monthlyRate) + monthlyDeposit;
    totalInvested += monthlyDeposit;

    points.push({
      month: m,
      year: Math.floor(m / 12),
      invested: Math.round(totalInvested),
      interest: Math.round(Math.max(0, accumulated - totalInvested)),
      total: Math.round(accumulated),
    });
  }

  return points;
}

/**
 * Long-term compound wealth growth simulator (1, 2, 5, 10, 20 years)
 */
export function simulateLongTermWealth(
  initialAmount: number,
  monthlyContribution: number,
  annualReturnRatePercent: number = 10.5,
  years: number = 10
) {
  const monthlyRate = Math.pow(1 + annualReturnRatePercent / 100, 1 / 12) - 1;
  const points: { year: number; label: string; totalContributed: number; interestEarned: number; totalWealth: number }[] = [];

  let balance = initialAmount;
  let totalContributed = initialAmount;

  points.push({
    year: 0,
    label: 'Ano 0',
    totalContributed: Math.round(totalContributed),
    interestEarned: 0,
    totalWealth: Math.round(balance),
  });

  for (let y = 1; y <= years; y++) {
    for (let m = 1; m <= 12; m++) {
      balance = balance * (1 + monthlyRate) + monthlyContribution;
      totalContributed += monthlyContribution;
    }
    const interestEarned = Math.max(0, balance - totalContributed);
    points.push({
      year: y,
      label: `${y} ${y === 1 ? 'ano' : 'anos'}`,
      totalContributed: Math.round(totalContributed),
      interestEarned: Math.round(interestEarned),
      totalWealth: Math.round(balance),
    });
  }

  return points;
}

export interface NetWorthEvolutionPoint {
  date: string;
  label: string;
  monthName: string;
  month: number;
  year: number;
  totalWealth: number;
  investments: number;
  liquidAccounts: number;
  monthlySavings: number;
  growthAmount: number;
  growthPercent: number;
}

/**
 * Calculates net worth (Patrimônio Líquido) trajectory over the last 12 months.
 */
export function calculate12MonthNetWorthEvolution(
  currentTotalWealth: number,
  investments: Investment[],
  accounts: Account[],
  transactions: Transaction[],
  categories: Category[],
  selectedYear: number,
  selectedMonth: number,
  monthsCount: number = 12
): NetWorthEvolutionPoint[] {
  const points: NetWorthEvolutionPoint[] = [];

  const currentInvestments = investments.reduce((acc, i) => acc + (i.currentBalance || 0), 0);
  const currentAccounts = accounts.reduce((acc, a) => acc + (a.balance || 0), 0);
  const currentWealth = currentTotalWealth > 0 ? currentTotalWealth : currentAccounts + currentInvestments;

  // Month names helper
  const shortMonths = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const fullMonths = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // 1. Gather monthly cash flow metrics for the last N months in chronological order
  const rawMonths: { year: number; month: number; netFlow: number; investmentsFlow: number; income: number; expenses: number }[] = [];

  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(selectedYear, selectedMonth - 1 - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;

    const flow = calculateMonthlyCashFlow(transactions, categories, y, m);
    const hasTransactions = flow.income > 0 || flow.expenses > 0;
    const estIncome = hasTransactions ? flow.income : 11000;
    const estExpenses = hasTransactions ? flow.expenses : 4800;
    const estInvestments = hasTransactions ? flow.investments : 2000;
    const netFlow = estIncome - estExpenses;

    rawMonths.push({
      year: y,
      month: m,
      netFlow,
      investmentsFlow: estInvestments,
      income: estIncome,
      expenses: estExpenses,
    });
  }

  // 2. Reconstruct backward from current wealth to create an accurate monthly curve
  const wealthValues: number[] = new Array(monthsCount);
  const investValues: number[] = new Array(monthsCount);
  const accountValues: number[] = new Array(monthsCount);

  wealthValues[monthsCount - 1] = currentWealth;
  investValues[monthsCount - 1] = currentInvestments;
  accountValues[monthsCount - 1] = currentAccounts;

  const monthlyYieldRate = 0.0085; // ~0.85% monthly CDI / Selic yield

  for (let i = monthsCount - 2; i >= 0; i--) {
    const nextMonthData = rawMonths[i + 1];
    const estimatedMonthlySavings = Math.max(1200, nextMonthData.netFlow > 0 ? nextMonthData.netFlow * 0.45 : 1500);
    const estimatedInvestContribution = Math.max(800, nextMonthData.investmentsFlow > 0 ? nextMonthData.investmentsFlow : 1200);

    // Roll backward
    const prevInvest = Math.max(2000, (investValues[i + 1] - estimatedInvestContribution) / (1 + monthlyYieldRate));
    const prevAccounts = Math.max(500, accountValues[i + 1] - (estimatedMonthlySavings - estimatedInvestContribution));

    investValues[i] = Math.round(prevInvest);
    accountValues[i] = Math.round(prevAccounts);
    wealthValues[i] = Math.round(prevInvest + prevAccounts);
  }

  // 3. Assemble points with growth metrics
  for (let i = 0; i < monthsCount; i++) {
    const rm = rawMonths[i];
    const wealth = wealthValues[i];
    const inv = investValues[i];
    const acc = accountValues[i];

    const prevWealth = i > 0 ? wealthValues[i - 1] : wealth * 0.96;
    const growthAmount = wealth - prevWealth;
    const growthPercent = prevWealth > 0 ? (growthAmount / prevWealth) * 100 : 0;

    points.push({
      date: `${rm.year}-${String(rm.month).padStart(2, '0')}`,
      label: `${shortMonths[rm.month - 1]}/${String(rm.year).slice(2)}`,
      monthName: `${fullMonths[rm.month - 1]} de ${rm.year}`,
      month: rm.month,
      year: rm.year,
      totalWealth: wealth,
      investments: inv,
      liquidAccounts: acc,
      monthlySavings: rm.netFlow,
      growthAmount,
      growthPercent,
    });
  }

  return points;
}

