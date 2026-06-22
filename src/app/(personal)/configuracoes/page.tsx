import { getPersonal } from "@/lib/data/personal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigForm } from "@/components/dashboard/config-form";
import { MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const personal = await getPersonal();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Seu perfil e automações</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <ConfigForm
            nome={personal?.nome ?? ""}
            telefone={personal?.telefone ?? ""}
            email={personal?.email ?? ""}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Automações de WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>O sistema envia automaticamente:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Boas-vindas no cadastro</li>
            <li>Lembrete de anamnese (48h se não concluída)</li>
            <li>Check-in semanal (toda segunda-feira)</li>
            <li>Mensagem motivacional (inativo há 7+ dias)</li>
            <li>Lembrete de reavaliação (30 dias)</li>
          </ul>
          <p className="pt-2">
            Configure as variáveis <code>WHATSAPP_API_URL</code> e <code>WHATSAPP_API_KEY</code> no
            ambiente para ativar o envio real.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
