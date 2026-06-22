import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function ObrigadoPage({ params }: { params: { token: string } }) {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-9 w-9 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold">Anamnese concluída! 🎉</h1>
        <p className="text-slate-500">
          Obrigado por responder. Seu personal já recebeu suas respostas e vai montar
          o treino perfeito para você.
        </p>
        <Link
          href={`/anamnese/${params.token}/checkin`}
          className="inline-block rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-700"
        >
          Fazer meu primeiro check-in
        </Link>
      </div>
    </div>
  );
}
