import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, History } from "lucide-react";
import { formatarData } from "@/lib/utils";
import { PERGUNTAS } from "@/lib/anamnese/flow-engine";
import type { Aluno, Anamnese, ComunicacaoLog } from "@/types/database";
import type { Respostas } from "@/types/anamnese";

export const dynamic = "force-dynamic";

export default async function HistoricoPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: alunoData } = await supabase.from("alunos").select("nome,id").eq("id", params.id).single();
  const aluno = alunoData as Pick<Aluno, "nome" | "id"> | null;
  if (!aluno) notFound();

  const { data: anamneseData } = await supabase
    .from("anamneses")
    .select("*")
    .eq("aluno_id", aluno.id)
    .order("versao", { ascending: false })
    .limit(1)
    .single();
  const anamnese = anamneseData as Anamnese | null;
  const respostas = (anamnese?.respostas as Respostas) ?? {};

  const { data: comData } = await supabase
    .from("comunicacoes_log")
    .select("*")
    .eq("aluno_id", aluno.id)
    .order("created_at", { ascending: false });
  const comunicacoes = (comData as ComunicacaoLog[]) ?? [];

  const respondidas = PERGUNTAS.filter((p) => respostas[p.id] !== undefined);

  return (
    <div className="space-y-6">
      <Link href={`/alunos/${aluno.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <History className="h-5 w-5 text-primary" /> Histórico de {aluno.nome}
      </h1>

      <Card>
        <CardContent className="p-5 space-y-3">
          <h2 className="font-semibold">Respostas da anamnese</h2>
          {respondidas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Anamnese ainda não respondida.</p>
          ) : (
            <div className="space-y-2">
              {respondidas.map((p) => {
                const v = respostas[p.id];
                return (
                  <div key={p.id} className="border-b border-border/50 py-2 last:border-0">
                    <p className="text-sm text-muted-foreground">{p.titulo}</p>
                    <p className="text-sm">{Array.isArray(v) ? v.join(", ") : String(v)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-3">
          <h2 className="font-semibold">Comunicações</h2>
          {comunicacoes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma comunicação registrada.</p>
          ) : (
            comunicacoes.map((c) => (
              <div key={c.id} className="flex items-center justify-between border-b border-border/50 py-2 last:border-0 text-sm">
                <span className="capitalize">{c.tipo.replace("_", " ")} · {c.canal}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={c.status === "enviado" ? "success" : c.status === "falhou" ? "destructive" : "muted"}>
                    {c.status}
                  </Badge>
                  <span className="text-muted-foreground">{formatarData(c.created_at)}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
