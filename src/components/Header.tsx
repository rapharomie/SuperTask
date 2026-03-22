import {} from 'react';
import {
  Sun,
  Moon,
  Search,
  X,
  Menu,
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
  searchValue: string;
  onSearchChange: (value: string) => void;
  onToggleMobileSidebar: () => void;
  taskCount: number;
  filteredCount: number;
}

const VIEW_LABELS: Record<string, string> = {
  kanban: 'Kanban',
  lista: 'Lista',
  cards: 'Cards',
};

export default function Header({
  currentView,
  darkMode,
  onToggleDarkMode,
  searchValue,
  onSearchChange,
  onToggleMobileSidebar,
  taskCount,
  filteredCount,
}: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-30 border-b h-16 flex items-center gap-4 px-6"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Mobile Menu Button */}
      <button
        onClick={onToggleMobileSidebar}
        className="p-2 rounded-lg transition-colors md:hidden"
        style={{
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--bg-hover)',
        }}
      >
        <Menu size={20} />
      </button>

      {/* Page Title */}
      <div className="flex items-center gap-3">
        <h1
          className="text-lg font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          {VIEW_LABELS[currentView] || 'Tarefas'}
        </h1>
        <span
          className="text-xs font-medium px-2 py-1 rounded-full"
          style={{
            backgroundColor: 'var(--accent-subtle)',
            color: 'var(--accent)',
          }}
        >
          {filteredCount === taskCount
            ? `${taskCount} tarefas`
            : `${filteredCount} de ${taskCount}`}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search Bar */}
      <div className="hidden md:flex items-center relative max-w-sm w-full">
        <Search
          size={16}
          className="absolute left-3 pointer-events-none"
          style={{ color: 'var(--text-muted)' }}
        />
        <input
          type="text"
          placeholder="Buscar tarefas..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          data-search-input
          className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 p-0.5 rounded hover:bg-[var(--bg-hover)] transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Theme Toggle */}
      <button
        onClick={onToggleDarkMode}
        className="p-2.5 rounded-lg transition-all duration-200 hover:scale-105"
        style={{
          color: darkMode ? '#fbbf24' : 'var(--text-secondary)',
          backgroundColor: 'var(--bg-hover)',
        }}
        aria-label={darkMode ? 'Modo claro' : 'Modo escuro'}
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* User Avatar Placeholder */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm text-white flex-shrink-0"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        R
      </div>
    </header>
  );
}
