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

export interface DivisaoTreino {
  nome: string;
  estrutura: string;
  pros: string[];
  contras: string[];
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
}

import type { Criticidade } from "./database";
