import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  Edit3,
  Percent,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Investment, InvestmentType } from '../../types';
import { formatCurrency, formatDate, formatPercent, parseCurrencyInput } from '../../utils/formatters';

export const InvestmentsView: React.FC = () => {
  const {
    investments,
    emergencyReserve,
    totalWealth,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    updateInvestmentBalance,
    triggerConfetti,
  } = useFinance();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInv, setEditingInv] = useState<Investment | null>(null);
  const [balanceUpdateModal, setBalanceUpdateModal] = useState<Investment | null>(null);
  const [newBalanceInput, setNewBalanceInput] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentType>('CDB');
  const [institution, setInstitution] = useState('');
  const [investedAmountStr, setInvestedAmountStr] = useState('');
  const [currentBalanceStr, setCurrentBalanceStr] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [profitabilityRate, setProfitabilityRate] = useState('100% CDI');
  const [liquidity, setLiquidity] = useState('daily');
  const [maturityDate, setMaturityDate] = useState('');
  const [isEmergencyReserve, setIsEmergencyReserve] = useState(false);
  const [cdiPercentage, setCdiPercentage] = useState(100);
  const [notes, setNotes] = useState('');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const totalInvestedSum = investments.reduce((acc, i) => acc + (i.investedAmount || 0), 0);
  const totalBalanceSum = investments.reduce((acc, i) => acc + (i.currentBalance || 0), 0);
  const totalProfitSum = totalBalanceSum - totalInvestedSum;

  const openNewModal = () => {
    setEditingInv(null);
    setName('');
    setType('CDB');
    setInstitution('Banco Inter');
    setInvestedAmountStr('');
    setCurrentBalanceStr('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setProfitabilityRate('100% CDI');
    setLiquidity('daily');
    setMaturityDate('');
    setIsEmergencyReserve(false);
    setCdiPercentage(100);
    setNotes('');
    setShowAddModal(true);
  };

  const openEditModal = (inv: Investment) => {
    setEditingInv(inv);
    setName(inv.name);
    setType(inv.type);
    setInstitution(inv.institution);
    setInvestedAmountStr(inv.investedAmount.toString().replace('.', ','));
    setCurrentBalanceStr(inv.currentBalance.toString().replace('.', ','));
    setStartDate(inv.startDate);
    setProfitabilityRate(inv.profitabilityRate || '100% CDI');
    setLiquidity(inv.liquidity || 'daily');
    setMaturityDate(inv.maturityDate || '');
    setIsEmergencyReserve(inv.isEmergencyReserve);
    setCdiPercentage(inv.cdiPercentage || 100);
    setNotes(inv.notes || '');
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const invested = parseCurrencyInput(investedAmountStr);
    const current = currentBalanceStr ? parseCurrencyInput(currentBalanceStr) : invested;

    if (!name.trim() || invested <= 0) return;

    if (editingInv) {
      updateInvestment(editingInv.id, {
        name: name.trim(),
        type,
        institution: institution.trim() || 'Outro',
        investedAmount: invested,
        currentBalance: current,
        startDate,
        profitabilityRate: type === 'CDB' ? `${cdiPercentage}% CDI` : profitabilityRate,
        liquidity,
        maturityDate: maturityDate || undefined,
        isEmergencyReserve,
        cdiPercentage: type === 'CDB' ? Number(cdiPercentage) : undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      addInvestment({
        name: name.trim(),
        type,
        institution: institution.trim() || 'Outro',
        investedAmount: invested,
        currentBalance: current,
        startDate,
        profitabilityRate: type === 'CDB' ? `${cdiPercentage}% CDI` : profitabilityRate,
        liquidity,
        maturityDate: maturityDate || undefined,
        isEmergencyReserve,
        cdiPercentage: type === 'CDB' ? Number(cdiPercentage) : undefined,
        notes: notes.trim() || undefined,
      });
    }

    setShowAddModal(false);
  };

  const handleUpdateBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceUpdateModal) return;
    const nextVal = parseCurrencyInput(newBalanceInput);
    if (nextVal >= 0) {
      updateInvestmentBalance(balanceUpdateModal.id, nextVal);
      triggerConfetti();
    }
    setBalanceUpdateModal(null);
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Investimentos & Patrimônio
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-0.5 font-medium">
            Acompanhe a rentabilidade da sua carteira e o progresso da sua reserva de emergência
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#f74603] to-[#e85002] hover:from-[#e85002] hover:to-[#d03d00] text-white text-xs font-bold shadow-[0_0_20px_rgba(247,70,3,0.35)] self-start sm:self-auto transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Ativo / CDB</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Invested */}
        <div className="bg-[#141112] p-5 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-brand-orange/10 rounded-full blur-2xl pointer-events-none" />
          <span className="text-xs font-semibold text-white/50 block mb-1">
            Saldo Total em Investimentos
          </span>
          <p className="text-2xl font-extrabold text-white tracking-tight">
            {formatCurrency(totalBalanceSum)}
          </p>
          <div className="flex items-center gap-2 mt-2 text-[11px] font-medium flex-wrap">
            <span className="text-white/40">Aportado: {formatCurrency(totalInvestedSum)}</span>
            <span className="font-bold text-emerald-400">
              (+{formatCurrency(Math.max(0, totalProfitSum))})
            </span>
          </div>
        </div>

        {/* Emergency Reserve Tagged */}
        <div className="bg-[#141112] p-5 rounded-2xl border border-emerald-500/30 shadow-lg relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-emerald-400">
              Reserva de Emergência
            </span>
            <div className="p-1 rounded-lg bg-emerald-500/15 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 tracking-tight">
            {formatCurrency(emergencyReserve)}
          </p>
          <span className="text-[11px] text-white/50 mt-1 block font-medium">
            Ativos marcados para liquidez diária imediata
          </span>
        </div>

        {/* Other / Long Term */}
        <div className="bg-[#141112] p-5 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-brand-orange/10 rounded-full blur-2xl pointer-events-none" />
          <span className="text-xs font-semibold text-orange-200/60 block mb-1">
            Médio / Longo Prazo
          </span>
          <p className="text-2xl font-extrabold text-white tracking-tight">
            {formatCurrency(Math.max(0, totalBalanceSum - emergencyReserve))}
          </p>
          <span className="text-[11px] text-white/50 mt-1 block font-medium">
            Foco em crescimento patrimonial e aposentadoria
          </span>
        </div>
      </div>

      {/* Investment List Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-white">
            Meus Ativos & Títulos
          </h3>
          <span className="text-xs text-white/40 font-medium">
            {investments.length} {investments.length === 1 ? 'ativo cadastrado' : 'ativos cadastrados'}
          </span>
        </div>

        {investments.length === 0 ? (
          <div className="bg-[#141112] rounded-2xl p-12 text-center border border-white/10 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center text-brand-orange mx-auto mb-3">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-white">
              Nenhum investimento cadastrado
            </p>
            <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto">
              Cadastre seu CDB, Tesouro Direto ou outros fundos para acompanhar seu patrimônio em tempo real.
            </p>
            <button
              onClick={openNewModal}
              className="mt-4 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#f74603] to-[#e85002] text-white text-xs font-bold shadow-[0_0_15px_rgba(247,70,3,0.35)]"
            >
              Adicionar Primeiro Investimento
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {investments.map((inv) => {
              const profit = inv.currentBalance - inv.investedAmount;
              const isDeleteConfirm = deleteConfirmId === inv.id;

              return (
                <div
                  key={inv.id}
                  className={`p-5 rounded-2xl border transition-all duration-200 ${
                    inv.isEmergencyReserve
                      ? 'bg-[#141112] hover:bg-[#181415] border-emerald-500/30 shadow-lg'
                      : 'bg-[#141112] hover:bg-[#181415] border-white/10 shadow-lg'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg bg-white/5 text-white/90 border border-white/10">
                          {inv.type}
                        </span>
                        {inv.isEmergencyReserve && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <ShieldCheck className="w-3 h-3" /> Reserva de Emergência
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white mt-2 tracking-tight">
                        {inv.name}
                      </h4>
                      <p className="text-[11px] text-white/40 mt-0.5">
                        {inv.institution} • Liquidez: {inv.liquidity === 'daily' ? 'Diária' : inv.liquidity}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(inv)}
                        className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                        title="Editar"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {isDeleteConfirm ? (
                        <div className="flex items-center gap-1 bg-rose-500/15 p-1 rounded-lg border border-rose-500/30">
                          <button
                            onClick={() => {
                              deleteInvestment(inv.id);
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
                          onClick={() => setDeleteConfirmId(inv.id)}
                          className="p-2 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Balances & Yield */}
                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-white/5 my-3">
                    <div>
                      <span className="text-[10px] text-white/40 font-medium block">
                        Saldo Atual
                      </span>
                      <span className="text-base font-extrabold text-white tracking-tight">
                        {formatCurrency(inv.currentBalance)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-white/40 font-medium block">
                        Rendimento / Taxa
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-emerald-400">
                          {inv.profitabilityRate || '100% CDI'}
                        </span>
                        {profit !== 0 && (
                          <span className="text-[10px] text-white/40">
                            (+{formatCurrency(profit)})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Update balance button */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-white/40">
                      Início: {formatDate(inv.startDate)}
                    </span>

                    <button
                      onClick={() => {
                        setBalanceUpdateModal(inv);
                        setNewBalanceInput(inv.currentBalance.toString().replace('.', ','));
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-brand-orange/20 text-white/80 hover:text-brand-orange border border-white/10 hover:border-brand-orange/40 text-xs font-bold transition-all"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Atualizar Saldo</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Add / Edit Investment */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#141112] w-full max-w-md rounded-2xl shadow-2xl border border-white/10 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">
                {editingInv ? 'Editar Investimento' : 'Novo Investimento / Ativo'}
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-orange px-2 py-0.5 rounded-full bg-brand-orange/15 border border-brand-orange/30">
                Patrimônio
              </span>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-white/60 mb-1">
                  Nome do Investimento
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: CDB 100% CDI Liquidez Diária, Tesouro Selic..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1c181a] text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-1">
                    Tipo de Ativo
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as InvestmentType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1c181a] text-white text-xs focus:outline-none focus:border-brand-orange"
                  >
                    <option value="CDB">CDB</option>
                    <option value="Tesouro Direto">Tesouro Direto</option>
                    <option value="Poupança">Poupança</option>
                    <option value="Fundo">Fundo de Investimento</option>
                    <option value="Ações">Ações</option>
                    <option value="ETFs">ETFs / FIIs</option>
                    <option value="Criptomoedas">Criptomoedas</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-1">
                    Instituição / Corretora
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Banco Inter, Nubank, XP..."
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1c181a] text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-brand-orange"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-1">
                    Valor Aplicado (R$)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0,00"
                    value={investedAmountStr}
                    onChange={(e) => setInvestedAmountStr(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1c181a] text-white text-xs font-bold placeholder:text-white/30 focus:outline-none focus:border-brand-orange"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-1">
                    Saldo Atual (R$)
                  </label>
                  <input
                    type="text"
                    placeholder="0,00"
                    value={currentBalanceStr}
                    onChange={(e) => setCurrentBalanceStr(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1c181a] text-white text-xs font-bold placeholder:text-white/30 focus:outline-none focus:border-brand-orange"
                  />
                </div>
              </div>

              {/* Special CDB configuration */}
              {type === 'CDB' ? (
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <span className="text-xs font-bold text-white block">
                    Parâmetros do CDB
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-white/50 mb-1 font-semibold">
                        % do CDI
                      </label>
                      <input
                        type="number"
                        min="50"
                        max="300"
                        value={cdiPercentage}
                        onChange={(e) => setCdiPercentage(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[#1c181a] text-white text-xs focus:outline-none focus:border-brand-orange"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/50 mb-1 font-semibold">
                        Liquidez
                      </label>
                      <select
                        value={liquidity}
                        onChange={(e) => setLiquidity(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[#1c181a] text-white text-xs focus:outline-none"
                      >
                        <option value="daily">Liquidez Diária</option>
                        <option value="maturity">No Vencimento</option>
                        <option value="d+1">D+1</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-white/60 mb-1">
                      Rentabilidade / Taxa
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: IPCA + 6%, Selic..."
                      value={profitabilityRate}
                      onChange={(e) => setProfitabilityRate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1c181a] text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-brand-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-white/60 mb-1">
                      Liquidez
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Diária, D+30..."
                      value={liquidity}
                      onChange={(e) => setLiquidity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1c181a] text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-brand-orange"
                    />
                  </div>
                </div>
              )}

              {/* Emergency Reserve Checkbox */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEmergencyReserve}
                    onChange={(e) => setIsEmergencyReserve(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-[#1c181a] border-white/20"
                  />
                  <div>
                    <span className="text-xs font-bold text-emerald-400 block">
                      Faz parte da Reserva de Emergência
                    </span>
                    <span className="text-[10px] text-white/50">
                      O painel principal somará automaticamente este valor no indicador de segurança.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f74603] to-[#e85002] text-white text-xs font-bold shadow-[0_0_15px_rgba(247,70,3,0.35)] hover:from-[#e85002] hover:to-[#d03d00] transition-all"
                >
                  Salvar Ativo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Balance Update Modal */}
      {balanceUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#141112] w-full max-w-sm rounded-2xl shadow-2xl border border-white/10 p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">
              Atualizar Saldo Atual
            </h3>
            <p className="text-xs text-white/50">
              {balanceUpdateModal.name} ({balanceUpdateModal.institution})
            </p>

            <form onSubmit={handleUpdateBalanceSubmit} className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-white/60 mb-1">
                  Novo Saldo (R$)
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newBalanceInput}
                  onChange={(e) => setNewBalanceInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1c181a] text-base font-bold text-white focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBalanceUpdateModal(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#f74603] to-[#e85002] text-white text-xs font-bold shadow-[0_0_15px_rgba(247,70,3,0.35)]"
                >
                  Atualizar Saldo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
