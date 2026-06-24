import type {
  Pergunta,
  Respostas,
  RespostaValor,
  SecaoAnamnese,
  AlertaGatilho,
} from "@/types/anamnese";

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------
export const SECOES: SecaoAnamnese[] = [
  { id: "identificacao", titulo: "Identificação", descricao: "Vamos nos conhecer" },
  { id: "objetivos", titulo: "Objetivos", descricao: "O que você busca" },
  { id: "historico", titulo: "Histórico de Treino", descricao: "Sua experiência" },
  { id: "local", titulo: "Local de Treino", descricao: "Onde você treina" },
  { id: "ortopedica", titulo: "Triagem Ortopédica", descricao: "Articulações e dores" },
  { id: "cardiovascular", titulo: "Triagem Cardiovascular", descricao: "Saúde do coração" },
  { id: "mobilidade", titulo: "Mobilidade", descricao: "Amplitude de movimento" },
  { id: "postural", titulo: "Desvios Posturais", descricao: "Avaliação da postura" },
  { id: "recuperacao", titulo: "Recuperação", descricao: "Sono e descanso" },
  { id: "nutricao", titulo: "Nutrição", descricao: "Alimentação e hábitos" },
  { id: "comportamento", titulo: "Comportamento", descricao: "Motivação e adesão" },
];

// Helpers for conditional logic
const tem = (respostas: Respostas, id: string, valor: string): boolean => {
  const r = respostas[id];
  if (Array.isArray(r)) return r.includes(valor);
  return r === valor;
};

const regioesDor = (respostas: Respostas): string[] => {
  const r = respostas["orto_regioes"];
  return Array.isArray(r) ? (r as string[]) : [];
};

const REGIOES_ORTO: { valor: string; label: string }[] = [
  { valor: "cervical", label: "Cervical (pescoço)" },
  { valor: "ombros", label: "Ombros" },
  { valor: "cotovelos", label: "Cotovelos" },
  { valor: "punhos", label: "Punhos" },
  { valor: "toracica", label: "Torácica (meio das costas)" },
  { valor: "lombar", label: "Lombar (parte baixa)" },
  { valor: "quadril", label: "Quadril" },
  { valor: "joelho", label: "Joelho" },
  { valor: "tornozelo", label: "Tornozelo" },
];

// Build the deep orthopedic investigation tree for each selected region.
function perguntasOrtoRegiao(regiao: { valor: string; label: string }): Pergunta[] {
  const cond = (r: Respostas) => regioesDor(r).includes(regiao.valor);
  return [
    {
      id: `orto_${regiao.valor}_dor_atual`,
      secao: "ortopedica",
      titulo: `Você ainda sente dor em ${regiao.label.toLowerCase()}?`,
      tipo: "sim_nao",
      condicao: cond,
      obrigatoria: true,
    },
    {
      id: `orto_${regiao.valor}_intensidade`,
      secao: "ortopedica",
      titulo: `Qual a intensidade da dor em ${regiao.label.toLowerCase()}?`,
      tipo: "escala",
      escalaMin: 1,
      escalaMax: 10,
      escalaLabelMin: "Leve",
      escalaLabelMax: "Insuportável",
      condicao: (r) => cond(r) && r[`orto_${regiao.valor}_dor_atual`] === "sim",
    },
    {
      id: `orto_${regiao.valor}_diagnostico`,
      secao: "ortopedica",
      titulo: `Tem diagnóstico médico para ${regiao.label.toLowerCase()}?`,
      tipo: "sim_nao",
      condicao: cond,
    },
    {
      id: `orto_${regiao.valor}_cid`,
      secao: "ortopedica",
      titulo: "Qual o CID ou nome do diagnóstico?",
      tipo: "texto",
      placeholder: "Ex.: M75.1, tendinite...",
      dica: "Ex.: tendinite no manguito rotador, hérnia de disco L4-L5, condromalácia patelar. Se não souber o CID, só o nome já ajuda.",
      condicao: (r) => cond(r) && r[`orto_${regiao.valor}_diagnostico`] === "sim",
    },
    {
      id: `orto_${regiao.valor}_cirurgia`,
      secao: "ortopedica",
      titulo: `Já fez cirurgia em ${regiao.label.toLowerCase()}?`,
      tipo: "sim_nao",
      condicao: cond,
    },
    {
      id: `orto_${regiao.valor}_local_exato`,
      secao: "ortopedica",
      titulo: "Onde exatamente é a dor?",
      tipo: "texto",
      placeholder: "Descreva o ponto exato",
      dica: "Ex.: parte anterior do joelho, lado de fora do ombro, base do polegar...",
      condicao: (r) => cond(r) && r[`orto_${regiao.valor}_dor_atual`] === "sim",
    },
    {
      id: `orto_${regiao.valor}_piora`,
      secao: "ortopedica",
      titulo: "O que piora a dor?",
      tipo: "texto",
      dica: "Ex.: subir escadas, levantar o braço acima da cabeça, sentar por muito tempo...",
      condicao: (r) => cond(r) && r[`orto_${regiao.valor}_dor_atual`] === "sim",
    },
    {
      id: `orto_${regiao.valor}_melhora`,
      secao: "ortopedica",
      titulo: "O que melhora a dor?",
      tipo: "texto",
      dica: "Ex.: gelo, repouso, anti-inflamatório, alongamento, calor...",
      condicao: (r) => cond(r) && r[`orto_${regiao.valor}_dor_atual`] === "sim",
    },
  ];
}

const CARDIO_ITENS: { valor: string; label: string }[] = [
  { valor: "dor_peito", label: "Dor no peito" },
  { valor: "palpitacoes", label: "Palpitações" },
  { valor: "arritmia", label: "Arritmia" },
  { valor: "falta_ar", label: "Falta de ar" },
  { valor: "hipertensao", label: "Hipertensão" },
  { valor: "historico_cardiaco", label: "Histórico cardíaco familiar" },
  { valor: "desmaios", label: "Desmaios" },
  { valor: "avc", label: "AVC" },
  { valor: "infarto", label: "Infarto" },
];

