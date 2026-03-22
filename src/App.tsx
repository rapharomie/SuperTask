import { useState, useEffect, useCallback } from 'react';
import type { ViewType, Task } from './types';
import { useSettings } from './hooks/useSettings';
import { useTasks } from './hooks/useTasks';
import { useFilters } from './hooks/useFilters';
import { getSavedTheme, saveTheme } from './utils/sync';

import Sidebar from './components/Sidebar';
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

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
      if (e.key === '1') { e.preventDefault(); setCurrentView('kanban'); }
      if (e.key === '2') { e.preventDefault(); setCurrentView('lista'); }
      if (e.key === '3') { e.preventDefault(); setCurrentView('cards'); }
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

  const sidebarWidth = sidebarCollapsed ? 72 : 240;

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
              style={{ backgroundColor: 'var(--accent-subtle)' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Nenhuma tarefa ainda
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              Comece adicionando sua primeira tarefa para organizar e priorizar seu backlog.
            </p>
            <button
              onClick={handleNewTask}
              className="px-6 py-3 rounded-xl font-medium text-white transition-all hover:opacity-90"
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
            <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              Nenhuma tarefa encontrada com os filtros atuais.
            </p>
            <button
              onClick={resetFilters}
              className="text-sm font-medium underline"
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
      {/* Sidebar - Desktop */}
      <div className="hidden md:block">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          onNewTask={handleNewTask}
          onOpenSettings={() => setShowSettings(true)}
          onOpenTrash={() => setShowTrash(true)}
          trashCount={trashTasks.length}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden animate-fadeIn"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="md:hidden z-40">
            <Sidebar
              currentView={currentView}
              onViewChange={(v) => { setCurrentView(v); setMobileSidebarOpen(false); }}
              onNewTask={() => { handleNewTask(); setMobileSidebarOpen(false); }}
              onOpenSettings={() => { setShowSettings(true); setMobileSidebarOpen(false); }}
              onOpenTrash={() => { setShowTrash(true); setMobileSidebarOpen(false); }}
              trashCount={trashTasks.length}
              collapsed={false}
              onToggleCollapse={() => setMobileSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* Main Content */}
      <div
        className="transition-all duration-300"
        style={{ marginLeft: typeof window !== 'undefined' && window.innerWidth >= 768 ? `${sidebarWidth}px` : '0' }}
      >
        <Header
          currentView={currentView}
          onViewChange={setCurrentView}
          onNewTask={handleNewTask}
          onOpenSettings={() => setShowSettings(true)}
          onOpenTrash={() => setShowTrash(true)}
          trashCount={trashTasks.length}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          searchValue={filters.search || ''}
          onSearchChange={(v) => updateFilter('search', v)}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          taskCount={tasks.length}
          filteredCount={filteredTasks.length}
        />

        <main className="px-6 py-6">
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
      </div>

      {/* Modals */}
      <TaskForm
        task={editingTask}
        isOpen={showTaskForm}
        onClose={() => { setShowTaskForm(false); setEditingTask(null); }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        settings={settings}
      />

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
