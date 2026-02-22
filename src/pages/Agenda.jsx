import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import {
    Calendar, Clock, Plus, ChevronLeft, ChevronRight, X, User,
    CheckCircle, AlertCircle, Trash2, Edit3, MapPin
} from 'lucide-react';

const Agenda = () => {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [viewMode, setViewMode] = useState('semana'); // 'dia', 'semana', 'mes'

    const [form, setForm] = useState({
        patient_id: '',
        date: '',
        start_time: '09:00',
        end_time: '10:00',
        session_type: 'individual',
        notes: '',
        status: 'agendado',
        location: 'consultório'
    });

    useEffect(() => {
        if (!user?.id) return; // Wait for user to be loaded
        loadData();
    }, [user]);

    async function loadData() {
        try {
            const psychologistId = user?.id;
            const [patientList, apptList] = await Promise.all([
                dataService.getPatients(psychologistId),
                dataService.getAppointments(null, null, psychologistId)
            ]);
            setPatients(patientList || []);
            setAppointments(apptList || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    // Calendar logic
    const today = new Date();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const changeMonth = (delta) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
    };

    const isSameDay = (d1, d2) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const getAppointmentsForDate = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return appointments.filter(a => a.date === dateStr);
    };

    const selectedDateAppointments = getAppointmentsForDate(selectedDate)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));

    // Week view logic
    const getWeekDays = () => {
        const start = new Date(selectedDate);
        start.setDate(start.getDate() - start.getDay());
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const weekDays = getWeekDays();

    const timeSlots = [];
    for (let h = 7; h <= 20; h++) {
        timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
    }

    const getPatientName = (id) => patients.find(p => p.id === id)?.name || 'Paciente';

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingAppointment) {
                await dataService.updateAppointment(editingAppointment.id, {
                    ...form,
                    psychologist_id: user?.id
                });
            } else {
                await dataService.createAppointment({
                    ...form,
                    psychologist_id: user?.id
                });
            }
            setShowModal(false);
            setEditingAppointment(null);
            resetForm();
            await loadData();
        } catch (err) {
            alert('Erro ao salvar agendamento.');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Remover este agendamento?')) return;
        try {
            await dataService.deleteAppointment(id);
            await loadData();
        } catch (err) {
            alert('Erro ao remover agendamento.');
        }
    };

    const handleEdit = (appt) => {
        setForm({
            patient_id: appt.patient_id,
            date: appt.date,
            start_time: appt.start_time,
            end_time: appt.end_time,
            session_type: appt.session_type || 'individual',
            notes: appt.notes || '',
            status: appt.status || 'agendado',
            location: appt.location || 'consultório'
        });
        setEditingAppointment(appt);
        setShowModal(true);
    };

    const handleNewAppt = (date, time) => {
        const dateStr = date ? date.toISOString().split('T')[0] : selectedDate.toISOString().split('T')[0];
        const endH = parseInt(time?.split(':')[0] || '9') + 1;
        resetForm();
        setForm(prev => ({
            ...prev,
            date: dateStr,
            start_time: time || '09:00',
            end_time: `${endH.toString().padStart(2, '0')}:00`
        }));
        setShowModal(true);
    };

    const resetForm = () => {
        setForm({
            patient_id: '', date: '', start_time: '09:00', end_time: '10:00',
            session_type: 'individual', notes: '', status: 'agendado', location: 'consultório'
        });
        setEditingAppointment(null);
    };

    const statusConfig = {
        agendado: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', label: 'Agendado' },
        confirmado: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Confirmado' },
        cancelado: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Cancelado' },
        realizado: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', label: 'Realizado' },
    };

    const sessionTypes = {
        individual: { label: 'Individual', color: '#8b5cf6' },
        grupo: { label: 'Grupo', color: '#3b82f6' },
        avaliacao: { label: 'Avaliação', color: '#f59e0b' },
        devolutiva: { label: 'Devolutiva', color: '#10b981' },
        supervisao: { label: 'Supervisão', color: '#06b6d4' },
    };

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
        <div className="agenda-page animate-fade" style={{ padding: '24px 0' }}>
            {/* Header */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '24px', flexWrap: 'wrap', gap: '12px'
            }}>
                <div>
                    <h1 style={{ fontSize: '28px', marginBottom: '6px' }}>Agenda</h1>
                    <p className="text-muted">Gerencie suas sessões e compromissos.</p>
                </div>
                <button className="btn-primary" onClick={() => handleNewAppt()}>
                    <Plus size={18} /> Nova Sessão
                </button>
            </div>

            {/* View Switcher */}
            <div style={{
                display: 'flex', gap: '4px', marginBottom: '20px',
                background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '4px',
                overflowX: 'auto', WebkitOverflowScrolling: 'touch'
            }}>
                {[
                    { key: 'dia', label: 'Dia' },
                    { key: 'semana', label: 'Semana' },
                    { key: 'mes', label: 'Mês' },
                ].map(v => (
                    <button key={v.key} onClick={() => setViewMode(v.key)} style={{
                        flex: '1 0 auto', minWidth: '80px', padding: '10px', borderRadius: '10px',
                        background: viewMode === v.key ? 'rgba(139,92,246,0.12)' : 'transparent',
                        color: viewMode === v.key ? '#a78bfa' : '#94a3b8',
                        border: viewMode === v.key ? '1px solid rgba(139,92,246,0.15)' : '1px solid transparent',
                        fontWeight: '600', fontSize: '13px', cursor: 'pointer'
                    }}>
                        {v.label}
                    </button>
                ))}
            </div>

            <div className="agenda-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 300px) 1fr', gap: '24px' }}>
                {/* Left: Mini Calendar */}
                <div>
                    <div className="premium-card" style={{ padding: '20px' }}>
                        {/* Month nav */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            marginBottom: '20px'
                        }}>
                            <button onClick={() => changeMonth(-1)} style={{
                                background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8',
                                borderRadius: '8px', padding: '6px', cursor: 'pointer'
                            }}><ChevronLeft size={16} /></button>
                            <span style={{ fontWeight: '700', fontSize: '15px', fontFamily: 'Outfit' }}>
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </span>
                            <button onClick={() => changeMonth(1)} style={{
                                background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8',
                                borderRadius: '8px', padding: '6px', cursor: 'pointer'
                            }}><ChevronRight size={16} /></button>
                        </div>

                        {/* Day headers */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '8px' }}>
                            {dayNames.map(d => (
                                <div key={d} style={{
                                    textAlign: 'center', fontSize: '11px', color: '#64748b',
                                    fontWeight: '600', padding: '4px'
                                }}>{d}</div>
                            ))}
                        </div>

                        {/* Calendar grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const thisDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                                const isToday = isSameDay(thisDate, today);
                                const isSelected = isSameDay(thisDate, selectedDate);
                                const hasAppt = getAppointmentsForDate(thisDate).length > 0;

                                return (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDate(thisDate)}
                                        style={{
                                            width: '100%', aspectRatio: '1', borderRadius: '10px',
                                            display: 'flex', flexDirection: 'column',
                                            alignItems: 'center', justifyContent: 'center',
                                            fontSize: '13px', fontWeight: isSelected ? '700' : '500',
                                            cursor: 'pointer', border: 'none', position: 'relative',
                                            background: isSelected
                                                ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
                                                : isToday ? 'rgba(139,92,246,0.1)' : 'transparent',
                                            color: isSelected ? 'white' : isToday ? '#a78bfa' : '#e2e8f0',
                                            transition: 'all 0.15s'
                                        }}
                                    >
                                        {day}
                                        {hasAppt && (
                                            <div style={{
                                                width: '4px', height: '4px', borderRadius: '50%',
                                                background: isSelected ? 'white' : '#8b5cf6',
                                                position: 'absolute', bottom: '4px'
                                            }} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Today's summary */}
                    <div className="premium-card" style={{ padding: '18px', marginTop: '12px' }}>
                        <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '10px', fontWeight: '600' }}>
                            Resumo do Dia
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{
                                flex: 1, textAlign: 'center', padding: '10px', borderRadius: '10px',
                                background: 'rgba(139,92,246,0.06)'
                            }}>
                                <div style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'Outfit', color: '#a78bfa' }}>
                                    {selectedDateAppointments.length}
                                </div>
                                <div style={{ fontSize: '10px', color: '#94a3b8' }}>Sessões</div>
                            </div>
                            <div style={{
                                flex: 1, textAlign: 'center', padding: '10px', borderRadius: '10px',
                                background: 'rgba(16,185,129,0.06)'
                            }}>
                                <div style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'Outfit', color: '#10b981' }}>
                                    {selectedDateAppointments.filter(a => a.status === 'confirmado').length}
                                </div>
                                <div style={{ fontSize: '10px', color: '#94a3b8' }}>Confirmados</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Schedule */}
                <div>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginBottom: '16px'
                    }}>
                        <h2 style={{ fontSize: '18px', fontFamily: 'Outfit' }}>
                            {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                        </h2>
                    </div>

                    {/* Time slots */}
                    <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                        {selectedDateAppointments.length === 0 ? (
                            <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                                <Calendar size={40} color="#334155" style={{ marginBottom: '16px' }} />
                                <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '12px' }}>
                                    Nenhuma sessão agendada.
                                </p>
                                <button className="btn-primary" onClick={() => handleNewAppt(selectedDate)}
                                    style={{ margin: '0 auto', justifyContent: 'center', fontSize: '13px' }}>
                                    <Plus size={16} /> Agendar sessão
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {selectedDateAppointments.map((appt, idx) => {
                                    const st = statusConfig[appt.status] || statusConfig.agendado;
                                    const sType = sessionTypes[appt.session_type] || sessionTypes.individual;

                                    return (
                                        <div key={appt.id} style={{
                                            display: 'flex', gap: '16px', padding: '18px 20px',
                                            borderBottom: idx < selectedDateAppointments.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                            transition: 'background 0.2s', cursor: 'pointer'
                                        }}
                                            className="appt-row-hover"
                                        >
                                            {/* Time */}
                                            <div style={{ minWidth: '56px', flexShrink: 0 }}>
                                                <div style={{ fontSize: '16px', fontWeight: '700', color: '#a78bfa', fontFamily: 'Outfit' }}>
                                                    {appt.start_time}
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#64748b' }}>
                                                    {appt.end_time}
                                                </div>
                                            </div>

                                            {/* Color bar */}
                                            <div style={{
                                                width: '3px', borderRadius: '100px',
                                                background: sType.color, flexShrink: 0
                                            }} />

                                            {/* Content */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontWeight: '600', fontSize: '14px', marginBottom: '4px',
                                                    display: 'flex', alignItems: 'center', gap: '8px'
                                                }}>
                                                    {getPatientName(appt.patient_id)}
                                                    <span style={{
                                                        fontSize: '10px', padding: '2px 8px', borderRadius: '100px',
                                                        background: st.bg, color: st.color, fontWeight: '700',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {st.label}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    display: 'flex', gap: '12px', fontSize: '12px', color: '#94a3b8',
                                                    flexWrap: 'wrap'
                                                }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <User size={12} /> {sType.label}
                                                    </span>
                                                    {appt.location && (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <MapPin size={12} /> {appt.location}
                                                        </span>
                                                    )}
                                                </div>
                                                {appt.notes && (
                                                    <div style={{
                                                        fontSize: '12px', color: '#64748b', marginTop: '6px',
                                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                                    }}>
                                                        📝 {appt.notes}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                                <button onClick={() => handleEdit(appt)} style={{
                                                    background: 'rgba(255,255,255,0.05)', border: 'none',
                                                    borderRadius: '8px', padding: '8px', cursor: 'pointer',
                                                    color: '#94a3b8'
                                                }}>
                                                    <Edit3 size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(appt.id)} style={{
                                                    background: 'rgba(239,68,68,0.05)', border: 'none',
                                                    borderRadius: '8px', padding: '8px', cursor: 'pointer',
                                                    color: '#ef4444'
                                                }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Quick add floating */}
                    {selectedDateAppointments.length > 0 && (
                        <button onClick={() => handleNewAppt(selectedDate)} style={{
                            marginTop: '12px', width: '100%', padding: '14px', borderRadius: '12px',
                            border: '2px dashed rgba(139,92,246,0.2)', background: 'rgba(139,92,246,0.03)',
                            color: '#a78bfa', fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}>
                            <Plus size={16} /> Adicionar sessão neste dia
                        </button>
                    )}
                </div>
            </div>

            {/* ==================== APPOINTMENT MODAL ==================== */}
            {showModal && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); resetForm(); } }}>
                    <div className="premium-card modal-card animate-fade" style={{
                        width: '100%', maxWidth: '480px', padding: '28px',
                        backgroundColor: 'var(--bloom-surface)', position: 'relative'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <div>
                                <h2 style={{ fontSize: '20px', marginBottom: '4px' }}>
                                    {editingAppointment ? 'Editar Sessão' : 'Nova Sessão'}
                                </h2>
                                <p style={{ fontSize: '12px', color: '#94a3b8' }}>Agende uma sessão</p>
                            </div>
                            <button onClick={() => { setShowModal(false); resetForm(); }} style={{
                                background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer'
                            }}>
                                <X size={22} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Patient */}
                            <div>
                                <label style={labelStyle}>Paciente</label>
                                <select required value={form.patient_id}
                                    onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                                    style={{ ...inputStyle, cursor: 'pointer' }}
                                >
                                    <option value="">Selecionar paciente...</option>
                                    {patients.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date */}
                            <div>
                                <label style={labelStyle}>Data</label>
                                <input type="date" required value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                    style={inputStyle} />
                            </div>

                            {/* Time */}
                            <div className="modal-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={labelStyle}>Início</label>
                                    <input type="time" required value={form.start_time}
                                        onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                                        style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Fim</label>
                                    <input type="time" required value={form.end_time}
                                        onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                                        style={inputStyle} />
                                </div>
                            </div>

                            {/* Session type */}
                            <div>
                                <label style={labelStyle}>Tipo de Sessão</label>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {Object.entries(sessionTypes).map(([key, val]) => (
                                        <button key={key} type="button"
                                            onClick={() => setForm({ ...form, session_type: key })}
                                            style={{
                                                padding: '8px 14px', borderRadius: '100px', fontSize: '12px',
                                                fontWeight: '600', cursor: 'pointer',
                                                background: form.session_type === key ? `${val.color}15` : 'rgba(255,255,255,0.03)',
                                                border: form.session_type === key ? `2px solid ${val.color}` : '1px solid rgba(255,255,255,0.08)',
                                                color: form.session_type === key ? val.color : '#94a3b8'
                                            }}
                                        >{val.label}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label style={labelStyle}>Status</label>
                                <select value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    style={{ ...inputStyle, cursor: 'pointer' }}
                                >
                                    {Object.entries(statusConfig).map(([key, val]) => (
                                        <option key={key} value={key}>{val.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Location */}
                            <div>
                                <label style={labelStyle}>Local</label>
                                <input value={form.location}
                                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                                    placeholder="Ex: Consultório, Online"
                                    style={inputStyle} />
                            </div>

                            {/* Notes */}
                            <div>
                                <label style={labelStyle}>Observações</label>
                                <textarea value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    placeholder="Notas sobre a sessão..."
                                    rows={2} style={{ ...inputStyle, resize: 'none' }} />
                            </div>

                            <button type="submit" className="btn-primary" style={{
                                width: '100%', justifyContent: 'center', marginTop: '8px'
                            }}>
                                <CheckCircle size={18} /> {editingAppointment ? 'Salvar Alterações' : 'Agendar Sessão'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .appt-row-hover:hover { background-color: rgba(255,255,255,0.02); }
                @media (max-width: 768px) {
                    .agenda-layout {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Agenda;
