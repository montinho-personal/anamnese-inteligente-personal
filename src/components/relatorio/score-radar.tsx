"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { ScoresIA } from "@/types/relatorio";

export function ScoreRadar({ scores }: { scores: ScoresIA }) {
  const data = [
    { eixo: "Resultado", valor: scores.potencial_resultado },
    { eixo: "Aderência", valor: scores.potencial_aderencia },
    { eixo: "Risco lesão", valor: scores.risco_lesao },
    { eixo: "Risco abandono", valor: scores.risco_abandono },
  ];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} outerRadius="70%">
        <PolarGrid stroke="hsl(217 33% 25%)" />
        <PolarAngleAxis dataKey="eixo" tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          dataKey="valor"
          stroke="hsl(239 84% 67%)"
          fill="hsl(239 84% 67%)"
          fillOpacity={0.4}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
