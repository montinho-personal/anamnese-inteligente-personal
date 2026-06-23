import { diasDesde } from "@/lib/utils";
import type { Aluno, Anamnese, Checkin } from "@/types/database";
import type { Respostas } from "@/types/anamnese";
import type { ScoresIA, ProtocoloIA, RiscosIA } from "@/types/relatorio";

export type InsightCategoria = "temporal" | "dor" | "mobilidade" | "progressao" | "comportamento" | "oportunidade";
export type InsightUrgencia = "alta" | "media" | "baixa" | "positivo";

export interface Insight {
  id: string;
  categoria: InsightCategoria;
  urgencia: InsightUrgencia;
  titulo: string;
  descricao: string;
  perguntas_sugeridas?: string[];
  acoes_sugeridas?: string[];
  mensagem_sugerida?: string;
}

export interface ScoreEvolucao {
  total: number;
  frequencia: number;
  bem_estar: number;
  dores: number;
  engajamento: number;
  tendencia: "subindo" | "estavel" | "caindo" | "sem_dados";
}

export interface EngineInput {
  aluno: Aluno;
  anamnese: Anamnese | null;
  checkins: Checkin[];
  relatorioScores: ScoresIA | null;
  relatorioProtocoloMobilidade: ProtocoloIA | null;
  relatorioRiscos: RiscosIA | null;
}

// Region label map matching REGIOES_ORTO in flow-engine
const REGIAO_LABELS: Record<string, string> = {
  coluna_lombar: "coluna lombar",
  coluna_cervical: "coluna cervical",
  ombro_direito: "ombro direito",
  ombro_esquerdo: "ombro esquerdo",
  joelho_direito: "joelho direito",
  joelho_esquerdo: "joelho esquerdo",
  quadril: "quadril",
  tornozelo_pe: "tornozelo/pé",
  cotovelo: "cotovelo",
  punho_mao: "punho/mão",
};

