import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import type { Aluno } from "@/types/database";

const checkinSchema = z.object({
  token: z.string().uuid(),
  energia: z.coerce.number().int().min(1).max(5),
  sono: z.coerce.number().int().min(1).max(5),
  treinos_realizados: z.coerce.number().int().min(0),
  treinos_esperados: z.coerce.number().int().min(0),
  dores_relatadas: z.string().optional(),
  humor_geral: z.coerce.number().int().min(1).max(5),
  comentario_livre: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = checkinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const supabase = createServiceClient();
  const { data: alunoData } = await supabase
    .from("alunos")
    .select("*")
    .eq("token_anamnese", parsed.data.token)
    .single();
  const aluno = alunoData as Aluno | null;
  if (!aluno) return NextResponse.json({ error: "Token inválido" }, { status: 404 });

  const { token, ...campos } = parsed.data;
  const semana = new Date().toISOString().slice(0, 10);

  const { error } = await supabase.from("checkins").insert({
    aluno_id: aluno.id,
    semana_referencia: semana,
    ...campos,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Keep the student "active" and refresh last-activity timestamp.
  await supabase.from("alunos").update({ status: "ativo" }).eq("id", aluno.id);

  // If pain was reported, raise an orthopedic alert for the trainer.
  if (campos.dores_relatadas && campos.dores_relatadas.trim().length > 0) {
    await supabase.from("alertas").insert({
      aluno_id: aluno.id,
      personal_id: aluno.personal_id,
      tipo: "ortopedico",
      criticidade: "media",
      titulo: `Dor relatada no check-in — ${aluno.nome}`,
      descricao: campos.dores_relatadas,
    });
  }

  return NextResponse.json({ ok: true });
}
