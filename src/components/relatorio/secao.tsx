import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export function SecaoRelatorio({
  titulo,
  icon: Icon,
  children,
}: {
  titulo: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {Icon && <Icon className="h-4 w-4 text-primary" />}
          {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-relaxed space-y-3">{children}</CardContent>
    </Card>
  );
}

export function ListaItens({ titulo, itens }: { titulo?: string; itens?: string[] }) {
  if (!itens || itens.length === 0) return null;
  return (
    <div>
      {titulo && <p className="font-medium mb-1">{titulo}</p>}
      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
        {itens.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}
