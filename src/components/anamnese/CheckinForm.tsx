"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Dumbbell, Loader2, CheckCircle2 } from "lucide-react";

function Escala({
  label,
  valor,
  onChange,
}: {
  label: string;
  valor: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              "flex-1 rounded-lg border-2 py-3 font-semibold transition-all",
              valor === n ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 hover:border-indigo-300",
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CheckinForm({ token, nomeAluno }: { token: string; nomeAluno: string }) {
  const [energia, setEnergia] = useState(3);
  const [sono, setSono] = useState(3);
  const [humor, setHumor] = useState(3);
  const [realizados, setRealizados] = useState("");
  const [esperados, setEsperados] = useState("");
  const [dores, setDores] = useState("");
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          energia,
          sono,
          humor_geral: humor,
          treinos_realizados: Number(realizados || 0),
          treinos_esperados: Number(esperados || 0),
          dores_relatadas: dores,
          comentario_livre: comentario,
        }),
      });
      if (!res.ok) throw new Error("Falha ao enviar check-in");
      setEnviado(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-9 w-9 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Check-in enviado! 💪</h1>
          <p className="text-slate-500">Obrigado, {nomeAluno}. Continue firme!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-100">
        <div className="mx-auto max-w-xl px-4 py-3 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Dumbbell className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold">Check-in semanal</span>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-xl px-4 py-8"
      >
        <h1 className="text-2xl font-bold mb-1">Olá, {nomeAluno}! Como foi sua semana?</h1>
        <p className="text-slate-500 mb-6">Leva menos de um minuto.</p>

        <form onSubmit={enviar} className="space-y-6">
          <Escala label="Nível de energia" valor={energia} onChange={setEnergia} />
          <Escala label="Qualidade do sono" valor={sono} onChange={setSono} />
          <Escala label="Humor geral" valor={humor} onChange={setHumor} />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="realizados">Treinos realizados</Label>
              <Input id="realizados" type="number" min={0} value={realizados} onChange={(e) => setRealizados(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="esperados">Treinos esperados</Label>
              <Input id="esperados" type="number" min={0} value={esperados} onChange={(e) => setEsperados(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dores">Sentiu alguma dor? (opcional)</Label>
            <Textarea id="dores" value={dores} onChange={(e) => setDores(e.target.value)} placeholder="Descreva se sentiu dores" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comentario">Comentário livre (opcional)</Label>
            <Textarea id="comentario" value={comentario} onChange={(e) => setComentario(e.target.value)} />
          </div>

          {erro && <p className="text-sm text-red-600">{erro}</p>}

          <Button type="submit" disabled={enviando} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700">
            {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
            Enviar check-in
          </Button>
        </form>
      </motion.main>
    </div>
  );
}
