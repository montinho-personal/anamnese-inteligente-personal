"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function BaixarPdfButton({ nomeAluno }: { nomeAluno: string }) {
  function baixar() {
    const titulo = document.title;
    document.title = `Relatório — ${nomeAluno}`;
    window.print();
    document.title = titulo;
  }

  return (
    <Button variant="outline" onClick={baixar} className="gap-2 print:hidden">
      <Download className="h-4 w-4" />
      Baixar PDF
    </Button>
  );
}
