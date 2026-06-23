export const maxDuration = 60;

import { NextResponse } from "next/server";
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
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });

  const supabase = createServiceClient();
  const personal = await getPersonal();
  if (!personal) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { data: relData } = await supabase
    .from("relatorios")
    .select("id, anamnese_id, aluno_id, divisoes_treino")
    .eq("id", parsed.data.relatorio_id)
    .single();
  const relatorio = relData as Pick<Relatorio, "id" | "anamnese_id" | "aluno_id" | "divisoes_treino"> | null;
  if (!relatorio) return NextResponse.json({ error: "Relatório não encontrado" }, { status: 404 });

  const { data: alunoData } = await supabase
    .from("alunos")
    .select("personal_id")
    .eq("id", relatorio.aluno_id)
    .single();
  if (!alunoData || alunoData.personal_id !== personal.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const divisoes = (relatorio.divisoes_treino ?? []) as DivisaoTreino[];
  const divisao = divisoes[parsed.data.divisao_index];
  if (!divisao) return NextResponse.json({ error: "Divisão não encontrada" }, { status: 404 });

  const { data: anamneseData } = await supabase
    .from("anamneses")
    .select("respostas")
    .eq("id", relatorio.anamnese_id)
    .single();
  const anamnese = anamneseData as Pick<Anamnese, "respostas"> | null;
  if (!anamnese) return NextResponse.json({ error: "Anamnese não encontrada" }, { status: 404 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY não configurada" }, { status: 500 });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (chunk: string) => controller.enqueue(encoder.encode(chunk));
      try {
        const client = new Anthropic({ apiKey });
        let accumulatedText = "";

        const anthropicStream = await client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 4000,
          messages: [{ role: "user", content: montarPromptEstrategia(divisao, anamnese.respostas as Respostas) }],
        });

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            "delta" in event &&
            (event.delta as { type: string }).type === "text_delta"
          ) {
            const text = (event.delta as { type: string; text: string }).text;
            accumulatedText += text;
            send(text);
          }
        }

        const start = accumulatedText.indexOf("{");
        const end = accumulatedText.lastIndexOf("}");
        if (start === -1 || end === -1) {
          send(`\n\n__ERROR__JSON não encontrado. Resposta: ${accumulatedText.slice(0, 200)}`);
          controller.close();
          return;
        }

        let estrategia: Partial<DivisaoTreino>;
        try {
          estrategia = JSON.parse(accumulatedText.slice(start, end + 1));
        } catch (parseErr) {
          send(`\n\n__ERROR__JSON inválido: ${parseErr instanceof Error ? parseErr.message : "parse error"}`);
          controller.close();
          return;
        }

        const divisoesAtualizadas = divisoes.map((d, i) =>
          i === parsed.data.divisao_index ? { ...d, ...estrategia } : d,
        );
        await supabase
          .from("relatorios")
          .update({ divisoes_treino: divisoesAtualizadas })
          .eq("id", relatorio.id);

        send(`\n\n__RESULT__${JSON.stringify({ estrategia })}`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Erro desconhecido";
        console.error("estrategia-divisao erro:", msg, e);
        send(`\n\n__ERROR__${msg}`);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
