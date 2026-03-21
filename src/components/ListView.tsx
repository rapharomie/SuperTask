import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Pencil,
  Trash2,
  Code2,
  FileText,
  Users,
  DollarSign,
  ArrowUpDown,
} from 'lucide-react';
import type { Task, UserSettings, TaskStatus } from '../types';
import ScoreBreakdown from './ScoreBreakdown';
import { sortByScore, getScoreColor } from '../utils/scoring';
import { STATUS_OPTIONS } from '../utils/constants';
import { formatDate } from '../utils/helpers';

interface ListViewProps {
  tasks: Task[];
  settings: UserSettings;
  onEditTask: (task: Task) => void;
  onCompleteTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
}

type SortOption = 'score' | 'date' | 'classification';

export default function ListView({
  tasks,
  onEditTask,
  onCompleteTask,
  onDeleteTask,
}: ListViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('score');

  const sortedTasks = useMemo(() => {
    const sorted = [...tasks];

    switch (sortBy) {
      case 'score':
        return sortByScore(sorted);
      case 'date':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'classification':
        return sorted.sort((a, b) => {
          const classA = a.classification || '';
          const classB = b.classification || '';
          return classA.localeCompare(classB);
        });
      default:
        return sorted;
    }
  }, [tasks, sortBy]);

  const getStatusBadgeColor = (status: TaskStatus): string => {
    switch (status) {
      case 'concluída':
        return 'bg-green-900 text-green-200';
      case 'em_andamento':
        return 'bg-blue-900 text-blue-200';
      case 'cancelada':
        return 'bg-red-900 text-red-200';
      default:
        return 'bg-gray-700 text-gray-200';
    }
  };

  const getStatusLabel = (status: TaskStatus): string => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === status);
    return option?.label || status;
  };

  const getClassificationBadgeColor = (classification: string | undefined): string => {
    if (!classification) return 'bg-gray-700 text-gray-200';

    const normalized = classification.toLowerCase();
    if (normalized.includes('epic')) return 'bg-purple-900 text-purple-200';
    if (normalized.includes('feature')) return 'bg-blue-900 text-blue-200';
    if (normalized.includes('bug')) return 'bg-red-900 text-red-200';
    if (normalized.includes('task')) return 'bg-gray-700 text-gray-200';
    return 'bg-gray-700 text-gray-200';
  };

  const renderLeverageIcon = (leverage: string) => {
    const iconKey = leverage.toLowerCase().replace(/\s+/g, '_');
    let IconComponent = Code2;

    if (iconKey.includes('code')) IconComponent = Code2;
    else if (iconKey.includes('documentation') || iconKey.includes('doc')) IconComponent = FileText;
    else if (iconKey.includes('team') || iconKey.includes('people')) IconComponent = Users;
    else if (iconKey.includes('funding') || iconKey.includes('money') || iconKey.includes('financial'))
      IconComponent = DollarSign;

    return (
      <div
        key={leverage}
        className="flex items-center justify-center w-6 h-6 rounded bg-orange-900 text-orange-300"
        title={leverage}
      >
        <IconComponent size={16} />
      </div>
    );
  };

  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="w-full bg-var(--bg-primary) text-var(--text-primary)">
      {/* Sort Controls */}
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <ArrowUpDown size={18} className="text-var(--accent)" />
          <span className="text-sm font-medium text-var(--text-secondary)">Ordenar por:</span>
        </div>
        <div className="flex gap-2">
          {(['score', 'date', 'classification'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === option
                  ? 'bg-var(--accent) text-var(--bg-primary) shadow-lg'
                  : 'bg-var(--bg-card) text-var(--text-primary) hover:bg-var(--bg-hover)'
              }`}
            >
              {option === 'score' && 'Pontuação'}
              {option === 'date' && 'Data de Criação'}
              {option === 'classification' && 'Classificação'}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-lg border border-var(--border-color) bg-var(--bg-card)">
        <table className="w-full">
          <thead>
            <tr className="border-b border-var(--border-color) bg-var(--bg-hover)">
              <th className="px-4 py-3 text-left text-xs font-semibold text-var(--text-secondary) w-12">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-var(--text-secondary) min-w-[200px]">
                Título
              </th>
              {!isSmallScreen && (
                <>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-var(--text-secondary) w-20">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-var(--text-secondary) w-28">
                    Classificação
                  </th>
                </>
              )}
              {!isSmallScreen && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-var(--text-secondary) w-40">
                  Tags
                </th>
              )}
              {!isSmallScreen && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-var(--text-secondary) w-32">
                  Alavancas
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-semibold text-var(--text-secondary) w-28">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-var(--text-secondary) w-20">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.length === 0 ? (
              <tr>
                <td
                  colSpan={isSmallScreen ? 4 : 8}
                  className="px-4 py-8 text-center text-var(--text-muted)"
                >
                  Nenhuma tarefa encontrada.
                </td>
              </tr>
            ) : (
              sortedTasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  <tr
                    className={`border-b border-var(--border-color) transition-colors ${
                      index % 2 === 0 ? 'bg-var(--bg-primary)' : 'bg-var(--bg-hover)'
                    } hover:bg-opacity-75 cursor-pointer`}
                    onClick={() =>
                      setExpandedId(expandedId === task.id ? null : task.id)
                    }
                  >
                    {/* Position */}
                    <td className="px-4 py-3 text-sm font-medium text-var(--text-secondary)">
                      {index + 1}
                    </td>

                    {/* Title */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {expandedId === task.id ? (
                          <ChevronUp size={18} className="text-var(--accent)" />
                        ) : (
                          <ChevronDown size={18} className="text-var(--text-muted)" />
                        )}
                        <span className="text-sm font-medium text-var(--text-primary) truncate">
                          {task.title}
                        </span>
                      </div>
                    </td>

                    {/* Score */}
                    {!isSmallScreen && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-var(--accent)">
                            {Math.round(task.priorityScore)}
                          </span>
                          <div className="w-12 h-2 bg-var(--bg-primary) rounded-full overflow-hidden border border-var(--border-color)">
                            <div
                              className="h-full transition-all"
                              style={{
                                width: `${Math.min(task.priorityScore, 100)}%`,
                                backgroundColor: getScoreColor(task.priorityScore),
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Classification */}
                    {!isSmallScreen && (
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getClassificationBadgeColor(
                            task.classification
                          )}`}
                        >
                          {task.classification || 'Sem classificação'}
                        </span>
                      </td>
                    )}

                    {/* Tags */}
                    {!isSmallScreen && (
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {task.tags && task.tags.length > 0 ? (
                            task.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 rounded-full text-xs bg-var(--bg-hover) text-var(--text-secondary) border border-var(--border-color)"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-var(--text-muted)">Sem tags</span>
                          )}
                          {task.tags && task.tags.length > 3 && (
                            <span className="text-xs text-var(--text-muted)">
                              +{task.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    {/* Leverage Icons */}
                    {!isSmallScreen && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {task.leverages && task.leverages.length > 0 ? (
                            task.leverages.map((leverage: string) =>
                              renderLeverageIcon(leverage)
                            )
                          ) : (
                            <span className="text-xs text-var(--text-muted)">Nenhuma</span>
                          )}
                        </div>
                      </td>
                    )}

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                          task.status
                        )}`}
                      >
                        {getStatusLabel(task.status)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTask(task);
                          }}
                          className="p-1.5 hover:bg-var(--bg-hover) rounded transition-colors text-var(--text-secondary) hover:text-var(--accent)"
                          title="Editar tarefa"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCompleteTask(task.id);
                          }}
                          className="p-1.5 hover:bg-var(--bg-hover) rounded transition-colors text-var(--text-secondary) hover:text-green-400"
                          title="Marcar como concluída"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTask(task.id);
                          }}
                          className="p-1.5 hover:bg-var(--bg-hover) rounded transition-colors text-var(--text-secondary) hover:text-red-400"
                          title="Deletar tarefa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row - Score Breakdown */}
                  {expandedId === task.id && (
                    <tr className={index % 2 === 0 ? 'bg-var(--bg-primary)' : 'bg-var(--bg-hover)'}>
                      <td colSpan={isSmallScreen ? 4 : 8} className="px-4 py-4">
                        <div className="pl-8 border-l-2 border-var(--accent)">
                          <h4 className="text-sm font-semibold text-var(--text-primary) mb-4">
                            Análise Detalhada
                          </h4>
                          <ScoreBreakdown
                            dimensions={task.dimensions}
                            priorityScore={task.priorityScore}
                            compact={true}
                          />
                          {task.description && (
                            <div className="mt-4">
                              <p className="text-xs font-semibold text-var(--text-secondary) mb-2">
                                Descrição:
                              </p>
                              <p className="text-sm text-var(--text-primary) line-clamp-3">
                                {task.description}
                              </p>
                            </div>
                          )}
                          <div className="mt-4 text-xs text-var(--text-muted)">
                            Criado em {formatDate(task.createdAt)} {task.updatedAt && `· Atualizado em ${formatDate(task.updatedAt)}`}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Stats Footer */}
      <div className="mt-4 px-4 py-3 bg-var(--bg-card) rounded-lg border border-var(--border-color) text-xs text-var(--text-muted)">
        <div className="flex justify-between">
          <span>Total de tarefas: {tasks.length}</span>
          <span>
            Pontuação média:{' '}
            {tasks.length > 0
              ? Math.round(
                  tasks.reduce((sum, t) => sum + t.priorityScore, 0) /
                    tasks.length
                )
              : 0}
          </span>
        </div>
      </div>
    </div>
  );
}
