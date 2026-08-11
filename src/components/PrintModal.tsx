import React, { useState } from 'react';
import { MaterialResultData } from '../types';
import { EduFisicaCard } from './EduFisicaCard';
import { X, Printer, Check } from 'lucide-react';

interface PrintModalProps {
  material: MaterialResultData;
  includeGabaritoDefault: boolean;
  onClose: () => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  material,
  includeGabaritoDefault,
  onClose,
}) => {
  const [nomeEscola, setNomeEscola] = useState(() => {
    if (material.colegio) return material.colegio.toUpperCase();
    try {
      const saved = localStorage.getItem('aula_clara_google_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.school) return parsed.school.toUpperCase();
      }
    } catch (e) {
      console.error(e);
    }
    return 'ESCOLA / COLÉGIO';
  });
  const [tipoAvaliacao, setTipoAvaliacao] = useState('AVALIAÇÃO BIMESTRAL DE RECUPERAÇÃO');
  const [nomeProfessor, setNomeProfessor] = useState(() => {
    try {
      const saved = localStorage.getItem('aula_clara_google_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) return parsed.name.toUpperCase();
      }
    } catch (e) {
      console.error(e);
    }
    return 'PROFESSOR(A)';
  });
  const [bimestre, setBimestre] = useState('2º BIMESTRE');
  const [anoLetivo, setAnoLetivo] = useState('2026');
  const [turma, setTurma] = useState(material.ano || '7º ANO');
  const [includeGabarito, setIncludeGabarito] = useState(includeGabaritoDefault);

  const handlePrint = () => {
    window.print();
  };

  const isProva = material.tipo === 'Prova' || !!material.questoes?.length;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white border border-auguste-sand rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-xl overflow-hidden my-auto print:max-h-none print:shadow-none print:rounded-none print:w-full print:border-none print:bg-white">
        {/* Modal Header */}
        <div className="bg-auguste-slate text-white p-4 flex items-center justify-between border-b border-auguste-sand shrink-0 print:hidden">
          <div className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-white" />
            <h3 className="font-bold text-sm sm:text-base text-white">Impressão de Prova Escolar (Modelo Padrão BNCC)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Options Configuration */}
        <div className="p-4 bg-auguste-cream border-b border-auguste-sand grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs shrink-0 print:hidden">
          <div>
            <label className="font-bold text-auguste-slate block mb-1">Nome da Escola:</label>
            <input
              type="text"
              value={nomeEscola}
              onChange={(e) => setNomeEscola(e.target.value)}
              className="w-full bg-white border border-auguste-sand rounded-lg p-2 font-medium text-auguste-text focus:border-auguste-slate focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-auguste-slate block mb-1">Título da Prova:</label>
            <input
              type="text"
              value={tipoAvaliacao}
              onChange={(e) => setTipoAvaliacao(e.target.value)}
              className="w-full bg-white border border-auguste-sand rounded-lg p-2 font-medium text-auguste-text focus:border-auguste-slate focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-auguste-slate block mb-1">Nome do Professor(a):</label>
            <input
              type="text"
              value={nomeProfessor}
              onChange={(e) => setNomeProfessor(e.target.value)}
              className="w-full bg-white border border-auguste-sand rounded-lg p-2 font-medium text-auguste-text focus:border-auguste-slate focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-auguste-slate block mb-1">Bimestre / Ano:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={bimestre}
                onChange={(e) => setBimestre(e.target.value)}
                className="w-1/2 bg-white border border-auguste-sand rounded-lg p-2 font-medium text-auguste-text focus:border-auguste-slate focus:outline-none"
              />
              <input
                type="text"
                value={anoLetivo}
                onChange={(e) => setAnoLetivo(e.target.value)}
                className="w-1/2 bg-white border border-auguste-sand rounded-lg p-2 font-medium text-auguste-text focus:border-auguste-slate focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-auguste-slate block mb-1">Turma:</label>
            <input
              type="text"
              value={turma}
              onChange={(e) => setTurma(e.target.value)}
              className="w-full bg-white border border-auguste-sand rounded-lg p-2 font-medium text-auguste-text focus:border-auguste-slate focus:outline-none"
            />
          </div>

          {isProva && (
            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="includeGabaritoCheck"
                checked={includeGabarito}
                onChange={(e) => setIncludeGabarito(e.target.checked)}
                className="rounded border-auguste-sand text-auguste-slate focus:ring-auguste-slate w-4 h-4 cursor-pointer"
              />
              <label htmlFor="includeGabaritoCheck" className="font-bold text-auguste-text cursor-pointer text-xs">
                Incluir Gabarito no Final
              </label>
            </div>
          )}
        </div>

        {/* Action Button Bar */}
        <div className="p-3 bg-white border-b border-auguste-sand flex justify-end gap-2 shrink-0 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-auguste-sand text-xs font-bold text-auguste-text hover:bg-auguste-cream"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-auguste-slate hover:bg-auguste-slate-dark text-white text-xs font-bold shadow-2xs flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Agora</span>
          </button>
        </div>

        {/* Printable Paper Document Preview (Exact Replica of Screenshots) */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-200 text-slate-900 print:bg-white print:p-0 print:overflow-visible">
          {material.disciplina === 'Educação Física' && !isProva ? (
            <div className="max-w-4xl mx-auto">
              <EduFisicaCard material={material} />
            </div>
          ) : (
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-3xl mx-auto border border-slate-300 space-y-4 print:shadow-none print:border-none print:p-0 print:max-w-none text-slate-900 font-sans text-xs leading-snug">
            
            {/* Header Box (Grid Table) */}
            <div className="border-2 border-slate-900 bg-white font-sans text-slate-900 text-xs">
              {/* Top Logo and Title Section */}
              <div className="grid grid-cols-12 border-b-2 border-slate-900">
                {/* Top Left Logo Area */}
                <div className="col-span-3 border-r-2 border-slate-900 p-2 flex flex-col items-center justify-center bg-white text-center">
                  <div className="w-auto h-12 px-2 rounded-xl border-2 border-orange-500 bg-white flex flex-col items-center justify-center p-0.5">
                    <span className="font-black text-[9px] text-orange-600 leading-tight uppercase text-center truncate max-w-[100px]">
                      {nomeEscola}
                    </span>
                  </div>
                </div>

                {/* Top Main Title Box */}
                <div className="col-span-9 p-3 flex items-center justify-center text-center">
                  <h1 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900">
                    {tipoAvaliacao}
                  </h1>
                </div>
              </div>

              {/* Subtable Row 1 */}
              <div className="grid grid-cols-12 border-b border-slate-900 font-bold text-[11px] uppercase">
                <div className="col-span-5 p-1.5 border-r border-slate-900">
                  <span className="text-slate-600 font-normal">DISCIPLINA:</span> {material.disciplina}
                </div>
                <div className="col-span-4 p-1.5 border-r border-slate-900 text-center">
                  {bimestre}
                </div>
                <div className="col-span-3 p-1.5 text-center">
                  ANO: {anoLetivo}
                </div>
              </div>

              {/* Subtable Row 2 */}
              <div className="grid grid-cols-12 border-b border-slate-900 font-bold text-[11px] uppercase">
                <div className="col-span-9 p-1.5 border-r border-slate-900">
                  <span className="text-slate-600 font-normal">NOME:</span> ____________________________________
                </div>
                <div className="col-span-3 p-1.5 text-center">
                  <span className="text-slate-600 font-normal">Nº:</span> ____
                </div>
              </div>

              {/* Subtable Row 3 */}
              <div className="grid grid-cols-12 font-bold text-[11px] uppercase">
                <div className="col-span-6 p-1.5 border-r border-slate-900">
                  <span className="text-slate-600 font-normal">PROFESSOR (A):</span> {nomeProfessor}
                </div>
                <div className="col-span-3 p-1.5 border-r border-slate-900 text-center">
                  <span className="text-slate-600 font-normal">TURMA:</span> {turma}
                </div>
                <div className="col-span-3 p-1.5 text-center">
                  <span className="text-slate-600 font-normal">NOTA:</span> ________
                </div>
              </div>
            </div>

            {/* ORIENTAÇÕES Box */}
            <div className="border border-slate-900 p-3 bg-white space-y-1.5 text-xs">
              <h2 className="font-bold uppercase tracking-wider text-slate-900 text-[11px]">
                ORIENTAÇÕES:
              </h2>
              <ul className="space-y-0.5 text-[11px] font-medium text-slate-800 leading-tight">
                <li className="flex items-start gap-1">
                  <span className="text-slate-900 font-bold">✓</span>
                  <span>Leia a prova inteira antes de começar a responder às questões.</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-slate-900 font-bold">✓</span>
                  <span>O gabarito deve ser preenchido a caneta.</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-slate-900 font-bold">✓</span>
                  <span>Os testes não podem ser rasurados, pois isso os invalida.</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-slate-900 font-bold">✓</span>
                  <span>Não é permitido o uso de aparelhos celulares ou qualquer outro tipo de aparelho eletrônico.</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-slate-900 font-bold">✓</span>
                  <span>Não é permitido o empréstimo de qualquer material: lápis, borracha etc.</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-slate-900 font-bold">✓</span>
                  <span>A prova terá duração de 50 minutos.</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-slate-900 font-bold">✓</span>
                  <span>Preencha as bolhas, na folha de respostas.</span>
                </li>
              </ul>

              {/* Bubble marking instruction bar */}
              <div className="mt-2 border border-slate-800 p-1.5 text-center bg-slate-50 flex items-center justify-center gap-4 text-[10px] font-bold">
                <span>MARQUE ASSIM: <span className="inline-block w-3.5 h-3.5 rounded-full bg-slate-900 text-white text-[8px] leading-3 text-center">●</span></span>
                <span>NÃO MARQUE ASSIM: <span className="inline-block px-1 border border-slate-400 rounded text-[9px]">✕</span> <span className="inline-block px-1 border border-slate-400 rounded text-[9px]">✓</span> <span className="inline-block px-1 border border-slate-400 rounded text-[9px]">⊙</span></span>
              </div>
            </div>

            {/* Observações do Professor */}
            <div className="text-xs font-semibold text-slate-800 pt-1">
              <p className="mb-1">Observações do Professor:</p>
              <div className="border-b border-slate-400 w-full h-2"></div>
            </div>

            {/* Gabarito Folha de Respostas (1 to 5) */}
            <div className="p-3 border border-slate-800 bg-white text-center space-y-2">
              <p className="font-bold text-xs text-slate-900">Complete o gabarito abaixo.</p>
              <div className="inline-block border border-slate-300 rounded p-2 bg-slate-50 font-sans text-xs">
                <div className="space-y-1.5">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <div key={num} className="flex items-center justify-center gap-3 font-bold text-slate-800">
                      <span className="w-3 text-right">{num}</span>
                      {['A', 'B', 'C', 'D', 'E'].map((letter) => (
                        <span
                          key={letter}
                          className="w-5 h-5 rounded-full border border-slate-800 flex items-center justify-center text-[10px] font-bold bg-white text-slate-900"
                        >
                          {letter}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Test Questions (Single Line Spacing, Exact Margins) */}
            {material.questoes && material.questoes.length > 0 && (
              <div className="space-y-4 pt-2 font-sans text-xs text-slate-900 leading-snug">
                {material.questoes.map((q, qIdx) => (
                  <div key={q.numero || qIdx} className="space-y-1.5 print:break-inside-avoid">
                    {/* Enunciado + (1,0) */}
                    <div className="font-normal text-slate-900 leading-tight">
                      <span className="font-semibold">{q.numero}. {q.enunciado.replace(/^\d+[\.\)]\s*/, '')}</span>
                      <div className="font-medium text-slate-700 text-[11px] mt-0.5">(1,0)</div>
                    </div>

                    {/* Options if Multiple Choice */}
                    {q.opcoes && q.opcoes.length > 0 && (
                      <div className="pl-3 space-y-1 font-normal text-slate-800 text-xs leading-tight">
                        {q.opcoes.map((op, oIdx) => (
                          <div key={oIdx} className="leading-tight">
                            {op}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Dissertative Questions Solid Underline Lines */}
                    {(q.tipo === 'Discursiva' || !q.opcoes || q.opcoes.length === 0) && (
                      <div className="pt-2 pb-1 space-y-2">
                        <div className="border-b border-slate-400 w-full h-3"></div>
                        <div className="border-b border-slate-400 w-full h-3"></div>
                        <div className="border-b border-slate-400 w-full h-3"></div>
                        <div className="border-b border-slate-400 w-full h-3"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Gabarito Separado (Printed only if checked) */}
            {isProva && includeGabarito && (
              <div className="pt-6 border-t-2 border-dashed border-slate-400 font-sans text-xs space-y-2 print:break-before-page">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900">
                  --- GABARITO SEPARADO E CRITÉRIOS DE CORREÇÃO ---
                </h3>
                {material.gabaritoSeparado ? (
                  <p className="whitespace-pre-line font-mono bg-slate-50 p-4 rounded border border-slate-200">
                    {material.gabaritoSeparado}
                  </p>
                ) : (
                  <div className="space-y-1">
                    {material.questoes?.map((q) => (
                      <p key={q.numero}>
                        <strong>Questão {q.numero}:</strong> {q.respostaGabarito}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

