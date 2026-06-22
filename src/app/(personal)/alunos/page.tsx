import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight } from "lucide-react";
import { iniciais, formatarData } from "@/lib/utils";
import type { Aluno } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AlunosPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("alunos")
    .select("*")
    .order("created_at", { ascending: false });
  const alunos = (data as Aluno[]) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alunos</h1>
          <p className="text-muted-foreground">{alunos.length} cadastrado(s)</p>
        </div>
        <Button asChild>
          <Link href="/alunos/novo">
            <Plus className="h-4 w-4" /> Novo aluno
          </Link>
        </Button>
      </div>

      {alunos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum aluno ainda.{" "}
            <Link href="/alunos/novo" className="text-primary hover:underline">
              Cadastre o primeiro
            </Link>
            .
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {alunos.map((aluno) => (
            <Link key={aluno.id} href={`/alunos/${aluno.id}`}>
              <Card className="hover:border-primary/50 transition-colors">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold">
                    {iniciais(aluno.nome)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{aluno.nome}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {aluno.email || aluno.whatsapp || "Sem contato"} · desde {formatarData(aluno.created_at)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      aluno.status === "ativo" ? "success" : aluno.status === "inativo" ? "muted" : "secondary"
                    }
                  >
                    {aluno.status}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
