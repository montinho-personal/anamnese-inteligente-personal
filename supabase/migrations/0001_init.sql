-- Anamnese Inteligente — initial schema
-- Run this migration in the Supabase SQL editor or via the Supabase CLI.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- personal_trainers
CREATE TABLE personal_trainers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  whatsapp_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- alunos
CREATE TABLE alunos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  personal_id UUID REFERENCES personal_trainers(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  whatsapp TEXT,
  idade INTEGER,
  sexo TEXT CHECK (sexo IN ('M', 'F', 'Outro')),
  altura_cm INTEGER,
  peso_kg DECIMAL(5,2),
  observacoes TEXT,
  status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'ativo', 'inativo')),
  token_anamnese UUID UNIQUE DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- anamneses
CREATE TABLE anamneses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
  versao INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_progresso', 'concluida')),
  respostas JSONB DEFAULT '{}',
  progresso_percentual INTEGER DEFAULT 0,
  iniciada_em TIMESTAMPTZ,
  concluida_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- relatorios
CREATE TABLE relatorios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anamnese_id UUID REFERENCES anamneses(id) ON DELETE CASCADE,
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
  versao INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'gerando', 'concluido', 'falhou')),
  resumo_executivo TEXT,
  classificacao JSONB,
  riscos JSONB,
  fatores_abandono JSONB,
  perfil_comportamental JSONB,
  mapa_construcao_fisica JSONB,
  exercicios_recomendados JSONB,
  exercicios_evitar JSONB,
  protocolo_mobilidade JSONB,
  protocolo_alongamento JSONB,
  aquecimento JSONB,
  divisoes_treino JSONB,
  volume_semanal JSONB,
  periodizacao JSONB,
  scores JSONB,
  plano_retencao JSONB,
  tokens_ia_usados INTEGER,
  gerado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- alertas
CREATE TABLE alertas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
  personal_id UUID REFERENCES personal_trainers(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('cardiovascular', 'ortopedico', 'comportamental', 'inatividade', 'check_in_perdido')),
  criticidade TEXT DEFAULT 'media' CHECK (criticidade IN ('alta', 'media', 'baixa')),
  titulo TEXT NOT NULL,
  descricao TEXT,
  lido BOOLEAN DEFAULT FALSE,
  resolvido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- checkins
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
  semana_referencia DATE,
  energia INTEGER CHECK (energia BETWEEN 1 AND 5),
  sono INTEGER CHECK (sono BETWEEN 1 AND 5),
  treinos_realizados INTEGER DEFAULT 0,
  treinos_esperados INTEGER DEFAULT 0,
  dores_relatadas TEXT,
  humor_geral INTEGER CHECK (humor_geral BETWEEN 1 AND 5),
  comentario_livre TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- observacoes
CREATE TABLE observacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
  personal_id UUID REFERENCES personal_trainers(id) ON DELETE CASCADE,
  conteudo TEXT NOT NULL,
  tipo TEXT DEFAULT 'geral' CHECK (tipo IN ('geral', 'treino', 'comportamental', 'nutricao')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- comunicacoes_log
CREATE TABLE comunicacoes_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
  canal TEXT CHECK (canal IN ('whatsapp', 'email', 'sistema')),
  tipo TEXT CHECK (tipo IN ('boas_vindas', 'lembrete_anamnese', 'checkin', 'motivacional', 'reavaliacao', 'alerta')),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('enviado', 'falhou', 'pendente')),
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_alunos_personal ON alunos(personal_id);
CREATE INDEX idx_alunos_token ON alunos(token_anamnese);
CREATE INDEX idx_anamneses_aluno ON anamneses(aluno_id);
CREATE INDEX idx_relatorios_aluno ON relatorios(aluno_id);
CREATE INDEX idx_alertas_personal ON alertas(personal_id);
CREATE INDEX idx_checkins_aluno ON checkins(aluno_id);

-- RLS
ALTER TABLE personal_trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamneses ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE observacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunicacoes_log ENABLE ROW LEVEL SECURITY;

-- Personal trainers can only see their own data
CREATE POLICY "personal_trainer_own" ON personal_trainers FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "alunos_own" ON alunos FOR ALL
  USING (personal_id IN (SELECT id FROM personal_trainers WHERE user_id = auth.uid()));

CREATE POLICY "anamneses_own" ON anamneses FOR ALL
  USING (aluno_id IN (SELECT id FROM alunos WHERE personal_id IN (SELECT id FROM personal_trainers WHERE user_id = auth.uid())));

CREATE POLICY "relatorios_own" ON relatorios FOR ALL
  USING (aluno_id IN (SELECT id FROM alunos WHERE personal_id IN (SELECT id FROM personal_trainers WHERE user_id = auth.uid())));

CREATE POLICY "alertas_own" ON alertas FOR ALL
  USING (personal_id IN (SELECT id FROM personal_trainers WHERE user_id = auth.uid()));

CREATE POLICY "checkins_read" ON checkins FOR SELECT
  USING (aluno_id IN (SELECT id FROM alunos WHERE personal_id IN (SELECT id FROM personal_trainers WHERE user_id = auth.uid())));

CREATE POLICY "observacoes_own" ON observacoes FOR ALL
  USING (personal_id IN (SELECT id FROM personal_trainers WHERE user_id = auth.uid()));

CREATE POLICY "comunicacoes_own" ON comunicacoes_log FOR ALL
  USING (aluno_id IN (SELECT id FROM alunos WHERE personal_id IN (SELECT id FROM personal_trainers WHERE user_id = auth.uid())));

-- updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_personal_updated BEFORE UPDATE ON personal_trainers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_alunos_updated BEFORE UPDATE ON alunos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
