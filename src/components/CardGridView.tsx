import React, { useMemo } from 'react';
import {
  CheckCircle2,
  Pencil,
  Code2,
  FileText,
  Users,
  DollarSign,
} from 'lucide-react';
import type { Task, UserSettings, DimensionKey } from '../types';
import { sortByScore, getScoreColor } from '../utils/scoring';
import { DIMENSION_MAP, LEVERAGE_OPTIONS } from '../utils/constants';
import { truncate } from '../utils/helpers';

interface CardGridViewProps {
  tasks: Task[];
  settings: UserSettings;
  onEditTask: (task: Task) => void;
  onCompleteTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
}

const LEVERAGE_ICON_MAP: Record<string, React.ReactNode> = {
  code: <Code2 size={16} />,
  documentation: <FileText size={16} />,
  team: <Users size={16} />,
  revenue: <DollarSign size={16} />,
};

export default function CardGridView({
  tasks,
  settings,
  onEditTask,
  onCompleteTask,
  onDeleteTask,
  onUpdateTask,
}: CardGridViewProps) {
  const sortedTasks = useMemo(() => {
    return sortByScore([...tasks]);
  }, [tasks]);

  return (
    <div className="w-full h-full overflow-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
        {sortedTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            settings={settings}
            onEditTask={onEditTask}
            onCompleteTask={onCompleteTask}
            onDeleteTask={onDeleteTask}
            onUpdateTask={onUpdateTask}
          />
        ))}
      </div>
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  settings: UserSettings;
  onEditTask: (task: Task) => void;
  onCompleteTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
}

function TaskCard({
  task,
  onEditTask,
  onCompleteTask,
}: TaskCardProps) {
  const scoreColor = getScoreColor(task.priorityScore);
  const activeDimensions = (Object.keys(DIMENSION_MAP) as DimensionKey[]).filter(
    (dim) => task.dimensions[dim] && task.dimensions[dim] > 0
  );

  const activeLeverages = LEVERAGE_OPTIONS.filter((leverage) =>
    task.leverages.includes(leverage.value)
  );

  const handleCardClick = (e: React.MouseEvent) => {
    // Only open edit modal if not clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onEditTask(task);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-card border border-border-color rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Color Bar */}
      <div
        className="h-1"
        style={{ backgroundColor: scoreColor }}
      />

      {/* Card Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Title and Description */}
        <div>
          <h3
            className="font-semibold text-sm truncate"
            style={{ color: 'var(--text-primary)' }}
            title={task.title}
          >
            {task.title}
          </h3>
          {task.description && (
            <p
              className="text-xs mt-1 line-clamp-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              {truncate(task.description, 100)}
            </p>
          )}
        </div>

        {/* Score Section */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div
              className="text-3xl font-bold text-center"
              style={{ color: scoreColor }}
            >
              {Math.round(task.priorityScore)}
            </div>
          </div>
          <div className="flex-1">
            {/* Score Breakdown Bars */}
            <div className="space-y-1">
              {activeDimensions.slice(0, 10).map((dimension) => {
                const dimensionScore = task.dimensions[dimension];
                const dimensionInfo = DIMENSION_MAP[dimension];
                const fillPercent = (dimensionScore / 10) * 100;

                return (
                  <div key={dimension} className="text-xs space-y-0.5">
                    <div
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {dimensionInfo.label}
                    </div>
                    <div
                      className="h-1.5 rounded bg-border-color overflow-hidden"
                      style={{ backgroundColor: 'var(--bg-hover)' }}
                    >
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${fillPercent}%`,
                          backgroundColor: scoreColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Classification Badge */}
        {task.classification && (
          <div className="flex gap-2 flex-wrap">
            <span
              className="inline-block px-2 py-1 rounded text-xs font-medium"
              style={{
                backgroundColor: 'var(--bg-hover)',
                color: 'var(--text-primary)',
              }}
            >
              {task.classification}
            </span>
          </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span
                className="inline-block px-2 py-1 text-xs font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                +{task.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Leverage Icons */}
        {activeLeverages.length > 0 && (
          <div className="flex gap-2">
            {activeLeverages.map((leverage) => (
              <div
                key={leverage.value}
                className="p-1.5 rounded"
                style={{
                  backgroundColor: 'var(--bg-hover)',
                  color: 'var(--accent)',
                }}
                title={leverage.label}
              >
                {LEVERAGE_ICON_MAP[leverage.value]}
              </div>
            ))}
          </div>
        )}

        {/* Notes Preview */}
        {task.notes && (
          <p
            className="text-xs line-clamp-2"
            style={{ color: 'var(--text-muted)' }}
          >
            {task.notes}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div
        className="flex gap-2 p-4 border-t"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCompleteTask(task.id);
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded text-sm font-medium transition-colors"
          style={{
            backgroundColor: 'var(--bg-hover)',
            color: 'var(--accent)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor =
              'var(--border-color)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor =
              'var(--bg-hover)';
          }}
          title="Marcar como concluído"
        >
          <CheckCircle2 size={16} />
          <span className="hidden sm:inline">Concluir</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditTask(task);
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded text-sm font-medium transition-colors"
          style={{
            backgroundColor: 'var(--bg-hover)',
            color: 'var(--accent)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor =
              'var(--border-color)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor =
              'var(--bg-hover)';
          }}
          title="Editar tarefa"
        >
          <Pencil size={16} />
          <span className="hidden sm:inline">Editar</span>
        </button>
      </div>
    </div>
  );
}
