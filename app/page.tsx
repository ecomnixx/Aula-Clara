"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Material = "aula" | "prova";
type SavedItem = { id: number; type: Material; title: string; subject: string; grade: string; createdAt: string };

const subjects = ["Língua Portuguesa", "Matemática", "Ciências", "História", "Geografia", "Educação Física", "Arte", "Inglês"];
const grades = ["6º Ano", "7º Ano", "8º Ano", "9º Ano", "1ª Série EM", "2ª Série EM", "3ª Série EM"];
const topics: Record<string, string> = {
  "Língua Portuguesa": "interpretação de texto e gêneros discursivos",
  Matemática: "razão, proporção e resolução de problemas",
  Ciências: "ecossistemas e relações entre os seres vivos",
  História: "transformações sociais e culturais",
  Geografia: "território, paisagem e relações socioambientais",
  "Educação Física": "jogos, esportes, inclusão e cooperação",
  Arte: "linguagens visuais e processos criativos",
  Inglês: "leitura e compreensão de textos cotidianos",
};

function Icon({ children }: { children: React.ReactNode }) {
  return <span className="icon" aria-hidden="true">{children}</span>;
}

export default function Home() {
  const [view, setView] = useState<"home" | "create" | "saved">("home");
  const [menu, setMenu] = useState(false);
  const [subject, setSubject] = useState("Língua Portuguesa");
  const [grade, setGrade] = useState("8º Ano");
  const [lessons, setLessons] = useState(1);
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState("Intermediária");
  const [schoolName, setSchoolName] = useState("");
  const [teacherName, setTeacherName] = useState("Lucas");
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState("");
  const [mode, setMode] = useState<Material | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<Material | null>(null);
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const current = localStorage.getItem("aula-clara-saved");
    if (current) setSaved(JSON.parse(current));
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  const topic = topics[subject];
  const title = subject === "Educação Física" ? "Circuito cooperativo: movimento e inclusão" : `Explorando ${topic}`;

  const lessonPlan = useMemo(() => ({
    objective: `Compreender ${topic}, relacionando o conteúdo às experiências dos estudantes e desenvolvendo argumentação, colaboração e autonomia.`,
    skills: subject === "Educação Física" ? ["EF89EF01", "EF89EF06"] : ["EF08LP03", "EF08LP14"],
    steps: [
      "Acolhida e ativação dos conhecimentos prévios com uma pergunta disparadora.",
      `Apresentação dialogada do tema ${topic}, usando exemplos do material enviado.`,
      "Atividade em duplas ou grupos com registro das descobertas e resolução de um desafio.",
      "Socialização das respostas, síntese coletiva e avaliação formativa de saída.",
    ],
  }), [subject, topic]);

  const exam = useMemo(() => [
    `Explique, com suas palavras, o que você compreendeu sobre ${topic}.`,
    `Assinale a alternativa que melhor representa uma aplicação de ${topic}:\nA) Repetir informações sem analisá-las.\nB) Relacionar conceitos e situações reais.\nC) Ignorar o contexto apresentado.\nD) Memorizar palavras isoladas.\nE) Evitar compartilhar ideias.`,
    `Leia o material apresentado e identifique duas ideias centrais relacionadas a ${topic}.`,
    "Justifique por que a alternativa B da questão 2 é a mais adequada.",
    `Crie um exemplo do cotidiano que ajude a explicar ${topic}.`,
    "Compare duas informações do texto-base e indique uma semelhança e uma diferença.",
    "Que habilidade foi mais importante para resolver as questões? Explique.",
    "Proponha uma atividade em grupo para aprofundar o assunto estudado.",
    "Resuma o conteúdo em até três frases.",
    "Autoavaliação: qual parte foi mais fácil e qual exige mais estudo?",
  ], [topic]);

  function flash(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2600); }
  function chooseFiles(list: FileList | null) {
    if (!list) return;
    setFiles(Array.from(list));
    setText(`Material carregado com sucesso. ${list.length} imagem(ns) pronta(s) para leitura.\n\nEdite este campo para incluir o texto extraído ou cole aqui o conteúdo da apostila.`);
  }
  function generate(kind: Material) {
    setMode(kind); setGenerating(true); setGenerated(null);
    window.setTimeout(() => { setGenerating(false); setGenerated(kind); document.getElementById("result")?.scrollIntoView({ behavior: "smooth" }); }, 900);
  }
  function saveCurrent(kind: Material) {
    const item = { id: Date.now(), type: kind, title: kind === "aula" ? title : `Avaliação — ${topic}`, subject, grade, createdAt: new Date().toLocaleDateString("pt-BR") };
    const next = [item, ...saved]; setSaved(next); localStorage.setItem("aula-clara-saved", JSON.stringify(next)); flash("Material salvo no aparelho");
  }
  function removeSaved(id: number) {
    const next = saved.filter(item => item.id !== id);
    setSaved(next); localStorage.setItem("aula-clara-saved", JSON.stringify(next)); flash("Material removido");
  }
  async function shareCurrent() {
    const data = { title: generated === "aula" ? title : `Avaliação — ${subject}`, text: `Material de ${subject} para o ${grade}, criado no Aula Clara.`, url: window.location.href };
    if (navigator.share) await navigator.share(data).catch(() => undefined);
    else { await navigator.clipboard.writeText(window.location.href); flash("Link copiado"); }
  }
  function downloadWord() {
    const questions = exam.slice(0, questionCount).map((q, i) => `<p><b>${i + 1}.</b> ${q.replaceAll("\n", "<br>")}</p><p>&nbsp;</p>`).join("");
    const html = `<html><head><meta charset="utf-8"><style>@page{margin:2cm}body{font-family:Arial,sans-serif;font-size:11pt;line-height:1}p{margin:0}h1{text-align:center;font-size:14pt}.line{border-bottom:1px solid #000;display:inline-block;width:65%}</style></head><body><h1>AVALIAÇÃO DE ${subject.toUpperCase()}</h1><p>Escola: ${schoolName || '<span class="line"></span>'}</p><p>Professor(a): ${teacherName || '<span class="line"></span>'}</p><p>Aluno(a): <span class="line"></span></p><p>Turma: ${grade} &nbsp;&nbsp; Data: ____/____/______</p><p>Nível: ${difficulty}</p><br>${questions}<br><h2>Gabarito do professor</h2><p>1. Resposta pessoal coerente com o tema. 2. B. Demais questões: respostas conforme o conteúdo trabalhado.</p></body></html>`;
    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `prova-${subject.toLowerCase().replaceAll(" ", "-")}.doc`; a.click(); URL.revokeObjectURL(url); flash("Prova baixada em formato Word");
  }

  return <main className="app-shell">
    <header className="topbar">
      <button className="menu-button" onClick={() => setMenu(true)} aria-label="Abrir menu">☰</button>
      <button className="brand" onClick={() => setView("home")}><span className="logo">A</span><span><b>Aula Clara</b><small>Da apostila para o bimestre inteiro.</small></span></button>
      <span className="avatar">PL</span>
    </header>

    {menu && <div className="menu-backdrop" onClick={() => setMenu(false)}><aside className="drawer" onClick={e => e.stopPropagation()}>
      <button className="close" onClick={() => setMenu(false)}>×</button><div className="drawer-brand"><span className="logo large">A</span><h2>Aula Clara</h2></div>
      {[['⌂','Área inicial','home'],['▣','Gerar aulas','create'],['▤','Banco de provas','saved'],['▦','Plano bimestral','saved'],['□','Materiais e turmas','saved'],['↧','Downloads e avaliações','saved']].map(([ic,label,target]) => <button key={label} onClick={() => {setView(target as typeof view);setMenu(false)}}><Icon>{ic}</Icon>{label}<span>›</span></button>)}
      <footer>Aula Clara v1.0 · Plataforma docente</footer>
    </aside></div>}

    {view === "home" && <section className="page home">
      <div className="welcome"><span className="eyebrow">PLANEJAMENTO INTELIGENTE</span><h1>Professor Lucas,<br/>vamos começar?</h1><p>Transforme páginas da apostila em aulas e avaliações prontas para usar.</p></div>
      <div className="quick-card"><Icon>⌁</Icon><div><b>Importação rápida</b><p>Fotografe ou selecione o material e deixe a organização com a Aula Clara.</p></div></div>
      <h2 className="section-title">O que você quer preparar?</h2>
      <div className="action-grid">
        <button onClick={() => {setView("create");setMode("aula")}}><Icon>▤</Icon><b>Gerar aula</b><span>Plano completo alinhado à BNCC</span><em>Começar →</em></button>
        <button onClick={() => {setView("create");setMode("prova")}}><Icon>✓</Icon><b>Gerar prova</b><span>Questões e gabarito em Word</span><em>Começar →</em></button>
      </div>
      <div className="feature-strip"><div><b>BNCC</b><span>Habilidades relacionadas</span></div><div><b>1 toque</b><span>Exportação para Word</span></div><div><b>Local</b><span>Histórico no aparelho</span></div></div>
      <div className="v2-callout"><span>✦</span><div><b>Seu assistente pedagógico</b><p>Crie, revise, salve, imprima e compartilhe sem sair do celular.</p></div></div>
    </section>}

    {view === "create" && <section className="page create-page">
      <div className="page-heading"><span className="eyebrow">NOVO MATERIAL</span><h1>Prepare sua próxima aula</h1><p>Informe a turma e envie o conteúdo que será trabalhado.</p></div>
      <section className="card"><div className="card-title"><Icon>▤</Icon><div><b>1. Disciplina e turma</b><small>Usaremos estes dados para organizar o material.</small></div></div>
        <label>Disciplina<select value={subject} onChange={e => setSubject(e.target.value)}>{subjects.map(x => <option key={x}>{x}</option>)}</select></label>
        <label>Ano / série<select value={grade} onChange={e => setGrade(e.target.value)}>{grades.map(x => <option key={x}>{x}</option>)}</select></label>
        <div className="lesson-count"><span>Quantidade de aulas</span><div>{[1,2,3,4,5,6,8,10].map(x => <button className={lessons === x ? "active" : ""} onClick={() => setLessons(x)} key={x}>{x}</button>)}</div></div>
      </section>
      <section className="card upload"><div className="card-title"><Icon>▣</Icon><div><b>2. Material da apostila</b><small>Envie fotos nítidas e na ordem das páginas.</small></div></div>
        <input ref={fileRef} hidden type="file" accept="image/*,.pdf" multiple onChange={e => chooseFiles(e.target.files)}/>
        <button className="upload-zone" onClick={() => fileRef.current?.click()}><span>＋</span><b>Escolher imagens ou PDF</b><small>Você pode selecionar várias páginas</small></button>
        {files.length > 0 && <div className="file-list"><b>✓ {files.length} arquivo(s) selecionado(s)</b>{files.slice(0,4).map(f => <span key={f.name}>{f.name}</span>)}</div>}
        <label>Texto identificado / conteúdo<textarea value={text} onChange={e => setText(e.target.value)} placeholder="O texto extraído aparecerá aqui. Você também pode colar ou digitar o conteúdo."/></label>
      </section>
      <section className="card"><div className="card-title"><Icon>✦</Icon><div><b>3. Escolha o material</b><small>Você poderá editar antes de salvar ou baixar.</small></div></div>
        {subject === "Educação Física" && <div className="pe-option"><b>Educação Física · formato da aula</b><p>O plano será estruturado como aula prática, com materiais, espaço, segurança, organização e adaptações.</p></div>}
        <div className="generate-options"><button onClick={() => generate("aula")} className={mode === "aula" ? "selected" : ""}><Icon>▤</Icon><b>Gerar plano de aula</b><span>{lessons} aula(s) · sequência didática completa</span></button><button onClick={() => setMode("prova")} className={mode === "prova" ? "selected" : ""}><Icon>✓</Icon><b>Configurar avaliação</b><span>Questões, gabarito e arquivo Word</span></button></div>
        {mode === "prova" && <div className="exam-settings"><div><label>Quantidade<select value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))}><option value="5">5 questões</option><option value="8">8 questões</option><option value="10">10 questões</option></select></label><label>Dificuldade<select value={difficulty} onChange={e => setDifficulty(e.target.value)}><option>Básica</option><option>Intermediária</option><option>Avançada</option></select></label></div><label>Nome da escola<input value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="Opcional"/></label><label>Professor(a)<input value={teacherName} onChange={e => setTeacherName(e.target.value)}/></label><button className="create-exam" onClick={() => generate("prova")}>Gerar avaliação personalizada</button></div>}
      </section>
      {generating && <div className="generating"><span></span><b>Organizando seu material...</b><p>Relacionando conteúdo, turma e habilidades pedagógicas.</p></div>}
      {generated && !generating && <section id="result" className="result-card">
        <div className="result-head"><span className="eyebrow">MATERIAL GERADO</span><h2>{generated === "aula" ? title : `Avaliação — ${subject}`}</h2><p>{subject} · {grade} · {lessons} aula(s)</p></div>
        {generated === "aula" ? <div className="result-body" contentEditable suppressContentEditableWarning><h3>Objetivo de aprendizagem</h3><p>{lessonPlan.objective}</p><h3>Habilidades BNCC relacionadas</h3><div className="skills">{lessonPlan.skills.map(s => <span key={s}>{s}</span>)}</div><h3>Recursos necessários</h3><p>{subject === "Educação Física" ? "Cones, bolas, coletes, cronômetro, quadra ou espaço livre e água para hidratação." : "Apostila, quadro, caderno, cartões de atividade e recursos visuais disponíveis."}</p><h3>Desenvolvimento</h3><ol>{lessonPlan.steps.map((s,i) => <li key={s}><b>{i+1}</b><span>{s}</span></li>)}</ol><h3>Avaliação</h3><p>Observação da participação, dos registros e da capacidade de relacionar o conteúdo às situações propostas.</p><aside><b>Dica do professor</b><p>Reserve os cinco minutos finais para uma síntese feita pelos próprios estudantes.</p></aside></div> : <div className="result-body exam" contentEditable suppressContentEditableWarning><div className="school-lines"><span>Escola: {schoolName || "___________________________"}</span><span>Professor(a): {teacherName}</span><span>Aluno(a): _________________________</span><span>Nível: {difficulty}</span></div>{exam.slice(0, questionCount).map((q,i) => <div key={q}><b>{i+1}.</b><p>{q}</p></div>)}<details><summary>Ver gabarito do professor</summary><p>Questão 2: alternativa B. Questões abertas: avaliar coerência, domínio do conteúdo e capacidade de argumentação.</p></details></div>}
        <p className="edit-hint">✎ Toque no texto acima para fazer ajustes.</p><div className="result-actions multi"><button onClick={() => saveCurrent(generated)}>☆ Salvar</button><button onClick={shareCurrent}>↗ Compartilhar</button><button onClick={() => window.print()}>⌑ Imprimir</button>{generated === "prova" && <button className="primary" onClick={downloadWord}>↓ Baixar Word</button>}</div>
      </section>}
    </section>}

    {view === "saved" && <section className="page saved-page"><div className="page-heading"><span className="eyebrow">BIBLIOTECA</span><h1>Materiais salvos</h1><p>Seus planos e avaliações ficam guardados neste aparelho.</p></div>{saved.length === 0 ? <div className="empty"><Icon>□</Icon><h2>Nenhum material salvo</h2><p>Gere uma aula ou prova e toque em “Salvar”.</p><button className="primary" onClick={() => setView("create")}>Criar material</button></div> : <div className="saved-list">{saved.map(item => <article key={item.id}><Icon>{item.type === "aula" ? "▤" : "✓"}</Icon><div><small>{item.type === "aula" ? "PLANO DE AULA" : "AVALIAÇÃO"}</small><b>{item.title}</b><span>{item.subject} · {item.grade} · {item.createdAt}</span></div><button onClick={() => removeSaved(item.id)} aria-label="Excluir material">×</button></article>)}</div>}</section>}

    <nav className="bottom-nav"><button className={view === "home" ? "active" : ""} onClick={() => setView("home")}><span>⌂</span>Início</button><button className={view === "create" ? "active" : ""} onClick={() => setView("create")}><span>＋</span>Criar</button><button className={view === "saved" ? "active" : ""} onClick={() => setView("saved")}><span>□</span>Salvos</button></nav>
    {toast && <div className="toast">✓ {toast}</div>}
  </main>;
}
