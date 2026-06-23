import type { DivisaoTreino } from "@/types/relatorio";
import type { Respostas } from "@/types/anamnese";
import { PERGUNTAS } from "@/lib/anamnese/flow-engine";

export function montarPromptEstrategia(
  divisao: DivisaoTreino,
  respostas: Respostas,
): string {
  const camposRelevantes = [
    "objetivos", "nivel_experiencia", "dias_disponiveis", "tempo_sessao",
    "local_treino", "orto_regioes", "cardio_itens", "peso", "altura",
    "sono_horas", "estresse", "fadiga",
  ];

  const linhas: string[] = [];
  for (const p of PERGUNTAS) {
    if (!camposRelevantes.includes(p.id)) continue;
    const r = respostas[p.id];
    if (r === undefined || r === null || r === "") continue;
    const valor = Array.isArray(r) ? r.join(", ") : String(r);
    linhas.push(`${p.titulo}: ${valor}`);
  }

  return `Especialista em treino. SEJA CONCISO — máximo 1 frase por campo de texto.

Aluno: ${linhas.join(" | ")}
Divisão: ${divisao.nome} (${divisao.estrutura})

Responda SOMENTE com JSON válido, sem markdown:
{
  "explicacao_escolha": "1 frase",
  "encaixe_rotina": "1 frase",
  "encaixe_objetivos": "1 frase",
  "encaixe_limitacoes": "1 frase",
  "encaixe_recuperacao": "1 frase",
  "exercicios_por_grupo": [
    { "grupo_muscular": "nome", "ordem": 1, "principais": ["ex1", "ex2"], "secundarios": ["ex1"], "acessorios": ["ex1"], "justificativa": "1 frase" }
  ],
  "faixas_repeticoes": [
    { "categoria": "Compostos", "faixa": "4x5-8", "justificativa": "1 frase" },
    { "categoria": "Isoladores", "faixa": "3x12-15", "justificativa": "1 frase" }
  ],
  "volume_detalhado": [
    { "grupo_muscular": "nome", "series_min": 10, "series_max": 16, "justificativa": "1 frase" }
  ],
  "intensidade": { "rir": "RIR 2-3", "rpe": "RPE 7-8", "proximidade_falha": "1 frase", "justificativa": "1 frase" },
  "tecnicas_avancadas": [{ "tecnica": "nome", "quando_usar": "1 frase", "justificativa": "1 frase" }],
  "progressao": [{ "tipo": "carga", "descricao": "1 frase", "criterio": "1 frase" }],
  "resumo_executivo_divisao": "2 frases"
}`;
}
