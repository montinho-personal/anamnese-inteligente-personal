import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle, TrendingUp, Heart, Zap, Target, MessageCircle,
  CheckCircle2, ChevronRight, Brain, Clock, Activity,
} from "lucide-react";
import { gerarInsights, calcularScoreEvolucao } from "@/lib/insights/engine";
import type { Aluno, Anamnese, Checkin } from "@/types/database";
import type { ScoresIA, ProtocoloIA, RiscosIA } from "@/types/relatorio";
import type { InsightCategoria, InsightUrgencia, Insight } from "@/lib/insights/engine";

const CATEGORIA_CONFIG: Record<InsightCategoria, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  temporal: { label: "Temporal", icon: Clock },
  dor: { label: "Dor / Lesão", icon: Heart },
  mobilidade: { label: "Mobilidade", icon: Activity },
  progressao: { label: "Progressão", icon: TrendingUp },
  comportamento: { label: "Comportamento", icon: Brain },
  oportunidade: { label: "Oportunidade", icon: Zap },
};

const URGENCIA_CONFIG: Record<InsightUrgencia, { label: string; className: string; badgeVariant: string }> = {
  alta: { label: "Urgente", className: "border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20", badgeVariant: "destructive" },
  media: { label: "Atenção", className: "border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20", badgeVariant: "warning" },
  baixa: { label: "Informativo", className: "border-l-4 border-l-blue-400 bg-blue-50/50 dark:bg-blue-950/20", badgeVariant: "secondary" },
  positivo: { label: "Oportunidade", className: "border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20", badgeVariant: "success" },
};

