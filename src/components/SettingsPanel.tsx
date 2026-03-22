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
  const [activeTab, setActiveTab] = useState<'dimensions' | 'tags' | 'classifications' | 'export' | 'clear'>('dimensions');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState('');
  const [editingTagColor, setEditingTagColor] = useState<TagColor>({ bg: '#f97316', text: '#ffffff' });
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState<TagColor>({ bg: '#f97316', text: '#ffffff' });
  const [editingClassification, setEditingClassification] = useState<string | null>(null);
  const [editingClassificationName, setEditingClassificationName] = useState('');
  const [newClassificationName, setNewClassificationName] = useState('');
  const [clearConfirmation, setClearConfirmation] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleAddTag = () => {
    if (newTagName.trim()) {
      onUpdateTags([...(settings.tags || []), newTagName]);
      onUpdateTagColor(newTagName, newTagColor);
      setNewTagName('');
      setNewTagColor({ bg: '#f97316', text: '#ffffff' });
    }
  };

  const handleDeleteTag = (tag: string) => {
    onUpdateTags((settings.tags || []).filter((t) => t !== tag));
    setDeleteConfirm(null);
  };

  const handleEditTag = (tag: string) => {
    setEditingTag(tag);
    setEditingTagName(tag);
    setEditingTagColor(settings.tagColors?.[tag] || { bg: '#f97316', text: '#ffffff' });
  };

  const handleSaveTagEdit = () => {
    if (editingTag && editingTagName.trim()) {
      onUpdateTags((settings.tags || []).map((t) => t === editingTag ? editingTagName : t));
      onUpdateTagColor(editingTagName, editingTagColor);
      setEditingTag(null);
    }
  };

  const handleAddClassification = () => {
    if (newClassificationName.trim()) {
      onUpdateClassifications([...(settings.classifications || []), newClassificationName]);
      setNewClassificationName('');
    }
  };

  const handleDeleteClassification = (c: string) => {
    onUpdateClassifications((settings.classifications || []).filter((x) => x !== c));
    setDeleteConfirm(null);
  };

  const handleEditClassification = (c: string) => {
    setEditingClassification(c);
    setEditingClassificationName(c);
  };

  const handleSaveClassificationEdit = () => {
    if (editingClassification && editingClassificationName.trim()) {
      onUpdateClassifications((settings.classifications || []).map((c) => c === editingClassification ? editingClassificationName : c));
      setEditingClassification(null);
    }
  };

  const handleMoveClassificationUp = (i: number) => {
    if (i > 0) {
      const arr = [...(settings.classifications || [])];
      [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]];
      onUpdateClassifications(arr);
    }
  };

  const handleMoveClassificationDown = (i: number) => {
    const arr = settings.classifications || [];
    if (i < arr.length - 1) {
      const updated = [...arr];
      [updated[i], updated[i + 1]] = [updated[i + 1], updated[i]];
      onUpdateClassifications(updated);
    }
  };

  const handleExportData = () => {
    const json = JSON.stringify({ settings, tasks: allTasks, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supertask-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.settings) console.log('Importing:', data);
      } catch { alert('Erro ao importar. Verifique o JSON.'); }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (clearConfirmation === 0) setClearConfirmation(1);
    else { onUpdateTags([]); onUpdateClassifications([]); setClearConfirmation(0); onClose(); }
  };

  const getTasksUsingClassification = (c: string) => allTasks.filter((t) => t.classification === c).length;

  if (!isOpen) return null;

  const tabs = [
    { id: 'dimensions' as const, label: 'Dimensões' },
    { id: 'tags' as const, label: 'Tags' },
    { id: 'classifications' as const, label: 'Classificações' },
    { id: 'export' as const, label: 'Dados' },
    { id: 'clear' as const, label: 'Limpar' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn">
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl shadow-2xl animate-slideIn"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--accent-subtle)' }}>
              <Settings className="h-5 w-5" style={{ color: 'var(--accent)' }} />
            </div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Configurações
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
            <X className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: 'var(--border-color)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-3 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2'
                  : ''
              }`}
              style={{
                borderColor: activeTab === tab.id ? 'var(--accent)' : 'transparent',
                color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Dimensions */}
          {activeTab === 'dimensions' && (
            <div className="space-y-3 p-6">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Ative ou desative dimensões no cálculo de pontuação.
              </p>
              {Object.entries(DIMENSION_MAP).map(([key, dim]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg border p-3.5 hover:border-[var(--accent)] transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{dim.label}</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {dim.inverted ? '(Invertida)' : '(Normal)'}
                    </p>
                  </div>
                  <button onClick={() => onToggleDimension(key as DimensionKey)} className="p-1">
                    {settings.activeDimensions?.includes(key as DimensionKey)
                      ? <ToggleRight className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                      : <ToggleLeft className="h-6 w-6" style={{ color: 'var(--text-muted)' }} />}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {activeTab === 'tags' && (
            <div className="space-y-3 p-6">
              {(settings.tags || []).map((tag) => (
                <div
                  key={tag}
                  className="flex items-center justify-between rounded-lg border p-3.5"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  {editingTag === tag ? (
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={editingTagName}
                        onChange={(e) => setEditingTagName(e.target.value)}
                        className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
                        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                      />
                      <div className="flex gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Fundo:</span>
                          <input type="color" value={editingTagColor.bg} onChange={(e) => setEditingTagColor({ ...editingTagColor, bg: e.target.value })} className="h-7 w-10 rounded cursor-pointer" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Texto:</span>
                          <input type="color" value={editingTagColor.text} onChange={(e) => setEditingTagColor({ ...editingTagColor, text: e.target.value })} className="h-7 w-10 rounded cursor-pointer" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleSaveTagEdit} className="flex-1 rounded-lg py-2 text-xs font-medium text-white" style={{ backgroundColor: 'var(--accent)' }}>Salvar</button>
                        <button onClick={() => setEditingTag(null)} className="flex-1 rounded-lg py-2 text-xs font-medium border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 flex-1">
                        <div className="h-5 w-5 rounded" style={{ backgroundColor: settings.tagColors?.[tag]?.bg || '#f97316' }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{tag}</span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleEditTag(tag)} className="p-1.5 rounded hover:bg-[var(--bg-hover)]">
                          <Pencil className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
                        </button>
                        <button onClick={() => setDeleteConfirm(`tag-${tag}`)} className="p-1.5 rounded hover:bg-[var(--danger-light)]">
                          <Trash2 className="h-3.5 w-3.5" style={{ color: 'var(--danger)' }} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {deleteConfirm?.startsWith('tag-') && (
                <div className="rounded-lg border p-3.5" style={{ borderColor: 'var(--danger)', backgroundColor: 'var(--danger-light)' }}>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-primary)' }}>Deletar tag?</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleDeleteTag(deleteConfirm.replace('tag-', ''))} className="flex-1 rounded-lg py-1.5 text-xs font-medium text-white" style={{ backgroundColor: 'var(--danger)' }}>Deletar</button>
                    <button onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-lg py-1.5 text-xs font-medium border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Cancelar</button>
                  </div>
                </div>
              )}

              <div className="rounded-lg border p-3.5 space-y-2" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Nova tag</h4>
                <input type="text" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="Nome" className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <div className="flex gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Fundo:</span>
                    <input type="color" value={newTagColor.bg} onChange={(e) => setNewTagColor({ ...newTagColor, bg: e.target.value })} className="h-7 w-10 rounded cursor-pointer" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Texto:</span>
                    <input type="color" value={newTagColor.text} onChange={(e) => setNewTagColor({ ...newTagColor, text: e.target.value })} className="h-7 w-10 rounded cursor-pointer" />
                  </div>
                </div>
                <button onClick={handleAddTag} className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-white" style={{ backgroundColor: 'var(--accent)' }}>
                  <Plus className="h-4 w-4" /> Adicionar
                </button>
              </div>
            </div>
          )}

          {/* Classifications */}
          {activeTab === 'classifications' && (
            <div className="space-y-3 p-6">
              {(settings.classifications || []).map((c, i) => {
                const count = getTasksUsingClassification(c);
                return (
                  <div key={c} className="flex items-center justify-between rounded-lg border p-3.5" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                    {editingClassification === c ? (
                      <div className="flex-1 space-y-2">
                        <input type="text" value={editingClassificationName} onChange={(e) => setEditingClassificationName(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                        <div className="flex gap-2">
                          <button onClick={handleSaveClassificationEdit} className="flex-1 rounded-lg py-1.5 text-xs font-medium text-white" style={{ backgroundColor: 'var(--accent)' }}>Salvar</button>
                          <button onClick={() => setEditingClassification(null)} className="flex-1 rounded-lg py-1.5 text-xs font-medium border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{c}</p>
                          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{count} tarefa{count !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => handleMoveClassificationUp(i)} disabled={i === 0} className="p-1.5 rounded hover:bg-[var(--bg-hover)] disabled:opacity-30">
                            <ChevronUp className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
                          </button>
                          <button onClick={() => handleMoveClassificationDown(i)} disabled={i === (settings.classifications?.length || 0) - 1} className="p-1.5 rounded hover:bg-[var(--bg-hover)] disabled:opacity-30">
                            <ChevronDown className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
                          </button>
                          <button onClick={() => handleEditClassification(c)} className="p-1.5 rounded hover:bg-[var(--bg-hover)]">
                            <Pencil className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
                          </button>
                          <button onClick={() => setDeleteConfirm(`classification-${c}`)} className="p-1.5 rounded hover:bg-[var(--danger-light)]">
                            <Trash2 className="h-3.5 w-3.5" style={{ color: 'var(--danger)' }} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {deleteConfirm?.startsWith('classification-') && (
                <div className="rounded-lg border p-3.5" style={{ borderColor: 'var(--danger)', backgroundColor: 'var(--danger-light)' }}>
                  <div className="flex gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--danger)' }} />
                    <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
                      {getTasksUsingClassification(deleteConfirm.replace('classification-', '')) > 0 && `Usada por ${getTasksUsingClassification(deleteConfirm.replace('classification-', ''))} tarefa(s). `}
                      Deletar?
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleDeleteClassification(deleteConfirm.replace('classification-', ''))} className="flex-1 rounded-lg py-1.5 text-xs font-medium text-white" style={{ backgroundColor: 'var(--danger)' }}>Deletar</button>
                    <button onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-lg py-1.5 text-xs font-medium border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Cancelar</button>
                  </div>
                </div>
              )}

              <div className="rounded-lg border p-3.5 space-y-2" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Nova classificação</h4>
                <input type="text" value={newClassificationName} onChange={(e) => setNewClassificationName(e.target.value)} placeholder="Nome" className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <button onClick={handleAddClassification} className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-white" style={{ backgroundColor: 'var(--accent)' }}>
                  <Plus className="h-4 w-4" /> Adicionar
                </button>
              </div>
            </div>
          )}

          {/* Export */}
          {activeTab === 'export' && (
            <div className="space-y-4 p-6">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Exporte ou importe dados em JSON.
              </p>
              <button onClick={handleExportData} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 font-medium transition-colors" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                <Download className="h-5 w-5" /> Exportar dados
              </button>
              <div className="relative">
                <input type="file" accept=".json" onChange={handleImportData} className="hidden" id="import-file" />
                <label htmlFor="import-file" className="flex w-full items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 font-medium transition-colors cursor-pointer" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                  <Upload className="h-5 w-5" /> Importar dados
                </label>
              </div>
            </div>
          )}

          {/* Clear */}
          {activeTab === 'clear' && (
            <div className="p-6">
              <div className="rounded-xl border-2 p-4" style={{ borderColor: 'var(--danger)', backgroundColor: 'var(--danger-light)' }}>
                <div className="flex gap-3 mb-4">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--danger)' }} />
                  <div>
                    <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--danger)' }}>Ação Irreversível</h4>
                    <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
                      Limpar todos os dados deletará permanentemente tarefas, tags e configurações.
                    </p>
                  </div>
                </div>
                {clearConfirmation === 0 ? (
                  <button onClick={handleClearData} className="w-full rounded-lg py-2.5 text-sm font-medium text-white" style={{ backgroundColor: 'var(--danger)' }}>
                    Limpar todos os dados
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Confirmar?</p>
                    <div className="flex gap-2">
                      <button onClick={handleClearData} className="flex-1 rounded-lg py-2 text-sm font-medium text-white" style={{ backgroundColor: 'var(--danger)' }}>Confirmar</button>
                      <button onClick={() => setClearConfirmation(0)} className="flex-1 rounded-lg py-2 text-sm font-medium border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Cancelar</button>
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
