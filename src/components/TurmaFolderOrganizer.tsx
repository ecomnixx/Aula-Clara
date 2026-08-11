import React, { useState } from 'react';
import { MaterialResultData, TurmaFolder } from '../types';
import {
  Folder,
  FolderPlus,
  ChevronRight,
  BookOpen,
  Plus,
  Trash2,
  Calendar,
  Layers,
  ArrowLeft,
  FileText,
  Printer,
  Sparkles,
  Search,
  CheckCircle2,
} from 'lucide-react';

interface TurmaFolderOrganizerProps {
  history: MaterialResultData[];
  onSelectMaterial: (item: MaterialResultData) => void;
  onUpdateMaterialFolder: (
    materialId: string,
    turmaNome: string,
    bimestre: '1º Bimestre' | '2º Bimestre' | '3º Bimestre' | '4º Bimestre'
  ) => void;
  onDeleteMaterial: (id: string) => void;
  onNavigateToGenerator?: (ano?: string) => void;
}

const DEFAULT_TURMAS = [
  '1º Ano',
  '2º Ano',
  '3º Ano',
  '4º Ano',
  '5º Ano',
  '6º Ano',
  '7º Ano',
  '8º Ano',
  '9º Ano',
  '1ª Série EM',
  '2ª Série EM',
  '3ª Série EM',
];

const BIMESTRES: ('1º Bimestre' | '2º Bimestre' | '3º Bimestre' | '4º Bimestre')[] = [
  '1º Bimestre',
  '2º Bimestre',
  '3º Bimestre',
  '4º Bimestre',
];

