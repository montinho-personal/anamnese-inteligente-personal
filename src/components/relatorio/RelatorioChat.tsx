"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Send, Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Mensagem {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  alunoId: string;
  nomeAluno: string;
}

const SUGESTOES = [
  "Quais exercícios posso adicionar para acelerar o resultado deste aluno?",
  "Considerando as limitações dele, o agachamento livre é seguro?",
  "Qual seria uma boa progressão de carga para as primeiras 4 semanas?",
  "Como trabalhar a motivação dele para evitar abandono?",
];

export function RelatorioChat({ alunoId, nomeAluno }: Props) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [input, setInput] = useState("");
  const [carregando, setCarregando] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, carregando]);

  async function enviar(texto?: string) {
    const conteudo = texto ?? input.trim();
    if (!conteudo || carregando) return;
    setInput("");

    const novas: Mensagem[] = [...mensagens, { role: "user", content: conteudo }];
    setMensagens(novas);
    setCarregando(true);

    try {
      const res = await fetch("/api/ai/chat-relatorio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aluno_id: alunoId, mensagens: novas }),
      });
      const json = await res.json();
      if (json.resposta) {
        setMensagens([...novas, { role: "assistant", content: json.resposta }]);
      } else {
        setMensagens([...novas, { role: "assistant", content: json.error ?? "Erro ao obter resposta. Tente novamente." }]);
      }
    } catch {
      setMensagens([...novas, { role: "assistant", content: "Erro ao obter resposta. Tente novamente." }]);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bot className="h-5 w-5 text-primary" />
          Consultor IA — {nomeAluno}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Tire dúvidas sobre este aluno com base na anamnese e no relatório gerado.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {mensagens.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Sugestões de perguntas</p>
            <div className="flex flex-wrap gap-2">
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  onClick={() => enviar(s)}
                  className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {mensagens.length > 0 && (
          <div className="max-h-[400px] overflow-y-auto space-y-3 pr-1">
            {mensagens.map((m, i) => (
              <div key={i} className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}>
                {m.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm max-w-[85%] leading-relaxed whitespace-pre-wrap",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted text-foreground rounded-tl-sm",
                )}>
                  {m.content}
                </div>
                {m.role === "user" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {carregando && (
              <div className="flex gap-2 justify-start">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre este aluno..."
            className="min-h-[44px] max-h-[120px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                enviar();
              }
            }}
          />
          <Button size="icon" onClick={() => enviar()} disabled={!input.trim() || carregando} className="shrink-0 h-11 w-11">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">Enter para enviar · Shift+Enter para nova linha</p>
      </CardContent>
    </Card>
  );
}
