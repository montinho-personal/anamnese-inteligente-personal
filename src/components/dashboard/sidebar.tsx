"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Lightbulb,
  Bell,
  Settings,
  Dumbbell,
  LogOut,
} from "lucide-react";
import { logout } from "@/app/(personal)/actions";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/alunos", label: "Alunos", icon: Users },
  { href: "/insights", label: "Insights", icon: Lightbulb },
  { href: "/alertas", label: "Alertas", icon: Bell, badgeKey: "alertas" },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

interface Props {
  alertasPendentes?: number;
}

export function Sidebar({ alertasPendentes = 0 }: Props) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Dumbbell className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-bold">Anamnese IA</span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(link.href + "/");
          const Icon = link.icon;
          const showBadge = link.badgeKey === "alertas" && alertasPendentes > 0;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{link.label}</span>
              {showBadge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-semibold text-destructive-foreground">
                  {alertasPendentes > 99 ? "99+" : alertasPendentes}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <form action={logout} className="p-3 border-t border-border">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </form>
    </aside>
  );
}
