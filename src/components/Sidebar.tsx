import {} from 'react';
import {
  LayoutGrid,
  List,
  Grid3X3,
  Settings,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  currentView: 'kanban' | 'lista' | 'cards';
  onViewChange: (view: 'kanban' | 'lista' | 'cards') => void;
  onNewTask: () => void;
  onOpenSettings: () => void;
  onOpenTrash: () => void;
  trashCount: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const NAV_ITEMS = [
  { id: 'kanban' as const, label: 'Kanban', icon: LayoutGrid },
  { id: 'lista' as const, label: 'Lista', icon: List },
  { id: 'cards' as const, label: 'Cards', icon: Grid3X3 },
];

export default function Sidebar({
  currentView,
  onViewChange,
  onNewTask,
  onOpenSettings,
  onOpenTrash,
  trashCount,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-[240px]'
      }`}
      style={{
        backgroundColor: 'var(--bg-sidebar)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">ST</span>
        </div>
        {!collapsed && (
          <span className="text-white font-bold text-lg tracking-tight animate-slideFromLeft">
            Super<span className="text-orange-400">Task</span>
          </span>
        )}
      </div>

      {/* New Task Button */}
      <div className="px-3 mb-2">
        <button
          onClick={onNewTask}
          className={`w-full flex items-center gap-3 rounded-lg font-semibold text-white transition-all duration-200 hover:opacity-90 ${
            collapsed ? 'justify-center p-3' : 'px-4 py-3'
          }`}
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <Plus size={20} />
          {!collapsed && <span className="text-sm">Nova Tarefa</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="mb-3">
          {!collapsed && (
            <span className="px-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-sidebar)] opacity-60">
              Views
            </span>
          )}
        </div>

        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = currentView === id;
          return (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={`w-full flex items-center gap-3 rounded-lg transition-all duration-200 ${
                collapsed ? 'justify-center p-3' : 'px-4 py-2.5'
              } ${
                isActive
                  ? 'text-white'
                  : 'text-[var(--text-sidebar)] hover:text-white hover:bg-[var(--bg-sidebar-hover)]'
              }`}
              style={{
                backgroundColor: isActive ? 'var(--bg-sidebar-active)' : undefined,
              }}
              title={collapsed ? label : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span className="text-sm font-medium">{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 pb-4 space-y-1">
        {/* Trash */}
        <button
          onClick={onOpenTrash}
          className={`w-full flex items-center gap-3 rounded-lg transition-all duration-200 text-[var(--text-sidebar)] hover:text-white hover:bg-[var(--bg-sidebar-hover)] relative ${
            collapsed ? 'justify-center p-3' : 'px-4 py-2.5'
          }`}
          title={collapsed ? 'Lixeira' : undefined}
        >
          <Trash2 size={20} />
          {!collapsed && <span className="text-sm font-medium">Lixeira</span>}
          {trashCount > 0 && (
            <span
              className={`flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full text-xs font-bold text-white bg-orange-500 ${
                collapsed ? 'absolute -top-1 -right-1' : 'ml-auto'
              }`}
            >
              {trashCount > 99 ? '99+' : trashCount}
            </span>
          )}
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className={`w-full flex items-center gap-3 rounded-lg transition-all duration-200 text-[var(--text-sidebar)] hover:text-white hover:bg-[var(--bg-sidebar-hover)] ${
            collapsed ? 'justify-center p-3' : 'px-4 py-2.5'
          }`}
          title={collapsed ? 'Configurações' : undefined}
        >
          <Settings size={20} />
          {!collapsed && <span className="text-sm font-medium">Configurações</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className={`w-full flex items-center gap-3 rounded-lg transition-all duration-200 text-[var(--text-sidebar)] hover:text-white hover:bg-[var(--bg-sidebar-hover)] ${
            collapsed ? 'justify-center p-3' : 'px-4 py-2.5'
          }`}
          title={collapsed ? 'Expandir' : 'Recolher'}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!collapsed && <span className="text-sm font-medium">Recolher</span>}
        </button>
      </div>
    </aside>
  );
}
