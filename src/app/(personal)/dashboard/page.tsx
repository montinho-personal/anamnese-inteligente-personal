import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPersonal } from "@/lib/data/personal";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, AlertTriangle, Bell, Plus } from "lucide-react";
import { diasDesde, iniciais } from "@/lib/utils";
import type { Aluno, Alerta } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const personal = await getPersonal();

  const { data: alunosData } = await supabase.from("alunos").select("*");
  const alunos = (alunosData as Aluno[]) ?? [];

  const { data: alertasData } = await supabase
    .from("alertas")
    .select("*")
    .eq("resolvido", false)
    .order("created_at", { ascending: false })
    .limit(5);
  const alertas = (alertasData as Alerta[]) ?? [];

  const ativos = alunos.filter((a) => a.status === "ativo").length;
  const inativos = alunos.filter((a) => a.status === "inativo").length;
  const emRisco = alunos.filter((a) => diasDesde(a.updated_at) > 7).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Olá, {personal?.nome?.split(" ")[0] ?? "Personal"} 👋</h1>
          <p className="text-muted-foreground">Visão geral do seu negócio</p>
        </div>
        <Button asChild>
          <Link href="/alunos/novo">
            <Plus className="h-4 w-4" /> Novo aluno
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard titulo="Total de alunos" valor={alunos.length} icon={Users} />
        <StatCard titulo="Ativos" valor={ativos} icon={UserCheck} cor="text-emerald-400" />
        <StatCard titulo="Em risco" valor={emRisco} icon={AlertTriangle} cor="text-amber-400" descricao="Sem atividade há 7+ dias" />
        <StatCard titulo="Inativos" valor={inativos} icon={Users} cor="text-slate-400" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-400" /> Alertas recentes
            </CardTitle>
            <Link href="/alertas" className="text-sm text-primary hover:underline">Ver todos</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertas.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum alerta pendente. 🎉</p>
            )}
            {alertas.map((alerta) => (
              <div key={alerta.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <Badge
                  variant={
                    alerta.criticidade === "alta"
                      ? "destructive"
                      : alerta.criticidade === "media"
                        ? "warning"
                        : "muted"
                  }
                >
                  {alerta.criticidade}
                </Badge>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{alerta.titulo}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{alerta.descricao}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Alunos recentes</CardTitle>
            <Link href="/alunos" className="text-sm text-primary hover:underline">Ver todos</Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {alunos.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Você ainda não tem alunos.{" "}
                <Link href="/alunos/novo" className="text-primary hover:underline">Cadastre o primeiro</Link>.
              </p>
            )}
            {alunos.slice(0, 6).map((aluno) => (
              <Link
                key={aluno.id}
                href={`/alunos/${aluno.id}`}
                className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-semibold">
                  {iniciais(aluno.nome)}
                </div>
                <span className="flex-1 text-sm font-medium truncate">{aluno.nome}</span>
                <Badge variant={aluno.status === "ativo" ? "success" : aluno.status === "inativo" ? "muted" : "secondary"}>
                  {aluno.status}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
