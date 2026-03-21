import type { DimensionKey, Task } from '../types';

/**
 * Calcula o priority score baseado nas dimensões ativas.
 * Score = soma das dimensões ativas (máx 100 se todas ativas, proporcional se não).
 */
export function calculatePriorityScore(
  dimensions: Record<DimensionKey, number>,
  activeDimensions: DimensionKey[]
): number {
  if (activeDimensions.length === 0) return 0;

  const sum = activeDimensions.reduce((acc, key) => acc + (dimensions[key] || 0), 0);

  // Normaliza para 0-100 baseado nas dimensões ativas
  const maxPossible = activeDimensions.length * 10;
  return Math.round((sum / maxPossible) * 100);
}

/**
 * Calcula o score bruto (soma simples) sem normalização.
 */
export function calculateRawScore(
  dimensions: Record<DimensionKey, number>,
  activeDimensions: DimensionKey[]
): number {
  return activeDimensions.reduce((acc, key) => acc + (dimensions[key] || 0), 0);
}

/**
 * Retorna a cor do score baseado no valor (0-100).
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return '#ef4444'; // vermelho — urgente
  if (score >= 60) return '#f97316'; // laranja — alto
  if (score >= 40) return '#eab308'; // amarelo — médio
  if (score >= 20) return '#22c55e'; // verde — baixo
  return '#94a3b8'; // cinza — mínimo
}

/**
 * Retorna a classe CSS para o score badge.
 */
export function getScoreBadgeClass(score: number): string {
  if (score >= 80) return 'bg-red-500/20 text-red-400 border-red-500/30';
  if (score >= 60) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
  if (score >= 40) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  if (score >= 20) return 'bg-green-500/20 text-green-400 border-green-500/30';
  return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
}

/**
 * Ordena tarefas por priority score (maior primeiro).
 */
export function sortByScore(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => b.priorityScore - a.priorityScore);
}
