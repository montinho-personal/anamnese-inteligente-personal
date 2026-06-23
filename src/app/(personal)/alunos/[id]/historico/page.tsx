import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, History, FileText, GitCompare } from "lucide-react";
import { ComparacaoAnamneses } from "@/components/historico/ComparacaoAnamneses";
import { formatarData } from "@/lib/utils";
import { PERGUNTAS } from "@/lib/anamnese/flow-engine";
import type { Aluno, Anamnese, Relatorio } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function HistoricoPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: alunoData } = await supabase.from("alunos").select("*").eq("id", params.id).single();
  const aluno = alunoData as Aluno | null;
  if (!aluno) notFound();

  const { data: anamnesesData } = await supabase
    .from("anamneses")
    .select("*")
    .eq("aluno_id", aluno.id)
    .order("versao", { ascending: false });
  const anamneses = (anamnesesData as Anamnese[]) ?? [];

  const { data: relatoriosData } = await supabase
    .from("relatorios")
    .select("id, anamnese_id, status, gerado_em, versao")
    .eq("aluno_id", aluno.id)
    .order("created_at", { ascending: false });
  const relatorios = (relatoriosData ?? []) as Pick<Relatorio, "id" | "anamnese_id" | "status" | "gerado_em" | "versao">[];

  const relPorAnamnese: Record<string, typeof relatorios[number]> = Object.fromEntries(
    relatorios.map((r) => [r.anamnese_id, r]),
  );

  return (
    <div className="space-y-6">
      <Link href={`/alunos/${aluno.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <History className="h-5 w-5 text-primary" /> Histórico de Anamneses
        </h1>
        <p className="text-muted-foreground text-sm">{aluno.nome} · {anamneses.length} registro(s)</p>
      </div>

      {anamneses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhuma anamnese registrada ainda.
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {anamneses.map((a) => {
          const rel = relPorAnamnese[a.id];
          const respostas = a.respostas as Record<string, unknown>;
          const objetivos = Array.isArray(respostas?.objetivos)
            ? (respostas.objetivos as string[]).join(", ")
            : (respostas?.objetivos as string | undefined) ?? "—";
          const peso = respostas?.peso ? `${respostas.peso} kg` : null;
          const dias = respostas?.dias_disponiveis ? `${respostas.dias_disponiveis}×/sem` : null;
          const isAtual = a.versao === anamneses[0]?.versao;

          return (
            <Card key={a.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">Versão {a.versao}</span>
                      <Badge variant={
                        a.status === "concluida" ? "success" :
                        a.status === "em_progresso" ? "warning" : "muted"
                      }>{a.status}</Badge>
                      {isAtual && <Badge variant="default">Atual</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {a.concluida_em
                        ? `Concluída em ${formatarData(a.concluida_em)}`
                        : `Iniciada em ${formatarData(a.created_at)}`}
                      {a.progresso_percentual > 0 && ` · ${a.progresso_percentual}% completa`}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {objetivos !== "—" && <span>🎯 {objetivos}</span>}
                      {peso && <span>⚖️ {peso}</span>}
                      {dias && <span>🗓 {dias}</span>}
                    </div>
                  </div>
                  {rel?.status === "concluido" && (
                    <Link
                      href={`/alunos/${aluno.id}/relatorio`}
                      className="inline-flex items-center gap-1 text-xs border border-border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors"
                    >
                      <FileText className="h-3 w-3" /> Relatório
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {anamneses.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GitCompare className="h-4 w-4 text-primary" />
              Comparação de versões
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Versão {anamneses[0].versao} (atual) vs versão {anamneses[1].versao} (anterior)
            </p>
          </CardHeader>
          <CardContent>
            <ComparacaoAnamneses
              atual={anamneses[0]}
              anterior={anamneses[1]}
              perguntas={PERGUNTAS}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
