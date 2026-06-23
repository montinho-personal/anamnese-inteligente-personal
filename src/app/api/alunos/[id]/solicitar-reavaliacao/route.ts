import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getPersonal } from "@/lib/data/personal";
import type { Anamnese } from "@/types/database";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const personal = await getPersonal();
  if (!personal) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const supabase = createServiceClient();

  const { data: alunoData } = await supabase
    .from("alunos")
    .select("id, personal_id")
    .eq("id", params.id)
    .single();
  if (!alunoData || alunoData.personal_id !== personal.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { data: ultimaData } = await supabase
    .from("anamneses")
    .select("versao, status")
    .eq("aluno_id", params.id)
    .order("versao", { ascending: false })
    .limit(1)
    .single();
  const ultima = ultimaData as Pick<Anamnese, "versao" | "status"> | null;

  if (ultima?.status === "pendente" || ultima?.status === "em_progresso") {
    return NextResponse.json({ error: "Já existe uma anamnese em aberto para este aluno" }, { status: 409 });
  }

  const proximaVersao = (ultima?.versao ?? 0) + 1;

  const { error } = await supabase
    .from("anamneses")
    .insert({ aluno_id: params.id, versao: proximaVersao, status: "pendente" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, versao: proximaVersao });
}
