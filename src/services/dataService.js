import { supabase } from '../lib/supabase';

// Utilitário para tempo limite (timeout) amigável com o Supabase Grátis
const withTimeout = (promise, ms = 45000) => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            const err = new Error('O banco de dados está demorando muito para responder (Hibernação)');
            err.name = 'TimeoutError';
            reject(err);
        }, ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

// Utilitário global de retentativa
export const withRetry = async (fn, retries = 3, delay = 2000) => {
    let attempt = 0;

    const execute = async () => {
        attempt++;
        try {
            // A primeira tentativa espera mais (45s), as seguintes esperam 30s
            const timeout = attempt === 1 ? 45000 : 30000;
            return await withTimeout(fn(), timeout);
        } catch (err) {
            const isTimeout = err.name === 'TimeoutError' || err.message?.includes('timeout');
            const isNetwork = !err.status || err.message?.includes('Fetch') || err.message?.includes('network');

            if (retries > 0 && (isTimeout || isNetwork)) {
                console.warn(`[Supabase] Tentativa ${attempt} falhou. Motivo: ${err.message}. Tentando novamente em ${delay}ms...`);
                await new Promise(r => setTimeout(r, delay));
                retries--;
                delay *= 1.5; // Backoff exponencial suave
                return execute();
            }
            throw err;
        }
    };

    return execute();
};

