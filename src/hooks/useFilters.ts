import { useState, useMemo, useCallback } from 'react';
import type { Task, FilterState, LeverageType, TaskStatus } from '../types';
import { DEFAULT_FILTERS } from '../utils/constants';

export function useFilters(tasks: Task[]) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleArrayFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: string
  ) => {
    setFilters(prev => {
      const arr = prev[key] as string[];
      const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
      return { ...prev, [key]: next };
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !task.title.toLowerCase().includes(q) &&
          !task.description.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      // Tags
      if (filters.tags.length > 0) {
        if (!filters.tags.some(tag => task.tags.includes(tag))) return false;
      }

      // Classifications
      if (filters.classifications.length > 0) {
        if (!filters.classifications.includes(task.classification)) return false;
      }

      // Leverages
      if (filters.leverages.length > 0) {
        if (!filters.leverages.some(l => task.leverages.includes(l as LeverageType))) return false;
      }

      // Status
      if (filters.statuses.length > 0) {
        if (!filters.statuses.includes(task.status as TaskStatus)) return false;
      }

      // Show completed
      if (!filters.showCompleted && task.status === 'concluída') return false;

      // Score range
      if (task.priorityScore < filters.scoreRange[0] || task.priorityScore > filters.scoreRange[1]) {
        return false;
      }

      return true;
    });
  }, [tasks, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.tags.length > 0) count++;
    if (filters.classifications.length > 0) count++;
    if (filters.leverages.length > 0) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.showCompleted) count++;
    if (filters.scoreRange[0] > 0 || filters.scoreRange[1] < 100) count++;
    return count;
  }, [filters]);

  return {
    filters,
    filteredTasks,
    activeFilterCount,
    updateFilter,
    toggleArrayFilter,
    resetFilters,
    setFilters,
  };
}