export function gerarInsights(input: EngineInput): Insight[] {
  const { aluno, anamnese, checkins, relatorioScores, relatorioProtocoloMobilidade, relatorioRiscos } = input;
  const insights: Insight[] = [];

  const diasCadastro = diasDesde(aluno.created_at);
  const respostas = (anamnese?.respostas ?? {}) as Respostas;
  const objetivos = Array.isArray(respostas["objetivos"]) ? (respostas["objetivos"] as string[]) : [];
  const primeiroNome = aluno.nome.split(" ")[0];

  // ─── TEMPORAL ────────────────────────────────────────────────────────────────

  if (diasCadastro >= 7 && diasCadastro < 14) {
    insights.push({
      id: "temporal_7d",
      categoria: "temporal",
      urgencia: "media",
      titulo: "Primeira semana concluída",
      descricao: "Momento crítico para verificar adaptação, dores e aderência inicial. Muitos alunos desistem nas primeiras 2 semanas.",
      perguntas_sugeridas: [
        "Como está se sentindo após a primeira semana?",
        "Algum exercício causou desconforto?",
        "Está conseguindo seguir a rotina?",
        "Está encontrando dificuldades para comparecer aos treinos?",
      ],
      mensagem_sugerida: `Olá ${primeiroNome}! Como foi sua primeira semana de treino? Alguma dúvida ou desconforto? 💪`,
    });
  }

  if (diasCadastro >= 14 && diasCadastro < 21) {
    insights.push({
      id: "temporal_14d",
      categoria: "temporal",
      urgencia: "baixa",
      titulo: "Início da adaptação neuromuscular (14 dias)",
      descricao: "Com 2 semanas, o sistema nervoso começa a otimizar o recrutamento muscular. Verifique aderência e percepção de progresso.",
      perguntas_sugeridas: [
        "Está conseguindo aumentar cargas ou repetições?",
        "Está executando os exercícios com mais confiança?",
        "Está realizando as mobilidades recomendadas?",
        "As dores relatadas na anamnese melhoraram, pioraram ou continuam iguais?",
      ],
    });
  }

  if (diasCadastro >= 30 && diasCadastro < 37) {
    insights.push({
      id: "temporal_30d",
      categoria: "temporal",
      urgencia: "media",
      titulo: "Primeiro mês — avaliar progresso inicial",
      descricao: "Momento ideal para reforçar motivação, medir resultados iniciais e revisar objetivos.",
      perguntas_sugeridas: [
        "Percebe mudanças físicas?",
        "Percebe melhora na disposição e energia?",
        "Percebe melhora na execução dos exercícios?",
        "Como está sua motivação atualmente?",
      ],
      acoes_sugeridas: ["Tirar fotos de progresso", "Reavaliar peso e medidas", "Revisar volume e intensidade do treino"],
    });
  }

  if (diasCadastro >= 60 && diasCadastro < 67) {
    insights.push({
      id: "temporal_60d",
      categoria: "comportamento",
      urgencia: "media",
      titulo: "60 dias — período de platô motivacional",
      descricao: "Clássico momento de queda motivacional. Alunos que passam desta fase têm taxa de retenção muito maior. Ação proativa recomendada.",
      perguntas_sugeridas: [
        "O treino continua motivante?",
        "Existe algo que gostaria de mudar?",
        "Está satisfeito com os resultados até agora?",
      ],
      acoes_sugeridas: ["Introduzir variação de treino", "Propor novo desafio", "Definir meta de curto prazo"],
      mensagem_sugerida: `${primeiroNome}, 2 meses de treino! Que tal conversarmos sobre novas metas? Vejo muito potencial em você 🎯`,
    });
  }

  if (diasCadastro >= 90 && diasCadastro < 97) {
    insights.push({
      id: "temporal_90d",
      categoria: "temporal",
      urgencia: "media",
      titulo: "3 meses — reavaliar objetivos e planejar próximo ciclo",
      descricao: "Momento ideal para reavaliação completa, nova anamnese e planejamento do próximo macrociclo.",
      perguntas_sugeridas: [
        "O objetivo inicial mudou?",
        "O que mais evoluiu nestes 3 meses?",
        "Qual seria o próximo objetivo?",
      ],
      acoes_sugeridas: ["Solicitar nova anamnese", "Gerar novo relatório IA", "Definir nova periodização"],
    });
  }

  if (diasCadastro >= 180 && diasCadastro % 90 < 7) {
    insights.push({
      id: `temporal_${diasCadastro}d`,
      categoria: "oportunidade",
      urgencia: "positivo",
      titulo: `${Math.floor(diasCadastro / 30)} meses — marco de permanência`,
      descricao: "Aluno de longa data. Reconheça a trajetória e planeje próximo ciclo para manter engajamento.",
      acoes_sugeridas: ["Celebrar o marco", "Propor evolução de objetivo", "Considerar reavaliação completa"],
    });
  }

  // ─── DOR E LESÕES ─────────────────────────────────────────────────────────────

  const regioesDor = Array.isArray(respostas["orto_regioes"])
    ? (respostas["orto_regioes"] as string[])
    : [];

  if (regioesDor.length > 0 && diasCadastro >= 14) {
    const labels = regioesDor.map((r) => REGIAO_LABELS[r] ?? r).join(", ");
    insights.push({
      id: "dor_acompanhamento",
      categoria: "dor",
      urgencia: "media",
      titulo: `Acompanhar: dor em ${labels}`,
      descricao: `O aluno relatou dor nessas regiões na anamnese. Verifique evolução regularmente para adaptar exercícios e carga.`,
      perguntas_sugeridas: [
        ...regioesDor.slice(0, 2).map((r) => `Como está a dor no ${REGIAO_LABELS[r] ?? r} atualmente?`),
        "Algum exercício está causando desconforto nessas regiões?",
        "Melhorou, piorou ou continua igual?",
      ],
    });
  }

  const checkinComDor = checkins.find((c) => c.dores_relatadas?.trim());
  if (checkinComDor) {
    const diasCheckin = diasDesde(checkinComDor.created_at);
    insights.push({
      id: "dor_checkin_recente",
      categoria: "dor",
      urgencia: diasCheckin <= 7 ? "alta" : "media",
      titulo: diasCheckin <= 7 ? "Dor relatada no check-in desta semana" : `Dor relatada há ${diasCheckin} dias`,
      descricao: `"${checkinComDor.dores_relatadas}"`,
      perguntas_sugeridas: [
        "A dor que você relatou persiste?",
        "Em qual exercício específico ela aparece?",
        "A intensidade aumentou, diminuiu ou continua igual?",
      ],
      acoes_sugeridas: [
        "Adaptar ou substituir o exercício causador",
        diasCheckin <= 7 ? "Considerar encaminhamento para fisioterapia" : "Monitorar próximo check-in",
      ],
    });
  }

  // ─── MOBILIDADE ───────────────────────────────────────────────────────────────

  if (relatorioProtocoloMobilidade && relatorioProtocoloMobilidade.length > 0 && diasCadastro >= 14) {
    insights.push({
      id: "mobilidade_verificacao",
      categoria: "mobilidade",
      urgencia: "baixa",
      titulo: "Verificar adesão ao protocolo de mobilidade",
      descricao: `O relatório prescreveu ${relatorioProtocoloMobilidade.length} exercício(s) de mobilidade. Confirme se o aluno está executando.`,
      perguntas_sugeridas: [
        "Está realizando a mobilidade recomendada?",
        "Quantas vezes por semana você faz mobilidade?",
        "Percebe melhora na amplitude de movimento?",
        "Está mais fácil executar os movimentos?",
      ],
    });
  }

  // ─── PROGRESSÃO E FREQUÊNCIA ──────────────────────────────────────────────────

  if (checkins.length >= 2) {
    const recentes = checkins.slice(0, 4);
    const taxaTreinos = recentes.reduce((s, c) => s + c.treinos_realizados / Math.max(c.treinos_esperados, 1), 0) / recentes.length;

    if (taxaTreinos < 0.6) {
      insights.push({
        id: "progressao_frequencia_baixa",
        categoria: "progressao",
        urgencia: "alta",
        titulo: `Frequência abaixo do esperado (${Math.round(taxaTreinos * 100)}%)`,
        descricao: `Aluno realizou em média ${Math.round(taxaTreinos * 100)}% dos treinos esperados nas últimas semanas. Investigar causa antes de perder aderência.`,
        perguntas_sugeridas: [
          "O que tem dificultado comparecer aos treinos?",
          "Algum compromisso novo mudou sua rotina?",
          "Prefere ajustar o número de dias semanais?",
        ],
        acoes_sugeridas: ["Revisar dias de treino", "Simplificar rotina temporariamente"],
        mensagem_sugerida: `${primeiroNome}, notei que você faltou alguns treinos. Tudo bem? Posso adaptar a rotina se precisar 💬`,
      });
    } else if (taxaTreinos >= 0.9 && checkins.length >= 3) {
      insights.push({
        id: "oportunidade_frequencia_exemplar",
        categoria: "oportunidade",
        urgencia: "positivo",
        titulo: "Frequência exemplar!",
        descricao: `${Math.round(taxaTreinos * 100)}% de aderência nos treinos recentes. Momento para reconhecer e elevar o nível.`,
        acoes_sugeridas: ["Aumentar intensidade ou volume", "Propor novo desafio"],
        mensagem_sugerida: `${primeiroNome}, sua dedicação está incrível! Frequência quase perfeita 🏆 Vamos elevar o nível?`,
      });
    }

    const mediaEnergia = recentes.reduce((s, c) => s + (c.energia ?? 3), 0) / recentes.length;
    if (mediaEnergia <= 2) {
      insights.push({
        id: "progressao_energia_baixa",
        categoria: "comportamento",
        urgencia: "media",
        titulo: `Energia baixa nos check-ins (média ${mediaEnergia.toFixed(1)}/5)`,
        descricao: "Energia consistentemente baixa pode indicar sobrecarga, sono insuficiente ou nutrição inadequada.",
        perguntas_sugeridas: [
          "Como está seu sono ultimamente?",
          "Está se sentindo sobrecarregado com o volume de treino?",
          "A alimentação antes do treino está adequada?",
        ],
        acoes_sugeridas: ["Verificar volume total de treino", "Considerar semana de deload"],
      });
    }

    const mediaSono = recentes.reduce((s, c) => s + (c.sono ?? 3), 0) / recentes.length;
    if (mediaSono <= 2) {
      insights.push({
        id: "progressao_sono_baixo",
        categoria: "comportamento",
        urgencia: "media",
        titulo: `Qualidade de sono baixa (média ${mediaSono.toFixed(1)}/5)`,
        descricao: "Sono inadequado prejudica recuperação muscular, hormônios anabólicos e motivação.",
        perguntas_sugeridas: [
          "Tem dormido quantas horas por noite?",
          "Sente dificuldade para dormir ou acorda cansado?",
        ],
        acoes_sugeridas: ["Orientar sobre higiene do sono", "Evitar treinos intensos muito tarde"],
      });
    }
  }

  // ─── OBJETIVOS ESPECÍFICOS ────────────────────────────────────────────────────

  if (objetivos.includes("emagrecimento") && diasCadastro >= 14) {
    insights.push({
      id: "objetivo_emagrecimento",
      categoria: "progressao",
      urgencia: "baixa",
      titulo: "Acompanhar progresso — Emagrecimento",
      descricao: "Objetivo: emagrecimento. Verificar evolução de peso, medidas e comportamento alimentar.",
      perguntas_sugeridas: [
        "Notou mudança no peso ou nas medidas?",
        "Como está a alimentação durante a semana?",
        "A fome está controlada?",
        "Está se sentindo mais disposto no dia a dia?",
      ],
    });
  }

  if (objetivos.includes("hipertrofia") && diasCadastro >= 21) {
    insights.push({
      id: "objetivo_hipertrofia",
      categoria: "progressao",
      urgencia: "baixa",
      titulo: "Acompanhar progresso — Hipertrofia",
      descricao: "Objetivo: hipertrofia. Após 3 semanas é possível observar primeiros sinais de adaptação muscular.",
      perguntas_sugeridas: [
        "Está conseguindo aumentar cargas regularmente?",
        "Percebe aumento de volume muscular?",
        "Está recuperando bem entre os treinos?",
        "Proteína e calorias estão adequadas?",
      ],
    });
  }

  if (objetivos.includes("performance") && diasCadastro >= 21) {
    insights.push({
      id: "objetivo_performance",
      categoria: "progressao",
      urgencia: "baixa",
      titulo: "Acompanhar progresso — Performance esportiva",
      descricao: "Objetivo: performance. Verificar transferência do treino para o desempenho no esporte.",
      perguntas_sugeridas: [
        "Percebe melhora no desempenho do seu esporte?",
        "Melhorou resistência, potência ou velocidade?",
        "Como está a recuperação pós-jogo/treino esportivo?",
        "Alguma capacidade específica ainda precisa de mais atenção?",
      ],
    });
  }

  if (objetivos.includes("reabilitacao")) {
    insights.push({
      id: "objetivo_reabilitacao",
      categoria: "dor",
      urgencia: "media",
      titulo: "Objetivo de reabilitação — acompanhamento contínuo",
      descricao: `Aluno iniciou com objetivo de reabilitação. Progresso deve ser cauteloso e bem monitorado.`,
      perguntas_sugeridas: [
        "A região que você quer reabilitar está evoluindo?",
        "Está tendo acompanhamento médico ou fisioterapêutico?",
        "Algum exercício está causando desconforto?",
        "A amplitude de movimento melhorou?",
      ],
      acoes_sugeridas: ["Manter diálogo com fisioterapeuta se houver", "Progressão conservadora de carga"],
    });
  }

  // ─── RETENÇÃO / COMPORTAMENTO ─────────────────────────────────────────────────

  const diasUltimoCheckin = checkins.length > 0 ? diasDesde(checkins[0].created_at) : diasCadastro;

  if (diasUltimoCheckin >= 14 && aluno.status !== "inativo" && diasCadastro >= 14) {
    insights.push({
      id: "retencao_sem_checkin",
      categoria: "comportamento",
      urgencia: "alta",
      titulo: `Sem check-in há ${diasUltimoCheckin} dias`,
      descricao: "Ausência prolongada de check-ins é sinal precoce de abandono. Contato ativo esta semana é recomendado.",
      acoes_sugeridas: ["Enviar mensagem personalizada agora", "Verificar se ocorreu algum problema"],
      mensagem_sugerida: `Olá ${primeiroNome}! Está tudo bem? Há alguns dias sem notícias suas. Me conta como estão os treinos 💬`,
    });
  }

  if (relatorioRiscos?.comportamental) {
    const nivel = relatorioRiscos.comportamental.nivel;
    if (nivel === "alta" || nivel === "media") {
      insights.push({
        id: "retencao_risco_ia",
        categoria: "comportamento",
        urgencia: nivel === "alta" ? "alta" : "media",
        titulo: `Risco comportamental ${nivel} (IA)`,
        descricao: relatorioRiscos.comportamental.descricao ?? "O relatório IA identificou risco de abandono. Acompanhamento próximo recomendado.",
        acoes_sugeridas: ["Revisar plano de retenção no relatório", "Aumentar frequência de contato neste período"],
      });
    }
  }

  if (relatorioScores?.risco_abandono !== undefined && relatorioScores.risco_abandono >= 70) {
    const jaTemInsightComportamental = insights.some((i) => i.id === "retencao_risco_ia");
    if (!jaTemInsightComportamental) {
      insights.push({
        id: "retencao_score_abandono",
        categoria: "comportamento",
        urgencia: "alta",
        titulo: `Score de risco de abandono: ${relatorioScores.risco_abandono}/100`,
        descricao: "Relatório IA identificou alto risco de abandono. Estratégias de retenção ativas são essenciais.",
        acoes_sugeridas: ["Revisar plano de retenção no relatório", "Contato proativo nesta semana"],
      });
    }
  }

  // ─── OPORTUNIDADES ────────────────────────────────────────────────────────────

  if (checkins.length === 1) {
    insights.push({
      id: "oportunidade_primeiro_checkin",
      categoria: "oportunidade",
      urgencia: "positivo",
      titulo: "Primeiro check-in realizado!",
      descricao: "Ótimo sinal de engajamento. Reforce a importância do acompanhamento semanal.",
      mensagem_sugerida: `${primeiroNome}, que ótimo ter seu feedback! Isso me ajuda a ajustar seu treino 🙌`,
    });
  }

  if (relatorioScores?.potencial_aderencia !== undefined && relatorioScores.potencial_aderencia >= 80) {
    insights.push({
      id: "oportunidade_alta_aderencia",
      categoria: "oportunidade",
      urgencia: "positivo",
      titulo: `Alto potencial de aderência (${relatorioScores.potencial_aderencia}/100)`,
      descricao: "Relatório IA aponta perfil altamente aderente. Momento para estabelecer metas ambiciosas e progressão acelerada.",
      acoes_sugeridas: ["Propor desafio de 30 dias", "Definir meta de médio prazo", "Aumentar complexidade do treino"],
    });
  }

  // Ordena por urgência: alta → media → baixa → positivo
  const ordemUrgencia: Record<InsightUrgencia, number> = { alta: 0, media: 1, baixa: 2, positivo: 3 };
  return insights.sort((a, b) => ordemUrgencia[a.urgencia] - ordemUrgencia[b.urgencia]);
}

