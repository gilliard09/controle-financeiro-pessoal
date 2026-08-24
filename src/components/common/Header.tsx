import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  ChevronDown,
  Download,
  LogOut,
  Moon,
  Plus,
  RefreshCw,
  Sliders,
  Sparkles,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, getGreeting, getMonthName } from '../../utils/formatters';

interface HeaderProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onNavigate?: (tab: string) => void;
  onOpenQuickAdd?: () => void;
  deferredPrompt?: any;
  onInstallPwa?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onNavigate,
  onOpenQuickAdd,
  deferredPrompt,
  onInstallPwa,
}) => {
  const navigate = (tab: string) => {
    if (onNavigate) onNavigate(tab);
    else if (setActiveTab) setActiveTab(tab);
  };

  const { user, logout } = useAuth();
  const {
    totalWealth,
    emergencyReserve,
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    goToCurrentMonth,
    alerts,
  } = useFinance();

  const [showAlertsPopover, setShowAlertsPopover] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const unreadAlertsCount = alerts.filter((a) => !a.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'transactions', label: 'Movimentações' },
    { id: 'accounts', label: 'Contas & Dívidas' },
    { id: 'investments', label: 'Investimentos' },
    { id: 'budget', label: 'Orçamento 50/30/20' },
    { id: 'goals', label: 'Metas & Lazer' },
    { id: 'projections', label: 'Projeção' },
    { id: 'settings', label: 'Configurações' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#09090b]/90 backdrop-blur-xl border-b border-white/5 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#55100d] via-[#e85002] to-[#f74603] text-white flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-105 transition-transform glow-orange-sm">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight text-white block leading-tight">
                  Finanças<span className="text-[#f74603]">.pro</span>
                </span>
                <span className="text-[10px] text-[#a7a7a7] block -mt-0.5 font-medium">
                  Controle Pessoal
                </span>
              </div>
            </button>

            {/* Desktop Navigation links */}
            <nav className="hidden lg:flex items-center gap-1 ml-6 p-1 bg-black/40 border border-white/5 rounded-2xl">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-[#f74603] text-white shadow-md glow-orange-sm'
                        : 'text-[#a7a7a7] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Actions: Month Selector, Quick Add, Notifications, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Month / Year Selector */}
            <div className="relative">
              <button
                onClick={() => setShowMonthPicker(!showMonthPicker)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#141112] border border-white/10 text-xs font-semibold text-[#d9d9d9] hover:border-orange-500/40 transition-colors"
                title="Mudar mês de referência"
              >
                <Calendar className="w-3.5 h-3.5 text-[#f74603]" />
                <span>
                  {getMonthName(selectedMonth - 1).slice(0, 3)}/{selectedYear}
                </span>
                <ChevronDown className="w-3 h-3 text-[#a7a7a7]" />
              </button>

              {showMonthPicker && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMonthPicker(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 p-3.5 bg-[#141112] rounded-3xl shadow-2xl border border-white/15 z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                      <span className="text-xs font-bold text-white">
                        Mês de Referência
                      </span>
                      <button
                        onClick={goToCurrentMonth}
                        className="text-[11px] text-[#f74603] hover:underline font-bold"
                      >
                        Mês Atual
                      </button>
                    </div>

                    {/* Year controls */}
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => setSelectedYear(selectedYear - 1)}
                        className="p-1 rounded-lg text-[#a7a7a7] hover:bg-white/10 text-xs"
                      >
                        ◀
                      </button>
                      <span className="text-xs font-bold text-white">
                        {selectedYear}
                      </span>
                      <button
                        onClick={() => setSelectedYear(selectedYear + 1)}
                        className="p-1 rounded-lg text-[#a7a7a7] hover:bg-white/10 text-xs"
                      >
                        ▶
                      </button>
                    </div>

                    {/* Months Grid */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {months.map((m, idx) => {
                        const isCurrent = selectedMonth === idx + 1;
                        return (
                          <button
                            key={m}
                            onClick={() => {
                              setSelectedMonth(idx + 1);
                              setShowMonthPicker(false);
                            }}
                            className={`py-1.5 px-2 rounded-xl text-xs font-semibold text-center transition-all ${
                              isCurrent
                                ? 'bg-[#f74603] text-white glow-orange-sm'
                                : 'text-[#d9d9d9] hover:bg-white/10'
                            }`}
                          >
                            {m.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Add Button */}
            <button
              onClick={onOpenQuickAdd}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-[#f74603] hover:bg-[#e85002] active:scale-95 text-white text-xs font-bold shadow-md glow-orange-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Lançamento</span>
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowAlertsPopover(!showAlertsPopover)}
                className="relative p-2 rounded-2xl text-[#d9d9d9] hover:bg-white/10 border border-white/5 transition-colors"
                title="Alertas e Notificações"
              >
                <Bell className="w-4 h-4" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#f74603] ring-2 ring-[#09090b] animate-pulse" />
                )}
              </button>

              {showAlertsPopover && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowAlertsPopover(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 max-w-[90vw] p-3.5 bg-[#141112] rounded-3xl shadow-2xl border border-white/15 z-50 backdrop-blur-xl">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#f74603]" />
                        Alertas Financeiros
                      </span>
                      <button
                        onClick={() => setShowAlertsPopover(false)}
                        className="text-[#a7a7a7] hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {alerts.length === 0 ? (
                      <p className="text-xs text-[#a7a7a7] py-3 text-center">
                        Tudo em dia! Nenhum alerta pendente no momento.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {alerts.map((al) => (
                          <div
                            key={al.id}
                            className={`p-3 rounded-2xl text-xs border transition-colors ${
                              al.type === 'celebration'
                                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                                : al.type === 'warning'
                                ? 'bg-[#55100d]/40 border-rose-500/30 text-rose-300'
                                : 'bg-white/5 border-white/10 text-white'
                            }`}
                          >
                            <p className="font-bold">{al.title}</p>
                            <p className="text-[11px] opacity-90 mt-0.5">{al.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* PWA Install Button if available */}
            {deferredPrompt && (
              <button
                onClick={onInstallPwa}
                className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/10 transition-colors"
                title="Instalar como App PWA"
              >
                <Download className="w-3.5 h-3.5 text-[#f74603]" />
                <span>Instalar App</span>
              </button>
            )}

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-white/10 border border-transparent hover:border-white/10 transition-all focus:outline-none"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#55100d] to-[#f74603] text-white flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                  {user?.name ? user.name.charAt(0) : 'U'}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-white max-w-[100px] truncate">
                  {user?.name || 'Perfil'}
                </span>
                <ChevronDown className="w-3 h-3 text-[#a7a7a7] hidden sm:inline" />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 p-2 bg-[#141112] rounded-3xl shadow-2xl border border-white/15 z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl">
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-xs font-bold text-white truncate">
                        {user?.name}
                      </p>
                      <p className="text-[11px] text-[#a7a7a7] truncate">
                        {user?.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigate('settings');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#d9d9d9] hover:bg-white/10 hover:text-white rounded-xl text-left transition-colors"
                      >
                        <Sliders className="w-3.5 h-3.5 text-[#f74603]" />
                        Configurações & Renda
                      </button>
                    </div>

                    <div className="pt-1 border-t border-white/10">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 rounded-xl text-left transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sair da Conta
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

