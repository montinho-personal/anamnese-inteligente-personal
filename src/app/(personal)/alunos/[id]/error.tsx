"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AlunoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("AlunoError:", error);
  }, [error]);

  return (
    <div className="space-y-4">
      <Card className="border-destructive">
        <CardContent className="py-8 space-y-3">
          <p className="font-semibold text-destructive">Erro ao carregar página do aluno</p>
          <pre className="text-xs bg-muted rounded p-3 overflow-auto whitespace-pre-wrap break-all">
            {error.message}
            {error.digest ? `\n\nDigest: ${error.digest}` : ""}
            {error.stack ? `\n\n${error.stack}` : ""}
          </pre>
          <Button variant="outline" size="sm" onClick={reset}>
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
