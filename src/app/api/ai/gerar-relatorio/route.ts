import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { gerarRelatorio } from "@/lib/ai/engine";
import type { Respostas } from "@/types/anamnese";
import type { Anamnese } from "@/types/database";

export const maxDuration = 60; // Pro plan allows up to 60s

const schema = z.object({ relatorio_id: z.string().uuid() });

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "relatorio_id inválido" }, { status: 422 });
  }

  const supabase = createServiceClient();

  const { data: rel } = await supabase
    .from("relatorios")
    .select("id, anamnese_id, aluno_id")
    .eq("id", parsed.data.relatorio_id)
    .single();
  if (!rel) return NextResponse.json({ error: "Relatório não encontrado" }, { status: 404 });

  const { data: anamneseData } = await supabase
    .from("anamneses")
    .select("*")
    .eq("id", rel.anamnese_id)
    .single();
  const anamnese = anamneseData as Anamnese | null;
  if (!anamnese) return NextResponse.json({ error: "Anamnese não encontrada" }, { status: 404 });

  await supabase.from("relatorios").update({ status: "gerando" }).eq("id", rel.id);

  try {
    const { relatorio, tokensUsados } = await gerarRelatorio(
      anamnese.respostas as Respostas,
    );

    await supabase
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
        tokens_ia_usados: tokensUsados,
        gerado_em: new Date().toISOString(),
      })
      .eq("id", rel.id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Geração de relatório falhou:", e);
    await supabase.from("relatorios").update({ status: "falhou" }).eq("id", rel.id);
    // Notify the trainer via an alert.
    const { data: aluno } = await supabase
      .from("alunos")
      .select("personal_id, nome")
      .eq("id", rel.aluno_id)
      .single();
    if (aluno) {
      await supabase.from("alertas").insert({
        aluno_id: rel.aluno_id,
        personal_id: aluno.personal_id,
        tipo: "comportamental",
        criticidade: "media",
        titulo: "Falha na geração do relatório",
        descricao: `Não foi possível gerar o relatório de ${aluno.nome}. Tente regerar manualmente.`,
      });
    }
    return NextResponse.json({ error: "Falha na geração" }, { status: 500 });
  }
}
