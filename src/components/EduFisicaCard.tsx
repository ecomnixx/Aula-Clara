import React from 'react';
import { MaterialResultData } from '../types';
import { TacticalCourtDiagram } from './TacticalCourtDiagram';

interface EduFisicaCardProps {
  material: MaterialResultData;
}

export const EduFisicaCard: React.FC<EduFisicaCardProps> = ({ material }) => {
  // Extract parameters or fallback to default Physical Education values matching the reference model
  const alunos = material.numAlunos || '16–30';
  const materiaisText =
    material.materiais && material.materiais.length > 0
      ? material.materiais.join(', ')
      : 'Bolas, Cones, Coletes';
  const espaco = material.espaco || 'Quadra / Meia Quadra';
  const duracao = material.tempoEstimado || '15–20 min';
  const nivel = material.nivel || 'Intermediário';
  const formacao = material.formacao || '2 Equipes';

  const objetivoText =
    material.objetivo ||
    'Desenvolver precisão, velocidade de reação, estratégia coletiva e ocupação de espaço no jogo.';

  const organizacaoText =
    material.organizacao ||
    (material.desenvolvimentoOuPassoAPasso && material.desenvolvimentoOuPassoAPasso[0]) ||
    'Divida a turma em duas equipes iguais. Monte duas bases com quatro cones em cada fundo da quadra. Cada equipe inicia posisionada em seu respectivo campo.';

  const passos =
    material.desenvolvimentoOuPassoAPasso && material.desenvolvimentoOuPassoAPasso.length > 0
      ? material.desenvolvimentoOuPassoAPasso
      : [
          'Cada equipe tenta acertar os adversários arremessando a bola.',
          'O aluno queimado vai para a base do time adversário (área do queimado).',
          'Ele retorna ao jogo principal quando um colega acerta um passe direto para a base.',
          'Vence a equipe que deixar todos os adversários presos ou tiver mais jogadores livres.',
        ];

  const variacoesText =
    material.variacoes && material.variacoes.length > 0
      ? material.variacoes.join(' ')
      : 'Use duas bolas simultaneamente ou diminua o tamanho das bases para aumentar a dificuldade tática.';

  const dicaProfessorText =
    material.dicaProfessor ||
    'Não permita arremessos direcionados ao rosto. Incentive a troca rápida de passes entre os alunos antes do arremesso final.';

  return (
    <div className="bg-white rounded-3xl border border-auguste-sand shadow-md overflow-hidden font-sans text-auguste-text transition-all">
      {/* Top Header Banner matching Auguste Light Theme */}
      <div className="relative bg-auguste-slate text-white p-4 sm:p-6 overflow-hidden border-b border-auguste-sand">
        {/* Top Header Accent Curve */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-white text-auguste-slate font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-full shadow-2xs">
              AULA PRÁTICA
            </div>
            <span className="text-xs sm:text-sm font-extrabold tracking-wider text-auguste-sand uppercase">
              Educação Física • Atividade de Quadra
            </span>
          </div>

          <div className="text-right text-[11px] sm:text-xs text-slate-300 font-medium">
            <span>Material autoral para planejamento de aulas</span>
          </div>
        </div>

        {/* Main Title Banner */}
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-tight">
            {material.titulo || 'QUEIMADA DAS BASES'}
          </h1>
          <span className="text-xs font-mono font-black text-white uppercase bg-white/10 border border-white/20 px-3 py-1 rounded-lg">
            ATIVIDADE 01
          </span>
        </div>
      </div>

      {/* Quick Parameter Pills Bar (6 Columns) */}
      <div className="bg-auguste-cream p-3 sm:p-4 border-b border-auguste-sand">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 text-center">
          {/* Alunos Pill */}
          <div className="bg-white border border-auguste-sand rounded-xl overflow-hidden shadow-2xs flex flex-col justify-between">
            <div className="p-2 pt-2.5">
              <span className="text-xs font-black text-auguste-slate block">P</span>
              <strong className="text-xs font-extrabold text-auguste-text block mt-0.5">
                {alunos}
              </strong>
            </div>
            <div className="bg-auguste-slate text-white text-[10px] font-black uppercase py-0.5 tracking-wider">
              ALUNOS
            </div>
          </div>

          {/* Materiais Pill */}
          <div className="bg-white border border-auguste-sand rounded-xl overflow-hidden shadow-2xs flex flex-col justify-between">
            <div className="p-2 pt-2.5">
              <span className="text-xs font-black text-auguste-slate block">B</span>
              <strong className="text-[11px] font-extrabold text-auguste-text block mt-0.5 line-clamp-1">
                {materiaisText}
              </strong>
            </div>
            <div className="bg-auguste-slate text-white text-[10px] font-black uppercase py-0.5 tracking-wider">
              MATERIAIS
            </div>
          </div>

          {/* Espaço Pill */}
          <div className="bg-white border border-auguste-sand rounded-xl overflow-hidden shadow-2xs flex flex-col justify-between">
            <div className="p-2 pt-2.5">
              <span className="text-xs font-black text-auguste-slate block">Q</span>
              <strong className="text-[11px] font-extrabold text-auguste-text block mt-0.5 line-clamp-1">
                {espaco}
              </strong>
            </div>
            <div className="bg-auguste-slate text-white text-[10px] font-black uppercase py-0.5 tracking-wider">
              ESPAÇO
            </div>
          </div>

          {/* Duração Pill */}
          <div className="bg-white border border-auguste-sand rounded-xl overflow-hidden shadow-2xs flex flex-col justify-between">
            <div className="p-2 pt-2.5">
              <span className="text-xs font-black text-auguste-slate block">T</span>
              <strong className="text-xs font-extrabold text-auguste-text block mt-0.5">
                {duracao}
              </strong>
            </div>
            <div className="bg-auguste-slate text-white text-[10px] font-black uppercase py-0.5 tracking-wider">
              DURAÇÃO
            </div>
          </div>

          {/* Nível Pill */}
          <div className="bg-white border border-auguste-sand rounded-xl overflow-hidden shadow-2xs flex flex-col justify-between">
            <div className="p-2 pt-2.5">
              <span className="text-xs font-black text-auguste-slate block">N</span>
              <strong className="text-xs font-extrabold text-auguste-text block mt-0.5">
                {nivel}
              </strong>
            </div>
            <div className="bg-auguste-slate text-white text-[10px] font-black uppercase py-0.5 tracking-wider">
              NÍVEL
            </div>
          </div>

          {/* Formação Pill */}
          <div className="bg-white border border-auguste-sand rounded-xl overflow-hidden shadow-2xs flex flex-col justify-between">
            <div className="p-2 pt-2.5">
              <span className="text-xs font-black text-auguste-slate block">E</span>
              <strong className="text-xs font-extrabold text-auguste-text block mt-0.5">
                {formacao}
              </strong>
            </div>
            <div className="bg-auguste-slate text-white text-[10px] font-black uppercase py-0.5 tracking-wider">
              FORMAÇÃO
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content Area */}
      <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white">
        {/* Left Column (7/12) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card 1: OBJETIVO */}
          <div className="space-y-1.5">
            <div className="bg-auguste-slate text-white text-xs font-black px-4 py-1.5 rounded-xl inline-block uppercase tracking-wider shadow-2xs">
              OBJETIVO
            </div>
            <div className="bg-auguste-cream border border-auguste-sand rounded-2xl p-4 text-xs font-medium leading-relaxed text-auguste-text">
              {objetivoText}
            </div>
          </div>

          {/* Card 2: ORGANIZAÇÃO */}
          <div className="space-y-1.5">
            <div className="bg-auguste-slate text-white text-xs font-black px-4 py-1.5 rounded-xl inline-block uppercase tracking-wider shadow-2xs">
              ORGANIZAÇÃO
            </div>
            <div className="bg-auguste-cream border border-auguste-sand rounded-2xl p-4 text-xs font-medium leading-relaxed text-auguste-text">
              {organizacaoText}
            </div>
          </div>

          {/* Card 3: COMO FAZER */}
          <div className="space-y-2">
            <div className="bg-auguste-slate text-white text-xs font-black px-4 py-1.5 rounded-xl inline-block uppercase tracking-wider shadow-2xs">
              COMO FAZER
            </div>
            <div className="bg-auguste-cream border border-auguste-sand rounded-2xl p-4 space-y-2.5">
              {passos.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-auguste-slate text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs font-medium text-auguste-text leading-relaxed">
                    {step.replace(/^\d+[\.\)]\s*/, '')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: VARIAÇÃO */}
          <div className="space-y-1.5">
            <div className="bg-auguste-slate text-white text-xs font-black px-4 py-1.5 rounded-xl inline-block uppercase tracking-wider shadow-2xs">
              VARIAÇÃO
            </div>
            <div className="bg-auguste-cream border border-auguste-sand rounded-2xl p-4 text-xs font-medium leading-relaxed text-auguste-text">
              {variacoesText}
            </div>
          </div>

          {/* Card 5: DICA DO PROFESSOR */}
          <div className="space-y-1.5">
            <div className="bg-amber-600 text-white text-xs font-black px-4 py-1.5 rounded-xl inline-block uppercase tracking-wider shadow-2xs">
              DICA DO PROFESSOR
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs font-medium leading-relaxed text-amber-950">
              {dicaProfessorText}
            </div>
          </div>
        </div>

        {/* Right Column (5/12): Tactical Court Diagram */}
        <div className="lg:col-span-5 h-full">
          <TacticalCourtDiagram
            tipoQuadra={material.tipoQuadra}
            nomeAtividade={material.titulo}
          />
        </div>
      </div>
    </div>
  );
};
