// ============================================
// SuperTask — Tipos TypeScript
// ============================================

export type LeverageType = 'código' | 'conteúdo' | 'pessoas' | 'dinheiro';

export type TaskStatus = 'pendente' | 'em_andamento' | 'concluída' | 'cancelada';

export type ViewType = 'kanban' | 'lista' | 'cards';

export type DimensionKey =
  | 'impactoFinanceiro'
  | 'alcance'
  | 'urgencia'
  | 'custoAtraso'
  | 'tempoExecucao'
  | 'complexidade'
  | 'confianca'
  | 'autonomia'
  | 'alavancagem'
  | 'energia';

export interface DimensionConfig {
  key: DimensionKey;
  dbKey: string;
  label: string;
  inverted: boolean;
  descriptions: Record<number, string>;
}

export interface Task {
  id: string;
  userId?: string;
  title: string;
  description: string;
  notes: string;
  tags: string[];
  dimensions: Record<DimensionKey, number>;
  leverages: LeverageType[];
  priorityScore: number;
  classification: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  deletedAt: string | null;
}

export interface TagColor {
  bg: string;
  text: string;
}

export interface UserSettings {
  tags: string[];
  classifications: string[];
  tagColors: Record<string, TagColor>;
  activeDimensions: DimensionKey[];
}

export interface FilterState {
  search: string;
  tags: string[];
  classifications: string[];
  leverages: LeverageType[];
  statuses: TaskStatus[];
  showCompleted: boolean;
  scoreRange: [number, number];
}

export interface PendingSyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete' | 'restore' | 'purge';
  taskId: string;
  data?: Partial<Task>;
  timestamp: string;
}

// Supabase row → Task mapping
export interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  notes: string;
  dim_impacto_financeiro: number;
  dim_alcance: number;
  dim_urgencia: number;
  dim_custo_atraso: number;
  dim_tempo_execucao: number;
  dim_complexidade: number;
  dim_confianca: number;
  dim_autonomia: number;
  dim_alavancagem: number;
  dim_energia: number;
  priority_score: number;
  leverages: string[];
  tags: string[];
  classification: string;
  status: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  deleted_at: string | null;
}
