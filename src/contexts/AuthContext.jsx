import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { withRetry } from '../services/dataService';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Inicialização Silenciosa e Resiliente
        const init = async () => {
            try {
                // Tenta buscar a sessão rapidamente
                const sessionResponse = await supabase.auth.getSession().catch(e => {
                    console.warn('Falha rápida ao buscar sessão:', e);
                    return { data: { session: null } };
                });

                const session = sessionResponse.data?.session;

                if (session?.user) {
                    setUser(session.user);
                    // Não aguardamos o perfil para liberar o loading inicial
                    fetchProfile(session.user.id);
                }
            } catch (err) {
                console.error('Erro crítico na inicialização do Auth:', err);
            } finally {
                setLoading(false);
            }
        };
        init();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Evento Auth:', event);
                setUser(session?.user ?? null);

                if (session?.user) {
                    fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }

                if (event === 'SIGNED_OUT') {
                    localStorage.removeItem('bloom-auth-token');
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId) => {
        if (!userId) return;
        try {
            const data = await withRetry(async () => {
                const { data, error } = await supabase
                    .from('profiles_psico')
                    .select('*')
                    .eq('id', userId)
                    .single();

                // Se o erro for "não encontrado" (PGRST116), não retentamos (erro de lógica, não de rede)
                if (error) {
                    if (error.code === 'PGRST116') {
                        console.warn('Perfil ainda não criado para o usuário:', userId);
                        return null;
                    }
                    throw error;
                }
                return data;
            }, 3, 2000);

            if (data) setProfile(data);
        } catch (err) {
            console.error('Falha definitiva ao buscar perfil após retentativas:', err);
        }
    };

    const signIn = async (email, password) => {
        const result = await withRetry(async () => {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;
            return data;
        });
        return result;
    };

    const signUp = async (email, password, fullName) => {
        const data = await withRetry(async () => {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName } }
            });
            if (error) throw error;
            return data;
        });

        if (data?.user) {
            // Tenta criar o perfil, mas não trava se falhar (pode ser criado depois)
            try {
                await withRetry(async () => {
                    const { error } = await supabase
                        .from('profiles_psico')
                        .insert([{ id: data.user.id, full_name: fullName }]);
                    if (error) throw error;
                });
            } catch (err) {
                console.error('Erro ao criar registro de perfil:', err);
            }
        }
        return data;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    };

    const value = {
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
