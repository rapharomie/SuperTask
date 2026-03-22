import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
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
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'classification':
        return sorted.sort((a, b) =>
          (a.classification || '').localeCompare(b.classification || '')
        );
      default:
        return sorted;
    }
  }, [tasks, sortBy]);

  const getStatusStyle = (status: TaskStatus) => {
    switch (status) {
      case 'concluída':
        return { bg: 'var(--success-light)', color: 'var(--success)' };
      case 'em_andamento':
        return { bg: 'var(--info-light)', color: 'var(--info)' };
      case 'cancelada':
        return { bg: 'var(--danger-light)', color: 'var(--danger)' };
      default:
        return { bg: 'var(--bg-hover)', color: 'var(--text-secondary)' };
    }
  };

  const getStatusLabel = (status: TaskStatus): string => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === status);
    return option?.label || status;
  };

  const renderLeverageIcon = (leverage: string) => {
    const iconKey = leverage.toLowerCase().replace(/\s+/g, '_');
    let IconComponent = Code2;
    if (iconKey.includes('code') || iconKey.includes('cód')) IconComponent = Code2;
    else if (iconKey.includes('cont') || iconKey.includes('doc')) IconComponent = FileText;
    else if (iconKey.includes('pess') || iconKey.includes('team')) IconComponent = Users;
    else if (iconKey.includes('dinh') || iconKey.includes('money')) IconComponent = DollarSign;

    return (
      <div
        key={leverage}
        className="flex items-center justify-center w-7 h-7 rounded-md"
        style={{
          backgroundColor: 'var(--accent-subtle)',
          color: 'var(--accent)',
        }}
        title={leverage}
      >
        <IconComponent size={14} />
      </div>
    );
  };

  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="w-full">
      {/* Sort Controls */}
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <ArrowUpDown size={16} style={{ color: 'var(--accent)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Ordenar:
          </span>
        </div>
        <div className="flex gap-1.5">
          {(['score', 'date', 'classification'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border`}
              style={{
                backgroundColor: sortBy === option ? 'var(--accent)' : 'var(--bg-card)',
                color: sortBy === option ? 'white' : 'var(--text-secondary)',
                borderColor: sortBy === option ? 'var(--accent)' : 'var(--border-color)',
              }}
            >
              {option === 'score' && 'Pontuação'}
              {option === 'date' && 'Data'}
              {option === 'classification' && 'Classificação'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        className="overflow-x-auto rounded-xl border"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <table className="w-full">
          <thead>
            <tr
              className="border-b"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <th
                className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider w-12"
                style={{ color: 'var(--text-muted)' }}
              >
                #
              </th>
              <th
                className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider min-w-[200px]"
                style={{ color: 'var(--text-muted)' }}
              >
                Título
              </th>
              {!isSmallScreen && (
                <>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider w-24" style={{ color: 'var(--text-muted)' }}>
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider w-32" style={{ color: 'var(--text-muted)' }}>
                    Classificação
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider w-40" style={{ color: 'var(--text-muted)' }}>
                    Tags
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider w-32" style={{ color: 'var(--text-muted)' }}>
                    Alavancas
                  </th>
                </>
              )}
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider w-28" style={{ color: 'var(--text-muted)' }}>
                Status
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider w-24" style={{ color: 'var(--text-muted)' }}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.length === 0 ? (
              <tr>
                <td
                  colSpan={isSmallScreen ? 4 : 8}
                  className="px-4 py-12 text-center text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Nenhuma tarefa encontrada.
                </td>
              </tr>
            ) : (
              sortedTasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  <tr
                    className="border-b transition-colors cursor-pointer hover:bg-[var(--bg-hover)]"
                    style={{ borderColor: 'var(--border-light)' }}
                    onClick={() =>
                      setExpandedId(expandedId === task.id ? null : task.id)
                    }
                  >
                    {/* # */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                        {index + 1}
                      </span>
                    </td>

                    {/* Title */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <ChevronRight
                          size={14}
                          className={`transition-transform ${expandedId === task.id ? 'rotate-90' : ''}`}
                          style={{ color: expandedId === task.id ? 'var(--accent)' : 'var(--text-muted)' }}
                        />
                        <span
                          className="text-sm font-medium truncate"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {task.title}
                        </span>
                      </div>
                    </td>

                    {/* Score */}
                    {!isSmallScreen && (
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                            style={{ backgroundColor: getScoreColor(task.priorityScore) }}
                          >
                            {Math.round(task.priorityScore)}
                          </div>
                          <div
                            className="w-16 h-1.5 rounded-full overflow-hidden"
                            style={{ backgroundColor: 'var(--bg-hover)' }}
                          >
                            <div
                              className="h-full rounded-full transition-all"
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
                      <td className="px-4 py-3.5">
                        <span
                          className="inline-block px-2.5 py-1 rounded-md text-xs font-medium"
                          style={{
                            backgroundColor: 'var(--bg-hover)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {task.classification || '—'}
                        </span>
                      </td>
                    )}

                    {/* Tags */}
                    {!isSmallScreen && (
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {task.tags?.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-md text-[11px] font-medium"
                              style={{
                                backgroundColor: 'var(--accent-subtle)',
                                color: 'var(--accent)',
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                          {task.tags && task.tags.length > 2 && (
                            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                              +{task.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    {/* Leverages */}
                    {!isSmallScreen && (
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1.5">
                          {task.leverages?.length > 0
                            ? task.leverages.map((l) => renderLeverageIcon(l))
                            : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>}
                        </div>
                      </td>
                    )}

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      {(() => {
                        const style = getStatusStyle(task.status);
                        return (
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold"
                            style={{
                              backgroundColor: style.bg,
                              color: style.color,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full mr-1.5"
                              style={{ backgroundColor: style.color }}
                            />
                            {getStatusLabel(task.status)}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
                          className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-hover)]"
                          style={{ color: 'var(--text-muted)' }}
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onCompleteTask(task.id); }}
                          className="p-1.5 rounded-md transition-colors hover:bg-[var(--success-light)]"
                          style={{ color: 'var(--success)' }}
                          title="Concluir"
                        >
                          <CheckCircle2 size={15} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                          className="p-1.5 rounded-md transition-colors hover:bg-[var(--danger-light)]"
                          style={{ color: 'var(--danger)' }}
                          title="Excluir"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Detail */}
                  {expandedId === task.id && (
                    <tr>
                      <td colSpan={isSmallScreen ? 4 : 8}>
                        <div
                          className="px-6 py-5 border-b animate-fadeIn"
                          style={{
                            backgroundColor: 'var(--bg-primary)',
                            borderColor: 'var(--border-light)',
                          }}
                        >
                          <div
                            className="pl-6 border-l-2"
                            style={{ borderColor: 'var(--accent)' }}
                          >
                            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                              Análise Detalhada
                            </h4>
                            <ScoreBreakdown
                              dimensions={task.dimensions}
                              priorityScore={task.priorityScore}
                              compact={true}
                            />
                            {task.description && (
                              <div className="mt-3">
                                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                                  Descrição:
                                </p>
                                <p className="text-sm line-clamp-3" style={{ color: 'var(--text-primary)' }}>
                                  {task.description}
                                </p>
                              </div>
                            )}
                            <div className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                              Criado em {formatDate(task.createdAt)}
                              {task.updatedAt && ` · Atualizado em ${formatDate(task.updatedAt)}`}
                            </div>
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
      <div
        className="mt-3 px-4 py-2.5 rounded-lg text-xs flex justify-between"
        style={{
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-muted)',
          border: '1px solid var(--border-color)',
        }}
      >
        <span>Total: {tasks.length}</span>
        <span>
          Média:{' '}
          {tasks.length > 0
            ? Math.round(tasks.reduce((s, t) => s + t.priorityScore, 0) / tasks.length)
            : 0}
        </span>
      </div>
    </div>
  );
}
