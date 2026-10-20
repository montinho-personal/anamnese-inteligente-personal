import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatarData(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const DATA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Age in whole years from a "YYYY-MM-DD" birth date, or null when invalid. */
export function calcularIdade(dataNascimento: unknown, hoje: Date = new Date()): number | null {
  if (typeof dataNascimento !== "string") return null;
  const m = DATA_ISO.exec(dataNascimento);
  if (!m) return null;
  const [ano, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  let idade = hoje.getFullYear() - ano;
  const aindaNaoFezAniversario =
    hoje.getMonth() + 1 < mes || (hoje.getMonth() + 1 === mes && hoje.getDate() < dia);
  if (aindaNaoFezAniversario) idade -= 1;
  return idade >= 5 && idade <= 110 ? idade : null;
}

/** "YYYY-MM-DD" → "DD/MM/YYYY" without timezone shifts. */
export function formatarDataNascimento(dataNascimento: string | null): string | null {
  const m = dataNascimento ? DATA_ISO.exec(dataNascimento) : null;
  return m ? `${m[3]}/${m[2]}/${m[1]}` : null;
}

/**
 * Brazilian WhatsApp number → "+55 DD NNNNN-NNNN" (or 8-digit landline style),
 * or null when it can't be a valid number. Accepts any punctuation and an
 * optional leading 55.
 */
export function normalizarWhatsapp(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  let d = valor.replace(/\D/g, "");
  if (d.length === 10 || d.length === 11) d = "55" + d;
  if (!d.startsWith("55") || (d.length !== 12 && d.length !== 13)) return null;
  const ddd = d.slice(2, 4);
  if (ddd.startsWith("0")) return null;
  const num = d.slice(4);
  if (num.length === 9 && !num.startsWith("9")) return null;
  const corte = num.length - 4;
  return `+55 ${ddd} ${num.slice(0, corte)}-${num.slice(corte)}`;
}

export function emailValido(email: unknown): email is string {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function diasDesde(iso: string | null): number {
  if (!iso) return Infinity;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function iniciais(nome: string): string {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
