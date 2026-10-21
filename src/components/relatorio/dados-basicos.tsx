import { IdCard } from "lucide-react";
import { SecaoRelatorio } from "./secao";
import { rotuloResposta } from "@/lib/anamnese/flow-engine";
import type { Respostas } from "@/types/anamnese";

// Straight from the anamnese answers (not the AI), so these facts always show
// up exactly as the student gave them.
export function DadosBasicos({ respostas }: { respostas: Respostas }) {
  const r = (id: string) => rotuloResposta(id, respostas[id]);

  const idade = respostas["idade"] ? `${respostas["idade"]} anos` : null;
  const corpo = [
    respostas["peso"] ? `${respostas["peso"]} kg` : null,
    respostas["altura"] ? `${respostas["altura"]} cm` : null,
  ].filter(Boolean).join(" · ") || null;

  const situacao =
    respostas["tempo_treino"] === "nunca"
      ? "Nunca treinou musculação"
      : respostas["treina_atualmente"] === "parado"
        ? `${respostas["sexo"] === "F" ? "Parada" : respostas["sexo"] === "M" ? "Parado" : "Parado(a)"}${
            r("tempo_parado") ? ` há ${r("tempo_parado")!.toLowerCase()}` : ""
          }`
        : respostas["treina_atualmente"] === "treinando"
          ? "Treinando atualmente"
          : null;

  const frequencia = [
    respostas["dias_disponiveis"] ? `${respostas["dias_disponiveis"]}x por semana` : null,
    r("tempo_sessao"),
  ].filter(Boolean).join(" · ") || null;

  const itens: [string, string | null][] = [
    ["Idade", idade],
    ["Sexo", r("sexo")],
    ["Peso e altura", corpo],
    ["Objetivos", r("objetivos")],
    ["Experiência", respostas["tempo_treino"] === "nunca" ? null : r("tempo_treino")],
    ["Situação atual", situacao],
    ["Local de treino", r("local_treino")],
    ["Equipamentos em casa", respostas["local_treino"] === "casa" ? r("equipamentos_casa") : null],
    ["Frequência", frequencia],
  ];
  const visiveis = itens.filter(([, v]) => v);
  if (visiveis.length === 0) return null;

  return (
    <SecaoRelatorio titulo="Dados básicos" icon={IdCard}>
      <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {visiveis.map(([rotulo, valor]) => (
          <div key={rotulo} className="flex justify-between gap-3 border-b border-border/40 py-1.5 sm:block sm:border-0 sm:py-0">
            <dt className="text-muted-foreground shrink-0">{rotulo}</dt>
            <dd className="font-medium text-right sm:text-left min-w-0 break-words">{valor}</dd>
          </div>
        ))}
      </dl>
    </SecaoRelatorio>
  );
}
