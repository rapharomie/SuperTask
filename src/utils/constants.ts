import type { DimensionConfig, DimensionKey, UserSettings, Task, FilterState, LeverageType } from '../types';

// ============================================
// Dimensões de Score
// ============================================
export const DIMENSIONS: DimensionConfig[] = [
  {
    key: 'impactoFinanceiro',
    dbKey: 'dim_impacto_financeiro',
    label: 'Impacto financeiro',
    inverted: false,
    descriptions: {
      0: 'Nenhum impacto financeiro',
      1: 'Impacto financeiro indireto',
      2: 'Impacto financeiro marginal',
      3: 'Impacto indireto moderado',
      4: 'Economia relevante',
      5: 'Receita parcial',
      6: 'Impacto moderado significativo',
      7: 'Receita direta significativa',
      8: 'Grande economia ou receita',
      9: 'Alto impacto financeiro direto',
      10: 'Impacto crítico — lançamento ou contrato grande',
    },
  },
  {
    key: 'alcance',
    dbKey: 'dim_alcance',
    label: 'Alcance — pessoas impactadas',
    inverted: false,
    descriptions: {
      0: 'Ninguém além de mim',
      1: 'Uma ou duas pessoas',
      2: 'Equipe próxima (3-5)',
      3: 'Grupo pequeno (5-10)',
      4: 'Dezenas de pessoas',
      5: 'Uma turma ou time grande',
      6: 'Centenas de pessoas',
      7: 'Base de clientes parcial',
      8: 'Centenas a milhares',
      9: 'Milhares de pessoas',
      10: 'Toda a base — lançamento público',
    },
  },
  {
    key: 'urgencia',
    dbKey: 'dim_urgencia',
    label: 'Urgência / deadline',
    inverted: false,
    descriptions: {
      0: 'Sem prazo, sem janela',
      1: 'Prazo muito distante',
      2: 'Prazo distante (meses)',
      3: 'Prazo em semanas',
      4: 'Prazo se aproximando',
      5: 'Prazo esta semana',
      6: 'Janela se estreitando',
      7: 'Deadline em 2-3 dias',
      8: 'Deadline amanhã',
      9: 'Janela quase fechando',
      10: 'Deadline hoje / já atrasado',
    },
  },
  {
    key: 'custoAtraso',
    dbKey: 'dim_custo_atraso',
    label: 'Custo do atraso',
    inverted: false,
    descriptions: {
      0: 'Zero custo em adiar',
      1: 'Inconveniência mínima',
      2: 'Leve perda de eficiência',
      3: 'Custo baixo acumulando',
      4: 'Perda de receita parcial',
      5: 'Insatisfação crescente',
      6: 'Custo moderado real',
      7: 'Perda de clientes possível',
      8: 'Oportunidade escorrendo',
      9: 'Custo alto — perdas reais',
      10: 'Dano irreversível / compliance',
    },
  },
  {
    key: 'tempoExecucao',
    dbKey: 'dim_tempo_execucao',
    label: 'Tempo de execução',
    inverted: true,
    descriptions: {
      0: 'Semanas ou meses',
      1: 'Mais de uma semana',
      2: 'Uma semana',
      3: 'Vários dias',
      4: 'Dois dias',
      5: 'Um dia inteiro',
      6: 'Meio dia',
      7: 'Algumas horas',
      8: '1 a 2 horas',
      9: '30 minutos a 1 hora',
      10: 'Menos de 30 minutos',
    },
  },
  {
    key: 'complexidade',
    dbKey: 'dim_complexidade',
    label: 'Complexidade',
    inverted: true,
    descriptions: {
      0: 'Extremamente complexa',
      1: 'Muito complexa, incerteza alta',
      2: 'Complexa, conhecimento novo necessário',
      3: 'Várias dependências e pesquisa',
      4: 'Moderada com alguma incerteza',
      5: 'Passos claros, complexidade média',
      6: 'Moderada, caminho conhecido',
      7: 'Simples, poucos passos',
      8: 'Receita conhecida',
      9: 'Muito simples',
      10: 'Trivial — uma ação, sem ambiguidade',
    },
  },
  {
    key: 'confianca',
    dbKey: 'dim_confianca',
    label: 'Confiança nas estimativas',
    inverted: false,
    descriptions: {
      0: 'Puro chute, nenhum dado',
      1: 'Quase nenhuma base',
      2: 'Intuição vaga',
      3: 'Baseado em experiência geral',
      4: 'Algum dado disponível',
      5: 'Experiência anterior similar',
      6: 'Dados parciais confirmam',
      7: 'Dados sólidos',
      8: 'Experiência direta recente',
      9: 'Alta confiança, dados claros',
      10: 'Certeza total — já fiz com resultado conhecido',
    },
  },
  {
    key: 'autonomia',
    dbKey: 'dim_autonomia',
    label: 'Autonomia de execução',
    inverted: true,
    descriptions: {
      0: '100% dependente de terceiros',
      1: 'Quase totalmente dependente',
      2: 'Depende de aprovação crucial',
      3: 'Depende de recurso de outros',
      4: 'Parcialmente autônomo',
      5: 'Preciso de input mas avanço',
      6: 'Boa autonomia, alguma dependência',
      7: 'Quase autônomo',
      8: 'Só preciso de validação final',
      9: 'Praticamente independente',
      10: '100% autônomo — posso fazer agora',
    },
  },
  {
    key: 'alavancagem',
    dbKey: 'dim_alavancagem',
    label: 'Alavancagem',
    inverted: false,
    descriptions: {
      0: 'Zero alavancagem — resultado 1:1',
      1: 'Alavancagem mínima',
      2: 'Resultado levemente acima do esforço',
      3: 'Baixa alavancagem, resultado linear',
      4: 'Alguma multiplicação do esforço',
      5: 'Alavancagem moderada',
      6: 'Resultado multiplica parcialmente',
      7: 'Alta alavancagem',
      8: 'Resultado desproporcional',
      9: 'Alavancagem muito alta — automação/escala',
      10: 'Alavancagem máxima — resultado exponencial',
    },
  },
  {
    key: 'energia',
    dbKey: 'dim_energia',
    label: 'Energia necessária',
    inverted: true,
    descriptions: {
      0: 'Deep work máximo — criação do zero',
      1: 'Decisão estratégica complexa',
      2: 'Trabalho pesado, alta concentração',
      3: 'Escrita longa ou desenvolvimento',
      4: 'Análise densa, foco necessário',
      5: 'Trabalho moderado',
      6: 'Revisão e ajustes',
      7: 'Reuniões focadas',
      8: 'Trabalho leve — respostas e checagens',
      9: 'Tarefas administrativas simples',
      10: 'Mecânico — copiar/colar, enviar mensagem',
    },
  },
];

