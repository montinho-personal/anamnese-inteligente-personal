import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditarAlunoForm } from "@/components/dashboard/editar-aluno-form";
import type { Aluno } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function EditarAlunoPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data } = await supabase.from("alunos").select("*").eq("id", params.id).single();
  const aluno = data as Aluno | null;
  if (!aluno) notFound();

  return <EditarAlunoForm aluno={aluno} />;
}
