import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import {
    Calendar, Clock, User, MessageSquare, CheckCircle,
    XCircle, ExternalLink, Search, Filter, AlertCircle
} from 'lucide-react';

const SiteBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user?.id) {
            loadBookings();
        }
    }, [user]);

    const loadBookings = async () => {
        setLoading(true);
        try {
            // Busca todos os agendamentos do futuro que não possuem patient_id (são do site)
            const today = new Date().toISOString().split('T')[0];
            const data = await dataService.getAppointments(today, null, user?.id);

            // Filtra agendamentos que vieram do site (possuem patient_name_manual e não possuem patient_id)
            const siteOnly = data.filter(appt => !appt.patient_id && appt.patient_name_manual);
            setBookings(siteOnly);
        } catch (err) {
            console.error("Erro ao carregar agendamentos do site:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (id) => {
        try {
            await dataService.updateAppointment(id, { status: 'confirmado' });
            loadBookings();
        } catch (err) {
            alert("Erro ao confirmar agendamento.");
        }
    };

    const handleCancel = async (id) => {
        if (!confirm("Deseja cancelar esta solicitação do site?")) return;
        try {
            await dataService.updateAppointment(id, { status: 'cancelado' });
            loadBookings();
        } catch (err) {
            alert("Erro ao cancelar agendamento.");
        }
    };

    const openWhatsApp = (phone, name, date, time) => {
        const msg = window.encodeURIComponent(`Olá ${name}, aqui é da clínica Dra. Mayne Margadona. Recebemos seu agendamento pelo site para o dia ${date.split('-').reverse().join('/')} às ${time}. Podemos confirmar?`);
        window.open(`https://wa.me/55${phone}?text=${msg}`, '_blank');
    };

    const filteredBookings = bookings.filter(b =>
        b.patient_name_manual?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade" style={{ padding: '24px 0' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Validação de Agendamentos (Site)</h1>
                <p style={{ color: '#94a3b8' }}>Gerencie e confirme as solicitações vindas da sua landing page.</p>
            </div>

            <div style={{
                display: 'flex', gap: '16px', marginBottom: '24px',
                flexWrap: 'wrap', alignItems: 'center'
            }}>
                <div style={{
                    flex: 1, minWidth: '300px', position: 'relative',
                    background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center',
                    padding: '0 16px'
                }}>
                    <Search size={18} color="#64748b" />
                    <input
                        type="text"
                        placeholder="Buscar por nome do paciente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            background: 'none', border: 'none', color: 'white', padding: '12px',
                            width: '100%', outline: 'none', fontSize: '14px'
                        }}
                    />
                </div>
                <button
                    onClick={loadBookings}
                    style={{
                        padding: '12px 20px', borderRadius: '12px', background: 'rgba(139,92,246,0.1)',
                        color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)', fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    Atualizar Lista
                </button>
            </div>

            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Carregando solicitações...</div>
            ) : filteredBookings.length === 0 ? (
                <div style={{
                    padding: '80px 40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)',
                    borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)'
                }}>
                    <Calendar size={48} color="#1e293b" style={{ marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Tudo em dia!</h3>
                    <p style={{ color: '#334155' }}>Nenhum novo agendamento pendente vindo do site no momento.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {filteredBookings.map(booking => (
                        <div key={booking.id} style={{
                            padding: '24px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between',
                            alignItems: 'center', flexWrap: 'wrap', gap: '20px'
                        }}>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <div style={{
                                    width: '56px', height: '56px', borderRadius: '16px',
                                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontSize: '20px', fontWeight: '800'
                                }}>
                                    {booking.patient_name_manual?.charAt(0)}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>{booking.patient_name_manual}</h3>
                                    <div style={{ display: 'flex', gap: '16px', color: '#94a3b8', fontSize: '13px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Calendar size={14} /> {booking.date.split('-').reverse().join('/')}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Clock size={14} /> {booking.start_time}
                                        </span>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: '100px',
                                            background: booking.status === 'agendado' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                                            color: booking.status === 'agendado' ? '#f59e0b' : '#10b981',
                                            fontWeight: '700', fontSize: '11px', textTransform: 'uppercase'
                                        }}>
                                            {booking.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => openWhatsApp(booking.phone_manual, booking.patient_name_manual, booking.date, booking.start_time)}
                                    style={{
                                        padding: '12px 16px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)',
                                        color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', fontWeight: '700',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                                    }}
                                >
                                    <MessageSquare size={16} /> Falar no WhatsApp
                                </button>

                                {booking.status === 'agendado' && (
                                    <button
                                        onClick={() => handleConfirm(booking.id)}
                                        style={{
                                            padding: '12px 16px', borderRadius: '12px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                            color: 'white', border: 'none', fontWeight: '700',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                                        }}
                                    >
                                        <CheckCircle size={16} /> Validar Agendamento
                                    </button>
                                )}

                                <button
                                    onClick={() => handleCancel(booking.id)}
                                    style={{
                                        padding: '12px', borderRadius: '12px', background: 'rgba(239,68,68,0.05)',
                                        color: '#ef4444', border: '1px solid rgba(239,68,68,0.1)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <XCircle size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div style={{
                marginTop: '40px', padding: '24px', borderRadius: '20px',
                background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)',
                display: 'flex', gap: '16px', alignItems: 'flex-start'
            }}>
                <AlertCircle size={20} color="#3b82f6" />
                <div style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6' }}>
                    <strong style={{ color: '#e2e8f0', display: 'block', marginBottom: '4px' }}>Como funciona a validação?</strong>
                    Os horários mostrados aqui foram reservados por clientes diretamente no seu site.
                    Ao clicar em <strong>Validar</strong>, você confirma que viu o agendamento e ele permanece fixo na sua agenda principal.
                    Recomendamos sempre entrar em contato via WhatsApp para confirmar a primeira sessão.
                </div>
            </div>
        </div>
    );
};

export default SiteBookings;
