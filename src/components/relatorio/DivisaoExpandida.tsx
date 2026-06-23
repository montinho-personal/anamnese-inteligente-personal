"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ListaItens } from "./secao";
import type { DivisaoTreino } from "@/types/relatorio";

export function DivisaoExpandida({ divisao }: { divisao: DivisaoTreino }) {
  const [expandida, setExpandida] = useState(false);
  const temEstrategia = !!divisao.explicacao_escolha;

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-base">{divisao.nome}</p>
          <p className="text-xs text-muted-foreground">{divisao.estrutura}</p>
        </div>
        {temEstrategia && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpandida(!expandida)}
            className="shrink-0 gap-1 text-xs h-8"
          >
            Ver Estratégia Completa
            {expandida ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        )}
      </div>

      {/* Pros / Contras always visible */}
      <div className="grid gap-2 sm:grid-cols-2">
        <ListaItens titulo="Prós" itens={divisao.pros} />
        <ListaItens titulo="Contras" itens={divisao.contras} />
      </div>

      {/* Expanded strategy panel */}
      {expandida && temEstrategia && (
        <div className="border-t border-border pt-4 space-y-5">

          {/* WHY THIS DIVISION */}
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <p className="font-medium text-sm">Por que essa divisão?</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{divisao.explicacao_escolha}</p>
            {divisao.encaixe_rotina && (
              <p className="text-xs text-muted-foreground">🗓 <span className="font-medium text-foreground">Rotina:</span> {divisao.encaixe_rotina}</p>
            )}
            {divisao.encaixe_objetivos && (
              <p className="text-xs text-muted-foreground">🎯 <span className="font-medium text-foreground">Objetivos:</span> {divisao.encaixe_objetivos}</p>
            )}
            {divisao.encaixe_limitacoes && (
              <p className="text-xs text-muted-foreground">⚠️ <span className="font-medium text-foreground">Limitações:</span> {divisao.encaixe_limitacoes}</p>
            )}
            {divisao.encaixe_recuperacao && (
              <p className="text-xs text-muted-foreground">💤 <span className="font-medium text-foreground">Recuperação:</span> {divisao.encaixe_recuperacao}</p>
            )}
          </div>

          {/* EXERCISES PER GROUP */}
          {divisao.exercicios_por_grupo && divisao.exercicios_por_grupo.length > 0 && (
            <div>
              <p className="font-medium text-sm mb-2">Exercícios por grupamento</p>
              <div className="space-y-2">
                {divisao.exercicios_por_grupo.map((g, i) => (
                  <div key={i} className="rounded-lg border border-border/60 p-3 space-y-1.5">
                    <p className="text-xs font-semibold">{g.ordem}. {g.grupo_muscular}</p>
                    {g.principais && g.principais.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Principais:</span> {g.principais.join(", ")}
                      </p>
                    )}
                    {g.secundarios && g.secundarios.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Secundários:</span> {g.secundarios.join(", ")}
                      </p>
                    )}
                    {g.acessorios && g.acessorios.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Acessórios:</span> {g.acessorios.join(", ")}
                      </p>
                    )}
                    {g.justificativa && (
                      <p className="text-xs text-muted-foreground/70 italic">{g.justificativa}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REP RANGES */}
          {divisao.faixas_repeticoes && divisao.faixas_repeticoes.length > 0 && (
            <div>
              <p className="font-medium text-sm mb-2">Faixas de repetições</p>
              <div className="space-y-1.5">
                {divisao.faixas_repeticoes.map((f, i) => (
                  <div key={i} className="flex flex-wrap items-baseline gap-1 text-xs">
                    <span className="font-medium min-w-[140px]">{f.categoria}:</span>
                    <span className="font-semibold text-primary">{f.faixa}</span>
                    {f.justificativa && <span className="text-muted-foreground">— {f.justificativa}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VOLUME */}
          {divisao.volume_detalhado && divisao.volume_detalhado.length > 0 && (
            <div>
              <p className="font-medium text-sm mb-2">Volume semanal individualizado</p>
              <div className="grid gap-1 sm:grid-cols-2">
                {divisao.volume_detalhado.map((v, i) => (
                  <div key={i} className="flex justify-between items-center rounded border border-border/60 px-2.5 py-1.5 text-xs">
                    <span>{v.grupo_muscular}</span>
                    <div className="text-right">
                      <span className="font-semibold text-primary">{v.series_min}–{v.series_max} séries</span>
                      {v.justificativa && <p className="text-muted-foreground/70 text-[10px]">{v.justificativa}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INTENSITY */}
          {divisao.intensidade && (
            <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3 space-y-2">
              <p className="font-medium text-sm">Intensidade recomendada</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">RIR</p>
                  <p className="font-semibold text-sm">{divisao.intensidade.rir}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">RPE</p>
                  <p className="font-semibold text-sm">{divisao.intensidade.rpe}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Falha</p>
                  <p className="font-semibold text-xs leading-tight">{divisao.intensidade.proximidade_falha}</p>
                </div>
              </div>
              {divisao.intensidade.justificativa && (
                <p className="text-xs text-muted-foreground">{divisao.intensidade.justificativa}</p>
              )}
            </div>
          )}

          {/* ADVANCED TECHNIQUES */}
          {divisao.tecnicas_avancadas && divisao.tecnicas_avancadas.length > 0 && (
            <div>
              <p className="font-medium text-sm mb-2">Técnicas avançadas</p>
              <div className="space-y-2">
                {divisao.tecnicas_avancadas.map((t, i) => (
                  <div key={i} className="rounded border border-border/60 p-2 text-xs space-y-0.5">
                    <p className="font-medium">{t.tecnica}</p>
                    {t.quando_usar && <p className="text-muted-foreground">Quando usar: {t.quando_usar}</p>}
                    {t.justificativa && <p className="text-muted-foreground/70 italic">{t.justificativa}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROGRESSION */}
          {divisao.progressao && divisao.progressao.length > 0 && (
            <div>
              <p className="font-medium text-sm mb-2">Estratégia de progressão</p>
              <div className="space-y-2">
                {divisao.progressao.map((p, i) => (
                  <div key={i} className="rounded border border-border/60 p-2.5 text-xs space-y-0.5">
                    <Badge variant="secondary" className="text-[10px] mb-1">{p.tipo}</Badge>
                    <p className="text-muted-foreground">{p.descricao}</p>
                    {p.criterio && (
                      <p className="text-muted-foreground/70 italic">Critério: {p.criterio}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EXECUTIVE SUMMARY */}
          {divisao.resumo_executivo_divisao && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
              <p className="font-medium text-sm mb-1">Por que essa é a divisão ideal agora?</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{divisao.resumo_executivo_divisao}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
