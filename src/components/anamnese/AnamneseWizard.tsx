"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ConversationalStep } from "./ConversationalStep";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2, Dumbbell } from "lucide-react";
import {
  perguntasVisiveis,
  calcularProgresso,
  anamneseCompleta,
  SECOES,
} from "@/lib/anamnese/flow-engine";
import {
  IlustracaoAgachamento,
  IlustracaoDorsiflexao,
  IlustracaoPosterior,
  IlustracaoToracica,
  IlustracaoOmbro,
  IlustracaoQuadril,
} from "./MobilidadeIlustracao";
import type { Respostas, RespostaValor } from "@/types/anamnese";

interface Props {
  token: string;
  nomeAluno: string;
  respostasIniciais: Respostas;
}

const RESUME_TTL_MS = 60_000; // 1 minuto

function storageKey(token: string) {
  return `anamnese_pos_${token}`;
}

function lerPosicaoSalva(token: string): number {
  try {
    const raw = localStorage.getItem(storageKey(token));
    if (!raw) return 0;
    const { indice, ts } = JSON.parse(raw) as { indice: number; ts: number };
    if (Date.now() - ts < RESUME_TTL_MS) return indice;
  } catch { /* ignore */ }
  return 0;
}

function salvarPosicao(token: string, indice: number) {
  try {
    localStorage.setItem(storageKey(token), JSON.stringify({ indice, ts: Date.now() }));
  } catch { /* ignore */ }
}

function limparPosicao(token: string) {
  try { localStorage.removeItem(storageKey(token)); } catch { /* ignore */ }
}

export function AnamneseWizard({ token, nomeAluno, respostasIniciais }: Props) {
  const router = useRouter();
  const [respostas, setRespostas] = useState<Respostas>(respostasIniciais);
  const [indice, setIndice] = useState<number>(0);
  const [salvando, setSalvando] = useState(false);
  const [direcao, setDirecao] = useState(1);
  const salvarTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On mount: check localStorage — resume only if within 1 minute
  useEffect(() => {
    const pos = lerPosicaoSalva(token);
    if (pos > 0) {
      setIndice(pos);
    } else {
      // Fresh start — clear answers so user fills from scratch
      setRespostas({});
    }
  }, [token]);

  // Persist position whenever it changes
  useEffect(() => {
    salvarPosicao(token, indice);
  }, [token, indice]);

  const visiveis = perguntasVisiveis(respostas);
  const pergunta = visiveis[Math.min(indice, visiveis.length - 1)];
  const progresso = calcularProgresso(respostas);
  const secao = SECOES.find((s) => s.id === pergunta?.secao);

  const autosave = useCallback(
    (novas: Respostas) => {
      if (salvarTimer.current) clearTimeout(salvarTimer.current);
      salvarTimer.current = setTimeout(() => {
        fetch(`/api/anamnese/${token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ respostas: novas }),
        }).catch(() => {});
      }, 600);
    },
    [token],
  );

  function handleChange(valor: RespostaValor) {
    setRespostas((prev) => {
      const novas = { ...prev, [pergunta.id]: valor };
      autosave(novas);
      return novas;
    });
  }

  function avancar() {
    const atualizadas = perguntasVisiveis(respostas);
    if (indice >= atualizadas.length - 1) {
      finalizar();
      return;
    }
    setDirecao(1);
    setIndice((i) => i + 1);
  }

  function voltar() {
    if (indice === 0) return;
    setDirecao(-1);
    setIndice((i) => i - 1);
  }

  async function finalizar() {
    setSalvando(true);
    try {
      const res = await fetch(`/api/anamnese/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respostas, finalizar: true }),
      });
      const json = await res.json();
      if (json.concluida) {
        limparPosicao(token);
        router.push(`/anamnese/${token}/obrigado`);
        return;
      }
      // Not complete yet — jump to first unanswered required question.
      const v = perguntasVisiveis(respostas);
      const idx = v.findIndex((p) => p.obrigatoria && respostas[p.id] === undefined);
      if (idx !== -1) setIndice(idx);
    } finally {
      setSalvando(false);
    }
  }

  if (!pergunta) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  const ultima = indice >= visiveis.length - 1;
  const completa = anamneseCompleta(respostas);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-100">
        <div className="mx-auto max-w-xl px-4 py-3 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Dumbbell className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <Progress value={progresso} />
          </div>
          <span className="text-xs font-medium text-slate-500 tabular-nums">{progresso}%</span>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 mx-auto w-full max-w-xl px-4 py-8 flex flex-col">
        {indice > 0 && (
          <button onClick={voltar} className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600">
            <ChevronLeft className="h-4 w-4" /> Voltar
          </button>
        )}

        <AnimatePresence mode="wait" custom={direcao}>
          <motion.div
            key={pergunta.id}
            custom={direcao}
            initial={{ opacity: 0, x: direcao * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direcao * -40 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex-1"
          >
            {secao && (
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                {secao.titulo}
              </p>
            )}
            <h1 className="mb-1 text-2xl font-bold leading-snug">{pergunta.titulo}</h1>
            {pergunta.descricao && <p className="mb-4 text-slate-500 text-sm leading-relaxed">{pergunta.descricao}</p>}

            {pergunta.id === "mob_agachamento" && <IlustracaoAgachamento />}
            {pergunta.id === "mob_dorsiflexao" && <IlustracaoDorsiflexao />}
            {pergunta.id === "mob_posterior" && <IlustracaoPosterior />}
            {pergunta.id === "mob_toracica" && <IlustracaoToracica />}
            {pergunta.id === "mob_ombro" && <IlustracaoOmbro />}
            {pergunta.id === "mob_quadril" && <IlustracaoQuadril />}

            {!pergunta.descricao && !pergunta.id.startsWith("mob_") && <div className="mb-6" />}
            {(pergunta.descricao || pergunta.id.startsWith("mob_")) && <div className="mb-4" />}

            <ConversationalStep
              pergunta={pergunta}
              valor={respostas[pergunta.id]}
              onChange={handleChange}
              onAvancar={avancar}
            />
          </motion.div>
        </AnimatePresence>

        {ultima && (
          <Button onClick={finalizar} disabled={salvando || !completa} className="mt-6 h-12 w-full bg-indigo-600 hover:bg-indigo-700">
            {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
            Finalizar anamnese
          </Button>
        )}
      </main>

      <footer className="py-4 text-center text-xs text-slate-400">
        Olá, {nomeAluno}! Suas respostas são salvas automaticamente.
      </footer>
    </div>
  );
}
