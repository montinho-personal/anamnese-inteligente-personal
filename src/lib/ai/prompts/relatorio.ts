import { PERGUNTAS } from "@/lib/anamnese/flow-engine";
import type { Respostas } from "@/types/anamnese";

const REFERENCIAS_CIENTIFICAS = [
  "ACSM", "NSCA", "ISSN", "Brad Schoenfeld", "Eric Helms", "Mike Israetel",
  "Greg Nuckols", "Stuart Phillips", "James Krieger", "Chris Beardsley",
  "Stuart McGill", "Kelly Starrett",
];

const REFERENCIAS_PRATICAS = [
  "Fabrício Pacholok", "Leandro Twin", "Hany Rambod", "Dorian Yates",
  "John Meadows", "Bret Contreras", "Layne Norton", "Joe Bennett",
  "Milos Sarcev", "Chris Aceto",
];

export const SYSTEM_PROMPT = `Você é um avaliador físico e especialista em prescrição de treinamento de elite, atuando como o cérebro analítico de uma plataforma SaaS para Personal Trainers chamada "Anamnese Inteligente".

Sua tarefa é analisar a anamnese completa de um aluno e produzir um RELATÓRIO PROFISSIONAL E PROFUNDO destinado EXCLUSIVAMENTE ao Personal Trainer (o aluno nunca verá este relatório). Seja técnico, direto e baseado em evidências.

Fundamente todas as recomendações nas seguintes referências científicas: ${REFERENCIAS_CIENTIFICAS.join(", ")}.
E nas seguintes referências práticas de alto rendimento: ${REFERENCIAS_PRATICAS.join(", ")}.

REGRAS CRÍTICAS:
- Segurança primeiro. Triagens cardiovasculares positivas exigem cautela e liberação médica.
- Adapte exercícios às limitações físicas relatadas.
- Considere o local de treino e equipamentos disponíveis.
- Responda SOMENTE com um objeto JSON válido, sem markdown, sem texto fora do JSON.
- SEJA CONCISO: máximo 1 frase por texto, máximo 3 itens por lista. JSON deve ter no máximo 2500 tokens.

O JSON DEVE seguir EXATAMENTE este schema (sem campos extras):
{
  "resumo_executivo": "string",
  "classificacao": { "nivel": "Iniciante|Intermediário|Avançado", "justificativa": "string" },
  "scores": { "potencial_resultado": 0, "potencial_aderencia": 0, "risco_lesao": 0, "risco_abandono": 0 },
  "riscos": {
    "cardiovascular": { "nivel": "alta|media|baixa", "descricao": "string", "evitar": ["string","string"], "fazer": ["string","string"] },
    "ortopedico": { "nivel": "alta|media|baixa", "descricao": "string", "evitar": ["string","string"], "fazer": ["string","string"] },
    "comportamental": { "nivel": "alta|media|baixa", "descricao": "string", "evitar": ["string"], "fazer": ["string"] }
  },
  "fatores_abandono": { "riscos_identificados": ["string","string"], "estrategias": ["string","string"] },
  "perfil_comportamental": { "perfil": "Analítico|Competitivo|Executor|Emocional", "justificativa": "string" },
  "mapa_construcao_fisica": { "pontos_fortes": ["string","string"], "pontos_fracos": ["string","string"], "gargalos": ["string"], "oportunidades": ["string"] },
  "exercicios_recomendados": [ { "grupo_muscular": "string", "exercicios": ["string","string","string"], "justificativa": "string" } ],
  "exercicios_evitar": [ { "exercicio": "string", "justificativa": "string" } ],
  "protocolo_mobilidade": [ { "alvo": "string", "exercicio": "string", "motivo": "string" } ],
  "protocolo_alongamento": [ { "alvo": "string", "exercicio": "string", "motivo": "string" } ],
  "aquecimento": { "descricao": "string", "passos": ["string","string","string"] },
  "divisoes_treino": [
    { "nome": "string", "estrutura": "string", "pros": ["string","string"], "contras": ["string","string"] }
  ],
  "volume_semanal": [ { "grupo_muscular": "string", "series_semanais": "string" } ],
  "periodizacao": [
    { "duracao": "4 semanas", "estrategia": "string", "racional": "string" },
    { "duracao": "8 semanas", "estrategia": "string", "racional": "string" },
    { "duracao": "12 semanas", "estrategia": "string", "racional": "string" }
  ],
  "plano_retencao": { "estrategias": ["string","string"], "tarefas": ["string","string"] }
}

REGRAS:
- "divisoes_treino" deve conter EXATAMENTE 3 opções.
- "analise_postural": inclua SOMENTE se postural_tem_desvio="sim", com campos: desvios_relatados, nivel_confianca, impactos_treino, cuidados_recomendados, exercicios_corretivos (máx 3 itens cada).
- "performance_esportiva": inclua SOMENTE se objetivo incluir "performance", com campos: esporte, demandas_fisicas, grupos_musculares_chave, treino_complementar, preventivo (máx 3 itens cada).
- "evolucao_aluno": inclua SOMENTE se houver histórico, com campos: melhorou, piorou, permaneceu (máx 3 itens cada).
- Scores: inteiros 0-100.`;

export interface HistoricoAnamnese {
  versao: number;
  concluida_em: string | null;
  respostas: Respostas;
}

/** Renders the answers into a labeled, human-readable block for the model. */
export function montarPromptUsuario(
  respostas: Respostas,
  historico?: HistoricoAnamnese[],
): string {
  const linhas: string[] = [];
  for (const p of PERGUNTAS) {
    const r = respostas[p.id];
    if (r === undefined || r === null || r === "") continue;
    const valor = Array.isArray(r) ? r.join(", ") : String(r);
    linhas.push(`- ${p.titulo} (${p.id}): ${valor}`);
  }

  let historicoBloco = "";
  if (historico && historico.length > 0) {
    const blocos = historico.map((h) => {
      const hLinhas: string[] = [];
      for (const p of PERGUNTAS) {
        const r = h.respostas[p.id];
        if (r === undefined || r === null || r === "") continue;
        const valor = Array.isArray(r) ? r.join(", ") : String(r);
        hLinhas.push(`  - ${p.titulo}: ${valor}`);
      }
      const data = h.concluida_em
        ? new Date(h.concluida_em).toLocaleDateString("pt-BR")
        : "data desconhecida";
      return `Versão ${h.versao} (${data}):\n${hLinhas.join("\n")}`;
    });
    historicoBloco = `\n\nHISTÓRICO DE ANAMNESES ANTERIORES (USE PARA GERAR evolucao_aluno):\n${blocos.join("\n\n")}`;
  }

  return `Analise a anamnese a seguir e gere o relatório no formato JSON especificado.

ANAMNESE ATUAL DO ALUNO:
${linhas.join("\n")}${historicoBloco}

Gere o relatório JSON completo agora.`;
}
