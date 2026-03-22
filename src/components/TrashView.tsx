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

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
      <div
        className="rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col animate-slideIn overflow-hidden"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'var(--accent-subtle)' }}
            >
              <Trash2 size={20} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Lixeira
              </h2>
              {sortedTasks.length > 0 && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {sortedTasks.length} {sortedTasks.length === 1 ? 'item' : 'itens'} · 30 dias para exclusão
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
          >
            <X size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-16">
              <Inbox size={40} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-3" />
              <p style={{ color: 'var(--text-muted)' }}>A lixeira está vazia</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {sortedTasks.map((task) => {
                const daysLeft = daysUntilPurge(task.deletedAt!);
                const isUrgent = daysLeft < 3;

                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl border transition-colors"
                    style={{
                      backgroundColor: isUrgent ? 'var(--danger-light)' : 'var(--bg-primary)',
                      borderColor: isUrgent ? 'var(--danger)' : 'var(--border-color)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <h3 className="font-medium text-sm truncate flex-1" style={{ color: 'var(--text-primary)' }}>
                            {task.title}
                          </h3>
                          {task.priorityScore !== undefined && (
                            <span
                              className="px-2 py-0.5 rounded-md text-[11px] font-bold text-white"
                              style={{ backgroundColor: getScoreColor(task.priorityScore) }}
                            >
                              {Math.round(task.priorityScore)}
                            </span>
                          )}
                        </div>

                        {task.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {task.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 rounded-md text-[10px] font-medium"
                                style={{
                                  backgroundColor: 'var(--bg-hover)',
                                  color: 'var(--text-secondary)',
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <span>Excluída em {formatDateTime(task.deletedAt!)}</span>
                          <div className="flex items-center gap-1">
                            {isUrgent && <AlertTriangle size={12} style={{ color: 'var(--danger)' }} />}
                            <span style={{ color: isUrgent ? 'var(--danger)' : undefined, fontWeight: isUrgent ? 600 : undefined }}>
                              {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => onRestore(task.id)}
                          className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
                          style={{ color: 'var(--accent)' }}
                          title="Restaurar"
                        >
                          <RotateCcw size={16} />
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(task.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            confirmingDeleteId === task.id ? 'text-white' : 'hover:bg-[var(--danger-light)]'
                          }`}
                          style={{
                            backgroundColor: confirmingDeleteId === task.id ? 'var(--danger)' : undefined,
                            color: confirmingDeleteId === task.id ? 'white' : 'var(--danger)',
                          }}
                          title={confirmingDeleteId === task.id ? 'Confirmar' : 'Excluir'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {sortedTasks.length > 0 && (
          <div
            className="px-6 py-4 border-t flex justify-between"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <button
              onClick={handleEmptyTrash}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: emptyConfirmation ? 'var(--danger)' : 'var(--bg-hover)',
                color: emptyConfirmation ? 'white' : 'var(--text-primary)',
              }}
            >
              {emptyConfirmation ? 'Tem certeza?' : 'Esvaziar lixeira'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: 'var(--bg-hover)',
                color: 'var(--text-primary)',
              }}
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
