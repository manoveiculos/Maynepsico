-- ========================================================
-- SCRIPT SQL - PORTAIS (PAIS + ALUNOS)
-- Cole após o schema principal no SQL Editor do Supabase
-- ========================================================

-- 1. CÓDIGOS DE ACESSO AOS PORTAIS
CREATE TABLE IF NOT EXISTS public.portal_access_psico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients_psico(id) ON DELETE CASCADE,
  portal_type TEXT NOT NULL CHECK (portal_type IN ('pais', 'aluno')),
  access_code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. DIAGNÓSTICOS / LAUDOS COMPARTILHADOS (visíveis no portal dos pais)
CREATE TABLE IF NOT EXISTS public.diagnostics_psico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients_psico(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  diagnostic_type TEXT DEFAULT 'observacao',
  share_with_parents BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. MOEDAS E XP DO ALUNO
ALTER TABLE public.patients_psico
  ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS avatar_emoji TEXT DEFAULT '🧒';

-- 4. MISSÕES/TAREFAS GAMIFICADAS (complementa tasks_psico)
ALTER TABLE public.tasks_psico
  ADD COLUMN IF NOT EXISTS coins_reward INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 25,
  ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'diaria',
  ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '⭐';

-- 5. CONQUISTAS / ACHIEVEMENTS
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

-- 6. CONQUISTAS DO PACIENTE (relação N:N)
CREATE TABLE IF NOT EXISTS public.patient_achievements_psico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients_psico(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES public.achievements_psico(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(patient_id, achievement_id)
);

-- 7. CONQUISTAS INICIAIS (SEEDS)
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

-- SEGURANÇA (MVP - desabilitado)
ALTER TABLE public.portal_access_psico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostics_psico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements_psico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_achievements_psico DISABLE ROW LEVEL SECURITY;
