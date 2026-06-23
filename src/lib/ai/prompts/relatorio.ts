import { PERGUNTAS } from "@/lib/anamnese/flow-engine";
import type { Respostas } from "@/types/anamnese";

export const SYSTEM_PROMPT = `Você é um especialista em prescrição de treinamento para Personal Trainers. Analise a anamnese do aluno e retorne SOMENTE um objeto JSON válido, sem markdown, sem texto fora do JSON. Seja conciso: máx 1 frase por texto, máx 3 itens por lista.

REGRAS: Segurança primeiro. Scores são inteiros 0-100. "divisoes_treino" deve ter EXATAMENTE 3 opções. Inclua "analise_postural" só se postural_tem_desvio="sim". Inclua "performance_esportiva" só se objetivo incluir "performance". Inclua "evolucao_aluno" só se houver histórico.

JSON schema obrigatório:
{"resumo_executivo":"string","classificacao":{"nivel":"Iniciante|Intermediário|Avançado","justificativa":"string"},"scores":{"potencial_resultado":0,"potencial_aderencia":0,"risco_lesao":0,"risco_abandono":0},"riscos":{"cardiovascular":{"nivel":"alta|media|baixa","descricao":"string","evitar":["string"],"fazer":["string"]},"ortopedico":{"nivel":"alta|media|baixa","descricao":"string","evitar":["string"],"fazer":["string"]},"comportamental":{"nivel":"alta|media|baixa","descricao":"string","evitar":["string"],"fazer":["string"]}},"fatores_abandono":{"riscos_identificados":["string"],"estrategias":["string"]},"perfil_comportamental":{"perfil":"Analítico|Competitivo|Executor|Emocional","justificativa":"string"},"mapa_construcao_fisica":{"pontos_fortes":["string"],"pontos_fracos":["string"],"gargalos":["string"],"oportunidades":["string"]},"exercicios_recomendados":[{"grupo_muscular":"string","exercicios":["string"],"justificativa":"string"}],"exercicios_evitar":[{"exercicio":"string","justificativa":"string"}],"protocolo_mobilidade":[{"alvo":"string","exercicio":"string","motivo":"string"}],"protocolo_alongamento":[{"alvo":"string","exercicio":"string","motivo":"string"}],"aquecimento":{"descricao":"string","passos":["string"]},"divisoes_treino":[{"nome":"string","estrutura":"string","pros":["string"],"contras":["string"]}],"volume_semanal":[{"grupo_muscular":"string","series_semanais":"string"}],"periodizacao":[{"duracao":"4 semanas","estrategia":"string","racional":"string"},{"duracao":"8 semanas","estrategia":"string","racional":"string"},{"duracao":"12 semanas","estrategia":"string","racional":"string"}],"plano_retencao":{"estrategias":["string"],"tarefas":["string"]}}`;

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
