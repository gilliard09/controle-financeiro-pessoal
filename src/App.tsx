import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { FloatingActionButton } from './components/common/FloatingActionButton';
import { QuickTransactionModal } from './components/common/QuickTransactionModal';
import { CelebrationModal } from './components/common/CelebrationModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { AccountsAndDebtsView } from './components/fixed-expenses/AccountsAndDebtsView';
import { InvestmentsView } from './components/investments/InvestmentsView';
import { BudgetView } from './components/budget/BudgetView';
import { GoalsAndLeisureView } from './components/goals/GoalsAndLeisureView';
import { ProjectionsView } from './components/projection/ProjectionsView';
import { SettingsView } from './components/settings/SettingsView';
import { AuthView } from './components/auth/AuthView';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { Transaction, TransactionType } from './types';
import { Download, X } from 'lucide-react';

function AppContent() {
  const { user, loading, needsOnboarding } = useAuth();
  const { celebration, closeCelebration } = useFinance();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // PWA install prompt handler
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  if (needsOnboarding) {
    return <OnboardingWizard />;
  }

  const handleOpenQuickAdd = (type: TransactionType = 'expense') => {
    setEditingTransaction(null);
    setQuickAddType(type);
    setQuickAddOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setQuickAddType(tx.type);
    setQuickAddOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Manrope',sans-serif] selection:bg-emerald-500 selection:text-white">
      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div className="bg-emerald-600 text-slate-950 px-4 py-2.5 flex items-center justify-between text-xs font-semibold shadow-md">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Instale o aplicativo no seu celular para acesso rápido e offline!</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1 bg-slate-950 text-white rounded-lg text-xs font-bold hover:bg-slate-900"
            >
              Instalar App
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="p-1 hover:bg-emerald-700 rounded text-slate-950"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onNavigate={setActiveTab}
        onOpenQuickAdd={() => handleOpenQuickAdd('expense')}
        deferredPrompt={installPrompt}
        onInstallPwa={handleInstallClick}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-28 lg:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigate={setActiveTab}
            onOpenQuickAdd={() => handleOpenQuickAdd('expense')}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            onOpenQuickAdd={handleOpenQuickAdd}
            onEditTransaction={handleEditTransaction}
          />
        )}

        {activeTab === 'accounts' && <AccountsAndDebtsView />}

        {activeTab === 'investments' && <InvestmentsView />}

        {activeTab === 'budget' && <BudgetView />}

        {activeTab === 'goals' && (
          <GoalsAndLeisureView onOpenQuickAdd={() => handleOpenQuickAdd('expense')} />
        )}

        {activeTab === 'projections' && <ProjectionsView />}

        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Floating Action Button (Mobile & Desktop) */}
      <FloatingActionButton onOpenQuickAdd={handleOpenQuickAdd} />

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} onNavigate={setActiveTab} />

      {/* Modals */}
      <QuickTransactionModal
        isOpen={quickAddOpen}
        onClose={() => {
          setQuickAddOpen(false);
          setEditingTransaction(null);
        }}
        initialType={quickAddType}
        transactionToEdit={editingTransaction}
      />

      {celebration && (
        <CelebrationModal
          isOpen={celebration.isOpen}
          onClose={closeCelebration}
          title={celebration.title}
          message={celebration.message}
          badgeText={celebration.badgeText}
          releasedAmount={celebration.releasedAmount}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <AppContent />
      </FinanceProvider>
    </AuthProvider>
  );
}
