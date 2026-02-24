import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles,
    AlertCircle, LogIn
} from 'lucide-react';

const LoginPage = () => {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        email: '',
        password: ''
    });

    const [statusMessage, setStatusMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setStatusMessage('Conectando...');

        const maxRetries = 3;
        let attempt = 0;

        while (attempt < maxRetries) {
            attempt++;
            try {
                if (attempt > 1) {
                    setStatusMessage(`Tentativa ${attempt}/${maxRetries} — Acordando o banco de dados...`);
                    await new Promise(r => setTimeout(r, 2000));
                }

                setStatusMessage(attempt > 1 ? 'Reconectando...' : 'Autenticando...');
                await signIn(form.email, form.password);
                navigate('/dashboard');
                return;
            } catch (err) {
                console.error(`Erro de login (tentativa ${attempt}):`, err);
                const msg = (err.message || 'Erro inesperado').toLowerCase();

                if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('timeout') || msg.includes('hibernação')) {
                    if (attempt < maxRetries) {
                        continue;
                    }
                    setError('O banco de dados está acordando. Por favor, aguarde 10 segundos e clique em "Entrar" novamente.');
                }
                else if (msg.includes('invalid login')) {
                    setError('Email ou senha incorretos.');
                } else {
                    setError(err.message || 'Erro ao conectar ao servidor.');
                }
                break;
            }
        }

        setLoading(false);
        setStatusMessage('');
    };

    const inputStyle = {
        width: '100%', padding: '14px 14px 14px 48px', borderRadius: '12px',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        color: 'white', outline: 'none', fontSize: '15px',
        transition: 'border-color 0.2s'
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0a0e1a 0%, #1e1b4b 50%, #0a0e1a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', position: 'relative', overflow: 'hidden'
        }}>
            {/* Decorative orbs */}
            <div style={{
                position: 'absolute', top: '5%', right: '15%', width: '300px', height: '300px',
                background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
                borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute', bottom: '10%', left: '10%', width: '250px', height: '250px',
                background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
                borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none'
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

                {/* Card */}
                <div style={{
                    background: 'rgba(30, 41, 59, 0.7)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.07)',
                    padding: '44px 36px',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                        <div
                            onClick={() => navigate('/')}
                            style={{
                                width: '56px', height: '56px', borderRadius: '16px',
                                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 20px', fontSize: '24px', fontWeight: '900',
                                color: 'white', boxShadow: '0 8px 32px rgba(139,92,246,0.3)',
                                cursor: 'pointer'
                            }}
                        >B</div>
                        <h1
                            onClick={() => navigate('/')}
                            style={{ fontSize: '26px', fontWeight: '700', fontFamily: 'Outfit', marginBottom: '8px', cursor: 'pointer' }}
                        >
                            Bem-vinda, Dra. Mayne
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                            Acesse o painel administrativo da Bloom
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {/* Email */}
                        <div>
                            <label style={{
                                display: 'block', fontSize: '12px', color: '#94a3b8',
                                fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                Email
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{
                                    position: 'absolute', left: '16px', top: '50%',
                                    transform: 'translateY(-50%)', color: '#64748b'
                                }} />
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="seu@email.com"
                                    style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = 'rgba(139,92,246,0.4)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{
                                display: 'block', fontSize: '12px', color: '#94a3b8',
                                fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                Senha
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{
                                    position: 'absolute', left: '16px', top: '50%',
                                    transform: 'translateY(-50%)', color: '#64748b'
                                }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="••••••••"
                                    minLength={6}
                                    style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = 'rgba(139,92,246,0.4)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '14px', top: '50%',
                                        transform: 'translateY(-50%)', background: 'none',
                                        border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={{
                                padding: '12px 16px', borderRadius: '10px',
                                background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.15)',
                                color: '#fb7185', fontSize: '13px',
                                display: 'flex', flexDirection: 'column', gap: '8px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertCircle size={16} /> {error}
                                </div>
                                {error.includes('acordando') && (
                                    <button
                                        type="button"
                                        onClick={() => window.location.reload()}
                                        style={{
                                            background: 'rgba(255,255,255,0.1)', border: 'none',
                                            color: 'white', padding: '6px', borderRadius: '6px',
                                            fontSize: '11px', cursor: 'pointer', marginTop: '4px'
                                        }}
                                    >
                                        Recarregar Página
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '16px', borderRadius: '14px',
                                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                color: 'white', fontWeight: '700', fontSize: '16px',
                                border: 'none', cursor: loading ? 'wait' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                opacity: loading ? 0.6 : 1,
                                boxShadow: '0 4px 20px rgba(139,92,246,0.3)',
                                transition: 'all 0.2s', marginTop: '12px'
                            }}
                        >
                            {loading ? (statusMessage || 'Processando...') : (
                                <>
                                    <LogIn size={18} />
                                    Entrar
                                </>
                            )}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '32px' }}>
                        <p style={{ color: '#475569', fontSize: '12px' }}>
                            Acesso reservado. Dra. Mayne Margadona (CRP 12/29287)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
