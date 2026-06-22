import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getPersonal } from "@/lib/data/personal";
import { enviarEmail, emailConviteAnamnese } from "@/lib/automations/email";
import {
  enviarWhatsapp,
  templateBoasVindas,
} from "@/lib/automations/whatsapp";

const alunoSchema = z.object({
  nome: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  idade: z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number().int().positive().optional()),
  sexo: z.enum(["M", "F", "Outro"]).optional().or(z.literal("")),
  altura_cm: z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number().int().positive().optional()),
  peso_kg: z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number().positive().optional()),
  observacoes: z.string().optional(),
});

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("alunos")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ alunos: data });
}

export async function POST(req: Request) {
  const personal = await getPersonal();
  if (!personal) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const parsed = alunoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("alunos")
    .insert({
      ...parsed.data,
      email: parsed.data.email || null,
      sexo: parsed.data.sexo || null,
      personal_id: personal.id,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Create the pending anamnese for the student.
  await supabase.from("anamneses").insert({ aluno_id: data.id, status: "pendente" });

  // Fire welcome automations (graceful no-op if gateways unconfigured).
  if (data.whatsapp) {
    await enviarWhatsapp({
      para: data.whatsapp,
      texto: templateBoasVindas(data.nome, data.token_anamnese),
      tipo: "boas_vindas",
    });
  }
  if (data.email) {
    await enviarEmail({
      para: data.email,
      assunto: "Sua anamnese inteligente",
      html: emailConviteAnamnese(data.nome, data.token_anamnese),
    });
  }
  await supabase.from("comunicacoes_log").insert({
    aluno_id: data.id,
    canal: data.whatsapp ? "whatsapp" : "email",
    tipo: "boas_vindas",
    status: "enviado",
  });

  return NextResponse.json({ aluno: data }, { status: 201 });
}
