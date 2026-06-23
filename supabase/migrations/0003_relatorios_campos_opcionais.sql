ALTER TABLE relatorios
  ADD COLUMN IF NOT EXISTS performance_esportiva JSONB,
  ADD COLUMN IF NOT EXISTS analise_postural JSONB,
  ADD COLUMN IF NOT EXISTS evolucao_aluno JSONB;
