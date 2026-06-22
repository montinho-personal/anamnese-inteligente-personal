import { notFound, redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { AnamneseWizard } from "@/components/anamnese/AnamneseWizard";
import type { Aluno, Anamnese } from "@/types/database";
import type { Respostas } from "@/types/anamnese";

export const dynamic = "force-dynamic";

export default async function AnamnesePage({ params }: { params: { token: string } }) {
  const supabase = createServiceClient();

  const { data: alunoData } = await supabase
    .from("alunos")
    .select("*")
    .eq("token_anamnese", params.token)
    .single();
  const aluno = alunoData as Aluno | null;
  if (!aluno) notFound();

  let { data: anamneseData } = await supabase
    .from("anamneses")
    .select("*")
    .eq("aluno_id", aluno.id)
    .order("versao", { ascending: false })
    .limit(1)
    .single();

  if (!anamneseData) {
    const { data: nova } = await supabase
      .from("anamneses")
      .insert({ aluno_id: aluno.id, status: "pendente" })
      .select("*")
      .single();
    anamneseData = nova;
  }

  const anamnese = anamneseData as Anamnese;
  if (anamnese.status === "concluida") {
    redirect(`/anamnese/${params.token}/obrigado`);
  }

  return (
    <AnamneseWizard
      token={params.token}
      nomeAluno={aluno.nome.split(" ")[0]}
      respostasIniciais={(anamnese.respostas as Respostas) ?? {}}
    />
  );
}
