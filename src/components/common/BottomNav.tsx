import React from 'react';
import { CreditCard, Home, Settings, TrendingUp } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onNavigate?: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, onNavigate }) => {
  const navigate = (tab: string) => onNavigate ? onNavigate(tab) : setActiveTab?.(tab);

  const items = [
    { id: 'accounts', label: 'Contas', icon: CreditCard },
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'investments', label: 'Investimentos', icon: TrendingUp },
    { id: 'settings', label: 'Config', icon: Settings },
  ];

  return (
    <div className="lg:hidden fixed bottom-3 left-0 right-0 z-40 px-3 pb-safe">
      <nav className="max-w-md mx-auto bg-[#141112]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-1.5 grid grid-cols-4 gap-1">
        {items.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => navigate(id)}
              className={`min-h-[50px] rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${
                active ? 'bg-[#f74603] text-white shadow-md' : 'text-white/40 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
              <span className="text-[9px] font-bold">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
