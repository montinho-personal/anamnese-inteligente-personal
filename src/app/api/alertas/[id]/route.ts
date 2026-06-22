import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  lido: z.boolean().optional(),
  resolvido: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  const supabase = createClient();
  const update: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.resolvido) update.resolved_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("alertas")
    .update(update)
    .eq("id", params.id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ alerta: data });
}
