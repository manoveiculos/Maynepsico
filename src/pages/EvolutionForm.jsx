import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import {
    Save, Sparkles, ArrowLeft, History, CheckCircle, BrainCircuit,
    Target, Flag, Home, MessageSquare, TrendingUp, Info, Activity,
    Smile, Frown, Meh, Laptop, UserCheck
} from 'lucide-react';

const EvolutionForm = () => {
    const { user } = useAuth();
    const { patientId } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [content, setContent] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dynamic Clinical Fields
    const [objective, setObjective] = useState('');
    const [homework, setHomework] = useState('');
    const [parentsFeedback, setParentsFeedback] = useState('');
    const [moodPre, setMoodPre] = useState(3); // 1-5
    const [moodPost, setMoodPost] = useState(3); // 1-5
    const [techniquesUsed, setTechniquesUsed] = useState([]);

    const tagsList = [
        'Regulação Emocional', 'Foco Atencional', 'Interação Social',
        'Resistência', 'Frustração', 'Comunicação Verbal',
        'Autonomia', 'Coordenação Motora', 'Engajamento',
        'Contato Visual', 'Jogo Simbólico', 'Expressão Facial'
    ];

    const techniquesList = [
        'Análise do Comportamento (ABA)', 'Terapia Cognitivo-Comportamental',
        'Ludoterapia', 'Treino de Habilidades Sociais', 'Mediação de Conflitos',
        'Reforço Positivo', 'Socioemocional'
    ];

    useEffect(() => {
        if (!user?.id) return;

        async function loadData() {
            try {
                const patients = await dataService.getPatients(user.id);
                const p = patients?.find(x => x.id === patientId);
                setPatient(p || { name: 'Paciente' });

                const evols = await dataService.getEvolutions(patientId);
                setHistory(evols || []);

                if (evols && evols.length > 0 && evols[0].metrics?.objective) {
                    setObjective("");
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [patientId, user]);

    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const toggleTechnique = (tech) => {
        setTechniquesUsed(prev =>
            prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
        );
    };

    const handleGenerateAI = async () => {
        if (selectedTags.length === 0) return;
        setIsGenerating(true);
        try {
            const context = `Objetivo: ${objective}. Técnicas: ${techniquesUsed.join(', ')}. Humor inicial: ${moodPre}, Humor final: ${moodPost}.`;
            const text = await dataService.generateSmartEvolution(selectedTags, context);
            setContent(prev => prev ? prev + "\n\n" + text : text);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!content && !objective) {
            alert("Por favor, preencha pelo menos o conteúdo ou objetivo.");
            return;
        }
        try {
            await dataService.createEvolution({
                patient_id: patientId,
                psychologist_id: user?.id,
                content,
                tags: selectedTags,
                session_date: new Date().toISOString(),
                metrics: {
                    objective,
                    homework,
                    parentsFeedback,
                    mood_pre: moodPre,
                    mood_post: moodPost,
                    techniques: techniquesUsed
                }
            });
            navigate('/pacientes');
        } catch (e) {
            alert("Erro ao salvar evolução.");
        }
    };

    const moodIcons = [
        { val: 1, icon: <Frown size={20} />, color: '#f43f5e', label: 'Muito Baixo' },
        { val: 2, icon: <Meh size={20} />, color: '#f59e0b', label: 'Baixo' },
        { val: 3, icon: <Activity size={20} />, color: '#3b82f6', label: 'Estável' },
        { val: 4, icon: <Smile size={20} />, color: '#10b981', label: 'Bom' },
        { val: 5, icon: <Sparkles size={20} />, color: '#8b5cf6', label: 'Radiante' },
    ];

    if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }} className="loader">⌛ Abrindo sala de atendimento...</div>;

    const sectionTitleStyle = {
        fontSize: '12px', fontWeight: '800', color: '#64748b',
        textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px',
        display: 'flex', alignItems: 'center', gap: '10px'
    };

    const cardStyle = {
        background: 'rgba(30, 41, 59, 0.4)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '24px',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease'
    };

    return (
        <div className="evolution-page animate-fade" style={{ padding: '12px 0' }}>
            {/* Elegant Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <button onClick={() => navigate(-1)} className="btn-secondary" style={{
                    padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px', color: '#94a3b8', fontSize: '14px', fontWeight: '600'
                }}>
                    <ArrowLeft size={18} /> Voltar para Pacientes
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>Prontuário Digital</div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#f8fafc', fontFamily: 'Outfit' }}>{patient?.name}</div>
                    </div>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: '900', fontSize: '20px',
                        boxShadow: '0 8px 16px -4px rgba(139,92,246,0.3)'
                    }}>
                        {patient?.name?.charAt(0)}
                    </div>
                </div>
            </div>

            <div className="db-main-grid" style={{ display: 'grid', gridTemplateColumns: '1.7fr 1.2fr', gap: '20px' }}>

                {/* Main Content (Forms) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                    {/* 1. Planning Card */}
                    <div style={{ ...cardStyle, padding: '28px' }}>
                        <h3 style={sectionTitleStyle}><Target size={18} color="#8b5cf6" /> Estrutura da Sessão</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '10px', fontWeight: '600' }}>
                                    Qual o foco destas intervenções?
                                </label>
                                <input
                                    type="text"
                                    value={objective}
                                    onChange={(e) => setObjective(e.target.value)}
                                    placeholder="Ex: Treino de habilidades sociais e regulação de ansiedade"
                                    className="premium-input"
                                    style={{
                                        width: '100%', padding: '16px', borderRadius: '16px',
                                        background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.08)',
                                        color: 'white', outline: 'none', fontSize: '15px'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="responsive-grid-2">
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '14px', fontWeight: '600' }}>
                                        Check-in: Estado Interno
                                    </label>
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        background: 'rgba(15, 23, 42, 0.4)', padding: '10px',
                                        borderRadius: '18px', border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        {moodIcons.map(m => (
                                            <button
                                                key={`pre-${m.val}`}
                                                onClick={() => setMoodPre(m.val)}
                                                style={{
                                                    background: moodPre === m.val ? m.color : 'transparent',
                                                    border: 'none', padding: '12px', borderRadius: '14px',
                                                    color: moodPre === m.val ? 'white' : '#475569',
                                                    cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    transform: moodPre === m.val ? 'scale(1.1)' : 'scale(1)',
                                                    boxShadow: moodPre === m.val ? `0 4px 12px ${m.color}60` : 'none',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}
                                                title={m.label}
                                            >
                                                {m.icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '14px', fontWeight: '600' }}>
                                        Check-out: Estado Final
                                    </label>
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        background: 'rgba(15, 23, 42, 0.4)', padding: '10px',
                                        borderRadius: '18px', border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        {moodIcons.map(m => (
                                            <button
                                                key={`post-${m.val}`}
                                                onClick={() => setMoodPost(m.val)}
                                                style={{
                                                    background: moodPost === m.val ? m.color : 'transparent',
                                                    border: 'none', padding: '12px', borderRadius: '14px',
                                                    color: moodPost === m.val ? 'white' : '#475569',
                                                    cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    transform: moodPost === m.val ? 'scale(1.1)' : 'scale(1)',
                                                    boxShadow: moodPost === m.val ? `0 4px 12px ${m.color}60` : 'none',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}
                                                title={m.label}
                                            >
                                                {m.icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Professional Notes Editor */}
                    <div style={{ ...cardStyle, overflow: 'hidden', border: '1px solid rgba(139,92,246,0.15)' }}>
                        <div style={{
                            padding: '18px 28px', background: 'rgba(139,92,246,0.08)',
                            borderBottom: '1px solid rgba(139,92,246,0.1)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <h3 style={{ ...sectionTitleStyle, marginBottom: 0, color: 'white' }}>
                                <MessageSquare size={18} color="#a78bfa" /> Registro Clínico
                            </h3>
                            <div style={{
                                fontSize: '11px', color: '#10b981', background: 'rgba(16,185,129,0.1)',
                                padding: '4px 12px', borderRadius: '100px',
                                display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800'
                            }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
                                AUTOSAVE ON
                            </div>
                        </div>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Inicie sua redação aqui. Use o co-piloto ao lado para acelerar o processo..."
                            style={{
                                width: '100%', height: '420px', padding: '28px', background: 'transparent',
                                border: 'none', color: '#e2e8f0', fontSize: '16px', lineHeight: '1.8',
                                outline: 'none', resize: 'none', fontFamily: 'Inter, sans-serif',
                                letterSpacing: '0.2px'
                            }}
                        />
                        <div style={{
                            padding: '24px 28px', background: 'rgba(0,0,0,0.1)',
                            borderTop: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                                    <Laptop size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                    <b>{content.split(/\s+/).filter(x => x).length}</b> palavras digitadas
                                </div>
                            </div>
                            <button className="btn-primary" onClick={handleSave} style={{
                                padding: '14px 32px', borderRadius: '16px', fontWeight: '700',
                                boxShadow: '0 8px 20px -4px rgba(139,92,246,0.4)',
                                transform: 'translateY(0)', transition: 'all 0.2s'
                            }}>
                                <Save size={20} /> Finalizar e Arquivar
                            </button>
                        </div>
                    </div>

                    {/* 3. Communication Cards */}
                    <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div style={{ ...cardStyle, padding: '24px' }}>
                            <h4 style={sectionTitleStyle}><Home size={16} color="#fbbf24" /> Continuidade em Casa</h4>
                            <textarea
                                value={homework}
                                onChange={(e) => setHomework(e.target.value)}
                                placeholder="O que a família deve priorizar?"
                                style={{
                                    width: '100%', height: '100px', background: 'rgba(15,23,42,0.3)',
                                    border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px',
                                    padding: '16px', color: 'white', fontSize: '14px', resize: 'none', outline: 'none'
                                }}
                            />
                        </div>
                        <div style={{ ...cardStyle, padding: '24px' }}>
                            <h4 style={sectionTitleStyle}><UserCheck size={16} color="#10b981" /> Feedback dos Pais</h4>
                            <textarea
                                value={parentsFeedback}
                                onChange={(e) => setParentsFeedback(e.target.value)}
                                placeholder="Resumo do feedback compartilhado..."
                                style={{
                                    width: '100%', height: '100px', background: 'rgba(15,23,42,0.3)',
                                    border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px',
                                    padding: '16px', color: 'white', fontSize: '14px', resize: 'none', outline: 'none'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar - Precision Tools */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                    {/* Bloom AI Co-pilot */}
                    <div style={{
                        ...cardStyle, padding: '28px', border: '1px solid rgba(139,92,246,0.25)',
                        position: 'relative', overflow: 'hidden',
                        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.4))'
                    }}>
                        <div style={{
                            position: 'absolute', top: '12px', right: '12px',
                            background: '#8b5cf6', color: 'white', fontSize: '10px',
                            fontWeight: '900', padding: '3px 10px', borderRadius: '100px',
                            boxShadow: '0 4px 10px rgba(139,92,246,0.3)'
                        }}>
                            BLOOM IA
                        </div>
                        <h3 style={{ ...sectionTitleStyle, color: '#f1f5f9', fontSize: '13px' }}>
                            <Sparkles size={18} color="#a78bfa" /> Sintetizador Inteligente
                        </h3>
                        <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px', lineHeight: '1.5' }}>
                            Selecione os indicadores para que a IA ajude a estruturar seu relato técnico.
                        </p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                            {tagsList.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    style={{
                                        padding: '8px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                                        background: selectedTags.includes(tag) ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.03)',
                                        color: selectedTags.includes(tag) ? '#a78bfa' : '#64748b',
                                        border: '1px solid',
                                        borderColor: selectedTags.includes(tag) ? '#8b5cf6' : 'rgba(255,255,255,0.08)',
                                        cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        transform: selectedTags.includes(tag) ? 'translateY(-1px)' : 'none'
                                    }}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>

                        <button
                            className="btn-primary"
                            onClick={handleGenerateAI}
                            disabled={isGenerating || selectedTags.length === 0}
                            style={{
                                width: '100%', justifyContent: 'center', background: 'transparent',
                                border: '1px solid rgba(139,92,246,0.4)', borderRadius: '16px',
                                color: '#a78bfa', opacity: (isGenerating || selectedTags.length === 0) ? 0.5 : 1,
                                padding: '16px', fontSize: '14px', fontWeight: '700'
                            }}
                        >
                            <BrainCircuit size={20} style={{ marginRight: '8px' }} />
                            {isGenerating ? 'Processando Relato...' : 'Sintetizar Registro'}
                        </button>
                    </div>

                    {/* Methodologies */}
                    <div style={{ ...cardStyle, padding: '24px' }}>
                        <h3 style={sectionTitleStyle}><Activity size={18} color="#10b981" /> Metodologias & Técnicas</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {techniquesList.map(tech => (
                                <label key={tech} style={{
                                    display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px',
                                    color: techniquesUsed.includes(tech) ? '#f8fafc' : '#64748b',
                                    cursor: 'pointer', padding: '12px', borderRadius: '14px',
                                    background: techniquesUsed.includes(tech) ? 'rgba(16,185,129,0.08)' : 'transparent',
                                    border: '1px solid',
                                    borderColor: techniquesUsed.includes(tech) ? 'rgba(16,185,129,0.2)' : 'transparent',
                                    transition: 'all 0.2s'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={techniquesUsed.includes(tech)}
                                        onChange={() => toggleTechnique(tech)}
                                        style={{ accentColor: '#10b981', width: '18px', height: '18px' }}
                                    />
                                    {tech}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Patient Context Card */}
                    <div style={{
                        padding: '24px', borderRadius: '24px', background: 'rgba(251,191,36,0.03)',
                        border: '1px solid rgba(251,191,36,0.1)', display: 'flex', gap: '16px'
                    }}>
                        <Info size={24} color="#fbbf24" style={{ flexShrink: 0 }} />
                        <div>
                            <p style={{ fontSize: '14px', color: '#fbbf24', fontWeight: '800', marginBottom: '6px' }}>
                                Lembretes Clínicos
                            </p>
                            <p style={{ fontSize: '13px', color: '#d97706', lineHeight: '1.6', opacity: 0.9 }}>
                                {patient?.notes || 'Nenhuma nota especial registrada no cadastro do paciente.'}
                            </p>
                        </div>
                    </div>

                    {/* Quick Access History */}
                    <div style={{ ...cardStyle, padding: '24px' }}>
                        <h3 style={sectionTitleStyle}><History size={18} color="#94a3b8" /> Histórico Rápido</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {history.slice(0, 3).map(h => (
                                <div key={h.id} style={{
                                    padding: '16px', borderRadius: '18px', background: 'rgba(15,23,42,0.4)',
                                    borderLeft: '4px solid #6366f1', cursor: 'pointer', transition: 'all 0.2s'
                                }}>
                                    <div style={{ fontSize: '11px', color: '#818cf8', fontWeight: '800', marginBottom: '6px', textTransform: 'uppercase' }}>
                                        {new Date(h.session_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                    </div>
                                    <p style={{ fontSize: '13px', color: '#94a3b8', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                                        {h.content}
                                    </p>
                                </div>
                            ))}
                            {history.length === 0 && <p style={{ fontSize: '13px', color: '#475569', textAlign: 'center', padding: '20px' }}>Inicie o histórico deste paciente.</p>}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(1.1); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .premium-input:focus {
                    background: rgba(15, 23, 42, 0.6) !important;
                    border-color: rgba(139,92,246,0.5) !important;
                    box-shadow: 0 0 0 4px rgba(139,92,246,0.1);
                }
            `}</style>
        </div>
    );
};

export default EvolutionForm;
