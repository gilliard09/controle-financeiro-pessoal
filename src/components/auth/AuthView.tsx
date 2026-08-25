import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthView: React.FC = () => {
  const { login, signup, resetPassword, demoLogin, error } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'signup') {
        await signup(email, password, name || 'Usuário');
      } else {
        await resetPassword(email);
        setMessage('Instruções de recuperação de senha enviadas para seu e-mail!');
      }
    } catch (err: any) {
      // Handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center p-4 selection:bg-[#f74603] selection:text-white relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#f74603]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* App Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f74603] to-[#e85002] text-white shadow-xl shadow-[#f74603]/25 glow-orange-sm mb-2 border border-white/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Controle Financeiro Pessoal
          </h1>
          <p className="text-xs sm:text-sm text-white/50">
            Painel de gestão de renda, contas, investimentos e reserva
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#141112] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          {/* Mode Switch Tabs */}
          <div className="flex items-center p-1 bg-black/40 border border-white/10 rounded-2xl">
            <button
              onClick={() => {
                setMode('login');
                setMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-[#f74603] text-white shadow-md glow-orange-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'signup'
                  ? 'bg-[#f74603] text-white shadow-md glow-orange-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold animate-in fade-in">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold animate-in fade-in">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
                  Seu Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Maria"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs font-semibold text-white placeholder:text-white/30 focus:outline-none focus:border-[#f74603]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs font-semibold text-white placeholder:text-white/30 focus:outline-none focus:border-[#f74603]"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                    Senha
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[10px] font-semibold text-[#f74603] hover:text-[#ff7d45]"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs font-semibold text-white placeholder:text-white/30 focus:outline-none focus:border-[#f74603]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#f74603] to-[#e85002] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#f74603]/25 glow-orange-sm transition-all flex items-center justify-center gap-2"
            >
              <span>
                {mode === 'login'
                  ? 'Acessar Painel'
                  : mode === 'signup'
                  ? 'Cadastrar e Começar'
                  : 'Enviar Link de Redefinição'}
              </span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="pt-3 border-t border-white/10 text-center space-y-2">
            <p className="text-[11px] text-white/40 font-semibold">Ambiente de Demonstração Interativo:</p>
            <button
              type="button"
              onClick={() => demoLogin()}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#f74603]" />
              <span>Entrar com Dados de Demonstração</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
