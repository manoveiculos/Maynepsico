import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import {
    ArrowLeft, KeyRound, Copy, CheckCircle, Heart, Gamepad2,
    Plus, Trash2, Target, Coins, Zap, Send, FileText, Shield,
    Sparkles, X
} from 'lucide-react';

const PortalManager = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [patient, setPatient] = useState(null);
    const [accessCodes, setAccessCodes] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [diagnostics, setDiagnostics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('codigos');
    const [copiedCode, setCopiedCode] = useState(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showDiagModal, setShowDiagModal] = useState(false);

    // Task form
    const [taskForm, setTaskForm] = useState({
        title: '', description: '', difficulty: 'normal',
        coins_reward: 10, xp_reward: 25, emoji: '⭐', category: 'diaria'
    });

    // Diagnostic form
    const [diagForm, setDiagForm] = useState({
        title: '', content: '', diagnostic_type: 'observacao', share_with_parents: true
    });

    useEffect(() => {
        loadData();
    }, [patientId]);

    async function loadData() {
        try {
            const patients = await dataService.getPatients(user?.id);
            const p = patients?.find(x => x.id === patientId);
            setPatient(p || { name: 'Paciente' });

            const [codes, taskList, diagList] = await Promise.all([
                dataService.getAccessCodes(patientId),
                dataService.getTasks(patientId),
                dataService.getDiagnostics(patientId)
            ]);
            setAccessCodes(codes || []);
            setTasks(taskList || []);
            setDiagnostics(diagList || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const handleGenerateCode = async (type) => {
        try {
            await dataService.generateAccessCode(patientId, type);
            await loadData();
        } catch (err) {
            alert('Erro ao gerar código.');
        }
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await dataService.createTask({ ...taskForm, patient_id: patientId });
            setShowTaskModal(false);
            setTaskForm({ title: '', description: '', difficulty: 'normal', coins_reward: 10, xp_reward: 25, emoji: '⭐', category: 'diaria' });
            await loadData();
        } catch (err) {
            alert('Erro ao criar missão.');
        }
    };

    const handleCreateDiag = async (e) => {
        e.preventDefault();
        try {
            await dataService.createDiagnostic({ ...diagForm, patient_id: patientId });
            setShowDiagModal(false);
            setDiagForm({ title: '', content: '', diagnostic_type: 'observacao', share_with_parents: true });
            await loadData();
        } catch (err) {
            alert('Erro ao criar diagnóstico.');
        }
    };

    const emojiOptions = ['⭐', '🎯', '📚', '🧘', '💪', '🎨', '🧩', '🌈', '🦸', '🏆', '❤️', '🧠'];
    const difficultyOptions = [
        { value: 'facil', label: 'Fácil', color: '#10b981' },
        { value: 'normal', label: 'Normal', color: '#3b82f6' },
        { value: 'dificil', label: 'Difícil', color: '#f59e0b' },
        { value: 'epico', label: 'Épico', color: '#ef4444' },
    ];

    const inputStyle = {
        width: '100%', padding: '12px 14px', borderRadius: '10px',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        color: 'white', outline: 'none', fontSize: '14px'
    };

    const labelStyle = {
        display: 'block', fontSize: '12px', color: '#94a3b8',
        fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px'
    };

    return (
        <div className="portal-manager animate-fade" style={{ padding: '24px 0' }}>
            <button onClick={() => navigate('/pacientes')} style={{
                background: 'none', border: 'none', color: 'var(--bloom-text-muted)',
                display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                marginBottom: '20px', fontSize: '14px'
            }}>
                <ArrowLeft size={18} /> Voltar
            </button>

            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '26px', marginBottom: '6px' }}>Gerenciar Portais</h1>
                <p style={{ color: 'var(--bloom-lavender)', fontWeight: '600', fontSize: '16px' }}>
                    {patient?.name}
                </p>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex', gap: '4px', marginBottom: '24px',
                background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '4px',
                overflowX: 'auto'
            }}>
                {[
                    { key: 'codigos', label: 'Códigos', icon: <KeyRound size={15} /> },
                    { key: 'missoes', label: 'Missões', icon: <Target size={15} /> },
                    { key: 'diagnosticos', label: 'Diagnósticos', icon: <FileText size={15} /> },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            flex: 1, padding: '11px 16px', borderRadius: '12px', whiteSpace: 'nowrap',
                            background: activeTab === tab.key ? 'rgba(139,92,246,0.12)' : 'transparent',
                            color: activeTab === tab.key ? '#a78bfa' : '#94a3b8',
                            border: activeTab === tab.key ? '1px solid rgba(139,92,246,0.15)' : '1px solid transparent',
                            fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* ==================== ACCESS CODES TAB ==================== */}
            {activeTab === 'codigos' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}
                        className="portal-code-grid"
                    >
                        <button onClick={() => handleGenerateCode('pais')} className="premium-card" style={{
                            padding: '20px', cursor: 'pointer', textAlign: 'center',
                            border: '1px dashed rgba(251,113,133,0.3)', background: 'rgba(251,113,133,0.03)'
                        }}>
                            <Heart size={24} color="#fb7185" style={{ marginBottom: '10px' }} />
                            <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>Gerar para Pais</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Relatórios e evoluções</div>
                        </button>
                        <button onClick={() => handleGenerateCode('aluno')} className="premium-card" style={{
                            padding: '20px', cursor: 'pointer', textAlign: 'center',
                            border: '1px dashed rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.03)'
                        }}>
                            <Gamepad2 size={24} color="#10b981" style={{ marginBottom: '10px' }} />
                            <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>Gerar para Aluno</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Missões e conquistas</div>
                        </button>
                    </div>

                    {accessCodes.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {accessCodes.map(ac => (
                                <div key={ac.id} className="premium-card" style={{
                                    padding: '16px 20px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'space-between', gap: '12px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {ac.portal_type === 'pais'
                                            ? <Heart size={18} color="#fb7185" />
                                            : <Gamepad2 size={18} color="#10b981" />
                                        }
                                        <div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>
                                                Portal {ac.portal_type === 'pais' ? 'dos Pais' : 'do Aluno'}
                                            </div>
                                            <div style={{
                                                fontSize: '20px', fontWeight: '800', letterSpacing: '4px',
                                                fontFamily: 'monospace', color: '#f8fafc'
                                            }}>
                                                {ac.access_code}
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleCopyCode(ac.access_code)} style={{
                                        background: copiedCode === ac.access_code ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                                        border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer',
                                        color: copiedCode === ac.access_code ? '#10b981' : '#94a3b8'
                                    }}>
                                        {copiedCode === ac.access_code ? <CheckCircle size={18} /> : <Copy size={18} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="premium-card" style={{ padding: '40px', textAlign: 'center' }}>
                            <KeyRound size={32} color="#334155" style={{ marginBottom: '12px' }} />
                            <p style={{ color: '#64748b' }}>Nenhum código gerado ainda.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ==================== MISSIONS TAB ==================== */}
            {activeTab === 'missoes' && (
                <div>
                    <button onClick={() => setShowTaskModal(true)} className="btn-primary" style={{
                        marginBottom: '20px', width: '100%', justifyContent: 'center'
                    }}>
                        <Plus size={18} /> Nova Missão
                    </button>

                    {tasks.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {tasks.map(task => (
                                <div key={task.id} className="premium-card" style={{
                                    padding: '16px', display: 'flex', alignItems: 'center', gap: '12px'
                                }}>
                                    <div style={{
                                        width: '42px', height: '42px', borderRadius: '12px',
                                        background: 'rgba(139,92,246,0.1)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0
                                    }}>
                                        {task.emoji || '⭐'}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>{task.title}</div>
                                        <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                                            <span style={{ color: '#fbbf24' }}>🪙 {task.coins_reward}</span>
                                            <span style={{ color: '#a78bfa' }}>⚡ {task.xp_reward} XP</span>
                                            <span style={{
                                                color: task.status === 'concluida' ? '#10b981' : '#94a3b8',
                                                textTransform: 'uppercase', fontWeight: '700'
                                            }}>
                                                {task.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="premium-card" style={{ padding: '40px', textAlign: 'center' }}>
                            <Target size={32} color="#334155" style={{ marginBottom: '12px' }} />
                            <p style={{ color: '#64748b' }}>Crie missões para o aluno.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ==================== DIAGNOSTICS TAB ==================== */}
            {activeTab === 'diagnosticos' && (
                <div>
                    <button onClick={() => setShowDiagModal(true)} className="btn-primary" style={{
                        marginBottom: '20px', width: '100%', justifyContent: 'center'
                    }}>
                        <Plus size={18} /> Novo Diagnóstico
                    </button>

                    {diagnostics.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {diagnostics.map(diag => (
                                <div key={diag.id} className="premium-card" style={{ padding: '18px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                        <Shield size={16} color="#10b981" />
                                        <span style={{ fontWeight: '600', fontSize: '14px' }}>{diag.title}</span>
                                        {diag.share_with_parents && (
                                            <span style={{
                                                fontSize: '10px', padding: '2px 8px', borderRadius: '100px',
                                                background: 'rgba(251,113,133,0.1)', color: '#fb7185', fontWeight: '600'
                                            }}>Visível para pais</span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
                                        {diag.content?.substring(0, 120)}{diag.content?.length > 120 ? '...' : ''}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="premium-card" style={{ padding: '40px', textAlign: 'center' }}>
                            <FileText size={32} color="#334155" style={{ marginBottom: '12px' }} />
                            <p style={{ color: '#64748b' }}>Nenhum diagnóstico registrado.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ==================== TASK MODAL ==================== */}
            {showTaskModal && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowTaskModal(false); }}>
                    <div className="premium-card modal-card animate-fade" style={{
                        width: '100%', maxWidth: '480px', padding: '28px',
                        backgroundColor: 'var(--bloom-surface)', position: 'relative'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <div>
                                <h2 style={{ fontSize: '20px', marginBottom: '4px' }}>Nova Missão</h2>
                                <p style={{ fontSize: '12px', color: '#94a3b8' }}>Crie tarefas gamificadas para {patient?.name}</p>
                            </div>
                            <button onClick={() => setShowTaskModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                <X size={22} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Emoji */}
                            <div>
                                <label style={labelStyle}>Ícone da Missão</label>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {emojiOptions.map(e => (
                                        <button key={e} type="button" onClick={() => setTaskForm({ ...taskForm, emoji: e })}
                                            style={{
                                                width: '40px', height: '40px', borderRadius: '10px', fontSize: '20px',
                                                background: taskForm.emoji === e ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
                                                border: taskForm.emoji === e ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.08)',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >{e}</button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Título</label>
                                <input required value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                    placeholder="Ex: Praticar respiração 5 min" style={inputStyle} />
                            </div>

                            <div>
                                <label style={labelStyle}>Descrição (opcional)</label>
                                <textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                    placeholder="Detalhes da missão..." rows={3}
                                    style={{ ...inputStyle, resize: 'none' }} />
                            </div>

                            {/* Difficulty */}
                            <div>
                                <label style={labelStyle}>Dificuldade</label>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    {difficultyOptions.map(d => (
                                        <button key={d.value} type="button"
                                            onClick={() => setTaskForm({ ...taskForm, difficulty: d.value })}
                                            style={{
                                                flex: 1, padding: '10px', borderRadius: '10px',
                                                background: taskForm.difficulty === d.value ? `${d.color}15` : 'rgba(255,255,255,0.03)',
                                                border: taskForm.difficulty === d.value ? `2px solid ${d.color}` : '1px solid rgba(255,255,255,0.08)',
                                                color: taskForm.difficulty === d.value ? d.color : '#94a3b8',
                                                fontWeight: '600', fontSize: '12px', cursor: 'pointer'
                                            }}
                                        >{d.label}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Rewards */}
                            <div className="modal-form-row">
                                <div>
                                    <label style={labelStyle}>🪙 Moedas</label>
                                    <input type="number" min="1" max="100" value={taskForm.coins_reward}
                                        onChange={(e) => setTaskForm({ ...taskForm, coins_reward: parseInt(e.target.value) || 0 })}
                                        style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>⚡ XP</label>
                                    <input type="number" min="1" max="500" value={taskForm.xp_reward}
                                        onChange={(e) => setTaskForm({ ...taskForm, xp_reward: parseInt(e.target.value) || 0 })}
                                        style={inputStyle} />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
                                <Sparkles size={18} /> Criar Missão
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ==================== DIAGNOSTIC MODAL ==================== */}
            {showDiagModal && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowDiagModal(false); }}>
                    <div className="premium-card modal-card animate-fade" style={{
                        width: '100%', maxWidth: '520px', padding: '28px',
                        backgroundColor: 'var(--bloom-surface)', position: 'relative'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <div>
                                <h2 style={{ fontSize: '20px', marginBottom: '4px' }}>Novo Diagnóstico</h2>
                                <p style={{ fontSize: '12px', color: '#94a3b8' }}>Registre observações e laudos</p>
                            </div>
                            <button onClick={() => setShowDiagModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                <X size={22} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateDiag} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={labelStyle}>Título</label>
                                <input required value={diagForm.title} onChange={(e) => setDiagForm({ ...diagForm, title: e.target.value })}
                                    placeholder="Ex: Avaliação Neuropsicológica" style={inputStyle} />
                            </div>

                            <div>
                                <label style={labelStyle}>Tipo</label>
                                <select value={diagForm.diagnostic_type}
                                    onChange={(e) => setDiagForm({ ...diagForm, diagnostic_type: e.target.value })}
                                    style={{ ...inputStyle, cursor: 'pointer' }}
                                >
                                    <option value="observacao">Observação Clínica</option>
                                    <option value="laudo">Laudo</option>
                                    <option value="encaminhamento">Encaminhamento</option>
                                    <option value="relatorio">Relatório de Progresso</option>
                                </select>
                            </div>

                            <div>
                                <label style={labelStyle}>Conteúdo</label>
                                <textarea required value={diagForm.content}
                                    onChange={(e) => setDiagForm({ ...diagForm, content: e.target.value })}
                                    placeholder="Descreva as observações, hipóteses diagnósticas e recomendações..."
                                    rows={6} style={{ ...inputStyle, resize: 'none', lineHeight: '1.6' }} />
                            </div>

                            <label style={{
                                display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                                padding: '12px', borderRadius: '10px', background: 'rgba(251,113,133,0.05)',
                                border: '1px solid rgba(251,113,133,0.1)'
                            }}>
                                <input type="checkbox" checked={diagForm.share_with_parents}
                                    onChange={(e) => setDiagForm({ ...diagForm, share_with_parents: e.target.checked })}
                                    style={{ accentColor: '#8b5cf6', width: '18px', height: '18px' }}
                                />
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: '600' }}>Compartilhar com pais</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Visível no Portal dos Pais</div>
                                </div>
                            </label>

                            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
                                <Send size={18} /> Salvar Diagnóstico
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @media (max-width: 768px) {
                    .portal-code-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

export default PortalManager;
