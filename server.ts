import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Middleware to handle body-parser and request entity errors gracefully as JSON
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err) {
    console.error('Erro no parser da requisição:', err);
    if (err.type === 'entity.too.large' || err.status === 413) {
      return res.status(413).json({
        error: 'As imagens enviadas são muito grandes. Reduza a quantidade ou envie fotos com menor resolução.',
      });
    }
    return res.status(err.status || 400).json({
      error: err.message || 'Dados da requisição inválidos.',
    });
  }
  next();
});

// Initialize GoogleGenAI lazily
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('A chave GEMINI_API_KEY não foi configurada. Verifique as configurações.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// OCR Route: Digitalize and transcribe verbatim text from uploaded images using Gemini
app.post('/api/ocr', async (req, res) => {
  try {
    const { images } = req.body;

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        error: 'Nenhuma imagem foi fornecida para digitalização OCR.',
      });
    }

    const ai = getGenAI();
    const parts: any[] = [];

    for (const img of images) {
      const base64Data = (img.base64 || '').replace(/^data:image\/\w+;base64,/, '');
      const mimeType = img.type || img.mimeType || 'image/jpeg';
      if (base64Data) {
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType,
          },
        });
      }
    }

    if (parts.length === 0) {
      return res.status(400).json({ error: 'Nenhuma imagem válida recebida.' });
    }

    const ocrPrompt = `Sua ÚNICA e EXCLUSIVA tarefa é atuar como um Scanner e Leitor OCR de altíssima precisão.
Você deve ler TODAS as imagens/páginas fornecidas e TRANSCREVER LITERALMENTE CADA PALAVRA, FRASE, TÍTULO, SUBTÍTULO, PARÁGRAFO, CAIXA DE TEXTO E QUESTÃO presente nas imagens da apostila/livro/documento.

REGRAS OBRIGATÓRIAS:
1. Digite a ÍNTEGRA LITERAL de todo o texto impresso nas páginas enviadas.
2. É ESTRITAMENTE PROIBIDO resumir, sintetizar, omitir trechos ou usar explicações genéricas como "Conteúdo sobre a disciplina de...".
3. Transcreva absolutamente tudo: títulos, parágrafos, caixas explicativas, questões do ENEM/vestibulares (com enunciado e alternativas A, B, C, D, E na íntegra), legendas, notas de rodapé e textos em destaque.
4. Se houver mais de uma página/imagem, organize a resposta separando cada página por:
   --- PÁGINA 1 ---
   [Texto completo lido da página 1]

   --- PÁGINA 2 ---
   [Texto completo lido da página 2]

Retorne APENAS o texto lido/transcrito na íntegra.`;

    parts.push({ text: ocrPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: { parts },
      config: {
        temperature: 0.1,
      },
    });

    const transcribedText = response.text || '';
    res.json({ text: transcribedText });
  } catch (error: any) {
    console.error('Erro no OCR:', error);
    res.status(500).json({
      error: error.message || 'Falha ao digitalizar imagens.',
    });
  }
});

