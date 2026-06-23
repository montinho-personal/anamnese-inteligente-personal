"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

interface Props {
  relatorioId: string;
  /** If the report is already stuck in "gerando", start polling immediately */
  initiallyGenerating?: boolean;
}

export function RegerarButton({ relatorioId, initiallyGenerating = false }: Props) {
  const router = useRouter();
  const [gerando, setGerando] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startPolling() {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/relatorio-status?id=${relatorioId}`);
        if (!res.ok) return;
        const { status } = await res.json();
        if (status === "concluido" || status === "falhou") {
          stopPolling();
          setGerando(false);
          router.refresh();
        }
      } catch {
        // network hiccup — keep polling
      }
    }, 4000);
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  useEffect(() => {
    if (initiallyGenerating) {
      setGerando(true);
      startPolling();
    }
    return stopPolling;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function regerar() {
    setGerando(true);
    // Fire and forget — don't await, Vercel will run until done
    fetch("/api/ai/gerar-relatorio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ relatorio_id: relatorioId }),
    }).catch(() => {});
    // Start polling for completion
    startPolling();
  }

  return (
    <Button variant="outline" onClick={regerar} disabled={gerando}>
      {gerando ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
      {gerando ? "Gerando..." : "Regerar relatório"}
    </Button>
  );
}
