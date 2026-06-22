import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertaAcoes } from "@/components/dashboard/alerta-acoes";
import { formatarData } from "@/lib/utils";
import { Bell } from "lucide-react";
import type { Alerta, Aluno } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AlertasPage() {
  const supabase = createClient();
  const { data: alertasData } = await supabase
    .from("alertas")
    .select("*")
    .eq("resolvido", false)
    .order("created_at", { ascending: false });
  const alertas = (alertasData as Alerta[]) ?? [];

  const { data: alunosData } = await supabase.from("alunos").select("id,nome");
  const nomes = new Map((alunosData as Pick<Aluno, "id" | "nome">[] ?? []).map((a) => [a.id, a.nome]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-5 w-5 text-amber-400" /> Alertas
        </h1>
        <p className="text-muted-foreground">{alertas.length} pendente(s)</p>
      </div>

      {alertas.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhum alerta pendente. 🎉</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {alertas.map((a) => (
            <Card key={a.id} className={a.criticidade === "alta" ? "border-destructive/50" : ""}>
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={a.criticidade === "alta" ? "destructive" : a.criticidade === "media" ? "warning" : "muted"}>
                    {a.criticidade}
                  </Badge>
                  <Badge variant="secondary" className="capitalize">{a.tipo.replace("_", " ")}</Badge>
                  {!a.lido && <Badge>Novo</Badge>}
                  <span className="ml-auto text-xs text-muted-foreground">{formatarData(a.created_at)}</span>
                </div>
                <div>
                  <p className="font-medium">{a.titulo}</p>
                  {a.descricao && <p className="text-sm text-muted-foreground">{a.descricao}</p>}
                  <Link href={`/alunos/${a.aluno_id}`} className="text-sm text-primary hover:underline">
                    Ver {nomes.get(a.aluno_id) ?? "aluno"}
                  </Link>
                </div>
                <AlertaAcoes id={a.id} lido={a.lido} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