// Main generation route for BNCC Pedagogical Material
app.post('/api/generate', async (req, res) => {
  try {
    const { disciplina, segmento, ano, tipo, texto_ocr, images, tipoAulaEdFisica, quantidadeAulas } = req.body;

    const numAulas = Math.max(1, Math.min(20, Number(quantidadeAulas) || 1));

    if (!disciplina || !segmento || !ano || !tipo) {
      return res.status(400).json({
        error: 'É necessário fornecer Disciplina, Segmento, Ano e Tipo de material.',
      });
    }

    const ai = getGenAI();

    // Build parts for Gemini
    const parts: any[] = [];

    // Attach images if provided
    if (Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        if (img.base64 && img.mimeType) {
          parts.push({
            inlineData: {
              data: img.base64.replace(/^data:image\/\w+;base64,/, ''),
              mimeType: img.mimeType,
            },
          });
        }
      }
    }

    const isOnlyProva = tipo === 'Gerar Prova' || tipo === 'Prova';
    const isOnlyAula =
      tipo === 'Gerar Aula' ||
      tipo === 'Plano de Aula' ||
      tipo === 'Aula Rápida' ||
      tipo === 'Atividade' ||
      tipo === 'Atividade Prática';

    const isEdFisicaPratica =
      disciplina === 'Educação Física' &&
      (tipoAulaEdFisica === 'Prática' || tipo === 'Atividade Prática' || !tipoAulaEdFisica);

    const promptText = `
========================
PROMPT MESTRE – GERADOR PEDAGÓGICO AULA CLARA
========================

Você é o assistente de inteligência pedagógica do aplicativo **Aula Clara** (Colégio Almanac).
Seu objetivo é interpretar o conteúdo enviado (por imagem e/ou texto OCR) e GERAR RAPIDAMENTE E DE FORMA FOCADA o material solicitado pelo professor, estritamente compatível com a BNCC (Base Nacional Comum Curricular), disciplina, segmento e ano selecionados:

DADOS SELECIONADOS PELO PROFESSOR:
- Disciplina: ${disciplina}
- Segmento: ${segmento}
- Ano/Série: ${ano}
- Tipo Solicitado: ${tipo}
- Quantidade de Aulas Solicitadas: EXATAMENTE ${numAulas} AULA(S)
${disciplina === 'Educação Física' ? `- Modalidade de Educação Física: ${isEdFisicaPratica ? 'AULA PRÁTICA (Dinâmica Competitiva em Quadra)' : 'AULA TEÓRICA'}` : ''}
${texto_ocr ? `- Texto extraído/fornecido (OCR): ${texto_ocr}` : ''}
${Array.isArray(images) && images.length > 0 ? `- Quantidade de imagens anexadas: ${images.length}` : ''}

REGRAS ESTRITAS DE GERAÇÃO CONFORME A SOLICITAÇÃO DO PROFESSOR:

${
  numAulas > 1
    ? `• **ESTRUTURA PARA PLANEJAMENTO DE ${numAulas} AULAS**:
  - Como o professor solicitou ${numAulas} aulas, estruture a sequência didática em "desenvolvimentoOuPassoAPasso" organizando detalhadamente cada uma das ${numAulas} aulas sequenciais (ex: "Aula 1: [Tema/Atividade]", "Aula 2: [Tema/Atividade]", ..., "Aula ${numAulas}: [Tema/Atividade]").
  - E especifique no "tempoEstimado" o total acumulado (ex: "${numAulas} aulas de 50 minutos - ${numAulas * 50} min total").\n`
    : ''
}

${
  isOnlyProva
    ? `• **GERAR EXCLUSIVAMENTE A PROVA / AVALIAÇÃO (Regra Estrita de 10 Questões)**:
  - Gere APENAS a prova com 10 questões no total:
    * Questões 1 a 5: MÚLTIPLA ESCOLHA com EXATAMENTE 5 opções marcadas estritamente como A), B), C), D), E). Indique a pontuação (1,0) no final do enunciado.
    * Questões 6 a 10: DISSERTATIVAS / SUBJETIVAS com a indicação de pontuação (1,0) e linhas/espaço para resposta.
  - GABARITO SEPARADO E CRITÉRIOS DE CORREÇÃO NO FINAL para as 10 questões.
  - NUNCA gere plano de aula quando for solicitada apenas a prova.`
    : isOnlyAula
    ? isEdFisicaPratica
      ? `• **GERAR EXCLUSIVAMENTE PLANO DE AULA PRÁTICA DE EDUCAÇÃO FÍSICA (Dinâmica Competitiva & Engajamento)**:
  - Crie uma ATIVIDADE PRÁTICA altamente DINÂMICA, ENVOLVENTE e COMPETITIVA entre os alunos (especialmente para o Ensino Médio/Fundamental), garantindo alto engajamento e retenção da atenção dos estudantes.
  - Retorne obrigatoriamente:
    1) "materiais": Lista completa e detalhada de TODOS os materiais físicos necessários para a atividade na quadra/pátio (ex: bolas, 10 cones coloridos, 20 coletes divididos por cor, apito, cronômetro, tiras de demarcação, etc.).
    2) "desenvolvimentoOuPassoAPasso": Passo a passo detalhado e sequencial de como conduzir a atividade prática na quadra/pátio:
       - Aquecimento e Explicação Rápida das Regras (10 min)
       - Divisão dos Times e Estratégia Competitiva (10 min)
       - Execução do Desafio / Torneio Competitivo em Quadra (25 min)
       - Encerramento, Contagem de Pontos do Time Vencedor, Reflexão Pedagógica BNCC e Volta à Calma (5 min)
    3) "regrasOuProcedimentos": Regras do jogo, pontuação, faltas/penalidades e procedimentos de segurança.
    4) "variacoes": Modificações para aumentar a intensidade física, a competitividade ou promover a inclusão de todos os estudantes.
  - NUNCA gere questões de prova quando for solicitada apenas a aula/atividade prática.`
      : `• **GERAR EXCLUSIVAMENTE PLANO DE AULA / SEQUÊNCIA DIDÁTICA BNCC EXTREMAMENTE DETALHADA PARA ${disciplina.toUpperCase()}**:
  - Crie um PLANO DE AULA COMPLETO, MINUCIOSO E PRÁTICO para a disciplina de ${disciplina} (${segmento} - ${ano}), pronto para aplicação em sala de aula.
  - Para ${disciplina}, entre DIRETO nas etapas pedagógicas do Plano de Aula (sem esquema visual de quadra), mas GARANTA O MÁXIMO DE RIQUEZA E DETALHAMENTO PRÁTICO EM CADA ETAPA, ROTEIRO E ATIVIDADES.
  - O plano DEVE ser o mais detalhado e aprofundado possível:
    1) "objetivo": Objetivo geral de aprendizagem amplo, claro e alinhado à habilidade BNCC oficial.
    2) "tempoEstimado": Duração exata (ex: "2 aulas de 50 minutos - 100 min total").
    3) "materiais": Lista exaustiva de materiais (livros, impressos, recursos multimídia, lousa, esquemas visuais, fichas de exercícios, materiais manipuláveis).
    4) "desenvolvimentoOuPassoAPasso": Roteiro altamente detalhado, dividido por etapas com tempo e orientações explícitas:
       - Etapa 1: Sensibilização e Problematização Inicial (15 min): Pergunta disparadora do professor, relação com o cotidiano e ativação de conhecimentos prévios.
       - Etapa 2: Exposição Dialogada e Conceituação Teórica (25 min): Apresentação detalhada dos conceitos centrais de ${disciplina}, definições claras, regras/fórmulas/fatos históricos com exemplos práticos resolvidos passo a passo na lousa pelo professor.
       - Etapa 3: Atividade Prática de Aplicação em Sala (40 min): Descrição COMPLETA, PRÁTICA E DETALHADA da atividade ou conjunto de exercícios que os estudantes realizarão em sala (em duplas, grupos ou individualmente), com os enunciados/desafios exatos a serem resolvidos, tempo de execução e o papel ativo de mediação do professor.
       - Etapa 4: Socialização, Fechamento e Síntese BNCC (20 min): Apresentação das resoluções pelos alunos, correção coletiva orientada, síntese no quadro e consolidação dos aprendizados.
    5) "regrasOuProcedimentos": Diretrizes operacionais e procedimentos práticos para conduzir a aula e a atividade em sala (como organizar as duplas/grupos, prazos, critérios de execução e mediação).
    6) "variacoes": Exercícios de aprofundamento e desafios extras para alunos mais céleres, além de adaptações pedagógicas inclusivas para estudantes que necessitam de suporte adicional.
    7) "dicaProfessor": Dica pedagógica valiosa sobre equívocos comuns dos alunos neste assunto de ${disciplina} e como preveni-los ou corrigi-los durante a explicação.
    8) "avaliacao": Critérios de avaliação formativa com indicadores observáveis de aprendizagem alinhados à BNCC.
    9) "markdownCompleto": Versão completa em Markdown bem formatado com todo o plano de aula estruturado.`
    : `• **GERAR AMBAS AS POSSIBILIDADES (Plano de Aula + Prova de 10 Questões)**:
  - Possibilidade 1: Plano de Aula Rápido com Sequência Didática / Atividade Prática.
  - Possibilidade 2: Prova / Avaliação com 10 Questões (5 Múltipla Escolha A,B,C,D,E + 5 Dissertativas) com Gabarito Separado.`
}

INSTRUÇÃO DE DIGITALIZAÇÃO OCR E ANÁLISE BNCC (OBRIGATÓRIO):
1. TRANSCRIÇÃO OCR PALAVRA POR PALAVRA (conteudoEscaneadoOCR):
   - Se houver imagens anexadas, você DEVE LER E TRANSCREVER LITERALMENTE CADA PALAVRA E CADA FRASE de todo o texto impresso contido nas páginas enviadas (títulos, cabeçalhos, blocos de texto, caixas explicativas, artigos, questões do ENEM com opções A, B, C, D, E, notas de rodapé, etc.).
   - PROIBIDO RESUMIR OU SINTETIZAR. NUNCA escreva frases explicativas genéricas como "Conteúdo sobre a disciplina de Educação Física...". Você DEVE retornar O TEXTO ORIGINAL COMPLETO E EXTRAÍDO DA IMAGEM.
   - Organize o texto extraído por páginas, por exemplo:
     --- PÁGINA 1 ---
     [Texto integral lido da Imagem 1]
     --- PÁGINA 2 ---
     [Texto integral lido da Imagem 2]
2. Identifique o tema principal com base no texto lido e compare com as habilidades oficiais da BNCC para ${disciplina} - ${segmento} - ${ano}.
3. REGRA ABSOLUTA PARA GABARITOS DE QUESTÕES (OBRIGATÓRIO):
   - Ao gerar a resposta do gabarito (em "respostaGabarito" e em "gabaritoSeparado"), ela DEVE SER LITERALMENTE A RESPOSTA DA PERGUNTA.
   - Para questões de múltipla escolha: informe a letra e O TEXTO EXATO DA OPÇÃO CORRETA fornecida no campo "opcoes", SEM alterar nenhuma palavra, sem resumir e sem trocar o texto da opção por explicações ou metas-comentários.
   - Para questões discursivas/dissertativas: forneça A RESPOSTA EXATA, COMPLETA E DIRETA para a pergunta formulada, sem introduções metalinguísticas ou redações genéricas como "Expectativa de resposta:...".
   - NUNCA mude nada do texto da resposta.
4. Responda estritamente em JSON no formato especificado abaixo.

ESTRUTURA DE RESPOSTA EM JSON (REQUERIDA):

{
  "titulo": "Material Pedagógico Aula Clara - [Tema Central]",
  "tema": "[Tema Central Extraído da Apostila]",
  "objetivo": "Objetivo Geral do Conteúdo",
  "habilidadesBNCC": [
    {
      "codigo": "Ex: EF08HI01",
      "descricao": "Descrição oficial da habilidade da BNCC"
    }
  ],
  "unidadeTematica": "Unidade temática correspondente",
  "objetoConhecimento": "Objeto de conhecimento correspondente",
  "conteudoEscaneadoOCR": "--- TRANSCRIÇÃO INTEGRAL DAS PÁGINAS/IMAGENS ENVIADAS ---\n\n[Insira aqui TODO O TEXTO LITERALMENTE LIDO E DIGITALIZADO DAS IMAGENS, SEM QUALQUER OMISSÃO OU RESUMO...]",

  ${
    !isOnlyProva
      ? `"possibilidade1_planoDeAula": {
    "titulo": "${isEdFisicaPratica ? 'Plano de Aula Prática de Educação Física: [Nome da Atividade Competitiva]' : 'Plano de Aula: [Tema]'} ",
    "tema": "[Tema da Aula]",
    "objetivo": "[Objetivo de Aprendizagem e Habilidade Prática]",
    "habilidadesBNCC": [
      {
        "codigo": "Ex: EF08EF01",
        "descricao": "Descrição oficial da habilidade BNCC"
      }
    ],
    "materiais": [
      "Lista de materiais necessários..."
    ],
    "tempoEstimado": "2 aulas de 50 min",
    "desenvolvimentoOuPassoAPasso": [
      "1. Abertura e Aquecimento Competitivo (10 min)...",
      "2. Divisão das Equipes e Estratégia do Jogo (10 min)...",
      "3. Execução da Dinâmica Prática Competitiva (25 min)...",
      "4. Apuração do Time Vencedor, Reflexão Pedagógica e Volta à Calma (5 min)..."
    ],
    "regrasOuProcedimentos": [
      "Regra 1: Sistema de pontuação...",
      "Regra 2: Penalidades e faltas...",
      "Regra 3: Normas de segurança..."
    ],
    "variacoes": [
      "Variação 1: Aumento de intensidade...",
      "Variação 2: Adaptação inclusiva..."
    ],
    "numAlunos": "16-30",
    "espaco": "Meia quadra",
    "nivel": "Intermediário",
    "formacao": "2 equipes",
    "organizacao": "Divida a turma em duas equipes iguais. Monte duas bases com cones no fundo do campo.",
    "dicaProfessor": "Não permita arremessos no rosto. Incentive passes rápidos entre os alunos antes do lançamento.",
    "tipoQuadra": "queimada",
    "avaliacao": "Avaliação formativa através de participação, espírito esportivo e trabalho em equipe.",
    "markdownCompleto": "Versão em Markdown completa do Plano de Aula."
  }${!isOnlyAula ? ',' : ''}`
      : ''
  }

  ${
    !isOnlyAula
      ? `"possibilidade2_provaAvaliacao": {
    "titulo": "Prova / Avaliação Bimestral de ${disciplina}",
    "tema": "[Conteúdo Avaliado]",
    "objetivo": "Verificar a consolidação das habilidades BNCC",
    "habilidadesBNCC": [
      {
        "codigo": "Ex: EF08HI01",
        "descricao": "Descrição oficial da habilidade"
      }
    ],
    "questoes": [
      {
        "numero": 1,
        "tipo": "Múltipla Escolha",
        "enunciado": "1) [Múltipla Escolha] Considerando o conteúdo...",
        "opcoes": ["A) Opção A...", "B) Opção B...", "C) Opção C...", "D) Opção D...", "E) Opção E..."],
        "respostaGabarito": "A) [Texto literal e exato da opção A escolhida como correta, sem mudar nenhuma palavra]"
      },
      {
        "numero": 2,
        "tipo": "Múltipla Escolha",
        "enunciado": "2) [Múltipla Escolha] Assinale a alternativa que indica...",
        "opcoes": ["A) Opção A...", "B) Opção B...", "C) Opção C...", "D) Opção D...", "E) Opção E..."],
        "respostaGabarito": "B) [Texto literal e exato da opção B escolhida como correta, sem mudar nenhuma palavra]"
      },
      {
        "numero": 3,
        "tipo": "Múltipla Escolha",
        "enunciado": "3) [Múltipla Escolha] Sobre os conceitos vistos...",
        "opcoes": ["A) Opção A...", "B) Opção B...", "C) Opção C...", "D) Opção D...", "E) Opção E..."],
        "respostaGabarito": "C) [Texto literal e exato da opção C escolhida como correta, sem mudar nenhuma palavra]"
      },
      {
        "numero": 4,
        "tipo": "Múltipla Escolha",
        "enunciado": "4) [Múltipla Escolha] Analise as afirmativas a seguir...",
        "opcoes": ["A) Opção A...", "B) Opção B...", "C) Opção C...", "D) Opção D...", "E) Opção E..."],
        "respostaGabarito": "D) [Texto literal e exato da opção D escolhida como correta, sem mudar nenhuma palavra]"
      },
      {
        "numero": 5,
        "tipo": "Múltipla Escolha",
        "enunciado": "5) [Múltipla Escolha] Marque a opção em conformidade...",
        "opcoes": ["A) Opção A...", "B) Opção B...", "C) Opção C...", "D) Opção D...", "E) Opção E..."],
        "respostaGabarito": "E) [Texto literal e exato da opção E escolhida como correta, sem mudar nenhuma palavra]"
      },
      {
        "numero": 6,
        "tipo": "Discursiva",
        "enunciado": "6) [Dissertativa] Explique a principal relação entre os fatos apresentados.",
        "respostaGabarito": "[Resposta literal, direta e completa da pergunta 6, sem usar metas-comentários]"
      },
      {
        "numero": 7,
        "tipo": "Discursiva",
        "enunciado": "7) [Dissertativa] Diferencie os conceitos fundamentais discutidos.",
        "respostaGabarito": "[Resposta literal, direta e completa da pergunta 7, sem usar metas-comentários]"
      },
      {
        "numero": 8,
        "tipo": "Discursiva",
        "enunciado": "8) [Dissertativa] Apresente um exemplo prático de aplicação no cotidiano.",
        "respostaGabarito": "[Resposta literal, direta e completa da pergunta 8, sem usar metas-comentários]"
      },
      {
        "numero": 9,
        "tipo": "Discursiva",
        "enunciado": "9) [Dissertativa] Justifique a importância de compreender este conteúdo.",
        "respostaGabarito": "[Resposta literal, direta e completa da pergunta 9, sem usar metas-comentários]"
      },
      {
        "numero": 10,
        "tipo": "Discursiva",
        "enunciado": "10) [Dissertativa] Elabore uma conclusão crítica sobre o tema.",
        "respostaGabarito": "[Resposta literal, direta e completa da pergunta 10, sem usar metas-comentários]"
      }
    ],
    "gabaritoSeparado": "--- GABARITO OFICIAL E LITERAL ---\n\n1. A) [Texto exato da opção A]\n2. B) [Texto exato da opção B]\n3. C) [Texto exato da opção C]\n4. D) [Texto exato da opção D]\n5. E) [Texto exato da opção E]\n6. [Resposta direta e completa da Q6]\n7. [Resposta direta e completa da Q7]\n8. [Resposta direta e completa da Q8]\n9. [Resposta direta e completa da Q9]\n10. [Resposta direta e completa da Q10]",
    "avaliacao": "Prova no valor total de 10,0 pontos (1,0 ponto por questão).",
    "markdownCompleto": "Versão em Markdown da prova."
  }`
      : ''
  }
}
`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: { parts },
      config: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '';
    let parsedResult: any;
    try {
      const cleanedText = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      parsedResult = JSON.parse(cleanedText);
    } catch (parseError) {
      console.warn('JSON parse error, attempting regex extraction:', parseError);
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsedResult = JSON.parse(match[0]);
        } catch {
          parsedResult = {
            titulo: `${tipo} - ${disciplina}`,
            markdownCompleto: rawText,
            habilidadesBNCC: [],
          };
        }
      } else {
        parsedResult = {
          titulo: `${tipo} - ${disciplina}`,
          markdownCompleto: rawText,
          habilidadesBNCC: [],
        };
      }
    }

    // Ensure fallback mappings between root properties and sub-possibility objects
    if (parsedResult.possibilidade1_planoDeAula) {
      if (!parsedResult.desenvolvimentoOuPassoAPasso || parsedResult.desenvolvimentoOuPassoAPasso.length === 0) {
        parsedResult.desenvolvimentoOuPassoAPasso = parsedResult.possibilidade1_planoDeAula.desenvolvimentoOuPassoAPasso || [];
      }
      if (!parsedResult.tempoEstimado) {
        parsedResult.tempoEstimado = parsedResult.possibilidade1_planoDeAula.tempoEstimado;
      }
      if (!parsedResult.materiais) {
        parsedResult.materiais = parsedResult.possibilidade1_planoDeAula.materiais;
      }
      if (!parsedResult.regrasOuProcedimentos) {
        parsedResult.regrasOuProcedimentos = parsedResult.possibilidade1_planoDeAula.regrasOuProcedimentos || [];
      }
      if (!parsedResult.variacoes) {
        parsedResult.variacoes = parsedResult.possibilidade1_planoDeAula.variacoes || [];
      }
    }

    if (parsedResult.possibilidade2_provaAvaliacao) {
      if (!parsedResult.questoes || parsedResult.questoes.length === 0) {
        parsedResult.questoes = parsedResult.possibilidade2_provaAvaliacao.questoes || [];
      }
      if (!parsedResult.gabaritoSeparado) {
        parsedResult.gabaritoSeparado = parsedResult.possibilidade2_provaAvaliacao.gabaritoSeparado || '';
      }
    }

    if (!parsedResult.conteudoEscaneadoOCR || parsedResult.conteudoEscaneadoOCR.trim().length === 0) {
      if (texto_ocr && texto_ocr.trim().length > 0) {
        parsedResult.conteudoEscaneadoOCR = texto_ocr;
      }
    }

    res.json({
      success: true,
      data: parsedResult,
      rawText,
    });
  } catch (error: any) {
    console.error('Erro na geração pedagógica:', error);
    res.status(500).json({
      error: error.message || 'Falha ao processar solicitação pedagógica.',
    });
  }
});

