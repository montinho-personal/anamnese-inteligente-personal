"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import type { Aluno } from "@/types/database";

export function EditarAlunoForm({ aluno }: { aluno: Aluno }) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sexo, setSexo] = useState<string>(aluno.sexo ?? "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    const form = new FormData(e.currentTarget);
    const raw = Object.fromEntries(form.entries());

    const payload: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(raw)) {
      payload[k] = v === "" ? null : v;
    }
    if (sexo) payload.sexo = sexo;
    else payload.sexo = null;

    try {
      const res = await fetch(`/api/alunos/${aluno.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Erro ao salvar");
      router.push(`/alunos/${aluno.id}`);
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar");
      setCarregando(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Link href={`/alunos/${aluno.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Editar dados de {aluno.nome.split(" ")[0]}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input id="nome" name="nome" required defaultValue={aluno.nome} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" defaultValue={aluno.email ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" name="telefone" defaultValue={aluno.telefone ?? ""} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" name="whatsapp" placeholder="+55 11 90000-0000" defaultValue={aluno.whatsapp ?? ""} />
              </div>
              <div className="space-y-2">
                <Label>Sexo</Label>
                <Select value={sexo} onValueChange={setSexo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Feminino</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="idade">Idade</Label>
                <Input id="idade" name="idade" type="number" defaultValue={aluno.idade ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="altura_cm">Altura (cm)</Label>
                <Input id="altura_cm" name="altura_cm" type="number" defaultValue={aluno.altura_cm ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="peso_kg">Peso (kg)</Label>
                <Input id="peso_kg" name="peso_kg" type="number" step="0.1" defaultValue={aluno.peso_kg ?? ""} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea id="observacoes" name="observacoes" defaultValue={aluno.observacoes ?? ""} />
            </div>

            {erro && <p className="text-sm text-destructive">{erro}</p>}

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={carregando || excluindo}>
                {carregando && <Loader2 className="h-4 w-4 animate-spin" />}
                Salvar alterações
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={carregando || excluindo}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardContent className="pt-6">
          <div className="mt-8 border-t border-destructive/20 pt-6">
            <p className="text-sm font-medium text-destructive mb-3">Zona de perigo</p>
            {!confirmarExclusao ? (
              <Button
                type="button"
                variant="outline"
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
                onClick={() => setConfirmarExclusao(true)}
                disabled={excluindo}
              >
                <Trash2 className="h-4 w-4" /> Excluir aluno
              </Button>
            ) : (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 space-y-3">
                <p className="text-sm text-destructive font-medium">
                  Tem certeza? Essa ação é irreversível. Todos os dados do aluno serão apagados.
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      setExcluindo(true);
                      try {
                        const res = await fetch(`/api/alunos/${aluno.id}`, { method: "DELETE" });
                        if (!res.ok) throw new Error("Erro ao excluir");
                        router.push("/alunos");
                        router.refresh();
                      } catch {
                        setErro("Erro ao excluir aluno.");
                        setExcluindo(false);
                        setConfirmarExclusao(false);
                      }
                    }}
                    disabled={excluindo}
                  >
                    {excluindo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Sim, excluir permanentemente
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setConfirmarExclusao(false)} disabled={excluindo}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
