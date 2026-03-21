-- ============================================
-- SUPERTASK — Schema inicial
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Tabela de perfis de usuário (multi-user ready)
-- ============================================
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    TEXT,
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Tabela principal: tasks
-- ============================================
CREATE TABLE tasks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT DEFAULT '',
  notes           TEXT DEFAULT '',

  -- Scores das 10 dimensões (0-10 cada)
  dim_impacto_financeiro    SMALLINT NOT NULL DEFAULT 0 CHECK (dim_impacto_financeiro BETWEEN 0 AND 10),
  dim_alcance               SMALLINT NOT NULL DEFAULT 0 CHECK (dim_alcance BETWEEN 0 AND 10),
  dim_urgencia              SMALLINT NOT NULL DEFAULT 0 CHECK (dim_urgencia BETWEEN 0 AND 10),
  dim_custo_atraso          SMALLINT NOT NULL DEFAULT 0 CHECK (dim_custo_atraso BETWEEN 0 AND 10),
  dim_tempo_execucao        SMALLINT NOT NULL DEFAULT 0 CHECK (dim_tempo_execucao BETWEEN 0 AND 10),
  dim_complexidade          SMALLINT NOT NULL DEFAULT 0 CHECK (dim_complexidade BETWEEN 0 AND 10),
  dim_confianca             SMALLINT NOT NULL DEFAULT 0 CHECK (dim_confianca BETWEEN 0 AND 10),
  dim_autonomia             SMALLINT NOT NULL DEFAULT 0 CHECK (dim_autonomia BETWEEN 0 AND 10),
  dim_alavancagem           SMALLINT NOT NULL DEFAULT 0 CHECK (dim_alavancagem BETWEEN 0 AND 10),
  dim_energia               SMALLINT NOT NULL DEFAULT 0 CHECK (dim_energia BETWEEN 0 AND 10),

  -- Score calculado (soma das dimensões ativas, 0-100)
  priority_score  SMALLINT GENERATED ALWAYS AS (
    dim_impacto_financeiro + dim_alcance + dim_urgencia + dim_custo_atraso +
    dim_tempo_execucao + dim_complexidade + dim_confianca + dim_autonomia +
    dim_alavancagem + dim_energia
  ) STORED,

  -- Alavancas ativas (checkboxes informativas)
  leverages       TEXT[] DEFAULT '{}',

  -- Tags de contexto
  tags            TEXT[] DEFAULT '{}',

  -- Classificação manual
  classification  TEXT NOT NULL DEFAULT 'Backlog',

  -- Status
  status          TEXT NOT NULL DEFAULT 'pendente'
                  CHECK (status IN ('pendente', 'em_andamento', 'concluída', 'cancelada')),

  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  deleted_at      TIMESTAMPTZ  -- Soft delete
);

-- Índices
CREATE INDEX idx_tasks_user ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_classification ON tasks(classification) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_priority ON tasks(priority_score DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_deleted ON tasks(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Tabela de configurações do usuário
-- ============================================
CREATE TABLE user_settings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  setting_key     TEXT NOT NULL,
  setting_value   JSONB NOT NULL,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, setting_key)
);

CREATE INDEX idx_user_settings_user ON user_settings(user_id);

CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Limpeza automática da lixeira (30 dias)
-- ============================================
CREATE OR REPLACE FUNCTION purge_old_trash()
RETURNS void AS $$
BEGIN
  DELETE FROM tasks
  WHERE deleted_at IS NOT NULL
    AND deleted_at < now() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Para pg_cron no Supabase Dashboard:
-- SELECT cron.schedule('purge-trash', '0 3 * * *', 'SELECT purge_old_trash()');

-- ============================================
-- Views
-- ============================================
CREATE VIEW active_tasks AS
  SELECT * FROM tasks
  WHERE deleted_at IS NULL
  ORDER BY priority_score DESC;

CREATE VIEW trash_tasks AS
  SELECT *,
    (30 - EXTRACT(DAY FROM (now() - deleted_at)))::int AS days_remaining
  FROM tasks
  WHERE deleted_at IS NOT NULL
    AND deleted_at > now() - INTERVAL '30 days'
  ORDER BY deleted_at DESC;

-- ============================================
-- Row Level Security (multi-user ready)
-- ============================================
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own profile" ON profiles
  FOR ALL USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');

  -- Insert default settings for new user
  INSERT INTO user_settings (user_id, setting_key, setting_value) VALUES
    (NEW.id, 'tags', '["MedReview", "Pessoal-Saúde", "Pessoal-Família", "Pessoal-Conteúdo", "Pessoal-Obra"]'::jsonb),
    (NEW.id, 'classifications', '["Faz agora", "Agenda", "Delega", "Backlog", "Esperando"]'::jsonb),
    (NEW.id, 'tag_colors', '{
      "MedReview": {"bg": "#FEE2E2", "text": "#991B1B"},
      "Pessoal-Saúde": {"bg": "#F3E8FF", "text": "#581C87"},
      "Pessoal-Família": {"bg": "#FCE7F3", "text": "#831843"},
      "Pessoal-Conteúdo": {"bg": "#FEF3C7", "text": "#78350F"},
      "Pessoal-Obra": {"bg": "#E0E7FF", "text": "#3730A3"}
    }'::jsonb),
    (NEW.id, 'active_dimensions', '["impactoFinanceiro","alcance","urgencia","custoAtraso","tempoExecucao","complexidade","confianca","autonomia","alavancagem","energia"]'::jsonb);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
