// Shapes for each AI-generated report section. These match the JSON the
// Claude model is instructed to return and the columns in the relatorios table.

export interface ClassificacaoIA {
  nivel: "Iniciante" | "Intermediário" | "Avançado";
  justificativa: string;
}

export interface RiscoItem {
  nivel: Criticidade;
  descricao: string;
  evitar: string[];
  fazer: string[];
}

export interface RiscosIA {
  cardiovascular: RiscoItem;
  ortopedico: RiscoItem;
  comportamental: RiscoItem;
}

export interface FatoresAbandonoIA {
  riscos_identificados: string[];
  estrategias: string[];
}

export interface PerfilComportamentalIA {
  perfil: "Analítico" | "Competitivo" | "Executor" | "Emocional";
  justificativa: string;
}

export interface MapaConstrucaoIA {
  pontos_fortes: string[];
  pontos_fracos: string[];
  gargalos: string[];
  oportunidades: string[];
}

export interface ExercicioRecomendado {
  grupo_muscular: string;
  exercicios: string[];
  justificativa: string;
}

export type ExerciciosIA = ExercicioRecomendado[];

export interface ExercicioEvitar {
  exercicio: string;
  justificativa: string;
}

export type ExerciciosEvitarIA = ExercicioEvitar[];

export interface ProtocoloItem {
  alvo: string;
  exercicio: string;
  motivo: string;
}

export type ProtocoloIA = ProtocoloItem[];

export interface AquecimentoIA {
  descricao: string;
  passos: string[];
}

// ---------------------------------------------------------------------------
// Expanded DivisaoTreino — all new fields are optional for backward compat
// ---------------------------------------------------------------------------

export interface ExercicioGrupoDivisao {
  grupo_muscular: string;
  ordem: number;
  principais: string[];
  secundarios?: string[];
  acessorios?: string[];
  justificativa?: string;
}

export interface IntensidadeDivisao {
  rir: string;
  rpe: string;
  proximidade_falha: string;
  justificativa?: string;
}

export interface TecnicaAvancadaDivisao {
  tecnica: string;
  quando_usar?: string;
  justificativa?: string;
}

export interface ProgressaoDivisao {
  tipo: string;
  descricao: string;
  criterio?: string;
}

export interface VolumeMuscularDivisao {
  grupo_muscular: string;
  series_min: number;
  series_max: number;
  justificativa?: string;
}

export interface FaixaRepeticoesDivisao {
  categoria: string;
  faixa: string;
  justificativa?: string;
}

export interface DivisaoTreino {
  nome: string;
  estrutura: string;
  pros: string[];
  contras: string[];
  // Strategy fields:
  explicacao_escolha?: string;
  encaixe_rotina?: string;
  encaixe_objetivos?: string;
  encaixe_limitacoes?: string;
  encaixe_recuperacao?: string;
  exercicios_por_grupo?: ExercicioGrupoDivisao[];
  faixas_repeticoes?: FaixaRepeticoesDivisao[];
  volume_detalhado?: VolumeMuscularDivisao[];
  intensidade?: IntensidadeDivisao;
  tecnicas_avancadas?: TecnicaAvancadaDivisao[];
  progressao?: ProgressaoDivisao[];
  resumo_executivo_divisao?: string;
}

export type DivisoesTreinoIA = DivisaoTreino[];

export interface VolumeMuscular {
  grupo_muscular: string;
  series_semanais: string;
}

export type VolumeSemanalIA = VolumeMuscular[];

export interface FasePeriodizacao {
  duracao: "4 semanas" | "8 semanas" | "12 semanas";
  estrategia: string;
  racional: string;
}

export type PeriodizacaoIA = FasePeriodizacao[];

export interface ScoresIA {
  potencial_resultado: number;
  potencial_aderencia: number;
  risco_lesao: number;
  risco_abandono: number;
}

export interface PlanoRetencaoIA {
  estrategias: string[];
  tarefas: string[];
}

export interface AnalisePosturalIA {
  desvios_relatados: string[];
  nivel_confianca: "Confirmado por profissional" | "Provável" | "Autopercepção" | "Não confirmado";
  impactos_treino: string[];
  cuidados_recomendados: string[];
  exercicios_atencao: string[];
  exercicios_corretivos: string[];
  mobilidade_sugerida: string[];
  fortalecimento_sugerido: string[];
}

export interface PerformanceEsportivaIA {
  esporte: string;
  demandas_fisicas: string[];
  riscos_especificos: string[];
  capacidades_prioritarias: string[];
  grupos_musculares_chave: string[];
  limitacoes_identificadas: string[];
  treino_complementar: string[];
  mobilidade_especifica: string[];
  preventivo: string[];
}

export interface EvolucaoAlunoIA {
  melhorou: string[];
  piorou: string[];
  permaneceu: string[];
  novos_riscos: string[];
  novas_oportunidades: string[];
}

export interface RelatorioIA {
  resumo_executivo: string;
  classificacao: ClassificacaoIA;
  riscos: RiscosIA;
  fatores_abandono: FatoresAbandonoIA;
  perfil_comportamental: PerfilComportamentalIA;
  mapa_construcao_fisica: MapaConstrucaoIA;
  exercicios_recomendados: ExerciciosIA;
  exercicios_evitar: ExerciciosEvitarIA;
  protocolo_mobilidade: ProtocoloIA;
  protocolo_alongamento: ProtocoloIA;
  aquecimento: AquecimentoIA;
  divisoes_treino: DivisoesTreinoIA;
  volume_semanal: VolumeSemanalIA;
  periodizacao: PeriodizacaoIA;
  scores: ScoresIA;
  plano_retencao: PlanoRetencaoIA;
  performance_esportiva?: PerformanceEsportivaIA;
  analise_postural?: AnalisePosturalIA;
  evolucao_aluno?: EvolucaoAlunoIA;
}

import type { Criticidade } from "./database";