// ---------------------------------------------------------------------------
// Postural deviations
// ---------------------------------------------------------------------------
const DESVIOS_POSTURAIS: { valor: string; label: string; descricao?: string }[] = [
  { valor: "cabeca_ant", label: "Cabeça anteriorizada", descricao: "A cabeça fica projetada para frente, à frente dos ombros. Comum em quem passa muito tempo no celular ou computador." },
  { valor: "ombros_proj", label: "Ombros projetados para frente", descricao: "Os ombros ficam arredondados e caídos para frente, como se a postura estivesse 'fechada'. Muito comum em quem fica sentado muito tempo." },
  { valor: "hipercifose", label: "Hipercifose torácica", descricao: "Curvatura exagerada nas costas superiores, formando uma 'corcunda'. A região entre os ombros fica muito arqueada para fora." },
  { valor: "hiperlordose", label: "Hiperlordose lombar", descricao: "Curvatura exagerada na lombar (parte baixa das costas), fazendo o bumbum parecer empinado e a barriga projetada para frente." },
  { valor: "retif_cerv", label: "Retificação cervical", descricao: "O pescoço perde sua curva natural e fica reto. Geralmente causa dor e rigidez no pescoço e ombros." },
  { valor: "retif_lombar", label: "Retificação lombar", descricao: "A parte baixa das costas perde a curva natural e fica reta, como uma 'costa chata'. Pode causar dor lombar." },
  { valor: "escoliose", label: "Escoliose", descricao: "A coluna tem um desvio lateral (em 'S' ou 'C' quando vista de trás). Pode fazer um ombro ficar mais alto que o outro ou o tronco inclinar para um lado." },
  { valor: "escapulas", label: "Escápulas aladas", descricao: "As omoplatas (ossos das costas) ficam salientes, como 'asas'. Fica evidente quando a pessoa empurra algo com os braços estendidos." },
  { valor: "joelho_valgo", label: "Joelho valgo (joelhos para dentro)", descricao: "Os joelhos se tocam ou se aproximam quando a pessoa está em pé, mesmo com os pés afastados. Popular como 'joelho em X'." },
  { valor: "joelho_varo", label: "Joelho varo (joelhos para fora)", descricao: "Os joelhos ficam afastados com os pés juntos, formando um espaço entre eles. Popularmente chamado de 'pernas de cavaleiro' ou 'pernas tortas'." },
  { valor: "pe_plano", label: "Pé plano (pé chato)", descricao: "O arco interno do pé é muito baixo ou inexistente, fazendo a sola quase toda tocar o chão. Pode causar dor nos pés e joelhos." },
  { valor: "pe_cavo", label: "Pé cavo", descricao: "O arco do pé é muito elevado, fazendo apenas o calcanhar e a parte da frente do pé tocarem o chão. O oposto do pé plano." },
  { valor: "antev_pelv", label: "Anteversão pélvica", descricao: "A bacia inclina para frente, empinando o bumbum e arqueando bastante a lombar. Muito ligado à hiperlordose." },
  { valor: "retrov_pelv", label: "Retroversão pélvica", descricao: "A bacia inclina para trás, 'engolindo' o bumbum e deixando as costas com pouca ou nenhuma curva lombar." },
  { valor: "outro", label: "Outro" },
  { valor: "nenhum", label: "Nenhum dos anteriores" },
  { valor: "incerto", label: "Não tenho certeza" },
];

function desviosSelecionados(respostas: Respostas): string[] {
  const r = respostas["postural_desvios"];
  return Array.isArray(r) ? (r as string[]) : [];
}

function perguntasDesvio(desvio: { valor: string; label: string }): Pergunta[] {
  const cond = (r: Respostas) => desviosSelecionados(r).includes(desvio.valor);

  const labelMin = desvio.valor === "outro" ? "esse desvio" : desvio.label.toLowerCase();

  const perguntas: Pergunta[] = [];

  if (desvio.valor === "outro") {
    perguntas.push({
      id: "postural_outro_nome",
      secao: "postural",
      titulo: "Qual outro desvio você possui?",
      tipo: "texto",
      placeholder: "Descreva o desvio postural",
      dica: "Ex.: genu recurvatum, hiperlordose cervical, síndrome cruzada inferior...",
      condicao: cond,
    });
  }

  perguntas.push(
    {
      id: `post_${desvio.valor}_quem`,
      secao: "postural",
      titulo: `Quem identificou ${labelMin}?`,
      tipo: "escolha_unica",
      opcoes: [
        { valor: "medico", label: "Médico" },
        { valor: "fisio", label: "Fisioterapeuta" },
        { valor: "personal", label: "Personal Trainer" },
        { valor: "avaliacao", label: "Avaliação postural" },
        { valor: "eu_mesmo", label: "Eu mesmo percebi" },
        { valor: "outro_prof", label: "Outro profissional" },
      ],
      condicao: cond,
    },
    {
      id: `post_${desvio.valor}_diagnostico`,
      secao: "postural",
      titulo: `Existe diagnóstico formal de ${labelMin}?`,
      tipo: "sim_nao",
      condicao: cond,
    },
    {
      id: `post_${desvio.valor}_tempo`,
      secao: "postural",
      titulo: `Há quanto tempo você percebe ${labelMin}?`,
      tipo: "escolha_unica",
      opcoes: [
        { valor: "menos_1a", label: "Menos de 1 ano" },
        { valor: "1_3a", label: "1 a 3 anos" },
        { valor: "mais_3a", label: "Mais de 3 anos" },
        { valor: "sempre", label: "Desde sempre / não sei" },
      ],
      condicao: cond,
    },
    {
      id: `post_${desvio.valor}_dor`,
      secao: "postural",
      titulo: `Há dor associada a ${labelMin}?`,
      tipo: "sim_nao",
      dica: "Dor recorrente ou constante nessa região pode indicar sobrecarga estrutural.",
      condicao: cond,
    },
    {
      id: `post_${desvio.valor}_limitacao`,
      secao: "postural",
      titulo: `Esse desvio causa limitação de movimento?`,
      tipo: "sim_nao",
      condicao: cond,
    },
    {
      id: `post_${desvio.valor}_forca`,
      secao: "postural",
      titulo: `Você percebe perda de força relacionada a esse desvio?`,
      tipo: "sim_nao",
      condicao: cond,
    },
    {
      id: `post_${desvio.valor}_exercicio`,
      secao: "postural",
      titulo: `Esse desvio interfere em algum exercício?`,
      tipo: "sim_nao",
      condicao: cond,
    },
    {
      id: `post_${desvio.valor}_exercicio_quais`,
      secao: "postural",
      titulo: "Quais exercícios são afetados?",
      tipo: "texto",
      placeholder: "Ex.: agachamento, desenvolvimento de ombros...",
      dica: "Cite os exercícios onde sente dificuldade, dor ou compensação por causa desse desvio.",
      condicao: (r) => cond(r) && r[`post_${desvio.valor}_exercicio`] === "sim",
    },
  );

  return perguntas;
}

