import type { RelatorioIA } from "@/types/relatorio";

export function parseRelatorio(raw: string): RelatorioIA {
  let texto = raw.trim();

  // Strip markdown code fences if present
  const fence = texto.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) texto = fence[1].trim();

  const start = texto.indexOf("{");
  if (start === -1) throw new Error("Resposta da IA não contém JSON válido.");

  // Try full JSON first
  const end = texto.lastIndexOf("}");
  if (end !== -1 && end > start) {
    try {
      const parsed = JSON.parse(texto.slice(start, end + 1)) as Partial<RelatorioIA>;
      if (parsed.resumo_executivo || parsed.classificacao) {
        return parsed as RelatorioIA;
      }
    } catch {
      // Fall through to repair attempt
    }
  }

  // JSON may be truncated — attempt to repair by closing open structures
  const partial = repairJson(texto.slice(start));
  try {
    const parsed = JSON.parse(partial) as Partial<RelatorioIA>;
    if (!parsed.resumo_executivo && !parsed.classificacao) {
      throw new Error("JSON parseado mas sem campos principais.");
    }
    return parsed as RelatorioIA;
  } catch (e) {
    throw new Error(
      `Falha ao parsear JSON da IA: ${e instanceof Error ? e.message : "erro desconhecido"}`,
    );
  }
}

/** Close unclosed JSON brackets/braces/strings to make a truncated JSON parseable. */
function repairJson(s: string): string {
  const stack: string[] = [];
  let inString = false;
  let escaped = false;

  for (const ch of s) {
    if (escaped) { escaped = false; continue; }
    if (ch === "\\") { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") stack.push("}");
    else if (ch === "[") stack.push("]");
    else if (ch === "}" || ch === "]") stack.pop();
  }

  // Close any open string
  let result = s;
  if (inString) result += '"';

  // Remove trailing commas before closing
  result = result.replace(/,\s*$/, "");

  // Close remaining open structures
  return result + stack.reverse().join("");
}