// Endpoint: Gerador de Parecer Pedagógico Descritivo do Aluno
app.post('/api/generate-report', async (req, res) => {
  try {
    const {
      nomeAluno,
      turma,
      disciplina,
      periodo,
      nivelDesempenho,
      aspectosComportamentais,
      observacaoProf,
    } = req.body;

    if (!nomeAluno || !disciplina) {
      return res.status(400).json({
        error: 'Por favor, informe ao menos o Nome do Aluno e a Disciplina.',
      });
    }

    const ai = getGenAI();

    const reportPrompt = `
Você é uma inteligência especialista em Pedagogia, Psicopedagogia e Avaliação Qualitativa alinhada à BNCC (Base Nacional Comum Curricular).
Sua tarefa é redigir um **PARECER PEDAGÓGICO DESCRITIVO INDIVIDUAL** acolhedor, profissional e construtivo para ser entregue à coordenação escolar ou aos pais e responsáveis no boletim/ficha de avaliação.

DADOS DO ALUNO:
- Nome do Aluno: ${nomeAluno}
- Turma/Ano: ${turma || 'Ensino Fundamental'}
- Componente Curricular: ${disciplina}
- Período Avaliado: ${periodo || '1º Bimestre'}
- Nível de Desempenho Acadêmico: ${nivelDesempenho || 'Atingiu os Objetivos'}
- Aspectos Comportamentais e Socioemocionais observados pelo professor: ${
      Array.isArray(aspectosComportamentais) && aspectosComportamentais.length > 0
        ? aspectosComportamentais.join(', ')
        : 'Participação regular nas atividades'
    }
${observacaoProf ? `- Observações específicas do professor: ${observacaoProf}` : ''}

ESTRUTURA OBRIGATÓRIA DO PARECER (Dividido em 3 parágrafos fluídos e bem pontuados):

1. **Parágrafo 1 – Desempenho Cognitivo e Acadêmico na Disciplina**: Descreva o progresso do estudante na aprendizagem dos conceitos de ${disciplina}, destacando conquistas e habilidades BNCC desenvolvidas.
2. **Parágrafo 2 – Aspectos Socioemocionais, Atitude e Convivência em Sala**: Aborde a postura do estudante em sala de aula, relacionamento com colegas, nível de foco, colaboração, engajamento e participação nas atividades.
3. **Parágrafo 3 – Recomendações Pedagógicas e Próximos Passos**: Finalize com incentivo construtivo, direcionando ações para a família e coordenação ajudarem o estudante a continuar evoluindo no próximo período.

Tom de voz: Respeitoso, construtivo, encorajador, ético e focado no potencial de desenvolvimento do aluno. Sem rótulos pejorativos. Use linguagem formal e pedagógica impecável.

Retorne APENAS um JSON no formato:
{
  "titulo": "Parecer Pedagógico Descritivo Individual - ${nomeAluno}",
  "relatorioMarkdown": "[Texto em Markdown formatado com os 3 parágrafos bem estruturados]",
  "pontosFortes": ["Ponto 1", "Ponto 2", "Ponto 3"],
  "pontosAtencao": ["Orientação 1", "Orientação 2"]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: reportPrompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5,
      },
    });

    const rawJson = response.text || '{}';
    let data;
    try {
      data = JSON.parse(rawJson);
    } catch {
      data = {
        titulo: `Parecer Pedagógico Descritivo - ${nomeAluno}`,
        relatorioMarkdown: rawJson,
        pontosFortes: [],
        pontosAtencao: [],
      };
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Erro ao gerar parecer pedagógico:', error);
    res.status(500).json({
      error: error.message || 'Falha ao gerar o parecer pedagógico.',
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor Gerador Pedagógico BNCC rodando em http://localhost:${PORT}`);
  });
}

startServer();
