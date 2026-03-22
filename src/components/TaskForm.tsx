import React, { useState, useMemo } from 'react';
import {
  X,
  Trash2,
  Save,
  ArrowDown,
  Code2,
  FileText,
  Users,
  DollarSign,
  ListOrdered,
  Plus,
  Minus,
  Scissors,
  AlignLeft,
} from 'lucide-react';
import type { Task, DimensionKey, LeverageType, UserSettings } from '../types';
import {
  DIMENSION_MAP,
  LEVERAGE_OPTIONS,
  STATUS_OPTIONS,
} from '../utils/constants';
import { calculatePriorityScore, getScoreColor } from '../utils/scoring';

interface TaskFormProps {
  task: Partial<Task> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'priorityScore' | 'createdAt' | 'updatedAt'>) => void;
  onDelete?: (id: string) => void;
  onBreakIntoSubtasks?: (parentTask: Task, steps: string[]) => void;
  settings: UserSettings;
}

const getLeverageIcon = (leverage: LeverageType) => {
  switch (leverage) {
    case 'código': return <Code2 className="w-4 h-4" />;
    case 'conteúdo': return <FileText className="w-4 h-4" />;
    case 'pessoas': return <Users className="w-4 h-4" />;
    case 'dinheiro': return <DollarSign className="w-4 h-4" />;
  }
};

const getDimensionValueLabel = (value: number): string => {
  return value >= 7 ? 'Alta' : value >= 4 ? 'Média' : 'Baixa';
};

