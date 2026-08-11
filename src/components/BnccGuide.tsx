import React from 'react';
import { BookMarked, Award, CheckCircle2, AlertTriangle, Layers, HelpCircle } from 'lucide-react';

export const BnccGuide: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-auguste-sand shadow-md p-6 sm:p-8 space-y-8 text-auguste-text">
      {/* Title */}
      <div className="border-b border-auguste-sand pb-4">
        <h2 className="text-xl font-bold text-auguste-text flex items-center gap-2">
          <BookMarked className="w-6 h-6 text-auguste-slate" />
          <span>Guia Prático da BNCC & Estruturação do Gerador</span>
        </h2>
        <p className="text-sm text-auguste-muted mt-1">
          Aprenda como funcionam a codificação das habilidades e os critérios de validação automática aplicados pela IA.
        </p>
      </div>

      {/* Code Structure Breakdown */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-auguste-text flex items-center gap-2">
          <Award className="w-5 h-5 text-auguste-slate" />
          <span>Como Entender o Código de uma Habilidade BNCC? (Exemplo: EF01HI01)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
          <div className="p-4 rounded-xl bg-auguste-cream border border-auguste-sand text-auguste-text space-y-1 shadow-2xs">
            <span className="text-2xl font-black font-mono text-auguste-slate">EF</span>
            <span className="block text-xs font-bold text-auguste-text">Etapa de Ensino</span>
            <span className="block text-[11px] text-auguste-muted">EF = Ensino Fundamental / EM = Ensino Médio</span>
          </div>

          <div className="p-4 rounded-xl bg-auguste-cream border border-auguste-sand text-auguste-text space-y-1 shadow-2xs">
            <span className="text-2xl font-black font-mono text-auguste-slate">01</span>
            <span className="block text-xs font-bold text-auguste-text">Ano / Bloco</span>
            <span className="block text-[11px] text-auguste-muted">01 = 1º Ano (ou 67 = 6º/7º ano, 13 = 1ª-3ª série EM)</span>
          </div>

          <div className="p-4 rounded-xl bg-auguste-cream border border-auguste-sand text-auguste-text space-y-1 shadow-2xs">
            <span className="text-2xl font-black font-mono text-auguste-slate">HI</span>
            <span className="block text-xs font-bold text-auguste-text">Componente Curricular</span>
            <span className="block text-[11px] text-auguste-muted">HI = História, MA = Matemática, LP = Português</span>
          </div>

          <div className="p-4 rounded-xl bg-auguste-cream border border-auguste-sand text-auguste-text space-y-1 shadow-2xs">
            <span className="text-2xl font-black font-mono text-auguste-slate">01</span>
            <span className="block text-xs font-bold text-auguste-text">Número da Habilidade</span>
            <span className="block text-[11px] text-auguste-muted">Sequência da habilidade na BNCC</span>
          </div>
        </div>
      </div>

      {/* Validation Rules Card */}
      <div className="bg-auguste-cream border border-auguste-sand rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-auguste-slate flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-auguste-slate" />
          <span>Regras e Validações Obrigatórias do Gerador:</span>
        </h3>

        <ul className="space-y-2 text-sm text-auguste-text">
          <li className="flex items-start gap-2">
            <span className="font-bold text-auguste-slate shrink-0">1.</span>
            <span>A disciplina escolhida pelo professor SEMPRE prevalece sobre a interpretação da imagem. Por exemplo, se o texto tiver a palavra "território" mas a disciplina for História, o foco será histórico.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-auguste-slate shrink-0">2.</span>
            <span>Nunca são utilizadas habilidades de outro segmento ou ano fora do selecionado.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-auguste-slate shrink-0">3.</span>
            <span>Nas Provas, o gabarito é SEMPRE separado no final do documento para permitir impressão sem respostas aos alunos.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-auguste-slate shrink-0">4.</span>
            <span>Em caso de dúvida em relação à habilidade, o sistema emitirá aviso seguro e utilizará no máximo duas habilidades verdadeiras.</span>
          </li>
        </ul>
      </div>

      {/* Material Types Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-auguste-sand bg-auguste-cream space-y-2">
          <h4 className="font-bold text-auguste-text text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-auguste-slate" /> Plano de Aula
          </h4>
          <p className="text-xs text-auguste-muted leading-relaxed">
            Gera título, tema, objetivos de aprendizagem, habilidades BNCC, materiais, desenvolvimento passo a passo e avaliação com tempo estimado.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-auguste-sand bg-auguste-cream space-y-2">
          <h4 className="font-bold text-auguste-text text-sm flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-auguste-slate" /> Prova com Gabarito
          </h4>
          <p className="text-xs text-auguste-muted leading-relaxed">
            Gera questões estruturadas (múltipla escolha e discursivas) com o gabarito e critérios de resposta posicionados estritamente em seção separada.
          </p>
        </div>
      </div>
    </div>
  );
};
