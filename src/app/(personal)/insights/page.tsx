import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Flame, Activity, UserX, PhoneCall } from "lucide-react";
import { diasDesde, iniciais } from "@/lib/utils";
import type { Aluno, Alerta, Checkin } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const supabase = createClient();

  const { data: alunosData } = await supabase.from("alunos").select("*");
  const alunos = (alunosData as Aluno[]) ?? [];

  const { data: alertasData } = await supabase.from("alertas").select("*").eq("resolvido", false);
  const alertas = (alertasData as Alerta[]) ?? [];

  const { data: checkinsData } = await supabase
    .from("checkins")
    .select("*")
    .order("created_at", { ascending: false });
  const checkins = (checkinsData as Checkin[]) ?? [];

  const mapaAluno = new Map(alunos.map((a) => [a.id, a]));

  // Categorize.
  const emRisco = alunos.filter((a) => diasDesde(a.updated_at) > 7 && a.status !== "inativo");
  const engajados = alunos.filter((a) => a.status === "ativo" && diasDesde(a.updated_at) <= 7);
  const inativos = alunos.filter((a) => a.status === "inativo");

  const idsComDor = new Set(
    [...alertas.filter((a) => a.tipo === "ortopedico"), ...alertas.filter((a) => a.tipo === "cardiovascular")].map((a) => a.aluno_id),
  );
  checkins.forEach((c) => {
    if (c.dores_relatadas && c.dores_relatadas.trim()) idsComDor.add(c.aluno_id);
  });
  const comDores = alunos.filter((a) => idsComDor.has(a.id));

  const precisamContato = alunos.filter(
    (a) => diasDesde(a.updated_at) > 14 || alertas.some((al) => al.aluno_id === a.id && al.criticidade === "alta"),
  );

  const categorias = [
    { titulo: "Alunos em risco", icon: AlertTriangle, cor: "text-amber-400", lista: emRisco },
    { titulo: "Alunos engajados", icon: Flame, cor: "text-emerald-400", lista: engajados },
    { titulo: "Alunos com dores", icon: Activity, cor: "text-red-400", lista: comDores },
    { titulo: "Alunos inativos", icon: UserX, cor: "text-slate-400", lista: inativos },
    { titulo: "Precisam de contato", icon: PhoneCall, cor: "text-indigo-400", lista: precisamContato },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Insights</h1>
        <p className="text-muted-foreground">Inteligência sobre sua base de alunos</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {categorias.map((cat) => {
          const Icon = cat.icon;
          return (
            <Card key={cat.titulo}>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className={`h-4 w-4 ${cat.cor}`} /> {cat.titulo}
                </CardTitle>
                <Badge variant="secondary">{cat.lista.length}</Badge>
              </CardHeader>
              <CardContent className="space-y-1">
                {cat.lista.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum aluno nesta categoria.</p>
                ) : (
                  cat.lista.slice(0, 8).map((a) => {
                    const aluno = mapaAluno.get(a.id) ?? a;
                    return (
                      <Link key={a.id} href={`/alunos/${a.id}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent transition-colors">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-semibold">
                          {iniciais(aluno.nome)}
                        </div>
                        <span className="flex-1 text-sm truncate">{aluno.nome}</span>
                        <span className="text-xs text-muted-foreground">{diasDesde(a.updated_at)}d</span>
                      </Link>
                    );
                  })
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
