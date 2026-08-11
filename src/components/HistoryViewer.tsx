import React, { useState } from 'react';
import { MaterialResultData } from '../types';
import { TurmaFolderOrganizer } from './TurmaFolderOrganizer';
import { History, Trash2, Printer, Search, Calendar, FileText, Sparkles, BookOpen, Folder } from 'lucide-react';

interface HistoryViewerProps {
  history: MaterialResultData[];
  onSelect: (item: MaterialResultData) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onUpdateMaterialFolder?: (
    materialId: string,
    turmaNome: string,
    bimestre: '1º Bimestre' | '2º Bimestre' | '3º Bimestre' | '4º Bimestre'
  ) => void;
  onNavigateToGenerator?: (ano?: string) => void;
}

export const HistoryViewer: React.FC<HistoryViewerProps> = ({
  history,
  onSelect,
  onDelete,
  onClearAll,
  onUpdateMaterialFolder = () => {},
  onNavigateToGenerator,
}) => {
  const [viewMode, setViewMode] = useState<'folders' | 'list'>('folders');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter(
    (item) =>
      item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.disciplina?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tipo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Navigation Switcher between Pastas de Turma and Lista Geral */}
      <div className="bg-white rounded-2xl border border-auguste-sand shadow-2xs p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('folders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
              viewMode === 'folders'
                ? 'bg-auguste-slate text-white border-auguste-slate shadow-2xs font-extrabold'
                : 'bg-auguste-cream text-auguste-text border-auguste-sand hover:bg-white'
            }`}
          >
            <Folder className="w-4 h-4 fill-current" />
            <span>Pastas por Turma & Regimentos (4 Bimestres)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
              viewMode === 'list'
                ? 'bg-auguste-slate text-white border-auguste-slate shadow-2xs font-extrabold'
                : 'bg-auguste-cream text-auguste-text border-auguste-sand hover:bg-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Lista Geral Salva</span>
          </button>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 self-end sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Limpar Todo Histórico
          </button>
        )}
      </div>

      {/* VIEW MODE 1: TURMA FOLDER & REGIMENTOS ORGANIZER */}
      {viewMode === 'folders' && (
        <TurmaFolderOrganizer
          history={history}
          onSelectMaterial={onSelect}
          onUpdateMaterialFolder={onUpdateMaterialFolder}
          onDeleteMaterial={onDelete}
          onNavigateToGenerator={onNavigateToGenerator}
        />
      )}

      {/* VIEW MODE 2: CHRONOLOGICAL GENERAL LIST */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-auguste-sand shadow-md p-6 sm:p-8 space-y-6 text-auguste-text">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-auguste-sand pb-4">
            <div>
              <h2 className="text-xl font-bold text-auguste-text flex items-center gap-2">
                <History className="w-6 h-6 text-auguste-slate" />
                <span>Histórico Geral de Materiais</span>
              </h2>
              <p className="text-sm text-auguste-muted mt-1">
                Acesse todos os materiais em ordem de criação ou filtre por título.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          {history.length > 0 && (
            <div className="relative">
              <Search className="w-4 h-4 text-auguste-slate absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar por título, disciplina ou tipo de material..."
                className="w-full bg-auguste-cream border border-auguste-sand rounded-xl pl-10 pr-4 py-2.5 text-sm text-auguste-text focus:ring-2 focus:ring-auguste-slate focus:bg-white focus:outline-none placeholder-auguste-muted"
              />
            </div>
          )}

          {/* List */}
          <div className="space-y-3">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-xl border border-auguste-sand bg-auguste-cream hover:bg-white hover:shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 cursor-pointer" onClick={() => onSelect(item)}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-auguste-slate text-white uppercase tracking-wider">
                      {item.tipo}
                    </span>
                    <span className="text-xs font-semibold text-auguste-text">
                      {item.disciplina} • {item.ano}
                    </span>
                    {item.turmaNome && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-auguste-slate border border-auguste-sand flex items-center gap-1">
                        <Folder className="w-3 h-3" /> {item.turmaNome}
                      </span>
                    )}
                    {item.bimestre && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-auguste-slate border border-auguste-sand">
                        {item.bimestre}
                      </span>
                    )}
                    {item.createdAt && (
                      <span className="text-[10px] text-auguste-muted flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-auguste-slate" />{' '}
                        {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-auguste-text hover:text-auguste-slate transition-colors">
                    {item.titulo}
                  </h3>
                  {item.habilidadesBNCC && item.habilidadesBNCC.length > 0 && (
                    <p className="text-xs text-auguste-slate font-mono font-bold">
                      BNCC: {item.habilidadesBNCC.map((h) => h.codigo).join(', ')}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onSelect(item)}
                    className="px-3 py-1.5 rounded-lg bg-auguste-slate text-white hover:bg-auguste-slate-dark text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Visualizar
                  </button>
                  {item.id && (
                    <button
                      type="button"
                      onClick={() => onDelete(item.id!)}
                      className="p-2 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Excluir do histórico"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {history.length === 0 && (
              <div className="text-center py-12 bg-auguste-cream rounded-2xl border border-dashed border-auguste-sand space-y-2">
                <History className="w-8 h-8 text-auguste-slate mx-auto" />
                <p className="text-sm font-bold text-auguste-text">Nenhum material salvo no histórico</p>
                <p className="text-xs text-auguste-muted">
                  Ao gerar novos planos de aula, atividades e provas, clique em "Salvar" para armazená-los aqui.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

