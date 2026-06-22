"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, MessageSquarePlus, Trash2, StickyNote } from "lucide-react";
import { formatarData } from "@/lib/utils";
import type { Observacao } from "@/types/database";

const TIPOS: Record<string, string> = {
  geral: "Geral",
  treino: "Treino",
  comportamental: "Comportamental",
  nutricao: "Nutrição",
};

interface Props {
  alunoId: string;
  observacoesIniciais: Observacao[];
}

export function ObservacoesSection({ alunoId, observacoesIniciais }: Props) {
  const router = useRouter();
  const [obs, setObs] = useState(observacoesIniciais);
  const [conteudo, setConteudo] = useState("");
  const [tipo, setTipo] = useState<string>("geral");
  const [salvando, setSalvando] = useState(false);
  const [removendo, setRemovendo] = useState<string | null>(null);

  async function salvar() {
    if (!conteudo.trim()) return;
    setSalvando(true);
    try {
      const res = await fetch("/api/observacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aluno_id: alunoId, conteudo: conteudo.trim(), tipo }),
      });
      const json = await res.json();
      if (res.ok) {
        setObs((prev) => [json.observacao, ...prev]);
        setConteudo("");
        router.refresh();
      }
    } finally {
      setSalvando(false);
    }
  }

  async function remover(id: string) {
    setRemovendo(id);
    try {
      await fetch(`/api/observacoes?id=${id}`, { method: "DELETE" });
      setObs((prev) => prev.filter((o) => o.id !== id));
      router.refresh();
    } finally {
      setRemovendo(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <StickyNote className="h-4 w-4" /> Observações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Adicione uma observação..."
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            rows={3}
          />
          <div className="flex items-center gap-2">
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIPOS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={salvar} disabled={salvando || !conteudo.trim()}>
              {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquarePlus className="h-4 w-4" />}
              Salvar
            </Button>
          </div>
        </div>

        {obs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma observação ainda.</p>
        ) : (
          <div className="space-y-2">
            {obs.map((o) => (
              <div key={o.id} className="rounded-lg border border-border p-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{TIPOS[o.tipo]}</Badge>
                    <span className="text-xs text-muted-foreground">{formatarData(o.created_at)}</span>
                  </div>
                  <button
                    onClick={() => remover(o.id)}
                    disabled={removendo === o.id}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    {removendo === o.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <p className="text-sm whitespace-pre-line">{o.conteudo}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
