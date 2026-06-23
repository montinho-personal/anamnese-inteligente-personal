import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SecaoRelatorio, ListaItens } from "@/components/relatorio/secao";
import { ScoreRadar } from "@/components/relatorio/score-radar";
import { ScoreGauge } from "@/components/relatorio/score-gauge";
import { RegerarButton } from "@/components/relatorio/regerar-button";
import { RelatorioChat } from "@/components/relatorio/RelatorioChat";
import { BaixarPdfButton } from "@/components/relatorio/BaixarPdfButton";
import { DivisaoExpandida } from "@/components/relatorio/DivisaoExpandida";
import {
  ArrowLeft, FileText, Award, ShieldAlert, TrendingDown, Brain,
  Map, Dumbbell, Ban, Wind, Flame, LayoutGrid, BarChart3, CalendarRange, Target, HeartHandshake, Trophy, PersonStanding, TrendingUp,
} from "lucide-react";
import type { Aluno, Relatorio } from "@/types/database";

export const dynamic = "force-dynamic";

function crit(nivel: string) {
  return nivel === "alta" ? "destructive" : nivel === "media" ? "warning" : "muted";
}

export default async function RelatorioPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: alunoData } = await supabase.from("alunos").select("*").eq("id", params.id).single();
  const aluno = alunoData as Aluno | null;
  if (!aluno) notFound();

  const { data: relData } = await supabase
    .from("relatorios")
    .select("*")
    .eq("aluno_id", aluno.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const r = relData as Relatorio | null;

  return (
    <div className="space-y-6">
      <Link href={`/alunos/${aluno.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Relatório de {aluno.nome}
          </h1>
          <p className="text-muted-foreground text-sm">Visível apenas para você</p>
        </div>
        <div className="flex gap-2 print:hidden">
          {r && r.status === "concluido" && <BaixarPdfButton nomeAluno={aluno.nome} />}
          {r && <RegerarButton relatorioId={r.id} initiallyGenerating={r.status === "gerando"} />}
        </div>
      </div>

      {!r && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          Nenhum relatório ainda. O relatório é gerado automaticamente quando o aluno conclui a anamnese.
        </CardContent></Card>
      )}

      {r && r.status !== "concluido" && (
        <Card><CardContent className="py-12 text-center">
          <Badge variant={r.status === "gerando" ? "warning" : r.status === "falhou" ? "destructive" : "muted"}>
            {r.status}
          </Badge>
          <p className="mt-3 text-sm text-muted-foreground">
            {r.status === "gerando"
              ? "O relatório está sendo gerado pela IA. Atualize em alguns instantes."
              : r.status === "falhou"
                ? "A geração falhou. Tente regerar."
                : "Aguardando geração."}
          </p>
        </CardContent></Card>
      )}

      {r && r.status === "concluido" && (
        <div className="space-y-6">
          <SecaoRelatorio titulo="Resumo executivo" icon={FileText}>
            <p className="whitespace-pre-line">{r.resumo_executivo}</p>
          </SecaoRelatorio>

          {r.scores && (
            <Card>
              <CardContent className="grid gap-6 p-6 md:grid-cols-2">
                <ScoreRadar scores={r.scores} />
                <div className="grid grid-cols-2 gap-3">
                  <ScoreGauge label="Pot. resultado" valor={r.scores.potencial_resultado} />
                  <ScoreGauge label="Pot. aderência" valor={r.scores.potencial_aderencia} />
                  <ScoreGauge label="Risco lesão" valor={r.scores.risco_lesao} inverso />
                  <ScoreGauge label="Risco abandono" valor={r.scores.risco_abandono} inverso />
                </div>
              </CardContent>
            </Card>
          )}

          {r.classificacao && (
            <SecaoRelatorio titulo="Classificação" icon={Award}>
              <Badge>{r.classificacao.nivel}</Badge>
              <p className="text-muted-foreground">{r.classificacao.justificativa}</p>
            </SecaoRelatorio>
          )}

          {r.riscos && (
            <SecaoRelatorio titulo="Riscos" icon={ShieldAlert}>
              {(["cardiovascular", "ortopedico", "comportamental"] as const).map((k) => {
                const risco = r.riscos![k];
                return (
                  <div key={k} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{k}</span>
                      <Badge variant={crit(risco.nivel)}>{risco.nivel}</Badge>
                    </div>
                    <p className="text-muted-foreground">{risco.descricao}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <ListaItens titulo="Evitar" itens={risco.evitar} />
                      <ListaItens titulo="Fazer" itens={risco.fazer} />
                    </div>
                  </div>
                );
              })}
            </SecaoRelatorio>
          )}

          {r.fatores_abandono && (
            <SecaoRelatorio titulo="Fatores de abandono" icon={TrendingDown}>
              <ListaItens titulo="Riscos identificados" itens={r.fatores_abandono.riscos_identificados} />
              <ListaItens titulo="Estratégias" itens={r.fatores_abandono.estrategias} />
            </SecaoRelatorio>
          )}

          {r.perfil_comportamental && (
            <SecaoRelatorio titulo="Perfil comportamental" icon={Brain}>
              <Badge variant="secondary">{r.perfil_comportamental.perfil}</Badge>
              <p className="text-muted-foreground">{r.perfil_comportamental.justificativa}</p>
            </SecaoRelatorio>
          )}

          {r.mapa_construcao_fisica && (
            <SecaoRelatorio titulo="Mapa de construção física" icon={Map}>
              <div className="grid gap-3 sm:grid-cols-2">
                <ListaItens titulo="Pontos fortes" itens={r.mapa_construcao_fisica.pontos_fortes} />
                <ListaItens titulo="Pontos fracos" itens={r.mapa_construcao_fisica.pontos_fracos} />
                <ListaItens titulo="Gargalos" itens={r.mapa_construcao_fisica.gargalos} />
                <ListaItens titulo="Oportunidades" itens={r.mapa_construcao_fisica.oportunidades} />
              </div>
            </SecaoRelatorio>
          )}

          {r.exercicios_recomendados && (
            <SecaoRelatorio titulo="Exercícios recomendados" icon={Dumbbell}>
              {r.exercicios_recomendados.map((g, i) => (
                <div key={i} className="rounded-lg border border-border p-3">
                  <p className="font-medium">{g.grupo_muscular}</p>
                  <p className="text-muted-foreground">{g.exercicios.join(", ")}</p>
                  <p className="text-xs text-muted-foreground mt-1">{g.justificativa}</p>
                </div>
              ))}
            </SecaoRelatorio>
          )}

          {r.exercicios_evitar && (
            <SecaoRelatorio titulo="Exercícios a evitar" icon={Ban}>
              {r.exercicios_evitar.map((e, i) => (
                <p key={i}><span className="font-medium">{e.exercicio}:</span>{" "}
                  <span className="text-muted-foreground">{e.justificativa}</span></p>
              ))}
            </SecaoRelatorio>
          )}

          {r.protocolo_mobilidade && (
            <SecaoRelatorio titulo="Protocolo de mobilidade" icon={Wind}>
              {r.protocolo_mobilidade.map((p, i) => (
                <p key={i}><span className="font-medium">{p.alvo}</span> — {p.exercicio}{" "}
                  <span className="text-muted-foreground">({p.motivo})</span></p>
              ))}
            </SecaoRelatorio>
          )}

          {r.protocolo_alongamento && (
            <SecaoRelatorio titulo="Protocolo de alongamento" icon={Wind}>
              {r.protocolo_alongamento.map((p, i) => (
                <p key={i}><span className="font-medium">{p.alvo}</span> — {p.exercicio}{" "}
                  <span className="text-muted-foreground">({p.motivo})</span></p>
              ))}
            </SecaoRelatorio>
          )}

          {r.aquecimento && (
            <SecaoRelatorio titulo="Aquecimento ideal" icon={Flame}>
              <p>{r.aquecimento.descricao}</p>
              <ListaItens itens={r.aquecimento.passos} />
            </SecaoRelatorio>
          )}

          {r.divisoes_treino && (
            <SecaoRelatorio titulo="Divisões de treino sugeridas" icon={LayoutGrid}>
              <div className="space-y-3">
                {r.divisoes_treino.map((d, i) => (
                  <DivisaoExpandida key={i} divisao={d} divisaoIndex={i} relatorioId={r.id} />
                ))}
              </div>
            </SecaoRelatorio>
          )}

          {r.volume_semanal && (
            <SecaoRelatorio titulo="Volume semanal sugerido" icon={BarChart3}>
              <div className="grid gap-2 sm:grid-cols-2">
                {r.volume_semanal.map((v, i) => (
                  <div key={i} className="flex justify-between rounded-lg border border-border px-3 py-2">
                    <span>{v.grupo_muscular}</span>
                    <span className="font-medium">{v.series_semanais}</span>
                  </div>
                ))}
              </div>
            </SecaoRelatorio>
          )}

          {r.periodizacao && (
            <SecaoRelatorio titulo="Periodização inicial" icon={CalendarRange}>
              {r.periodizacao.map((p, i) => (
                <div key={i} className="rounded-lg border border-border p-3">
                  <p className="font-medium">{p.duracao}</p>
                  <p>{p.estrategia}</p>
                  <p className="text-xs text-muted-foreground mt-1">{p.racional}</p>
                </div>
              ))}
            </SecaoRelatorio>
          )}

          {r.plano_retencao && (
            <SecaoRelatorio titulo="Plano de retenção" icon={HeartHandshake}>
              <ListaItens titulo="Estratégias" itens={r.plano_retencao.estrategias} />
              <ListaItens titulo="Tarefas" itens={r.plano_retencao.tarefas} />
            </SecaoRelatorio>
          )}

          {r.evolucao_aluno && (
            <SecaoRelatorio titulo="Evolução do Aluno" icon={TrendingUp}>
              <p className="text-xs text-muted-foreground">Comparação com a anamnese anterior, gerada automaticamente pela IA.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <ListaItens titulo="Melhorou" itens={r.evolucao_aluno.melhorou} />
                <ListaItens titulo="Piorou" itens={r.evolucao_aluno.piorou} />
                <ListaItens titulo="Permaneceu igual" itens={r.evolucao_aluno.permaneceu} />
                <ListaItens titulo="Novos riscos identificados" itens={r.evolucao_aluno.novos_riscos} />
              </div>
              <ListaItens titulo="Novas oportunidades" itens={r.evolucao_aluno.novas_oportunidades} />
            </SecaoRelatorio>
          )}

          {r.analise_postural && (
            <SecaoRelatorio titulo="Análise Postural" icon={PersonStanding}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Desvios relatados:</span>
                <div className="flex flex-wrap gap-1">
                  {r.analise_postural.desvios_relatados.map((d, i) => (
                    <Badge key={i} variant="secondary">{d}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Nível de confiança:</span>
                <Badge variant={
                  r.analise_postural.nivel_confianca === "Confirmado por profissional" ? "default" :
                  r.analise_postural.nivel_confianca === "Provável" ? "warning" : "muted"
                }>{r.analise_postural.nivel_confianca}</Badge>
              </div>
              <ListaItens titulo="Possíveis impactos no treinamento" itens={r.analise_postural.impactos_treino} />
              <ListaItens titulo="Cuidados recomendados" itens={r.analise_postural.cuidados_recomendados} />
              <ListaItens titulo="Exercícios que merecem atenção" itens={r.analise_postural.exercicios_atencao} />
              <ListaItens titulo="Exercícios corretivos sugeridos" itens={r.analise_postural.exercicios_corretivos} />
              <ListaItens titulo="Mobilidade sugerida" itens={r.analise_postural.mobilidade_sugerida} />
              <ListaItens titulo="Fortalecimento sugerido" itens={r.analise_postural.fortalecimento_sugerido} />
            </SecaoRelatorio>
          )}

          {r.performance_esportiva && (
            <SecaoRelatorio titulo={`Performance Esportiva — ${r.performance_esportiva.esporte}`} icon={Trophy}>
              <ListaItens titulo="Demandas físicas do esporte" itens={r.performance_esportiva.demandas_fisicas} />
              <ListaItens titulo="Riscos específicos" itens={r.performance_esportiva.riscos_especificos} />
              <ListaItens titulo="Capacidades prioritárias" itens={r.performance_esportiva.capacidades_prioritarias} />
              <ListaItens titulo="Grupos musculares-chave" itens={r.performance_esportiva.grupos_musculares_chave} />
              <ListaItens titulo="Limitações identificadas" itens={r.performance_esportiva.limitacoes_identificadas} />
              <ListaItens titulo="Treino complementar" itens={r.performance_esportiva.treino_complementar} />
              <ListaItens titulo="Mobilidade específica" itens={r.performance_esportiva.mobilidade_especifica} />
              <ListaItens titulo="Exercícios preventivos" itens={r.performance_esportiva.preventivo} />
            </SecaoRelatorio>
          )}

          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <Target className="h-3 w-3" />
            {r.tokens_ia_usados ? `${r.tokens_ia_usados} tokens · ` : ""}
            Gerado por IA · {r.gerado_em ? new Date(r.gerado_em).toLocaleDateString("pt-BR") : ""}
          </p>

          <div className="print:hidden">
            <RelatorioChat alunoId={aluno.id} nomeAluno={aluno.nome.split(" ")[0]} />
          </div>
        </div>
      )}
    </div>
  );
}
