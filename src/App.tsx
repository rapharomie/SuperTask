import { useState, useEffect, useCallback } from 'react';
import type { ViewType, Task } from './types';
import { useSettings } from './hooks/useSettings';
import { useTasks } from './hooks/useTasks';
import { useFilters } from './hooks/useFilters';
import { getSavedTheme, saveTheme } from './utils/sync';

import Header from './components/Header';
import FilterBar from './components/FilterBar';
import TaskForm from './components/TaskForm';
import KanbanView from './components/KanbanView';
import ListView from './components/ListView';
import CardGridView from './components/CardGridView';
import TrashView from './components/TrashView';
import SettingsPanel from './components/SettingsPanel';

function App() {
  // Theme
  const [darkMode, setDarkMode] = useState(() => {
    const saved = getSavedTheme();
    if (saved === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return saved === 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const next = !prev;
      saveTheme(next ? 'dark' : 'light');
      return next;
    });
  }, []);

  // Settings
  const {
    settings,
    updateTags,
    updateClassifications,
    updateTagColor,
    toggleDimension,
  } = useSettings();

  // Tasks
  const {
    tasks,
    trashTasks,
    allTasks,
    loading,
    createTask,
    updateTask,
    softDeleteTask,
    restoreTask,
    permanentDeleteTask,
    emptyTrash,
    completeTask,
  } = useTasks(settings);

  // Filters
  const {
    filters,
    filteredTasks,
    activeFilterCount,
    updateFilter,
    toggleArrayFilter,
    resetFilters,
  } = useFilters(tasks);

  // View state
  const [currentView, setCurrentView] = useState<ViewType>('kanban');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showTrash, setShowTrash] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setEditingTask(null);
        setShowTaskForm(true);
      }
      if (e.key === '1') {
        e.preventDefault();
        setCurrentView('kanban');
      }
      if (e.key === '2') {
        e.preventDefault();
        setCurrentView('lista');
      }
      if (e.key === '3') {
        e.preventDefault();
        setCurrentView('cards');
      }
      if (e.key === 'Escape') {
        if (showTaskForm) setShowTaskForm(false);
        if (showSettings) setShowSettings(false);
        if (showTrash) setShowTrash(false);
      }
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
        searchInput?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTaskForm, showSettings, showTrash]);

  // Handlers
  const handleNewTask = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleSaveTask = async (
    taskData: Omit<Task, 'id' | 'priorityScore' | 'createdAt' | 'updatedAt'>
  ) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
    } else {
      await createTask(taskData);
    }
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async (id: string) => {
    await softDeleteTask(id);
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    await updateTask(id, updates);
  };


  // Render current view
  const renderView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div
              className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
            />
            <p style={{ color: 'var(--text-muted)' }}>Carregando tarefas...</p>
          </div>
        </div>
      );
    }

    if (filteredTasks.length === 0 && tasks.length === 0) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto px-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'var(--accent)', opacity: 0.2 }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Nenhuma tarefa ainda
            </h3>
            <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
              Comece adicionando sua primeira tarefa para organizar e priorizar seu backlog.
            </p>
            <button
              onClick={handleNewTask}
              className="px-6 py-3 rounded-lg font-medium text-white transition-colors"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Criar primeira tarefa
            </button>
          </div>
        </div>
      );
    }

    if (filteredTasks.length === 0 && tasks.length > 0) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>
              Nenhuma tarefa encontrada com os filtros atuais.
            </p>
            <button
              onClick={resetFilters}
              className="text-sm underline"
              style={{ color: 'var(--accent)' }}
            >
              Limpar filtros
            </button>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'kanban':
        return (
          <KanbanView
            tasks={filteredTasks}
            settings={settings}
            onEditTask={handleEditTask}
            onCompleteTask={completeTask}
            onDeleteTask={softDeleteTask}
            onUpdateTask={handleUpdateTask}
          />
        );
      case 'lista':
        return (
          <ListView
            tasks={filteredTasks}
            settings={settings}
            onEditTask={handleEditTask}
            onCompleteTask={completeTask}
            onDeleteTask={softDeleteTask}
            onUpdateTask={handleUpdateTask}
          />
        );
      case 'cards':
        return (
          <CardGridView
            tasks={filteredTasks}
            settings={settings}
            onEditTask={handleEditTask}
            onCompleteTask={completeTask}
            onDeleteTask={softDeleteTask}
            onUpdateTask={handleUpdateTask}
          />
        );
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onNewTask={handleNewTask}
        onOpenSettings={() => setShowSettings(true)}
        onOpenTrash={() => setShowTrash(true)}
        trashCount={trashTasks.length}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      <main className="max-w-[1400px] mx-auto px-4 pb-8">
        <FilterBar
          filters={filters}
          onUpdateFilter={updateFilter}
          onToggleArrayFilter={toggleArrayFilter}
          onReset={resetFilters}
          activeFilterCount={activeFilterCount}
          totalCount={tasks.length}
          filteredCount={filteredTasks.length}
          settings={settings}
        />

        {renderView()}
      </main>

      {/* Task Form Modal */}
      <TaskForm
        task={editingTask}
        isOpen={showTaskForm}
        onClose={() => {
          setShowTaskForm(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        settings={settings}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateTags={updateTags}
        onUpdateClassifications={updateClassifications}
        onUpdateTagColor={updateTagColor}
        onToggleDimension={toggleDimension}
        allTasks={allTasks}
      />

      {/* Trash View */}
      {showTrash && (
        <TrashView
          tasks={trashTasks}
          onRestore={restoreTask}
          onPermanentDelete={permanentDeleteTask}
          onEmptyTrash={emptyTrash}
          onClose={() => setShowTrash(false)}
          settings={settings}
        />
      )}
    </div>
  );
}

export default App;
