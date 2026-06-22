import { Resend } from "resend";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export interface EmailParams {
  para: string;
  assunto: string;
  html: string;
}

/**
 * Sends a transactional email via Resend. Graceful no-op if not configured.
 */
export async function enviarEmail(params: EmailParams): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info("[email] RESEND_API_KEY não configurada, e-mail simulado:", params.assunto);
    return false;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "Anamnese Inteligente <onboarding@resend.dev>",
      to: params.para,
      subject: params.assunto,
      html: params.html,
    });
    return !error;
  } catch (e) {
    console.error("[email] falha ao enviar:", e);
    return false;
  }
}

export function emailConviteAnamnese(nome: string, token: string): EmailParams["html"] {
  const link = `${APP_URL}/anamnese/${token}`;
  return `
  <div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto">
    <h2>Olá, ${nome}!</h2>
    <p>Para montarmos seu treino ideal, precisamos conhecer você melhor.</p>
    <p>Responda sua anamnese inteligente — leva poucos minutos:</p>
    <p><a href="${link}" style="background:#4f46e5;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">Responder anamnese</a></p>
    <p style="color:#64748b;font-size:13px">Ou copie este link: ${link}</p>
  </div>`;
}
