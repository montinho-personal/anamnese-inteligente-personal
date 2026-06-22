import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  titulo: string;
  valor: number | string;
  icon: LucideIcon;
  cor?: string;
  descricao?: string;
}

export function StatCard({ titulo, valor, icon: Icon, cor = "text-primary", descricao }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{titulo}</p>
            <p className="mt-1 text-3xl font-bold">{valor}</p>
            {descricao && <p className="mt-1 text-xs text-muted-foreground">{descricao}</p>}
          </div>
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl bg-accent", cor)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
