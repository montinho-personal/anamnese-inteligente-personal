import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AlunosLista } from "@/components/dashboard/alunos-lista";
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
        <AlunosLista alunos={alunos} />
      )}
    </div>
  );
}
