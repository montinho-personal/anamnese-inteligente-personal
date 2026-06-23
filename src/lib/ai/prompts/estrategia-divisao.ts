import type { DivisaoTreino } from "@/types/relatorio";
import type { Respostas } from "@/types/anamnese";
import { PERGUNTAS } from "@/lib/anamnese/flow-engine";

export function montarPromptEstrategia(
  divisao: DivisaoTreino,
  respostas: Respostas,
): string {
  const linhas: string[] = [];
  for (const p of PERGUNTAS) {
    const r = respostas[p.id];
    if (r === undefined || r === null || r === "") continue;
    const valor = Array.isArray(r) ? r.join(", ") : String(r);
    linhas.push(`- ${p.titulo}: ${valor}`);
  }

  return `Você é um especialista em prescrição de treinamento. Com base nos dados do aluno abaixo e na divisão de treino "${divisao.nome} (${divisao.estrutura})", gere a estratégia COMPLETA e DETALHADA para essa divisão.

DADOS DO ALUNO:
${linhas.join("\n")}

DIVISÃO ESCOLHIDA: ${divisao.nome} — ${divisao.estrutura}
Prós: ${divisao.pros.join(", ")}
Contras: ${divisao.contras.join(", ")}

Responda SOMENTE com um JSON válido seguindo EXATAMENTE este schema (sem markdown, sem texto fora do JSON):
{
  "explicacao_escolha": "string — por que essa divisão foi escolhida para este aluno",
  "encaixe_rotina": "string — como se encaixa na disponibilidade de dias e tempo",
  "encaixe_objetivos": "string — como se alinha aos objetivos declarados",
  "encaixe_limitacoes": "string — como respeita as limitações físicas e ortopédicas",
  "encaixe_recuperacao": "string — como respeita a capacidade de recuperação",
  "exercicios_por_grupo": [
    {
      "grupo_muscular": "string",
      "ordem": 1,
      "principais": ["string — compostos prioritários"],
      "secundarios": ["string — exercícios de assistência"],
      "acessorios": ["string — isoladores e finalizadores"],
      "justificativa": "string"
    }
  ],
  "faixas_repeticoes": [
    { "categoria": "Compostos", "faixa": "string — ex: 4x5-8", "justificativa": "string" },
    { "categoria": "Isoladores", "faixa": "string — ex: 3x12-15", "justificativa": "string" },
    { "categoria": "Músculos prioritários", "faixa": "string", "justificativa": "string" },
    { "categoria": "Músculos secundários", "faixa": "string", "justificativa": "string" }
  ],
  "volume_detalhado": [
    { "grupo_muscular": "string", "series_min": 0, "series_max": 0, "justificativa": "string" }
  ],
  "intensidade": {
    "rir": "string — ex: RIR 2-3",
    "rpe": "string — ex: RPE 7-8",
    "proximidade_falha": "string",
    "justificativa": "string"
  },
  "tecnicas_avancadas": [
    { "tecnica": "string", "quando_usar": "string", "justificativa": "string" }
  ],
  "progressao": [
    { "tipo": "carga|repeticoes|volume", "descricao": "string", "criterio": "string" }
  ],
  "resumo_executivo_divisao": "string — por que essa é a divisão ideal para esse aluno agora"
}`;
}
