import { useState, useCallback, useEffect } from 'react';
import type { Task, DimensionKey, UserSettings } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { calculatePriorityScore } from '../utils/scoring';
import { generateId, rowToTask, taskToRow } from '../utils/helpers';
import { getCachedTasks, setCachedTasks, hasBeenSeeded, markAsSeeded } from '../utils/sync';
import { SAMPLE_TASKS } from '../utils/constants';

export function useTasks(settings: UserSettings) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Active (non-deleted) tasks
  const activeTasks = tasks.filter(t => !t.deletedAt);
  // Trash (soft-deleted, within 30 days)
  const trashTasks = tasks.filter(t => {
    if (!t.deletedAt) return false;
    const deleted = new Date(t.deletedAt);
    const now = new Date();
    return now.getTime() - deleted.getTime() < 30 * 24 * 60 * 60 * 1000;
  });

  const recalcScore = useCallback(
    (dims: Record<DimensionKey, number>) => calculatePriorityScore(dims, settings.activeDimensions),
    [settings.activeDimensions]
  );

  // Recalculate all scores when active dimensions change
  useEffect(() => {
    setTasks(prev =>
      prev.map(t => ({
        ...t,
        priorityScore: recalcScore(t.dimensions),
      }))
    );
  }, [recalcScore]);

  // Load tasks
  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('priority_score', { ascending: false });

        if (error) throw error;
        if (data) {
          const mapped = data.map(rowToTask).map(t => ({
            ...t,
            priorityScore: recalcScore(t.dimensions),
          }));
          setTasks(mapped);
          setCachedTasks(mapped);
          if (!hasBeenSeeded() && mapped.length === 0) {
            await seedSampleTasks();
          }
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Supabase load failed, using cache:', e);
    }

    // Fallback to cache
    const cached = getCachedTasks();
    if (cached.length > 0) {
      setTasks(cached.map(t => ({ ...t, priorityScore: recalcScore(t.dimensions) })));
    } else if (!hasBeenSeeded()) {
      await seedSampleTasks();
    }
    setLoading(false);
  }, [recalcScore]);

  const seedSampleTasks = useCallback(async () => {
    const now = new Date().toISOString();
    const seeded: Task[] = SAMPLE_TASKS.map(s => ({
      ...s,
      id: generateId(),
      priorityScore: recalcScore(s.dimensions),
      createdAt: now,
      updatedAt: now,
    }));

    if (isSupabaseConfigured()) {
      for (const t of seeded) {
        const row = taskToRow(t as Task & { title: string });
        await supabase.from('tasks').insert(row);
      }
    }

    setTasks(seeded);
    setCachedTasks(seeded);
    markAsSeeded();
  }, [recalcScore]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Create task
  const createTask = useCallback(
    async (taskData: Omit<Task, 'id' | 'priorityScore' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newTask: Task = {
        ...taskData,
        id: generateId(),
        priorityScore: recalcScore(taskData.dimensions),
        createdAt: now,
        updatedAt: now,
      };

      setTasks(prev => {
        const next = [newTask, ...prev];
        setCachedTasks(next);
        return next;
      });

      if (isSupabaseConfigured()) {
        try {
          const row = taskToRow(newTask as Task & { title: string });
          row.id = newTask.id;
          const { error } = await supabase.from('tasks').insert(row);
          if (error) console.error('Create sync error:', error);
        } catch (e) {
          console.warn('Create sync failed:', e);
        }
      }

      return newTask;
    },
    [recalcScore]
  );

  // Update task
  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      const now = new Date().toISOString();

      setTasks(prev => {
        const next = prev.map(t => {
          if (t.id !== id) return t;
          const updated = { ...t, ...updates, updatedAt: now };
          if (updates.dimensions) {
            updated.priorityScore = recalcScore(updates.dimensions);
          }
          if (updates.status === 'concluída' && !t.completedAt) {
            updated.completedAt = now;
          }
          return updated;
        });
        setCachedTasks(next);
        return next;
      });

      if (isSupabaseConfigured()) {
        try {
          const row: Record<string, unknown> = {};
          if (updates.title !== undefined) row.title = updates.title;
          if (updates.description !== undefined) row.description = updates.description;
          if (updates.notes !== undefined) row.notes = updates.notes;
          if (updates.tags !== undefined) row.tags = updates.tags;
          if (updates.leverages !== undefined) row.leverages = updates.leverages;
          if (updates.classification !== undefined) row.classification = updates.classification;
          if (updates.status !== undefined) {
            row.status = updates.status;
            if (updates.status === 'concluída') row.completed_at = now;
          }
          if (updates.deletedAt !== undefined) row.deleted_at = updates.deletedAt;
          if (updates.dimensions) {
            row.dim_impacto_financeiro = updates.dimensions.impactoFinanceiro;
            row.dim_alcance = updates.dimensions.alcance;
            row.dim_urgencia = updates.dimensions.urgencia;
            row.dim_custo_atraso = updates.dimensions.custoAtraso;
            row.dim_tempo_execucao = updates.dimensions.tempoExecucao;
            row.dim_complexidade = updates.dimensions.complexidade;
            row.dim_confianca = updates.dimensions.confianca;
            row.dim_autonomia = updates.dimensions.autonomia;
            row.dim_alavancagem = updates.dimensions.alavancagem;
            row.dim_energia = updates.dimensions.energia;
          }
          row.updated_at = now;

          const { error } = await supabase.from('tasks').update(row).eq('id', id);
          if (error) console.error('Update sync error:', error);
        } catch (e) {
          console.warn('Update sync failed:', e);
        }
      }
    },
    [recalcScore]
  );

  // Soft delete
  const softDeleteTask = useCallback(async (id: string) => {
    const now = new Date().toISOString();
    await updateTask(id, { deletedAt: now });
  }, [updateTask]);

  // Restore from trash
  const restoreTask = useCallback(async (id: string) => {
    await updateTask(id, { deletedAt: null });
  }, [updateTask]);

  // Permanent delete
  const permanentDeleteTask = useCallback(async (id: string) => {
    setTasks(prev => {
      const next = prev.filter(t => t.id !== id);
      setCachedTasks(next);
      return next;
    });

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) console.error('Permanent delete sync error:', error);
      } catch (e) {
        console.warn('Permanent delete sync failed:', e);
      }
    }
  }, []);

  // Empty trash
  const emptyTrash = useCallback(async () => {
    const trashIds = trashTasks.map(t => t.id);
    setTasks(prev => {
      const next = prev.filter(t => !trashIds.includes(t.id));
      setCachedTasks(next);
      return next;
    });

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .not('deleted_at', 'is', null);
        if (error) console.error('Empty trash sync error:', error);
      } catch (e) {
        console.warn('Empty trash sync failed:', e);
      }
    }
  }, [trashTasks]);

  // Complete task shortcut
  const completeTask = useCallback(async (id: string) => {
    await updateTask(id, { status: 'concluída' });
  }, [updateTask]);

  return {
    tasks: activeTasks,
    trashTasks,
    allTasks: tasks,
    loading,
    createTask,
    updateTask,
    softDeleteTask,
    restoreTask,
    permanentDeleteTask,
    emptyTrash,
    completeTask,
    reload: loadTasks,
  };
}
