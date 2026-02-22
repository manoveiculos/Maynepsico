import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import {
    Heart, TrendingUp, FileText, Calendar, ChevronDown, ChevronUp,
    ArrowLeft, User, Clock, Shield, Brain, Activity, Sparkles,
    Home, MessageSquare
} from 'lucide-react';

const ParentPortal = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [evolutions, setEvolutions] = useState([]);
    const [diagnostics, setDiagnostics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedEvol, setExpandedEvol] = useState(null);
    const [activeTab, setActiveTab] = useState('evolucoes');
    const [psychologist, setPsychologist] = useState(null);

    useEffect(() => {
        loadPortalData();
    }, [code]);

    async function loadPortalData() {
        try {
            const access = await dataService.validateAccessCode(code);
            if (!access || access.portal_type !== 'pais') {
                navigate('/portal');
                return;
            }
            setPatient(access.patients_psico);
            setPsychologist(access.patients_psico?.profiles_psico);

            const [evols, diags] = await Promise.all([
                dataService.getEvolutions(access.patient_id),
                dataService.getDiagnostics(access.patient_id, true)
            ]);
            setEvolutions(evols || []);
            setDiagnostics(diags || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const getAge = (birthDate) => {
        if (!birthDate) return '';
        const today = new Date();
        const birth = new Date(birthDate);
        const years = today.getFullYear() - birth.getFullYear();
        const months = today.getMonth() - birth.getMonth();
        if (years === 0) return `${months > 0 ? months : 1} meses`;
        return `${years} anos`;
    };

    const getDomainFromTags = (tags) => {
        if (!tags || !Array.isArray(tags)) return [];
        const domainMap = {
            'Regulação Emocional': { label: 'Emocional', color: '#fb923c', icon: '💛' },
            'Foco Atencional': { label: 'Cognitivo', color: '#8b5cf6', icon: '🧠' },
            'Interação Social': { label: 'Social', color: '#3b82f6', icon: '🤝' },
            'Comunicação Verbal': { label: 'Comunicação', color: '#10b981', icon: '💬' },
            'Autonomia': { label: 'Autonomia', color: '#f59e0b', icon: '⭐' },
            'Coordenação Motora': { label: 'Motor', color: '#ef4444', icon: '🏃' },
            'Engajamento': { label: 'Engajamento', color: '#06b6d4', icon: '🎯' },
            'Contato Visual': { label: 'Social', color: '#3b82f6', icon: '👁️' },
            'Jogo Simbólico': { label: 'Cognitivo', color: '#8b5cf6', icon: '🎲' },
            'Expressão Facial': { label: 'Emocional', color: '#fb923c', icon: '😊' },
        };
        return tags.map(t => domainMap[t] || { label: t, color: '#94a3b8', icon: '📌' });
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh', background: '#0f172a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: '16px'
            }}>
                <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    border: '3px solid rgba(139,92,246,0.2)', borderTopColor: '#8b5cf6',
                    animation: 'spin 0.8s linear infinite'
                }} />
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>Carregando portal...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
            color: '#f8fafc'
        }}>
            {/* Header */}
            <div className="portal-header" style={{
                background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                padding: '16px 24px', position: 'sticky', top: 0, zIndex: 10
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <button onClick={() => navigate('/portal')} style={{
                            background: 'none', border: 'none', color: '#94a3b8',
                            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                            fontSize: '13px'
                        }}>
                            <ArrowLeft size={16} /> Sair
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Heart size={16} color="#fb7185" />
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#fb7185' }}>Portal dos Pais</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px 80px' }}>
                {/* Patient Hero Card */}
                <div className="portal-hero" style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.1))',
                    borderRadius: '20px', padding: '28px', marginBottom: '24px',
                    border: '1px solid rgba(139,92,246,0.15)', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px',
                        background: 'radial-gradient(circle, rgba(139,92,246,0.2), transparent 70%)',
                        borderRadius: '50%'
                    }} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '16px',
                                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '24px', fontWeight: '800', color: 'white', flexShrink: 0
                            }}>
                                {patient?.name?.charAt(0)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '11px', color: '#a78bfa', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>
                                    Paciente
                                </div>
                                <h1 style={{ fontSize: '22px', fontFamily: 'Outfit', fontWeight: '700', marginBottom: '4px' }}>
                                    {patient?.name}
                                </h1>
                                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                    {patient?.birth_date && (
                                        <span style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={13} /> {getAge(patient.birth_date)}
                                        </span>
                                    )}
                                    <span style={{
                                        fontSize: '10px', padding: '3px 10px', borderRadius: '100px',
                                        background: 'rgba(16,185,129,0.1)', color: '#10b981',
                                        fontWeight: '700', textTransform: 'uppercase'
                                    }}>
                                        {patient?.status || 'ativo'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Profiles info */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px',
                            paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div>
                                <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>
                                    Psicóloga Responsável
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <User size={14} color="#8b5cf6" />
                                    Dr(a). {psychologist?.full_name || 'Profissional'}
                                </div>
                                {psychologist?.crp && <div style={{ fontSize: '11px', color: '#64748b', marginLeft: '20px' }}>CRP: {psychologist.crp}</div>}
                            </div>
                            <div>
                                <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>
                                    Responsável
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Heart size={14} color="#fb7185" />
                                    {patient?.responsible_name || 'Não informado'}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748b', marginLeft: '20px' }}>{patient?.responsible_relationship}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="portal-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                    <div style={{
                        background: 'rgba(30,41,59,0.6)', borderRadius: '14px', padding: '16px', textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <Activity size={20} color="#8b5cf6" style={{ marginBottom: '8px' }} />
                        <div style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'Outfit' }}>{evolutions.length}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>Sessões</div>
                    </div>
                    <div style={{
                        background: 'rgba(30,41,59,0.6)', borderRadius: '14px', padding: '16px', textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <Brain size={20} color="#10b981" style={{ marginBottom: '8px' }} />
                        <div style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'Outfit' }}>{diagnostics.length}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>Relatórios</div>
                    </div>
                    <div style={{
                        background: 'rgba(30,41,59,0.6)', borderRadius: '14px', padding: '16px', textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <TrendingUp size={20} color="#fb923c" style={{ marginBottom: '8px' }} />
                        <div style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'Outfit' }}>
                            {evolutions.length > 0 ? 'Bom' : '-'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>Progresso</div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex', gap: '4px', marginBottom: '24px',
                    background: 'rgba(30,41,59,0.4)', borderRadius: '14px', padding: '4px'
                }}>
                    {[
                        { key: 'evolucoes', label: 'Evoluções', icon: <TrendingUp size={16} /> },
                        { key: 'diagnosticos', label: 'Diagnósticos', icon: <FileText size={16} /> },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                flex: 1, padding: '12px', borderRadius: '12px',
                                background: activeTab === tab.key ? 'rgba(139,92,246,0.15)' : 'transparent',
                                color: activeTab === tab.key ? '#a78bfa' : '#94a3b8',
                                border: activeTab === tab.key ? '1px solid rgba(139,92,246,0.2)' : '1px solid transparent',
                                fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'evolucoes' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {evolutions.length === 0 ? (
                            <div style={{
                                textAlign: 'center', padding: '60px 24px',
                                background: 'rgba(30,41,59,0.4)', borderRadius: '16px'
                            }}>
                                <TrendingUp size={40} color="#334155" style={{ marginBottom: '16px' }} />
                                <p style={{ color: '#64748b', fontSize: '15px' }}>Nenhuma evolução registrada ainda.</p>
                                <p style={{ color: '#475569', fontSize: '13px', marginTop: '8px' }}>
                                    Após as sessões, as evoluções aparecerão aqui.
                                </p>
                            </div>
                        ) : (
                            evolutions.map((evol, idx) => {
                                const isExpanded = expandedEvol === evol.id;
                                const domains = getDomainFromTags(evol.tags);

                                return (
                                    <div key={evol.id}
                                        style={{
                                            background: 'rgba(30,41,59,0.6)', borderRadius: '16px',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            overflow: 'hidden', transition: 'all 0.3s',
                                            animation: `fadeIn 0.4s ease-out ${idx * 0.05}s both`
                                        }}
                                    >
                                        <button
                                            onClick={() => setExpandedEvol(isExpanded ? null : evol.id)}
                                            style={{
                                                width: '100%', padding: '18px 20px',
                                                background: 'none', border: 'none', color: '#f8fafc',
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                cursor: 'pointer', textAlign: 'left'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '12px',
                                                    background: 'rgba(139,92,246,0.1)', display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                                }}>
                                                    <Calendar size={18} color="#8b5cf6" />
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontWeight: '600', fontSize: '14px' }}>
                                                        Sessão {evolutions.length - idx}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Clock size={12} />
                                                        {new Date(evol.session_date).toLocaleDateString('pt-BR', {
                                                            day: '2-digit', month: 'long', year: 'numeric'
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                            {isExpanded ? <ChevronUp size={18} color="#94a3b8" /> : <ChevronDown size={18} color="#94a3b8" />}
                                        </button>

                                        {isExpanded && (
                                            <div style={{
                                                padding: '0 20px 20px',
                                                animation: 'fadeIn 0.3s ease-out'
                                            }}>
                                                {domains.length > 0 && (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                                                        {domains.map((d, i) => (
                                                            <span key={i} style={{
                                                                padding: '4px 10px', borderRadius: '100px',
                                                                background: `${d.color}15`, color: d.color,
                                                                fontSize: '11px', fontWeight: '600'
                                                            }}>
                                                                {d.icon} {d.label}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <div style={{
                                                    background: 'rgba(0,0,0,0.2)', borderRadius: '12px',
                                                    padding: '16px', fontSize: '14px', lineHeight: '1.7',
                                                    color: '#cbd5e1', marginBottom: (evol.metrics?.homework || evol.metrics?.parentsFeedback) ? '12px' : '0'
                                                }}>
                                                    {evol.content}
                                                </div>

                                                {(evol.metrics?.homework || evol.metrics?.parentsFeedback) && (
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                                        {evol.metrics?.homework && (
                                                            <div style={{ background: 'rgba(139,92,246,0.05)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(139,92,246,0.1)' }}>
                                                                <div style={{ fontSize: '11px', color: '#a78bfa', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    <Home size={12} /> Tarefa de Casa
                                                                </div>
                                                                <div style={{ fontSize: '13px', color: '#cbd5e1' }}>{evol.metrics.homework}</div>
                                                            </div>
                                                        )}
                                                        {evol.metrics?.parentsFeedback && (
                                                            <div style={{ background: 'rgba(16,185,129,0.05)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(16,185,129,0.1)' }}>
                                                                <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    <MessageSquare size={12} /> Feedback para Pais
                                                                </div>
                                                                <div style={{ fontSize: '13px', color: '#cbd5e1' }}>{evol.metrics.parentsFeedback}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {activeTab === 'diagnosticos' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {diagnostics.length === 0 ? (
                            <div style={{
                                textAlign: 'center', padding: '60px 24px',
                                background: 'rgba(30,41,59,0.4)', borderRadius: '16px'
                            }}>
                                <FileText size={40} color="#334155" style={{ marginBottom: '16px' }} />
                                <p style={{ color: '#64748b', fontSize: '15px' }}>Nenhum diagnóstico compartilhado.</p>
                                <p style={{ color: '#475569', fontSize: '13px', marginTop: '8px' }}>
                                    Quando a psicóloga compartilhar um relatório, ele aparecerá aqui.
                                </p>
                            </div>
                        ) : (
                            diagnostics.map((diag, idx) => (
                                <div key={diag.id} style={{
                                    background: 'rgba(30,41,59,0.6)', borderRadius: '16px',
                                    border: '1px solid rgba(255,255,255,0.05)', padding: '20px',
                                    animation: `fadeIn 0.4s ease-out ${idx * 0.05}s both`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                        <Shield size={18} color="#10b981" />
                                        <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{diag.title}</h3>
                                    </div>
                                    <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#cbd5e1', marginBottom: '12px' }}>
                                        {diag.content}
                                    </p>
                                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={12} />
                                        {new Date(diag.created_at).toLocaleDateString('pt-BR')}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div style={{
                textAlign: 'center', padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)',
                fontSize: '12px', color: '#475569'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                    <Shield size={12} /> Dados protegidos conforme LGPD
                </div>
                Bloom Psicologia © 2026
            </div>
        </div>
    );
};

export default ParentPortal;
