-- Birth date filled by the student in the anamnese; age is derived from it.
ALTER TABLE alunos
  ADD COLUMN IF NOT EXISTS data_nascimento DATE;
