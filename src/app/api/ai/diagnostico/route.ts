import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: "ANTHROPIC_API_KEY não configurada" }, { status: 500 });

  try {
    const client = new Anthropic({ apiKey, timeout: 15_000 });
    const models = await client.models.list();
    return NextResponse.json({ ok: true, modelos: models.data.map((m) => m.id) });
  } catch (e) {
    return NextResponse.json({ erro: e instanceof Error ? e.message : String(e) });
  }
}
