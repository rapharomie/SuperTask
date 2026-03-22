import React, { useState } from 'react';
import { Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import type { FilterState, UserSettings, TaskStatus } from '../types';
import { LEVERAGE_OPTIONS, STATUS_OPTIONS } from '../utils/constants';

interface FilterBarProps {
  filters: FilterState;
  onUpdateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onToggleArrayFilter: (key: keyof FilterState, value: string) => void;
  onReset: () => void;
  activeFilterCount: number;
  totalCount: number;
  filteredCount: number;
  settings: UserSettings;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onUpdateFilter,
  onToggleArrayFilter,
  onReset,
  activeFilterCount,
  totalCount,
  filteredCount,
  settings,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTagColor = (tag: string) => {
    const tagColor = settings.tagColors?.[tag];
    return tagColor?.bg || '#f97316';
  };

  const availableTags = Object.keys(settings.tagColors || {});
  const availableClassifications = settings.classifications || [];

  return (
    <div
      className="rounded-xl border mb-6 overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Toggle Bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-3 transition-colors hover:bg-[var(--bg-hover)]"
      >
        <div className="flex items-center gap-3">
          <Filter size={16} style={{ color: 'var(--accent)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Filtros
          </span>
          {activeFilterCount > 0 && (
            <span
              className="flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {filteredCount} de {totalCount}
          </span>
          {isExpanded ? (
            <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} />
          ) : (
            <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
          )}
        </div>
      </button>

      {/* Expanded Filters */}
      {isExpanded && (
        <div
          className="px-5 pb-5 pt-2 space-y-4 border-t animate-fadeIn"
          style={{ borderColor: 'var(--border-color)' }}
        >
          {/* Tags */}
          {availableTags.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Etiquetas
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isActive = filters.tags?.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => onToggleArrayFilter('tags', tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                        isActive ? 'ring-2 ring-offset-1' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: getTagColor(tag) + (isActive ? '30' : '15'),
                        color: getTagColor(tag),
                        borderColor: isActive ? getTagColor(tag) : 'transparent',
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Classification */}
          {availableClassifications.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Classificação
              </label>
              <div className="flex flex-wrap gap-2">
                {availableClassifications.map((classification) => {
                  const isActive = filters.classifications?.includes(classification);
                  return (
                    <button
                      key={classification}
                      onClick={() => onToggleArrayFilter('classifications', classification)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        isActive
                          ? 'text-white border-transparent'
                          : 'hover:border-[var(--accent)]'
                      }`}
                      style={{
                        backgroundColor: isActive ? 'var(--accent)' : 'var(--bg-hover)',
                        color: isActive ? 'white' : 'var(--text-secondary)',
                        borderColor: isActive ? 'var(--accent)' : 'var(--border-color)',
                      }}
                    >
                      {classification}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Leverage & Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Leverage */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Alavancagem
              </label>
              <div className="flex flex-wrap gap-2">
                {LEVERAGE_OPTIONS.map((leverage) => {
                  const isActive = filters.leverages?.includes(leverage.value);
                  return (
                    <button
                      key={leverage.value}
                      onClick={() => onToggleArrayFilter('leverages', leverage.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        isActive ? 'text-white border-transparent' : ''
                      }`}
                      style={{
                        backgroundColor: isActive ? 'var(--accent)' : 'var(--bg-hover)',
                        color: isActive ? 'white' : 'var(--text-secondary)',
                        borderColor: isActive ? 'var(--accent)' : 'var(--border-color)',
                      }}
                    >
                      {leverage.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((status) => {
                  const isActive = filters.statuses?.includes(status.value as TaskStatus);
                  return (
                    <button
                      key={status.value}
                      onClick={() => onToggleArrayFilter('statuses', status.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        isActive ? 'text-white border-transparent' : ''
                      }`}
                      style={{
                        backgroundColor: isActive ? 'var(--accent)' : 'var(--bg-hover)',
                        color: isActive ? 'white' : 'var(--text-secondary)',
                        borderColor: isActive ? 'var(--accent)' : 'var(--border-color)',
                      }}
                    >
                      {status.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Score Range + Show Completed + Reset */}
          <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-4">
              {/* Show Completed */}
              <label className="flex items-center gap-2 cursor-pointer">
                <button
                  onClick={() => onUpdateFilter('showCompleted', !filters.showCompleted)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    filters.showCompleted ? 'bg-orange-500' : ''
                  }`}
                  style={{
                    backgroundColor: filters.showCompleted ? 'var(--accent)' : 'var(--border-color)',
                  }}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                      filters.showCompleted ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Concluídas
                </span>
              </label>

              {/* Score Range */}
              <div className="hidden md:flex items-center gap-2">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Score:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Min"
                  value={filters.scoreRange?.[0] ?? ''}
                  onChange={(e) => {
                    const num = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                    onUpdateFilter('scoreRange', [num, filters.scoreRange?.[1] ?? 100]);
                  }}
                  className="w-16 px-2 py-1 text-xs rounded-md border focus:outline-none focus:ring-1 focus:ring-orange-500"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>-</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Max"
                  value={filters.scoreRange?.[1] ?? ''}
                  onChange={(e) => {
                    const num = e.target.value === '' ? 100 : parseInt(e.target.value, 10);
                    onUpdateFilter('scoreRange', [filters.scoreRange?.[0] ?? 0, num]);
                  }}
                  className="w-16 px-2 py-1 text-xs rounded-md border focus:outline-none focus:ring-1 focus:ring-orange-500"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-[var(--bg-hover)]"
                style={{ color: 'var(--accent)' }}
              >
                <RotateCcw size={12} />
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
