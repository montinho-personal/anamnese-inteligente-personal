import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, montarPromptUsuario } from "./prompts/relatorio";
import { parseRelatorio } from "./parsers/relatorio";
import type { Respostas } from "@/types/anamnese";
import type { RelatorioIA } from "@/types/relatorio";

const MODEL = "claude-sonnet-4-6";

export interface ResultadoRelatorio {
  relatorio: RelatorioIA;
  tokensUsados: number;
}

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY não configurada.");
  return new Anthropic({ apiKey });
}

async function gerarUmaTentativa(respostas: Respostas): Promise<ResultadoRelatorio> {
  const client = getClient();

  // Stream the response — large structured JSON output benefits from streaming
  // to avoid request timeouts, and we collect the final message at the end.
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: montarPromptUsuario(respostas) }],
  });

  const message = await stream.finalMessage();

  const texto = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const relatorio = parseRelatorio(texto);
  const tokensUsados =
    (message.usage?.input_tokens ?? 0) + (message.usage?.output_tokens ?? 0);

  return { relatorio, tokensUsados };
}

/**
 * Generates the intelligent report from anamnese answers. Retries once on
 * failure (e.g. malformed JSON, transient API error) before giving up.
 */
export async function gerarRelatorio(
  respostas: Respostas,
): Promise<ResultadoRelatorio> {
  try {
    return await gerarUmaTentativa(respostas);
  } catch (primeiroErro) {
    console.warn("Primeira tentativa de relatório falhou, repetindo...", primeiroErro);
    try {
      return await gerarUmaTentativa(respostas);
    } catch (segundoErro) {
      throw new Error(
        `Geração do relatório falhou após 2 tentativas: ${
          segundoErro instanceof Error ? segundoErro.message : "erro desconhecido"
        }`,
      );
    }
  }
}
