"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StatusAluno } from "@/types/database";

export function StatusSelector({
  alunoId,
  status,
}: {
  alunoId: string;
  status: StatusAluno;
}) {
  const router = useRouter();
  const [valor, setValor] = useState<StatusAluno>(status);
  const [salvando, setSalvando] = useState(false);

  async function alterar(novo: string) {
    setValor(novo as StatusAluno);
    setSalvando(true);
    await fetch(`/api/alunos/${alunoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novo }),
    });
    setSalvando(false);
    router.refresh();
  }

  return (
    <Select value={valor} onValueChange={alterar} disabled={salvando}>
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="novo">Novo</SelectItem>
        <SelectItem value="ativo">Ativo</SelectItem>
        <SelectItem value="inativo">Inativo</SelectItem>
      </SelectContent>
    </Select>
  );
}
