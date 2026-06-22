"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function ConfigForm({
  nome,
  telefone,
  email,
}: {
  nome: string;
  telefone: string;
  email: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({ nome, telefone });
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setMsg(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("personal_trainers")
        .update({ nome: form.nome, telefone: form.telefone })
        .eq("user_id", user.id);
    }
    setSalvando(false);
    setMsg("Salvo!");
    router.refresh();
  }

  return (
    <form onSubmit={salvar} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" value={email} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone</Label>
        <Input id="telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={salvando}>
          {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar
        </Button>
        {msg && <span className="text-sm text-emerald-400">{msg}</span>}
      </div>
    </form>
  );
}
