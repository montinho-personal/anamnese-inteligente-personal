import type { DivisaoTreino } from "@/types/relatorio";
import type { Respostas } from "@/types/anamnese";
import { PERGUNTAS } from "@/lib/anamnese/flow-engine";

export function montarPromptEstrategia(
  divisao: DivisaoTreino,
  respostas: Respostas,
): string {
  // Only include the most relevant fields to keep the prompt short
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
    linhas.push(`- ${p.titulo}: ${valor}`);
  }

  return `Especialista em treino. Aluno: ${linhas.join(" | ")}

Divisão: ${divisao.nome} (${divisao.estrutura})

Gere JSON compacto e direto, sem texto fora do JSON:
{
  "explicacao_escolha": "string curto",
  "encaixe_rotina": "string curto",
  "encaixe_objetivos": "string curto",
  "encaixe_limitacoes": "string curto",
  "encaixe_recuperacao": "string curto",
  "exercicios_por_grupo": [
    { "grupo_muscular": "string", "ordem": 1, "principais": ["string"], "secundarios": ["string"], "acessorios": ["string"], "justificativa": "string" }
  ],
  "faixas_repeticoes": [
    { "categoria": "Compostos", "faixa": "4x5-8", "justificativa": "string" },
    { "categoria": "Isoladores", "faixa": "3x12-15", "justificativa": "string" }
  ],
  "volume_detalhado": [
    { "grupo_muscular": "string", "series_min": 0, "series_max": 0, "justificativa": "string" }
  ],
  "intensidade": { "rir": "string", "rpe": "string", "proximidade_falha": "string", "justificativa": "string" },
  "tecnicas_avancadas": [{ "tecnica": "string", "quando_usar": "string", "justificativa": "string" }],
  "progressao": [{ "tipo": "carga", "descricao": "string", "criterio": "string" }],
  "resumo_executivo_divisao": "string curto"
}`;
}
