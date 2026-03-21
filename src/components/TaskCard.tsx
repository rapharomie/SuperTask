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
  code: <Code2 size={16} />,
  documentation: <FileText size={16} />,
  team: <Users size={16} />,
  financial: <DollarSign size={16} />,
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
        <div key={key} className="text-orange-500" title={key}>
          {leverageIconMap[key]}
        </div>
      ));
  };

  const getScoreBreakdown = () => {
    const dimensions = Object.keys(DIMENSION_MAP) as DimensionKey[];
    const maxScore = 100;

    return dimensions.map((dim) => {
      const dimensionScore = task.dimensions[dim] || 0;
      const percentage = (dimensionScore / maxScore) * 100;

      return (
        <div
          key={dim}
          className="h-1 bg-gray-700 rounded-full overflow-hidden flex-1"
          title={`${DIMENSION_MAP[dim as DimensionKey]}: ${dimensionScore}`}
        >
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${percentage}%`,
              backgroundColor: getScoreColor(dimensionScore),
            }}
          />
        </div>
      );
    });
  };

  if (compact) {
    return (
      <div
        className="p-4 rounded-lg border transition-all duration-200 hover:shadow-lg"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
        }}
      >
        {/* Header with title and score badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-sm line-clamp-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {task.title}
            </h3>
          </div>
          <div
            className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs"
            style={{ backgroundColor: scoreColor, color: 'white' }}
          >
            {Math.round(task.priorityScore)}
          </div>
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: 'var(--bg-hover)',
                  color: 'var(--accent)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Leverage icons and status indicator */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">{getLeverageIcons()}</div>
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: scoreColor }}
          />
        </div>
      </div>
    );
  }

  // Full mode (Grid view)
  return (
    <div
      className="p-5 rounded-lg border transition-all duration-200 hover:shadow-lg"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Title and description */}
      <div className="mb-4">
        <h3
          className="font-bold text-base line-clamp-2 mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          {task.title}
        </h3>
        {task.description && (
          <p
            className="text-sm line-clamp-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {task.description}
          </p>
        )}
      </div>

      {/* Score section */}
      <div className="mb-4">
        <div className="flex items-end gap-3 mb-2">
          <div
            className="text-3xl font-bold"
            style={{ color: scoreColor }}
          >
            {Math.round(task.priorityScore)}
          </div>
          <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: scoreColor }} />
        </div>

        {/* Score breakdown bars */}
        <div className="flex gap-1">{getScoreBreakdown()}</div>
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 rounded text-xs font-medium"
              style={{
                backgroundColor: 'var(--bg-hover)',
                color: 'var(--accent)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Leverage icons with score */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">{getLeverageIcons()}</div>
        <span
          className="text-xs font-semibold px-2 py-1 rounded"
          style={{
            backgroundColor: 'var(--bg-hover)',
            color: 'var(--accent)',
          }}
        >
          {Math.round(task.priorityScore)}
        </span>
      </div>

      {/* Classification badge */}
      <div className="mb-4 relative">
        <button
          onClick={() => setShowClassificationDropdown(!showClassificationDropdown)}
          className="w-full px-3 py-2 rounded text-sm font-medium flex items-center justify-between transition-colors"
          style={{
            backgroundColor: 'var(--bg-hover)',
            color: 'var(--text-primary)',
          }}
        >
          <span>{task.classification || 'Sem classificação'}</span>
          <ChevronDown size={16} />
        </button>

        {showClassificationDropdown && (
          <div
            className="absolute top-full left-0 right-0 mt-1 rounded-lg border shadow-lg z-10"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
            }}
          >
            {['Crítico', 'Alto', 'Médio', 'Baixo'].map((classification) => (
              <button
                key={classification}
                onClick={() => {
                  onClassificationChange(task.id, classification);
                  setShowClassificationDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:opacity-80 transition-opacity"
                style={{ color: 'var(--text-primary)' }}
              >
                {classification}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes preview */}
      {task.notes && (
        <p
          className="text-sm line-clamp-2 mb-4"
          style={{ color: 'var(--text-secondary)' }}
        >
          {task.notes}
        </p>
      )}

      {/* Status and quick actions */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="w-full px-3 py-2 rounded text-sm font-medium flex items-center justify-between transition-colors"
            style={{
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-primary)',
            }}
          >
            <span>{task.status || 'A fazer'}</span>
            <ChevronDown size={16} />
          </button>

          {showStatusDropdown && (
            <div
              className="absolute top-full left-0 right-0 mt-1 rounded-lg border shadow-lg z-10"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
              }}
            >
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status.value}
                  onClick={() => {
                    onStatusChange(task.id, status.value as TaskStatus);
                    setShowStatusDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {status.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => onComplete(task.id)}
          className="p-2 rounded hover:opacity-80 transition-opacity"
          style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--accent)' }}
          title="Completar"
        >
          <CheckCircle2 size={20} />
        </button>

        <button
          onClick={() => onEdit(task)}
          className="p-2 rounded hover:opacity-80 transition-opacity"
          style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--accent)' }}
          title="Editar"
        >
          <Pencil size={20} />
        </button>

        <button
          onClick={() => onDelete(task.id)}
          className="p-2 rounded hover:opacity-80 transition-opacity"
          style={{ backgroundColor: 'var(--bg-hover)', color: '#ef4444' }}
          title="Deletar"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}
