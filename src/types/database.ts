export type StatusAluno = "novo" | "ativo" | "inativo";
export type SexoAluno = "M" | "F" | "Outro";
export type StatusAnamnese = "pendente" | "em_progresso" | "concluida";
export type StatusRelatorio = "pendente" | "gerando" | "concluido" | "falhou";
export type TipoAlerta =
  | "cardiovascular"
  | "ortopedico"
  | "comportamental"
  | "inatividade"
  | "check_in_perdido";
export type Criticidade = "alta" | "media" | "baixa";
export type CanalComunicacao = "whatsapp" | "email" | "sistema";
export type TipoComunicacao =
  | "boas_vindas"
  | "lembrete_anamnese"
  | "checkin"
  | "motivacional"
  | "reavaliacao"
  | "alerta";

export interface PersonalTrainer {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  telefone: string | null;
  whatsapp_config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Aluno {
  id: string;
  personal_id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  whatsapp: string | null;
  idade: number | null;
  sexo: SexoAluno | null;
  altura_cm: number | null;
  peso_kg: number | null;
  observacoes: string | null;
  status: StatusAluno;
  token_anamnese: string;
  created_at: string;
  updated_at: string;
}

export interface Anamnese {
  id: string;
  aluno_id: string;
  versao: number;
  status: StatusAnamnese;
  respostas: Record<string, unknown>;
  progresso_percentual: number;
  iniciada_em: string | null;
  concluida_em: string | null;
  created_at: string;
}

export interface Relatorio {
  id: string;
  anamnese_id: string;
  aluno_id: string;
  versao: number;
  status: StatusRelatorio;
  resumo_executivo: string | null;
  classificacao: ClassificacaoIA | null;
  riscos: RiscosIA | null;
  fatores_abandono: FatoresAbandonoIA | null;
  perfil_comportamental: PerfilComportamentalIA | null;
  mapa_construcao_fisica: MapaConstrucaoIA | null;
  exercicios_recomendados: ExerciciosIA | null;
  exercicios_evitar: ExerciciosEvitarIA | null;
  protocolo_mobilidade: ProtocoloIA | null;
  protocolo_alongamento: ProtocoloIA | null;
  aquecimento: AquecimentoIA | null;
  divisoes_treino: DivisoesTreinoIA | null;
  volume_semanal: VolumeSemanalIA | null;
  periodizacao: PeriodizacaoIA | null;
  scores: ScoresIA | null;
  plano_retencao: PlanoRetencaoIA | null;
  performance_esportiva: PerformanceEsportivaIA | null;
  analise_postural: AnalisePosturalIA | null;
  evolucao_aluno: EvolucaoAlunoIA | null;
  tokens_ia_usados: number | null;
  gerado_em: string | null;
  created_at: string;
}

export interface Alerta {
  id: string;
  aluno_id: string;
  personal_id: string;
  tipo: TipoAlerta;
  criticidade: Criticidade;
  titulo: string;
  descricao: string | null;
  lido: boolean;
  resolvido: boolean;
  created_at: string;
  resolved_at: string | null;
}

export interface Checkin {
  id: string;
  aluno_id: string;
  semana_referencia: string | null;
  energia: number | null;
  sono: number | null;
  treinos_realizados: number;
  treinos_esperados: number;
  dores_relatadas: string | null;
  humor_geral: number | null;
  comentario_livre: string | null;
  created_at: string;
}

export interface Observacao {
  id: string;
  aluno_id: string;
  personal_id: string;
  conteudo: string;
  tipo: "geral" | "treino" | "comportamental" | "nutricao";
  created_at: string;
}

export interface ComunicacaoLog {
  id: string;
  aluno_id: string;
  canal: CanalComunicacao;
  tipo: TipoComunicacao;
  status: "enviado" | "falhou" | "pendente";
  payload: Record<string, unknown>;
  created_at: string;
}

// ---- AI report section shapes (re-exported from relatorio.ts) ----
import type {
  ClassificacaoIA,
  RiscosIA,
  FatoresAbandonoIA,
  PerfilComportamentalIA,
  MapaConstrucaoIA,
  ExerciciosIA,
  ExerciciosEvitarIA,
  ProtocoloIA,
  AquecimentoIA,
  DivisoesTreinoIA,
  VolumeSemanalIA,
  PeriodizacaoIA,
  ScoresIA,
  PlanoRetencaoIA,
  PerformanceEsportivaIA,
  AnalisePosturalIA,
  EvolucaoAlunoIA,
} from "./relatorio";
