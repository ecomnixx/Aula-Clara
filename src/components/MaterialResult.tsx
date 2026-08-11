import React, { useState } from 'react';
import { MaterialResultData } from '../types';
import { EduFisicaCard } from './EduFisicaCard';
import {
  Printer,
  Copy,
  Check,
  Bookmark,
  Eye,
  EyeOff,
  Edit3,
  Award,
  Clock,
  BookOpen,
  FileText,
  CheckCircle,
  Sparkles,
  HelpCircle,
  Save,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Folder,
  Calendar,
} from 'lucide-react';

interface MaterialResultProps {
  material: MaterialResultData;
  onSaveHistory: (material: MaterialResultData) => void;
  onOpenPrint: (material: MaterialResultData, includeGabarito: boolean) => void;
  isSaved?: boolean;
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

const BIMESTRES = ['1º Bimestre', '2º Bimestre', '3º Bimestre', '4º Bimestre'] as const;

export const MaterialResult: React.FC<MaterialResultProps> = ({
  material,
  onSaveHistory,
  onOpenPrint,
  isSaved = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [showGabarito, setShowGabarito] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showOcrExpanded, setShowOcrExpanded] = useState(false);
  const [copiedOcr, setCopiedOcr] = useState(false);

  // Folder & Regimento (Bimestre) selection state
  const [selectedTurma, setSelectedTurma] = useState<string>(
    material.turmaNome || material.ano || '1º Ano'
  );
  const [selectedBimestre, setSelectedBimestre] = useState<
    '1º Bimestre' | '2º Bimestre' | '3º Bimestre' | '4º Bimestre'
  >(material.bimestre || '1º Bimestre');

  // Active possibility tab: 'aula' | 'prova'
  const hasDualPossibilities =
    !!material.possibilidade1_planoDeAula && !!material.possibilidade2_provaAvaliacao;

  const [selectedPossibility, setSelectedPossibility] = useState<'aula' | 'prova'>(
    material.tipo === 'Prova' ? 'prova' : 'aula'
  );

  // Sync tab selection when material prop or material.tipo changes
  React.useEffect(() => {
    if (material.tipo === 'Prova') {
      setSelectedPossibility('prova');
    } else if (material.tipo === 'Plano de Aula') {
      setSelectedPossibility('aula');
    }
  }, [material.id, material.tipo]);

  // Computed material based on active possibility selection
  const getActiveMaterial = (): MaterialResultData => {
    if (selectedPossibility === 'aula' && material.possibilidade1_planoDeAula) {
      return {
        ...material,
        ...material.possibilidade1_planoDeAula,
        tipo: 'Plano de Aula',
      };
    }
    if (selectedPossibility === 'prova' && material.possibilidade2_provaAvaliacao) {
      return {
        ...material,
        ...material.possibilidade2_provaAvaliacao,
        tipo: 'Prova',
      };
    }
    return material;
  };

  const activeMaterial = getActiveMaterial();
  const [editedMaterial, setEditedMaterial] = useState<MaterialResultData>(activeMaterial);

  // Sync editedMaterial whenever selectedPossibility or material prop changes
  React.useEffect(() => {
    setEditedMaterial(getActiveMaterial());
  }, [selectedPossibility, material]);

  const handleCopy = () => {
    let copyText = editedMaterial.markdownCompleto;
    if (!copyText) {
      copyText = `# ${editedMaterial.titulo}\n\n${editedMaterial.objetivo}\n\nHabilidades BNCC: ${editedMaterial.habilidadesBNCC
        .map((h) => `${h.codigo} - ${h.descricao}`)
        .join('; ')}`;
    }
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isProva = editedMaterial.tipo === 'Prova' || !!editedMaterial.questoes?.length;

  return (
    <div className="bg-white rounded-2xl border border-auguste-sand shadow-md overflow-hidden transition-all animate-fadeIn text-auguste-text font-sans">
      {/* Possibility Dual Switcher Banner (Only shown if both possibilities exist) */}
      {hasDualPossibilities && (
        <div className="bg-auguste-cream border-b border-auguste-sand p-3.5 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-auguste-slate">
            <Sparkles className="w-4 h-4 text-auguste-slate shrink-0 animate-pulse" />
            <span>Análise do Conteúdo Concluída • Selecione uma das duas possibilidades de geração:</span>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setSelectedPossibility('aula')}
              className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                selectedPossibility === 'aula'
                  ? 'bg-auguste-slate text-white border-auguste-slate shadow-2xs font-extrabold'
                  : 'bg-white text-auguste-text border-auguste-sand hover:bg-auguste-cream'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Possibilidade 1: Gerar Aulas (Plano de Aula)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedPossibility('prova')}
              className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                selectedPossibility === 'prova'
                  ? 'bg-auguste-slate text-white border-auguste-slate shadow-2xs font-extrabold'
                  : 'bg-white text-auguste-text border-auguste-sand hover:bg-auguste-cream'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Possibilidade 2: Gerar Prova / Avaliação</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="bg-white text-auguste-text p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-auguste-sand">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-auguste-cream text-auguste-slate border border-auguste-sand flex items-center justify-center font-bold shrink-0">
            {selectedPossibility === 'aula' ? (
              <BookOpen className="w-5 h-5" />
            ) : (
              <HelpCircle className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-auguste-slate text-white uppercase tracking-wider">
                {hasDualPossibilities
                  ? selectedPossibility === 'aula'
                    ? 'Possibilidade 1: Plano de Aula'
                    : 'Possibilidade 2: Prova / Avaliação'
                  : isProva
                  ? 'Prova / Avaliação Bimestral'
                  : editedMaterial.disciplina === 'Educação Física' && editedMaterial.regrasOuProcedimentos?.length
                  ? 'Atividade Prática de Educação Física'
                  : 'Plano de Aula BNCC'}
              </span>
              <span className="text-xs text-auguste-muted font-medium">
                {editedMaterial.disciplina} • {editedMaterial.ano}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-auguste-text mt-1">
              {editedMaterial.titulo}
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() =>
              onSaveHistory({
                ...editedMaterial,
                turmaNome: selectedTurma,
                bimestre: selectedBimestre,
              })
            }
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              isSaved
                ? 'bg-auguste-slate text-white border-auguste-slate'
                : 'bg-white hover:bg-auguste-cream text-auguste-text border-auguste-sand'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white text-white' : ''}`} />
            <span>{isSaved ? 'Salvo na Pasta' : 'Salvar na Pasta'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-2 rounded-xl bg-white hover:bg-auguste-cream text-auguste-text border border-auguste-sand text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-2 rounded-xl bg-white hover:bg-auguste-cream text-auguste-text border border-auguste-sand text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditing ? 'Visualizar' : 'Editar'}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenPrint(editedMaterial, showGabarito)}
            className="px-3.5 py-2 rounded-xl bg-auguste-slate hover:bg-auguste-slate-dark text-white text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Content View */}
      <div className="p-6 sm:p-8 space-y-8 bg-white">
        {/* Organization Bar: Turma Folder & Bimestre Regimento */}
        <div className="bg-auguste-cream/90 border border-auguste-sand rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white text-auguste-slate border border-auguste-sand flex items-center justify-center font-bold shrink-0">
              <Folder className="w-5 h-5 text-auguste-slate fill-auguste-cream" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-auguste-slate">
                Organizar e Arquivar em Pasta:
              </span>
              <p className="text-xs text-auguste-muted font-medium">
                Selecione a turma e o regimento (bimestre) para guardar este conteúdo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Turma Folder Selector */}
            <div className="flex items-center gap-1.5 bg-white border border-auguste-sand rounded-xl px-3 py-1.5">
              <Folder className="w-3.5 h-3.5 text-auguste-slate shrink-0" />
              <select
                value={selectedTurma}
                onChange={(e) => setSelectedTurma(e.target.value)}
                className="text-xs font-bold text-auguste-text bg-transparent focus:outline-none cursor-pointer"
              >
                {DEFAULT_TURMAS.map((t) => (
                  <option key={t} value={t}>
                    Turma: {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Regimento / Bimestre Selector */}
            <div className="flex items-center gap-1.5 bg-white border border-auguste-sand rounded-xl px-3 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-auguste-slate shrink-0" />
              <select
                value={selectedBimestre}
                onChange={(e) => setSelectedBimestre(e.target.value as any)}
                className="text-xs font-bold text-auguste-text bg-transparent focus:outline-none cursor-pointer"
              >
                {BIMESTRES.map((b) => (
                  <option key={b} value={b}>
                    Regimento: {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* BNCC Skill Validation Badges */}
        <div className="bg-auguste-cream border border-auguste-sand rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-auguste-slate shrink-0" />
            <h3 className="text-sm font-bold text-auguste-slate uppercase tracking-wider">
              Habilidades BNCC Identificadas para {editedMaterial.disciplina} ({editedMaterial.ano}):
            </h3>
          </div>

          {editedMaterial.habilidadesBNCC && editedMaterial.habilidadesBNCC.length > 0 ? (
            <div className="space-y-3">
              {editedMaterial.habilidadesBNCC.map((hab, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-auguste-sand rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                >
                  <span className="px-3 py-1 rounded-lg bg-auguste-slate text-white font-mono text-xs font-bold shrink-0">
                    {hab.codigo}
                  </span>
                  <p className="text-xs sm:text-sm text-auguste-text font-medium">
                    {hab.descricao}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-auguste-muted font-medium">
              Não foi possível identificar uma habilidade BNCC com segurança para este conteúdo.
            </p>
          )}

          {(editedMaterial.unidadeTematica || editedMaterial.objetoConhecimento) && (
            <div className="mt-4 pt-3 border-t border-auguste-sand grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {editedMaterial.unidadeTematica && (
                <div>
                  <span className="font-bold text-auguste-slate">Unidade Temática:</span>{' '}
                  <span className="text-auguste-text">{editedMaterial.unidadeTematica}</span>
                </div>
              )}
              {editedMaterial.objetoConhecimento && (
                <div>
                  <span className="font-bold text-auguste-slate">Objeto de Conhecimento:</span>{' '}
                  <span className="text-auguste-text">{editedMaterial.objetoConhecimento}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scanned Text / OCR Block */}
        {editedMaterial.conteudoEscaneadoOCR && editedMaterial.conteudoEscaneadoOCR.trim().length > 0 && (
          <div className="bg-auguste-cream text-auguste-text rounded-2xl p-5 border border-auguste-sand shadow-2xs transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-auguste-sand">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-auguste-text flex items-center gap-2">
                    <span>Conteúdo Transcrito da Imagem / Apostila (OCR)</span>
                    <span className="text-[10px] bg-amber-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
                      Íntegra Lido
                    </span>
                  </h3>
                  <p className="text-xs text-auguste-muted font-medium">
                    Texto original extraído das páginas ou documentos enviados.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowOcrExpanded(!showOcrExpanded)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-auguste-cream text-auguste-slate text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border border-auguste-sand"
              >
                {showOcrExpanded ? (
                  <>
                    <span>Recolher</span>
                    <ChevronUp className="w-4 h-4 text-auguste-slate" />
                  </>
                ) : (
                  <>
                    <span>Ler mais / Conferir texto</span>
                    <ChevronDown className="w-4 h-4 text-auguste-slate" />
                  </>
                )}
              </button>
            </div>

            {/* Minimized Teaser View */}
            {!showOcrExpanded ? (
              <div className="mt-3 flex items-center justify-between gap-4 text-xs text-auguste-text">
                <p className="line-clamp-2 font-mono bg-white p-3 rounded-xl border border-auguste-sand flex-1 italic text-auguste-muted">
                  "{editedMaterial.conteudoEscaneadoOCR.slice(0, 180)}..."
                </p>
                <button
                  type="button"
                  onClick={() => setShowOcrExpanded(true)}
                  className="text-xs font-bold text-auguste-slate hover:underline shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <span>Ler mais</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* Expanded Full Text View */
              <div className="mt-4 space-y-3 animate-fadeIn">
                <div className="bg-white p-4 rounded-xl border border-auguste-sand max-h-[350px] overflow-y-auto custom-scrollbar">
                  <pre className="whitespace-pre-wrap font-sans text-xs text-auguste-text leading-relaxed font-normal">
                    {editedMaterial.conteudoEscaneadoOCR}
                  </pre>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                  <span className="text-auguste-muted text-[11px]">
                    Total de caracteres lidos: <strong className="text-auguste-slate">{editedMaterial.conteudoEscaneadoOCR.length}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(editedMaterial.conteudoEscaneadoOCR || '');
                        setCopiedOcr(true);
                        setTimeout(() => setCopiedOcr(false), 2000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-auguste-cream text-auguste-text text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-auguste-sand"
                    >
                      {copiedOcr ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Texto Lido</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowOcrExpanded(false)}
                      className="px-3 py-1.5 rounded-lg bg-auguste-slate hover:bg-auguste-slate-dark text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-auguste-sand"
                    >
                      <span>Minimizar</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Mode vs Render Mode */}
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-auguste-slate">Edição do Conteúdo em Markdown:</span>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs font-bold text-auguste-slate hover:underline flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" /> Salvar Edições
              </button>
            </div>
            <textarea
              value={editedMaterial.markdownCompleto}
              onChange={(e) =>
                setEditedMaterial((prev) => ({
                  ...prev,
                  markdownCompleto: e.target.value,
                }))
              }
              rows={16}
              className="w-full bg-auguste-cream border border-auguste-sand font-mono text-xs text-auguste-text rounded-xl p-4 focus:ring-2 focus:ring-auguste-slate focus:bg-white"
            />
          </div>
        ) : editedMaterial.disciplina === 'Educação Física' && !isProva ? (
          <EduFisicaCard material={editedMaterial} />
        ) : (
          <div className="space-y-8">
            {/* Overview Meta Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {editedMaterial.tema && (
                <div className="p-4 rounded-xl bg-auguste-cream border border-auguste-sand">
                  <span className="text-xs font-bold text-auguste-slate uppercase tracking-wider block mb-1">
                    Tema Central
                  </span>
                  <p className="text-sm font-semibold text-auguste-text">
                    {editedMaterial.tema}
                  </p>
                </div>
              )}

              {editedMaterial.tempoEstimado && (
                <div className="p-4 rounded-xl bg-auguste-cream border border-auguste-sand">
                  <span className="text-xs font-bold text-auguste-slate uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-auguste-slate" /> Tempo Estimado
                  </span>
                  <p className="text-sm font-semibold text-auguste-text">
                    {editedMaterial.tempoEstimado}
                  </p>
                </div>
              )}

              {editedMaterial.materiais && editedMaterial.materiais.length > 0 && (
                <div className="p-4 rounded-xl bg-auguste-cream border border-auguste-sand">
                  <span className="text-xs font-bold text-auguste-slate uppercase tracking-wider block mb-1">
                    Materiais Necessários
                  </span>
                  <p className="text-xs text-auguste-text font-medium">
                    {editedMaterial.materiais.join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Objective */}
            {editedMaterial.objetivo && (
              <div className="space-y-2">
                <h3 className="text-base font-bold text-auguste-slate flex items-center gap-2 border-b border-auguste-sand pb-2">
                  <BookOpen className="w-5 h-5 text-auguste-slate" />
                  <span>Objetivo de Aprendizagem</span>
                </h3>
                <p className="text-sm text-auguste-text leading-relaxed bg-auguste-cream p-4 rounded-xl border border-auguste-sand">
                  {editedMaterial.objetivo}
                </p>
              </div>
            )}

            {/* Step-by-Step / Development */}
            {editedMaterial.desenvolvimentoOuPassoAPasso &&
              editedMaterial.desenvolvimentoOuPassoAPasso.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-auguste-slate flex items-center gap-2 border-b border-auguste-sand pb-2">
                    <FileText className="w-5 h-5 text-auguste-slate" />
                    <span>Desenvolvimento / Passo a Passo Pedagógico</span>
                  </h3>
                  <div className="space-y-2.5">
                    {editedMaterial.desenvolvimentoOuPassoAPasso.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-auguste-cream border border-auguste-sand flex items-start gap-3"
                      >
                        <span className="w-6 h-6 rounded-full bg-auguste-slate text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-auguste-text leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Practical Activity Rules / Variations */}
            {editedMaterial.regrasOuProcedimentos &&
              editedMaterial.regrasOuProcedimentos.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-auguste-slate flex items-center gap-2 border-b border-auguste-sand pb-2">
                    <CheckCircle className="w-5 h-5 text-auguste-slate" />
                    <span>Regras, Pontuação e Procedimentos de Segurança</span>
                  </h3>
                  <ul className="list-disc list-inside space-y-1.5 text-sm text-auguste-text bg-auguste-cream p-4 rounded-xl border border-auguste-sand">
                    {editedMaterial.regrasOuProcedimentos.map((regra, idx) => (
                      <li key={idx} className="leading-relaxed">{regra}</li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Variations & Challenges */}
            {editedMaterial.variacoes && editedMaterial.variacoes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-auguste-slate flex items-center gap-2 border-b border-auguste-sand pb-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <span>Variações, Desafios de Intensidade e Inclusão</span>
                </h3>
                <ul className="list-disc list-inside space-y-1.5 text-sm text-amber-950 bg-amber-50 p-4 rounded-xl border border-amber-200">
                  {editedMaterial.variacoes.map((variacao, idx) => (
                    <li key={idx} className="leading-relaxed">{variacao}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Teacher's Pedagogical Tip */}
            {editedMaterial.dicaProfessor && (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-auguste-slate flex items-center gap-2 border-b border-auguste-sand pb-2">
                  <Lightbulb className="w-5 h-5 text-amber-600" />
                  <span>Dica Pedagógica do Professor & Concepções Alternativas</span>
                </h3>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-sm leading-relaxed font-medium">
                  {editedMaterial.dicaProfessor}
                </div>
              </div>
            )}

            {/* Test Questions Render */}
            {editedMaterial.questoes && editedMaterial.questoes.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-auguste-sand pb-3">
                  <h3 className="text-lg font-bold text-auguste-slate flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-auguste-slate" />
                    <span>Questões da Prova ({editedMaterial.questoes.length} questões - Modelo Padrão BNCC)</span>
                  </h3>

                  {/* Toggle Gabarito Separado */}
                  <button
                    type="button"
                    onClick={() => setShowGabarito(!showGabarito)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                      showGabarito
                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                        : 'bg-white border-auguste-sand text-auguste-text hover:bg-auguste-cream'
                    }`}
                  >
                    {showGabarito ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showGabarito ? 'Ocultar Gabarito' : 'Exibir Gabarito Separado'}</span>
                  </button>
                </div>

                {/* Preview Box Container matching School Exam Page */}
                <div className="p-6 rounded-2xl bg-auguste-cream border border-auguste-sand shadow-2xs space-y-6 font-sans text-xs text-auguste-text leading-snug">
                  {editedMaterial.questoes.map((q, qIdx) => (
                    <div
                      key={q.numero || qIdx}
                      className="p-4 rounded-xl bg-white border border-auguste-sand space-y-2"
                    >
                      <div className="flex items-center justify-between border-b border-auguste-sand pb-1">
                        <span className="font-bold text-auguste-text text-xs">
                          {q.numero}. {q.enunciado.replace(/^\d+[\.\)]\s*/, '')}
                        </span>
                        <span className="text-[11px] font-bold text-auguste-slate bg-auguste-cream px-2 py-0.5 rounded border border-auguste-sand">
                          (1,0)
                        </span>
                      </div>

                      {/* Options stacked vertically */}
                      {q.opcoes && q.opcoes.length > 0 && (
                        <div className="pl-3 space-y-1 font-normal text-auguste-text text-xs leading-tight">
                          {q.opcoes.map((op, oIdx) => (
                            <div key={oIdx} className="leading-tight py-0.5">
                              {op}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Dissertative Questions Solid Underline Lines */}
                      {(q.tipo === 'Discursiva' || !q.opcoes || q.opcoes.length === 0) && (
                        <div className="pt-2 pb-1 space-y-2">
                          <div className="border-b border-auguste-sand w-full h-3"></div>
                          <div className="border-b border-auguste-sand w-full h-3"></div>
                          <div className="border-b border-auguste-sand w-full h-3"></div>
                          <div className="border-b border-auguste-sand w-full h-3"></div>
                        </div>
                      )}

                      {/* Answer Key if Show Gabarito active */}
                      {showGabarito && q.respostaGabarito && (
                        <div className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 animate-fadeIn">
                          <span className="font-bold uppercase tracking-wider block mb-0.5 text-[10px] text-amber-800">
                            Gabarito & Critério:
                          </span>
                          <p>{q.respostaGabarito}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Separate Gabarito Block if provided in Prova */}
            {isProva && editedMaterial.gabaritoSeparado && showGabarito && (
              <div className="p-6 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-2 animate-fadeIn">
                <h4 className="font-bold text-base flex items-center gap-2 text-amber-900">
                  <CheckCircle className="w-5 h-5 text-amber-800" />
                  <span>GABARITO SEPARADO E CRITÉRIOS DE CORREÇÃO</span>
                </h4>
                <div className="whitespace-pre-line text-xs font-mono bg-white p-4 rounded-xl border border-amber-200 text-auguste-text">
                  {editedMaterial.gabaritoSeparado}
                </div>
              </div>
            )}

            {/* Assessment / Evaluation */}
            {editedMaterial.avaliacao && (
              <div className="space-y-2 pt-2">
                <h3 className="text-base font-bold text-auguste-slate flex items-center gap-2 border-b border-auguste-sand pb-2">
                  <CheckCircle className="w-5 h-5 text-auguste-slate" />
                  <span>Critérios de Avaliação e Aprendizagem</span>
                </h3>
                <p className="text-sm text-auguste-text bg-auguste-cream p-4 rounded-xl border border-auguste-sand">
                  {editedMaterial.avaliacao}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
