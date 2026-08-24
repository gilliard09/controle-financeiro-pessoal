import React from 'react';
import { PartyPopper, Sparkles, CheckCircle2, X } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  badgeText?: string;
  releasedAmount?: number;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  badgeText,
  releasedAmount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#141112] w-full max-w-sm rounded-3xl shadow-2xl border border-white/15 p-6 text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-28 bg-[#f74603]/20 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-[#f74603] to-[#ff7d45] flex items-center justify-center text-white shadow-xl shadow-[#f74603]/25 glow-orange-sm animate-bounce border border-white/20">
          <PartyPopper className="w-8 h-8" />
        </div>

        {badgeText && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#f74603]/15 text-[#f74603] border border-[#f74603]/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {badgeText}
          </span>
        )}

        <h3 className="text-lg font-extrabold text-white mb-2 leading-tight tracking-tight">
          {title}
        </h3>

        <p className="text-xs text-white/60 mb-4 leading-relaxed font-medium">
          {message}
        </p>

        {releasedAmount !== undefined && releasedAmount > 0 && (
          <div className="p-3.5 mb-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
            <span className="text-[11px] font-bold text-emerald-300 block">
              Dinheiro mensal liberado no seu orçamento:
            </span>
            <span className="text-lg font-extrabold text-emerald-400 block mt-0.5">
              +{formatCurrency(releasedAmount)}/mês
            </span>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#f74603] to-[#e85002] hover:opacity-95 active:scale-98 text-white text-xs font-extrabold shadow-lg glow-orange-sm transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          <span>Continuar Evoluindo</span>
        </button>
      </div>
    </div>
  );
};
