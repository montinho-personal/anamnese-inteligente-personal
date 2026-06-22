import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { CheckinForm } from "@/components/anamnese/CheckinForm";
import type { Aluno } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function CheckinPage({ params }: { params: { token: string } }) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("alunos")
    .select("nome,token_anamnese")
    .eq("token_anamnese", params.token)
    .single();
  const aluno = data as Pick<Aluno, "nome" | "token_anamnese"> | null;
  if (!aluno) notFound();

  return <CheckinForm token={params.token} nomeAluno={aluno.nome.split(" ")[0]} />;
}
