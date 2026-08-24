import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Calculator,
  Compass,
  CreditCard,
  Home,
  Menu,
  PieChart,
  Sliders,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onNavigate?: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, onNavigate }) => {
  const [showSecondaryMenu, setShowSecondaryMenu] = useState(false);

  const navigate = (tab: string) => {
    if (onNavigate) onNavigate(tab);
    else if (setActiveTab) setActiveTab(tab);
  };

  const mainItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'transactions', label: 'Extrato', icon: ArrowLeftRight },
    { id: 'investments', label: 'Investir', icon: TrendingUp },
    { id: 'goals', label: 'Metas', icon: Target },
  ];

  const secondaryItems = [
    { id: 'accounts', label: 'Contas & Dívidas', icon: CreditCard, desc: 'Contas fixas e quitação de parcelas' },
    { id: 'budget', label: 'Orçamento 50/30/20', icon: PieChart, desc: 'Divisão inteligente da renda' },
    { id: 'projections', label: 'Projeção de Futuro', icon: Calculator, desc: 'Simulação patrimonial a longo prazo' },
    { id: 'settings', label: 'Configurações', icon: Sliders, desc: 'Fontes de renda, categorias e dados' },
  ];

  const isSecondaryActive = secondaryItems.some((item) => item.id === activeTab);

  return (
    <>
      {/* Floating Glass Dock Bottom Bar for mobile */}
      <div className="lg:hidden fixed bottom-3 left-0 right-0 z-40 px-3 pb-safe">
        <div className="bg-[#141112]/90 dock-blur border border-white/10 rounded-full shadow-2xl p-1 max-w-sm mx-auto">
          <div className="grid grid-cols-5 items-center">
            {mainItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.id);
                    setShowSecondaryMenu(false);
                  }}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-full transition-all relative min-h-[48px] ${
                    isActive
                      ? 'bg-[#f74603] text-white shadow-md glow-orange-sm'
                      : 'text-[#a7a7a7] hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[2]'}`} />
                  <span className="text-[9px] mt-0.5 font-bold tracking-tight truncate max-w-[56px]">
                    {item.label}
                  </span>
                </button>
              );
            })}

            {/* More / Menu button */}
            <button
              onClick={() => setShowSecondaryMenu(!showSecondaryMenu)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-full transition-all relative min-h-[48px] ${
                isSecondaryActive || showSecondaryMenu
                  ? 'bg-[#f74603] text-white shadow-md glow-orange-sm'
                  : 'text-[#a7a7a7] hover:text-white'
              }`}
            >
              <Menu className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 font-bold tracking-tight">Mais</span>
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Menu Drawer for Mobile */}
      {showSecondaryMenu && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in"
            onClick={() => setShowSecondaryMenu(false)}
          />
          <div className="lg:hidden fixed bottom-20 left-3 right-3 z-50 bg-[#141112] border border-white/15 rounded-3xl p-4 shadow-2xl animate-in slide-in-from-bottom duration-200 backdrop-blur-xl max-w-md mx-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#a7a7a7]">
                Mais Ferramentas
              </span>
              <button
                onClick={() => setShowSecondaryMenu(false)}
                className="p-1.5 rounded-full text-[#a7a7a7] hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 py-3">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.id);
                      setShowSecondaryMenu(false);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-2xl text-left transition-all min-h-[48px] ${
                      isActive
                        ? 'bg-[#f74603] text-white shadow-md'
                        : 'bg-white/5 hover:bg-white/10 text-white border border-white/5'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isActive
                          ? 'bg-black/30 text-white'
                          : 'bg-white/10 text-[#f74603]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold">{item.label}</p>
                      <p className={`text-[11px] truncate ${isActive ? 'text-white/80' : 'text-[#a7a7a7]'}`}>
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
};

