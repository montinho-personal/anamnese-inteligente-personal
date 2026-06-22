interface GaugeProps {
  label: string;
  valor: number;
  // true when a higher value is BAD (risk metrics)
  inverso?: boolean;
}

export function ScoreGauge({ label, valor, inverso = false }: GaugeProps) {
  const v = Math.max(0, Math.min(100, valor));
  const bom = inverso ? v <= 40 : v >= 60;
  const medio = v > 40 && v < 60;
  const cor = bom ? "text-emerald-400" : medio ? "text-amber-400" : "text-red-400";
  const barra = bom ? "bg-emerald-400" : medio ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={`text-2xl font-bold ${cor}`}>{v}</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div className={`h-full ${barra}`} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}
