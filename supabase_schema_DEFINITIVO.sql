-- ============================================================================
-- 🚀 BLOOM PSICOLOGIA — SCHEMA DEFINITIVO & COMPLETO
-- ============================================================================
-- INSTRUÇÕES: 
-- 1. Copie todo este código.
-- 2. Vá ao seu projeto no Supabase → SQL Editor.
-- 3. Clique em "New Query", cole e clique em "RUN".
--
-- CARACTERÍSTICAS:
-- • Idempotente (pode rodar várias vezes com segurança).
-- • Criação automática de perfis no cadastro.
-- • Pronto para TCC e Avaliação Neuropsicológica.
-- • RLS desabilitado para facilitar o desenvolvimento (MVP).
-- ============================================================================

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. TABELAS CORE
-- ============================================================================

-- PERFIS (Psicólogos)
CREATE TABLE IF NOT EXISTS public.profiles_psico (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  crp TEXT,
  cpf TEXT,
  role TEXT DEFAULT 'psicologo',
  specialty TEXT DEFAULT 'Neuropsicologia & TCC',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- PACIENTES
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
  health_insurance TEXT, -- Particular, Unimed, SC Saúde, etc.
  session_value DECIMAL(10, 2),
  notes TEXT,
  status TEXT DEFAULT 'ativo',
  -- Gamificação (Opcional)
  coins INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  avatar_emoji TEXT DEFAULT '🧒',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- EVOLUÇÕES CLÍNICAS (Prontuário)
CREATE TABLE IF NOT EXISTS public.evolutions_psico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients_psico(id) ON DELETE CASCADE,
  psychologist_id UUID REFERENCES public.profiles_psico(id) ON DELETE CASCADE,
  session_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  content TEXT, -- Notas da sessão
  tags JSONB, -- Tags como ['TCC', 'Lúdico', 'Resistente']
  metrics JSONB, -- Humor, engajamento, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- DOCUMENTOS CLÍNICOS (Contratos, Termos, Anamneses)
CREATE TABLE IF NOT EXISTS public.documents_psico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  psychologist_id UUID REFERENCES public.profiles_psico(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients_psico(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- 'consentimento', 'contrato', 'anamnese', 'questionario'
  content TEXT, -- Conteúdo do documento
  status TEXT DEFAULT 'rascunho', -- 'rascunho', 'assinado', 'arquivado'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- AGENDA / AGENDAMENTOS
CREATE TABLE IF NOT EXISTS public.appointments_psico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  psychologist_id UUID REFERENCES public.profiles_psico(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients_psico(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  session_type TEXT DEFAULT 'individual', -- 'avaliacao', 'tcc', 'individual', 'devolutiva'
  status TEXT DEFAULT 'agendado', -- 'agendado', 'confirmado', 'cancelado', 'realizado'
  location TEXT DEFAULT 'consultório',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- FINANCEIRO (Receitas e Despesas)
CREATE TABLE IF NOT EXISTS public.transactions_psico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  psychologist_id UUID REFERENCES public.profiles_psico(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  category TEXT NOT NULL, -- 'Unimed', 'SC Saúde', 'Particular', 'Aluguel', etc.
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pago',
  payment_method TEXT DEFAULT 'Pix',
  patient_id UUID REFERENCES public.patients_psico(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- DIAGNÓSTICOS / OBSERVAÇÕES
CREATE TABLE IF NOT EXISTS public.diagnostics_psico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients_psico(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  diagnostic_type TEXT DEFAULT 'observacao',
  share_with_parents BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- TAREFAS / MISSÕES (Gamificação)
CREATE TABLE IF NOT EXISTS public.tasks_psico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients_psico(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pendente',
  difficulty TEXT DEFAULT 'normal',
  category TEXT DEFAULT 'diaria',
  coins_reward INTEGER DEFAULT 10,
  xp_reward INTEGER DEFAULT 25,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 3. ÍNDICES DE PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_patients_psychologist ON public.patients_psico(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_evolutions_patient ON public.evolutions_psico(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments_psico(date);
CREATE INDEX IF NOT EXISTS idx_transactions_psychologist ON public.transactions_psico(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_documents_patient ON public.documents_psico(patient_id);

-- ============================================================================
-- 4. AUTOMATIZAÇÃO (Triggers)
-- ============================================================================

-- Criar perfil automaticamente ao cadastrar novo usuário
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 5. SEGURANÇA (RLS - Disabled for MVP)
-- ============================================================================
ALTER TABLE public.profiles_psico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients_psico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolutions_psico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents_psico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments_psico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions_psico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostics_psico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks_psico DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. DADOS DE CONFIGURAÇÃO (Seeds)
-- ============================================================================
-- Nota: Conquistas globais removidas deste script para manter foco clínico 
-- total, mas mantive os campos na tabela patients caso queira usar depois.

-- ✅ SCRIPT CONCLUÍDO COM SUCESSO.
