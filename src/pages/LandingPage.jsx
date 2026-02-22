import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Brain, Heart, Shield, Sparkles, Users, Calendar,
    ChevronRight, Star, Gamepad2, FileText, ArrowRight,
    CheckCircle, Zap, TrendingUp, Lock
} from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: <Brain size={28} />,
            title: 'IA Assistente',
            description: 'Gere evoluções clínicas automáticas com inteligência artificial treinada para psicologia infantil.',
            color: '#8b5cf6'
        },
        {
            icon: <Gamepad2 size={28} />,
            title: 'Portal do Aluno',
            description: 'Gamificação com missões, moedas e conquistas que engajam crianças e adolescentes no tratamento.',
            color: '#10b981'
        },
        {
            icon: <Heart size={28} />,
            title: 'Portal dos Pais',
            description: 'Pais acompanham evoluções, relatórios e diagnósticos compartilhados pela psicóloga.',
            color: '#fb7185'
        },
        {
            icon: <Calendar size={28} />,
            title: 'Agenda Inteligente',
            description: 'Gerencie sessões com calendário visual, tipos de atendimento e status de confirmação.',
            color: '#3b82f6'
        },
        {
            icon: <Shield size={28} />,
            title: 'LGPD Compliance',
            description: 'Dados protegidos com criptografia e controle de acesso por código individual.',
            color: '#f59e0b'
        },
        {
            icon: <FileText size={28} />,
            title: 'Prontuário Digital',
            description: 'Evoluções, diagnósticos e laudos organizados cronologicamente por paciente.',
            color: '#06b6d4'
        }
    ];

    const stats = [
        { value: '100%', label: 'Digital' },
        { value: 'LGPD', label: 'Conforme' },
        { value: 'IA', label: 'Integrada' },
        { value: '24/7', label: 'Disponível' },
    ];

    return (
        <div style={{
            minHeight: '100vh', background: '#0a0e1a', color: '#f8fafc',
            fontFamily: "'Outfit', 'Inter', sans-serif", overflow: 'hidden'
        }}>
            {/* ==================== NAVBAR ==================== */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                padding: '16px 24px',
                background: scrolled ? 'rgba(10,14,26,0.9)' : 'transparent',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
                transition: 'all 0.3s ease'
            }}>
                <div style={{
                    maxWidth: '1200px', margin: '0 auto',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '18px', fontWeight: '900', color: 'white'
                        }}>B</div>
                        <span style={{ fontSize: '22px', fontWeight: '800' }}>Bloom</span>
                    </div>

                    <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                        <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Recursos</a>
                        <a href="#portals" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Portais</a>
                        <button onClick={() => navigate('/login')} style={{
                            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            border: 'none', padding: '10px 24px', borderRadius: '10px',
                            color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(139,92,246,0.3)'
                        }}>
                            Entrar
                        </button>
                    </div>
                </div>
            </nav>

            {/* ==================== HERO ==================== */}
            <section style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center',
                justifyContent: 'center', textAlign: 'center',
                padding: '120px 24px 80px', position: 'relative'
            }}>
                {/* Background orbs */}
                <div style={{
                    position: 'absolute', top: '15%', left: '10%', width: '400px', height: '400px',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
                    borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none'
                }} />
                <div style={{
                    position: 'absolute', bottom: '20%', right: '10%', width: '350px', height: '350px',
                    background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
                    borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none'
                }} />
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                    width: '600px', height: '600px',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
                    borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none'
                }} />

                <div style={{ maxWidth: '800px', position: 'relative', zIndex: 1 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '8px 20px', borderRadius: '100px',
                        background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)',
                        marginBottom: '32px', fontSize: '13px', color: '#a78bfa', fontWeight: '600'
                    }}>
                        <Sparkles size={14} /> Plataforma inteligente para psicólogos
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: '800',
                        lineHeight: '1.1', marginBottom: '24px',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                        Transforme o cuidado<br />em <span style={{
                            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>evolução</span>
                    </h1>

                    <p style={{
                        fontSize: 'clamp(16px, 2vw, 20px)', color: '#94a3b8',
                        lineHeight: '1.6', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px'
                    }}>
                        Prontuário digital com IA, portais gamificados para crianças e
                        acompanhamento em tempo real para pais. Tudo em uma única plataforma.
                    </p>

                    <div style={{
                        display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', padding: '0 20px'
                    }}>
                        <button onClick={() => navigate('/login')} style={{
                            flex: '1 1 200px', maxWidth: '300px',
                            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            border: 'none', padding: '16px 24px', borderRadius: '14px',
                            color: 'white', fontWeight: '700', fontSize: '16px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            boxShadow: '0 8px 30px rgba(139,92,246,0.4)',
                            transition: 'all 0.2s'
                        }}>
                            Acessar Plataforma <ArrowRight size={18} />
                        </button>

                        <button onClick={() => navigate('/portal')} style={{
                            flex: '1 1 200px', maxWidth: '300px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '16px 24px', borderRadius: '14px',
                            color: '#e2e8f0', fontWeight: '600', fontSize: '16px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            transition: 'all 0.2s'
                        }}>
                            Portal Pais/Alunos <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* Stats */}
                    <div style={{
                        display: 'flex', gap: '32px', justifyContent: 'center',
                        marginTop: '60px', flexWrap: 'wrap'
                    }}>
                        {stats.map((s, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '28px', fontWeight: '800', color: '#a78bfa',
                                    fontFamily: 'Outfit'
                                }}>{s.value}</div>
                                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==================== FEATURES ==================== */}
            <section id="features" style={{
                padding: '80px 24px', maxWidth: '1200px', margin: '0 auto'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{
                        fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '800', marginBottom: '16px'
                    }}>
                        Tudo que você precisa
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>
                        Ferramentas pensadas para psicólogos infantis que querem ir além do prontuário.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '20px'
                }}>
                    {features.map((f, idx) => (
                        <div key={idx} style={{
                            background: 'rgba(30,41,59,0.4)',
                            borderRadius: '20px', padding: '32px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            transition: 'all 0.3s',
                            cursor: 'default'
                        }}
                            className="feature-card-hover"
                        >
                            <div style={{
                                width: '52px', height: '52px', borderRadius: '14px',
                                background: `${f.color}12`, display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                color: f.color, marginBottom: '20px'
                            }}>
                                {f.icon}
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>
                                {f.title}
                            </h3>
                            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                                {f.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ==================== PORTALS SECTION ==================== */}
            <section id="portals" style={{
                padding: '80px 24px', maxWidth: '1000px', margin: '0 auto'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{
                        fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '800', marginBottom: '16px'
                    }}>
                        Três portais, um ecossistema
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '16px' }}>
                        Cada participante tem seu espaço personalizado.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Admin Portal */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(99,102,241,0.04))',
                        borderRadius: '20px', padding: '36px',
                        border: '1px solid rgba(139,92,246,0.15)',
                        display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap'
                    }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '18px',
                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <Lock size={28} color="white" />
                        </div>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <div style={{
                                fontSize: '10px', color: '#a78bfa', fontWeight: '700',
                                textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px'
                            }}>Psicóloga</div>
                            <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>
                                Painel Administrativo
                            </h3>
                            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5' }}>
                                Controle total: pacientes, prontuários, agenda, portais, diagnósticos e missões gamificadas.
                            </p>
                        </div>
                        <button onClick={() => navigate('/login')} style={{
                            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            border: 'none', padding: '12px 24px', borderRadius: '12px',
                            color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0
                        }}>
                            Acessar <ArrowRight size={16} />
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}
                        className="portals-grid"
                    >
                        {/* Parents Portal */}
                        <div style={{
                            background: 'rgba(251,113,133,0.04)',
                            borderRadius: '20px', padding: '32px',
                            border: '1px solid rgba(251,113,133,0.1)'
                        }}>
                            <Heart size={32} color="#fb7185" style={{ marginBottom: '16px' }} />
                            <div style={{
                                fontSize: '10px', color: '#fb7185', fontWeight: '700',
                                textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px'
                            }}>Portal dos Pais</div>
                            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>
                                Acompanhamento
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
                                {['Evoluções das sessões', 'Diagnósticos compartilhados', 'Progresso do tratamento'].map((item, i) => (
                                    <li key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '6px 0', fontSize: '13px', color: '#94a3b8'
                                    }}>
                                        <CheckCircle size={14} color="#fb7185" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={() => navigate('/portal')} style={{
                                width: '100%', padding: '12px', borderRadius: '10px',
                                background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.15)',
                                color: '#fb7185', fontWeight: '600', fontSize: '13px', cursor: 'pointer'
                            }}>
                                Entrar com código
                            </button>
                        </div>

                        {/* Student Portal */}
                        <div style={{
                            background: 'rgba(16,185,129,0.04)',
                            borderRadius: '20px', padding: '32px',
                            border: '1px solid rgba(16,185,129,0.1)'
                        }}>
                            <Gamepad2 size={32} color="#10b981" style={{ marginBottom: '16px' }} />
                            <div style={{
                                fontSize: '10px', color: '#10b981', fontWeight: '700',
                                textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px'
                            }}>Portal do Aluno</div>
                            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>
                                Gamificação
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
                                {['Missões com recompensas', 'Moedas e XP', 'Conquistas e troféus'].map((item, i) => (
                                    <li key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '6px 0', fontSize: '13px', color: '#94a3b8'
                                    }}>
                                        <CheckCircle size={14} color="#10b981" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={() => navigate('/portal')} style={{
                                width: '100%', padding: '12px', borderRadius: '10px',
                                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)',
                                color: '#10b981', fontWeight: '600', fontSize: '13px', cursor: 'pointer'
                            }}>
                                Entrar com código
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== CTA ==================== */}
            <section style={{
                padding: '80px 24px', textAlign: 'center'
            }}>
                <div style={{
                    maxWidth: '600px', margin: '0 auto', padding: '60px 40px',
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.05))',
                    borderRadius: '24px', border: '1px solid rgba(139,92,246,0.15)'
                }}>
                    <Sparkles size={32} color="#a78bfa" style={{ marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px' }}>
                        Comece agora
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '28px' }}>
                        Cadastre-se gratuitamente e transforme sua prática clínica.
                    </p>
                    <button onClick={() => navigate('/login')} style={{
                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        border: 'none', padding: '16px 40px', borderRadius: '14px',
                        color: 'white', fontWeight: '700', fontSize: '16px', cursor: 'pointer',
                        boxShadow: '0 8px 30px rgba(139,92,246,0.4)',
                        display: 'inline-flex', alignItems: 'center', gap: '10px'
                    }}>
                        Criar minha conta <ArrowRight size={18} />
                    </button>
                </div>
            </section>

            {/* ==================== FOOTER ==================== */}
            <footer style={{
                padding: '40px 24px', borderTop: '1px solid rgba(255,255,255,0.05)',
                textAlign: 'center', maxWidth: '1200px', margin: '0 auto'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{
                        width: '24px', height: '24px', borderRadius: '6px',
                        background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: '900', color: 'white'
                    }}>B</div>
                    <span style={{ fontWeight: '700', fontSize: '16px' }}>Bloom</span>
                </div>
                <p style={{ color: '#475569', fontSize: '13px', marginBottom: '8px' }}>
                    Plataforma inteligente para psicólogos infantis
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#475569', fontSize: '12px' }}>
                    <Shield size={12} /> Dados protegidos conforme LGPD
                </div>
                <p style={{ color: '#334155', fontSize: '11px', marginTop: '16px' }}>
                    © 2026 Bloom Psicologia. Todos os direitos reservados.
                </p>
            </footer>

            {/* ==================== CSS ==================== */}
            <style>{`
                .feature-card-hover:hover {
                    transform: translateY(-4px);
                    border-color: rgba(139,92,246,0.15) !important;
                    box-shadow: 0 12px 40px rgba(0,0,0,0.2);
                }
                @media (max-width: 768px) {
                    .nav-links-desktop a { display: none; }
                    .portals-grid { grid-template-columns: 1fr !important; }
                }
                html { scroll-behavior: smooth; }
            `}</style>
        </div>
    );
};

export default LandingPage;
