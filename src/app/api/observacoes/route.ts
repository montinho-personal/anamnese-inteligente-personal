import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getPersonal } from "@/lib/data/personal";

const schema = z.object({
  aluno_id: z.string().uuid(),
  conteudo: z.string().min(1).max(2000),
  tipo: z.enum(["geral", "treino", "comportamental", "nutricao"]).default("geral"),
});

export async function POST(req: Request) {
  const personal = await getPersonal();
  if (!personal) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("observacoes")
    .insert({ ...parsed.data, personal_id: personal.id })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ observacao: data });
}

export async function DELETE(req: Request) {
  const personal = await getPersonal();
  if (!personal) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 422 });

  const supabase = createClient();
  await supabase.from("observacoes").delete().eq("id", id).eq("personal_id", personal.id);
  return NextResponse.json({ ok: true });
}