export default function TaskForm({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onBreakIntoSubtasks,
  settings,
}: TaskFormProps) {
  const isEditing = !!task?.id;

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [notes, setNotes] = useState(task?.notes ?? '');
  const [tags, setTags] = useState<string[]>(task?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [classification, setClassification] = useState(task?.classification ?? '');
  const [status, setStatus] = useState<string>(task?.status ?? 'pendente');
  const [leverages, setLeverages] = useState<LeverageType[]>(task?.leverages ?? []);
  const [dimensions, setDimensions] = useState<Record<DimensionKey, number>>(() => {
    const init: Record<DimensionKey, number> = {
      impactoFinanceiro: 5, alcance: 5, urgencia: 5, custoAtraso: 5,
      tempoExecucao: 5, complexidade: 5, confianca: 5, autonomia: 5,
      alavancagem: 5, energia: 5,
    };
    if (task?.dimensions) Object.assign(init, task.dimensions);
    return init;
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Subtasks mode
  const [subtasksMode, setSubtasksMode] = useState(false);
  const [subtaskSteps, setSubtaskSteps] = useState<string[]>(['']);

  // Check if current task has subtask steps in description (format: "1. xxx\n2. yyy")
  const existingSteps = useMemo(() => {
    if (!task?.description) return [];
    const lines = task.description.split('\n').filter(l => l.trim());
    const stepPattern = /^\d+\.\s+/;
    if (lines.length >= 2 && lines.every(l => stepPattern.test(l))) {
      return lines.map(l => l.replace(stepPattern, '').trim());
    }
    return [];
  }, [task?.description]);

  const priorityScore = useMemo(
    () => calculatePriorityScore(dimensions, settings.activeDimensions),
    [dimensions, settings.activeDimensions]
  );
  const scoreColor = getScoreColor(priorityScore);

  const handleAddTag = (newTag: string) => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  const handleToggleSubtasksMode = () => {
    if (!subtasksMode) {
      // Entering subtask mode
      if (description.trim()) {
        // Try to parse existing numbered steps
        const lines = description.split('\n').filter(l => l.trim());
        const stepPattern = /^\d+\.\s+/;
        if (lines.every(l => stepPattern.test(l))) {
          setSubtaskSteps(lines.map(l => l.replace(stepPattern, '').trim()));
        } else {
          setSubtaskSteps([description.trim()]);
        }
      } else {
        setSubtaskSteps(['']);
      }
      setSubtasksMode(true);
    } else {
      // Exiting subtask mode — convert steps back to description
      const nonEmpty = subtaskSteps.filter(s => s.trim());
      if (nonEmpty.length > 0) {
        setDescription(nonEmpty.map((s, i) => `${i + 1}. ${s}`).join('\n'));
      }
      setSubtasksMode(false);
    }
  };

  const handleAddStep = () => {
    setSubtaskSteps([...subtaskSteps, '']);
  };

  const handleRemoveStep = (index: number) => {
    if (subtaskSteps.length <= 1) return;
    setSubtaskSteps(subtaskSteps.filter((_, i) => i !== index));
  };

  const handleStepChange = (index: number, value: string) => {
    const updated = [...subtaskSteps];
    updated[index] = value;
    setSubtaskSteps(updated);
  };

  const handleBreakIntoSubtasks = () => {
    if (!onBreakIntoSubtasks || !task) return;
    const steps = existingSteps.length > 0 ? existingSteps : subtaskSteps.filter(s => s.trim());
    if (steps.length === 0) return;
    onBreakIntoSubtasks(task as Task, steps);
  };

  const handleSave = () => {
    if (!title.trim()) { alert('Título é obrigatório'); return; }

    // If in subtasks mode, build description from steps
    let finalDescription = description.trim();
    if (subtasksMode) {
      const nonEmpty = subtaskSteps.filter(s => s.trim());
      finalDescription = nonEmpty.map((s, i) => `${i + 1}. ${s}`).join('\n');
    }

    onSave({
      title: title.trim(), description: finalDescription, notes: notes.trim(),
      tags, classification, status: status as Task['status'], leverages, dimensions,
      completedAt: task?.completedAt ?? null, deletedAt: task?.deletedAt ?? null,
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 transition-opacity z-40 animate-fadeIn"
        onClick={handleBackdropClick}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-2xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-slideIn"
          style={{ backgroundColor: 'var(--bg-card)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
            >
              <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-6 space-y-5">
            {/* Score Card */}
            <div
              className="p-4 rounded-xl border-2 flex items-center justify-between"
              style={{
                backgroundColor: `${scoreColor}10`,
                borderColor: `${scoreColor}40`,
              }}
            >
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  Score de Prioridade
                </p>
                <p className="text-3xl font-bold" style={{ color: scoreColor }}>
                  {priorityScore}
                </p>
              </div>
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center border-4"
                style={{ backgroundColor: `${scoreColor}15`, borderColor: `${scoreColor}40` }}
              >
                <span className="text-lg font-bold" style={{ color: scoreColor }}>
                  {Math.round((priorityScore / 100) * 100)}%
                </span>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Título <span style={{ color: 'var(--accent)' }}>*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nome da tarefa"
                className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            {/* Description — Normal or Subtasks Mode */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Descrição
                </label>
                <button
                  onClick={handleToggleSubtasksMode}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border"
                  style={{
                    backgroundColor: subtasksMode ? 'var(--accent-subtle)' : 'var(--bg-hover)',
                    borderColor: subtasksMode ? 'var(--accent)' : 'var(--border-color)',
                    color: subtasksMode ? 'var(--accent)' : 'var(--text-secondary)',
                  }}
                >
                  {subtasksMode ? (
                    <>
                      <AlignLeft className="w-3.5 h-3.5" />
                      Texto Livre
                    </>
                  ) : (
                    <>
                      <ListOrdered className="w-3.5 h-3.5" />
                      Descrever em Etapas
                    </>
                  )}
                </button>
              </div>

              {subtasksMode ? (
                <div className="space-y-2.5">
                  {subtaskSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2 animate-fadeIn">
                      {/* Number Badge */}
                      <div
                        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{
                          backgroundColor: 'var(--accent)',
                          color: 'white',
                        }}
                      >
                        {index + 1}
                      </div>
                      {/* Step Input */}
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => handleStepChange(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddStep();
                            // Focus next input after render
                            setTimeout(() => {
                              const inputs = document.querySelectorAll<HTMLInputElement>('[data-step-input]');
                              inputs[inputs.length - 1]?.focus();
                            }, 50);
                          }
                        }}
                        data-step-input
                        placeholder={`Etapa ${index + 1}...`}
                        className="flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                        style={{
                          backgroundColor: 'var(--bg-primary)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-primary)',
                        }}
                        autoFocus={index === subtaskSteps.length - 1}
                      />
                      {/* Remove */}
                      {subtaskSteps.length > 1 && (
                        <button
                          onClick={() => handleRemoveStep(index)}
                          className="flex-shrink-0 p-1.5 rounded-lg transition-colors hover:bg-[var(--danger-light)]"
                          style={{ color: 'var(--danger)' }}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Add Step */}
                  <button
                    onClick={handleAddStep}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed text-xs font-medium transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    style={{
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar etapa
                  </button>
                </div>
              ) : (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva a tarefa"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all resize-none"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                />
              )}
            </div>

            {/* Break into Subtasks — only shows when editing a task that has numbered steps */}
            {isEditing && existingSteps.length >= 2 && onBreakIntoSubtasks && (
              <div
                className="p-4 rounded-xl border-2 border-dashed"
                style={{
                  borderColor: 'var(--accent)',
                  backgroundColor: 'var(--accent-subtle)',
                }}
              >
                <div className="flex items-start gap-3">
                  <Scissors className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                      Quebrar em Subtarefas
                    </h4>
                    <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                      Esta tarefa possui {existingSteps.length} etapas. Você pode transformá-las em tarefas independentes.
                    </p>

                    {/* Preview */}
                    <div className="space-y-1.5 mb-3">
                      {existingSteps.map((step, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                          style={{ backgroundColor: 'var(--bg-card)' }}
                        >
                          <span
                            className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ backgroundColor: 'var(--accent)' }}
                          >
                            {i + 1}
                          </span>
                          <span style={{ color: 'var(--text-primary)' }}>
                            {title}: Etapa {i + 1} — {step}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleBreakIntoSubtasks}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 flex items-center gap-2"
                      style={{ backgroundColor: 'var(--accent)' }}
                    >
                      <Scissors className="w-4 h-4" />
                      Criar {existingSteps.length} Subtarefas
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Notas
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anotações, checklist, links..."
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all resize-none"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Tags
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                      style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}
                    >
                      {tag}
                      <button onClick={() => setTags(tags.filter(t => t !== tag))}>
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(tagInput); } }}
                    placeholder="Nova tag..."
                    className="flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    onClick={() => handleAddTag(tagInput)}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    Adicionar
                  </button>
                </div>
                {settings.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {settings.tags.filter(t => !tags.includes(t)).map((t) => (
                      <button
                        key={t}
                        onClick={() => handleAddTag(t)}
                        className="px-2 py-1 text-xs rounded-md border transition-colors hover:border-[var(--accent)]"
                        style={{
                          backgroundColor: 'var(--bg-primary)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        + {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Classification & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  Classificação
                </label>
                <select
                  value={classification}
                  onChange={(e) => setClassification(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="">Selecione</option>
                  {settings.classifications.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Leverages */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Alavancas
              </label>
              <div className="grid grid-cols-2 gap-2">
                {LEVERAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setLeverages(prev =>
                      prev.includes(opt.value) ? prev.filter(l => l !== opt.value) : [...prev, opt.value]
                    )}
                    className={`p-3 rounded-lg border-2 flex items-center gap-2 transition-all text-sm`}
                    style={{
                      backgroundColor: leverages.includes(opt.value) ? 'var(--accent-subtle)' : 'var(--bg-primary)',
                      borderColor: leverages.includes(opt.value) ? 'var(--accent)' : 'var(--border-color)',
                      color: leverages.includes(opt.value) ? 'var(--accent)' : 'var(--text-secondary)',
                    }}
                  >
                    {getLeverageIcon(opt.value)}
                    <span className="font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensions */}
            {settings.activeDimensions.length > 0 && (
              <div
                className="space-y-4 pt-4 border-t"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Dimensões
                </h3>
                {settings.activeDimensions.map((dk) => {
                  const dim = DIMENSION_MAP[dk];
                  if (!dim) return null;
                  const val = dimensions[dk] ?? 5;
                  const desc = dim.descriptions[val] || '';

                  return (
                    <div key={dk} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {dim.label}
                          </span>
                          {dim.inverted && (
                            <span
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px]"
                              style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)' }}
                            >
                              <ArrowDown className="w-2.5 h-2.5" /> Inv.
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-sm font-bold"
                            style={{
                              color: val >= 7 ? 'var(--success)' : val >= 4 ? 'var(--warning)' : 'var(--danger)',
                            }}
                          >
                            {val}
                          </span>
                          <span className="text-xs w-10" style={{ color: 'var(--text-muted)' }}>
                            {getDimensionValueLabel(val)}
                          </span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={val}
                        onChange={(e) => setDimensions(prev => ({ ...prev, [dk]: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                      {desc && (
                        <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
                          {desc}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="border-t px-6 py-4 flex gap-3 justify-end"
            style={{
              borderColor: 'var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
            }}
          >
            {isEditing && onDelete && (
              <div className="flex-1">
                {showDeleteConfirm ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { if (task?.id) { onDelete(task.id); setShowDeleteConfirm(false); } }}
                      className="px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                      style={{ backgroundColor: 'var(--danger)' }}
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" /> Confirmar
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-2 rounded-lg text-sm font-medium border transition-colors"
                      style={{
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <Trash2 className="w-4 h-4" /> Excluir
                  </button>
                )}
              </div>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
              style={{
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-secondary)',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-1.5"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <Save className="w-4 h-4" /> Salvar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
