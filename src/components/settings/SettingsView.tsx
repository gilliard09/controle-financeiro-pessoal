import React, { useState } from 'react';
import {
  Building2,
  Check,
  CheckCircle2,
  Cloud,
  Code,
  Copy,
  Database,
  Download,
  Edit2,
  Globe,
  Info,
  Lock,
  Moon,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Smartphone,
  Sun,
  Tag,
  Trash2,
  Upload,
  User,
  Wallet,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { IncomeSource } from '../../types';
import { formatCurrency, parseCurrencyInput } from '../../utils/formatters';
import { isSupabaseConfigured } from '../../lib/supabase';
import { ModulesPanel } from './ModulesPanel';

export const SettingsView: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const {
    incomeSources,
    categories,
    accounts,
    addIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,
    addCategory,
    deleteCategory,
    exportDataJson,
    importDataJson,
    resetToDefaultData,
    migrateFromDeviceToCloud,
  } = useFinance();

  const [userName, setUserName] = useState(user?.name || 'Usuário');
  const [emergencyGoal, setEmergencyGoal] = useState(user?.emergencyGoal || 40000);
  const [monthsTarget, setMonthsTarget] = useState(user?.emergencyTargetMonths || 6);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Cloud sync state
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<string | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // New Income modal state
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeSource | null>(null);
  const [incomeName, setIncomeName] = useState('');
  const [incomeAmountStr, setIncomeAmountStr] = useState('');
  const [incomeDay, setIncomeDay] = useState(5);
  const [incomeType, setIncomeType] = useState('Salário');

  // New category state
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatGroup, setNewCatGroup] = useState<'necessities' | 'leisure' | 'investments'>('necessities');

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const isCloudActive = isSupabaseConfigured();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name: userName.trim(),
      emergencyGoal: Number(emergencyGoal),
      emergencyTargetMonths: Number(monthsTarget),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleMigrateToCloud = async () => {
    setIsMigrating(true);
    setMigrationResult(null);
    try {
      const res = await migrateFromDeviceToCloud();
      setMigrationResult(res.message);
    } finally {
      setIsMigrating(false);
    }
  };

  const sqlSchemaScript = `-- CONTROLE FINANCEIRO PESSOAL - SCHEMA OFICIAL SUPABASE
-- Execute no SQL Editor do seu projeto Supabase:

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

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'expense',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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

-- RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários gerenciam apenas suas próprias transações" ON public.transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários gerenciam apenas seus próprios investimentos" ON public.investments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários gerenciam apenas suas despesas fixas" ON public.recurring_expenses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários gerenciam apenas suas fontes de renda" ON public.income_sources FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários gerenciam apenas suas metas" ON public.goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários gerenciam apenas suas categorias" ON public.categories FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários gerenciam seu próprio perfil" ON public.user_profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlSchemaScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const openIncomeModal = (src?: IncomeSource) => {
    if (src) {
      setEditingIncome(src);
      setIncomeName(src.name);
      setIncomeAmountStr(src.amount.toString().replace('.', ','));
      setIncomeDay(src.receiveDay);
      setIncomeType(src.type);
    } else {
      setEditingIncome(null);
      setIncomeName('');
      setIncomeAmountStr('');
      setIncomeDay(5);
      setIncomeType('Salário');
    }
    setShowIncomeModal(true);
  };

  const handleSaveIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseCurrencyInput(incomeAmountStr);
    if (!incomeName.trim() || amount <= 0) return;

    if (editingIncome) {
      await updateIncomeSource(editingIncome.id, {
        name: incomeName.trim(),
        amount,
        receiveDay: Number(incomeDay),
        type: incomeType,
      });
    } else {
      await addIncomeSource({
        name: incomeName.trim(),
        amount,
        receiveDay: Number(incomeDay),
        type: incomeType,
        active: true,
      });
    }

    setShowIncomeModal(false);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await addCategory({
      name: newCatName.trim(),
      color: '#059669',
      group: newCatGroup,
      type: 'expense',
    });
    setNewCatName('');
    setShowCategoryInput(false);
  };

  const handleExport = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meu-controle-financeiro-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const ok = importDataJson(content);
      if (ok) {
        setImportStatus('Dados importados com sucesso!');
        setTimeout(() => setImportStatus(null), 4000);
      } else {
        setImportStatus('Erro: arquivo de backup inválido.');
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  const totalMonthlyIncomeExpected = incomeSources
    .filter((s) => s.active)
    .reduce((acc, s) => acc + s.amount, 0);

  return (
    <div className="space-y-6 pb-24 lg:pb-12 max-w-4xl animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
          Configurações & Nuvem
        </h1>
        <p className="text-xs sm:text-sm text-white/50 mt-0.5">
          Sincronização multi-dispositivo (Supabase), fontes de renda, perfil e segurança
        </p>
      </div>

      {/* KingdomOS: gerenciamento de módulos */}
      <ModulesPanel />

      {/* 1. Supabase Cloud Sync Card */}
      <div className="bg-[#141112] rounded-3xl p-5 sm:p-6 border border-white/10 shadow-2xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isCloudActive ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Sincronização Multi-Dispositivo (Supabase)
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isCloudActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                  {isCloudActive ? 'Conectado à Nuvem' : 'Modo Local'}
                </span>
              </div>
              <p className="text-xs text-white/50">
                Seus lançamentos, investimentos e metas sincronizados entre celular e computador.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSqlModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold border border-white/10 self-start sm:self-auto transition-colors"
          >
            <Code className="w-3.5 h-3.5 text-[#f74603]" />
            <span>Script SQL Supabase</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Smartphone className="w-4 h-4 text-[#f74603]" />
              <span>Acesso em Qualquer Aparelho</span>
            </div>
            <p className="text-[11px] text-white/50">
              Ao cadastrar ou alterar despesas, o Supabase atualiza instantaneamente todos os seus dispositivos.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Segurança RLS (Row Level Security)</span>
            </div>
            <p className="text-[11px] text-white/50">
              Apenas o seu usuário autenticado (<span className="font-mono text-white/80">{user?.email || 'você'}</span>) pode visualizar seus dados financeiros.
            </p>
          </div>
        </div>

        {/* 1-Click Migration Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            onClick={handleMigrateToCloud}
            disabled={isMigrating}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f74603] to-[#e85002] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#f74603]/25 glow-orange-sm transition-all disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{isMigrating ? 'Sincronizando com Supabase...' : 'Migrar Dados Deste Dispositivo para Nuvem'}</span>
          </button>

          {migrationResult && (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
              {migrationResult}
            </span>
          )}
        </div>
      </div>

      {/* 2. Profile Settings */}
      <div className="bg-[#141112] rounded-3xl p-5 sm:p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
          <div className="p-2 rounded-xl bg-[#f74603]/15 text-[#f74603] border border-[#f74603]/25">
            <User className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Perfil & Metas de Segurança
          </h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
                Seu Nome
              </label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/40 text-xs font-semibold text-white placeholder:text-white/30 focus:outline-none focus:border-[#f74603]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
                Meta da Reserva de Emergência (R$)
              </label>
              <input
                type="number"
                required
                value={emergencyGoal}
                onChange={(e) => setEmergencyGoal(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/40 text-xs font-extrabold text-[#f74603] focus:outline-none focus:border-[#f74603]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
                Meses de Segurança Desejados
              </label>
              <input
                type="number"
                min="3"
                max="24"
                required
                value={monthsTarget}
                onChange={(e) => setMonthsTarget(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/40 text-xs font-extrabold text-white focus:outline-none focus:border-[#f74603]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveSuccess ? (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Alterações salvas com sucesso!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f74603] to-[#e85002] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#f74603]/25 glow-orange-sm transition-all"
            >
              Salvar Perfil
            </button>
          </div>
        </form>
      </div>

      {/* 3. Income Sources Management */}
      <div className="bg-[#141112] rounded-3xl p-5 sm:p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Fontes de Renda Previstas
              </h3>
              <p className="text-xs text-white/50">
                Total previsto mensal: <strong className="text-emerald-400">{formatCurrency(totalMonthlyIncomeExpected)}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => openIncomeModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold self-start sm:self-auto shadow-md glow-emerald-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Adicionar Fonte de Renda</span>
          </button>
        </div>

        <div className="divide-y divide-white/5">
          {incomeSources.map((src) => (
            <div
              key={src.id}
              className="py-3.5 flex items-center justify-between gap-3 hover:bg-white/5 px-3 rounded-2xl transition-colors"
            >
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">
                  {src.name}
                </p>
                <span className="text-[11px] text-white/40">
                  {src.type} • Recebimento previsto todo dia {src.receiveDay}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-extrabold text-emerald-400">
                  {formatCurrency(src.amount)}
                </span>
                <button
                  onClick={() => openIncomeModal(src)}
                  className="p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteIncomeSource(src.id)}
                  className="p-1.5 rounded-xl text-white/40 hover:text-rose-400 hover:bg-rose-500/15 transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Expense Categories */}
      <div className="bg-[#141112] rounded-3xl p-5 sm:p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/5 text-[#f74603] border border-white/10">
              <Tag className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Categorias de Despesas & Lazer
            </h3>
          </div>

          <button
            onClick={() => setShowCategoryInput(!showCategoryInput)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#f74603]" />
            <span>Nova Categoria</span>
          </button>
        </div>

        {showCategoryInput && (
          <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-black/40 border border-white/10 rounded-2xl animate-in fade-in">
            <input
              type="text"
              required
              placeholder="Nome da categoria..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-white/10 text-xs text-white bg-[#1c181a] focus:outline-none focus:border-[#f74603]"
            />
            <select
              value={newCatGroup}
              onChange={(e) => setNewCatGroup(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-white/10 text-xs text-white bg-[#1c181a] focus:outline-none focus:border-[#f74603]"
            >
              <option value="necessities">Necessidades (50%)</option>
              <option value="leisure">Lazer & Desejos (30%)</option>
              <option value="investments">Investimentos & Futuro (20%)</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#f74603] to-[#e85002] text-white text-xs font-bold glow-orange-sm hover:opacity-90 transition-all"
            >
              Salvar
            </button>
          </form>
        )}

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
            >
              <span className="font-semibold">{cat.name}</span>
              <span className="text-[10px] text-white/40 font-mono">
                ({cat.group === 'necessities' ? '50%' : cat.group === 'leisure' ? '30%' : '20%'})
              </span>
              <button
                onClick={() => {
                  if (window.confirm(`Excluir a categoria "${cat.name}"? Transações já lançadas nela não serão apagadas.`)) {
                    deleteCategory(cat.id);
                  }
                }}
                className="text-white/40 hover:text-rose-400 ml-1 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Backup & Restauração */}
      <div className="bg-[#141112] rounded-3xl p-5 sm:p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
          <div className="p-2 rounded-xl bg-white/5 text-[#f74603] border border-white/10">
            <Database className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Backup & Cópia de Segurança Local (JSON)
          </h3>
        </div>

        <p className="text-xs text-white/50 leading-relaxed">
          Você também pode gerar um arquivo .json para backup manual e importar em outro navegador quando desejar.
        </p>

        {importStatus && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-in fade-in">
            {importStatus}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-colors"
          >
            <Download className="w-4 h-4 text-[#f74603]" />
            <span>Exportar Backup (JSON)</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-[#f74603]" />
            <span>Importar Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (window.confirm('Isso vai APAGAR seus dados atuais e substituir pelos dados de demonstração. Essa ação não pode ser desfeita. Deseja continuar?')) {
                resetToDefaultData();
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-bold transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Restaurar Dados de Demonstração</span>
          </button>
        </div>
      </div>

      {/* SQL Script Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#141112] w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl border border-white/15 p-6 flex flex-col space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-[#f74603]" />
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  Script SQL Oficial do Supabase
                </h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-white/40 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-white/60">
              Copie o código abaixo e cole no <strong>SQL Editor</strong> do painel do seu projeto Supabase para criar todas as tabelas e políticas de segurança RLS:
            </p>

            <div className="flex-1 overflow-auto bg-black/60 p-4 rounded-2xl border border-white/10 font-mono text-[11px] text-emerald-300 select-all max-h-96">
              <pre>{sqlSchemaScript}</pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={copySqlToClipboard}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#f74603] to-[#e85002] text-white text-xs font-bold shadow-lg shadow-[#f74603]/25 glow-orange-sm transition-all"
              >
                {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? 'Copiado para Área de Transferência!' : 'Copiar Script SQL'}</span>
              </button>

              <button
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white/50 hover:text-white"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Income Modal */}
      {showIncomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#141112] w-full max-w-md rounded-3xl shadow-2xl border border-white/15 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-extrabold text-white border-b border-white/10 pb-3 tracking-tight">
              {editingIncome ? 'Editar Fonte de Renda' : 'Nova Fonte de Renda'}
            </h3>

            <form onSubmit={handleSaveIncome} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
                  Nome da Renda
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Salário Empresa X, Lucro, Freelance..."
                  value={incomeName}
                  onChange={(e) => setIncomeName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/40 text-xs font-semibold text-white placeholder:text-white/30 focus:outline-none focus:border-[#f74603]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
                    Valor Mensal (R$)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0,00"
                    value={incomeAmountStr}
                    onChange={(e) => setIncomeAmountStr(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/40 text-xs font-extrabold text-emerald-400 placeholder:text-white/30 focus:outline-none focus:border-[#f74603]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
                    Dia Previsto de Recebimento
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={incomeDay}
                    onChange={(e) => setIncomeDay(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/40 text-xs font-semibold text-white focus:outline-none focus:border-[#f74603]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowIncomeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 glow-emerald-sm transition-all"
                >
                  Salvar Renda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