export const dataService = {
    // =============================================
    // SISTEMA / SAÚDE
    // =============================================
    async checkConnection() {
        return withRetry(async () => {
            const { error } = await supabase.from('profiles_psico').select('id').limit(1);
            if (error) throw error;
            return { ok: true };
        });
    },

    // =============================================
    // PACIENTES
    // =============================================
    async getPatients(psychologistId = null) {
        return withRetry(async () => {
            let query = supabase
                .from('patients_psico')
                .select('*')
                .order('created_at', { ascending: false });

            if (psychologistId) {
                query = query.eq('psychologist_id', psychologistId);
            }

            const { data, error } = await query;

            if (error) {
                console.error("Erro ao buscar pacientes:", error);
                throw error;
            }
            return data || [];
        });
    },

    async getPatientById(id) {
        return withRetry(async () => {
            const { data, error } = await supabase
                .from('patients_psico')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        });
    },

    async createPatient(patient) {
        const cleanData = {
            name: patient.name,
            psychologist_id: patient.psychologist_id,
            birth_date: patient.birth_date || null,
            gender: patient.gender || null,
            cpf: patient.cpf || null,
            responsible_name: patient.responsible_name || null,
            responsible_phone: patient.responsible_phone || null,
            responsible_email: patient.responsible_email || null,
            responsible_relationship: patient.responsible_relationship || null,
            school_name: patient.school_name || null,
            school_grade: patient.school_grade || null,
            referral_source: patient.referral_source || null,
            main_complaint: patient.main_complaint || null,
            diagnosis: patient.diagnosis || null,
            medications: patient.medications || null,
            session_frequency: patient.session_frequency || 'semanal',
            session_day: patient.session_day || null,
            session_time: patient.session_time || null,
            health_insurance: patient.health_insurance || null,
            session_value: patient.session_value ? Number(patient.session_value) : null,
            notes: patient.notes || null,
            status: 'ativo'
        };

        const { data, error } = await supabase
            .from('patients_psico')
            .insert([cleanData])
            .select();

        if (error) {
            console.error("Erro ao inserir paciente:", error);
            throw error;
        }
        return data[0];
    },

    async updatePatientCoins(patientId, coins, xp) {
        return withRetry(async () => {
            const patient = await this.getPatientById(patientId);
            const newCoins = (patient.coins || 0) + coins;
            const newXp = (patient.xp || 0) + xp;
            const newLevel = Math.floor(newXp / 100) + 1;

            const { data, error } = await supabase
                .from('patients_psico')
                .update({ coins: newCoins, xp: newXp, level: newLevel })
                .eq('id', patientId)
                .select();

            if (error) throw error;
            return data[0];
        });
    },

    // =============================================
    // EVOLUÇÕES
    // =============================================
    async getEvolutions(patientId) {
        return withRetry(async () => {
            const { data, error } = await supabase
                .from('evolutions_psico')
                .select('*')
                .eq('patient_id', patientId)
                .order('session_date', { ascending: false });

            if (error) throw error;
            return data;
        });
    },

    async createEvolution(evolution) {
        const { data, error } = await supabase
            .from('evolutions_psico')
            .insert([evolution])
            .select();

        if (error) throw error;
        return data[0];
    },

    // =============================================
    // DIAGNÓSTICOS
    // =============================================
    async getDiagnostics(patientId, parentsOnly = false) {
        return withRetry(async () => {
            let query = supabase
                .from('diagnostics_psico')
                .select('*')
                .eq('patient_id', patientId)
                .order('created_at', { ascending: false });

            if (parentsOnly) {
                query = query.eq('share_with_parents', true);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        });
    },

    async createDiagnostic(diagnostic) {
        const { data, error } = await supabase
            .from('diagnostics_psico')
            .insert([diagnostic])
            .select();

        if (error) throw error;
        return data[0];
    },

    // =============================================
    // TAREFAS / MISSÕES
    // =============================================
    async getTasks(patientId) {
        return withRetry(async () => {
            const { data, error } = await supabase
                .from('tasks_psico')
                .select('*')
                .eq('patient_id', patientId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        });
    },

    async createTask(task) {
        const { data, error } = await supabase
            .from('tasks_psico')
            .insert([task])
            .select();

        if (error) throw error;
        return data[0];
    },

    async completeTask(taskId, patientId) {
        return withRetry(async () => {
            // 1. Marca tarefa como concluída
            const { data: task, error } = await supabase
                .from('tasks_psico')
                .update({ status: 'concluida', completed_at: new Date().toISOString() })
                .eq('id', taskId)
                .select()
                .single();

            if (error) throw error;

            // 2. Atualiza moedas e XP do paciente
            const coinsReward = task.coins_reward || 10;
            const xpReward = task.xp_reward || 25;
            await this.updatePatientCoins(patientId, coinsReward, xpReward);

            return task;
        });
    },

    // =============================================
    // CONQUISTAS
    // =============================================
    async getAchievements() {
        return withRetry(async () => {
            const { data, error } = await supabase
                .from('achievements_psico')
                .select('*')
                .order('requirement_value', { ascending: true });

            if (error) throw error;
            return data || [];
        });
    },

    async getPatientAchievements(patientId) {
        const { data, error } = await supabase
            .from('patient_achievements_psico')
            .select('*, achievements_psico(*)')
            .eq('patient_id', patientId)
            .order('unlocked_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async unlockAchievement(patientId, achievementId) {
        const { data, error } = await supabase
            .from('patient_achievements_psico')
            .insert([{ patient_id: patientId, achievement_id: achievementId }])
            .select();

        if (error) {
            if (error.code === '23505') return null; // Already unlocked
            throw error;
        }
        return data[0];
    },

    // =============================================
    // PORTAL ACCESS
    // =============================================
    async generateAccessCode(patientId, portalType) {
        return withRetry(async () => {
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();

            const { data, error } = await supabase
                .from('portal_access_psico')
                .insert([{ patient_id: patientId, portal_type: portalType, access_code: code }])
                .select();

            if (error) {
                console.error("Erro ao gerar código de acesso:", error);
                throw error;
            }
            return data[0];
        });
    },

    async getAccessCodes(patientId) {
        return withRetry(async () => {
            const { data, error } = await supabase
                .from('portal_access_psico')
                .select('*')
                .eq('patient_id', patientId)
                .eq('is_active', true);

            if (error) {
                console.error("Erro ao buscar códigos de acesso:", error);
                throw error;
            }
            return data || [];
        });
    },

    async validateAccessCode(code) {
        return withRetry(async () => {
            console.log("Validando código:", code);
            const { data, error } = await supabase
                .from('portal_access_psico')
                .select('*, patients_psico(*, profiles_psico(*))')
                .eq('access_code', code.toUpperCase())
                .eq('is_active', true)
                .single();

            if (error) {
                console.warn("Validação de código falhou ou código inexistente:", error.message);
                return null;
            }
            return data;
        });
    },

    // =============================================
    // AGENDA / APPOINTMENTS
    // =============================================
    async getAppointments(dateFrom, dateTo, psychologistId = null) {
        return withRetry(async () => {
            let query = supabase
                .from('appointments_psico')
                .select('*')
                .order('date', { ascending: true })
                .order('start_time', { ascending: true });

            if (dateFrom) query = query.gte('date', dateFrom);
            if (dateTo) query = query.lte('date', dateTo);
            if (psychologistId) query = query.eq('psychologist_id', psychologistId);

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        });
    },

    async createAppointment(appointment) {
        const { data, error } = await supabase
            .from('appointments_psico')
            .insert([appointment])
            .select();

        if (error) throw error;
        return data[0];
    },

    async updateAppointment(id, updates) {
        const { data, error } = await supabase
            .from('appointments_psico')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        return data[0];
    },

    async deleteAppointment(id) {
        const { error } = await supabase
            .from('appointments_psico')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // =============================================
    // FINANCEIRO / TRANSACTIONS
    // =============================================
    async getTransactions(psychologistId = null) {
        return withRetry(async () => {
            let query = supabase
                .from('transactions_psico')
                .select('*')
                .order('date', { ascending: false });

            if (psychologistId) query = query.eq('psychologist_id', psychologistId);

            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        });
    },

    async createTransaction(transaction) {
        const { data, error } = await supabase
            .from('transactions_psico')
            .insert([transaction])
            .select();

        if (error) throw error;
        return data[0];
    },

    async deleteTransaction(id) {
        const { error } = await supabase
            .from('transactions_psico')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // =============================================
    // IA - GERAÇÃO DE EVOLUÇÃO
    // =============================================
    async generateSmartEvolution(tags, context) {
        const prompt = `Tags: ${tags.join(', ')}. Contexto: ${context}`;
        console.log("Processando IA Bloom...", prompt);

        const rascunhos = [
            "O paciente demonstrou excelente engajamento nas atividades propostas. Através das técnicas lúdicas de mediação, observou-se evolução na regulação emocional e maior tempo de foco atencional.",
            "Durante a sessão, o paciente apresentou resistência inicial, mas após o estabelecimento do vínculo terapêutico, engajou-se no jogo simbólico, demonstrando melhora na comunicação verbal.",
            "Observou-se um avanço significativo na autonomia do paciente. As intervenções focadas em coordenação motora e interação social têm mostrado resultados consistentes no ambiente clínico."
        ];

        return rascunhos[Math.floor(Math.random() * rascunhos.length)];
    }
};