function scoreColor(score: number) {
  if (score >= 75) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function scoreBarColor(score: number) {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-red-500";
}

function tendenciaIcon(tendencia: string) {
  if (tendencia === "subindo") return "↑";
  if (tendencia === "caindo") return "↓";
  if (tendencia === "estavel") return "→";
  return "—";
}

function InsightCard({ insight }: { insight: Insight }) {
  const cfg = URGENCIA_CONFIG[insight.urgencia];
  const catCfg = CATEGORIA_CONFIG[insight.categoria];
  const Icon = catCfg.icon;

  return (
    <div className={`rounded-lg p-4 space-y-3 ${cfg.className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="font-medium text-sm leading-tight">{insight.titulo}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{insight.descricao}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge variant={cfg.badgeVariant as "destructive" | "warning" | "secondary" | "success"} className="text-xs whitespace-nowrap">
            {cfg.label}
          </Badge>
          <span className="text-xs text-muted-foreground">{catCfg.label}</span>
        </div>
      </div>

      {insight.perguntas_sugeridas && insight.perguntas_sugeridas.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <MessageCircle className="h-3 w-3" /> Perguntas sugeridas
          </p>
          <ul className="space-y-0.5">
            {insight.perguntas_sugeridas.map((p, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/80">
                <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {insight.acoes_sugeridas && insight.acoes_sugeridas.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Target className="h-3 w-3" /> Ações recomendadas
          </p>
          <ul className="space-y-0.5">
            {insight.acoes_sugeridas.map((a, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/80">
                <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {insight.mensagem_sugerida && (
        <div className="rounded-md bg-background/70 border border-border/50 px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground mb-0.5 flex items-center gap-1">
            <MessageCircle className="h-3 w-3" /> Mensagem sugerida para o aluno
          </p>
          <p className="text-xs italic text-foreground/80">&ldquo;{insight.mensagem_sugerida}&rdquo;</p>
        </div>
      )}
    </div>
  );
}

interface Props {
  alunoId: string;
  aluno: Aluno;
}

export async function InsightsSection({ alunoId, aluno }: Props) {
  const supabase = createClient();

  const [anamneseRes, checkinsRes, relatorioRes] = await Promise.all([
    supabase
      .from("anamneses")
      .select("id, aluno_id, versao, status, respostas, progresso_percentual, iniciada_em, concluida_em, created_at")
      .eq("aluno_id", alunoId)
      .order("versao", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("checkins")
      .select("*")
      .eq("aluno_id", alunoId)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("relatorios")
      .select("scores, riscos, protocolo_mobilidade")
      .eq("aluno_id", alunoId)
      .eq("status", "concluido")
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
  ]);

  const anamnese = anamneseRes.data as Anamnese | null;
  const checkins = (checkinsRes.data ?? []) as Checkin[];
  const rel = relatorioRes.data;

  const insights = gerarInsights({
    aluno,
    anamnese,
    checkins,
    relatorioScores: (rel?.scores ?? null) as ScoresIA | null,
    relatorioProtocoloMobilidade: (rel?.protocolo_mobilidade ?? null) as ProtocoloIA | null,
    relatorioRiscos: (rel?.riscos ?? null) as RiscosIA | null,
  });

  const score = calcularScoreEvolucao(checkins, (rel?.scores ?? null) as ScoresIA | null);

  const urgentes = insights.filter((i) => i.urgencia === "alta");
  const medios = insights.filter((i) => i.urgencia === "media");
  const informativos = insights.filter((i) => i.urgencia === "baixa");
  const oportunidades = insights.filter((i) => i.urgencia === "positivo");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Insights e Ações Recomendadas</h2>
        {urgentes.length > 0 && (
          <Badge variant="destructive" className="text-xs">{urgentes.length} urgente{urgentes.length > 1 ? "s" : ""}</Badge>
        )}
      </div>

      {/* Score de Evolução */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Score de Evolução</span>
            <span className={`text-2xl font-bold ${scoreColor(score.total)}`}>
              {score.total}/100 <span className="text-sm font-normal">{tendenciaIcon(score.tendencia)}</span>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${scoreBarColor(score.total)}`}
              style={{ width: `${score.total}%` }}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <ScoreItem label="Frequência" value={score.frequencia} max={25} />
            <ScoreItem label="Bem-estar" value={score.bem_estar} max={45} />
            <ScoreItem label="Dores" value={score.dores} max={20} />
            <ScoreItem label="Engajamento" value={score.engajamento} max={10} />
          </div>
          {score.tendencia === "sem_dados" && (
            <p className="text-xs text-muted-foreground text-center">Score calculado a partir do relatório IA. Baseará em check-ins assim que disponíveis.</p>
          )}
          {score.tendencia === "caindo" && (
            <p className="text-xs text-amber-600 text-center font-medium">Tendência de queda nos últimos check-ins. Atenção recomendada.</p>
          )}
          {score.tendencia === "subindo" && (
            <p className="text-xs text-emerald-600 text-center font-medium">Tendência de melhora nos últimos check-ins.</p>
          )}
        </CardContent>
      </Card>

      {insights.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            Nenhum insight disponível ainda. Complete a anamnese e registre alguns check-ins para ativar o monitoramento.
          </CardContent>
        </Card>
      )}

      {urgentes.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-red-600 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" /> Ação imediata necessária
          </p>
          {urgentes.map((insight) => <InsightCard key={insight.id} insight={insight} />)}
        </div>
      )}

      {medios.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-amber-600 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" /> Atenção
          </p>
          {medios.map((insight) => <InsightCard key={insight.id} insight={insight} />)}
        </div>
      )}

      {informativos.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-blue-600 flex items-center gap-1.5">
            <Brain className="h-4 w-4" /> Informativos
          </p>
          {informativos.map((insight) => <InsightCard key={insight.id} insight={insight} />)}
        </div>
      )}

      {oportunidades.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5">
            <Zap className="h-4 w-4" /> Oportunidades de engajamento
          </p>
          {oportunidades.map((insight) => <InsightCard key={insight.id} insight={insight} />)}
        </div>
      )}
    </div>
  );
}

function ScoreItem({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold ${scoreColor(pct)}`}>{value}<span className="text-xs font-normal text-muted-foreground">/{max}</span></p>
      <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
        <div className={`h-full rounded-full ${scoreBarColor(pct)}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