export function calcularScoreEvolucao(checkins: Checkin[], relatorioScores: ScoresIA | null): ScoreEvolucao {
  if (checkins.length === 0) {
    const base = relatorioScores
      ? Math.round((relatorioScores.potencial_aderencia + relatorioScores.potencial_resultado) / 2)
      : 0;
    return { total: base, frequencia: 0, bem_estar: 0, dores: 0, engajamento: 0, tendencia: "sem_dados" };
  }

  const recentes = checkins.slice(0, 4);

  const frequencia = Math.round(
    (recentes.reduce((s, c) => s + c.treinos_realizados / Math.max(c.treinos_esperados, 1), 0) / recentes.length) * 25,
  );

  const totalBemEstar = recentes.reduce((s, c) => {
    const media = ((c.energia ?? 3) + (c.sono ?? 3) + (c.humor_geral ?? 3)) / 3;
    return s + media;
  }, 0);
  const bem_estar = Math.round((totalBemEstar / recentes.length / 5) * 45);

  const semDores = recentes.filter((c) => !c.dores_relatadas?.trim()).length;
  const dores = Math.round((semDores / recentes.length) * 20);

  const diasUltimoCheckin = diasDesde(checkins[0].created_at);
  const engajamento = diasUltimoCheckin <= 7 ? 10 : diasUltimoCheckin <= 14 ? 5 : 0;

  const total = Math.min(100, frequencia + bem_estar + dores + engajamento);

  let tendencia: ScoreEvolucao["tendencia"] = "estavel";
  if (checkins.length >= 4) {
    const scoreR = checkins.slice(0, 2).reduce((s, c) => s + (c.energia ?? 3) + (c.sono ?? 3) + (c.humor_geral ?? 3), 0) / 2;
    const scoreA = checkins.slice(2, 4).reduce((s, c) => s + (c.energia ?? 3) + (c.sono ?? 3) + (c.humor_geral ?? 3), 0) / 2;
    if (scoreR > scoreA + 1.5) tendencia = "subindo";
    else if (scoreR < scoreA - 1.5) tendencia = "caindo";
  }

  return { total, frequencia, bem_estar, dores, engajamento, tendencia };
}