export const DIMENSION_MAP: Record<DimensionKey, DimensionConfig> = Object.fromEntries(
  DIMENSIONS.map(d => [d.key, d])
) as Record<DimensionKey, DimensionConfig>;

// ============================================
// Alavancas
// ============================================
export const LEVERAGE_OPTIONS: { value: LeverageType; label: string; icon: string }[] = [
  { value: 'código', label: 'Código', icon: 'Code2' },
  { value: 'conteúdo', label: 'Conteúdo', icon: 'FileText' },
  { value: 'pessoas', label: 'Pessoas', icon: 'Users' },
  { value: 'dinheiro', label: 'Dinheiro', icon: 'DollarSign' },
];

// ============================================
// Status
// ============================================
export const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'concluída', label: 'Concluída' },
  { value: 'cancelada', label: 'Cancelada' },
];

// ============================================
// Configurações padrão
// ============================================
export const DEFAULT_SETTINGS: UserSettings = {
  tags: ['MedReview', 'Pessoal-Saúde', 'Pessoal-Família', 'Pessoal-Conteúdo', 'Pessoal-Obra'],
  classifications: ['Faz agora', 'Agenda', 'Delega', 'Backlog', 'Esperando'],
  tagColors: {
    'MedReview': { bg: '#FEE2E2', text: '#991B1B' },
    'Pessoal-Saúde': { bg: '#F3E8FF', text: '#581C87' },
    'Pessoal-Família': { bg: '#FCE7F3', text: '#831843' },
    'Pessoal-Conteúdo': { bg: '#FEF3C7', text: '#78350F' },
    'Pessoal-Obra': { bg: '#E0E7FF', text: '#3730A3' },
  },
  activeDimensions: DIMENSIONS.map(d => d.key),
};

