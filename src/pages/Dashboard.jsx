import React, { useEffect, useState } from 'react';
import {
    Users, Calendar, AlertCircle, Sparkles, TrendingUp,
    Clock, DollarSign, ArrowUpRight, CheckCircle,
    Target, UserPlus, FileText
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const { profile, user } = useAuth();
    const [stats, setStats] = useState({
        patients: 0,
        revenue: 0,
        weekSessions: 0,
        retentionRate: 94
    });

    const [recentPatients, setRecentPatients] = useState([]);

    useEffect(() => {
        if (!user?.id) return;
        loadDashboardData();
    }, [user]);

    async function loadDashboardData() {
        try {
            const psychologistId = user?.id;
            const [patients, transactions, appointments] = await Promise.all([
                dataService.getPatients(psychologistId),
                dataService.getTransactions(psychologistId),
                dataService.getAppointments(null, null, psychologistId)
            ]);

            const activePatients = patients?.length || 0;
            const monthlyRevenue = transactions
                ?.filter(t => t.type === 'receita')
                ?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;

            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            const weeklySessions = appointments?.filter(a => new Date(a.date) >= startOfWeek)?.length || 0;

            setStats({
                patients: activePatients,
                revenue: monthlyRevenue,
                weekSessions: weeklySessions,
                retentionRate: 94
            });

            setRecentPatients(patients?.slice(0, 4) || []);

        } catch (error) {
            console.error("Erro ao carregar dados do dashboard:", error);
        }
    }

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency', currency: 'BRL'
        }).format(val);
    };

    return (
        <div className="dashboard-content animate-fade" style={{ padding: '24px 0' }}>
            {/* Top Welcome Section */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                marginBottom: '40px', flexWrap: 'wrap', gap: '20px'
            }}>
                <div style={{ flex: '1 1 300px' }}>
                    <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: '800', marginBottom: '8px', color: 'white' }}>
                        Olá, Dra. Mayne Margadona! 🌸
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                        CRP 12/29287 | Especialista em Neuropsicologia e TCC
                    </p>
                </div>
                <div style={{
                    display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.03)',
                    padding: '6px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)'
                }}>
                    <div style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '9px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Status</div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} /> Online
                        </div>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
                    <div style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '9px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Data</div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>
                            {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="stats-grid" style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px', marginBottom: '40px'
            }}>
                <div className="premium-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(139,92,246,0.1)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={18} />
                        </div>
                        <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>+12%</span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'Outfit' }}>{stats.patients}</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>Pacientes Ativos</div>
                </div>

                <div className="premium-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DollarSign size={18} />
                        </div>
                        <TrendingUp size={20} color="#10b981" />
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'Outfit', color: '#10b981' }}>{formatCurrency(stats.revenue)}</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>Receita Mensal</div>
                </div>

                <div className="premium-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Calendar size={18} />
                        </div>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Meta: 25</span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'Outfit' }}>{stats.weekSessions}</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>Sessões na Semana</div>
                </div>
            </div>

            {/* Main Application Content Grid */}
            <div className="db-main-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>

                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Recent Evolution Chart/Summary */}
                    <div className="premium-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '2px' }}>Visão Geral</h3>
                                <p style={{ fontSize: '12px', color: '#64748b' }}>Evolução clínica vs financeira</p>
                            </div>
                            <select style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '6px 10px', borderRadius: '8px', fontSize: '11px' }}>
                                <option>Últimos 30 dias</option>
                                <option>Últimos 90 dias</option>
                            </select>
                        </div>

                        <div style={{ height: '180px', width: '100%', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '10px' }}>
                            {[
                                { h: '40%', label: 'S1', rev: 1200 },
                                { h: '65%', label: 'S2', rev: 1800 },
                                { h: '55%', label: 'S3', rev: 1500 },
                                { h: '90%', label: 'S4', rev: 2500 },
                                { h: '75%', label: 'S5', rev: 2100 },
                            ].map((bar, i) => (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <div style={{
                                        width: '100%', height: bar.h, background: 'linear-gradient(to top, rgba(139,92,246,0.1), #8b5cf6)',
                                        borderRadius: '4px', position: 'relative', transition: 'height 0.3s ease'
                                    }}>
                                        <div style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', fontSize: '9px', color: '#94a3b8' }}>{bar.rev}</div>
                                    </div>
                                    <span style={{ fontSize: '10px', color: '#64748b' }}>{bar.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Patients Table */}
                    <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Últimos Pacientes</h3>
                            <button onClick={() => navigate('/pacientes')} style={{ fontSize: '12px', color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer' }}>Ver todos</button>
                        </div>
                        <div style={{ padding: '8px' }}>
                            {recentPatients.map(p => (
                                <div key={p.id} style={{
                                    display: 'flex', alignItems: 'center', gap: '12px', padding: '10px',
                                    borderRadius: '10px', transition: 'background 0.2s'
                                }} className="row-hover">
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', flexShrink: 0 }}>{p.name.charAt(0)}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                        <div style={{ fontSize: '10px', color: '#64748b' }}>Responsável: {p.responsible_name}</div>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontSize: '9px', color: '#10b981', fontWeight: '700' }}>ATIVO</div>
                                        <div style={{ fontSize: '10px', color: '#475569' }}>{new Date(p.created_at).toLocaleDateString('pt-BR')}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Quick Actions */}
                    <div className="premium-card" style={{ padding: '20px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Ações Rápidas</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button onClick={() => navigate('/pacientes')} style={{ padding: '12px 8px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(139,92,246,0.08)', color: '#a78bfa', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                <UserPlus size={18} />
                                <span style={{ fontSize: '10px', fontWeight: '600' }}>Novo Paciente</span>
                            </button>
                            <button onClick={() => navigate('/financeiro')} style={{ padding: '12px 8px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(16,185,129,0.08)', color: '#10b981', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                <DollarSign size={18} />
                                <span style={{ fontSize: '10px', fontWeight: '600' }}>Nova Receita</span>
                            </button>
                            <button onClick={() => navigate('/agenda')} style={{ padding: '12px 8px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(59,130,246,0.08)', color: '#3b82f6', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                <Calendar size={18} />
                                <span style={{ fontSize: '10px', fontWeight: '600' }}>Agendar</span>
                            </button>
                            <button onClick={() => navigate('/pacientes')} style={{ padding: '12px 8px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                <FileText size={18} />
                                <span style={{ fontSize: '10px', fontWeight: '600' }}>Relatório</span>
                            </button>
                        </div>
                    </div>

                    {/* AI Insights */}
                    <div className="premium-card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 10px', background: '#8b5cf6', fontSize: '9px', fontWeight: '900', color: 'white', borderRadius: '0 0 0 12px' }}>IA INSIGHT</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', marginTop: '6px' }}>
                            <Sparkles size={18} color="#a78bfa" />
                            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Agenda</h3>
                        </div>
                        <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', marginBottom: '16px' }}>
                            Sua agenda de <strong>Quarta-feira</strong> está com alta demanda para Avaliações Neuropsicológicas.
                        </p>
                        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', borderLeft: '3px solid #10b981' }}>
                            <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', marginBottom: '2px' }}>Foco Clínico</div>
                            <div style={{ fontSize: '14px', fontWeight: '800' }}>Neuropsicologia & TCC</div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .row-hover:hover { background: rgba(255,255,255,0.03); }
                @media (max-width: 1024px) {
                    .db-main-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
