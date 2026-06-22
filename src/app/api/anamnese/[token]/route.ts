import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import {
  calcularProgresso,
  anamneseCompleta,
  avaliarAlertas,
} from "@/lib/anamnese/flow-engine";
import type { Respostas } from "@/types/anamnese";
import type { Aluno, Anamnese } from "@/types/database";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const saveSchema = z.object({
  respostas: z.record(z.any()),
  finalizar: z.boolean().optional(),
});

async function alunoPorToken(token: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("alunos")
    .select("*")
    .eq("token_anamnese", token)
    .single();
  return { supabase, aluno: (data as Aluno) ?? null };
}

// GET: load the student's current anamnese (token-gated, no login).
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const { supabase, aluno } = await alunoPorToken(params.token);
  if (!aluno) return NextResponse.json({ error: "Token inválido" }, { status: 404 });

  let { data: anamnese } = await supabase
    .from("anamneses")
    .select("*")
    .eq("aluno_id", aluno.id)
    .order("versao", { ascending: false })
    .limit(1)
    .single();

  if (!anamnese) {
    const { data: nova } = await supabase
      .from("anamneses")
      .insert({ aluno_id: aluno.id, status: "pendente" })
      .select("*")
      .single();
    anamnese = nova;
  }

  return NextResponse.json({
    aluno: { nome: aluno.nome, id: aluno.id },
    anamnese,
  });
}

// POST: save progress (autosave) and optionally finalize.
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const { supabase, aluno } = await alunoPorToken(params.token);
  if (!aluno) return NextResponse.json({ error: "Token inválido" }, { status: 404 });

  const body = await req.json();
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const respostas = parsed.data.respostas as Respostas;
  const finalizar = parsed.data.finalizar ?? false;

  const { data: anamneseData } = await supabase
    .from("anamneses")
    .select("*")
    .eq("aluno_id", aluno.id)
    .order("versao", { ascending: false })
    .limit(1)
    .single();
  const anamnese = anamneseData as Anamnese | null;
  if (!anamnese) return NextResponse.json({ error: "Anamnese não encontrada" }, { status: 404 });

  const progresso = calcularProgresso(respostas);
  const completa = finalizar && anamneseCompleta(respostas);

  await supabase
    .from("anamneses")
    .update({
      respostas,
      progresso_percentual: progresso,
      status: completa ? "concluida" : "em_progresso",
      iniciada_em: anamnese.iniciada_em ?? new Date().toISOString(),
      concluida_em: completa ? new Date().toISOString() : null,
    })
    .eq("id", anamnese.id);

  if (completa) {
    // Mark student active.
    await supabase.from("alunos").update({ status: "ativo" }).eq("id", aluno.id);

    // Create triggered alerts (cardiovascular = critical) BEFORE returning.
    const alertas = avaliarAlertas(respostas);
    if (alertas.length > 0) {
      await supabase.from("alertas").insert(
        alertas.map((a) => ({
          aluno_id: aluno.id,
          personal_id: aluno.personal_id,
          tipo: a.tipo,
          criticidade: a.criticidade,
          titulo: a.titulo,
          descricao: a.descricao,
        })),
      );
    }

    // Create the report row in 'gerando' state and kick off async generation.
    const { data: rel } = await supabase
      .from("relatorios")
      .insert({ anamnese_id: anamnese.id, aluno_id: aluno.id, status: "gerando" })
      .select("id")
      .single();

    if (rel) {
      // Fire-and-forget the AI generation endpoint so the student isn't blocked.
      fetch(`${APP_URL}/api/ai/gerar-relatorio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relatorio_id: rel.id }),
      }).catch((e) => console.error("Falha ao disparar geração:", e));
    }
  }

  return NextResponse.json({ ok: true, progresso, concluida: completa });
}
