import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import {
    Gamepad2, Trophy, Coins, Zap, Star, CheckCircle, Circle,
    ArrowLeft, Flame, Target, Gift, Lock, Unlock, ChevronRight,
    Sparkles, Medal, Brain
} from 'lucide-react';

const StudentPortal = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [unlockedAchievements, setUnlockedAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('missoes');
    const [completingTask, setCompletingTask] = useState(null);
    const [showReward, setShowReward] = useState(null);
    const [accessCode, setAccessCode] = useState(null);
    const [psychologist, setPsychologist] = useState(null);

    useEffect(() => {
        loadPortalData();
    }, [code]);

    async function loadPortalData() {
        try {
            const access = await dataService.validateAccessCode(code);
            if (!access || access.portal_type !== 'aluno') {
                navigate('/portal');
                return;
            }
            setPatient(access.patients_psico);
            setPsychologist(access.patients_psico?.profiles_psico);
            setAccessCode(access);

            const [taskList, achievList, unlockedList] = await Promise.all([
                dataService.getTasks(access.patient_id),
                dataService.getAchievements(),
                dataService.getPatientAchievements(access.patient_id)
            ]);

            setTasks(taskList || []);
            setAchievements(achievList || []);
            setUnlockedAchievements(unlockedList || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const handleCompleteTask = async (task) => {
        if (task.status === 'concluida') return;
        setCompletingTask(task.id);
        try {
            await dataService.completeTask(task.id, accessCode.patient_id);
            setShowReward({ coins: task.coins_reward || 10, xp: task.xp_reward || 25 });

            // Refresh data
            setTimeout(async () => {
                await loadPortalData();
                setCompletingTask(null);
                setTimeout(() => setShowReward(null), 2000);
            }, 800);
        } catch (err) {
            console.error(err);
            setCompletingTask(null);
        }
    };

    const coins = patient?.coins || 0;
    const xp = patient?.xp || 0;
    const level = patient?.level || 1;
    const xpForNext = level * 100;
    const xpProgress = (xp % 100) / 100 * 100;

    const completedTasks = tasks.filter(t => t.status === 'concluida').length;
    const pendingTasks = tasks.filter(t => t.status !== 'concluida');
    const doneTasks = tasks.filter(t => t.status === 'concluida');

    const difficultyConfig = {
        facil: { color: '#10b981', label: 'Fácil', stars: 1 },
        normal: { color: '#3b82f6', label: 'Normal', stars: 2 },
        dificil: { color: '#f59e0b', label: 'Difícil', stars: 3 },
        epico: { color: '#ef4444', label: 'Épico', stars: 4 },
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh', background: '#0f172a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: '16px'
            }}>
                <div style={{ fontSize: '48px', animation: 'bounce 1s infinite' }}>🎮</div>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>Carregando suas missões...</p>
                <style>{`
                    @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #0f172a 0%, #0c1222 100%)',
            color: '#f8fafc', paddingBottom: '80px'
        }}>
            {/* Reward Popup */}
            {showReward && (
                <div style={{
                    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)',
                    borderRadius: '24px', padding: '40px', textAlign: 'center',
                    zIndex: 1000, border: '2px solid rgba(139,92,246,0.3)',
                    boxShadow: '0 0 60px rgba(139,92,246,0.2)',
                    animation: 'scaleIn 0.4s ease-out'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'bounce 0.6s ease' }}>🎉</div>
                    <h2 style={{ fontSize: '22px', fontFamily: 'Outfit', marginBottom: '16px' }}>Missão Completa!</h2>
                    <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#fbbf24' }}>+{showReward.coins}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Moedas</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#8b5cf6' }}>+{showReward.xp}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>XP</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="portal-header" style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(16,185,129,0.08))',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                padding: '16px 16px 24px'
            }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    {/* Top Bar */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginBottom: '20px'
                    }}>
                        <button onClick={() => navigate('/portal')} style={{
                            background: 'none', border: 'none', color: '#94a3b8',
                            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                            fontSize: '13px'
                        }}>
                            <ArrowLeft size={16} /> Sair
                        </button>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px',
                            borderRadius: '100px', background: 'rgba(16,185,129,0.1)',
                            border: '1px solid rgba(16,185,129,0.2)'
                        }}>
                            <Gamepad2 size={14} color="#10b981" />
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#10b981' }}>Modo Aventura</span>
                        </div>
                    </div>

                    {/* Player Card */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '16px',
                        marginBottom: '20px'
                    }}>
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '18px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '28px', border: '3px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 4px 20px rgba(99,102,241,0.3)', flexShrink: 0
                        }}>
                            {patient?.avatar_emoji || '🧒'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '10px', color: '#a78bfa', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Aventureiro(a)
                            </div>
                            <h1 style={{
                                fontSize: '20px', fontFamily: 'Outfit', fontWeight: '700',
                                marginBottom: '4px'
                            }}>
                                {patient?.name}
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                    padding: '2px 10px', borderRadius: '100px',
                                    background: 'rgba(139,92,246,0.15)', color: '#a78bfa',
                                    fontSize: '12px', fontWeight: '700'
                                }}>
                                    Nível {level}
                                </span>
                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                    {xp} / {xpForNext} XP
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Psychologist Info Card (Gamified) */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)', borderRadius: '14px',
                        padding: '10px 16px', border: '1px solid rgba(255,255,255,0.05)',
                        marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px'
                    }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '10px',
                            background: 'rgba(139,92,246,0.1)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Brain size={16} color="#a78bfa" />
                        </div>
                        <div>
                            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>
                                Sua Psicóloga
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>
                                Dr(a). {psychologist?.full_name || 'Profissional'}
                            </div>
                        </div>
                    </div>

                    {/* XP Progress Bar */}
                    <div style={{
                        width: '100%', height: '8px', borderRadius: '100px',
                        background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: '16px'
                    }}>
                        <div style={{
                            height: '100%', borderRadius: '100px',
                            background: 'linear-gradient(90deg, #8b5cf6, #6366f1)',
                            width: `${xpProgress}%`,
                            transition: 'width 0.5s ease',
                            boxShadow: '0 0 10px rgba(139,92,246,0.4)'
                        }} />
                    </div>

                    {/* Stats Row */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{
                            flex: 1, padding: '12px', borderRadius: '12px',
                            background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#fbbf24', fontFamily: 'Outfit' }}>
                                {coins}
                            </div>
                            <div style={{ fontSize: '10px', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <Coins size={12} /> Moedas
                            </div>
                        </div>
                        <div style={{
                            flex: 1, padding: '12px', borderRadius: '12px',
                            background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#a78bfa', fontFamily: 'Outfit' }}>
                                {completedTasks}
                            </div>
                            <div style={{ fontSize: '10px', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <Target size={12} /> Missões
                            </div>
                        </div>
                        <div style={{
                            flex: 1, padding: '12px', borderRadius: '12px',
                            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981', fontFamily: 'Outfit' }}>
                                {unlockedAchievements.length}
                            </div>
                            <div style={{ fontSize: '10px', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <Trophy size={12} /> Troféus
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px 16px' }}>
                {/* Tabs */}
                <div style={{
                    display: 'flex', gap: '4px', marginBottom: '20px',
                    background: 'rgba(30,41,59,0.4)', borderRadius: '14px', padding: '4px'
                }}>
                    {[
                        { key: 'missoes', label: 'Missões', icon: <Target size={15} /> },
                        { key: 'conquistas', label: 'Troféus', icon: <Trophy size={15} /> },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                flex: 1, padding: '11px', borderRadius: '12px',
                                background: activeTab === tab.key
                                    ? 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.15))'
                                    : 'transparent',
                                color: activeTab === tab.key ? '#a78bfa' : '#94a3b8',
                                border: activeTab === tab.key
                                    ? '1px solid rgba(139,92,246,0.2)' : '1px solid transparent',
                                fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* MISSIONS TAB */}
                {activeTab === 'missoes' && (
                    <div>
                        {/* Pending missions */}
                        {pendingTasks.length > 0 && (
                            <>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    marginBottom: '14px'
                                }}>
                                    <Flame size={16} color="#fb923c" />
                                    <h3 style={{ fontSize: '15px', fontWeight: '600' }}>
                                        Missões Ativas ({pendingTasks.length})
                                    </h3>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                                    {pendingTasks.map((task, idx) => {
                                        const diff = difficultyConfig[task.difficulty] || difficultyConfig.normal;
                                        const isCompleting = completingTask === task.id;

                                        return (
                                            <div key={task.id} style={{
                                                background: 'rgba(30,41,59,0.6)', borderRadius: '16px',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                padding: '16px', display: 'flex', alignItems: 'center', gap: '14px',
                                                transition: 'all 0.3s',
                                                transform: isCompleting ? 'scale(0.98)' : 'scale(1)',
                                                opacity: isCompleting ? 0.6 : 1,
                                                animation: `fadeIn 0.4s ease-out ${idx * 0.05}s both`
                                            }}>
                                                {/* Task icon */}
                                                <div style={{
                                                    width: '48px', height: '48px', borderRadius: '14px',
                                                    background: `${diff.color}15`,
                                                    border: `1px solid ${diff.color}30`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '22px', flexShrink: 0
                                                }}>
                                                    {task.emoji || '⭐'}
                                                </div>

                                                {/* Task info */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                                                        {task.title}
                                                    </div>
                                                    {task.description && (
                                                        <div style={{
                                                            fontSize: '12px', color: '#94a3b8', marginBottom: '6px',
                                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                                        }}>
                                                            {task.description}
                                                        </div>
                                                    )}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                            <Coins size={12} /> +{task.coins_reward || 10}
                                                        </span>
                                                        <span style={{ fontSize: '11px', color: '#a78bfa', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                            <Zap size={12} /> +{task.xp_reward || 25} XP
                                                        </span>
                                                        <span style={{
                                                            fontSize: '10px', color: diff.color, fontWeight: '600',
                                                            padding: '2px 8px', borderRadius: '100px',
                                                            background: `${diff.color}10`
                                                        }}>
                                                            {diff.label}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Complete button */}
                                                <button
                                                    onClick={() => handleCompleteTask(task)}
                                                    disabled={isCompleting}
                                                    style={{
                                                        width: '44px', height: '44px', borderRadius: '14px',
                                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                                        border: 'none', cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: 'white', flexShrink: 0,
                                                        boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <CheckCircle size={20} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* Completed missions */}
                        {doneTasks.length > 0 && (
                            <>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    marginBottom: '14px'
                                }}>
                                    <CheckCircle size={16} color="#10b981" />
                                    <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#94a3b8' }}>
                                        Completadas ({doneTasks.length})
                                    </h3>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {doneTasks.slice(0, 5).map(task => (
                                        <div key={task.id} style={{
                                            background: 'rgba(30,41,59,0.3)', borderRadius: '12px',
                                            padding: '14px', display: 'flex', alignItems: 'center', gap: '12px',
                                            opacity: 0.6
                                        }}>
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '10px',
                                                background: 'rgba(16,185,129,0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '16px', flexShrink: 0
                                            }}>
                                                {task.emoji || '✅'}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '500', fontSize: '13px', textDecoration: 'line-through' }}>
                                                    {task.title}
                                                </div>
                                            </div>
                                            <CheckCircle size={16} color="#10b981" />
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {tasks.length === 0 && (
                            <div style={{
                                textAlign: 'center', padding: '60px 24px',
                                background: 'rgba(30,41,59,0.4)', borderRadius: '16px'
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
                                <p style={{ color: '#94a3b8', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                                    Nenhuma missão disponível
                                </p>
                                <p style={{ color: '#64748b', fontSize: '13px' }}>
                                    Aguarde sua psicóloga criar novas missões para você!
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* ACHIEVEMENTS TAB */}
                {activeTab === 'conquistas' && (
                    <div>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px'
                        }}>
                            <Medal size={16} color="#fbbf24" />
                            <h3 style={{ fontSize: '15px', fontWeight: '600' }}>
                                Suas Conquistas ({unlockedAchievements.length}/{achievements.length})
                            </h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                            {achievements.map((ach, idx) => {
                                const isUnlocked = unlockedAchievements.some(
                                    ua => ua.achievement_id === ach.id
                                );

                                return (
                                    <div key={ach.id} style={{
                                        background: isUnlocked
                                            ? 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(99,102,241,0.08))'
                                            : 'rgba(30,41,59,0.4)',
                                        borderRadius: '16px', padding: '18px 14px', textAlign: 'center',
                                        border: isUnlocked
                                            ? '1px solid rgba(139,92,246,0.2)'
                                            : '1px solid rgba(255,255,255,0.03)',
                                        opacity: isUnlocked ? 1 : 0.45,
                                        transition: 'all 0.3s',
                                        animation: `fadeIn 0.4s ease-out ${idx * 0.05}s both`
                                    }}>
                                        <div style={{
                                            fontSize: '32px', marginBottom: '10px',
                                            filter: isUnlocked ? 'none' : 'grayscale(100%)',
                                            transition: 'filter 0.3s'
                                        }}>
                                            {ach.emoji || '🏆'}
                                        </div>
                                        <div style={{
                                            fontWeight: '700', fontSize: '13px', marginBottom: '4px',
                                            color: isUnlocked ? '#f8fafc' : '#64748b'
                                        }}>
                                            {ach.title}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px', lineHeight: '1.3' }}>
                                            {ach.description}
                                        </div>
                                        <div style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                            fontSize: '11px', fontWeight: '600',
                                            color: isUnlocked ? '#10b981' : '#475569'
                                        }}>
                                            {isUnlocked ? <Unlock size={12} /> : <Lock size={12} />}
                                            {isUnlocked ? 'Desbloqueada!' : `+${ach.coins_bonus} 🪙`}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {achievements.length === 0 && (
                            <div style={{
                                textAlign: 'center', padding: '60px 24px',
                                background: 'rgba(30,41,59,0.4)', borderRadius: '16px'
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
                                <p style={{ color: '#94a3b8', fontSize: '15px' }}>Conquistas em breve!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes scaleIn {
                    from { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
                    to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-12px); }
                }
            `}</style>
        </div>
    );
};

export default StudentPortal;
