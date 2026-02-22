import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import {
    TrendingUp, TrendingDown, DollarSign, Plus, Filter,
    Download, Calendar, ArrowUpRight, ArrowDownRight,
    MoreHorizontal, CheckCircle, Clock, Trash2, PieChart
} from 'lucide-react';

const Financeiro = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [stats, setStats] = useState({ revenue: 0, expenses: 0, balance: 0 });

    const [form, setForm] = useState({
        type: 'receita',
        category: 'Sessão',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        status: 'pago',
        payment_method: 'Pix'
    });

    useEffect(() => {
        if (!user?.id) return; // Wait for user to be loaded
        loadData();
    }, [user]);

    async function loadData() {
        try {
            setLoading(true);
            const data = await dataService.getTransactions(user?.id);
            setTransactions(data || []);

            // Calculate stats
            const rev = data.filter(t => t.type === 'receita').reduce((acc, t) => acc + Number(t.amount), 0);
            const exp = data.filter(t => t.type === 'despesa').reduce((acc, t) => acc + Number(t.amount), 0);
            setStats({
                revenue: rev,
                expenses: exp,
                balance: rev - exp
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await dataService.createTransaction({
                ...form,
                psychologist_id: user?.id
            });
            setShowModal(false);
            resetForm();
            loadData();
        } catch (err) {
            alert('Erro ao salvar transação');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Deseja excluir esta transação?')) return;
        try {
            await dataService.deleteTransaction(id);
            loadData();
        } catch (err) {
            alert('Erro ao excluir');
        }
    };

    const resetForm = () => {
        setForm({
            type: 'receita', category: 'Sessão', amount: '',
            date: new Date().toISOString().split('T')[0],
            description: '', status: 'pago', payment_method: 'Pix'
        });
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency', currency: 'BRL'
        }).format(val);
    };

    const categories = {
        receita: ['Sessão', 'Avaliação', 'Laudo', 'Supervisão', 'Outros'],
        despesa: ['Aluguel', 'Material CRP', 'Marketing', 'Cursos', 'Software', 'Outros']
    };

    const inputStyle = {
        width: '100%', padding: '12px 14px', borderRadius: '10px',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        color: 'white', outline: 'none', fontSize: '14px'
    };

    return (
        <div className="financeiro-page animate-fade" style={{ padding: '24px 0' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Financeiro</h1>
                    <p className="text-muted">Gestão de fluxo de caixa e faturamento.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="premium-card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Download size={18} /> Exportar
                    </button>
                    <button className="btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Nova Transação
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="financeiro-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="premium-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.05 }}><TrendingUp size={100} /></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>Receita Total</span>
                        <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><ArrowUpRight size={18} /></div>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'Outfit', color: '#10b981' }}>{formatCurrency(stats.revenue)}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>Referente ao mês atual</div>
                </div>

                <div className="premium-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.05 }}><TrendingDown size={100} /></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>Despesas Totais</span>
                        <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}><ArrowDownRight size={18} /></div>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'Outfit', color: '#ef4444' }}>{formatCurrency(stats.expenses)}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>Gastos operacionais</div>
                </div>

                <div className="premium-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', border: '1px solid rgba(139,92,246,0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ color: '#a78bfa', fontSize: '14px', fontWeight: '600' }}>Saldo Líquido</span>
                        <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(139,92,246,0.1)', color: '#a78bfa' }}><DollarSign size={18} /></div>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'Outfit', color: 'white' }}>{formatCurrency(stats.balance)}</div>
                    <div style={{ fontSize: '12px', color: '#a78bfa', marginTop: '8px', opacity: 0.8 }}>Lucro real do período</div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Calendar size={20} color="#a78bfa" /> Transações Recentes
                    </h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '6px 12px', color: '#94a3b8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Filter size={14} /> Filtro
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center' }} className="loader">⌛ Carregando transações...</div>
                ) : transactions.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                        <DollarSign size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                        <p>Nenhuma transação registrada este mês.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <tr style={{ textAlign: 'left' }}>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>DATA</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>DESCRIÇÃO</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>CATEGORIA</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>VALOR</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>STATUS</th>
                                    <th style={{ padding: '16px 24px', width: '50px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).map((t, idx) => (
                                    <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }} className="row-hover">
                                        <td style={{ padding: '16px 24px', fontSize: '14px' }}>
                                            {new Date(t.date).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '500' }}>
                                            {t.description || t.category}
                                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{t.payment_method}</div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '100px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>{t.category}</span>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '15px', fontWeight: '700', color: t.type === 'receita' ? '#10b981' : '#ef4444' }}>
                                            {t.type === 'receita' ? '+' : '-'} {formatCurrency(t.amount)}
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: t.status === 'pago' ? '#10b981' : '#f59e0b' }}>
                                                {t.status === 'pago' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                                {t.status === 'pago' ? 'Pago' : 'Pendente'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }} className="delete-btn">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
                    <div className="premium-card animate-scale" style={{ width: '100%', maxWidth: '440px', padding: '32px' }}>
                        <h2 style={{ fontSize: '22px', marginBottom: '24px' }}>Nova Transação</h2>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px', marginBottom: '8px' }}>
                                <button type="button" onClick={() => setForm({ ...form, type: 'receita' })} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: form.type === 'receita' ? 'rgba(16,185,129,0.15)' : 'transparent', color: form.type === 'receita' ? '#10b981' : '#94a3b8', fontWeight: '700', cursor: 'pointer' }}>Receita</button>
                                <button type="button" onClick={() => setForm({ ...form, type: 'despesa' })} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: form.type === 'despesa' ? 'rgba(239,68,68,0.15)' : 'transparent', color: form.type === 'despesa' ? '#ef4444' : '#94a3b8', fontWeight: '700', cursor: 'pointer' }}>Despesa</button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '6px' }}>VALOR</label>
                                    <input type="number" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0,00" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '6px' }}>DATA</label>
                                    <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={inputStyle} />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '6px' }}>CATEGORIA</label>
                                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                                    {categories[form.type].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '6px' }}>MÉTODO DE PAGAMENTO</label>
                                <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} style={inputStyle}>
                                    <option value="Pix">Pix</option>
                                    <option value="Dinheiro">Dinheiro</option>
                                    <option value="Cartão">Cartão</option>
                                    <option value="Boleto">Boleto</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '6px' }}>DESCRIÇÃO (OPCIONAL)</label>
                                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex: Sessão João da Silva" style={inputStyle} />
                            </div>

                            <button type="submit" className="btn-primary" style={{ marginTop: '12px', justifyContent: 'center', width: '100%', padding: '14px', borderRadius: '12px' }}>
                                Salvar Transação
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .row-hover:hover { background-color: rgba(255,255,255,0.02) !important; }
                .delete-btn:hover { color: #ef4444 !important; }
                @media (max-width: 768px) {
                    .financeiro-page { padding: 12px 0; }
                }
            `}</style>
        </div>
    );
};

export default Financeiro;
