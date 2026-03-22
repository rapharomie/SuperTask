import React, { useState } from 'react';
import {
  CheckCircle2,
  Pencil,
  Trash2,
  Code2,
  FileText,
  Users,
  DollarSign,
  ChevronDown,
} from 'lucide-react';
import type { Task, TaskStatus, DimensionKey, UserSettings } from '../types';
import { getScoreColor } from '../utils/scoring';
import { DIMENSION_MAP, LEVERAGE_OPTIONS, STATUS_OPTIONS } from '../utils/constants';

interface TaskCardProps {
  task: Task;
  compact?: boolean;
  onEdit: (task: Task) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onClassificationChange: (id: string, classification: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  settings: UserSettings;
}

const leverageIconMap: Record<string, React.ReactNode> = {
  code: <Code2 size={14} />,
  documentation: <FileText size={14} />,
  team: <Users size={14} />,
  financial: <DollarSign size={14} />,
};

export default function TaskCard({
  task,
  compact = false,
  onEdit,
  onComplete,
  onDelete,
  onClassificationChange,
  onStatusChange,
}: TaskCardProps) {
  const [showClassificationDropdown, setShowClassificationDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const scoreColor = getScoreColor(task.priorityScore);

  const getLeverageIcons = () => {
    return task.leverages
      .filter((key) => LEVERAGE_OPTIONS.find((opt) => opt.value === key))
      .map((key) => (
        <div
          key={key}
          className="flex items-center justify-center w-6 h-6 rounded-md"
          style={{
            backgroundColor: 'var(--accent-subtle)',
            color: 'var(--accent)',
          }}
          title={key}
        >
          {leverageIconMap[key] || <Code2 size={14} />}
        </div>
      ));
  };

  if (compact) {
    return (
      <div
        className="p-3.5 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer group"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
        }}
        onClick={() => onEdit(task)}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <h3
            className="font-medium text-sm line-clamp-2 flex-1"
            style={{ color: 'var(--text-primary)' }}
          >
            {task.title}
          </h3>
          <div
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white"
            style={{ backgroundColor: scoreColor }}
          >
            {Math.round(task.priorityScore)}
          </div>
        </div>

        {/* Tags */}
        {task.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            {task.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium"
                style={{
                  backgroundColor: 'var(--accent-subtle)',
                  color: 'var(--accent)',
                }}
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 2 && (
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                +{task.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">{getLeverageIcons()}</div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onComplete(task.id); }}
              className="p-1 rounded hover:bg-[var(--success-light)]"
              style={{ color: 'var(--success)' }}
              title="Concluir"
            >
              <CheckCircle2 size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
              className="p-1 rounded hover:bg-[var(--danger-light)]"
              style={{ color: 'var(--danger)' }}
              title="Excluir"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full mode
  return (
    <div
      className="p-5 rounded-xl border transition-all duration-200 hover:shadow-md"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Title */}
      <div className="mb-4">
        <h3 className="font-bold text-base line-clamp-2 mb-1.5" style={{ color: 'var(--text-primary)' }}>
          {task.title}
        </h3>
        {task.description && (
          <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
            {task.description}
          </p>
        )}
      </div>

      {/* Score */}
      <div className="mb-4">
        <div className="flex items-end gap-3 mb-2">
          <div className="text-3xl font-bold" style={{ color: scoreColor }}>
            {Math.round(task.priorityScore)}
          </div>
          <div
            className="flex-1 h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--bg-hover)' }}
          >
            <div className="h-full rounded-full" style={{ width: `${task.priorityScore}%`, backgroundColor: scoreColor }} />
          </div>
        </div>

        {/* Score breakdown bars */}
        <div className="flex gap-1">
          {(Object.keys(DIMENSION_MAP) as DimensionKey[]).map((dim) => {
            const val = task.dimensions[dim] || 0;
            return (
              <div
                key={dim}
                className="h-1 rounded-full overflow-hidden flex-1"
                style={{ backgroundColor: 'var(--bg-hover)' }}
                title={`${DIMENSION_MAP[dim].label}: ${val}`}
              >
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${(val / 10) * 100}%`,
                    backgroundColor: getScoreColor(val * 10),
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Tags */}
      {task.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md text-xs font-medium"
              style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Leverages */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1.5">{getLeverageIcons()}</div>
      </div>

      {/* Classification dropdown */}
      <div className="mb-3 relative">
        <button
          onClick={() => setShowClassificationDropdown(!showClassificationDropdown)}
          className="w-full px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between transition-colors border"
          style={{
            backgroundColor: 'var(--bg-hover)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border-color)',
          }}
        >
          <span>{task.classification || 'Sem classificação'}</span>
          <ChevronDown size={14} />
        </button>
        {showClassificationDropdown && (
          <div
            className="absolute top-full left-0 right-0 mt-1 rounded-lg border shadow-lg z-10 overflow-hidden animate-fadeIn"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            {['Crítico', 'Alto', 'Médio', 'Baixo'].map((c) => (
              <button
                key={c}
                onClick={() => { onClassificationChange(task.id, c); setShowClassificationDropdown(false); }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-hover)] transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="w-full px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between transition-colors border"
            style={{
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color)',
            }}
          >
            <span>{task.status || 'A fazer'}</span>
            <ChevronDown size={14} />
          </button>
          {showStatusDropdown && (
            <div
              className="absolute top-full left-0 right-0 mt-1 rounded-lg border shadow-lg z-10 overflow-hidden animate-fadeIn"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => { onStatusChange(task.id, s.value as TaskStatus); setShowStatusDropdown(false); }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-hover)] transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => onComplete(task.id)}
          className="p-2 rounded-lg transition-colors border"
          style={{
            backgroundColor: 'var(--bg-hover)',
            borderColor: 'var(--border-color)',
            color: 'var(--success)',
          }}
          title="Concluir"
        >
          <CheckCircle2 size={18} />
        </button>
        <button
          onClick={() => onEdit(task)}
          className="p-2 rounded-lg transition-colors border"
          style={{
            backgroundColor: 'var(--bg-hover)',
            borderColor: 'var(--border-color)',
            color: 'var(--accent)',
          }}
          title="Editar"
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-2 rounded-lg transition-colors border"
          style={{
            backgroundColor: 'var(--bg-hover)',
            borderColor: 'var(--border-color)',
            color: 'var(--danger)',
          }}
          title="Excluir"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
