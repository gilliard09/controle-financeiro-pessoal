import React, { useState } from 'react';
import {
  Building2,
  Check,
  CheckCircle2,
  Database,
  Download,
  Edit2,
  Globe,
  Lock,
  Moon,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Sun,
  Tag,
  Trash2,
  Upload,
  User,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { IncomeSource } from '../../types';
import { formatCurrency, parseCurrencyInput } from '../../utils/formatters';

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
  } = useFinance();

  const [userName, setUserName] = useState(user?.name || 'Jeferson');
  const [emergencyGoal, setEmergencyGoal] = useState(user?.emergencyGoal || 40000);
  const [monthsTarget, setMonthsTarget] = useState(user?.emergencyTargetMonths || 6);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: userName.trim(),
      emergencyGoal: Number(emergencyGoal),
      emergencyTargetMonths: Number(monthsTarget),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
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

  const handleSaveIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseCurrencyInput(incomeAmountStr);
    if (!incomeName.trim() || amount <= 0) return;

    if (editingIncome) {
      updateIncomeSource(editingIncome.id, {
        name: incomeName.trim(),
        amount,
        receiveDay: Number(incomeDay),
        type: incomeType,
      });
    } else {
      addIncomeSource({
        name: incomeName.trim(),
        amount,
        receiveDay: Number(incomeDay),
        type: incomeType,
        active: true,
      });
    }

    setShowIncomeModal(false);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({
      name: newCatName.trim(),
      color: '#059669',
      group: newCatGroup,
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
          Configurações & Renda
        </h1>
        <p className="text-xs sm:text-sm text-white/50 mt-0.5">
          Gerencie seu perfil, fontes de renda, metas de segurança, categorias e backups
        </p>
      </div>

      {/* 1. Profile Settings */}
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

      {/* 2. Income Sources Management (Section 7) */}
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

      {/* 3. Expense Categories */}
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
                onClick={() => deleteCategory(cat.id)}
                className="text-white/40 hover:text-rose-400 ml-1 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Backup, Export & Reset */}
      <div className="bg-[#141112] rounded-3xl p-5 sm:p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
          <div className="p-2 rounded-xl bg-white/5 text-[#f74603] border border-white/10">
            <Database className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Backup & Segurança dos Dados
          </h3>
        </div>

        <p className="text-xs text-white/50 leading-relaxed">
          Seus dados são armazenados localmente e criptografados no navegador. Você pode baixar uma cópia de segurança a qualquer momento ou restaurar os dados originais.
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
              if (window.confirm('Deseja restaurar os dados padrão de demonstração de Jeferson?')) {
                resetToDefaultData();
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-bold transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Restaurar Dados de Jeferson</span>
          </button>
        </div>
      </div>

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
