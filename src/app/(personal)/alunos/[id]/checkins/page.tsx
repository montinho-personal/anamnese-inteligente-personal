import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Activity } from "lucide-react";
import { formatarData } from "@/lib/utils";
import type { Aluno, Checkin } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function CheckinsPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: alunoData } = await supabase.from("alunos").select("nome,id").eq("id", params.id).single();
  const aluno = alunoData as Pick<Aluno, "nome" | "id"> | null;
  if (!aluno) notFound();

  const { data } = await supabase
    .from("checkins")
    .select("*")
    .eq("aluno_id", aluno.id)
    .order("created_at", { ascending: false });
  const checkins = (data as Checkin[]) ?? [];

  return (
    <div className="space-y-6">
      <Link href={`/alunos/${aluno.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" /> Check-ins de {aluno.nome}
      </h1>

      {checkins.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhum check-in registrado.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {checkins.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{formatarData(c.created_at)}</span>
                  {c.dores_relatadas && <Badge variant="warning">Dor relatada</Badge>}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <Metric label="Energia" valor={`${c.energia}/5`} />
                  <Metric label="Sono" valor={`${c.sono}/5`} />
                  <Metric label="Humor" valor={`${c.humor_geral}/5`} />
                  <Metric label="Treinos" valor={`${c.treinos_realizados}/${c.treinos_esperados}`} />
                </div>
                {c.dores_relatadas && (
                  <p className="text-sm text-amber-400">Dores: {c.dores_relatadas}</p>
                )}
                {c.comentario_livre && (
                  <p className="text-sm text-muted-foreground">“{c.comentario_livre}”</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="rounded-lg border border-border p-2 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{valor}</p>
    </div>
  );
}
