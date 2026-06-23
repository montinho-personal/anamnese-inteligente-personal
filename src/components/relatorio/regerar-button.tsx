"use client";

import { useState, useEffect } from "react";
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

  async function executarGeracao() {
    setGerando(true);
    setErro(null);
    try {
      const res = await fetch("/api/ai/gerar-relatorio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relatorio_id: relatorioId }),
      });

      if (!res.ok || !res.body) {
        const text = await res.text();
        let msg = "Erro ao gerar relatório";
        try { msg = JSON.parse(text).error ?? msg; } catch { /* ignore */ }
        throw new Error(msg);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        if (accumulated.includes("__DONE__") || accumulated.includes("__ERROR__")) break;
      }

      if (accumulated.includes("__ERROR__")) {
        const idx = accumulated.lastIndexOf("__ERROR__");
        throw new Error(accumulated.slice(idx + 9).trim());
      }

      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro desconhecido");
      setGerando(false);
    }
  }

  // Auto-start generation if page loaded with status=gerando (stuck from previous attempt)
  useEffect(() => {
    if (initiallyGenerating) {
      executarGeracao();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-start gap-1">
      <Button variant="outline" onClick={executarGeracao} disabled={gerando}>
        {gerando ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        {gerando ? "Gerando..." : "Regerar relatório"}
      </Button>
      {erro && <p className="text-xs text-destructive max-w-xs">{erro}</p>}
    </div>
  );
}
