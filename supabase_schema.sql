-- ========================================================
-- SCRIPT SQL ATUALIZADO - PROJETO BLOOM (PSICOLOGIA)
-- INSTRUÇÕES: Copie e cole no SQL Editor do seu Supabase
-- e clique em "RUN".
-- ========================================================

-- 1. LIMPEZA (OPCIONAL - Remova os '--' se quiser recriar do zero)
-- DROP TABLE IF EXISTS public.tasks_psico;
-- DROP TABLE IF EXISTS public.evolutions_psico;
-- DROP TABLE IF EXISTS public.patients_psico;
-- DROP TABLE IF EXISTS public.profiles_psico;

-- 2. TABELA DE PERFIS (PSICÓLOGOS)
CREATE TABLE IF NOT EXISTS public.profiles_psico (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  crp TEXT,
  specialty TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. TABELA DE PACIENTES (Ajustada para a Fase de Validação)
CREATE TABLE IF NOT EXISTS public.patients_psico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  psychologist_id UUID REFERENCES public.profiles_psico(id) ON DELETE CASCADE NULL, -- NULL para testes iniciais
  name TEXT NOT NULL,
  birth_date DATE,
  responsible_name TEXT,
  responsible_phone TEXT,
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. TABELA DE EVOLUÇÕES (PRONTUÁRIO)
CREATE TABLE IF NOT EXISTS public.evolutions_psico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients_psico(id) ON DELETE CASCADE,
  psychologist_id UUID REFERENCES public.profiles_psico(id) ON DELETE CASCADE NULL, -- NULL para testes iniciais
  session_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  content TEXT,
  tags JSONB,
  metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. TABELA DE TAREFAS/MISSÕES
CREATE TABLE IF NOT EXISTS public.tasks_psico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients_psico(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_audience TEXT,
  status TEXT DEFAULT 'pendente',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ========================================================
-- CONFIGURAÇÕES DE SEGURANÇA (ESTRATÉGIA DE VALIDAÇÃO MVP)
-- ========================================================

-- Desabilitamos o RLS temporariamente para você conseguir cadastrar 
-- e testar tudo sem precisar logar agora. Isso acelera sua validação!
ALTER TABLE public.profiles_psico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients_psico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolutions_psico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks_psico DISABLE ROW LEVEL SECURITY;

-- No futuro, para produção, rodaremos:
-- ALTER TABLE public.patients_psico ENABLE ROW LEVEL SECURITY;
