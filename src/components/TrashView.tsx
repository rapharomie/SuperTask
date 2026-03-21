import { useState } from 'react';
import { Trash2, RotateCcw, X, AlertTriangle, Inbox } from 'lucide-react';
import type { Task, UserSettings } from '../types';
import { daysUntilPurge, formatDateTime } from '../utils/helpers';
import { getScoreColor } from '../utils/scoring';

interface TrashViewProps {
  tasks: Task[];
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onEmptyTrash: () => void;
  onClose: () => void;
  settings: UserSettings;
}

export default function TrashView({
  tasks,
  onRestore,
  onPermanentDelete,
  onEmptyTrash,
  onClose,
}: TrashViewProps) {
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [emptyConfirmation, setEmptyConfirmation] = useState(false);

  // Sort tasks by deletion date (most recent first)
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.deletedAt || !b.deletedAt) return 0;
    return new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime();
  });

  const handlePermanentDelete = (id: string) => {
    if (confirmingDeleteId === id) {
      onPermanentDelete(id);
      setConfirmingDeleteId(null);
    } else {
      setConfirmingDeleteId(id);
    }
  };

  const handleEmptyTrash = () => {
    if (emptyConfirmation) {
      onEmptyTrash();
      setEmptyConfirmation(false);
    } else {
      setEmptyConfirmation(true);
    }
  };

  if (sortedTasks.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-[var(--bg-card)] rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--bg-primary)] rounded-lg">
                <Trash2 size={24} className="text-[var(--accent)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Lixeira</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--bg-primary)] rounded-lg transition-colors"
              aria-label="Fechar"
            >
              <X size={20} className="text-[var(--text-secondary)]" />
            </button>
          </div>

          {/* Empty State */}
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <Inbox size={48} className="text-[var(--text-muted)]" />
            </div>
            <p className="text-[var(--text-muted)] text-lg">A lixeira está vazia</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-card)] rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--bg-primary)] rounded-lg">
              <Trash2 size={24} className="text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Lixeira</h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Tarefas excluídas ficam aqui por 30 dias antes da exclusão permanente.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-primary)] rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X size={20} className="text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {sortedTasks.map((task) => {
              const daysLeft = daysUntilPurge(task.deletedAt!);
              const isUrgent = daysLeft < 3;

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    isUrgent
                      ? 'bg-[#ef4444]/10 border-[#ef4444] ring-1 ring-[#ef4444]/20'
                      : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-[var(--accent)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Title and Score */}
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-[var(--text-primary)] font-medium truncate flex-1">
                          {task.title}
                        </h3>
                        {task.priorityScore !== undefined && (
                          <span
                            className="px-2 py-1 rounded text-xs font-semibold text-white whitespace-nowrap"
                            style={{ backgroundColor: getScoreColor(task.priorityScore) }}
                          >
                            {Math.round(task.priorityScore)}
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {task.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-[var(--border-color)] text-[var(--text-secondary)] text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Deletion Info */}
                      <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                        <span>Excluída em {formatDateTime(task.deletedAt!)}</span>
                        <div className="flex items-center gap-1">
                          {isUrgent && (
                            <AlertTriangle size={14} className="text-[#ef4444]" />
                          )}
                          <span className={isUrgent ? 'text-[#ef4444] font-semibold' : ''}>
                            {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'} restantes
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => onRestore(task.id)}
                        className="p-2 hover:bg-[var(--bg-card)] rounded-lg transition-colors text-[var(--text-secondary)] hover:text-[var(--accent)]"
                        title="Restaurar"
                        aria-label="Restaurar"
                      >
                        <RotateCcw size={18} />
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(task.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          confirmingDeleteId === task.id
                            ? 'bg-[#ef4444] text-white'
                            : 'hover:bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[#ef4444]'
                        }`}
                        title={
                          confirmingDeleteId === task.id
                            ? 'Confirmar exclusão'
                            : 'Excluir permanentemente'
                        }
                        aria-label={
                          confirmingDeleteId === task.id
                            ? 'Confirmar exclusão'
                            : 'Excluir permanentemente'
                        }
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--border-color)] flex justify-between">
          <button
            onClick={handleEmptyTrash}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              emptyConfirmation
                ? 'bg-[#ef4444] text-white hover:bg-[#dc2626]'
                : 'bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-[var(--border-color)]'
            }`}
          >
            {emptyConfirmation ? 'Tem certeza?' : 'Esvaziar lixeira'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