export const TurmaFolderOrganizer: React.FC<TurmaFolderOrganizerProps> = ({
  history,
  onSelectMaterial,
  onUpdateMaterialFolder,
  onDeleteMaterial,
  onNavigateToGenerator,
}) => {
  // Custom turmas state in localStorage
  const [customTurmas, setCustomTurmas] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aula_clara_custom_turmas');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [newTurmaName, setNewTurmaName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Active Selected View State: null = All Folders, string = Active Turma
  const [selectedTurma, setSelectedTurma] = useState<string | null>(null);
  const [selectedBimestre, setSelectedBimestre] = useState<
    '1º Bimestre' | '2º Bimestre' | '3º Bimestre' | '4º Bimestre' | null
  >(null);

  const [searchTerm, setSearchTerm] = useState('');

  // Combine default turmas with custom turmas
  const allTurmas = Array.from(new Set([...DEFAULT_TURMAS, ...customTurmas]));

  const handleCreateTurma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTurmaName.trim()) return;
    const nameFormatted = newTurmaName.trim();
    if (!allTurmas.includes(nameFormatted)) {
      const updated = [...customTurmas, nameFormatted];
      setCustomTurmas(updated);
      try {
        localStorage.setItem('aula_clara_custom_turmas', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
    }
    setSelectedTurma(nameFormatted);
    setNewTurmaName('');
    setShowCreateModal(false);
  };

  const handleDeleteCustomTurma = (turmaName: string) => {
    if (confirm(`Deseja excluir a pasta da turma "${turmaName}"? os materiais cadastrados permanecerão salvos no histórico.`)) {
      const updated = customTurmas.filter((t) => t !== turmaName);
      setCustomTurmas(updated);
      try {
        localStorage.setItem('aula_clara_custom_turmas', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      if (selectedTurma === turmaName) {
        setSelectedTurma(null);
        setSelectedBimestre(null);
      }
    }
  };

  // Helper to count materials for a turma and optional bimestre
  const getMaterialCount = (turma: string, bimestre?: string) => {
    return history.filter((item) => {
      // Match explicitly saved turma or match item.ano
      const matchTurma =
        item.turmaNome === turma ||
        (item.ano && item.ano.toLowerCase().includes(turma.toLowerCase()));

      if (!matchTurma) return false;
      if (bimestre) {
        return item.bimestre === bimestre;
      }
      return true;
    }).length;
  };

  // Filtered materials for active Turma and Bimestre
  const getFilteredMaterials = () => {
    if (!selectedTurma) return [];
    return history.filter((item) => {
      const matchTurma =
        item.turmaNome === selectedTurma ||
        (item.ano && item.ano.toLowerCase().includes(selectedTurma.toLowerCase()));

      if (!matchTurma) return false;

      if (selectedBimestre) {
        if (item.bimestre) {
          return item.bimestre === selectedBimestre;
        }
        // If material doesn't have an explicit bimestre assigned yet, show in 1º Bimestre by default
        return selectedBimestre === '1º Bimestre';
      }

      if (searchTerm) {
        return (
          item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.disciplina?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.tipo?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return true;
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-auguste-sand shadow-md p-6 sm:p-8 space-y-6 text-auguste-text font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-auguste-sand pb-4">
        <div>
          <div className="flex items-center gap-2">
            {selectedTurma && (
              <button
                type="button"
                onClick={() => {
                  if (selectedBimestre) {
                    setSelectedBimestre(null);
                  } else {
                    setSelectedTurma(null);
                  }
                }}
                className="p-1.5 rounded-xl bg-auguste-cream text-auguste-slate hover:bg-auguste-sand transition-all cursor-pointer"
                title="Voltar para todas as turmas"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-xl font-bold text-auguste-text flex items-center gap-2">
              <Folder className="w-6 h-6 text-auguste-slate" />
              <span>
                {selectedTurma
                  ? `Pasta da Turma: ${selectedTurma} ${selectedBimestre ? `• ${selectedBimestre}` : ''}`
                  : 'Organizador de Pastas por Turma & Regimentos (4 Bimestres)'}
              </span>
            </h2>
          </div>
          <p className="text-sm text-auguste-muted mt-1">
            {selectedTurma
              ? selectedBimestre
                ? `Planos de aula, atividades e avaliações salvos no ${selectedBimestre} desta turma.`
                : 'Selecione um dos 4 regimentos (bimestres) para acessar ou organizar os conteúdos pedagógicos.'
              : 'Organize todos os seus conteúdos escolares separados em pastas por Turma e por Regimentos (1º, 2º, 3º e 4º Bimestres).'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!selectedTurma ? (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-xl bg-auguste-slate hover:bg-auguste-slate-dark text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Criar Nova Pasta de Turma</span>
            </button>
          ) : (
            onNavigateToGenerator && (
              <button
                type="button"
                onClick={() => onNavigateToGenerator(selectedTurma)}
                className="px-4 py-2.5 rounded-xl bg-auguste-slate hover:bg-auguste-slate-dark text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Gerar Nova Aula para esta Turma</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Modal: Create Custom Turma Folder */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-xl border border-auguste-sand max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-auguste-sand pb-3">
              <h3 className="text-base font-bold text-auguste-text flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-auguste-slate" />
                <span>Nova Pasta de Turma</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-auguste-muted hover:text-auguste-text text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTurma} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-auguste-slate uppercase tracking-wider mb-1.5">
                  Nome da Turma / Classe:
                </label>
                <input
                  type="text"
                  required
                  value={newTurmaName}
                  onChange={(e) => setNewTurmaName(e.target.value)}
                  placeholder="Ex.: 1º Ano A, 6º Ano B, Turma de Apoio..."
                  className="w-full px-4 py-3 bg-auguste-cream border border-auguste-sand rounded-xl text-sm font-bold text-auguste-text focus:outline-none focus:border-auguste-slate"
                />
                <p className="text-[11px] text-auguste-muted mt-1">
                  A nova pasta conterá automaticamente as subdivisões dos 4 Regimentos (1º ao 4º Bimestre).
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-auguste-sand text-xs font-bold text-auguste-text hover:bg-auguste-cream"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-auguste-slate hover:bg-auguste-slate-dark text-white text-xs font-bold shadow-2xs"
                >
                  Criar Pasta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW LEVEL 1: GRID OF ALL CLASS FOLDERS */}
      {!selectedTurma && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allTurmas.map((turma) => {
              const count = getMaterialCount(turma);
              const isCustom = customTurmas.includes(turma);

              return (
                <div
                  key={turma}
                  onClick={() => {
                    setSelectedTurma(turma);
                    setSelectedBimestre(null);
                  }}
                  className="group p-5 rounded-2xl border border-auguste-sand bg-auguste-cream hover:bg-white hover:border-auguste-slate hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 relative"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-12 h-12 rounded-xl bg-white text-auguste-slate border border-auguste-sand flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                      <Folder className="w-6 h-6 fill-auguste-cream text-auguste-slate" />
                    </div>
                    {isCustom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomTurma(turma);
                        }}
                        className="p-1 text-auguste-muted hover:text-rose-600 transition-colors"
                        title="Excluir pasta criada"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-auguste-text group-hover:text-auguste-slate transition-colors">
                      {turma}
                    </h3>
                    <p className="text-xs text-auguste-muted font-medium mt-0.5">
                      Contém os 4 Regimentos Bimestrais
                    </p>
                  </div>

                  <div className="pt-2 border-t border-auguste-sand flex items-center justify-between text-xs">
                    <span className="font-bold text-auguste-slate bg-white px-2.5 py-1 rounded-lg border border-auguste-sand shadow-2xs">
                      {count} {count === 1 ? 'material' : 'materiais'}
                    </span>
                    <span className="font-bold text-auguste-muted group-hover:text-auguste-slate flex items-center gap-1">
                      Abrir regimentos <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW LEVEL 2: REGIMENTOS (4 BIMESTRES) INSIDE SELECTED TURMA */}
      {selectedTurma && !selectedBimestre && (
        <div className="space-y-6">
          <div className="bg-auguste-cream p-4 rounded-2xl border border-auguste-sand flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Folder className="w-6 h-6 text-auguste-slate" />
              <div>
                <h3 className="text-base font-bold text-auguste-text">
                  Regimentos da Turma: <span className="text-auguste-slate font-black">{selectedTurma}</span>
                </h3>
                <p className="text-xs text-auguste-muted">
                  Abaixo estão os 4 Bimestres do ano letivo desta turma.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedTurma(null)}
              className="text-xs font-bold text-auguste-slate hover:underline"
            >
              Ver todas as turmas
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BIMESTRES.map((bim) => {
              const bimCount = getMaterialCount(selectedTurma, bim);

              return (
                <div
                  key={bim}
                  onClick={() => setSelectedBimestre(bim)}
                  className="group p-5 rounded-2xl border border-auguste-sand bg-white hover:bg-auguste-cream hover:border-auguste-slate hover:shadow-md transition-all cursor-pointer space-y-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-auguste-cream text-auguste-slate border border-auguste-sand flex items-center justify-center font-bold shadow-2xs">
                    <Calendar className="w-5 h-5 text-auguste-slate" />
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-auguste-slate bg-auguste-cream px-2 py-0.5 rounded-md border border-auguste-sand">
                      Regimento Bimestral
                    </span>
                    <h4 className="text-base font-extrabold text-auguste-text mt-1.5 group-hover:text-auguste-slate transition-colors">
                      {bim}
                    </h4>
                  </div>

                  <div className="pt-3 border-t border-auguste-sand flex items-center justify-between text-xs">
                    <span className="font-extrabold text-auguste-slate">
                      {bimCount} {bimCount === 1 ? 'conteúdo' : 'conteúdos'}
                    </span>
                    <span className="font-bold text-auguste-muted group-hover:text-auguste-slate flex items-center gap-1">
                      Acessar <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick List of All Items in this Turma */}
          <div className="space-y-3 pt-4">
            <h4 className="text-sm font-bold text-auguste-text flex items-center gap-2">
              <FileText className="w-4 h-4 text-auguste-slate" />
              <span>Todos os materiais cadastrados nesta turma ({getMaterialCount(selectedTurma)}):</span>
            </h4>

            <div className="space-y-2">
              {getFilteredMaterials().map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-auguste-sand bg-auguste-cream hover:bg-white flex items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-1 cursor-pointer" onClick={() => onSelectMaterial(item)}>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-auguste-slate text-white uppercase">
                        {item.tipo}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-auguste-text border border-auguste-sand">
                        {item.bimestre || '1º Bimestre'}
                      </span>
                      <span className="text-xs text-auguste-muted">{item.disciplina}</span>
                    </div>
                    <h5 className="text-sm font-bold text-auguste-text hover:text-auguste-slate">
                      {item.titulo}
                    </h5>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Move Bimestre selector */}
                    <select
                      value={item.bimestre || '1º Bimestre'}
                      onChange={(e) =>
                        onUpdateMaterialFolder(
                          item.id!,
                          selectedTurma,
                          e.target.value as any
                        )
                      }
                      className="text-xs font-bold bg-white border border-auguste-sand rounded-lg px-2.5 py-1 text-auguste-text focus:outline-none cursor-pointer"
                    >
                      {BIMESTRES.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => onSelectMaterial(item)}
                      className="px-3 py-1.5 rounded-lg bg-auguste-slate text-white text-xs font-bold hover:bg-auguste-slate-dark"
                    >
                      Visualizar
                    </button>
                  </div>
                </div>
              ))}

              {getFilteredMaterials().length === 0 && (
                <div className="p-8 text-center bg-auguste-cream rounded-2xl border border-dashed border-auguste-sand text-xs text-auguste-muted">
                  Nenhum material salvo especificamente para esta turma ainda.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW LEVEL 3: CONTENTS OF SPECIFIC BIMESTRE IN SELECTED TURMA */}
      {selectedTurma && selectedBimestre && (
        <div className="space-y-4">
          <div className="bg-auguste-cream p-4 rounded-2xl border border-auguste-sand flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-auguste-slate" />
              <div>
                <h3 className="text-base font-bold text-auguste-text">
                  Turma: <span className="font-black text-auguste-slate">{selectedTurma}</span> •{' '}
                  <span className="font-black text-auguste-slate">{selectedBimestre}</span>
                </h3>
                <p className="text-xs text-auguste-muted">
                  Lista de planos de aula, atividades e avaliações arquivados neste regimento.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedBimestre(null)}
              className="text-xs font-bold text-auguste-slate hover:underline self-start sm:self-auto"
            >
              Voltar aos regimentos
            </button>
          </div>

          <div className="space-y-3">
            {getFilteredMaterials().map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-auguste-sand bg-white hover:bg-auguste-cream transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
              >
                <div className="space-y-1.5 cursor-pointer" onClick={() => onSelectMaterial(item)}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-auguste-slate text-white uppercase tracking-wider">
                      {item.tipo}
                    </span>
                    <span className="text-xs font-semibold text-auguste-text">
                      {item.disciplina} • {item.ano}
                    </span>
                    {item.createdAt && (
                      <span className="text-[10px] text-auguste-muted flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-auguste-slate" />{' '}
                        {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-auguste-text hover:text-auguste-slate transition-colors">
                    {item.titulo}
                  </h4>
                  {item.habilidadesBNCC && item.habilidadesBNCC.length > 0 && (
                    <p className="text-xs text-auguste-slate font-mono font-bold">
                      BNCC: {item.habilidadesBNCC.map((h) => h.codigo).join(', ')}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={item.bimestre || selectedBimestre}
                    onChange={(e) =>
                      onUpdateMaterialFolder(
                        item.id!,
                        selectedTurma,
                        e.target.value as any
                      )
                    }
                    className="text-xs font-bold bg-auguste-cream border border-auguste-sand rounded-xl px-3 py-2 text-auguste-text focus:outline-none cursor-pointer"
                  >
                    {BIMESTRES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => onSelectMaterial(item)}
                    className="px-4 py-2 rounded-xl bg-auguste-slate text-white text-xs font-bold hover:bg-auguste-slate-dark transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Visualizar</span>
                  </button>

                  {item.id && (
                    <button
                      type="button"
                      onClick={() => onDeleteMaterial(item.id!)}
                      className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {getFilteredMaterials().length === 0 && (
              <div className="text-center py-12 bg-auguste-cream rounded-2xl border border-dashed border-auguste-sand space-y-3">
                <Folder className="w-8 h-8 text-auguste-slate mx-auto" />
                <p className="text-sm font-bold text-auguste-text">
                  Nenhum conteúdo salvo no {selectedBimestre} da turma {selectedTurma}
                </p>
                <p className="text-xs text-auguste-muted max-w-md mx-auto">
                  Ao gerar ou editar novos planos de aula e avaliações, selecione a pasta da turma e o bimestre para guardar aqui.
                </p>
                {onNavigateToGenerator && (
                  <button
                    type="button"
                    onClick={() => onNavigateToGenerator(selectedTurma)}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-auguste-slate text-white rounded-xl text-xs font-bold hover:bg-auguste-slate-dark shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Gerar Conteúdo para {selectedTurma}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
