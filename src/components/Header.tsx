import React from 'react';
import {
  LayoutGrid,
  List,
  Grid3X3,
  Trash2,
  Settings,
  Sun,
  Moon,
  Plus,
  Menu,
  X,
} from 'lucide-react';

interface HeaderProps {
  currentView: 'kanban' | 'lista' | 'cards';
  onViewChange: (view: 'kanban' | 'lista' | 'cards') => void;
  onNewTask: () => void;
  onOpenSettings: () => void;
  onOpenTrash: () => void;
  trashCount: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Header({
  currentView,
  onViewChange,
  onNewTask,
  onOpenSettings,
  onOpenTrash,
  trashCount,
  darkMode,
  onToggleDarkMode,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const viewTabs = [
    { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
    { id: 'lista', label: 'Lista', icon: List },
    { id: 'cards', label: 'Cards', icon: Grid3X3 },
  ] as const;

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div className="px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <h1
              className="text-xl sm:text-2xl font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Super<span className="text-orange-500">Task</span>
            </h1>
          </div>

          {/* Center View Tabs - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2">
            {viewTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onViewChange(id as 'kanban' | 'lista' | 'cards')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                  currentView === id
                    ? 'text-white'
                    : 'text-opacity-70'
                }`}
                style={{
                  backgroundColor:
                    currentView === id ? '#f97316' : 'var(--bg-secondary)',
                  color:
                    currentView === id
                      ? 'white'
                      : 'var(--text-secondary)',
                }}
              >
                <Icon size={18} />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Trash - Hidden on mobile */}
            <button
              onClick={onOpenTrash}
              className="relative p-2 rounded-lg transition-colors duration-200 hidden sm:inline-flex"
              style={{
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-secondary)',
              }}
              aria-label="Abrir lixeira"
            >
              <Trash2 size={20} />
              {trashCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: '#f97316' }}
                >
                  {trashCount > 99 ? '99+' : trashCount}
                </span>
              )}
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg transition-colors duration-200 hidden sm:inline-flex"
              style={{
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-secondary)',
              }}
              aria-label="Abrir configurações"
            >
              <Settings size={20} />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg transition-colors duration-200"
              style={{
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-secondary)',
              }}
              aria-label={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Nova Tarefa Button - Full on desktop, compact on mobile */}
            <button
              onClick={onNewTask}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-white hover:opacity-90"
              style={{ backgroundColor: '#f97316' }}
            >
              <Plus size={20} />
              <span className="hidden sm:inline text-sm">Nova Tarefa</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg transition-colors duration-200 md:hidden"
              style={{
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-secondary)',
              }}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile View Tabs - Shown on mobile when menu is open */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 flex flex-col gap-2 pb-2">
            {viewTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  onViewChange(id as 'kanban' | 'lista' | 'cards');
                  setMobileMenuOpen(false);
                }}
                className={`w-full inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200`}
                style={{
                  backgroundColor:
                    currentView === id ? '#f97316' : 'var(--bg-secondary)',
                  color:
                    currentView === id
                      ? 'white'
                      : 'var(--text-secondary)',
                }}
              >
                <Icon size={18} />
                <span className="text-sm">{label}</span>
              </button>
            ))}
            {/* Mobile Settings and Trash */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  onOpenTrash();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 relative"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                }}
              >
                <Trash2 size={18} />
                {trashCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: '#f97316' }}
                  >
                    {trashCount > 9 ? '9+' : trashCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  onOpenSettings();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                }}
              >
                <Settings size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