// ---------------------------------------------------------------------------
// The full ordered list of questions
// ---------------------------------------------------------------------------
export const PERGUNTAS: Pergunta[] = [
  // IDENTIFICAÇÃO
  { id: "nome", secao: "identificacao", titulo: "Qual é o seu nome?", tipo: "texto", obrigatoria: true, placeholder: "Seu nome completo", dica: "Ex.: João Silva" },
  { id: "idade", secao: "identificacao", titulo: "Quantos anos você tem?", tipo: "numero", obrigatoria: true, dica: "Ex.: 28" },
  {
    id: "sexo", secao: "identificacao", titulo: "Sexo biológico", tipo: "escolha_unica", obrigatoria: true,
    opcoes: [
      { valor: "M", label: "Masculino" },
      { valor: "F", label: "Feminino" },
      { valor: "Outro", label: "Outro" },
    ],
  },
  { id: "peso", secao: "identificacao", titulo: "Qual o seu peso atual? (kg)", tipo: "numero", obrigatoria: true, dica: "Ex.: 75 — use o peso mais recente, mesmo que aproximado" },
  { id: "altura", secao: "identificacao", titulo: "Qual a sua altura? (cm)", tipo: "numero", obrigatoria: true, dica: "Ex.: 175 — em centímetros, sem ponto ou vírgula" },
  { id: "profissao", secao: "identificacao", titulo: "Qual a sua profissão?", tipo: "texto", dica: "Ex.: Analista de sistemas, professor, motorista..." },
  {
    id: "rotina_trabalho", secao: "identificacao", titulo: "Como é sua rotina de trabalho?", tipo: "escolha_unica",
    opcoes: [
      { valor: "sentado", label: "Maior parte sentado" },
      { valor: "em_pe", label: "Maior parte em pé" },
      { valor: "fisica", label: "Trabalho físico/pesado" },
      { valor: "variada", label: "Variada" },
    ],
  },
  { id: "tem_filhos", secao: "identificacao", titulo: "Você tem filhos?", tipo: "sim_nao", dica: "Isso ajuda a entender sua disponibilidade de tempo para treinar." },
  {
    id: "dias_disponiveis", secao: "identificacao", titulo: "Quantos dias por semana você pode treinar?", tipo: "escolha_unica", obrigatoria: true,
    opcoes: ["1", "2", "3", "4", "5", "6", "7"].map((d) => ({ valor: d, label: `${d} dia(s)` })),
  },
  {
    id: "tempo_sessao", secao: "identificacao", titulo: "Quanto tempo por sessão?", tipo: "escolha_unica", obrigatoria: true,
    opcoes: [
      { valor: "30", label: "Até 30 min" },
      { valor: "45", label: "45 min" },
      { valor: "60", label: "1 hora" },
      { valor: "90", label: "1h30 ou mais" },
    ],
  },

  // OBJETIVOS
  {
    id: "objetivos", secao: "objetivos", titulo: "Quais são seus objetivos?", descricao: "Pode escolher mais de uma opção",
    tipo: "escolha_multipla", obrigatoria: true,
    opcoes: [
      { valor: "emagrecimento", label: "Emagrecimento" },
      { valor: "hipertrofia", label: "Hipertrofia" },
      { valor: "forca", label: "Força" },
      { valor: "saude", label: "Saúde" },
      { valor: "performance", label: "Performance esportiva" },
      { valor: "reabilitacao", label: "Reabilitação" },
      { valor: "autoestima", label: "Autoestima" },
    ],
  },
  {
    id: "emagrecimento_meta", secao: "objetivos", titulo: "Quantos kg você deseja perder?", tipo: "numero",
    dica: "Ex.: 10 — coloque uma meta realista, isso ajuda a montar o plano certo.",
    condicao: (r) => tem(r, "objetivos", "emagrecimento"),
  },
  {
    id: "hipertrofia_foco", secao: "objetivos", titulo: "Quais grupos musculares são prioridade?", tipo: "texto",
    placeholder: "Ex.: pernas, costas, braços",
    dica: "Ex.: pernas e glúteos — coloque em ordem de prioridade se quiser.",
    condicao: (r) => tem(r, "objetivos", "hipertrofia"),
  },
  {
    id: "forca_lift", secao: "objetivos", titulo: "Há algum levantamento específico que quer melhorar?", tipo: "texto",
    dica: "Ex.: quero aumentar meu agachamento de 80kg para 120kg.",
    condicao: (r) => tem(r, "objetivos", "forca"),
  },
  {
    id: "reabilitacao_detalhe", secao: "objetivos", titulo: "O que precisa reabilitar?", tipo: "textarea",
    dica: "Ex.: tendinite no ombro direito há 6 meses, já fiz fisioterapia mas ainda limita alguns movimentos.",
    condicao: (r) => tem(r, "objetivos", "reabilitacao"),
  },
  {
    id: "perf_esporte", secao: "objetivos", titulo: "Qual esporte ou modalidade você quer melhorar?", tipo: "escolha_unica",
    dica: "Escolha o esporte principal. Se praticar mais de um, escolha o que é prioridade.",
    opcoes: [
      { valor: "futebol", label: "Futebol" },
      { valor: "corrida", label: "Corrida" },
      { valor: "ciclismo", label: "Ciclismo" },
      { valor: "natacao", label: "Natação" },
      { valor: "crossfit", label: "Crossfit" },
      { valor: "jiu_jitsu", label: "Jiu-jitsu" },
      { valor: "muay_thai", label: "Muay Thai" },
      { valor: "artes_marciais", label: "Artes marciais" },
      { valor: "tenis", label: "Tênis" },
      { valor: "beach_tennis", label: "Beach Tennis" },
      { valor: "basquete", label: "Basquete" },
      { valor: "volei", label: "Vôlei" },
      { valor: "outro", label: "Outro" },
    ],
    condicao: (r) => tem(r, "objetivos", "performance"),
  },
  {
    id: "perf_esporte_outro", secao: "objetivos", titulo: "Qual esporte?", tipo: "texto",
    placeholder: "Ex.: remo, rugby, escalada...",
    dica: "Descreva o esporte ou modalidade que você pratica.",
    condicao: (r) => tem(r, "objetivos", "performance") && r["perf_esporte"] === "outro",
  },
  {
    id: "perf_tempo_pratica", secao: "objetivos", titulo: "Há quanto tempo você pratica esse esporte?", tipo: "escolha_unica",
    opcoes: [
      { valor: "menos_1a", label: "Menos de 1 ano" },
      { valor: "1_3a", label: "1 a 3 anos" },
      { valor: "3_5a", label: "3 a 5 anos" },
      { valor: "mais_5a", label: "Mais de 5 anos" },
    ],
    condicao: (r) => tem(r, "objetivos", "performance"),
  },
  {
    id: "perf_frequencia", secao: "objetivos", titulo: "Quantas vezes por semana você pratica?", tipo: "escolha_unica",
    opcoes: [
      { valor: "1", label: "1 vez" },
      { valor: "2", label: "2 vezes" },
      { valor: "3", label: "3 vezes" },
      { valor: "4_5", label: "4 a 5 vezes" },
      { valor: "diario", label: "Todos os dias" },
    ],
    condicao: (r) => tem(r, "objetivos", "performance"),
  },
  {
    id: "perf_competicoes", secao: "objetivos", titulo: "Você compete ou tem alguma competição planejada?", tipo: "sim_nao",
    dica: "Competições criam prazos e mudam a periodização do treino.",
    condicao: (r) => tem(r, "objetivos", "performance"),
  },
  {
    id: "perf_competicao_detalhe", secao: "objetivos", titulo: "Qual competição e quando?", tipo: "texto",
    placeholder: "Ex.: corrida de rua 10km em outubro",
    dica: "Informe o evento e a data aproximada para montarmos uma preparação específica.",
    condicao: (r) => tem(r, "objetivos", "performance") && r["perf_competicoes"] === "sim",
  },
  {
    id: "perf_objetivo_esporte", secao: "objetivos", titulo: "O que você quer melhorar no esporte?", tipo: "textarea",
    dica: "Ex.: quero aumentar minha velocidade na corrida, melhorar minha explosão no futebol, aguentar mais sets no beach tennis sem cansar.",
    condicao: (r) => tem(r, "objetivos", "performance"),
  },
  {
    id: "perf_limitacoes", secao: "objetivos", titulo: "Alguma limitação física afeta seu desempenho no esporte?", tipo: "textarea",
    dica: "Ex.: meu tornozelo torce com frequência, sinto cansaço muscular rápido nas pernas, minha flexibilidade prejudica a braçada.",
    condicao: (r) => tem(r, "objetivos", "performance"),
  },
  {
    id: "perf_lesoes_esporte", secao: "objetivos", titulo: "Já teve alguma lesão relacionada ao esporte?", tipo: "textarea",
    dica: "Ex.: entorse de tornozelo recorrente, tendinite patelar, distensão na coxa. Se não tiver, escreva 'Nenhuma'.",
    condicao: (r) => tem(r, "objetivos", "performance"),
  },
  {
    id: "perf_regioes_corpo", secao: "objetivos", titulo: "Quais regiões do corpo são mais exigidas no seu esporte?", descricao: "Pode escolher mais de uma opção",
    tipo: "escolha_multipla",
    opcoes: [
      { valor: "membros_inferiores", label: "Membros inferiores (pernas/glúteos)" },
      { valor: "core", label: "Core (abdômen/lombar)" },
      { valor: "membros_superiores", label: "Membros superiores (braços/ombros)" },
      { valor: "costas", label: "Costas" },
      { valor: "cardiorrespiratorio", label: "Cardiorrespiratório (resistência)" },
      { valor: "cervical", label: "Cervical (pescoço)" },
    ],
    condicao: (r) => tem(r, "objetivos", "performance"),
  },

  // HISTÓRICO
  {
    id: "tempo_treino", secao: "historico", titulo: "Há quanto tempo você treina musculação?", tipo: "escolha_unica", obrigatoria: true,
    opcoes: [
      { valor: "nunca", label: "Nunca treinei" },
      { valor: "menos_6m", label: "Menos de 6 meses" },
      { valor: "6m_1a", label: "6 meses a 1 ano" },
      { valor: "1a_3a", label: "1 a 3 anos" },
      { valor: "mais_3a", label: "Mais de 3 anos" },
    ],
  },
  { id: "exercicios_favoritos", secao: "historico", titulo: "Quais exercícios você mais gosta?", tipo: "texto", dica: "Ex.: agachamento, supino, corrida, natação..." },
  { id: "exercicios_nao_gosta", secao: "historico", titulo: "Quais você não gosta?", tipo: "texto", dica: "Ex.: burpee, leg press, esteira. Seja honesto — isso ajuda muito!" },
  { id: "exercicios_medo", secao: "historico", titulo: "Algum exercício te causa medo?", tipo: "texto", dica: "Ex.: agachamento com barra, levantamento terra. Se não, pode escrever 'Nenhum'." },
  { id: "exercicios_desconforto", secao: "historico", titulo: "Algum exercício causa desconforto físico?", tipo: "texto", dica: "Ex.: rosca direta dói no cotovelo, agachamento dói no joelho. Se nenhum, escreva 'Nenhum'." },
  {
    id: "maquinas_ou_livre", secao: "historico", titulo: "Você prefere máquinas ou peso livre?", tipo: "escolha_unica",
    opcoes: [
      { valor: "maquinas", label: "Máquinas" },
      { valor: "livre", label: "Peso livre" },
      { valor: "ambos", label: "Ambos / sem preferência" },
    ],
  },
  {
    id: "zona_repeticoes", secao: "historico", titulo: "Zona de repetições preferida", descricao: "Pode escolher mais de uma opção", tipo: "escolha_multipla",
    opcoes: [
      { valor: "6-8", label: "6-8 reps" },
      { valor: "8-10", label: "8-10 reps" },
      { valor: "10-12", label: "10-12 reps" },
      { valor: "12-15", label: "12-15 reps" },
      { valor: "15-20", label: "15-20 reps" },
      { valor: "20+", label: "20+ reps" },
    ],
  },
  { id: "conhece_tecnicas", secao: "historico", titulo: "Conhece técnicas avançadas (drop-set, rest-pause, etc)?", tipo: "sim_nao", dica: "Isso ajuda a calibrar a complexidade do seu treino." },
  {
    id: "tecnica_favorita", secao: "historico", titulo: "Qual sua técnica avançada favorita?", tipo: "texto",
    dica: "Ex.: drop-set, rest-pause, cluster sets, bi-set...",
    condicao: (r) => r["conhece_tecnicas"] === "sim",
  },
  { id: "ja_personal", secao: "historico", titulo: "Já treinou com personal trainer?", tipo: "sim_nao", dica: "Presencial ou online, conta qualquer experiência anterior." },
  { id: "ja_consultoria", secao: "historico", titulo: "Já fez consultoria online?", tipo: "sim_nao", dica: "Programas de treino comprados pela internet também contam." },

  // LOCAL DE TREINO
  {
    id: "local_treino", secao: "local", titulo: "Onde você vai treinar?", tipo: "escolha_unica", obrigatoria: true,
    opcoes: [
      { valor: "academia", label: "Academia" },
      { valor: "condominio", label: "Academia do condomínio" },
      { valor: "predio", label: "Academia do prédio" },
      { valor: "studio", label: "Studio" },
      { valor: "casa", label: "Em casa" },
    ],
  },
  {
    id: "equipamentos_casa", secao: "local", titulo: "Quais equipamentos você tem em casa?", descricao: "Pode escolher mais de uma opção", tipo: "escolha_multipla",
    opcoes: [
      { valor: "halteres", label: "Halteres" },
      { valor: "barra", label: "Barra e anilhas" },
      { valor: "elasticos", label: "Elásticos" },
      { valor: "kettlebell", label: "Kettlebell" },
      { valor: "banco", label: "Banco" },
      { valor: "barra_fixa", label: "Barra fixa" },
      { valor: "nenhum", label: "Nenhum (peso corporal)" },
    ],
    condicao: (r) => r["local_treino"] === "casa",
  },
  {
    id: "equipamentos_limitados", secao: "local", titulo: "O local tem alguma limitação de equipamentos?", tipo: "textarea",
    dica: "Ex.: não tem barra fixa, só tem halteres até 20kg, sem smith machine...",
    condicao: (r) => ["condominio", "predio", "studio"].includes(String(r["local_treino"])),
  },

  // TRIAGEM ORTOPÉDICA
  {
    id: "orto_regioes", secao: "ortopedica", titulo: "Você sente ou já sentiu dor em alguma dessas regiões?",
    descricao: "Pode escolher mais de uma opção. Se não tem dores, clique em Continuar.", tipo: "escolha_multipla",
    opcoes: REGIOES_ORTO,
  },
  ...REGIOES_ORTO.flatMap(perguntasOrtoRegiao),

  // TRIAGEM CARDIOVASCULAR
  {
    id: "cardio_itens", secao: "cardiovascular",
    titulo: "Você apresenta ou já apresentou algum destes sintomas/condições?",
    descricao: "Pode escolher mais de uma opção. Sua segurança é prioridade.",
    tipo: "escolha_multipla",
    opcoes: [...CARDIO_ITENS, { valor: "nenhum", label: "Nenhum destes" }],
    gatilhoAlerta: (valor) => Array.isArray(valor) && valor.length > 0 && !valor.includes("nenhum"),
  },
  {
    id: "cardio_detalhe", secao: "cardiovascular", titulo: "Pode dar mais detalhes sobre o que marcou?", tipo: "textarea",
    dica: "Ex.: tenho hipertensão controlada com medicamento desde 2020, pressão normal é 130/85.",
    condicao: (r) => Array.isArray(r["cardio_itens"]) && (r["cardio_itens"] as string[]).some(v => v !== "nenhum"),
  },
  {
    id: "cardio_liberacao", secao: "cardiovascular", titulo: "Tem liberação médica para atividade física?", tipo: "sim_nao",
    dica: "Se não tiver, recomendamos consultar um médico antes de iniciar o treino.",
    condicao: (r) => Array.isArray(r["cardio_itens"]) && (r["cardio_itens"] as string[]).some(v => v !== "nenhum"),
  },

  // MOBILIDADE
  {
    id: "mob_agachamento", secao: "mobilidade",
    titulo: "Como você avalia seu agachamento profundo?",
    descricao: "Teste: pés na largura dos ombros, agache o mais fundo possível mantendo o calcanhar no chão e as costas eretas.",
    tipo: "escala", escalaMin: 1, escalaMax: 5,
    escalaLabelMin: "Muito limitado", escalaLabelMax: "Excelente",
    escalaLabels: [
      "Não consigo agachar sem perder o equilíbrio ou dobrar demais as costas.",
      "Consigo agachar parcialmente, mas o calcanhar levanta ou as costas arredondam muito.",
      "Consigo agachar razoavelmente, com pequenas compensações.",
      "Consigo agachar fundo com boa postura e calcanhar no chão.",
      "Agachamento profundo perfeito, sem dor, desequilíbrio ou compensação.",
    ],
  },
  {
    id: "mob_dorsiflexao", secao: "mobilidade",
    titulo: "Como você avalia a mobilidade do seu tornozelo?",
    descricao: "Teste: de frente para a parede, pé a ~10cm dela, tente tocar o joelho na parede sem tirar o calcanhar do chão.",
    tipo: "escala", escalaMin: 1, escalaMax: 5,
    escalaLabelMin: "Muito limitada", escalaLabelMax: "Excelente",
    escalaLabels: [
      "Não consigo nem chegar perto da parede.",
      "Consigo aproximar, mas o calcanhar levanta antes.",
      "Consigo tocar a parede com dificuldade.",
      "Consigo tocar a parede facilmente.",
      "Consigo tocar a parede facilmente e até aumentar a distância do pé.",
    ],
  },
  {
    id: "mob_posterior", secao: "mobilidade",
    titulo: "Como você avalia sua flexibilidade posterior?",
    descricao: "Teste: em pé, pernas estendidas, tente tocar as pontas dos dedos nos pés sem dobrar os joelhos.",
    tipo: "escala", escalaMin: 1, escalaMax: 5,
    escalaLabelMin: "Muito limitada", escalaLabelMax: "Excelente",
    escalaLabels: [
      "Não consigo passar da metade da canela.",
      "Consigo chegar até o tornozelo.",
      "Consigo tocar as pontas dos pés com os dedos.",
      "Consigo tocar o chão com as pontas dos dedos.",
      "Consigo apoiar a palma da mão no chão com as pernas estendidas.",
    ],
  },
  {
    id: "mob_toracica", secao: "mobilidade",
    titulo: "Como você avalia a mobilidade da sua coluna torácica?",
    descricao: "Teste: sentado em uma cadeira, braços cruzados no peito, gire o tronco para cada lado sem mover o quadril.",
    tipo: "escala", escalaMin: 1, escalaMax: 5,
    escalaLabelMin: "Muito limitada", escalaLabelMax: "Excelente",
    escalaLabels: [
      "Quase não consigo girar, sinto trava imediata.",
      "Giro pouco, menos de 45° para cada lado.",
      "Giro razoavelmente, cerca de 45–60° para cada lado.",
      "Giro bem, cerca de 60–80° para cada lado.",
      "Giro livremente mais de 80° para cada lado, sem dor.",
    ],
  },
  {
    id: "mob_ombro", secao: "mobilidade",
    titulo: "Como você avalia a mobilidade dos seus ombros?",
    descricao: "Teste: passe uma mão por cima do ombro e a outra por baixo das costas tentando se tocar. Repita invertendo.",
    tipo: "escala", escalaMin: 1, escalaMax: 5,
    escalaLabelMin: "Muito limitada", escalaLabelMax: "Excelente",
    escalaLabels: [
      "As mãos ficam muito distantes, não consigo nem aproximar.",
      "Consigo aproximar, mas ainda há mais de 10cm de distância.",
      "As mãos ficam a menos de 10cm.",
      "As mãos se tocam.",
      "As mãos se sobrepõem.",
    ],
  },
  {
    id: "mob_quadril", secao: "mobilidade",
    titulo: "Como você avalia a mobilidade do seu quadril?",
    descricao: "Teste: deite de costas, dobre um joelho e puxe-o com as mãos em direção ao peito. Observe até onde vai sem dor. Repita com o outro lado.",
    tipo: "escala", escalaMin: 1, escalaMax: 5,
    escalaLabelMin: "Muito limitada", escalaLabelMax: "Excelente",
    escalaLabels: [
      "Não consigo dobrar o joelho além de 45° em direção ao peito.",
      "Consigo chegar até 90° (coxa paralela ao chão), mas sinto tensão forte.",
      "Consigo passar de 90° com alguma dificuldade ou tensão moderada.",
      "Consigo puxar o joelho bem próximo ao peito sem dor.",
      "O joelho toca o peito facilmente, sem dor ou tensão em nenhum dos lados.",
    ],
  },

  // DESVIOS POSTURAIS
  {
    id: "postural_tem_desvio", secao: "postural",
    titulo: "Você possui ou já foi informado por algum profissional que possui algum desvio postural?",
    tipo: "escolha_unica", obrigatoria: true,
    opcoes: [
      { valor: "nao", label: "Não" },
      { valor: "sim", label: "Sim" },
      { valor: "nao_sei", label: "Não sei informar" },
    ],
  },

  // — Ramo SIM: seleção de desvios
  {
    id: "postural_desvios", secao: "postural",
    titulo: "Quais desvios posturais você possui ou suspeita possuir?",
    descricao: "Selecione todos que se aplicam. Se não tiver nenhum, selecione 'Nenhum dos anteriores'.",
    tipo: "escolha_multipla",
    obrigatoria: true,
    opcoes: DESVIOS_POSTURAIS,
  },

  // — Aprofundamento por desvio
  ...DESVIOS_POSTURAIS
    .filter((d) => d.valor !== "incerto" && d.valor !== "nenhum")
    .flatMap(perguntasDesvio),

  // — Ramo NÃO SEI: autoavaliação
  {
    id: "postural_autoavaliacao", secao: "postural",
    titulo: "Você gostaria de realizar uma autoavaliação simples?",
    descricao: "São apenas 5 perguntas rápidas que ajudam o personal a entender melhor sua postura. Não geram diagnóstico.",
    tipo: "sim_nao",
    dica: "As respostas não substituem uma avaliação profissional, mas ajudam o personal a personalizar ainda mais o seu treino.",
    condicao: (r) => r["postural_tem_desvio"] === "nao_sei",
  },
  {
    id: "postural_auto_ombros", secao: "postural",
    titulo: "Seus ombros parecem arredondados para frente?",
    tipo: "sim_nao",
    dica: "Observe-se de lado no espelho: os ombros ficam à frente do tronco?",
    condicao: (r) => r["postural_tem_desvio"] === "nao_sei" && r["postural_autoavaliacao"] === "sim",
  },
  {
    id: "postural_auto_cabeca", secao: "postural",
    titulo: "Sua cabeça parece ficar projetada para frente?",
    tipo: "sim_nao",
    dica: "Observe de lado: a orelha fica à frente do ombro?",
    condicao: (r) => r["postural_tem_desvio"] === "nao_sei" && r["postural_autoavaliacao"] === "sim",
  },
  {
    id: "postural_auto_ombro_altura", secao: "postural",
    titulo: "Você percebe diferença de altura entre os dois ombros?",
    tipo: "sim_nao",
    dica: "Olhe no espelho de frente: um ombro fica visivelmente mais alto que o outro?",
    condicao: (r) => r["postural_tem_desvio"] === "nao_sei" && r["postural_autoavaliacao"] === "sim",
  },
  {
    id: "postural_auto_joelhos", secao: "postural",
    titulo: "Seus joelhos tendem a ficar voltados para dentro ao se olhar de frente?",
    tipo: "sim_nao",
    dica: "Em pé, relaxado: os joelhos ficam próximos um do outro mesmo com os pés afastados?",
    condicao: (r) => r["postural_tem_desvio"] === "nao_sei" && r["postural_autoavaliacao"] === "sim",
  },
  {
    id: "postural_auto_lombar", secao: "postural",
    titulo: "Você percebe um arco muito acentuado na região lombar?",
    tipo: "sim_nao",
    dica: "De lado no espelho: há uma curvatura exagerada na região da cintura, deixando a barriga projetada para frente?",
    condicao: (r) => r["postural_tem_desvio"] === "nao_sei" && r["postural_autoavaliacao"] === "sim",
  },

  // RECUPERAÇÃO
  {
    id: "sono_horas", secao: "recuperacao", titulo: "Quantas horas você dorme por noite?", tipo: "escolha_unica",
    opcoes: [
      { valor: "menos_5", label: "Menos de 5h" },
      { valor: "5_6", label: "5-6h" },
      { valor: "7_8", label: "7-8h" },
      { valor: "mais_8", label: "Mais de 8h" },
    ],
  },
  { id: "sono_qualidade", secao: "recuperacao", titulo: "Qualidade do seu sono", tipo: "escala", escalaMin: 1, escalaMax: 5, escalaLabelMin: "Péssima", escalaLabelMax: "Ótima" },
  { id: "estresse", secao: "recuperacao", titulo: "Nível de estresse no dia a dia", tipo: "escala", escalaMin: 1, escalaMax: 5, escalaLabelMin: "Baixo", escalaLabelMax: "Altíssimo" },
  { id: "fadiga", secao: "recuperacao", titulo: "Nível de fadiga atual", tipo: "escala", escalaMin: 1, escalaMax: 5, escalaLabelMin: "Descansado", escalaLabelMax: "Exausto" },
  { id: "dor_muscular", secao: "recuperacao", titulo: "Costuma sentir muita dor muscular após treinos?", tipo: "escala", escalaMin: 1, escalaMax: 5, escalaLabelMin: "Nunca", escalaLabelMax: "Sempre" },
  { id: "energia", secao: "recuperacao", titulo: "Seu nível de energia geral", tipo: "escala", escalaMin: 1, escalaMax: 5, escalaLabelMin: "Baixíssima", escalaLabelMax: "Altíssima" },

  // NUTRIÇÃO
  {
    id: "proteina", secao: "nutricao", titulo: "Como é seu consumo de proteína?", tipo: "escolha_unica",
    opcoes: [
      { valor: "baixo", label: "Baixo" },
      { valor: "moderado", label: "Moderado" },
      { valor: "alto", label: "Alto" },
      { valor: "nao_sei", label: "Não sei avaliar" },
    ],
  },
  {
    id: "agua", secao: "nutricao", titulo: "Quanta água você bebe por dia?", tipo: "escolha_unica",
    opcoes: [
      { valor: "menos_1l", label: "Menos de 1L" },
      { valor: "1_2l", label: "1-2L" },
      { valor: "2_3l", label: "2-3L" },
      { valor: "mais_3l", label: "Mais de 3L" },
    ],
  },
  {
    id: "alcool", secao: "nutricao", titulo: "Com que frequência consome álcool?", tipo: "escolha_unica",
    opcoes: [
      { valor: "nunca", label: "Nunca" },
      { valor: "raramente", label: "Raramente" },
      { valor: "fim_semana", label: "Fins de semana" },
      { valor: "frequente", label: "Frequentemente" },
    ],
  },
  {
    id: "frequencia_alimentar", secao: "nutricao", titulo: "Quantas refeições por dia?", tipo: "escolha_unica",
    opcoes: [
      { valor: "1_2", label: "1-2" },
      { valor: "3_4", label: "3-4" },
      { valor: "5_6", label: "5-6" },
      { valor: "mais_6", label: "Mais de 6" },
    ],
  },
  { id: "fumante", secao: "nutricao", titulo: "Você fuma?", tipo: "sim_nao" },

  // MEDICAMENTOS
  {
    id: "usa_medicamento", secao: "nutricao", titulo: "Você usa algum medicamento de uso contínuo?", tipo: "sim_nao",
    dica: "Inclua remédios para pressão, tireoide, antidepressivos, ansiolíticos, corticoides, entre outros. Não precisa incluir vitaminas ou suplementos.",
  },
  {
    id: "medicamentos_detalhe", secao: "nutricao", titulo: "Quais medicamentos você usa?", tipo: "textarea",
    placeholder: "Ex.: Losartana 50mg (pressão), Levotiroxina 50mcg (tireoide), Escitalopram 10mg (ansiedade)...",
    dica: "Inclua o nome e a finalidade se souber. Isso ajuda a identificar possíveis influências no treino, recuperação e composição corporal.",
    condicao: (r) => r["usa_medicamento"] === "sim",
  },
  {
    id: "anticoncepcional", secao: "nutricao", titulo: "Você usa anticoncepcional ou faz reposição hormonal?", tipo: "escolha_unica",
    dica: "Hormônios femininos influenciam diretamente na retenção hídrica, disposição, força e composição corporal ao longo do ciclo.",
    opcoes: [
      { valor: "nao", label: "Não uso" },
      { valor: "anticoncepcional_oral", label: "Anticoncepcional oral (pílula)" },
      { valor: "anticoncepcional_injetavel", label: "Anticoncepcional injetável" },
      { valor: "diu_hormonal", label: "DIU hormonal (Mirena, Kyleena...)" },
      { valor: "implante", label: "Implante subcutâneo" },
      { valor: "reposicao_hormonal", label: "Reposição hormonal (menopausa/andropausa)" },
      { valor: "outro_hormonal", label: "Outro hormonal" },
    ],
    condicao: (r) => r["sexo"] === "F",
  },
  {
    id: "ciclo_impacto", secao: "nutricao", titulo: "Seu ciclo menstrual afeta seu treino?", tipo: "escolha_unica",
    dica: "Algumas fases do ciclo causam mais cansaço, retenção de líquido ou alteração de força — isso pode ser considerado no planejamento.",
    opcoes: [
      { valor: "nao", label: "Não percebo impacto" },
      { valor: "fraqueza_cansaco", label: "Sinto fraqueza ou cansaço em algumas fases" },
      { valor: "retencao", label: "Tenho bastante retenção de líquido" },
      { valor: "humor_motivacao", label: "Afeta meu humor e motivação para treinar" },
      { valor: "dor", label: "Tenho muita cólica ou dor que impede o treino" },
      { valor: "varios", label: "Vários desses impactos" },
    ],
    condicao: (r) => r["sexo"] === "F",
  },

  // COMPORTAMENTO
  { id: "motivacao_principal", secao: "comportamento", titulo: "Qual sua principal motivação para treinar?", tipo: "textarea", obrigatoria: true, dica: "Ex.: quero emagrecer para me sentir bem nas fotos da formatura em dezembro, quero ter energia para brincar com meus filhos..." },
  { id: "o_que_desmotiva", secao: "comportamento", titulo: "O que costuma te desmotivar?", tipo: "textarea", dica: "Ex.: cansaço após o trabalho, falta de resultado rápido, academia lotada, dor muscular excessiva..." },
  { id: "ja_largou", secao: "comportamento", titulo: "Já largou a academia antes?", tipo: "sim_nao", dica: "Não tem julgamento aqui — isso ajuda a montar estratégias para você não desistir desta vez." },
  {
    id: "motivo_largou", secao: "comportamento", titulo: "Por que largou da última vez?", tipo: "textarea",
    dica: "Ex.: mudei de emprego e perdi o horário, me machuquei, achei entediante, resultado demorou...",
    condicao: (r) => r["ja_largou"] === "sim",
  },
  { id: "principais_dificuldades", secao: "comportamento", titulo: "Quais suas principais dificuldades para manter a rotina?", tipo: "textarea", dica: "Ex.: falta de tempo, viagens frequentes, preguiça à noite, dificuldade em acordar cedo..." },
];

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

