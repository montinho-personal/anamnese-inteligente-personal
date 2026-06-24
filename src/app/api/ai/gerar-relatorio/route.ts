export const maxDuration = 300;

import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase/server";
import { SYSTEM_PROMPT, montarPromptUsuario } from "@/lib/ai/prompts/relatorio";
import { parseRelatorio } from "@/lib/ai/parsers/relatorio";
import type { HistoricoAnamnese } from "@/lib/ai/prompts/relatorio";
import type { Respostas } from "@/types/anamnese";
import type { Anamnese } from "@/types/database";

const schema = z.object({ relatorio_id: z.string().uuid() });

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "relatorio_id inválido" }), { status: 422 });
  }

  const supabase = createServiceClient();

  const { data: rel } = await supabase
    .from("relatorios")
    .select("id, anamnese_id, aluno_id")
    .eq("id", parsed.data.relatorio_id)
    .single();
  if (!rel) return new Response(JSON.stringify({ error: "Relatório não encontrado" }), { status: 404 });

  const { data: anamneseData } = await supabase
    .from("anamneses")
    .select("*")
    .eq("id", rel.anamnese_id)
    .single();
  const anamnese = anamneseData as Anamnese | null;
  if (!anamnese) return new Response(JSON.stringify({ error: "Anamnese não encontrada" }), { status: 404 });

  const { data: historicoData } = await supabase
    .from("anamneses")
    .select("versao, concluida_em, respostas")
    .eq("aluno_id", rel.aluno_id)
    .eq("status", "concluida")
    .lt("versao", anamnese.versao)
    .order("versao", { ascending: false })
    .limit(10);

  const historico: HistoricoAnamnese[] = (historicoData ?? []).map((h) => ({
    versao: h.versao as number,
    concluida_em: h.concluida_em as string | null,
    respostas: h.respostas as Respostas,
  }));

  const { error: setGerandoError } = await supabase
    .from("relatorios").update({ status: "gerando" }).eq("id", rel.id);
  if (setGerandoError) {
    return new Response(JSON.stringify({ error: `DB error: ${setGerandoError.message}` }), { status: 500 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY não configurada" }), { status: 500 });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Keep-alive bytes so the connection stays open while the AI runs (~10-30s)
      const keepAlive = setInterval(() => {
        try { controller.enqueue(encoder.encode(" ")); } catch { /* stream may be closed */ }
      }, 3_000);

      try {
        const client = new Anthropic({ apiKey, timeout: 240_000 });

        const message = await client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 8000,
          system: SYSTEM_PROMPT,
          messages: [{
            role: "user",
            content: montarPromptUsuario(
              anamnese.respostas as Respostas,
              historico.length > 0 ? historico : undefined,
            ),
          }],
        });

        const texto = message.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("");

        const relatorio = parseRelatorio(texto);

        const { error: updateError } = await supabase
          .from("relatorios")
          .update({
            status: "concluido",
            resumo_executivo: relatorio.resumo_executivo,
            classificacao: relatorio.classificacao,
            riscos: relatorio.riscos,
            fatores_abandono: relatorio.fatores_abandono,
            perfil_comportamental: relatorio.perfil_comportamental,
            mapa_construcao_fisica: relatorio.mapa_construcao_fisica,
            exercicios_recomendados: relatorio.exercicios_recomendados,
            exercicios_evitar: relatorio.exercicios_evitar,
            protocolo_mobilidade: relatorio.protocolo_mobilidade,
            protocolo_alongamento: relatorio.protocolo_alongamento,
            aquecimento: relatorio.aquecimento,
            divisoes_treino: relatorio.divisoes_treino,
            volume_semanal: relatorio.volume_semanal,
            periodizacao: relatorio.periodizacao,
            scores: relatorio.scores,
            plano_retencao: relatorio.plano_retencao,
            performance_esportiva: relatorio.performance_esportiva ?? null,
            analise_postural: relatorio.analise_postural ?? null,
            evolucao_aluno: relatorio.evolucao_aluno ?? null,
            tokens_ia_usados: (message.usage?.input_tokens ?? 0) + (message.usage?.output_tokens ?? 0),
            gerado_em: new Date().toISOString(),
          })
          .eq("id", rel.id);

        if (updateError) throw new Error(`DB update falhou: ${updateError.message}`);

        controller.enqueue(encoder.encode("\n\n__DONE__"));
      } catch (e) {
        console.error("Geração de relatório falhou:", e);
        await supabase.from("relatorios").update({ status: "falhou" }).eq("id", rel.id);
        const { data: aluno } = await supabase
          .from("alunos").select("personal_id, nome").eq("id", rel.aluno_id).single();
        if (aluno) {
          await supabase.from("alertas").insert({
            aluno_id: rel.aluno_id,
            personal_id: aluno.personal_id,
            tipo: "comportamental",
            criticidade: "media",
            titulo: "Falha na geração do relatório",
            descricao: `Erro ao gerar relatório de ${aluno.nome}: ${e instanceof Error ? e.message : "Erro desconhecido"}`,
          });
        }
        controller.enqueue(encoder.encode(`\n\n__ERROR__${e instanceof Error ? e.message : "Erro desconhecido"}`));
      } finally {
        clearInterval(keepAlive);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
