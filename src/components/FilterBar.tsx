import React, { useState } from 'react';
import { Search, X, Filter, RotateCcw } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(true);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const handleSearchChange = (value: string) => {
    onUpdateFilter('search', value);
  };

  const handleScoreMinChange = (value: string) => {
    const num = value === '' ? undefined : parseInt(value, 10);
    onUpdateFilter('scoreRange', [num ?? 0, filters.scoreRange?.[1] ?? 100]);
  };

  const handleScoreMaxChange = (value: string) => {
    const num = value === '' ? undefined : parseInt(value, 10);
    onUpdateFilter('scoreRange', [filters.scoreRange?.[0] ?? 0, num ?? 100]);
  };

  const toggleTag = (tag: string) => {
    onToggleArrayFilter('tags', tag);
  };

  const toggleClassification = (classification: string) => {
    onToggleArrayFilter('classifications', classification);
  };

  const toggleLeverage = (leverage: string) => {
    onToggleArrayFilter('leverages', leverage);
  };

  const toggleStatus = (status: string) => {
    onToggleArrayFilter('statuses', status as TaskStatus);
  };

  const getTagColor = (tag: string) => {
    const tagColor = settings.tagColors?.[tag];
    return tagColor?.bg || '#f97316';
  };

  const availableTags = Object.keys(settings.tagColors || {});
  const availableClassifications = ['Estratégica', 'Tática', 'Operacional'];

  return (
    <div className="w-full bg-black border-b border-orange-500/20">
      {/* Header with toggle button */}
      <div className="px-6 py-4 flex items-center justify-between md:hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors"
        >
          <Filter size={20} />
          <span className="text-sm font-medium">
            Filtros ({activeFilterCount})
          </span>
        </button>
        <div className="text-xs text-white/60">
          {filteredCount} de {totalCount} tarefas
        </div>
      </div>

      {/* Main filter area */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-max' : 'max-h-0 md:max-h-max'
        }`}
      >
        <div className="px-6 py-6 space-y-6">
          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/80 uppercase tracking-wider">
              Pesquisar
            </label>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="text"
                placeholder="Título ou descrição..."
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
              {filters.search && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                Etiquetas
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      filters.tags?.includes(tag)
                        ? 'ring-2 ring-white/40'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: getTagColor(tag) + '20',
                      color: getTagColor(tag),
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Classification Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/80 uppercase tracking-wider">
              Classificação
            </label>
            <div className="flex flex-wrap gap-2">
              {availableClassifications.map((classification) => (
                <button
                  key={classification}
                  onClick={() => toggleClassification(classification)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    filters.classifications?.includes(classification)
                      ? 'bg-orange-500 text-black ring-2 ring-orange-400'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {classification}
                </button>
              ))}
            </div>
          </div>

          {/* Leverage Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/80 uppercase tracking-wider">
              Alavancagem
            </label>
            <div className="flex flex-wrap gap-2">
              {LEVERAGE_OPTIONS.map((leverage) => (
                <button
                  key={leverage.value}
                  onClick={() => toggleLeverage(leverage.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    filters.leverages?.includes(leverage.value)
                      ? 'bg-orange-500 text-black ring-2 ring-orange-400'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {leverage.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/80 uppercase tracking-wider">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status.value}
                  onClick={() => toggleStatus(status.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    filters.statuses?.includes(status.value as TaskStatus)
                      ? 'bg-orange-500 text-black ring-2 ring-orange-400'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* More Options Toggle */}
          <button
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="text-xs text-orange-500 hover:text-orange-400 font-medium transition-colors"
          >
            {showMoreOptions ? '▼ Menos opções' : '▶ Mais opções'}
          </button>

          {/* Advanced Options */}
          {showMoreOptions && (
            <div className="space-y-6 pt-4 border-t border-white/10">
              {/* Show Completed Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Mostrar concluídas
                </label>
                <button
                  onClick={() =>
                    onUpdateFilter('showCompleted', !filters.showCompleted)
                  }
                  className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                    filters.showCompleted
                      ? 'bg-orange-500'
                      : 'bg-white/10 border border-white/20'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      filters.showCompleted ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Score Range */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Intervalo de Pontuação
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">
                      Mínimo
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={filters.scoreRange?.[0] ?? ''}
                      onChange={(e) => handleScoreMinChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">
                      Máximo
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="100"
                      value={filters.scoreRange?.[1] ?? ''}
                      onChange={(e) => handleScoreMaxChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer: Count and Reset */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="text-sm text-white/70">
              <span className="font-semibold text-white">{filteredCount}</span> de{' '}
              <span className="font-semibold text-white">{totalCount}</span> tarefas
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={onReset}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all text-xs font-medium"
              >
                <RotateCcw size={14} />
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
