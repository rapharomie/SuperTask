import React, { useState, useMemo } from 'react';
import type { Task, UserSettings } from '../types';
import TaskCard from './TaskCard';

interface KanbanViewProps {
  tasks: Task[];
  settings: UserSettings;
  onEditTask: (task: Task) => void;
  onCompleteTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
}

const COLUMN_ACCENT_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
];

export default function KanbanView({
  tasks,
  settings,
  onEditTask,
  onCompleteTask,
  onDeleteTask,
  onUpdateTask,
}: KanbanViewProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [mobileTabIndex, setMobileTabIndex] = useState(0);

  const classifications = useMemo(
    () =>
      settings.classifications?.length > 0
        ? settings.classifications
        : ['Faz agora', 'Agenda', 'Delega', 'Backlog', 'Esperando'],
    [settings.classifications]
  );

  const tasksByClassification = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    classifications.forEach((c) => {
      grouped[c] = tasks
        .filter((t) => t.classification === c && !t.deletedAt)
        .sort((a, b) => b.priorityScore - a.priorityScore);
    });
    return grouped;
  }, [tasks, classifications]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(task));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, classification: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(classification);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, classification: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (draggedTask && draggedTask.classification !== classification) {
      onUpdateTask(draggedTask.id, { classification });
    }
    setDraggedTask(null);
  };

  const renderColumn = (classification: string, index: number) => {
    const columnTasks = tasksByClassification[classification] || [];
    const accentColor = COLUMN_ACCENT_COLORS[index % COLUMN_ACCENT_COLORS.length];
    const isDragOver = dragOverColumn === classification;

    return (
      <div
        key={classification}
        className="flex flex-col flex-shrink-0 rounded-xl overflow-hidden transition-all duration-200"
        style={{
          width: 'min(100%, 310px)',
          backgroundColor: 'var(--bg-card)',
          border: `1px solid ${isDragOver ? accentColor : 'var(--border-color)'}`,
          boxShadow: isDragOver ? `0 0 0 2px ${accentColor}30` : 'var(--shadow-sm)',
        }}
      >
        {/* Column Header */}
        <div
          className="px-4 py-3 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {classification}
            </h3>
          </div>
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-secondary)',
            }}
          >
            {columnTasks.length}
          </span>
        </div>

        {/* Column Body */}
        <div
          onDragOver={(e) => handleDragOver(e, classification)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, classification)}
          className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[400px]"
          style={{ backgroundColor: isDragOver ? 'var(--bg-hover)' : undefined }}
        >
          {columnTasks.length === 0 ? (
            <div className="flex items-center justify-center h-24">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Arraste tarefas aqui
              </p>
            </div>
          ) : (
            columnTasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
                onDragEnd={() => { setDraggedTask(null); setDragOverColumn(null); }}
                className={`transition-opacity ${draggedTask?.id === task.id ? 'opacity-40' : ''}`}
              >
                <TaskCard
                  task={task}
                  compact={true}
                  onEdit={onEditTask}
                  onComplete={onCompleteTask}
                  onDelete={onDeleteTask}
                  onClassificationChange={(id, c) => onUpdateTask(id, { classification: c })}
                  onStatusChange={(id, s) => onUpdateTask(id, { status: s })}
                  settings={settings}
                />
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (isMobile) {
    const activeClassification = classifications[mobileTabIndex];
    const columnTasks = tasksByClassification[activeClassification] || [];

    return (
      <div className="flex flex-col h-full">
        {/* Tabs */}
        <div
          className="border-b overflow-x-auto mb-4"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex gap-0">
            {classifications.map((c, i) => (
              <button
                key={c}
                onClick={() => setMobileTabIndex(i)}
                className={`flex-shrink-0 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                  i === mobileTabIndex
                    ? 'border-[var(--accent)] text-[var(--accent)]'
                    : 'border-transparent text-[var(--text-secondary)]'
                }`}
              >
                {c}
                <span
                  className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--bg-hover)' }}
                >
                  {(tasksByClassification[c] || []).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-2.5">
          {columnTasks.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Nenhuma tarefa
              </p>
            </div>
          ) : (
            columnTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                compact={true}
                onEdit={onEditTask}
                onComplete={onCompleteTask}
                onDelete={onDeleteTask}
                onClassificationChange={(id, c) => onUpdateTask(id, { classification: c })}
                onStatusChange={(id, s) => onUpdateTask(id, { status: s })}
                settings={settings}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="overflow-x-auto overflow-y-hidden"
      style={{ height: 'calc(100vh - 200px)' }}
    >
      <div className="flex gap-4 pb-4">
        {classifications.map((c, i) => renderColumn(c, i))}
      </div>
    </div>
  );
}
