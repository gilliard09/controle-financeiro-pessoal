-- ==============================================================================
-- CONTROLE FINANCEIRO PESSOAL - SUPABASE DATABASE SCHEMA
-- Execute este script no SQL Editor do seu projeto Supabase
-- ==============================================================================

-- 1. TABELA: transactions (Movimentações financeiras)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'investment', 'transfer')),
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category TEXT NOT NULL DEFAULT 'Geral',
    status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA: investments (Investimentos e Reserva de Emergência)
CREATE TABLE IF NOT EXISTS public.investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'CDB',
    institution TEXT NOT NULL DEFAULT 'Banco',
    amount NUMERIC NOT NULL DEFAULT 0,
    current_balance NUMERIC NOT NULL DEFAULT 0,
    profit NUMERIC DEFAULT 0,
    profit_percentage NUMERIC DEFAULT 0,
    liquidity TEXT DEFAULT 'daily',
    due_date DATE,
    is_emergency_reserve BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA: recurring_expenses (Despesas fixas e dívidas recorrentes)
CREATE TABLE IF NOT EXISTS public.recurring_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
    category TEXT NOT NULL DEFAULT 'Contas Fixas',
    active BOOLEAN NOT NULL DEFAULT true,
    installments_total INTEGER DEFAULT NULL,
    installments_remaining INTEGER DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA: income_sources (Fontes de renda mensais)
CREATE TABLE IF NOT EXISTS public.income_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    expected_amount NUMERIC NOT NULL,
    due_day INTEGER NOT NULL DEFAULT 5 CHECK (due_day >= 1 AND due_day <= 31),
    is_variable BOOLEAN NOT NULL DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABELA: goals (Metas financeiras e sonhos)
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount NUMERIC NOT NULL,
    current_amount NUMERIC NOT NULL DEFAULT 0,
    deadline DATE,
    category TEXT NOT NULL DEFAULT 'Geral',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABELA: categories (Categorias personalizadas)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'expense' CHECK (type IN ('expense', 'income')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABELA: user_profiles (Configurações de perfil e metas de reserva)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    emergency_goal NUMERIC DEFAULT 40000,
    necessities_percent NUMERIC DEFAULT 50,
    leisure_percent NUMERIC DEFAULT 30,
    investments_percent NUMERIC DEFAULT 20,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- INDEXAÇÃO PARA MÁXIMA PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_investments_user ON public.investments(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_user ON public.recurring_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_income_sources_user ON public.income_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user ON public.categories(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) - ISOLAMENTO TOTAL POR USUÁRIO
-- ==============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 1. POLÍTICAS PARA TRANSACTIONS
DROP POLICY IF EXISTS "Usuários gerenciam apenas suas próprias transações" ON public.transactions;
CREATE POLICY "Usuários gerenciam apenas suas próprias transações"
    ON public.transactions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. POLÍTICAS PARA INVESTMENTS
DROP POLICY IF EXISTS "Usuários gerenciam apenas seus próprios investimentos" ON public.investments;
CREATE POLICY "Usuários gerenciam apenas seus próprios investimentos"
    ON public.investments FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. POLÍTICAS PARA RECURRING_EXPENSES
DROP POLICY IF EXISTS "Usuários gerenciam apenas suas despesas fixas" ON public.recurring_expenses;
CREATE POLICY "Usuários gerenciam apenas suas despesas fixas"
    ON public.recurring_expenses FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. POLÍTICAS PARA INCOME_SOURCES
DROP POLICY IF EXISTS "Usuários gerenciam apenas suas fontes de renda" ON public.income_sources;
CREATE POLICY "Usuários gerenciam apenas suas fontes de renda"
    ON public.income_sources FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. POLÍTICAS PARA GOALS
DROP POLICY IF EXISTS "Usuários gerenciam apenas suas metas" ON public.goals;
CREATE POLICY "Usuários gerenciam apenas suas metas"
    ON public.goals FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6. POLÍTICAS PARA CATEGORIES
DROP POLICY IF EXISTS "Usuários gerenciam apenas suas categorias" ON public.categories;
CREATE POLICY "Usuários gerenciam apenas suas categorias"
    ON public.categories FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 7. POLÍTICAS PARA USER_PROFILES
DROP POLICY IF EXISTS "Usuários gerenciam seu próprio perfil" ON public.user_profiles;
CREATE POLICY "Usuários gerenciam seu próprio perfil"
    ON public.user_profiles FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ==============================================================================
-- HABILITAR SUPABASE REALTIME
-- ==============================================================================
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE 
    public.transactions, 
    public.investments, 
    public.recurring_expenses, 
    public.income_sources, 
    public.goals, 
    public.categories, 
    public.user_profiles;
COMMIT;
