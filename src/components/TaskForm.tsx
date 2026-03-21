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
  settings: UserSettings;
}

const getLeverageIcon = (leverage: LeverageType) => {
  switch (leverage) {
    case 'código':
      return <Code2 className="w-4 h-4" />;
    case 'conteúdo':
      return <FileText className="w-4 h-4" />;
    case 'pessoas':
      return <Users className="w-4 h-4" />;
    case 'dinheiro':
      return <DollarSign className="w-4 h-4" />;
  }
};

const getDimensionValueLabel = (value: number, inverted: boolean): string => {
  if (inverted) {
    return value >= 7 ? 'Alta' : value >= 4 ? 'Média' : 'Baixa';
  }
  return value >= 7 ? 'Alta' : value >= 4 ? 'Média' : 'Baixa';
};

export default function TaskForm({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
  settings,
}: TaskFormProps) {
  const isEditing = !!task?.id;

  // Form state
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [notes, setNotes] = useState(task?.notes ?? '');
  const [tags, setTags] = useState<string[]>(task?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [classification, setClassification] = useState(task?.classification ?? '');
  const [status, setStatus] = useState<string>(task?.status ?? 'pendente');

  // Leverages state
  const [leverages, setLeverages] = useState<LeverageType[]>(task?.leverages ?? []);

  // Dimensions state — initialize with 0 for active dimensions
  const [dimensions, setDimensions] = useState<Record<DimensionKey, number>>(
    () => {
      const initialDimensions: Record<DimensionKey, number> = {
        impactoFinanceiro: 5,
        alcance: 5,
        urgencia: 5,
        custoAtraso: 5,
        tempoExecucao: 5,
        complexidade: 5,
        confianca: 5,
        autonomia: 5,
        alavancagem: 5,
        energia: 5,
      };
      if (task?.dimensions) {
        Object.assign(initialDimensions, task.dimensions);
      }
      return initialDimensions;
    }
  );

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Calculate priority score in real-time
  const priorityScore = useMemo(
    () => calculatePriorityScore(dimensions, settings.activeDimensions),
    [dimensions, settings.activeDimensions]
  );

  const scoreColor = getScoreColor(priorityScore);

  // Handle tag input
  const handleAddTag = (newTag: string) => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleDimensionChange = (key: DimensionKey, value: number) => {
    setDimensions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleLeverage = (leverage: LeverageType) => {
    setLeverages((prev) => {
      if (prev.includes(leverage)) {
        return prev.filter((l) => l !== leverage);
      }
      return [...prev, leverage];
    });
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Título é obrigatório');
      return;
    }

    const formData: Omit<Task, 'id' | 'priorityScore' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      description: description.trim(),
      notes: notes.trim(),
      tags,
      classification,
      status: status as Task['status'],
      leverages,
      dimensions,
      completedAt: task?.completedAt ?? null,
      deletedAt: task?.deletedAt ?? null,
    };

    onSave(formData);
  };

  const handleDelete = () => {
    if (task?.id && onDelete) {
      onDelete(task.id);
      setShowDeleteConfirm(false);
    }
  };

  // Modal backdrop click handler
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity duration-300 z-40"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-2xl max-h-[90vh] bg-[#1a1a1a] rounded-lg shadow-2xl overflow-hidden flex flex-col animate-slideIn"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">
              {isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1 p-6 space-y-6">
            {/* Priority Score Card */}
            <div
              className="p-4 rounded-lg border-2 transition-all"
              style={{
                backgroundColor: `${scoreColor}20`,
                borderColor: scoreColor,
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Score de Prioridade</p>
                  <p
                    className="text-4xl font-bold"
                    style={{ color: scoreColor }}
                  >
                    {priorityScore}
                  </p>
                </div>
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center border-4"
                  style={{
                    backgroundColor: `${scoreColor}20`,
                    borderColor: scoreColor,
                  }}
                >
                  <span
                    className="text-2xl font-bold"
                    style={{ color: scoreColor }}
                  >
                    {Math.round((priorityScore / 100) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Título <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nome da tarefa"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva a tarefa em mais detalhe"
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Notas / Observações
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anotações adicionais, checklist, links, etc"
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tags
              </label>
              <div className="space-y-2">
                {/* Existing tags */}
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/20 border border-orange-500/40 rounded-full text-sm text-orange-300"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-orange-200 transition-colors"
                        aria-label={`Remover tag ${tag}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Tag input + suggestions */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(tagInput);
                      }
                    }}
                    placeholder="Digite nova tag ou pressione Enter"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                  <button
                    onClick={() => handleAddTag(tagInput)}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Adicionar
                  </button>
                </div>

                {/* Preset tags */}
                {settings.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {settings.tags
                      .filter((t) => !tags.includes(t))
                      .map((presetTag) => (
                        <button
                          key={presetTag}
                          onClick={() => handleAddTag(presetTag)}
                          className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-gray-300 transition-colors"
                        >
                          + {presetTag}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Classification */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Classificação
              </label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              >
                <option value="">Selecione uma classificação</option>
                {settings.classifications.map((clf) => (
                  <option key={clf} value={clf}>
                    {clf}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Leverages */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Alavancas (informativo)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {LEVERAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => toggleLeverage(opt.value)}
                    className={`p-3 rounded-lg border-2 flex items-center gap-2 transition-all ${
                      leverages.includes(opt.value)
                        ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {getLeverageIcon(opt.value)}
                    <span className="font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensions Sliders */}
            {settings.activeDimensions.length > 0 && (
              <div className="space-y-6 pt-4 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-white">Dimensões</h3>

                {settings.activeDimensions.map((dimensionKey) => {
                  const dimension = DIMENSION_MAP[dimensionKey];
                  if (!dimension) return null;

                  const value = dimensions[dimensionKey] ?? 5;
                  const description = dimension.descriptions[value] || '';
                  const label = getDimensionValueLabel(value, dimension.inverted);

                  return (
                    <div key={dimensionKey} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">
                            {dimension.label}
                          </span>
                          {dimension.inverted && (
                            <div
                              className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded text-xs text-gray-400"
                              title="Dimensão invertida: valores altos são melhores"
                            >
                              <ArrowDown className="w-3 h-3" />
                              Invertida
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className="text-lg font-semibold"
                            style={{
                              color:
                                value >= 7
                                  ? '#22c55e'
                                  : value >= 4
                                    ? '#eab308'
                                    : '#ef4444',
                            }}
                          >
                            {value}
                          </span>
                          <span className="text-sm text-gray-400 w-12">
                            {label}
                          </span>
                        </div>
                      </div>

                      {/* Slider */}
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={value}
                        onChange={(e) =>
                          handleDimensionChange(
                            dimensionKey,
                            parseInt(e.target.value, 10)
                          )
                        }
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />

                      {/* Description */}
                      <p className="text-sm text-gray-400 italic">
                        {description}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer - Actions */}
          <div className="border-t border-gray-700 p-6 flex gap-3 justify-end bg-gray-800/50">
            {isEditing && onDelete && (
              <div className="flex-1 flex items-center">
                {showDeleteConfirm ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Confirmar exclusão
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>
                )}
              </div>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
          </div>
        </div>
      </div>

      {/* Tailwind animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        /* Custom slider styling for better appearance */
        input[type='range'] {
          -webkit-appearance: none;
          appearance: none;
        }

        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: 2px solid #ea580c;
          box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
          transition: all 0.2s ease;
        }

        input[type='range']::-webkit-slider-thumb:hover {
          background: #ea580c;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.5);
        }

        input[type='range']::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: 2px solid #ea580c;
          box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
          transition: all 0.2s ease;
        }

        input[type='range']::-moz-range-thumb:hover {
          background: #ea580c;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.5);
        }

        /* Focus state for accessibility */
        input[type='range']:focus {
          outline: none;
        }

        input[type='range']:focus::-webkit-slider-thumb {
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.6);
        }

        input[type='range']:focus::-moz-range-thumb {
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.6);
        }
      `}</style>
    </>
  );
}
