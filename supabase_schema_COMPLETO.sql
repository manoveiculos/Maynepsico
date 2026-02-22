-- ============================================================================
-- SQL COMPLETO - BLOOM PSICOLOGIA
-- INSTRUÇÕES: Copie tudo e cole no SQL Editor do Supabase e clique em "RUN"
-- Última atualização: 22/02/2026
-- ============================================================================
-- IMPORTANTE: Este script é idempotente (pode rodar quantas vezes quiser).
-- Ele usa CREATE TABLE IF NOT EXISTS e ADD COLUMN IF NOT EXISTS para evitar erros.
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

-- Índice para busca por psicólogo (performance)
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

-- Índice para busca por paciente
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

-- Índice para busca por paciente
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

-- Índice para validação de código (usado no login dos portais)
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

-- Índice para busca por paciente
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

-- Índices de performance para agenda
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

-- Índices de performance para financeiro
CREATE INDEX IF NOT EXISTS idx_transactions_psychologist
  ON public.transactions_psico(psychologist_id);

CREATE INDEX IF NOT EXISTS idx_transactions_date
  ON public.transactions_psico(date);


-- ============================================================================
-- DADOS INICIAIS (SEEDS) - Conquistas padrão do sistema
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
-- SEGURANÇA (MVP - RLS desabilitado para testes rápidos)
-- Em produção, habilitar RLS e criar policies filtrando por psychologist_id
-- ============================================================================

ALTER TABLE public.profiles_psico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients_psico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolutions_psico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks_psico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_access_psico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostics_psico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements_psico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_achievements_psico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments_psico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions_psico DISABLE ROW LEVEL SECURITY;


-- ============================================================================
-- MIGRAÇÃO (rode se as tabelas já existiam antes desta atualização)
-- Estes comandos são seguros: IF NOT EXISTS evita erros se as colunas já existem
-- ============================================================================

-- Colunas de gamificação no paciente (se a tabela antiga não tinha)
ALTER TABLE public.patients_psico
  ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS avatar_emoji TEXT DEFAULT '🧒';

-- Colunas do cadastro expandido do paciente
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

-- Colunas de recompensa nas tarefas (se a tabela antiga não tinha)
ALTER TABLE public.tasks_psico
  ADD COLUMN IF NOT EXISTS coins_reward INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 25,
  ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'diaria',
  ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '⭐';

-- Colunas de perfil (se não existiam)
ALTER TABLE public.profiles_psico
  ADD COLUMN IF NOT EXISTS cpf TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'psicologo';


-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
-- Tabelas criadas (10 no total):
--   1.  profiles_psico          → Perfis de psicólogos (auth + metadata)
--   2.  patients_psico          → Pacientes (com coins, xp, level, avatar)
--   3.  evolutions_psico        → Evoluções clínicas (prontuário)
--   4.  tasks_psico             → Missões gamificadas (com rewards)
--   5.  portal_access_psico     → Códigos de acesso aos portais
--   6.  diagnostics_psico       → Diagnósticos/laudos
--   7.  achievements_psico      → Definições de conquistas
--   8.  patient_achievements    → Conquistas desbloqueadas por paciente
--   9.  appointments_psico      → Agendamentos de sessões
--   10. transactions_psico      → Transações financeiras (receitas/despesas)
-- ============================================================================
