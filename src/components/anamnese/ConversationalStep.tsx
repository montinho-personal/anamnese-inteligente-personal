"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { Pergunta, RespostaValor } from "@/types/anamnese";

interface Props {
  pergunta: Pergunta;
  valor: RespostaValor | undefined;
  onChange: (valor: RespostaValor) => void;
  onAvancar: () => void;
}

export function ConversationalStep({ pergunta, valor, onChange, onAvancar }: Props) {
  const [texto, setTexto] = useState<string>(
    typeof valor === "string" || typeof valor === "number" ? String(valor) : "",
  );
  const [multi, setMulti] = useState<string[]>(Array.isArray(valor) ? valor : []);

  useEffect(() => {
    setTexto(typeof valor === "string" || typeof valor === "number" ? String(valor) : "");
    setMulti(Array.isArray(valor) ? valor : []);
  }, [pergunta.id, valor]);

  function commitTexto() {
    onChange(pergunta.tipo === "numero" ? Number(texto) : texto);
    onAvancar();
  }

  function toggleMulti(v: string) {
    const novo = multi.includes(v) ? multi.filter((x) => x !== v) : [...multi, v];
    setMulti(novo);
    onChange(novo);
  }

  function escolhaUnica(v: string) {
    onChange(v);
    onAvancar();
  }

  // Render by type
  switch (pergunta.tipo) {
    case "texto":
    case "numero":
      return (
        <div className="space-y-4">
          <Input
            autoFocus
            type={pergunta.tipo === "numero" ? "number" : "text"}
            value={texto}
            placeholder={pergunta.placeholder}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && texto.trim()) commitTexto();
            }}
            className="h-14 text-lg"
          />
          <Button onClick={commitTexto} disabled={pergunta.obrigatoria && !texto.trim()} className="w-full h-12">
            Continuar
          </Button>
        </div>
      );

    case "textarea":
      return (
        <div className="space-y-4">
          <Textarea
            autoFocus
            value={texto}
            placeholder={pergunta.placeholder}
            onChange={(e) => setTexto(e.target.value)}
            className="min-h-[120px] text-base"
          />
          <Button onClick={commitTexto} disabled={pergunta.obrigatoria && !texto.trim()} className="w-full h-12">
            Continuar
          </Button>
        </div>
      );

    case "sim_nao":
      return (
        <div className="grid grid-cols-2 gap-3">
          {[
            { v: "sim", label: "Sim" },
            { v: "nao", label: "Não" },
          ].map((o) => (
            <button
              key={o.v}
              onClick={() => escolhaUnica(o.v)}
              className={cn(
                "rounded-xl border-2 p-5 text-lg font-medium transition-all",
                valor === o.v ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 hover:border-indigo-300",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      );

    case "escolha_unica":
      return (
        <div className="space-y-2">
          {pergunta.opcoes?.map((o) => (
            <button
              key={o.valor}
              onClick={() => escolhaUnica(o.valor)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition-all",
                valor === o.valor ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 hover:border-indigo-300",
              )}
            >
              <span>{o.label}</span>
              {valor === o.valor && <Check className="h-5 w-5" />}
            </button>
          ))}
        </div>
      );

    case "escolha_multipla":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            {pergunta.opcoes?.map((o) => {
              const sel = multi.includes(o.valor);
              return (
                <button
                  key={o.valor}
                  onClick={() => toggleMulti(o.valor)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition-all",
                    sel ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 hover:border-indigo-300",
                  )}
                >
                  <span>{o.label}</span>
                  {sel && <Check className="h-5 w-5" />}
                </button>
              );
            })}
          </div>
          <Button onClick={onAvancar} disabled={pergunta.obrigatoria && multi.length === 0} className="w-full h-12">
            Continuar
          </Button>
        </div>
      );

    case "escala": {
      const min = pergunta.escalaMin ?? 1;
      const max = pergunta.escalaMax ?? 5;
      const opcoes = Array.from({ length: max - min + 1 }, (_, i) => min + i);
      return (
        <div className="space-y-4">
          <div className="flex justify-between text-xs text-slate-500">
            <span>{pergunta.escalaLabelMin}</span>
            <span>{pergunta.escalaLabelMax}</span>
          </div>
          <div className="flex gap-2">
            {opcoes.map((n) => (
              <button
                key={n}
                onClick={() => escolhaUnica(String(n))}
                className={cn(
                  "flex-1 rounded-xl border-2 py-4 text-lg font-semibold transition-all",
                  Number(valor) === n ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 hover:border-indigo-300",
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
