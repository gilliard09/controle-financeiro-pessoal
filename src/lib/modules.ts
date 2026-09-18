import {
  LayoutDashboard, ArrowLeftRight, CreditCard, TrendingUp, PieChart,
  Target, Calculator, Sliders, Target as GoalIcon, FolderKanban,
  CheckSquare, Calendar, BarChart3, Timer, FileText, Brain,
  GraduationCap, BookOpen, Lightbulb, PenLine, HandHeart, Book,
  LineChart, type LucideIcon,
} from 'lucide-react';

export type ModuleGroup = 'financas' | 'execucao' | 'conhecimento' | 'fe' | 'sistema';

export interface ModuleDef {
  id: string;
  label: string;
  desc?: string;
  icon: LucideIcon;
  group: ModuleGroup;
  enabledByDefault: boolean;
  core?: boolean; // módulos core não podem ser desativados
}

export const MODULES: ModuleDef[] = [
  // Já existentes no app — permanecem intocados, agora organizados no registro
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'financas', enabledByDefault: true, core: true },
  { id: 'transactions', label: 'Movimentações', icon: ArrowLeftRight, group: 'financas', enabledByDefault: true, core: true },
  { id: 'accounts', label: 'Contas & Dívidas', desc: 'Contas fixas e quitação de parcelas', icon: CreditCard, group: 'financas', enabledByDefault: true, core: true },
  { id: 'investments', label: 'Investimentos', icon: TrendingUp, group: 'financas', enabledByDefault: true, core: true },
  { id: 'budget', label: 'Orçamento 50/30/20', desc: 'Divisão inteligente da renda', icon: PieChart, group: 'financas', enabledByDefault: true, core: true },
  { id: 'goals', label: 'Metas & Lazer', icon: Target, group: 'financas', enabledByDefault: true, core: true },
  { id: 'projections', label: 'Projeção de Futuro', desc: 'Simulação patrimonial a longo prazo', icon: Calculator, group: 'financas', enabledByDefault: true, core: true },
  { id: 'settings', label: 'Configurações', desc: 'Fontes de renda, categorias e dados', icon: Sliders, group: 'financas', enabledByDefault: true, core: true },

  // Novos módulos do KingdomOS
  { id: 'objetivos', label: 'Objetivos', desc: 'Metas de vida, além das financeiras', icon: GoalIcon, group: 'execucao', enabledByDefault: false },
  { id: 'projetos', label: 'Projetos', icon: FolderKanban, group: 'execucao', enabledByDefault: false },
  { id: 'tarefas', label: 'Tarefas', icon: CheckSquare, group: 'execucao', enabledByDefault: false },
  { id: 'agenda', label: 'Agenda', icon: Calendar, group: 'execucao', enabledByDefault: false },
  { id: 'habitos', label: 'Hábitos', icon: BarChart3, group: 'execucao', enabledByDefault: false },
  { id: 'rotinas', label: 'Rotinas', icon: Timer, group: 'execucao', enabledByDefault: false },

  { id: 'notas', label: 'Notas', icon: FileText, group: 'conhecimento', enabledByDefault: false },
  { id: 'brain-dump', label: 'Brain Dump', icon: Brain, group: 'conhecimento', enabledByDefault: false },
  { id: 'estudos', label: 'Estudos', icon: GraduationCap, group: 'conhecimento', enabledByDefault: false },
  { id: 'leitura', label: 'Leitura', icon: BookOpen, group: 'conhecimento', enabledByDefault: false },
  { id: 'ideias', label: 'Ideias', icon: Lightbulb, group: 'conhecimento', enabledByDefault: false },
  { id: 'conteudos', label: 'Conteúdos', icon: PenLine, group: 'conhecimento', enabledByDefault: false },

  { id: 'devocional', label: 'Devocional', icon: HandHeart, group: 'fe', enabledByDefault: false },
  { id: 'biblia', label: 'Bíblia', icon: Book, group: 'fe', enabledByDefault: false },

  { id: 'analytics', label: 'Analytics', icon: LineChart, group: 'sistema', enabledByDefault: false },
];

export const GROUP_LABELS: Record<ModuleGroup, string> = {
  financas: 'Finanças',
  execucao: 'Execução',
  conhecimento: 'Conhecimento',
  fe: 'Fé',
  sistema: 'Sistema',
};

export const GROUP_ORDER: ModuleGroup[] = ['financas', 'execucao', 'conhecimento', 'fe', 'sistema'];