/** Returns the ordered list of questions visible given the current answers. */
export function perguntasVisiveis(respostas: Respostas): Pergunta[] {
  return PERGUNTAS.filter((p) => !p.condicao || p.condicao(respostas));
}

/** Index of the next unanswered visible question, or -1 if all answered. */
export function proximaPerguntaIndex(respostas: Respostas): number {
  const visiveis = perguntasVisiveis(respostas);
  for (let i = 0; i < visiveis.length; i++) {
    const p = visiveis[i];
    const r = respostas[p.id];
    const respondida = Array.isArray(r) ? true : r !== undefined && r !== null && r !== "";
    if (!respondida && p.obrigatoria) return i;
    if (!respondida && !respondida) {
      // optional + unanswered: still surface it once in order
      if (r === undefined) return i;
    }
  }
  return -1;
}

/** Completion percentage (0-100) based on visible questions answered. */
export function calcularProgresso(respostas: Respostas): number {
  const visiveis = perguntasVisiveis(respostas);
  if (visiveis.length === 0) return 0;
  const respondidas = visiveis.filter((p) => {
    const r = respostas[p.id];
    return r !== undefined;
  }).length;
  return Math.round((respondidas / visiveis.length) * 100);
}

/** Whether every required visible question has been answered. */
export function anamneseCompleta(respostas: Respostas): boolean {
  return perguntasVisiveis(respostas).every((p) => {
    if (!p.obrigatoria) return true;
    const r = respostas[p.id];
    return Array.isArray(r) ? r.length > 0 : r !== undefined && r !== null && r !== "";
  });
}

