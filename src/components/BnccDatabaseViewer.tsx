import React, { useState } from 'react';
import { BNCC_SKILLS_DATABASE, DISCIPLINAS_LIST, SEGMENTOS_LIST } from '../data/bnccData';
import { DisciplinaType, SegmentoType } from '../types';
import { Search, Filter, BookOpen, Award, Copy, Check } from 'lucide-react';

export const BnccDatabaseViewer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDisciplina, setSelectedDisciplina] = useState<string>('TODAS');
  const [selectedSegmento, setSelectedSegmento] = useState<string>('TODOS');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredSkills = BNCC_SKILLS_DATABASE.filter((skill) => {
    const matchesSearch =
      skill.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (skill.unidadeTematica && skill.unidadeTematica.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (skill.objetoConhecimento && skill.objetoConhecimento.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDisciplina =
      selectedDisciplina === 'TODAS' || skill.disciplina === selectedDisciplina;

    const matchesSegmento =
      selectedSegmento === 'TODOS' || skill.segmento === selectedSegmento;

    return matchesSearch && matchesDisciplina && matchesSegmento;
  });

  const copySkill = (code: string, desc: string) => {
    navigator.clipboard.writeText(`${code}: ${desc}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-auguste-sand shadow-xs p-6 sm:p-8 space-y-6 text-auguste-text">
      <div className="border-b border-auguste-sand pb-4">
        <h2 className="text-xl font-bold text-auguste-text flex items-center gap-2">
          <Search className="w-6 h-6 text-auguste-slate" />
          <span>Consulta de Habilidades Oficiais da BNCC</span>
        </h2>
        <p className="text-sm text-auguste-muted mt-1">
          Explore e pesquise códigos e descrições oficiais de habilidades por disciplina, segmento e palavras-chave.
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-auguste-slate absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código (ex: EF01HI01) ou palavra-chave..."
            className="w-full bg-auguste-cream border border-auguste-sand rounded-xl pl-10 pr-4 py-2.5 text-sm text-auguste-text focus:ring-2 focus:ring-auguste-slate focus:outline-none placeholder-auguste-muted/70"
          />
        </div>

        {/* Disciplina */}
        <div>
          <select
            value={selectedDisciplina}
            onChange={(e) => setSelectedDisciplina(e.target.value)}
            className="w-full bg-auguste-cream border border-auguste-sand rounded-xl px-3 py-2.5 text-sm text-auguste-text font-medium focus:ring-2 focus:ring-auguste-slate focus:outline-none"
          >
            <option value="TODAS">Todas as Disciplinas</option>
            {DISCIPLINAS_LIST.map((d) => (
              <option key={d} value={d} className="bg-white text-auguste-text">
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Segmento */}
        <div>
          <select
            value={selectedSegmento}
            onChange={(e) => setSelectedSegmento(e.target.value)}
            className="w-full bg-auguste-cream border border-auguste-sand rounded-xl px-3 py-2.5 text-sm text-auguste-text font-medium focus:ring-2 focus:ring-auguste-slate focus:outline-none"
          >
            <option value="TODOS">Todos os Segmentos</option>
            {SEGMENTOS_LIST.map((s) => (
              <option key={s} value={s} className="bg-white text-auguste-text">
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs font-semibold text-auguste-slate flex items-center justify-between">
        <span>Exibindo {filteredSkills.length} habilidade(s) cadastrada(s)</span>
      </div>

      {/* Skills Grid */}
      <div className="space-y-3">
        {filteredSkills.map((skill) => (
          <div
            key={skill.codigo}
            className="p-5 rounded-xl border border-auguste-sand bg-auguste-cream hover:border-auguste-slate hover:shadow-xs transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-lg bg-auguste-slate text-white font-mono text-xs font-bold">
                  {skill.codigo}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-white text-auguste-slate border border-auguste-sand">
                  {skill.disciplina}
                </span>
                <span className="text-xs text-auguste-muted font-medium">
                  {skill.segmento} • {skill.ano}
                </span>
              </div>

              <button
                type="button"
                onClick={() => copySkill(skill.codigo, skill.descricao)}
                className="text-xs font-bold text-auguste-muted hover:text-auguste-slate flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                {copiedCode === skill.codigo ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Habilidade</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm font-medium text-auguste-text leading-relaxed">
              {skill.descricao}
            </p>

            {(skill.unidadeTematica || skill.objetoConhecimento) && (
              <div className="pt-2 border-t border-auguste-sand grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {skill.unidadeTematica && (
                  <div>
                    <span className="font-bold text-auguste-slate">Unidade Temática:</span>{' '}
                    <span className="text-auguste-text">{skill.unidadeTematica}</span>
                  </div>
                )}
                {skill.objetoConhecimento && (
                  <div>
                    <span className="font-bold text-auguste-slate">Objeto de Conhecimento:</span>{' '}
                    <span className="text-auguste-text">{skill.objetoConhecimento}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {filteredSkills.length === 0 && (
          <div className="text-center py-12 bg-auguste-cream rounded-2xl border border-dashed border-auguste-sand space-y-2">
            <BookOpen className="w-8 h-8 text-auguste-slate mx-auto" />
            <p className="text-sm font-bold text-auguste-text">Nenhuma habilidade encontrada</p>
            <p className="text-xs text-auguste-muted">
              Tente alterar os termos da busca ou redefinir os filtros selecionados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
