"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

export function RegerarButton({ relatorioId }: { relatorioId: string }) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);

  async function regerar() {
    setCarregando(true);
    await fetch("/api/ai/gerar-relatorio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ relatorio_id: relatorioId }),
    });
    setCarregando(false);
    router.refresh();
  }

  return (
    <Button variant="outline" onClick={regerar} disabled={carregando}>
      {carregando ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
      Regerar relatório
    </Button>
  );
}
