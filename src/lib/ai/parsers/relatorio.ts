import type { RelatorioIA } from "@/types/relatorio";

/**
 * Extracts and validates the JSON report from a Claude response. The model is
 * instructed to return bare JSON, but we defensively strip code fences and
 * locate the outermost object in case of stray text.
 */
export function parseRelatorio(raw: string): RelatorioIA {
  let texto = raw.trim();

  // Strip markdown code fences if present.
  const fence = texto.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) texto = fence[1].trim();

  // Locate the outermost JSON object.
  const start = texto.indexOf("{");
  const end = texto.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("Resposta da IA não contém JSON válido.");
  }
  const json = texto.slice(start, end + 1);

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    throw new Error(
      `Falha ao parsear JSON da IA: ${e instanceof Error ? e.message : "erro desconhecido"}`,
    );
  }

  const r = parsed as Partial<RelatorioIA>;
  const obrigatorios: (keyof RelatorioIA)[] = [
    "resumo_executivo",
    "classificacao",
    "riscos",
    "scores",
  ];
  for (const campo of obrigatorios) {
    if (r[campo] === undefined) {
      throw new Error(`Relatório da IA incompleto: campo "${campo}" ausente.`);
    }
  }

  return parsed as RelatorioIA;
}
