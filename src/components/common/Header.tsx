import React, { useState } from 'react';
import { Bell, ChevronDown, CloudOff, Download, LogOut, Plus, TrendingUp, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, getMonthName } from '../../utils/formatters';

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
  const navigate = (tab: string) => onNavigate ? onNavigate(tab) : setActiveTab?.(tab);
  const { user, logout, isCloudConnected } = useAuth();
  const { selectedYear, selectedMonth, setSelectedYear, setSelectedMonth, goToCurrentMonth, alerts } = useFinance();
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { id: 'accounts', label: 'Contas' },
    { id: 'dashboard', label: 'Home' },
    { id: 'investments', label: 'Investimentos' },
    { id: 'settings', label: 'Config' },
  ];

  const unreadAlerts = alerts.filter((a) => !a.read).length;
  const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  return (
    <header className="sticky top-0 z-30 bg-[#09090b]/95 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-14 sm:h-16 flex items-center justify-between gap-3">
          <button onClick={() => navigate('dashboard')} className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#f74603] text-white flex items-center justify-center shadow-lg shadow-[#f74603]/15 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-sm font-extrabold text-white block leading-tight">Finanças<span className="text-[#f74603]">.pro</span></span>
              <span className="text-[10px] text-white/35 block">Controle pessoal</span>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-1 bg-black/30 border border-white/5 rounded-2xl p-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === item.id ? 'bg-[#f74603] text-white shadow-md' : 'text-white/45 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowMonthPicker(!showMonthPicker)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-bold text-white/55 hover:text-white hover:bg-white/5"
              >
                {getMonthName(selectedMonth - 1)} {selectedYear}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showMonthPicker && (
                <div className="absolute right-0 top-11 w-56 bg-[#141112] border border-white/10 rounded-2xl p-3 shadow-2xl">
                  <div className="grid grid-cols-3 gap-1">
                    {months.map((month, index) => (
                      <button
                        key={month}
                        onClick={() => { setSelectedMonth(index + 1); setShowMonthPicker(false); }}
                        className={`px-2 py-2 rounded-lg text-[10px] font-bold ${
                          selectedMonth === index + 1 ? 'bg-[#f74603] text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {month.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => { goToCurrentMonth(); setShowMonthPicker(false); }} className="w-full mt-2 py-2 rounded-lg bg-white/5 text-[10px] font-bold text-white/60 hover:text-white">
                    Ir para este mês
                  </button>
                </div>
              )}
            </div>

            {!isCloudConnected && (
              <div className="hidden md:flex w-8 h-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300" title="Dados salvos apenas neste dispositivo">
                <CloudOff className="w-3.5 h-3.5" />
              </div>
            )}

            <div className="relative">
              <button onClick={() => setShowAlerts(!showAlerts)} className="relative w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5">
                <Bell className="w-4 h-4" />
                {unreadAlerts > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#f74603]" />}
              </button>
              {showAlerts && (
                <div className="absolute right-0 top-11 w-72 bg-[#141112] border border-white/10 rounded-2xl p-3 shadow-2xl">
                  <p className="text-xs font-bold text-white px-1 pb-2">Alertas</p>
                  {alerts.length === 0 ? <p className="text-[11px] text-white/35 px-1 py-5 text-center">Nenhum alerta.</p> : alerts.map((alert) => (
                    <div key={alert.id} className="p-2.5 rounded-xl bg-white/5 mb-1.5">
                      <p className="text-[11px] font-bold text-white">{alert.title}</p>
                      <p className="text-[10px] text-white/45 mt-0.5">{alert.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="w-9 h-9 rounded-xl bg-white/5 text-white flex items-center justify-center text-[10px] font-extrabold">
                {user?.name?.slice(0, 2).toUpperCase() || 'EU'}
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-11 w-48 bg-[#141112] border border-white/10 rounded-2xl p-2 shadow-2xl">
                  <button onClick={() => { navigate('settings'); setShowUserMenu(false); }} className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-white/60 hover:bg-white/5 hover:text-white">Configurações</button>
                  {deferredPrompt && onInstallPwa && (
                    <button onClick={onInstallPwa} className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-white/60 hover:bg-white/5 hover:text-white flex items-center gap-2">
                      <Download className="w-3.5 h-3.5" /> Instalar aplicativo
                    </button>
                  )}
                  <button onClick={logout} className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2">
                    <LogOut className="w-3.5 h-3.5" /> Sair
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={onOpenQuickAdd}
              className="w-10 h-10 rounded-xl bg-[#f74603] text-white flex items-center justify-center shadow-lg shadow-[#f74603]/20 hover:brightness-110 active:scale-95 transition-all"
              title="Novo lançamento"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
