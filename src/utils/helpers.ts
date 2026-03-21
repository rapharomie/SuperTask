import { v4 as uuidv4 } from 'uuid';
import type { Task, TaskRow, DimensionKey } from '../types';

/**
 * Gera um UUID v4.
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Formata data ISO para exibição em pt-BR.
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formata data ISO para exibição com hora.
 */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calcula dias restantes até exclusão permanente (30 dias após soft delete).
 */
export function daysUntilPurge(deletedAt: string): number {
  const deleted = new Date(deletedAt);
  const purgeDate = new Date(deleted.getTime() + 30 * 24 * 60 * 60 * 1000);
  const now = new Date();
  return Math.max(0, Math.ceil((purgeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

/**
 * Converte TaskRow (Supabase) → Task (app).
 */
export function rowToTask(row: TaskRow): Task {
  const dimensions: Record<DimensionKey, number> = {
    impactoFinanceiro: row.dim_impacto_financeiro,
    alcance: row.dim_alcance,
    urgencia: row.dim_urgencia,
    custoAtraso: row.dim_custo_atraso,
    tempoExecucao: row.dim_tempo_execucao,
    complexidade: row.dim_complexidade,
    confianca: row.dim_confianca,
    autonomia: row.dim_autonomia,
    alavancagem: row.dim_alavancagem,
    energia: row.dim_energia,
  };

  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description || '',
    notes: row.notes || '',
    tags: row.tags || [],
    dimensions,
    leverages: (row.leverages || []) as Task['leverages'],
    priorityScore: row.priority_score,
    classification: row.classification,
    status: row.status as Task['status'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
    deletedAt: row.deleted_at,
  };
}

/**
 * Converte Task (app) → objeto para insert/update no Supabase.
 */
export function taskToRow(task: Partial<Task> & { title: string }): Record<string, unknown> {
  const row: Record<string, unknown> = {};

  if (task.title !== undefined) row.title = task.title;
  if (task.description !== undefined) row.description = task.description;
  if (task.notes !== undefined) row.notes = task.notes;
  if (task.tags !== undefined) row.tags = task.tags;
  if (task.leverages !== undefined) row.leverages = task.leverages;
  if (task.classification !== undefined) row.classification = task.classification;
  if (task.status !== undefined) row.status = task.status;
  if (task.completedAt !== undefined) row.completed_at = task.completedAt;
  if (task.deletedAt !== undefined) row.deleted_at = task.deletedAt;

  if (task.dimensions) {
    row.dim_impacto_financeiro = task.dimensions.impactoFinanceiro;
    row.dim_alcance = task.dimensions.alcance;
    row.dim_urgencia = task.dimensions.urgencia;
    row.dim_custo_atraso = task.dimensions.custoAtraso;
    row.dim_tempo_execucao = task.dimensions.tempoExecucao;
    row.dim_complexidade = task.dimensions.complexidade;
    row.dim_confianca = task.dimensions.confianca;
    row.dim_autonomia = task.dimensions.autonomia;
    row.dim_alavancagem = task.dimensions.alavancagem;
    row.dim_energia = task.dimensions.energia;
  }

  return row;
}

/**
 * Cria uma nova Task com valores padrão.
 */
export function createEmptyTask(): Omit<Task, 'id' | 'priorityScore' | 'createdAt' | 'updatedAt'> {
  return {
    title: '',
    description: '',
    notes: '',
    tags: [],
    dimensions: {
      impactoFinanceiro: 0,
      alcance: 0,
      urgencia: 0,
      custoAtraso: 0,
      tempoExecucao: 0,
      complexidade: 0,
      confianca: 0,
      autonomia: 0,
      alavancagem: 0,
      energia: 0,
    },
    leverages: [],
    classification: 'Backlog',
    status: 'pendente',
    completedAt: null,
    deletedAt: null,
  };
}

/**
 * Duplica uma tarefa (sem ID e datas).
 */
export function duplicateTask(task: Task): Omit<Task, 'id' | 'priorityScore' | 'createdAt' | 'updatedAt'> {
  return {
    title: `${task.title} (cópia)`,
    description: task.description,
    notes: task.notes,
    tags: [...task.tags],
    dimensions: { ...task.dimensions },
    leverages: [...task.leverages],
    classification: task.classification,
    status: 'pendente',
    completedAt: null,
    deletedAt: null,
  };
}

/**
 * Debounce simples.
 */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

/**
 * Trunca texto com ellipsis.
 */
export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trim() + '…';
}
