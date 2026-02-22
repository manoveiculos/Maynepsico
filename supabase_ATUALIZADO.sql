-- ============================================================================
-- SQL ATUALIZADO - BLOOM PSICOLOGIA (PRODUÇÃO)
-- INSTRUÇÕES: Copie TUDO e cole no SQL Editor do Supabase → clique em "RUN"
-- Última atualização: 22/02/2026
-- ============================================================================
-- SEGURO: Pode rodar quantas vezes quiser (idempotente).
-- Usa CREATE TABLE IF NOT EXISTS e ADD COLUMN IF NOT EXISTS.
-- ============================================================================


-- ============================================================================
-- 1. PERFIS DOS PSICÓLOGOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles_psico (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  crp TEXT,
  cpf TEXT,
  role TEXT DEFAULT 'psicologo',
  specialty TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);


-- ============================================================================
-- 2. PACIENTES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.patients_psico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  psychologist_id UUID REFERENCES public.profiles_psico(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE,
  gender TEXT,
  cpf TEXT,
  responsible_name TEXT,
  responsible_phone TEXT,
  responsible_email TEXT,
  responsible_relationship TEXT DEFAULT 'mãe',
  school_name TEXT,
  school_grade TEXT,
  referral_source TEXT,
  main_complaint TEXT,
  diagnosis TEXT,
  medications TEXT,
  session_frequency TEXT DEFAULT 'semanal',
  session_day TEXT,
  session_time TEXT,
  health_insurance TEXT,
  session_value DECIMAL(10, 2),
  notes TEXT,
  status TEXT DEFAULT 'ativo',
  coins INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  avatar_emoji TEXT DEFAULT '🧒',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_patients_psychologist
  ON public.patients_psico(psychologist_id);


-- ============================================================================
-- 3. EVOLUÇÕES CLÍNICAS (PRONTUÁRIO)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.evolutions_psico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients_psico(id) ON DELETE CASCADE,
  psychologist_id UUID REFERENCES public.profiles_psico(id) ON DELETE CASCADE,
  session_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  content TEXT,
  tags JSONB,
  metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_evolutions_patient
  ON public.evolutions_psico(patient_id);


-- ============================================================================
-- 4. TAREFAS / MISSÕES GAMIFICADAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tasks_psico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients_psico(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_audience TEXT,
  status TEXT DEFAULT 'pendente',
  difficulty TEXT DEFAULT 'normal',
  category TEXT DEFAULT 'diaria',
  emoji TEXT DEFAULT '⭐',
  coins_reward INTEGER DEFAULT 10,
  xp_reward INTEGER DEFAULT 25,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_tasks_patient
  ON public.tasks_psico(patient_id);


-- ============================================================================
-- 5. CÓDIGOS DE ACESSO AOS PORTAIS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.portal_access_psico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients_psico(id) ON DELETE CASCADE,
  portal_type TEXT NOT NULL CHECK (portal_type IN ('pais', 'aluno')),
  access_code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_portal_access_code
  ON public.portal_access_psico(access_code);


-- ============================================================================
-- 6. DIAGNÓSTICOS / LAUDOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.diagnostics_psico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients_psico(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  diagnostic_type TEXT DEFAULT 'observacao',
  share_with_parents BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_diagnostics_patient
  ON public.diagnostics_psico(patient_id);


-- ============================================================================
-- 7. CONQUISTAS (definições globais)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.achievements_psico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '🏆',
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER DEFAULT 1,
  coins_bonus INTEGER DEFAULT 50,
  xp_bonus INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);


-- ============================================================================
-- 8. CONQUISTAS DESBLOQUEADAS POR PACIENTE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.patient_achievements_psico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients_psico(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES public.achievements_psico(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(patient_id, achievement_id)
);


-- ============================================================================
-- 9. AGENDA / AGENDAMENTOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.appointments_psico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  psychologist_id UUID REFERENCES public.profiles_psico(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients_psico(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  session_type TEXT DEFAULT 'individual',
  status TEXT DEFAULT 'agendado',
  location TEXT DEFAULT 'consultório',
  notes TEXT,
  recurrence TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_appointments_date
  ON public.appointments_psico(date);

CREATE INDEX IF NOT EXISTS idx_appointments_patient
  ON public.appointments_psico(patient_id);

CREATE INDEX IF NOT EXISTS idx_appointments_psychologist
  ON public.appointments_psico(psychologist_id);


-- ============================================================================
-- 10. FINANCEIRO / TRANSAÇÕES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.transactions_psico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  psychologist_id UUID REFERENCES public.profiles_psico(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  category TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pago',
  payment_method TEXT DEFAULT 'Pix',
  patient_id UUID REFERENCES public.patients_psico(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_transactions_psychologist
  ON public.transactions_psico(psychologist_id);

CREATE INDEX IF NOT EXISTS idx_transactions_date
  ON public.transactions_psico(date);


-- ============================================================================
-- MIGRAÇÃO SEGURA (para quem já tem tabelas antigas)
-- ============================================================================

-- Colunas de gamificação no paciente
ALTER TABLE public.patients_psico
  ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS avatar_emoji TEXT DEFAULT '🧒';

-- Colunas de cadastro expandido
ALTER TABLE public.patients_psico
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS cpf TEXT,
  ADD COLUMN IF NOT EXISTS responsible_email TEXT,
  ADD COLUMN IF NOT EXISTS responsible_relationship TEXT DEFAULT 'mãe',
  ADD COLUMN IF NOT EXISTS school_name TEXT,
  ADD COLUMN IF NOT EXISTS school_grade TEXT,
  ADD COLUMN IF NOT EXISTS referral_source TEXT,
  ADD COLUMN IF NOT EXISTS main_complaint TEXT,
  ADD COLUMN IF NOT EXISTS diagnosis TEXT,
  ADD COLUMN IF NOT EXISTS medications TEXT,
  ADD COLUMN IF NOT EXISTS session_frequency TEXT DEFAULT 'semanal',
  ADD COLUMN IF NOT EXISTS session_day TEXT,
  ADD COLUMN IF NOT EXISTS session_time TEXT,
  ADD COLUMN IF NOT EXISTS health_insurance TEXT,
  ADD COLUMN IF NOT EXISTS session_value DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Colunas de recompensas nas tarefas
ALTER TABLE public.tasks_psico
  ADD COLUMN IF NOT EXISTS coins_reward INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 25,
  ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'diaria',
  ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '⭐';

-- Colunas de perfil
ALTER TABLE public.profiles_psico
  ADD COLUMN IF NOT EXISTS cpf TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'psicologo';


-- ============================================================================
-- TRIGGER: CRIAR PERFIL AUTOMÁTICO AO CADASTRAR
-- ============================================================================
-- Quando um novo usuário faz cadastro, o perfil é criado automaticamente.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles_psico (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'psicologo'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove trigger antigo se existir e recria
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- DADOS INICIAIS (SEEDS) - Conquistas
-- ============================================================================
INSERT INTO public.achievements_psico (title, description, emoji, requirement_type, requirement_value, coins_bonus, xp_bonus) VALUES
('Primeira Missão', 'Complete sua primeira tarefa!', '🌟', 'tasks_completed', 1, 20, 50),
('Explorador', 'Complete 5 tarefas', '🗺️', 'tasks_completed', 5, 50, 100),
('Guerreiro', 'Complete 10 tarefas', '⚔️', 'tasks_completed', 10, 100, 200),
('Mestre', 'Complete 25 tarefas', '👑', 'tasks_completed', 25, 250, 500),
('Lenda', 'Complete 50 tarefas', '🐉', 'tasks_completed', 50, 500, 1000),
('Sequência de 3', '3 tarefas seguidas sem falhar', '🔥', 'streak', 3, 30, 75),
('Sequência de 7', '7 tarefas seguidas sem falhar', '💎', 'streak', 7, 100, 200),
('Nível 5', 'Alcance o nível 5', '🚀', 'level', 5, 100, 250),
('Nível 10', 'Alcance o nível 10', '⚡', 'level', 10, 250, 500),
('Colecionador', 'Acumule 500 moedas', '💰', 'coins', 500, 200, 300)
ON CONFLICT DO NOTHING;


-- ============================================================================
-- SEGURANÇA (RLS) - Row Level Security para PRODUÇÃO
-- ============================================================================
-- Cada psicólogo só vê os próprios dados.

-- 1. Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles_psico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients_psico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolutions_psico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks_psico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_access_psico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostics_psico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements_psico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_achievements_psico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments_psico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions_psico ENABLE ROW LEVEL SECURITY;

-- 2. Policies para PROFILES
DROP POLICY IF EXISTS "Usuarios veem proprio perfil" ON public.profiles_psico;
CREATE POLICY "Usuarios veem proprio perfil" ON public.profiles_psico
  FOR ALL USING (auth.uid() = id);

-- 3. Policies para PATIENTS (psicólogo vê apenas seus pacientes)
DROP POLICY IF EXISTS "Psicologo gerencia seus pacientes" ON public.patients_psico;
CREATE POLICY "Psicologo gerencia seus pacientes" ON public.patients_psico
  FOR ALL USING (psychologist_id = auth.uid());

-- Portal: acesso anônimo para leitura de pacientes (necessário para portais)
DROP POLICY IF EXISTS "Portal le pacientes" ON public.patients_psico;
CREATE POLICY "Portal le pacientes" ON public.patients_psico
  FOR SELECT USING (true);

-- 4. Policies para EVOLUÇÕES
DROP POLICY IF EXISTS "Psicologo gerencia evolucoes" ON public.evolutions_psico;
CREATE POLICY "Psicologo gerencia evolucoes" ON public.evolutions_psico
  FOR ALL USING (psychologist_id = auth.uid());

-- Portal: acesso de leitura para evoluções
DROP POLICY IF EXISTS "Portal le evolucoes" ON public.evolutions_psico;
CREATE POLICY "Portal le evolucoes" ON public.evolutions_psico
  FOR SELECT USING (true);

-- 5. Policies para TAREFAS
DROP POLICY IF EXISTS "Todos acessam tarefas" ON public.tasks_psico;
CREATE POLICY "Todos acessam tarefas" ON public.tasks_psico
  FOR ALL USING (true);

-- 6. Policies para PORTAL ACCESS
DROP POLICY IF EXISTS "Todos acessam portal codes" ON public.portal_access_psico;
CREATE POLICY "Todos acessam portal codes" ON public.portal_access_psico
  FOR ALL USING (true);

-- 7. Policies para DIAGNÓSTICOS
DROP POLICY IF EXISTS "Todos acessam diagnosticos" ON public.diagnostics_psico;
CREATE POLICY "Todos acessam diagnosticos" ON public.diagnostics_psico
  FOR ALL USING (true);

-- 8. Policies para CONQUISTAS (globais - todos podem ler)
DROP POLICY IF EXISTS "Todos leem conquistas" ON public.achievements_psico;
CREATE POLICY "Todos leem conquistas" ON public.achievements_psico
  FOR SELECT USING (true);

-- 9. Policies para CONQUISTAS DE PACIENTES
DROP POLICY IF EXISTS "Todos acessam conquistas pacientes" ON public.patient_achievements_psico;
CREATE POLICY "Todos acessam conquistas pacientes" ON public.patient_achievements_psico
  FOR ALL USING (true);

-- 10. Policies para AGENDAMENTOS
DROP POLICY IF EXISTS "Psicologo gerencia agenda" ON public.appointments_psico;
CREATE POLICY "Psicologo gerencia agenda" ON public.appointments_psico
  FOR ALL USING (psychologist_id = auth.uid());

-- 11. Policies para FINANCEIRO
DROP POLICY IF EXISTS "Psicologo gerencia financeiro" ON public.transactions_psico;
CREATE POLICY "Psicologo gerencia financeiro" ON public.transactions_psico
  FOR ALL USING (psychologist_id = auth.uid());


-- ============================================================================
-- FIM DO SCRIPT ATUALIZADO
-- ============================================================================
-- Tabelas (10):
--   1.  profiles_psico          → Perfis de psicólogos
--   2.  patients_psico          → Pacientes (gamificação inclusa)
--   3.  evolutions_psico        → Evoluções clínicas
--   4.  tasks_psico             → Missões gamificadas
--   5.  portal_access_psico     → Códigos de acesso portais
--   6.  diagnostics_psico       → Diagnósticos/laudos
--   7.  achievements_psico      → Definições de conquistas
--   8.  patient_achievements    → Conquistas desbloqueadas
--   9.  appointments_psico      → Agendamentos
--   10. transactions_psico      → Financeiro
--
-- Segurança: RLS habilitado com policies por psicólogo
-- Trigger: Perfil criado automaticamente no cadastro
-- ============================================================================
