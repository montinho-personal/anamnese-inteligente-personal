"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Lightbulb, Bell, Settings } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/alunos", label: "Alunos", icon: Users },
  { href: "/insights", label: "Insights", icon: Lightbulb },
  { href: "/alertas", label: "Alertas", icon: Bell, badgeKey: "alertas" },
  { href: "/configuracoes", label: "Config", icon: Settings },
];

interface Props {
  alertasPendentes?: number;
}

export function MobileNav({ alertasPendentes = 0 }: Props) {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 flex border-t border-border bg-card">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(link.href + "/");
        const Icon = link.icon;
        const showBadge = link.badgeKey === "alertas" && alertasPendentes > 0;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-[11px] relative",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <span className="relative">
              <Icon className="h-5 w-5" />
              {showBadge && (
                <span className="absolute -top-1 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">
                  {alertasPendentes > 9 ? "9+" : alertasPendentes}
                </span>
              )}
            </span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
