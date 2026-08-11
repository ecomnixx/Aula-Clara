import React, { useState, useRef } from 'react';
import { safeFetchJson, compressImage } from '../utils/api';
import {
  DISCIPLINAS_LIST,
  SEGMENTOS_LIST,
  ANOS_POR_SEGMENTO,
  SAMPLE_PRESETS,
} from '../data/bnccData';
import {
  AttachedFile,
  DisciplinaType,
  GeneratorInput,
  SamplePreset,
  SegmentoType,
  TipoMaterialType,
} from '../types';
import {
  Camera,
  Upload,
  Trash2,
  Monitor,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
  Calendar,
  BookOpen,
  ArrowRight,
  BookMarked,
  X,
  Share2,
  Loader2,
  Activity,
  Trophy,
} from 'lucide-react';

interface GeneratorFormProps {
  input: GeneratorInput;
  setInput: React.Dispatch<React.SetStateAction<GeneratorInput>>;
  onSubmit: (overrideTipo?: TipoMaterialType) => void;
  isLoading: boolean;
  errorMessage: string | null;
}

export const GeneratorForm: React.FC<GeneratorFormProps> = ({
  input,
  setInput,
  onSubmit,
  isLoading,
  errorMessage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isReadingImages, setIsReadingImages] = useState(false);
  const [readingSuccess, setReadingSuccess] = useState(false);
  const [generatingTipo, setGeneratingTipo] = useState<TipoMaterialType | null>(null);

  const handleSelectTipoAndSubmit = (tipo: TipoMaterialType) => {
    setGeneratingTipo(tipo);
    onSubmit(tipo);
  };

  const isAulaActiveLoading =
    isLoading &&
    (generatingTipo === 'Plano de Aula' ||
      generatingTipo === 'Ambas as Possibilidades (Aula + Prova)');

  const isProvaActiveLoading =
    isLoading &&
    (generatingTipo === 'Prova' ||
      generatingTipo === 'Ambas as Possibilidades (Aula + Prova)');

  const isBothActiveLoading =
    isLoading && generatingTipo === 'Ambas as Possibilidades (Aula + Prova)';

  // Handle Segmento change
  const handleSegmentoChange = (newSegmento: SegmentoType) => {
    const validAnos = ANOS_POR_SEGMENTO[newSegmento];
    setInput((prev) => ({
      ...prev,
      segmento: newSegmento,
      ano: validAnos[0] || '1º Ano',
    }));
  };

  // Handle file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = async (fileList: File[]) => {
    const imageFiles = fileList.filter((f) => f.type.startsWith('image/'));

    for (const file of imageFiles) {
      try {
        const { base64, compressedSize } = await compressImage(file, 1600, 1600, 0.8);
        const newAttachedFile: AttachedFile = {
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          size: compressedSize || file.size,
          type: 'image/jpeg',
          previewUrl: URL.createObjectURL(file),
          base64: base64 || '',
        };

        setInput((prev) => ({
          ...prev,
          files: [...prev.files, newAttachedFile],
        }));
      } catch (err) {
        console.error('Erro ao comprimir imagem:', err);
      }
    }
  };

  const clearFiles = () => {
    setInput((prev) => ({
      ...prev,
      files: [],
      texto_ocr: '',
    }));
    setReadingSuccess(false);
  };

  const removeFile = (id: string) => {
    setInput((prev) => ({
      ...prev,
      files: prev.files.filter((f) => f.id !== id),
    }));
  };

  // Real OCR text reading via Gemini API
  const handleReadImages = async () => {
    if (input.files.length === 0 && !input.texto_ocr) {
      alert('Selecione ou tire ao menos uma foto da apostila primeiro!');
      return;
    }

    if (input.files.length === 0) {
      alert('Selecione ao menos uma imagem para digitalizar.');
      return;
    }

    setIsReadingImages(true);
    setReadingSuccess(false);

    try {
      const data = await safeFetchJson('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: input.files.map((f) => ({
            base64: f.base64,
            mimeType: f.type || 'image/jpeg',
          })),
        }),
      });

      const extractedText = data.text || '';

      setInput((prev) => ({
        ...prev,
        texto_ocr: extractedText,
      }));

      setReadingSuccess(true);
    } catch (err: any) {
      console.error('Erro na leitura de imagens:', err);
      alert(
        err.message ||
          'Atenção: Não foi possível processar a imagem via servidor. Certifique-se de que a foto está legível.'
      );
    } finally {
      setIsReadingImages(false);
    }
  };

  const currentAnos = ANOS_POR_SEGMENTO[input.segmento] || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 font-sans">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-auguste-text">
          Professor Lucas, vamos começar!
        </h1>
        <p className="text-auguste-muted text-sm font-medium">
          Cada aula preparada com cuidado faz a diferença na educação do futuro.
        </p>
        <p className="text-xs text-auguste-slate font-extrabold uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-auguste-slate animate-pulse"></span>
          Aula Clara IA • Capture ou selecione o material da apostila.
        </p>
      </div>

      {/* Importação Rápida Callout Card */}
      <div className="bg-white border border-auguste-sand rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-2xs">
        <div className="p-2 bg-auguste-slate text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
          <Share2 className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xs font-black text-auguste-slate uppercase tracking-wider">
            IMPORTAÇÃO RÁPIDA
          </h3>
          <p className="text-xs sm:text-sm font-bold text-auguste-text leading-snug">
            Na Galeria, marque todos os prints da apostila e escolha{' '}
            <span className="text-auguste-slate underline font-extrabold">Compartilhar → Aula Clara</span>.
          </p>
        </div>
      </div>

      {/* JANELA DE SELEÇÃO PREVENTIVA DA DISCIPLINA E SÉRIE */}
      <div className="bg-white border border-auguste-sand rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-auguste-sand/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-auguste-cream text-auguste-slate rounded-xl border border-auguste-sand">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-auguste-slate uppercase tracking-wide">
                Passo 1: Selecionar Disciplina e Turma
              </h2>
              <p className="text-xs text-auguste-muted font-medium">
                Filtre os parâmetros para mapeamento automático com a BNCC
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 bg-auguste-cream text-auguste-slate rounded-full border border-auguste-sand shadow-2xs">
            <Sparkles className="w-3 h-3 text-auguste-tan-dark" />
            Filtro Ativo
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Segmento */}
          <div>
            <label className="block text-[11px] font-black text-auguste-slate uppercase tracking-wider mb-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-auguste-slate" />
              Segmento
            </label>
            <select
              value={input.segmento}
              onChange={(e) => handleSegmentoChange(e.target.value as SegmentoType)}
              className="w-full bg-auguste-cream border border-auguste-sand text-auguste-text rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-auguste-slate focus:border-auguste-slate outline-none cursor-pointer"
            >
              {SEGMENTOS_LIST.map((seg) => (
                <option key={seg} value={seg} className="bg-white text-auguste-text">
                  {seg}
                </option>
              ))}
            </select>
          </div>

          {/* Disciplina */}
          <div>
            <label className="block text-[11px] font-black text-auguste-slate uppercase tracking-wider mb-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-auguste-slate" />
              Disciplina
            </label>
            <select
              value={input.disciplina}
              onChange={(e) =>
                setInput((prev) => ({
                  ...prev,
                  disciplina: e.target.value as DisciplinaType,
                }))
              }
              className="w-full bg-auguste-cream border border-auguste-sand text-auguste-text rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-auguste-slate focus:border-auguste-slate outline-none cursor-pointer"
            >
              {DISCIPLINAS_LIST.map((disc) => (
                <option key={disc} value={disc} className="bg-white text-auguste-text">
                  {disc}
                </option>
              ))}
            </select>
          </div>

          {/* Ano / Série */}
          <div>
            <label className="block text-[11px] font-black text-auguste-slate uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-auguste-slate" />
              Ano / Série
            </label>
            <select
              value={input.ano}
              onChange={(e) => setInput((prev) => ({ ...prev, ano: e.target.value }))}
              className="w-full bg-auguste-cream border border-auguste-sand text-auguste-text rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-auguste-slate focus:border-auguste-slate outline-none cursor-pointer"
            >
              {currentAnos.map((ano) => (
                <option key={ano} value={ano} className="bg-white text-auguste-text">
                  {ano}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Discipline Confirmation Bar */}
        <div className="bg-auguste-cream border border-auguste-sand rounded-xl p-3 flex items-center justify-between text-xs font-bold text-auguste-text">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-auguste-slate shrink-0" />
            <span>
              Disciplina configurada:{' '}
              <strong className="text-auguste-slate underline font-black">
                {input.disciplina}
              </strong>{' '}
              ({input.ano} - {input.segmento})
            </span>
          </div>
          <span className="text-[10px] text-auguste-slate font-extrabold uppercase hidden md:inline">
            Apostila será filtrada para esta disciplina
          </span>
        </div>

        {/* Quantidade de Aulas Selector */}
        <div className="bg-auguste-cream/80 border border-auguste-sand rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-black text-auguste-slate uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-auguste-slate shrink-0" />
              <span>Quantas aulas deseja planejar para este conteúdo?</span>
            </label>
            <span className="text-[11px] font-black text-auguste-slate bg-white px-2.5 py-0.5 rounded-full border border-auguste-sand shadow-2xs">
              {input.quantidadeAulas || 1} {(input.quantidadeAulas || 1) === 1 ? 'Aula' : 'Aulas'}
            </span>
          </div>
          <p className="text-xs text-auguste-muted font-medium">
            Selecione a quantidade de aulas necessária para o gerador estruturar o planejamento pedagógico completo:
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setInput((prev) => ({ ...prev, quantidadeAulas: num }))}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border cursor-pointer ${
                  (input.quantidadeAulas || 1) === num
                    ? 'bg-auguste-slate text-white border-auguste-slate shadow-xs scale-[1.02]'
                    : 'bg-white text-auguste-text border-auguste-sand hover:border-auguste-slate hover:bg-auguste-cream'
                }`}
              >
                {num} {num === 1 ? 'Aula' : 'Aulas'}
              </button>
            ))}
            <div className="flex items-center gap-1.5 bg-white border border-auguste-sand rounded-xl px-3 py-1.5 shadow-2xs">
              <span className="text-xs font-bold text-auguste-muted">Outra:</span>
              <input
                type="number"
                min={1}
                max={20}
                value={input.quantidadeAulas || 1}
                onChange={(e) =>
                  setInput((prev) => ({
                    ...prev,
                    quantidadeAulas: Math.max(1, Math.min(20, parseInt(e.target.value) || 1)),
                  }))
                }
                className="w-12 text-xs font-black text-auguste-slate focus:outline-none bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Educação Física Special Mode Selector */}
        {input.disciplina === 'Educação Física' && (
          <div className="bg-emerald-900/10 border border-emerald-600/30 rounded-2xl p-4 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 font-black text-xs sm:text-sm uppercase tracking-wide">
                <Trophy className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Educação Física — Escolha o Formato da Aula</span>
              </div>
              <span className="text-[10px] bg-emerald-700 text-white font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs">
                Opção Exclusiva
              </span>
            </div>

            <p className="text-xs text-auguste-text font-medium leading-relaxed">
              Para Educação Física, selecione se prefere uma atividade com dinâmicas competitivas de quadra/pátio ou o conteúdo teórico:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setInput((prev) => ({ ...prev, tipoAulaEdFisica: 'Prática' }))}
                className={`p-3.5 rounded-xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${
                  input.tipoAulaEdFisica !== 'Teórica'
                    ? 'bg-emerald-800 text-white border-emerald-700 shadow-xs font-bold'
                    : 'bg-auguste-cream text-auguste-text border-auguste-sand hover:border-emerald-600/50'
                }`}
              >
                <div className="space-y-0.5">
                  <p className={`text-xs font-black flex items-center gap-1.5 ${
                    input.tipoAulaEdFisica !== 'Teórica' ? 'text-white' : 'text-emerald-900'
                  }`}>
                    <Activity className="w-4 h-4 text-amber-300" />
                    <span>🏀 Aula Prática (Dinâmica Competitiva)</span>
                  </p>
                  <p
                    className={`text-[10px] leading-tight ${
                      input.tipoAulaEdFisica !== 'Teórica' ? 'text-emerald-100' : 'text-auguste-muted'
                    }`}
                  >
                    Retorna materiais necessários + passo a passo dinâmico e competitivo para prender a atenção.
                  </p>
                </div>
                {input.tipoAulaEdFisica !== 'Teórica' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0 ml-1" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setInput((prev) => ({ ...prev, tipoAulaEdFisica: 'Teórica' }))}
                className={`p-3.5 rounded-xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${
                  input.tipoAulaEdFisica === 'Teórica'
                    ? 'bg-emerald-800 text-white border-emerald-700 shadow-xs font-bold'
                    : 'bg-auguste-cream text-auguste-text border-auguste-sand hover:border-emerald-600/50'
                }`}
              >
                <div className="space-y-0.5">
                  <p className={`text-xs font-black flex items-center gap-1.5 ${
                    input.tipoAulaEdFisica === 'Teórica' ? 'text-white' : 'text-emerald-900'
                  }`}>
                    <BookOpen className="w-4 h-4 text-emerald-300" />
                    <span>📖 Aula Teórica (Regras & BNCC)</span>
                  </p>
                  <p
                    className={`text-[10px] leading-tight ${
                      input.tipoAulaEdFisica === 'Teórica' ? 'text-emerald-100' : 'text-auguste-muted'
                    }`}
                  >
                    Foco em regras esportivas, anatomia, saúde e conceitos pedagógicos BNCC.
                  </p>
                </div>
                {input.tipoAulaEdFisica === 'Teórica' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0 ml-1" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Camera Box */}
      <div className="bg-white border border-auguste-sand rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-xs">
        {/* Large Blue Camera Icon */}
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto flex items-center justify-center">
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-xs"
          >
            {/* Camera Body */}
            <rect x="20" y="50" width="160" height="120" rx="28" fill="#2b3648" />
            <path
              d="M 65 50 L 80 30 C 83 25 88 22 95 22 L 105 22 C 112 22 117 25 120 30 L 135 50 Z"
              fill="#2b3648"
            />
            {/* Outer Lens Circle */}
            <circle cx="100" cy="110" r="42" fill="#f4f1ea" stroke="#d5cebe" strokeWidth="4" />
            {/* Inner Lens */}
            <circle cx="100" cy="110" r="28" fill="#2b3648" />
            {/* Flash Lens Dot */}
            <circle cx="150" cy="72" r="8" fill="#c2b8a3" />
          </svg>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
          {/* Abrir câmera */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="py-3 px-4 bg-auguste-cream hover:bg-auguste-cream-dark border border-auguste-sand text-auguste-text font-extrabold text-sm rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer hover:border-auguste-slate"
          >
            <Camera className="w-4 h-4 text-auguste-slate" />
            <span>Abrir câmera</span>
          </button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Escolher arquivos */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-3 px-4 bg-auguste-cream hover:bg-auguste-cream-dark border border-auguste-sand text-auguste-text font-extrabold text-sm rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer hover:border-auguste-slate"
          >
            <Upload className="w-4 h-4 text-auguste-slate" />
            <span>Escolher arquivos</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Limpar material lido */}
          <button
            type="button"
            onClick={clearFiles}
            className="py-3 px-4 bg-auguste-cream hover:bg-rose-50 border border-auguste-sand text-auguste-muted hover:text-rose-600 font-extrabold text-sm rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-auguste-muted" />
            <span>Limpar material lido</span>
          </button>

          {/* Capturar a tela inteira */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-3 px-4 bg-auguste-slate hover:bg-auguste-slate-dark text-white font-extrabold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-auguste-tan" />
            <span>Capturar a tela inteira</span>
          </button>
        </div>

        {/* Selected Images Counter Label */}
        <div className="text-center pt-2">
          {input.files.length === 0 ? (
            <p className="text-xs font-bold text-auguste-muted">Nenhuma imagem selecionada</p>
          ) : (
            <p className="text-xs font-black text-auguste-slate bg-auguste-cream inline-block px-3.5 py-1 rounded-full border border-auguste-sand shadow-2xs">
              ✓ {input.files.length} imagem(ns) selecionada(s) para leitura
            </p>
          )}
        </div>

        {/* Thumbnail previews */}
        {input.files.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {input.files.map((f) => (
              <div key={f.id} className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-auguste-slate shadow-2xs">
                <img src={f.previewUrl} alt={f.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeFile(f.id)}
                  className="absolute top-0.5 right-0.5 bg-rose-600 text-white p-0.5 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Button: Ler imagens */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleReadImages}
            disabled={isReadingImages}
            className="w-full py-3.5 bg-auguste-slate hover:bg-auguste-slate-dark active:scale-[0.99] text-white font-extrabold text-base rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isReadingImages ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Lendo texto das imagens da apostila via IA...</span>
              </>
            ) : (
              <span>Ler imagens</span>
            )}
          </button>
        </div>
      </div>

      {/* Result Section: Texto Identificado */}
      <div className="bg-white rounded-2xl p-5 border border-auguste-sand shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-auguste-slate uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-auguste-slate" />
            <span>Texto identificado da Imagem / Apostila</span>
          </h3>
          {input.texto_ocr && input.texto_ocr.trim().length > 0 && (
            <span className="text-[11px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Digitalizado na Íntegra ({input.texto_ocr.length} caracteres)</span>
            </span>
          )}
        </div>

        <p className="text-xs text-auguste-muted font-medium">
          Abaixo está o conteúdo palavra por palavra extraído das fotos enviadas pelo botão "Ler imagens".
        </p>

        <textarea
          value={input.texto_ocr}
          onChange={(e) => setInput((prev) => ({ ...prev, texto_ocr: e.target.value }))}
          rows={7}
          placeholder="O texto digitalizado da apostila aparecerá aqui na íntegra logo após clicar em 'Ler imagens'..."
          className="w-full p-3.5 bg-auguste-cream border border-auguste-sand rounded-xl text-xs font-mono leading-relaxed text-auguste-text placeholder-auguste-muted/70 focus:bg-white focus:ring-2 focus:ring-auguste-slate focus:border-auguste-slate outline-none resize-y shadow-inner"
        />

        {input.texto_ocr && input.texto_ocr.trim().length > 0 && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(input.texto_ocr);
                alert('Texto transcrito copiado para a área de transferência!');
              }}
              className="px-3 py-1.5 bg-auguste-slate hover:bg-auguste-slate-dark text-white text-xs font-bold rounded-lg transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <span>Copiar Texto Transcrito</span>
            </button>
          </div>
        )}
      </div>

      {/* Result Section: Classificação Curricular */}
      <div className="bg-white rounded-2xl p-5 border border-auguste-sand shadow-xs space-y-2">
        <h3 className="text-sm font-extrabold text-auguste-slate uppercase tracking-wider flex items-center gap-2">
          <BookMarked className="w-4 h-4 text-auguste-slate" />
          CLASSIFICAÇÃO CURRICULAR
        </h3>
        <div className="p-3 bg-auguste-cream border border-auguste-sand rounded-xl text-xs text-auguste-text font-medium leading-relaxed">
          {readingSuccess || input.texto_ocr ? (
            <div className="space-y-1 text-auguste-text">
              <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                Mapeado com sucesso para a BNCC Oficial:
              </p>
              <p>
                <strong className="text-auguste-slate">Disciplina:</strong> {input.disciplina} |{' '}
                <strong className="text-auguste-slate">Ano:</strong> {input.ano} ({input.segmento})
              </p>
              <p className="text-auguste-muted italic">
                Pronto para gerar Plano de Aula e Prova com 5 Múltipla Escolha (A, B, C, D, E) e 5 Dissertativas!
              </p>
            </div>
          ) : (
            <p className="text-auguste-muted">
              A classificação aparecerá aqui após a leitura do material.
            </p>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-sm flex items-start gap-3 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Atenção na Validação BNCC:</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* 2 Primary Choice Buttons for Professor: Gerar Aula or Gerar Prova */}
      <div className="space-y-4 pt-2">
        {/* Loading Indicator Card */}
        {isLoading && (
          <div className="p-6 rounded-2xl bg-auguste-slate text-white border border-auguste-slate-dark shadow-md flex flex-col items-center text-center space-y-3 animate-pulse">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-auguste-tan" />
              <span className="text-base sm:text-lg font-black tracking-wide text-white">
                {generatingTipo === 'Plano de Aula'
                  ? 'Gerando Plano de Aula...'
                  : generatingTipo === 'Prova'
                  ? 'Gerando Prova Completa...'
                  : 'Gerando Material Pedagógico...'}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-auguste-tan-light max-w-lg leading-relaxed">
              {generatingTipo === 'Plano de Aula'
                ? `Processando o conteúdo para criar a sequência didática completa e objetivos alinhados à BNCC para ${input.disciplina} (${input.ano}).`
                : generatingTipo === 'Prova'
                ? `Elaborando 10 questões alinhadas à BNCC (5 Múltipla Escolha A, B, C, D, E + 5 Dissertativas com Gabarito) para ${input.disciplina} (${input.ano}).`
                : `Processando o texto lido, montando a sequência de aula e a Prova com 10 questões alinhadas à BNCC.`}
            </p>
            <div className="w-full bg-auguste-slate-dark h-2 rounded-full overflow-hidden max-w-md border border-auguste-sand/30">
              <div className="bg-auguste-tan h-full w-2/3 rounded-full animate-bounce" />
            </div>
          </div>
        )}

        <p className="text-xs font-black text-auguste-slate uppercase tracking-wider text-center">
          Escolha o material a ser gerado para este conteúdo:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Button 1: Gerar Aula */}
          <button
            type="button"
            onClick={() => handleSelectTipoAndSubmit('Plano de Aula')}
            disabled={isLoading}
            className={`p-5 rounded-2xl border text-left transition-all shadow-xs flex flex-col justify-between cursor-pointer group ${
              isAulaActiveLoading
                ? 'bg-auguste-slate text-white border-auguste-slate-dark ring-2 ring-auguste-slate/40'
                : isLoading
                ? 'bg-auguste-cream text-auguste-muted border-auguste-sand opacity-40 cursor-not-allowed'
                : 'bg-white text-auguste-text border-auguste-sand hover:bg-auguste-cream hover:border-auguste-slate hover:shadow-sm active:scale-[0.99]'
            }`}
          >
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-xl bg-auguste-cream border border-auguste-sand text-auguste-slate flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                {isAulaActiveLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-auguste-slate" />
                ) : (
                  <BookOpen className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-black text-auguste-text group-hover:text-auguste-slate flex items-center gap-2">
                  <span>Gerar Aula</span>
                  {isAulaActiveLoading && <Loader2 className="w-4 h-4 animate-spin text-auguste-slate" />}
                </h3>
                <p className="text-xs text-auguste-muted font-medium leading-relaxed mt-1">
                  Sequência didática rápida, plano de aula completo e objetivos alinhados à BNCC.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-auguste-sand/60 flex items-center justify-between text-xs font-black text-auguste-slate">
              <span>{isAulaActiveLoading ? 'Gerando Plano de Aula...' : 'Aulas Rápida + Sequência'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Button 2: Gerar Provas */}
          <button
            type="button"
            onClick={() => handleSelectTipoAndSubmit('Prova')}
            disabled={isLoading}
            className={`p-5 rounded-2xl border text-left transition-all shadow-xs flex flex-col justify-between cursor-pointer group ${
              isProvaActiveLoading
                ? 'bg-auguste-slate text-white border-auguste-slate-dark ring-2 ring-auguste-slate/40'
                : isLoading
                ? 'bg-auguste-cream text-auguste-muted border-auguste-sand opacity-40 cursor-not-allowed'
                : 'bg-white text-auguste-text border-auguste-sand hover:bg-auguste-cream hover:border-auguste-slate hover:shadow-sm active:scale-[0.99]'
            }`}
          >
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-xl bg-auguste-cream border border-auguste-sand text-auguste-slate flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                {isProvaActiveLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-auguste-slate" />
                ) : (
                  <FileText className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-black text-auguste-text group-hover:text-auguste-slate flex items-center gap-2">
                  <span>Gerar Prova</span>
                  {isProvaActiveLoading && <Loader2 className="w-4 h-4 animate-spin text-auguste-slate" />}
                </h3>
                <p className="text-xs text-auguste-muted font-medium leading-relaxed mt-1">
                  10 questões no total: 5 Múltipla Escolha (A, B, C, D, E) + 5 Dissertativas com gabarito.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-auguste-sand/60 flex items-center justify-between text-xs font-black text-auguste-slate">
              <span>{isProvaActiveLoading ? 'Gerando Prova...' : '5 M/E (A,B,C,D,E) + 5 Dissertativas'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Both possibilities button */}
        <button
          type="button"
          onClick={() => handleSelectTipoAndSubmit('Ambas as Possibilidades (Aula + Prova)')}
          disabled={isLoading}
          className={`w-full py-3.5 px-4 bg-auguste-slate hover:bg-auguste-slate-dark text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-xs border border-auguste-slate-dark flex items-center justify-center gap-2 cursor-pointer mt-2 ${
            isLoading ? 'opacity-80 cursor-not-allowed' : ''
          }`}
        >
          {isBothActiveLoading ? (
            <Loader2 className="w-5 h-5 text-auguste-tan animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-auguste-tan animate-pulse" />
          )}
          <span>
            {isBothActiveLoading
              ? 'Processando Aula + Prova (Aguarde...)'
              : isLoading
              ? 'Processando material selecionado...'
              : 'Ou clique aqui para Gerar Ambas as Possibilidades (Aula + Prova Completa)'}
          </span>
        </button>
      </div>
    </div>
  );
};
