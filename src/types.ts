export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
  school?: string;
  subject?: string;
  hasCompletedOnboarding?: boolean;
  loggedInAt: string;
  createdAt?: string; // ISO string when user first registered
  trialDaysTotal?: number; // Default 30 days
  trialEndsAt?: string; // ISO string when trial expires
  isVitalicio?: boolean; // Admin / Unlimited access
  status?: 'Ativo' | 'Bloqueado';
}

export type DisciplinaType =
  | 'Língua Portuguesa'
  | 'Matemática'
  | 'História'
  | 'Geografia'
  | 'Ciências'
  | 'Arte'
  | 'Educação Física'
  | 'Ensino Religioso'
  | 'Inglês'
  | 'Física'
  | 'Química'
  | 'Biologia'
  | 'Filosofia'
  | 'Sociologia';

export type SegmentoType =
  | 'Educação Infantil'
  | 'Ensino Fundamental – Anos Iniciais'
  | 'Ensino Fundamental – Anos Finais'
  | 'Ensino Médio';

export type TipoMaterialType =
  | 'Ambas as Possibilidades (Aula + Prova)'
  | 'Plano de Aula'
  | 'Atividade'
  | 'Atividade Prática'
  | 'Prova';

export interface BnccSkill {
  codigo: string;
  descricao: string;
  disciplina: DisciplinaType;
  segmento: SegmentoType;
  ano: string;
  unidadeTematica?: string;
  objetoConhecimento?: string;
}

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  previewUrl: string;
  base64: string;
}

export interface GeneratorInput {
  disciplina: DisciplinaType;
  segmento: SegmentoType;
  ano: string;
  tipo: TipoMaterialType;
  texto_ocr: string;
  files: AttachedFile[];
  tipoAulaEdFisica?: 'Teórica' | 'Prática';
  quantidadeAulas?: number;
}

export interface TurmaFolder {
  id: string;
  nome: string;
  createdAt?: string;
}

export interface ProvaQuestao {
  numero: number;
  tipo: 'Múltipla Escolha' | 'Discursiva';
  enunciado: string;
  opcoes?: string[];
  respostaGabarito: string;
}

export interface SinglePossibilityMaterial {
  titulo: string;
  tema?: string;
  objetivo?: string;
  habilidadesBNCC: {
    codigo: string;
    descricao: string;
  }[];
  unidadeTematica?: string;
  objetoConhecimento?: string;
  materiais?: string[];
  tempoEstimado?: string;
  desenvolvimentoOuPassoAPasso?: string[];
  regrasOuProcedimentos?: string[];
  variacoes?: string[];
  questoes?: ProvaQuestao[];
  gabaritoSeparado?: string;
  avaliacao?: string;
  observacoesPedagogicas?: string;
  markdownCompleto: string;
  conteudoEscaneadoOCR?: string;

  // Educação Física Card Specific Parameters
  numAlunos?: string;
  espaco?: string;
  nivel?: string;
  formacao?: string;
  organizacao?: string;
  dicaProfessor?: string;
  tipoQuadra?: string;
}

export interface MaterialResultData {
  id?: string;
  titulo: string;
  tema?: string;
  objetivo?: string;
  habilidadesBNCC: {
    codigo: string;
    descricao: string;
  }[];
  unidadeTematica?: string;
  objetoConhecimento?: string;
  materiais?: string[];
  tempoEstimado?: string;
  desenvolvimentoOuPassoAPasso?: string[];
  regrasOuProcedimentos?: string[];
  variacoes?: string[];
  questoes?: ProvaQuestao[];
  gabaritoSeparado?: string;
  avaliacao?: string;
  observacoesPedagogicas?: string;
  markdownCompleto: string;
  conteudoEscaneadoOCR?: string;
  createdAt?: string;
  disciplina?: DisciplinaType;
  segmento?: SegmentoType;
  ano?: string;
  tipo?: TipoMaterialType;

  // Educação Física Card Specific Parameters
  numAlunos?: string;
  espaco?: string;
  nivel?: string;
  formacao?: string;
  organizacao?: string;
  dicaProfessor?: string;
  tipoQuadra?: string;

  // Folder & Regimento Organization
  turmaId?: string;
  turmaNome?: string;
  bimestre?: '1º Bimestre' | '2º Bimestre' | '3º Bimestre' | '4º Bimestre';
  quantidadeAulas?: number;

  // Dual Possibilities
  possibilidade1_planoDeAula?: SinglePossibilityMaterial;
  possibilidade2_provaAvaliacao?: SinglePossibilityMaterial;
}

export interface SamplePreset {
  id: string;
  title: string;
  disciplina: DisciplinaType;
  segmento: SegmentoType;
  ano: string;
  tipo: TipoMaterialType;
  ocrText: string;
  description: string;
}
