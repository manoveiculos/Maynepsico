import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { KeyRound, Heart, Gamepad2, ArrowRight, Sparkles, ArrowLeft } from 'lucide-react';

const PortalLogin = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAccess = async (e) => {
        e.preventDefault();
        const cleanCode = code.trim().toUpperCase();
        if (!cleanCode || cleanCode.length < 4) {
            setError('Digite um código válido.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const access = await dataService.validateAccessCode(cleanCode);

            if (!access) {
                setError('Código inválido ou expirado. Verifique com a psicóloga.');
                return;
            }

            if (!access.patients_psico) {
                setError('Erro: Dados do paciente não encontrados.');
                return;
            }

            if (access.portal_type === 'pais') {
                navigate(`/portal/pais/${access.access_code}`);
            } else {
                navigate(`/portal/aluno/${access.access_code}`);
            }
        } catch (err) {
            console.error('Erro de acesso:', err);
            setError('Erro de sistema: Não foi possível validar o código. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Floating orbs decoration */}
            <div style={{
                position: 'absolute', top: '10%', left: '10%', width: '200px', height: '200px',
                background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
                borderRadius: '50%', filter: 'blur(40px)'
            }} />
            <div style={{
                position: 'absolute', bottom: '20%', right: '15%', width: '300px', height: '300px',
                background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
                borderRadius: '50%', filter: 'blur(60px)'
            }} />

            <div style={{
                width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1
            }}>
                {/* Back to landing */}
                <button onClick={() => navigate('/')} style={{
                    background: 'none', border: 'none', color: '#94a3b8',
                    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                    marginBottom: '24px', fontSize: '13px', padding: '0'
                }}>
                    <ArrowLeft size={16} /> Voltar ao início
                </button>

                <div className="login-card" style={{
                    width: '100%', maxWidth: '440px',
                    background: 'rgba(30, 41, 59, 0.8)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '48px 36px',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                    position: 'relative',
                    zIndex: 1
                }}>
                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div
                            onClick={() => navigate('/')}
                            style={{
                                width: '64px', height: '64px', borderRadius: '20px',
                                background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 20px', fontSize: '28px', fontWeight: '900',
                                color: 'white', boxShadow: '0 8px 32px rgba(139,92,246,0.3)',
                                cursor: 'pointer'
                            }}
                        >B</div>
                        <h1
                            onClick={() => navigate('/')}
                            style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: '700', marginBottom: '8px', cursor: 'pointer' }}
                        >
                            Portal Bloom
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5' }}>
                            Acompanhe a evolução e o progresso no tratamento
                        </p>
                    </div>

                    {/* Access Form */}
                    <form onSubmit={handleAccess}>
                        <label style={{
                            display: 'block', fontSize: '12px', color: '#94a3b8',
                            fontWeight: '600', marginBottom: '10px', textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Código de Acesso
                        </label>
                        <div style={{ position: 'relative', marginBottom: '20px' }}>
                            <KeyRound size={18} style={{
                                position: 'absolute', left: '16px', top: '50%',
                                transform: 'translateY(-50%)', color: '#8b5cf6'
                            }} />
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                                placeholder="Ex: A3B7K2"
                                maxLength={6}
                                style={{
                                    width: '100%', padding: '16px 16px 16px 50px',
                                    borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.04)', color: 'white',
                                    fontSize: '18px', fontWeight: '700', letterSpacing: '6px',
                                    textAlign: 'center', outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'rgba(139,92,246,0.5)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                        </div>

                        {error && (
                            <div style={{
                                padding: '12px 16px', borderRadius: '10px',
                                background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.2)',
                                color: '#fb7185', fontSize: '13px', marginBottom: '16px',
                                textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || code.length < 4}
                            style={{
                                width: '100%', padding: '16px', borderRadius: '14px',
                                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                color: 'white', fontWeight: '700', fontSize: '16px',
                                border: 'none', cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', gap: '10px',
                                opacity: (loading || code.length < 4) ? 0.5 : 1,
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 20px rgba(139,92,246,0.3)'
                            }}
                        >
                            {loading ? 'Verificando...' : 'Acessar Portal'}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    {/* Info Cards */}
                    <div style={{ marginTop: '36px', display: 'flex', gap: '12px' }}>
                        <div style={{
                            flex: 1, padding: '16px', borderRadius: '14px',
                            background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.1)',
                            textAlign: 'center'
                        }}>
                            <Heart size={20} color="#fb7185" style={{ marginBottom: '8px' }} />
                            <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
                                Portal dos Pais
                            </p>
                        </div>
                        <div style={{
                            flex: 1, padding: '16px', borderRadius: '14px',
                            background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.1)',
                            textAlign: 'center'
                        }}>
                            <Gamepad2 size={20} color="#10b981" style={{ marginBottom: '8px' }} />
                            <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
                                Portal do Aluno
                            </p>
                        </div>
                    </div>

                    <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#64748b' }}>
                        Peça o código de acesso para sua psicóloga
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PortalLogin;
