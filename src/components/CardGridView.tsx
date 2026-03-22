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
  code: <Code2 size={14} />,
  documentation: <FileText size={14} />,
  team: <Users size={14} />,
  revenue: <DollarSign size={14} />,
};

export default function CardGridView({
  tasks,
  onEditTask,
  onCompleteTask,
}: CardGridViewProps) {
  const sortedTasks = useMemo(() => sortByScore([...tasks]), [tasks]);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedTasks.map((task) => (
          <GridCard
            key={task.id}
            task={task}
            onEditTask={onEditTask}
            onCompleteTask={onCompleteTask}
          />
        ))}
      </div>
    </div>
  );
}

interface GridCardProps {
  task: Task;
  onEditTask: (task: Task) => void;
  onCompleteTask: (id: string) => void;
}

function GridCard({ task, onEditTask, onCompleteTask }: GridCardProps) {
  const scoreColor = getScoreColor(task.priorityScore);
  const activeDimensions = (Object.keys(DIMENSION_MAP) as DimensionKey[]).filter(
    (dim) => task.dimensions[dim] && task.dimensions[dim] > 0
  );
  const activeLeverages = LEVERAGE_OPTIONS.filter((l) =>
    task.leverages.includes(l.value)
  );

  return (
    <div
      onClick={() => onEditTask(task)}
      className="rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col h-full group"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Accent Bar */}
      <div className="h-1" style={{ backgroundColor: scoreColor }} />

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Title */}
        <div>
          <h3
            className="font-semibold text-sm truncate"
            style={{ color: 'var(--text-primary)' }}
            title={task.title}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
              {truncate(task.description, 100)}
            </p>
          )}
        </div>

        {/* Score + Dimensions */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="text-2xl font-bold" style={{ color: scoreColor }}>
              {Math.round(task.priorityScore)}
            </div>
          </div>
          <div className="flex-1 space-y-1">
            {activeDimensions.slice(0, 5).map((dim) => {
              const val = task.dimensions[dim];
              const info = DIMENSION_MAP[dim];
              return (
                <div key={dim} className="flex items-center gap-2">
                  <span className="text-[10px] w-14 truncate" style={{ color: 'var(--text-muted)' }}>
                    {info.label}
                  </span>
                  <div
                    className="flex-1 h-1 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'var(--bg-hover)' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(val / 10) * 100}%`,
                        backgroundColor: scoreColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Classification */}
        {task.classification && (
          <span
            className="self-start px-2.5 py-1 rounded-md text-xs font-medium"
            style={{
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-primary)',
            }}
          >
            {task.classification}
          </span>
        )}

        {/* Tags */}
        {task.tags?.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium"
                style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                +{task.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Leverages */}
        {activeLeverages.length > 0 && (
          <div className="flex gap-1.5">
            {activeLeverages.map((l) => (
              <div
                key={l.value}
                className="p-1.5 rounded-md"
                style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}
                title={l.label}
              >
                {LEVERAGE_ICON_MAP[l.value] || <Code2 size={14} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div
        className="flex gap-2 p-3 border-t"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onCompleteTask(task.id); }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors"
          style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--success)' }}
        >
          <CheckCircle2 size={14} />
          <span className="hidden sm:inline">Concluir</span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors"
          style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--accent)' }}
        >
          <Pencil size={14} />
          <span className="hidden sm:inline">Editar</span>
        </button>
      </div>
    </div>
  );
}
