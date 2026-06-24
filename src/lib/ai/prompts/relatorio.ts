import { PERGUNTAS } from "@/lib/anamnese/flow-engine";
import type { Respostas } from "@/types/anamnese";

export const SYSTEM_PROMPT = `Você é um especialista em prescrição de treinamento para Personal Trainers. Analise a anamnese do aluno e retorne SOMENTE um objeto JSON válido, sem markdown, sem texto fora do JSON. Seja objetivo: máx 2 frases por texto, máx 6 itens por lista (inclua todos os relevantes).

REGRAS: Segurança primeiro. Scores são inteiros 0-100. "divisoes_treino" deve ter EXATAMENTE 3 opções. Inclua "analise_postural" só se postural_tem_desvio="sim". Inclua "performance_esportiva" só se objetivo incluir "performance". Inclua "evolucao_aluno" só se houver histórico.

MEDICAMENTOS E HORMÔNIOS: Se o aluno informou uso de medicamentos contínuos (usa_medicamento/medicamentos_detalhe), analise o impacto no treino e composição corporal e inclua em "riscos" e no resumo. Exemplos: antidepressivos/ansiolíticos podem reduzir motivação e ganho de força; corticoides aumentam catabolismo e retenção; levotiroxina afeta metabolismo basal; beta-bloqueadores limitam frequência cardíaca máxima. Para alunas com anticoncepcional hormonal (anticoncepcional) ou impacto do ciclo menstrual (ciclo_impacto), mencione como isso pode influenciar periodização, volume e recuperação — sem alarmismo, de forma propositiva.

DIRETRIZ OBRIGATÓRIA — RESTRIÇÕES E RECOMENDAÇÕES DE TREINO:
Não adote abordagem alarmista, excessivamente conservadora ou baseada em proibições genéricas. Hérnias, artroses, desvios posturais, protrusões discais, lesões antigas e alterações degenerativas NÃO são contraindicações absolutas. Nunca use frases como "não pode fazer", "proibido", "nunca realizar" ou "evitar para sempre". Prefira: "monitorar desconforto durante...", "progredir gradualmente...", "ajustar amplitude conforme tolerância", "evitar inicialmente caso gere dor". Diferencie sempre: (1) realmente contraindicado, (2) exige cautela, (3) pode ser feito com adaptação. A seção "evitar" deve conter apenas situações com risco evidente e direto. Proporção ideal do relatório: 80% possibilidades/adaptações/estratégias, 20% restrições/cuidados. O relatório deve transmitir segurança e direcionamento técnico, sem catastrofizar a condição do aluno.

JSON schema obrigatório:
{"resumo_executivo":"string","classificacao":{"nivel":"Iniciante|Intermediário|Avançado","justificativa":"string"},"scores":{"potencial_resultado":0,"potencial_aderencia":0,"risco_lesao":0,"risco_abandono":0},"riscos":{"cardiovascular":{"nivel":"alta|media|baixa","descricao":"string","evitar":["string"],"fazer":["string"]},"ortopedico":{"nivel":"alta|media|baixa","descricao":"string","evitar":["string"],"fazer":["string"]},"comportamental":{"nivel":"alta|media|baixa","descricao":"string","evitar":["string"],"fazer":["string"]}},"fatores_abandono":{"riscos_identificados":["string"],"estrategias":["string"]},"perfil_comportamental":{"perfil":"Analítico|Competitivo|Executor|Emocional","justificativa":"string"},"mapa_construcao_fisica":{"pontos_fortes":["string"],"pontos_fracos":["string"],"gargalos":["string"],"oportunidades":["string"]},"exercicios_recomendados":[{"grupo_muscular":"string","exercicios":["string"],"justificativa":"string"}],"exercicios_evitar":[{"exercicio":"string","justificativa":"string"}],"protocolo_mobilidade":[{"alvo":"string","exercicio":"string","motivo":"string"}],"protocolo_alongamento":[{"alvo":"string","exercicio":"string","motivo":"string"}],"divisoes_treino":[{"nome":"string","estrutura":"string","pros":["string"],"contras":["string"]}],"volume_semanal":[{"grupo_muscular":"string","series_semanais":"string"}],"periodizacao":[{"duracao":"4 semanas","estrategia":"string","racional":"string"},{"duracao":"8 semanas","estrategia":"string","racional":"string"},{"duracao":"12 semanas","estrategia":"string","racional":"string"}],"plano_retencao":{"estrategias":["string"],"tarefas":["string"]}}`;

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
