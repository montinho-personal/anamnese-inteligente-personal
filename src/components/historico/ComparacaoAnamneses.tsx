"use client";

import { cn } from "@/lib/utils";
import type { Anamnese } from "@/types/database";
import type { Pergunta } from "@/types/anamnese";

interface Props {
  atual: Anamnese;
  anterior: Anamnese;
  perguntas: Pergunta[];
}

// Fields that matter for comparison (ordered by relevance)
const CAMPOS_COMPARACAO = [
  "peso",
  "objetivos",
  "dias_disponiveis",
  "tempo_sessao",
  "orto_regioes",
  "cardio_itens",
  "sono_horas",
  "sono_qualidade",
  "estresse",
  "fadiga",
  "energia",
  "proteina",
  "motivacao_principal",
  "principais_dificuldades",
  "local_treino",
];

function formatarValor(v: unknown): string {
  if (v === undefined || v === null || v === "") return "—";
  if (Array.isArray(v)) return v.length === 0 ? "—" : v.join(", ");
  return String(v);
}

function detectarMudanca(anterior: unknown, atual: unknown): "melhor" | "pior" | "mudou" | "igual" {
  const a = formatarValor(anterior);
  const b = formatarValor(atual);
  if (a === b) return "igual";

  // Fields where higher number = better
  const maisMelhor = ["sono_qualidade", "energia"];
  // Fields where lower number = better
  const menorMelhor = ["estresse", "fadiga"];

  const numA = Number(anterior);
  const numB = Number(atual);
  if (!isNaN(numA) && !isNaN(numB)) {
    if (maisMelhor.some((c) => [a, b].includes(c))) return numB > numA ? "melhor" : "pior";
    if (menorMelhor.some((c) => [a, b].includes(c))) return numB < numA ? "melhor" : "pior";
  }

  return "mudou";
}

export function ComparacaoAnamneses({ atual, anterior, perguntas }: Props) {
  const respostasAtual = atual.respostas as Record<string, unknown>;
  const respostasAnterior = anterior.respostas as Record<string, unknown>;

  const linhas = CAMPOS_COMPARACAO.map((id) => {
    const pergunta = perguntas.find((p) => p.id === id);
    if (!pergunta) return null;

    const valAtual = respostasAtual[id];
    const valAnterior = respostasAnterior[id];
    const mudanca = detectarMudanca(valAnterior, valAtual);

    return { id, titulo: pergunta.titulo, anterior: valAnterior, atual: valAtual, mudanca };
  }).filter(Boolean) as {
    id: string;
    titulo: string;
    anterior: unknown;
    atual: unknown;
    mudanca: "melhor" | "pior" | "mudou" | "igual";
  }[];

  const comMudanca = linhas.filter((l) => l.mudanca !== "igual");
  const semMudanca = linhas.filter((l) => l.mudanca === "igual");

  return (
    <div className="space-y-4">
      {comMudanca.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhuma diferença detectada nos campos comparados.
        </p>
      )}

      {comMudanca.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            {comMudanca.length} campo(s) com mudança
          </p>
          <div className="space-y-2">
            {comMudanca.map((l) => (
              <div key={l.id} className={cn(
                "rounded-lg border p-3 text-sm",
                l.mudanca === "melhor" && "border-green-200 bg-green-50",
                l.mudanca === "pior" && "border-red-200 bg-red-50",
                l.mudanca === "mudou" && "border-amber-200 bg-amber-50",
              )}>
                <p className="font-medium text-xs mb-2">{l.titulo}</p>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Anterior</p>
                    <p className="text-muted-foreground line-through">{formatarValor(l.anterior)}</p>
                  </div>
                  <span className="text-muted-foreground">→</span>
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Atual</p>
                    <p className={cn(
                      "font-medium",
                      l.mudanca === "melhor" && "text-green-700",
                      l.mudanca === "pior" && "text-red-700",
                      l.mudanca === "mudou" && "text-amber-700",
                    )}>{formatarValor(l.atual)}</p>
                  </div>
                  <span className="text-lg" title={l.mudanca}>
                    {l.mudanca === "melhor" ? "✅" : l.mudanca === "pior" ? "⚠️" : "🔄"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {semMudanca.length > 0 && (
        <details className="group">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors list-none flex items-center gap-1">
            <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
            {semMudanca.length} campo(s) sem alteração
          </summary>
          <div className="mt-2 space-y-1">
            {semMudanca.map((l) => (
              <div key={l.id} className="rounded border border-border/50 px-3 py-2 text-xs flex justify-between gap-4">
                <span className="text-muted-foreground">{l.titulo}</span>
                <span className="font-medium text-right">{formatarValor(l.atual)}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
