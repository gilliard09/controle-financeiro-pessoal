import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface PlaceholderViewProps {
  icon: LucideIcon;
  title: string;
  desc?: string;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({ icon: Icon, title, desc }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-[#f74603]" />
      </div>
      <h2 className="text-sm font-bold text-white mb-1">{title}</h2>
      <p className="text-xs text-[#a7a7a7] max-w-xs">
        {desc || 'Este módulo do KingdomOS está ativado, mas ainda em construção.'}
      </p>
    </div>
  );
};
