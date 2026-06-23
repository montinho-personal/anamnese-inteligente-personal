"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

interface Props {
  relatorioId: string;
  initiallyGenerating?: boolean;
}

export function RegerarButton({ relatorioId, initiallyGenerating = false }: Props) {
  const router = useRouter();
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startPolling() {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/relatorio-status?id=${relatorioId}`);
        if (!res.ok) return;
        const { status } = await res.json() as { status: string };
        if (status === "concluido") {
          stopPolling();
          setGerando(false);
          router.refresh();
        } else if (status === "falhou") {
          stopPolling();
          setGerando(false);
          setErro("Falha na geração. Tente novamente.");
        }
      } catch { /* keep polling */ }
    }, 5000);
  }

  function stopPolling() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }

  useEffect(() => () => stopPolling(), []);

  async function regerar() {
    setGerando(true);
    setErro(null);
    try {
      const res = await fetch("/api/ai/gerar-relatorio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relatorio_id: relatorioId }),
      });
      // If we got a response, we're done
      stopPolling();
      if (res.ok) {
        router.refresh();
      } else {
        const json = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(json.error ?? "Erro ao gerar relatório");
      }
    } catch (e) {
      // Network dropped (mobile sleep, etc.) — server may still be running
      // Fall back to polling to detect when it finishes
      if ((e as Error).message === "Failed to fetch" || (e as Error).name === "TypeError") {
        startPolling();
        return; // keep gerando=true, polling will clear it
      }
      setErro(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      if (!pollRef.current) setGerando(false);
    }
  }

  useEffect(() => {
    if (initiallyGenerating) {
      setGerando(true);
      startPolling();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-start gap-1">
      <Button variant="outline" onClick={regerar} disabled={gerando}>
        {gerando ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        {gerando ? "Gerando..." : "Regerar relatório"}
      </Button>
      {erro && <p className="text-xs text-destructive">{erro}</p>}
    </div>
  );
}
