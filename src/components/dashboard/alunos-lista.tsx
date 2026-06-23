"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronRight, Search, ArrowUpAZ, ArrowDownAZ, Clock } from "lucide-react";
import { iniciais, formatarData } from "@/lib/utils";
import type { Aluno } from "@/types/database";

type Ordem = "az" | "za" | "recente";

export function AlunosLista({ alunos }: { alunos: Aluno[] }) {
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<Ordem>("recente");

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    let lista = termo
      ? alunos.filter(
          (a) =>
            a.nome.toLowerCase().includes(termo) ||
            (a.email ?? "").toLowerCase().includes(termo) ||
            (a.whatsapp ?? "").includes(termo),
        )
      : [...alunos];

    if (ordem === "az") lista.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    else if (ordem === "za") lista.sort((a, b) => b.nome.localeCompare(a.nome, "pt-BR"));
    // "recente" mantém a ordem original (já vem do servidor por created_at desc)

    return lista;
  }, [alunos, busca, ordem]);

  return (
    <div className="space-y-4">
      {/* Search + sort bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome, e-mail ou WhatsApp..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 shrink-0">
          <Button
            variant={ordem === "recente" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setOrdem("recente")}
            className="gap-1.5"
          >
            <Clock className="h-3.5 w-3.5" /> Recentes
          </Button>
          <Button
            variant={ordem === "az" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setOrdem("az")}
            className="gap-1.5"
          >
            <ArrowUpAZ className="h-3.5 w-3.5" /> A–Z
          </Button>
          <Button
            variant={ordem === "za" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setOrdem("za")}
            className="gap-1.5"
          >
            <ArrowDownAZ className="h-3.5 w-3.5" /> Z–A
          </Button>
        </div>
      </div>

      {/* Results */}
      {filtrados.length === 0 ? (
        <p className="text-center text-muted-foreground py-8 text-sm">
          {busca ? `Nenhum aluno encontrado para "${busca}".` : "Nenhum aluno cadastrado."}
        </p>
      ) : (
        <div className="grid gap-3">
          {filtrados.map((aluno) => (
            <Link key={aluno.id} href={`/alunos/${aluno.id}`}>
              <Card className="hover:border-primary/50 transition-colors">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold shrink-0">
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
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {busca && filtrados.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {filtrados.length} de {alunos.length} aluno(s)
        </p>
      )}
    </div>
  );
}
