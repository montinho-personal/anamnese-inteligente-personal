import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, montarPromptUsuario } from "./prompts/relatorio";
import type { HistoricoAnamnese } from "./prompts/relatorio";
import { parseRelatorio } from "./parsers/relatorio";
import type { Respostas } from "@/types/anamnese";
import type { RelatorioIA } from "@/types/relatorio";

const MODEL = "claude-3-haiku-20240307";

export interface ResultadoRelatorio {
  relatorio: RelatorioIA;
  tokensUsados: number;
}

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY não configurada.");
  return new Anthropic({ apiKey });
}

async function gerarUmaTentativa(
  respostas: Respostas,
  historico?: HistoricoAnamnese[],
): Promise<ResultadoRelatorio> {
  const client = getClient();

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: montarPromptUsuario(respostas, historico) }],
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

export async function gerarRelatorio(
  respostas: Respostas,
  historico?: HistoricoAnamnese[],
): Promise<ResultadoRelatorio> {
  try {
    return await gerarUmaTentativa(respostas, historico);
  } catch (primeiroErro) {
    console.warn("Primeira tentativa de relatório falhou, repetindo...", primeiroErro);
    try {
      return await gerarUmaTentativa(respostas, historico);
    } catch (segundoErro) {
      throw new Error(
        `Geração do relatório falhou após 2 tentativas: ${
          segundoErro instanceof Error ? segundoErro.message : "erro desconhecido"
        }`,
      );
    }
  }
}
