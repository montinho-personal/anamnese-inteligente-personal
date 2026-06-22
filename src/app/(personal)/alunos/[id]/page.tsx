import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyLink } from "@/components/dashboard/copy-link";
import { StatusSelector } from "@/components/dashboard/status-selector";
import { iniciais, formatarData } from "@/lib/utils";
import { ArrowLeft, FileText, Activity, History, Link2 } from "lucide-react";
import type { Aluno, Anamnese, Relatorio } from "@/types/database";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function AlunoPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: alunoData } = await supabase.from("alunos").select("*").eq("id", params.id).single();
  const aluno = alunoData as Aluno | null;
  if (!aluno) notFound();

  const { data: anamneseData } = await supabase
    .from("anamneses")
    .select("*")
    .eq("aluno_id", aluno.id)
    .order("versao", { ascending: false })
    .limit(1)
    .single();
  const anamnese = anamneseData as Anamnese | null;

  const { data: relData } = await supabase
    .from("relatorios")
    .select("id, status, gerado_em")
    .eq("aluno_id", aluno.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  const relatorio = relData as Pick<Relatorio, "id" | "status" | "gerado_em"> | null;

  const linkAnamnese = `${APP_URL}/anamnese/${aluno.token_anamnese}`;
  const linkCheckin = `${APP_URL}/anamnese/${aluno.token_anamnese}/checkin`;

  return (
    <div className="space-y-6">
      <Link href="/alunos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary text-lg font-semibold">
          {iniciais(aluno.nome)}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">{aluno.nome}</h1>
          <p className="text-muted-foreground text-sm">
            {aluno.idade ? `${aluno.idade} anos · ` : ""}
            {aluno.sexo ?? ""} · cadastrado em {formatarData(aluno.created_at)}
          </p>
        </div>
        <StatusSelector alunoId={aluno.id} status={aluno.status} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Button asChild variant="outline" className="justify-start">
          <Link href={`/alunos/${aluno.id}/relatorio`}>
            <FileText className="h-4 w-4" /> Relatório IA
          </Link>
        </Button>
        <Button asChild variant="outline" className="justify-start">
          <Link href={`/alunos/${aluno.id}/checkins`}>
            <Activity className="h-4 w-4" /> Check-ins
          </Link>
        </Button>
        <Button asChild variant="outline" className="justify-start">
          <Link href={`/alunos/${aluno.id}/historico`}>
            <History className="h-4 w-4" /> Histórico
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Linha label="E-mail" valor={aluno.email} />
            <Linha label="Telefone" valor={aluno.telefone} />
            <Linha label="WhatsApp" valor={aluno.whatsapp} />
            <Linha label="Altura" valor={aluno.altura_cm ? `${aluno.altura_cm} cm` : null} />
            <Linha label="Peso" valor={aluno.peso_kg ? `${aluno.peso_kg} kg` : null} />
            {aluno.observacoes && (
              <div className="pt-2">
                <p className="text-muted-foreground">Observações</p>
                <p>{aluno.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="h-4 w-4" /> Links do aluno
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Anamnese</p>
                <Badge
                  variant={
                    anamnese?.status === "concluida"
                      ? "success"
                      : anamnese?.status === "em_progresso"
                        ? "warning"
                        : "secondary"
                  }
                >
                  {anamnese?.status ?? "pendente"} · {anamnese?.progresso_percentual ?? 0}%
                </Badge>
              </div>
              <CopyLink url={linkAnamnese} />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Check-in semanal</p>
              <CopyLink url={linkCheckin} />
            </div>
            <div className="flex items-center justify-between pt-2 text-sm">
              <span className="text-muted-foreground">Relatório IA</span>
              <Badge
                variant={
                  relatorio?.status === "concluido"
                    ? "success"
                    : relatorio?.status === "gerando"
                      ? "warning"
                      : relatorio?.status === "falhou"
                        ? "destructive"
                        : "muted"
                }
              >
                {relatorio?.status ?? "—"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Linha({ label, valor }: { label: string; valor: string | null }) {
  return (
    <div className="flex justify-between border-b border-border/50 py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span>{valor || "—"}</span>
    </div>
  );
}
