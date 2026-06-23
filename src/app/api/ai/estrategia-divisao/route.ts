export const maxDuration = 60;

import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase/server";
import { getPersonal } from "@/lib/data/personal";
import { montarPromptEstrategia } from "@/lib/ai/prompts/estrategia-divisao";
import type { Anamnese, Relatorio } from "@/types/database";
import type { Respostas } from "@/types/anamnese";
import type { DivisaoTreino } from "@/types/relatorio";

const schema = z.object({
  relatorio_id: z.string().uuid(),
  divisao_index: z.number().int().min(0).max(2),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return new Response(JSON.stringify({ error: "Dados inválidos" }), { status: 422 });

  const supabase = createServiceClient();
  const personal = await getPersonal();
  if (!personal) return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401 });

  const { data: relData } = await supabase
    .from("relatorios")
    .select("id, anamnese_id, aluno_id, divisoes_treino")
    .eq("id", parsed.data.relatorio_id)
    .single();
  const relatorio = relData as Pick<Relatorio, "id" | "anamnese_id" | "aluno_id" | "divisoes_treino"> | null;
  if (!relatorio) return new Response(JSON.stringify({ error: "Relatório não encontrado" }), { status: 404 });

  const { data: alunoData } = await supabase
    .from("alunos")
    .select("personal_id")
    .eq("id", relatorio.aluno_id)
    .single();
  if (!alunoData || alunoData.personal_id !== personal.id) {
    return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 403 });
  }

  const divisoes = (relatorio.divisoes_treino ?? []) as DivisaoTreino[];
  const divisao = divisoes[parsed.data.divisao_index];
  if (!divisao) return new Response(JSON.stringify({ error: "Divisão não encontrada" }), { status: 404 });

  const { data: anamneseData } = await supabase
    .from("anamneses")
    .select("respostas")
    .eq("id", relatorio.anamnese_id)
    .single();
  const anamnese = anamneseData as Pick<Anamnese, "respostas"> | null;
  if (!anamnese) return new Response(JSON.stringify({ error: "Anamnese não encontrada" }), { status: 404 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY não configurada" }), { status: 500 });

  const client = new Anthropic({ apiKey });

  // Stream Anthropic response back to client — keeps connection alive, avoids Vercel timeout
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          messages: [{ role: "user", content: montarPromptEstrategia(divisao, anamnese.respostas as Respostas) }],
        });

        // Stream chunks to keep the HTTP connection alive
        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        const message = await anthropicStream.finalMessage();
        const raw = message.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("");

        const start = raw.indexOf("{");
        const end = raw.lastIndexOf("}");
        if (start !== -1 && end !== -1) {
          const estrategia = JSON.parse(raw.slice(start, end + 1)) as Partial<DivisaoTreino>;
          const divisoesAtualizadas = divisoes.map((d, i) =>
            i === parsed.data.divisao_index ? { ...d, ...estrategia } : d,
          );
          await supabase
            .from("relatorios")
            .update({ divisoes_treino: divisoesAtualizadas })
            .eq("id", relatorio.id);
          // Send a special terminator with the parsed result
          controller.enqueue(encoder.encode(`\n\n__RESULT__${JSON.stringify({ estrategia })}`));
        } else {
          controller.enqueue(encoder.encode(`\n\n__ERROR__JSON não encontrado na resposta`));
        }
      } catch (e) {
        console.error("Estratégia divisão erro:", e);
        controller.enqueue(encoder.encode(`\n\n__ERROR__${e instanceof Error ? e.message : "Erro desconhecido"}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
