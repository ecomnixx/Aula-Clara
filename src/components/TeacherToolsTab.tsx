import React, { useState, useEffect } from 'react';
import { safeFetchJson } from '../utils/api';
import {
  FileText,
  Calculator,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Copy,
  Check,
  Printer,
  Sparkles,
  Award,
  AlertCircle,
  CheckCircle2,
  Share2,
  Maximize2,
  Volume2,
  MessageSquare,
  Users,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { GoogleUser } from '../types';

interface TeacherToolsTabProps {
  googleUser?: GoogleUser | null;
}

type ToolSubTab = 'parecer' | 'calculadora' | 'projetor';

// Sample Grade Item for Gradebook Calculator
interface GradeComponent {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number;
}

interface StudentGradeRow {
  id: string;
  name: string;
  p1: number;
  p2: number;
  trabalho: number;
  participacao: number;
}

export const TeacherToolsTab: React.FC<TeacherToolsTabProps> = ({ googleUser }) => {
  const [activeSubTab, setActiveSubTab] = useState<ToolSubTab>('parecer');

  // ==========================================
  // STATE: 1. Parecer Pedagógico (AI Report)
  // ==========================================
  const [nomeAluno, setNomeAluno] = useState('');
  const [turma, setTurma] = useState('6º Ano A');
  const [disciplina, setDisciplina] = useState(googleUser?.subject || 'História');
  const [periodo, setPeriodo] = useState('1º Bimestre');
  const [nivelDesempenho, setNivelDesempenho] = useState('Bom (Atingiu plenamente)');
  const [aspectosSelecionados, setAspectosSelecionados] = useState<string[]>([
    'Assíduo e pontual',
    'Participação ativa nas discussões',
  ]);
  const [observacaoProf, setObservacaoProf] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<{
    titulo: string;
    relatorioMarkdown: string;
    pontosFortes: string[];
    pontosAtencao: string[];
  } | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);
  const [copiedWpp, setCopiedWpp] = useState(false);

  const opcoesAspectos = [
    'Assíduo e pontual',
    'Participação ativa nas discussões',
    'Colaborativo em trabalhos de grupo',
    'Capacidade de liderança positiva',
    'Criativo e proativo',
    'Raciocínio lógico bem desenvolvido',
    'Apresenta facilidade de concentração',
    'Necessita estímulo constante de foco (TDAH)',
    'Apresenta timidez ao se expressar',
    'Necessita reforço na entrega de tarefas',
    'Evoluiu significativamente no bimestre',
    'Destaque pelo capricho nos cadernos/atividades',
  ];

  const toggleAspecto = (asp: string) => {
    if (aspectosSelecionados.includes(asp)) {
      setAspectosSelecionados(aspectosSelecionados.filter((a) => a !== asp));
    } else {
      setAspectosSelecionados([...aspectosSelecionados, asp]);
    }
  };

  const handleGenerateReport = async () => {
    if (!nomeAluno.trim()) {
      alert('Por favor, digite o nome do aluno.');
      return;
    }

    setIsGeneratingReport(true);
    try {
      const resData = await safeFetchJson('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeAluno,
          turma,
          disciplina,
          periodo,
          nivelDesempenho,
          aspectosComportamentais: aspectosSelecionados,
          observacaoProf,
        }),
      });

      setGeneratedReport(resData.data);
    } catch (err: any) {
      alert(err.message || 'Falha ao se conectar com a IA para o parecer.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const copyReportText = () => {
    if (!generatedReport) return;
    const fullText = `${generatedReport.titulo}\n\n${generatedReport.relatorioMarkdown}\n\nPontos de Destaque:\n${generatedReport.pontosFortes.map((p) => `• ${p}`).join('\n')}`;
    navigator.clipboard.writeText(fullText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const copyForWhatsApp = () => {
    if (!generatedReport) return;
    const textWpp = `*PARECER PEDAGÓGICO DESCRITIVO*\n*Aluno:* ${nomeAluno}\n*Turma:* ${turma} | *Disciplina:* ${disciplina}\n\n${generatedReport.relatorioMarkdown}\n\n*Aula Clara - Sistema Pedagógico*`;
    navigator.clipboard.writeText(textWpp);
    setCopiedWpp(true);
    setTimeout(() => setCopiedWpp(false), 2000);
  };

  // ==========================================
  // STATE: 2. Calculadora de Médias e Recuperação
  // ==========================================
  const [mediaAprovacao, setMediaAprovacao] = useState<number>(6.0);
  const [grades, setGrades] = useState<GradeComponent[]>([
    { id: '1', name: 'Prova 1 (Avaliação Escrita)', score: 7.0, maxScore: 10, weight: 4 },
    { id: '2', name: 'Prova 2 / Trabalho Bimestral', score: 5.5, maxScore: 10, weight: 4 },
    { id: '3', name: 'Atividades e Participação', score: 8.0, maxScore: 10, weight: 2 },
  ]);

  const updateGradeField = (id: string, field: keyof GradeComponent, val: any) => {
    setGrades(
      grades.map((g) => (g.id === id ? { ...g, [field]: Number(val) || val } : g))
    );
  };

  const addGradeComponent = () => {
    setGrades([
      ...grades,
      {
        id: Math.random().toString(36).substring(2, 7),
        name: `Atividade Extra ${grades.length + 1}`,
        score: 7.0,
        maxScore: 10,
        weight: 1,
      },
    ]);
  };

  const removeGradeComponent = (id: string) => {
    if (grades.length <= 1) return;
    setGrades(grades.filter((g) => g.id !== id));
  };

  // Compute Weighted Average
  const totalWeight = grades.reduce((sum, g) => sum + g.weight, 0);
  const weightedScoreSum = grades.reduce(
    (sum, g) => sum + (g.score / g.maxScore) * 10 * g.weight,
    0
  );
  const currentAverage = totalWeight > 0 ? weightedScoreSum / totalWeight : 0;
  const isPassing = currentAverage >= mediaAprovacao;

  // Recovery Calculator logic
  // Formula assuming final average is (CurrentAverage + RecoveryExamScore) / 2 = TargetAverage
  // -> RecoveryExamScore = (2 * TargetAverage) - CurrentAverage
  const neededInRecovery = Math.max(0, 2 * mediaAprovacao - currentAverage);

  // ==========================================
  // STATE: 3. Cronômetro / Modo Projetor
  // ==========================================
  const [secondsLeft, setSecondsLeft] = useState<number>(15 * 60); // 15 mins
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerInitial, setTimerInitial] = useState<number>(15 * 60);
  const [silenceMode, setSilenceMode] = useState<boolean>(false);
  const [agenda, setAgenda] = useState<
    { id: string; text: string; done: boolean }[]
  >([
    { id: '1', text: '1. Acolhida e chamada rápida', done: true },
    { id: '2', text: '2. Explicação do conceito principal no quadro', done: false },
    { id: '3', text: '3. Atividade em duplas (Páginas 24 a 28)', done: false },
    { id: '4', text: '4. Correção comentada e tirada de dúvidas', done: false },
  ]);
  const [newAgendaItem, setNewAgendaItem] = useState('');
  const [avisoLousa, setAvisoLousa] = useState(
    'Proibido uso de celulares durante a realização do trabalho. Atividade vale 2,0 pontos!'
  );

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsLeft]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const setPresetTimer = (minutes: number) => {
    setIsTimerRunning(false);
    setTimerInitial(minutes * 60);
    setSecondsLeft(minutes * 60);
  };

  const toggleAgendaItem = (id: string) => {
    setAgenda(
      agenda.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const addAgendaItem = () => {
    if (!newAgendaItem.trim()) return;
    setAgenda([
      ...agenda,
      {
        id: Math.random().toString(36).substring(2, 7),
        text: newAgendaItem.trim(),
        done: false,
      },
    ]);
    setNewAgendaItem('');
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-auguste-text">
      {/* Top Banner Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 text-auguste-text shadow-xs relative overflow-hidden border border-auguste-sand">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-auguste-cream text-auguste-slate rounded-full text-xs font-black border border-auguste-sand">
            <Sparkles className="w-3.5 h-3.5 text-auguste-tan-dark" />
            <span>Ferramentas Práticas do Dia a Dia</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-auguste-text">
            Painel de Produtividade Docente
          </h1>
          <p className="text-auguste-muted text-xs sm:text-sm font-medium leading-relaxed">
            Poupe horas de trabalho burocrático. Gerador de pareceres descritivos individuais com IA, calculadora automática de notas/recuperação e relógio de projeção para a lousa.
          </p>
        </div>

        {/* SubTab Navigation Buttons */}
        <div className="mt-6 pt-6 border-t border-auguste-sand/60 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSubTab('parecer')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'parecer'
                ? 'bg-auguste-slate text-white shadow-xs font-black'
                : 'bg-auguste-cream text-auguste-text border border-auguste-sand hover:bg-auguste-cream-dark'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Parecer Pedagógico com IA</span>
          </button>

          <button
            onClick={() => setActiveSubTab('calculadora')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'calculadora'
                ? 'bg-auguste-slate text-white shadow-xs font-black'
                : 'bg-auguste-cream text-auguste-text border border-auguste-sand hover:bg-auguste-cream-dark'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>2. Calculadora de Médias e Recuperação</span>
          </button>

          <button
            onClick={() => setActiveSubTab('projetor')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'projetor'
                ? 'bg-auguste-slate text-white shadow-xs font-black'
                : 'bg-auguste-cream text-auguste-text border border-auguste-sand hover:bg-auguste-cream-dark'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>3. Modo Projetor e Cronômetro</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: PARECER PEDAGÓGICO COM IA                                       */}
      {/* ========================================================================= */}
      {activeSubTab === 'parecer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Side */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-auguste-sand shadow-xs space-y-5">
            <div className="border-b border-auguste-sand/60 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-auguste-text flex items-center gap-2">
                  <FileText className="w-5 h-5 text-auguste-slate" />
                  <span>Dados do Aluno para o Parecer</span>
                </h2>
                <p className="text-xs font-medium text-auguste-muted">
                  Preencha as informações do estudante para a IA redigir um parecer descritivo completo.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-auguste-slate mb-1">
                  Nome do Aluno *
                </label>
                <input
                  type="text"
                  placeholder="Ex.: Gabriel Silva"
                  value={nomeAluno}
                  onChange={(e) => setNomeAluno(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-auguste-cream border border-auguste-sand rounded-xl text-xs font-bold text-auguste-text focus:border-auguste-slate focus:outline-none placeholder-auguste-muted/70"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-auguste-slate mb-1">
                  Turma / Ano
                </label>
                <input
                  type="text"
                  placeholder="Ex.: 6º Ano A"
                  value={turma}
                  onChange={(e) => setTurma(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-auguste-cream border border-auguste-sand rounded-xl text-xs font-bold text-auguste-text focus:border-auguste-slate focus:outline-none placeholder-auguste-muted/70"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-auguste-slate mb-1">
                  Disciplina
                </label>
                <input
                  type="text"
                  value={disciplina}
                  onChange={(e) => setDisciplina(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-auguste-cream border border-auguste-sand rounded-xl text-xs font-bold text-auguste-text focus:border-auguste-slate focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-auguste-slate mb-1">
                  Período Avaliado
                </label>
                <select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-auguste-cream border border-auguste-sand rounded-xl text-xs font-bold text-auguste-text focus:border-auguste-slate focus:outline-none"
                >
                  <option value="1º Bimestre" className="bg-white text-auguste-text">1º Bimestre</option>
                  <option value="2º Bimestre" className="bg-white text-auguste-text">2º Bimestre</option>
                  <option value="3º Bimestre" className="bg-white text-auguste-text">3º Bimestre</option>
                  <option value="4º Bimestre" className="bg-white text-auguste-text">4º Bimestre</option>
                  <option value="Avaliação Final do Ano" className="bg-white text-auguste-text">Avaliação Final do Ano</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-auguste-slate mb-1">
                Nível de Desempenho Geral
              </label>
              <select
                value={nivelDesempenho}
                onChange={(e) => setNivelDesempenho(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-auguste-cream border border-auguste-sand rounded-xl text-xs font-bold text-auguste-text focus:border-auguste-slate focus:outline-none"
              >
                <option value="Excelente (Superou todas as expectativas)" className="bg-white text-auguste-text">
                  ⭐ Excelente (Superou todas as expectativas)
                </option>
                <option value="Bom (Atingiu plenamente os objetivos da BNCC)" className="bg-white text-auguste-text">
                  ✅ Bom (Atingiu plenamente os objetivos da BNCC)
                </option>
                <option value="Regular (Em processo de desenvolvimento)" className="bg-white text-auguste-text">
                  ⚠️ Regular (Em processo de desenvolvimento)
                </option>
                <option value="Insuficiente (Necessita suporte intensivo)" className="bg-white text-auguste-text">
                  🛑 Insuficiente (Necessita suporte pedagógico)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-auguste-slate mb-2">
                Aspectos Comportamentais Observados (Selecione um ou mais)
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 bg-auguste-cream border border-auguste-sand rounded-2xl">
                {opcoesAspectos.map((asp) => {
                  const isChecked = aspectosSelecionados.includes(asp);
                  return (
                    <button
                      key={asp}
                      type="button"
                      onClick={() => toggleAspecto(asp)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
                        isChecked
                          ? 'bg-auguste-slate text-white border-auguste-slate-dark shadow-xs'
                          : 'bg-white text-auguste-text border-auguste-sand hover:bg-auguste-cream-dark'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '} {asp}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-auguste-slate mb-1">
                Observação Específica do Professor (Opcional)
              </label>
              <textarea
                rows={2}
                placeholder="Ex.: Gabriel teve uma melhora notável na última semana após o trabalho em dupla..."
                value={observacaoProf}
                onChange={(e) => setObservacaoProf(e.target.value)}
                className="w-full p-3 bg-auguste-cream border border-auguste-sand rounded-xl text-xs font-medium text-auguste-text focus:border-auguste-slate focus:outline-none placeholder-auguste-muted/70"
              />
            </div>

            <button
              type="button"
              disabled={isGeneratingReport}
              onClick={handleGenerateReport}
              className="w-full py-3.5 px-4 bg-auguste-slate hover:bg-auguste-slate-dark text-white font-black text-xs sm:text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
            >
              {isGeneratingReport ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Redigindo Parecer Pedagógico com IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-auguste-tan" />
                  <span>Gerar Parecer Descritivo Completo</span>
                </>
              )}
            </button>
          </div>

          {/* Result Side */}
          <div className="lg:col-span-6 space-y-4">
            {generatedReport ? (
              <div className="bg-white rounded-3xl p-6 border border-auguste-sand shadow-xs space-y-5 animate-fadeIn">
                <div className="border-b border-auguste-sand/60 pb-3 flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-auguste-cream text-auguste-slate border border-auguste-sand rounded-lg text-[10px] font-black uppercase">
                    Parecer Redigido
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyForWhatsApp}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                      title="Copiar formatado para WhatsApp"
                    >
                      {copiedWpp ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={copyReportText}
                      className="px-3 py-1.5 bg-auguste-slate hover:bg-auguste-slate-dark text-white text-xs font-black rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {copiedReport ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Texto</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-black text-auguste-text leading-tight">
                    {generatedReport.titulo}
                  </h3>
                  <div className="p-4 bg-auguste-cream rounded-2xl border border-auguste-sand text-xs text-auguste-text font-medium leading-relaxed whitespace-pre-wrap">
                    {generatedReport.relatorioMarkdown}
                  </div>
                </div>

                {/* Pontos de Destaque */}
                {generatedReport.pontosFortes?.length > 0 && (
                  <div className="p-4 bg-auguste-cream rounded-2xl border border-auguste-sand space-y-1.5">
                    <h4 className="text-xs font-extrabold text-auguste-slate flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-auguste-slate" />
                      <span>Pontos Fortes e Habilidades Destaque:</span>
                    </h4>
                    <ul className="text-xs text-auguste-text space-y-1 pl-5 list-disc font-medium">
                      {generatedReport.pontosFortes.map((pf, idx) => (
                        <li key={idx}>{pf}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-auguste-sand rounded-3xl p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-auguste-cream text-auguste-slate flex items-center justify-center mx-auto border border-auguste-sand">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-auguste-text">
                  Nenhum parecer gerado ainda
                </h3>
                <p className="text-xs text-auguste-muted max-w-sm mx-auto">
                  Preencha o nome do aluno e os critérios à esquerda e clique em "Gerar Parecer" para obter o relatório descritivo completo em segundos.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: CALCULADORA DE MÉDIAS E RECUPERAÇÃO                              */}
      {/* ========================================================================= */}
      {activeSubTab === 'calculadora' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Grade Calculator */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-auguste-sand shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-auguste-sand/60 pb-4 gap-3">
              <div>
                <h2 className="text-lg font-black text-auguste-text flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-auguste-slate" />
                  <span>Calculadora de Média Ponderada do Aluno</span>
                </h2>
                <p className="text-xs font-medium text-auguste-muted">
                  Ajuste os pesos e as notas de cada avaliação para calcular a média bimestral final.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-auguste-cream p-2 rounded-2xl border border-auguste-sand text-xs">
                <span className="font-extrabold text-auguste-slate">Média de Aprovação:</span>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="10"
                  value={mediaAprovacao}
                  onChange={(e) => setMediaAprovacao(Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-white border border-auguste-sand rounded-lg font-black text-center text-auguste-text focus:outline-none focus:border-auguste-slate"
                />
              </div>
            </div>

            {/* List of Grade Components */}
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 text-[11px] font-black uppercase text-auguste-slate px-2">
                <span className="col-span-5">Avaliação / Atividade</span>
                <span className="col-span-3 text-center">Nota Obtida</span>
                <span className="col-span-2 text-center">Peso</span>
                <span className="col-span-2 text-right">Ação</span>
              </div>

              {grades.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-2 items-center bg-auguste-cream p-2.5 rounded-2xl border border-auguste-sand text-xs"
                >
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateGradeField(item.id, 'name', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-auguste-sand rounded-xl font-bold text-auguste-text text-xs focus:outline-none focus:border-auguste-slate"
                    />
                  </div>

                  <div className="col-span-3 flex items-center justify-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={item.score}
                      onChange={(e) => updateGradeField(item.id, 'score', e.target.value)}
                      className="w-16 px-2 py-1.5 bg-white border border-auguste-sand rounded-xl font-black text-center text-auguste-text text-xs focus:outline-none focus:border-auguste-slate"
                    />
                    <span className="text-auguste-muted font-bold">/10</span>
                  </div>

                  <div className="col-span-2 text-center">
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={item.weight}
                      onChange={(e) => updateGradeField(item.id, 'weight', e.target.value)}
                      className="w-12 px-2 py-1.5 bg-white border border-auguste-sand rounded-xl font-black text-center text-auguste-text text-xs focus:outline-none focus:border-auguste-slate mx-auto"
                    />
                  </div>

                  <div className="col-span-2 text-right">
                    <button
                      onClick={() => removeGradeComponent(item.id)}
                      disabled={grades.length <= 1}
                      className="p-1.5 text-auguste-muted hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addGradeComponent}
                className="w-full py-2.5 px-4 bg-auguste-cream hover:bg-auguste-cream-dark text-auguste-slate font-bold text-xs rounded-2xl border border-dashed border-auguste-sand transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Nova Avaliação / Trabalho</span>
              </button>
            </div>
          </div>

          {/* Results Summary & Recovery Calculator */}
          <div className="lg:col-span-4 space-y-4">
            <div
              className={`rounded-3xl p-6 border shadow-xs space-y-4 ${
                isPassing
                  ? 'bg-emerald-900 text-white border-emerald-700'
                  : 'bg-amber-900 text-white border-amber-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
                  Resultado do Aluno
                </span>
                {isPassing ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-300" />
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-emerald-100">Média Ponderada Final:</p>
                <h3 className="text-4xl font-black text-white">{currentAverage.toFixed(2)}</h3>
              </div>

              <div className="pt-2 border-t border-white/20 text-xs font-medium">
                {isPassing ? (
                  <p className="font-extrabold text-emerald-100">
                    ✅ APROVADO! O aluno superou a média mínima de {mediaAprovacao.toFixed(1)}.
                  </p>
                ) : (
                  <p className="font-extrabold text-amber-100">
                    ⚠️ ABAIXO DA MÉDIA. O aluno necessita de recuperação bimestral.
                  </p>
                )}
              </div>
            </div>

            {/* Recovery Exam Needs Box */}
            <div className="bg-white rounded-3xl p-6 border border-auguste-sand shadow-xs space-y-3">
              <h4 className="text-xs font-black text-auguste-text uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-auguste-slate" />
                <span>Calculadora de Prova de Recuperação</span>
              </h4>

              <div className="p-3 bg-auguste-cream rounded-2xl border border-auguste-sand text-xs space-y-1">
                <p className="text-auguste-text font-medium">
                  Para atingir a média mínima de <strong className="text-auguste-slate">{mediaAprovacao.toFixed(1)}</strong> no bimestre, o aluno precisa tirar na prova de recuperação:
                </p>
                <p className="text-2xl font-black text-auguste-slate pt-1">
                  {neededInRecovery.toFixed(2)}{' '}
                  <span className="text-xs font-bold text-auguste-muted">pontos (de 10.0)</span>
                </p>
              </div>

              <p className="text-[11px] text-auguste-muted font-medium">
                *Cálculo baseado na fórmula de substituição/complemento da média bimestral.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: MODO PROJETOR E CRONÔMETRO                                      */}
      {/* ========================================================================= */}
      {activeSubTab === 'projetor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Digital Clock & Timer Screen */}
          <div
            className={`lg:col-span-7 rounded-3xl p-6 sm:p-8 text-white transition-all shadow-md flex flex-col justify-between space-y-6 ${
              silenceMode
                ? 'bg-auguste-slate-dark border-2 border-auguste-tan'
                : 'bg-auguste-slate border border-auguste-slate-dark'
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-auguste-tan" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-auguste-tan-light">
                  Cronômetro da Aula
                </span>
              </div>

              <button
                onClick={() => setSilenceMode(!silenceMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                  silenceMode
                    ? 'bg-auguste-tan text-auguste-slate-dark shadow-xs'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Modo Silêncio e Foco</span>
              </button>
            </div>

            {/* Display Big Timer */}
            <div className="text-center my-6 space-y-2">
              <div className="text-6xl sm:text-7xl lg:text-8xl font-black font-mono tracking-wider text-auguste-tan drop-shadow-xs">
                {formatTime(secondsLeft)}
              </div>
              <p className="text-xs font-semibold text-auguste-tan-light uppercase tracking-widest">
                Tempo Restante para a Atividade
              </p>
            </div>

            {/* Timer Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`px-6 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer ${
                    isTimerRunning
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-auguste-tan hover:bg-auguste-tan-dark text-auguste-slate-dark'
                  }`}
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pausar</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Iniciar Cronômetro</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setSecondsLeft(timerInitial);
                  }}
                  className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all cursor-pointer"
                  title="Reiniciar"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Timer Presets */}
              <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/10 text-xs">
                <span className="text-auguste-tan-light font-bold">Definir:</span>
                {[5, 10, 15, 20, 30, 45].map((m) => (
                  <button
                    key={m}
                    onClick={() => setPresetTimer(m)}
                    className="px-2.5 py-1 bg-white/10 hover:bg-auguste-tan hover:text-auguste-slate-dark rounded-lg font-bold text-white transition-all cursor-pointer text-[11px]"
                  >
                    {m} min
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Roteiro da Aula & Avisos na Lousa */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-auguste-sand shadow-xs space-y-5">
            <div className="border-b border-auguste-sand/60 pb-3">
              <h3 className="text-base font-black text-auguste-text flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-auguste-slate" />
                <span>Roteiro de Atividades da Aula</span>
              </h3>
              <p className="text-xs text-auguste-muted font-medium">
                Marque os passos da aula conforme avança.
              </p>
            </div>

            <div className="space-y-2">
              {agenda.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleAgendaItem(item.id)}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                    item.done
                      ? 'bg-auguste-cream text-auguste-muted line-through border-auguste-sand'
                      : 'bg-auguste-cream text-auguste-text border-auguste-sand hover:bg-auguste-cream-dark'
                  }`}
                >
                  <span>{item.text}</span>
                  <span
                    className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black ${
                      item.done ? 'bg-auguste-slate text-white' : 'bg-white text-auguste-muted border border-auguste-sand'
                    }`}
                  >
                    {item.done ? '✓' : ''}
                  </span>
                </div>
              ))}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Adicionar novo passo..."
                  value={newAgendaItem}
                  onChange={(e) => setNewAgendaItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addAgendaItem()}
                  className="flex-1 px-3 py-2 bg-auguste-cream border border-auguste-sand rounded-xl text-xs font-bold text-auguste-text focus:outline-none focus:border-auguste-slate placeholder-auguste-muted/70"
                />
                <button
                  onClick={addAgendaItem}
                  className="p-2 bg-auguste-slate hover:bg-auguste-slate-dark text-white rounded-xl cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Avisos da Lousa */}
            <div className="pt-3 border-t border-auguste-sand/60 space-y-2">
              <label className="block text-xs font-black text-auguste-slate">
                Aviso em Destaque para Exibir na Lousa:
              </label>
              <textarea
                rows={2}
                value={avisoLousa}
                onChange={(e) => setAvisoLousa(e.target.value)}
                className="w-full p-2.5 bg-auguste-cream border border-auguste-sand rounded-2xl text-xs font-bold text-auguste-text focus:outline-none focus:border-auguste-slate"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
