import type { TipoComunicacao } from "@/types/database";

export interface MensagemWhatsapp {
  para: string;
  texto: string;
  tipo: TipoComunicacao;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/** Pre-built message templates for the automation flows. */
export function templateBoasVindas(nome: string, token: string): string {
  return `Olá ${nome}! 🎉 Seja bem-vindo(a). Para montarmos seu treino ideal, responda sua anamnese inteligente neste link: ${APP_URL}/anamnese/${token}`;
}

export function templateLembreteAnamnese(nome: string, token: string): string {
  return `Oi ${nome}! Notei que você ainda não finalizou sua anamnese. Leva poucos minutos e é essencial para o seu treino: ${APP_URL}/anamnese/${token}`;
}

export function templateCheckin(nome: string, token: string): string {
  return `Bom dia, ${nome}! Hora do check-in semanal. Conta pra mim como foi sua semana: ${APP_URL}/anamnese/${token}/checkin`;
}

export function templateMotivacional(nome: string): string {
  return `${nome}, senti sua falta nos treinos! Bora retomar? Pequenos passos consistentes constroem grandes resultados. 💪`;
}

export function templateReavaliacao(nome: string): string {
  return `${nome}, já se passaram 30 dias! Que tal uma reavaliação para ajustar seu treino e celebrar a evolução?`;
}

/**
 * Sends a WhatsApp message via the configured gateway. If no gateway is
 * configured, logs the message and returns false (graceful no-op for dev).
 */
export async function enviarWhatsapp(msg: MensagemWhatsapp): Promise<boolean> {
  const url = process.env.WHATSAPP_API_URL;
  const key = process.env.WHATSAPP_API_KEY;

  if (!url || !key) {
    console.info("[whatsapp] gateway não configurado, mensagem simulada:", msg);
    return false;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ to: msg.para, message: msg.texto }),
    });
    return res.ok;
  } catch (e) {
    console.error("[whatsapp] falha ao enviar:", e);
    return false;
  }
}
