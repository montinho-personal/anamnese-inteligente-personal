import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  enviarWhatsapp,
  templateLembreteAnamnese,
  templateCheckin,
  templateMotivacional,
  templateReavaliacao,
} from "@/lib/automations/whatsapp";
import { diasDesde } from "@/lib/utils";
import type { Aluno, Anamnese } from "@/types/database";

/**
 * Scheduled automations endpoint. Configure as a Vercel Cron (e.g. daily) and
 * protect with the CRON_SECRET bearer token. Runs:
 *  - anamnese reminders (48h not completed)
 *  - weekly check-in (Mondays)
 *  - motivational (inactive 7+ days)
 *  - re-evaluation reminder (30 days)
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  }

  const supabase = createServiceClient();
  const { data: alunosData } = await supabase.from("alunos").select("*");
  const alunos = (alunosData as Aluno[]) ?? [];
  const hoje = new Date();
  const segunda = hoje.getDay() === 1;

  let enviados = 0;

  for (const aluno of alunos) {
    if (!aluno.whatsapp) continue;

    const { data: anamneseData } = await supabase
      .from("anamneses")
      .select("status")
      .eq("aluno_id", aluno.id)
      .order("versao", { ascending: false })
      .limit(1)
      .single();
    const anamnese = anamneseData as Pick<Anamnese, "status"> | null;

    const desdeAtividade = diasDesde(aluno.updated_at);
    const desdeCadastro = diasDesde(aluno.created_at);

    // 1. Anamnese reminder (not completed, 2+ days since registration)
    if (anamnese?.status !== "concluida" && desdeCadastro >= 2) {
      await enviarWhatsapp({
        para: aluno.whatsapp,
        texto: templateLembreteAnamnese(aluno.nome, aluno.token_anamnese),
        tipo: "lembrete_anamnese",
      });
      await log(supabase, aluno.id, "lembrete_anamnese");
      enviados++;
      continue;
    }

    // 2. Weekly check-in (Mondays, completed anamnese)
    if (segunda && anamnese?.status === "concluida") {
      await enviarWhatsapp({
        para: aluno.whatsapp,
        texto: templateCheckin(aluno.nome, aluno.token_anamnese),
        tipo: "checkin",
      });
      await log(supabase, aluno.id, "checkin");
      enviados++;
    }

    // 3. Motivational (inactive 7+ days)
    if (desdeAtividade >= 7 && aluno.status !== "inativo") {
      await enviarWhatsapp({
        para: aluno.whatsapp,
        texto: templateMotivacional(aluno.nome),
        tipo: "motivacional",
      });
      await log(supabase, aluno.id, "motivacional");
      enviados++;
    }

    // 4. Re-evaluation reminder (30 days)
    if (desdeCadastro >= 30 && desdeCadastro % 30 < 1) {
      await enviarWhatsapp({
        para: aluno.whatsapp,
        texto: templateReavaliacao(aluno.nome),
        tipo: "reavaliacao",
      });
      await log(supabase, aluno.id, "reavaliacao");
      enviados++;
    }
  }

  return NextResponse.json({ ok: true, enviados });
}

async function log(
  supabase: ReturnType<typeof createServiceClient>,
  alunoId: string,
  tipo: "lembrete_anamnese" | "checkin" | "motivacional" | "reavaliacao",
) {
  await supabase.from("comunicacoes_log").insert({
    aluno_id: alunoId,
    canal: "whatsapp",
    tipo,
    status: "enviado",
  });
}
