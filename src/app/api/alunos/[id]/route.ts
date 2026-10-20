import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { calcularIdade } from "@/lib/utils";

// The edit form sends null for fields left blank, so clearable fields accept it.
const updateSchema = z.object({
  nome: z.string().min(1).optional(),
  email: z.string().email().nullable().optional().or(z.literal("")),
  telefone: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  idade: z.coerce.number().int().positive().nullable().optional(),
  data_nascimento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((d) => calcularIdade(d) !== null, "Data de nascimento inválida")
    .nullable()
    .optional(),
  sexo: z.enum(["M", "F", "Outro"]).nullable().optional(),
  altura_cm: z.coerce.number().int().positive().nullable().optional(),
  peso_kg: z.coerce.number().positive().nullable().optional(),
  observacoes: z.string().nullable().optional(),
  status: z.enum(["novo", "ativo", "inativo"]).optional(),
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("alunos")
    .select("*")
    .eq("id", params.id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ aluno: data });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  // Keep age in step with the birth date whenever the date is edited.
  const update = { ...parsed.data };
  if (update.data_nascimento) update.idade = calcularIdade(update.data_nascimento);

  const supabase = createClient();
  const { data, error } = await supabase
    .from("alunos")
    .update(update)
    .eq("id", params.id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ aluno: data });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { error } = await supabase.from("alunos").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
