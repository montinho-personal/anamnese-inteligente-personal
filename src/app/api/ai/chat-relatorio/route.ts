export const maxDuration = 60;

import { NextResponse } from "next/server";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getPersonal } from "@/lib/data/personal";
import { PERGUNTAS } from "@/lib/anamnese/flow-engine";
import type { Aluno, Anamnese, Relatorio } from "@/types/database";
import type { Respostas } from "@/types/anamnese";

const schema = z.object({
  aluno_id: z.string().uuid(),
  mensagens: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })),
});

const REFERENCIAS = [
  "ACSM", "NSCA", "Brad Schoenfeld", "Eric Helms", "Mike Israetel",
  "Stuart McGill", "Kelly Starrett", "Layne Norton", "Bret Contreras",
  "Fabrício Pacholok", "Leandro Twin",
];

export async function POST(req: Request) {
  const personal = await getPersonal();
  if (!personal) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });

  const supabase = createClient();

  const { data: alunoData } = await supabase.from("alunos").select("*").eq("id", parsed.data.aluno_id).single();
  const aluno = alunoData as Aluno | null;
  if (!aluno) return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });

  const { data: anamneseData } = await supabase
    .from("anamneses").select("*").eq("aluno_id", aluno.id)
    .order("versao", { ascending: false }).limit(1).single();
  const anamnese = anamneseData as Anamnese | null;

  const { data: relData } = await supabase
    .from("relatorios").select("*").eq("aluno_id", aluno.id)
    .order("created_at", { ascending: false }).limit(1).single();
  const relatorio = relData as Relatorio | null;

  // Build context string from anamnese answers
  const respostas = (anamnese?.respostas ?? {}) as Respostas;
  const linhasAnamnese = PERGUNTAS
    .map((p) => {
      const r = respostas[p.id];
      if (r === undefined || r === null || r === "") return null;
      const valor = Array.isArray(r) ? r.join(", ") : String(r);
      return `- ${p.titulo}: ${valor}`;
    })
    .filter(Boolean)
    .join("\n");

  const systemPrompt = `Você é um assistente especialista em prescrição de treinamento físico, atuando como consultor do Personal Trainer para análise de um aluno específico.

Fundamente suas respostas nas seguintes referências científicas e práticas: ${REFERENCIAS.join(", ")}.

DADOS DO ALUNO: ${aluno.nome}
${linhasAnamnese || "Anamnese ainda não preenchida."}

${relatorio?.resumo_executivo ? `RESUMO DO RELATÓRIO IA:\n${relatorio.resumo_executivo}` : ""}
${relatorio?.classificacao ? `CLASSIFICAÇÃO: ${relatorio.classificacao.nivel} — ${relatorio.classificacao.justificativa}` : ""}
${relatorio?.riscos ? `RISCOS: Cardiovascular ${relatorio.riscos.cardiovascular?.nivel}, Ortopédico ${relatorio.riscos.ortopedico?.nivel}, Comportamental ${relatorio.riscos.comportamental?.nivel}` : ""}

Responda de forma técnica, direta e baseada nos dados acima. Se a pergunta não puder ser respondida com os dados disponíveis, diga o que falta. Responda sempre em português do Brasil.`;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY não configurada" }, { status: 500 });

  try {
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: parsed.data.mensagens.map((m) => ({ role: m.role, content: m.content })),
    });

    const texto = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    return NextResponse.json({ resposta: texto });
  } catch (e) {
    console.error("Chat IA erro:", e);
    return NextResponse.json({ error: "Falha ao consultar a IA" }, { status: 500 });
  }
}
