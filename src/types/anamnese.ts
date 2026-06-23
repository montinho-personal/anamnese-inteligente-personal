export type RespostaValor = string | number | string[] | boolean | null;
export type Respostas = Record<string, RespostaValor>;

export type TipoPergunta =
  | "texto"
  | "numero"
  | "textarea"
  | "escolha_unica"
  | "escolha_multipla"
  | "escala"
  | "sim_nao";

export interface OpcaoPergunta {
  valor: string;
  label: string;
}

export interface Pergunta {
  id: string;
  secao: string;
  titulo: string;
  descricao?: string;
  tipo: TipoPergunta;
  opcoes?: OpcaoPergunta[];
  escalaMin?: number;
  escalaMax?: number;
  escalaLabelMin?: string;
  escalaLabelMax?: string;
  placeholder?: string;
  dica?: string;
  escalaLabels?: string[];
  obrigatoria?: boolean;
  // Conditional: only show this question if the predicate over current answers is true.
  condicao?: (respostas: Respostas) => boolean;
  // If answering this triggers a critical alert, describe it.
  gatilhoAlerta?: (valor: RespostaValor) => boolean;
}

export interface SecaoAnamnese {
  id: string;
  titulo: string;
  descricao: string;
}

export interface AlertaGatilho {
  tipo: "cardiovascular" | "ortopedico";
  criticidade: "alta" | "media" | "baixa";
  titulo: string;
  descricao: string;
}
