"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ClipboardList, Loader2 } from "lucide-react";

export function SolicitarReavaliacaoButton({ alunoId }: { alunoId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function solicitar() {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch(`/api/alunos/${alunoId}/solicitar-reavaliacao`, { method: "POST" });
      const json = await res.json() as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Erro ao solicitar reavaliação");
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <Button variant="outline" size="sm" onClick={solicitar} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardList className="h-4 w-4" />}
        {loading ? "Solicitando..." : "Solicitar reavaliação"}
      </Button>
      {erro && <p className="text-xs text-destructive">{erro}</p>}
    </div>
  );
}