// ============================================
// Filtros padrão
// ============================================
export const DEFAULT_FILTERS: FilterState = {
  search: '',
  tags: [],
  classifications: [],
  leverages: [],
  statuses: [],
  showCompleted: false,
  scoreRange: [0, 100],
};

// ============================================
// Tarefas de exemplo
// ============================================
export const SAMPLE_TASKS: Omit<Task, 'id' | 'priorityScore' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Gravar vídeo de lançamento do programa de embaixadores',
    description: 'Preparar roteiro e gravar vídeo para o lançamento oficial do programa de embaixadores da MedReview.',
    notes: 'Verificar iluminação e cenário. Preparar slides de apoio.',
    tags: ['MedReview', 'Pessoal-Conteúdo'],
    classification: 'Agenda',
    leverages: ['conteúdo', 'pessoas'],
    dimensions: {
      impactoFinanceiro: 6,
      alcance: 8,
      urgencia: 6,
      custoAtraso: 5,
      tempoExecucao: 3,
      complexidade: 4,
      confianca: 7,
      autonomia: 8,
      alavancagem: 8,
      energia: 3,
    },
    status: 'pendente',
    completedAt: null,
    deletedAt: null,
  },
  {
    title: 'Corrigir bug no webhook do agente WhatsApp',
    description: 'O webhook do agente de IA no WhatsApp está falhando intermitentemente. Investigar logs e corrigir.',
    notes: 'Checar rate limiting do endpoint. Possível timeout no Supabase Edge Function.',
    tags: ['MedReview'],
    classification: 'Faz agora',
    leverages: ['código'],
    dimensions: {
      impactoFinanceiro: 5,
      alcance: 4,
      urgencia: 8,
      custoAtraso: 7,
      tempoExecucao: 8,
      complexidade: 7,
      confianca: 9,
      autonomia: 10,
      alavancagem: 7,
      energia: 6,
    },
    status: 'pendente',
    completedAt: null,
    deletedAt: null,
  },
  {
    title: 'Agendar check-up anual',
    description: 'Ligar para clínica e agendar check-up anual completo.',
    notes: 'Preferência: manhã de terça ou quinta.',
    tags: ['Pessoal-Saúde'],
    classification: 'Backlog',
    leverages: [],
    dimensions: {
      impactoFinanceiro: 1,
      alcance: 1,
      urgencia: 3,
      custoAtraso: 2,
      tempoExecucao: 9,
      complexidade: 9,
      confianca: 10,
      autonomia: 9,
      alavancagem: 0,
      energia: 9,
    },
    status: 'pendente',
    completedAt: null,
    deletedAt: null,
  },
];

// ============================================
// Local Storage Keys
// ============================================
export const LS_KEYS = {
  TASKS_CACHE: 'supertask-tasks-cache',
  SETTINGS_CACHE: 'supertask-settings-cache',
  FILTERS: 'supertask-filters',
  PENDING_SYNC: 'supertask-pending-sync',
  THEME: 'supertask-theme',
  SEEDED: 'supertask-seeded',
} as const;
