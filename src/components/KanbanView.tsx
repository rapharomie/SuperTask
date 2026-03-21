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

// Column border colors - subtle but distinct per column
const COLUMN_BORDER_COLORS = [
  '#ff6b6b', // red
  '#f97316', // orange
  '#fbbf24', // amber
  '#34d399', // emerald
  '#60a5fa', // blue
  '#a78bfa', // violet
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
  const [mobileTabIndex, setMobileTabIndex] = useState(0);

  // Get classifications from settings, fallback to defaults
  const classifications = useMemo(
    () =>
      settings.classifications && settings.classifications.length > 0
        ? settings.classifications
        : ['Faz agora', 'Agenda', 'Delega', 'Backlog', 'Esperando'],
    [settings.classifications]
  );

  // Group tasks by classification
  const tasksByClassification = useMemo(() => {
    const grouped: Record<string, Task[]> = {};

    classifications.forEach((classification) => {
      grouped[classification] = tasks
        .filter(
          (task) =>
            task.classification === classification &&
            !task.deletedAt &&
            (task.status !== 'concluída' || task.status === 'concluída')
        )
        .sort((a, b) => b.priorityScore - a.priorityScore);
    });

    return grouped;
  }, [tasks, classifications]);


  // Handle drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(task));
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop on column
  const handleDropOnColumn = (e: React.DragEvent<HTMLDivElement>, classification: string) => {
    e.preventDefault();

    if (!draggedTask) return;

    if (draggedTask.classification !== classification) {
      onUpdateTask(draggedTask.id, { classification });
    }

    setDraggedTask(null);
  };

  // Render a single column
  const renderColumn = (classification: string, index: number) => {
    const columnTasks = tasksByClassification[classification] || [];
    const borderColor = COLUMN_BORDER_COLORS[index % COLUMN_BORDER_COLORS.length];

    return (
      <div
        key={classification}
        className="flex flex-col flex-shrink-0 bg-[var(--bg-secondary)] rounded-lg overflow-hidden"
        style={{
          width: 'min(100%, 320px)',
          borderLeftWidth: '4px',
          borderLeftColor: borderColor,
        }}
      >
        {/* Column Header */}
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-sm text-[var(--text-primary)]">
              {classification}
            </h3>
            <span
              className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'white',
              }}
            >
              {columnTasks.length}
            </span>
          </div>
        </div>

        {/* Column Content - Droppable Area */}
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDropOnColumn(e, classification)}
          className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[500px]"
        >
          {columnTasks.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-center">
              <p className="text-xs text-[var(--text-secondary)]">
                Nenhuma tarefa
              </p>
            </div>
          ) : (
            columnTasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
                onDragEnd={() => setDraggedTask(null)}
                className={`transition-opacity ${
                  draggedTask?.id === task.id ? 'opacity-50' : 'opacity-100'
                }`}
              >
                <TaskCard
                  task={task}
                  compact={true}
                  onEdit={onEditTask}
                  onComplete={onCompleteTask}
                  onDelete={onDeleteTask}
                  onClassificationChange={(id, classification) =>
                    onUpdateTask(id, { classification })
                  }
                  onStatusChange={(id, status) =>
                    onUpdateTask(id, { status })
                  }
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

  // Mobile View - Tabs
  if (isMobile) {
    const activeClassification = classifications[mobileTabIndex];
    const columnTasks = tasksByClassification[activeClassification] || [];

    return (
      <div className="flex flex-col h-full bg-[var(--bg-primary)]">
        {/* Tab Navigation */}
        <div
          className="border-b overflow-x-auto scrollbar-hide"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex gap-0">
            {classifications.map((classification, index) => (
              <button
                key={classification}
                onClick={() => setMobileTabIndex(index)}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  index === mobileTabIndex
                    ? 'border-[var(--accent)] text-[var(--accent)]'
                    : 'border-transparent text-[var(--text-secondary)]'
                }`}
              >
                {classification}
                <span className="ml-2 text-xs bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full">
                  {(tasksByClassification[classification] || []).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Column Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {columnTasks.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-center">
              <p className="text-sm text-[var(--text-secondary)]">
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
                onClassificationChange={(id, classification) =>
                  onUpdateTask(id, { classification })
                }
                onStatusChange={(id, status) =>
                  onUpdateTask(id, { status })
                }
                settings={settings}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  // Tablet/Desktop View - Horizontal Scroll
  return (
    <div
      className="overflow-x-auto overflow-y-hidden p-4 bg-[var(--bg-primary)]"
      style={{ height: 'calc(100vh - 200px)' }}
    >
      <div className="flex gap-4 pb-4">
        {classifications.map((classification, index) =>
          renderColumn(classification, index)
        )}
      </div>
    </div>
  );
}
