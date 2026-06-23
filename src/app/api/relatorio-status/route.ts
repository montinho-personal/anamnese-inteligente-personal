import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("relatorios")
    .select("status")
    .eq("id", id)
    .single();

  if (!data) return NextResponse.json({ error: "não encontrado" }, { status: 404 });
  return NextResponse.json({ status: data.status });
}
