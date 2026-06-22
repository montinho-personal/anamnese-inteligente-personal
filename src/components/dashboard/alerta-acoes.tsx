"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, Eye, Loader2 } from "lucide-react";

export function AlertaAcoes({ id, lido }: { id: string; lido: boolean }) {
  const router = useRouter();
  const [carregando, setCarregando] = useState<string | null>(null);

  async function patch(campo: "lido" | "resolvido") {
    setCarregando(campo);
    await fetch(`/api/alertas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [campo]: true }),
    });
    setCarregando(null);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      {!lido && (
        <Button size="sm" variant="outline" onClick={() => patch("lido")} disabled={!!carregando}>
          {carregando === "lido" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
          Lido
        </Button>
      )}
      <Button size="sm" onClick={() => patch("resolvido")} disabled={!!carregando}>
        {carregando === "resolvido" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
        Resolver
      </Button>
    </div>
  );
}
