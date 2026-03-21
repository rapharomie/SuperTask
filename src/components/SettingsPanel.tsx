import React, { useState } from 'react';
import {
  X,
  Settings,
  Plus,
  Trash2,
  Pencil,
  ChevronUp,
  ChevronDown,
  Download,
  Upload,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import type { UserSettings, DimensionKey, TagColor, Task } from '../types';
import { DIMENSION_MAP } from '../utils/constants';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateTags: (tags: string[]) => void;
  onUpdateClassifications: (classifications: string[]) => void;
  onUpdateTagColor: (tag: string, color: TagColor) => void;
  onToggleDimension: (key: DimensionKey) => void;
  allTasks: Task[];
}

export default function SettingsPanel({
  isOpen,
  onClose,
  settings,
  onUpdateTags,
  onUpdateClassifications,
  onUpdateTagColor,
  onToggleDimension,
  allTasks,
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<
    'dimensions' | 'tags' | 'classifications' | 'export' | 'clear'
  >('dimensions');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState('');
  const [editingTagColor, setEditingTagColor] = useState<TagColor>({
    bg: '#f97316',
    text: '#ffffff',
  });
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState<TagColor>({
    bg: '#f97316',
    text: '#ffffff',
  });
  const [editingClassification, setEditingClassification] = useState<string | null>(null);
  const [editingClassificationName, setEditingClassificationName] = useState('');
  const [newClassificationName, setNewClassificationName] = useState('');
  const [clearConfirmation, setClearConfirmation] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleAddTag = () => {
    if (newTagName.trim()) {
      const updatedTags = [...(settings.tags || []), newTagName];
      onUpdateTags(updatedTags);
      if (!settings.tagColors) {
        settings.tagColors = {};
      }
      onUpdateTagColor(newTagName, newTagColor);
      setNewTagName('');
      setNewTagColor({ bg: '#f97316', text: '#ffffff' });
    }
  };

  const handleDeleteTag = (tag: string) => {
    const updatedTags = (settings.tags || []).filter((t) => t !== tag);
    onUpdateTags(updatedTags);
    setDeleteConfirm(null);
  };

  const handleEditTag = (tag: string) => {
    setEditingTag(tag);
    setEditingTagName(tag);
    setEditingTagColor(
      settings.tagColors?.[tag] || { bg: '#f97316', text: '#ffffff' }
    );
  };

  const handleSaveTagEdit = () => {
    if (editingTag && editingTagName.trim()) {
      const updatedTags = (settings.tags || []).map((t) =>
        t === editingTag ? editingTagName : t
      );
      onUpdateTags(updatedTags);
      onUpdateTagColor(editingTagName, editingTagColor);
      setEditingTag(null);
    }
  };

  const handleAddClassification = () => {
    if (newClassificationName.trim()) {
      const updatedClassifications = [
        ...(settings.classifications || []),
        newClassificationName,
      ];
      onUpdateClassifications(updatedClassifications);
      setNewClassificationName('');
    }
  };

  const handleDeleteClassification = (classification: string) => {
    const updatedClassifications = (settings.classifications || []).filter(
      (c) => c !== classification
    );
    onUpdateClassifications(updatedClassifications);
    setDeleteConfirm(null);
  };

  const handleEditClassification = (classification: string) => {
    setEditingClassification(classification);
    setEditingClassificationName(classification);
  };

  const handleSaveClassificationEdit = () => {
    if (editingClassification && editingClassificationName.trim()) {
      const updatedClassifications = (settings.classifications || []).map((c) =>
        c === editingClassification ? editingClassificationName : c
      );
      onUpdateClassifications(updatedClassifications);
      setEditingClassification(null);
    }
  };

  const handleMoveClassificationUp = (index: number) => {
    if (index > 0) {
      const classifications = [...(settings.classifications || [])];
      [classifications[index], classifications[index - 1]] = [
        classifications[index - 1],
        classifications[index],
      ];
      onUpdateClassifications(classifications);
    }
  };

  const handleMoveClassificationDown = (index: number) => {
    const classifications = settings.classifications || [];
    if (index < classifications.length - 1) {
      const updatedClassifications = [...classifications];
      [updatedClassifications[index], updatedClassifications[index + 1]] = [
        updatedClassifications[index + 1],
        updatedClassifications[index],
      ];
      onUpdateClassifications(updatedClassifications);
    }
  };

  const handleExportData = () => {
    const dataToExport = {
      settings,
      tasks: allTasks,
      exportedAt: new Date().toISOString(),
    };
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `supertask-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (data.settings) {
          // Import logic would be handled by parent component
          console.log('Importing data:', data);
        }
      } catch (error) {
        alert('Erro ao importar arquivo. Verifique o formato JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (clearConfirmation === 0) {
      setClearConfirmation(1);
    } else if (clearConfirmation === 1) {
      // Clear all data
      onUpdateTags([]);
      onUpdateClassifications([]);
      setClearConfirmation(0);
      onClose();
    }
  };

  const getTasksUsingClassification = (classification: string) => {
    return allTasks.filter((task) => task.classification === classification).length;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-lg bg-[var(--bg-card)] shadow-2xl transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-primary)] px-6 py-4">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-[var(--accent)]" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Configurações
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-[var(--bg-card)] transition-colors"
          >
            <X className="h-6 w-6 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
          {[
            { id: 'dimensions', label: 'Dimensões' },
            { id: 'tags', label: 'Tags' },
            { id: 'classifications', label: 'Classificações' },
            { id: 'export', label: 'Dados' },
            { id: 'clear', label: 'Limpar' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(
                  tab.id as
                    | 'dimensions'
                    | 'tags'
                    | 'classifications'
                    | 'export'
                    | 'clear'
                )
              }
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto bg-[var(--bg-card)]">
          {/* Dimensões Tab */}
          {activeTab === 'dimensions' && (
            <div className="space-y-4 p-6">
              <p className="text-sm text-[var(--text-secondary)]">
                Ative ou desative as dimensões utilizadas no cálculo de pontuação.
              </p>
              <div className="space-y-3">
                {Object.entries(DIMENSION_MAP).map(([key, dimension]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 hover:border-[var(--accent)] transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-[var(--text-primary)]">
                        {dimension.label}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {dimension.inverted ? '(Invertida)' : '(Normal)'}
                      </p>
                    </div>
                    <button
                      onClick={() => onToggleDimension(key as DimensionKey)}
                      className="rounded-lg p-2 hover:bg-[var(--bg-card)] transition-colors"
                    >
                      {settings.activeDimensions?.includes(key as DimensionKey) ? (
                        <ToggleRight className="h-6 w-6 text-[var(--accent)]" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-[var(--text-muted)]" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags Tab */}
          {activeTab === 'tags' && (
            <div className="space-y-4 p-6">
              <div className="space-y-3">
                {(settings.tags || []).map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center justify-between rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] p-4"
                  >
                    {editingTag === tag ? (
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={editingTagName}
                          onChange={(e) => setEditingTagName(e.target.value)}
                          className="w-full rounded border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                          placeholder="Nome da tag"
                        />
                        <div className="flex gap-3">
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-[var(--text-secondary)]">
                              Cor de fundo:
                            </label>
                            <input
                              type="color"
                              value={editingTagColor.bg}
                              onChange={(e) =>
                                setEditingTagColor({
                                  ...editingTagColor,
                                  bg: e.target.value,
                                })
                              }
                              className="h-8 w-12 rounded cursor-pointer border border-[var(--border-color)]"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-[var(--text-secondary)]">
                              Cor do texto:
                            </label>
                            <input
                              type="color"
                              value={editingTagColor.text}
                              onChange={(e) =>
                                setEditingTagColor({
                                  ...editingTagColor,
                                  text: e.target.value,
                                })
                              }
                              className="h-8 w-12 rounded cursor-pointer border border-[var(--border-color)]"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveTagEdit}
                            className="flex-1 rounded bg-[var(--accent)] px-3 py-2 text-white hover:opacity-90 transition-opacity text-sm font-medium"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => setEditingTag(null)}
                            className="flex-1 rounded border border-[var(--border-color)] px-3 py-2 text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors text-sm font-medium"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className="h-6 w-6 rounded border border-[var(--border-color)]"
                            style={{
                              backgroundColor:
                                settings.tagColors?.[tag]?.bg || '#f97316',
                            }}
                          />
                          <span className="font-medium text-[var(--text-primary)]">
                            {tag}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditTag(tag)}
                            className="rounded p-2 hover:bg-[var(--bg-card)] transition-colors"
                          >
                            <Pencil className="h-4 w-4 text-[var(--text-secondary)]" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(`tag-${tag}`)}
                            className="rounded p-2 hover:bg-[var(--bg-card)] transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Delete Confirmation */}
              {deleteConfirm?.startsWith('tag-') && (
                <div className="rounded-lg border border-red-500 bg-red-500 bg-opacity-10 p-4">
                  <p className="mb-3 text-sm text-[var(--text-primary)]">
                    Tem certeza que deseja deletar essa tag?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleDeleteTag(deleteConfirm.replace('tag-', ''))
                      }
                      className="flex-1 rounded bg-red-500 px-3 py-2 text-white hover:opacity-90 transition-opacity text-sm font-medium"
                    >
                      Deletar
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 rounded border border-[var(--border-color)] px-3 py-2 text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors text-sm font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Add New Tag */}
              <div className="space-y-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] p-4">
                <h4 className="font-medium text-[var(--text-primary)]">
                  Adicionar tag
                </h4>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="w-full rounded border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  placeholder="Nome da nova tag"
                />
                <div className="flex gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-[var(--text-secondary)]">
                      Cor de fundo:
                    </label>
                    <input
                      type="color"
                      value={newTagColor.bg}
                      onChange={(e) =>
                        setNewTagColor({ ...newTagColor, bg: e.target.value })
                      }
                      className="h-8 w-12 rounded cursor-pointer border border-[var(--border-color)]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-[var(--text-secondary)]">
                      Cor do texto:
                    </label>
                    <input
                      type="color"
                      value={newTagColor.text}
                      onChange={(e) =>
                        setNewTagColor({ ...newTagColor, text: e.target.value })
                      }
                      className="h-8 w-12 rounded cursor-pointer border border-[var(--border-color)]"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddTag}
                  className="flex w-full items-center justify-center gap-2 rounded bg-[var(--accent)] px-4 py-2 text-white hover:opacity-90 transition-opacity font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar tag
                </button>
              </div>
            </div>
          )}

          {/* Classifications Tab */}
          {activeTab === 'classifications' && (
            <div className="space-y-4 p-6">
              <div className="space-y-3">
                {(settings.classifications || []).map((classification, index) => {
                  const tasksCount = getTasksUsingClassification(classification);
                  return (
                    <div
                      key={classification}
                      className="flex items-center justify-between rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] p-4"
                    >
                      {editingClassification === classification ? (
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            value={editingClassificationName}
                            onChange={(e) =>
                              setEditingClassificationName(e.target.value)
                            }
                            className="w-full rounded border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                            placeholder="Nome da classificação"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveClassificationEdit}
                              className="flex-1 rounded bg-[var(--accent)] px-3 py-2 text-white hover:opacity-90 transition-opacity text-sm font-medium"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={() => setEditingClassification(null)}
                              className="flex-1 rounded border border-[var(--border-color)] px-3 py-2 text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors text-sm font-medium"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <p className="font-medium text-[var(--text-primary)]">
                              {classification}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">
                              {tasksCount} tarefa{tasksCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleMoveClassificationUp(index)
                              }
                              disabled={index === 0}
                              className="rounded p-2 hover:bg-[var(--bg-card)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronUp className="h-4 w-4 text-[var(--text-secondary)]" />
                            </button>
                            <button
                              onClick={() =>
                                handleMoveClassificationDown(index)
                              }
                              disabled={
                                index ===
                                (settings.classifications?.length || 0) - 1
                              }
                              className="rounded p-2 hover:bg-[var(--bg-card)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
                            </button>
                            <button
                              onClick={() =>
                                handleEditClassification(classification)
                              }
                              className="rounded p-2 hover:bg-[var(--bg-card)] transition-colors"
                            >
                              <Pencil className="h-4 w-4 text-[var(--text-secondary)]" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm(`classification-${classification}`)
                              }
                              className="rounded p-2 hover:bg-[var(--bg-card)] transition-colors"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Delete Confirmation */}
              {deleteConfirm?.startsWith('classification-') && (
                <div className="rounded-lg border border-red-500 bg-red-500 bg-opacity-10 p-4">
                  <div className="mb-3 flex gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {getTasksUsingClassification(
                          deleteConfirm.replace('classification-', '')
                        ) > 0 &&
                          `Esta classificação é usada por ${getTasksUsingClassification(deleteConfirm.replace('classification-', ''))} tarefa(s). `}
                        Tem certeza que deseja deletá-la?
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleDeleteClassification(
                          deleteConfirm.replace('classification-', '')
                        )
                      }
                      className="flex-1 rounded bg-red-500 px-3 py-2 text-white hover:opacity-90 transition-opacity text-sm font-medium"
                    >
                      Deletar
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 rounded border border-[var(--border-color)] px-3 py-2 text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors text-sm font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Add New Classification */}
              <div className="space-y-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] p-4">
                <h4 className="font-medium text-[var(--text-primary)]">
                  Adicionar classificação
                </h4>
                <input
                  type="text"
                  value={newClassificationName}
                  onChange={(e) => setNewClassificationName(e.target.value)}
                  className="w-full rounded border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  placeholder="Nome da nova classificação"
                />
                <button
                  onClick={handleAddClassification}
                  className="flex w-full items-center justify-center gap-2 rounded bg-[var(--accent)] px-4 py-2 text-white hover:opacity-90 transition-opacity font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar classificação
                </button>
              </div>
            </div>
          )}

          {/* Export/Import Tab */}
          {activeTab === 'export' && (
            <div className="space-y-4 p-6">
              <p className="text-sm text-[var(--text-secondary)]">
                Exporte ou importe seus dados e configurações em formato JSON.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleExportData}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[var(--accent)] bg-transparent px-4 py-3 text-[var(--accent)] hover:bg-[var(--bg-primary)] transition-colors font-medium"
                >
                  <Download className="h-5 w-5" />
                  Exportar dados
                </button>

                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                    id="import-file"
                  />
                  <label
                    htmlFor="import-file"
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[var(--accent)] bg-transparent px-4 py-3 text-[var(--accent)] hover:bg-[var(--bg-primary)] transition-colors font-medium cursor-pointer"
                  >
                    <Upload className="h-5 w-5" />
                    Importar dados
                  </label>
                </div>
              </div>

              <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] p-4">
                <h4 className="mb-2 font-medium text-[var(--text-primary)]">
                  Informações
                </h4>
                <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                  <li>• Exporte um backup completo de suas configurações e tarefas</li>
                  <li>• Importe dados de um backup anterior</li>
                  <li>• O arquivo deve estar em formato JSON válido</li>
                  <li>
                    • Use esta função para trocar de dispositivo ou restaurar dados
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Clear Data Tab */}
          {activeTab === 'clear' && (
            <div className="space-y-4 p-6">
              <div className="rounded-lg border-2 border-red-500 bg-red-500 bg-opacity-10 p-4">
                <div className="mb-4 flex gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-red-500 mb-1">
                      Perigo - Ação Irreversível
                    </h4>
                    <p className="text-sm text-[var(--text-primary)]">
                      Limpar todos os dados deletará permanentemente todas as suas
                      tarefas, tags e configurações. Esta ação não pode ser desfeita.
                    </p>
                  </div>
                </div>

                {clearConfirmation === 0 ? (
                  <button
                    onClick={handleClearData}
                    className="w-full rounded-lg bg-red-500 px-4 py-3 text-white hover:opacity-90 transition-opacity font-medium"
                  >
                    Limpar todos os dados
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      Tem certeza? Clique novamente para confirmar e deletar tudo
                      permanentemente.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleClearData}
                        className="flex-1 rounded-lg bg-red-500 px-4 py-3 text-white hover:opacity-90 transition-opacity font-medium"
                      >
                        Confirmar e deletar
                      </button>
                      <button
                        onClick={() => setClearConfirmation(0)}
                        className="flex-1 rounded-lg border border-[var(--border-color)] px-4 py-3 text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors font-medium"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
