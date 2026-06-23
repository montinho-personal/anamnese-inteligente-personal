import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPersonal } from "@/lib/data/personal";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";

export default async function PersonalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const personal = await getPersonal();

  const { count } = personal
    ? await supabase
        .from("alertas")
        .select("id", { count: "exact", head: true })
        .eq("personal_id", personal.id)
        .eq("resolvido", false)
        .eq("lido", false)
    : { count: 0 };

  return (
    <div className="dark min-h-screen flex bg-background text-foreground overflow-x-hidden">
      <Sidebar alertasPendentes={count ?? 0} />
      <main className="flex-1 min-w-0 overflow-x-hidden pb-16 md:pb-0">
        <div className="mx-auto max-w-6xl p-4 md:p-8">{children}</div>
      </main>
      <MobileNav alertasPendentes={count ?? 0} />
    </div>
  );
}