/**
 * Evaluate triggers across all answers and return any alerts to be created.
 * Cardiovascular positives are CRITICAL.
 */
export function avaliarAlertas(respostas: Respostas): AlertaGatilho[] {
  const alertas: AlertaGatilho[] = [];

  const cardio = respostas["cardio_itens"];
  if (Array.isArray(cardio) && cardio.length > 0) {
    const labels = cardio
      .map((v) => CARDIO_ITENS.find((c) => c.valor === v)?.label ?? v)
      .join(", ");
    alertas.push({
      tipo: "cardiovascular",
      criticidade: "alta",
      titulo: "Triagem cardiovascular positiva",
      descricao: `O aluno reportou: ${labels}. Recomenda-se liberação médica antes de iniciar.`,
    });
  }

  // Orthopedic: active pain with high intensity
  for (const regiao of REGIOES_ORTO) {
    if (!regioesDor(respostas).includes(regiao.valor)) continue;
    const dorAtual = respostas[`orto_${regiao.valor}_dor_atual`] === "sim";
    const intensidade = Number(respostas[`orto_${regiao.valor}_intensidade`] ?? 0);
    const cirurgia = respostas[`orto_${regiao.valor}_cirurgia`] === "sim";
    if (dorAtual && intensidade >= 6) {
      alertas.push({
        tipo: "ortopedico",
        criticidade: intensidade >= 8 ? "alta" : "media",
        titulo: `Dor ortopédica relevante — ${regiao.label}`,
        descricao: `Dor ativa intensidade ${intensidade}/10 em ${regiao.label}.`,
      });
    } else if (cirurgia) {
      alertas.push({
        tipo: "ortopedico",
        criticidade: "media",
        titulo: `Histórico cirúrgico — ${regiao.label}`,
        descricao: `Cirurgia prévia em ${regiao.label}. Adaptar carga e amplitude.`,
      });
    }
  }

  return alertas;
}

export function totalPerguntasVisiveis(respostas: Respostas): number {
  return perguntasVisiveis(respostas).length;
}

export { REGIOES_ORTO, CARDIO_ITENS };
export type { RespostaValor };
