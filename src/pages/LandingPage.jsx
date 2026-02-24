import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Brain, Heart, Shield, Sparkles, Users, Calendar,
    ChevronRight, ArrowRight, CheckCircle, Lock,
    MessageSquare, Clock, MapPin, Award, AlertCircle, FileText, Check, X
} from 'lucide-react';
import { dataService } from '../services/dataService';

const LandingPage = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [bookingForm, setBookingForm] = useState({ name: '', phone: '', email: '' });
    const [bookingSuccess, setBookingSuccess] = useState(false);

    const maskPhone = (value) => {
        if (!value) return "";
        value = value.replace(/\D/g, "");
        value = value.replace(/(\d{2})(\d)/, "($1) $2");
        value = value.replace(/(\d{5})(\d)/, "$1-$2");
        return value.substring(0, 15);
    };

    const handlePhoneChange = (e) => {
        const maskedValue = maskPhone(e.target.value);
        setBookingForm({ ...bookingForm, phone: maskedValue });
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Definição dos horários de atendimento (base para cálculo de livres)
    const baseSchedule = {
        1: { start: 13, end: 17 }, // Segunda
        3: { start: 13, end: 22 }, // Quarta
        4: { start: 13, end: 17 }, // Quinta
        5: { start: 13, end: 17 }, // Sexta
        6: { start: 8, end: 12 },  // Sábado
    };

    useEffect(() => {
        fetchAvailableSlots();
    }, [selectedDate]);

    const fetchAvailableSlots = async () => {
        setLoadingSlots(true);
        try {
            const date = new Date(selectedDate);
            const dayOfWeek = date.getUTCDay();
            const hours = baseSchedule[dayOfWeek];

            if (!hours) {
                setAvailableSlots([]);
                return;
            }

            // Busca agendamentos existentes para este dia
            const existing = await dataService.getAppointments(selectedDate, selectedDate);

            // Gera slots de 1h (50min sessão + 10min intervalo)
            const slots = [];
            for (let h = hours.start; h < hours.end; h++) {
                const timeStr = `${h.toString().padStart(2, '0')}:00`;
                const isTaken = existing.some(app => app.start_time.startsWith(timeStr));

                if (!isTaken) {
                    slots.push(timeStr);
                }
            }
            setAvailableSlots(slots);
        } catch (err) {
            console.error("Erro ao buscar horários:", err);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        try {
            // Limpa a máscara para salvar apenas números
            const rawPhone = bookingForm.phone.replace(/\D/g, '');

            // Busca o ID da Dra. Mayne para o agendamento aparecer na agenda dela
            const psychologist = await dataService.getPrimaryPsychologist();

            if (!psychologist?.id) {
                throw new Error("ID do psicólogo não encontrado.");
            }

            await dataService.createAppointment({
                psychologist_id: psychologist.id,
                date: selectedDate,
                start_time: selectedSlot,
                end_time: `${(parseInt(selectedSlot.split(':')[0]) + 1).toString().padStart(2, '0')}:00`,
                patient_name_manual: bookingForm.name,
                status: 'confirmado',
                session_type: 'individual',
                notes: `Agendado via site. WhatsApp: ${bookingForm.phone}`,
                phone_manual: rawPhone
            });

            setBookingSuccess(true);

            // Mensagem do CLIENTE para a DRA. (Primeira pessoa)
            const msgFromCustomer = `Olá Dra. Mayne, acabei de realizar o agendamento de uma consulta pelo seu site!\n\n👤 *Paciente:* ${bookingForm.name}\n📅 *Data:* ${selectedDate.split('-').reverse().join('/')}\n⏰ *Horário:* ${selectedSlot}\n\nPoderia me confirmar o recebimento desta reserva?`;
            const encoded = window.encodeURIComponent(msgFromCustomer);

            setTimeout(() => {
                window.open(`https://wa.me/5554999999999?text=${encoded}`, '_blank');
                setShowBookingModal(false);
                setBookingSuccess(false);
                fetchAvailableSlots();
            }, 2000);
        } catch (err) {
            alert("Erro ao confirmar agendamento. Tente via WhatsApp.");
        }
    };

    const openWhatsApp = (slot = null) => {
        let msg = "Olá Dra. Mayne, gostaria de consultar a disponibilidade para um agendamento clínico.";
        if (slot) {
            msg = `Olá Dra. Mayne, vi no site que o horário das ${slot} no dia ${selectedDate.split('-').reverse().join('/')} está livre e gostaria de reservá-lo para uma consulta.`;
        }
        const encoded = window.encodeURIComponent(msg);
        window.open(`https://wa.me/5554999999999?text=${encoded}`, '_blank');
    };

    return (
        <div style={{
            minHeight: '100vh', background: '#0a101e', color: '#f8fafc',
            fontFamily: "'Outfit', 'Inter', sans-serif", overflowX: 'hidden'
        }}>
            {/* ==================== NAVBAR ==================== */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                padding: scrolled ? '12px 24px' : '20px 24px',
                background: scrolled ? 'rgba(10,16,30,0.98)' : 'transparent',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(139,92,246,0.1)' : 'none',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                <div style={{
                    maxWidth: '1200px', margin: '0 auto',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '12px',
                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '20px', fontWeight: '900', color: 'white',
                            boxShadow: '0 4px 12px rgba(139,92,246,0.3)'
                        }}>B</div>
                        <div>
                            <span style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px', display: 'block', lineHeight: 1 }}>Bloom</span>
                            <span style={{ fontSize: '10px', color: '#a78bfa', fontWeight: '700', textTransform: 'uppercase' }}>Dra. Mayne | CRP 12/29287</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <a href="#agendamento" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: '600', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Agendar Online</a>
                        <button onClick={() => navigate('/login')} style={{
                            background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
                            padding: '10px 24px', borderRadius: '12px', color: '#a78bfa', fontSize: '14px',
                            fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                            transition: 'all 0.3s'
                        }}>
                            <Lock size={14} /> Área Restrita
                        </button>
                    </div>
                </div>
            </nav>

            {/* ==================== HERO SECTION ==================== */}
            <section style={{
                padding: '200px 24px 100px', textAlign: 'center', position: 'relative'
            }}>
                <div style={{
                    position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
                    width: '800px', height: '500px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
                    filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0
                }} />

                <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '8px 20px', borderRadius: '100px', background: 'rgba(139,92,246,0.15)',
                        color: '#a78bfa', fontSize: '13px', fontWeight: '800', marginBottom: '32px',
                        textTransform: 'uppercase', letterSpacing: '2px', border: '1px solid rgba(139,92,246,0.2)'
                    }}>
                        <Award size={16} /> Especialista em Neuropsicologia & TCC
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(40px, 9vw, 72px)', fontWeight: '900', marginBottom: '24px',
                        lineHeight: '1.05', letterSpacing: '-2px', background: 'linear-gradient(to bottom, #fff 40%, #94a3b8)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                        Dra. Mayne Margadona
                    </h1>

                    <p style={{
                        fontSize: 'clamp(18px, 4vw, 22px)', color: '#94a3b8', marginBottom: '48px',
                        lineHeight: '1.6', maxWidth: '750px', margin: '0 auto 48px', fontWeight: '400'
                    }}>
                        Acolhimento clínico de alta performance focado em crianças e adolescentes.
                        Investigação cognitiva profunda e reestruturação comportamental com ética e evidência científica.
                    </p>

                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href="#agendamento" style={{
                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                            border: 'none', padding: '18px 40px', borderRadius: '16px',
                            color: 'white', fontWeight: '800', fontSize: '18px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '12px',
                            boxShadow: '0 12px 30px rgba(139,92,246,0.3)',
                            transform: 'translateY(0)', transition: 'all 0.3s ease',
                            textDecoration: 'none'
                        }} onMouseEnter={e => e.target.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.target.style.transform = 'translateY(0)'}>
                            Escolher Horário <ArrowRight size={22} />
                        </a>
                        <button onClick={() => openWhatsApp()} style={{
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                            padding: '18px 40px', borderRadius: '16px', color: 'white',
                            fontWeight: '700', fontSize: '18px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.3s'
                        }} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.06)'} onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.03)'}>
                            Suporte WhatsApp <MessageSquare size={20} />
                        </button>
                    </div>
                </div>
            </section>

            {/* ==================== INFO CARDS ==================== */}
            <section style={{ padding: '40px 24px 80px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px'
                }}>
                    <div className="spec-card" style={{ padding: '40px 32px', borderRadius: '28px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Brain size={32} color="#a78bfa" style={{ marginBottom: '24px' }} />
                        <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '16px' }}>Neuropsicologia</h3>
                        <p style={{ color: '#94a3b8', lineHeight: '1.7' }}>Avaliação completa de funções executivas, memória e atenção para diagnósticos precisos em crianças e jovens.</p>
                    </div>
                    <div className="spec-card" style={{ padding: '40px 32px', borderRadius: '28px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Heart size={32} color="#a78bfa" style={{ marginBottom: '24px' }} />
                        <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '16px' }}>Terapia TCC</h3>
                        <p style={{ color: '#94a3b8', lineHeight: '1.7' }}>Abordagem focada em resultados práticos, ajudando no manejo da ansiedade, depressão e desafios escolares.</p>
                    </div>
                    <div className="spec-card" style={{ padding: '40px 32px', borderRadius: '28px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Shield size={32} color="#a78bfa" style={{ marginBottom: '24px' }} />
                        <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '16px' }}>Sigilo Ético</h3>
                        <p style={{ color: '#94a3b8', lineHeight: '1.7' }}>Prontuário 100% digital e seguro, com acesso restrito à profissional, garantindo total privacidade do paciente.</p>
                    </div>
                </div>
            </section>

            {/* ==================== DYNAMIC AGENDAMENTO ==================== */}
            <section id="agendamento" style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{
                    background: 'rgba(255,255,255,0.02)', borderRadius: '40px', padding: '60px',
                    border: '1px solid rgba(139,92,246,0.1)', boxShadow: '0 40px 100px rgba(0,0,0,0.2)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '16px' }}>Reserve sua Consulta Online</h2>
                        <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
                            Selecione um dia no calendário para visualizar os horários livres em tempo real.
                            O agendamento é imediato e confirmado por sistema.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) 1fr', gap: '60px' }} className="booking-grid">
                        {/* Date Picker */}
                        <div style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#a78bfa', marginBottom: '20px', textTransform: 'uppercase' }}>
                                📅 1. Selecione o Dia
                            </label>
                            <input
                                type="date"
                                value={selectedDate}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                style={{
                                    width: '100%', padding: '16px', borderRadius: '12px',
                                    background: '#0a0f1d', border: '1px solid rgba(139,92,246,0.3)',
                                    color: 'white', fontSize: '18px', fontWeight: '700', outline: 'none'
                                }}
                            />
                            <div style={{ marginTop: '32px', padding: '20px', borderRadius: '16px', background: 'rgba(139,92,246,0.05)', color: '#94a3b8', fontSize: '13px' }}>
                                <AlertCircle size={16} style={{ marginBottom: '8px', color: '#a78bfa' }} />
                                <p>Sábados apenas no período da manhã. Terças e Domingos o consultório está dedicado a perícias e estudos.</p>
                            </div>
                        </div>

                        {/* Slots Group */}
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#a78bfa', marginBottom: '20px', textTransform: 'uppercase' }}>
                                ⏰ 2. Horários Livres Encontrados
                            </label>

                            {loadingSlots ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Sincronizando com a nuvem...</div>
                            ) : availableSlots.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
                                    {availableSlots.map(slot => (
                                        <button
                                            key={slot}
                                            onClick={() => { setSelectedSlot(slot); setShowBookingModal(true); }}
                                            style={{
                                                padding: '20px', borderRadius: '16px', background: 'rgba(16,185,129,0.05)',
                                                border: '1px solid rgba(16,185,129,0.2)', color: '#10b981',
                                                fontWeight: '800', fontSize: '18px', cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={e => e.target.style.background = 'rgba(16,185,129,0.1)'}
                                            onMouseLeave={e => e.target.style.background = 'rgba(16,185,129,0.05)'}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '60px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                    <X size={40} style={{ color: '#ef4444', marginBottom: '16px', opacity: 0.5 }} />
                                    <p style={{ fontSize: '18px', fontWeight: '600', color: '#475569' }}>Nenhum horário livre para esta data.</p>
                                    <p style={{ color: '#334155', fontSize: '14px' }}>Tente outro dia ou consulte via WhatsApp.</p>
                                </div>
                            )}

                            <div style={{ marginTop: '40px', display: 'flex', gap: '16px' }}>
                                <button onClick={() => openWhatsApp()} style={{ background: 'transparent', border: 'none', color: '#10b981', fontWeight: '700', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <MessageSquare size={16} /> Não achou o que procurava? Fale no Whats
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== MODAL DE AGENDAMENTO ==================== */}
            {showBookingModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
                }}>
                    <div style={{
                        width: '100%', maxWidth: '480px', background: '#0f172a', borderRadius: '32px',
                        border: '1px solid rgba(139,92,246,0.3)', padding: '40px', position: 'relative'
                    }}>
                        <button onClick={() => setShowBookingModal(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>

                        {bookingSuccess ? (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                    <Check size={32} />
                                </div>
                                <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>Reservado!</h3>
                                <p style={{ color: '#94a3b8' }}>Seu horário foi bloqueado na agenda. Entraremos em contato para as instruções iniciais.</p>
                            </div>
                        ) : (
                            <>
                                <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Confirmar Reserva</h3>
                                <p style={{ color: '#94a3b8', marginBottom: '32px' }}>
                                    Você escolheu o dia <br /><strong style={{ color: '#fff' }}>{selectedDate.split('-').reverse().join('/')} às {selectedSlot}</strong>
                                </p>

                                <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <input
                                        type="text" placeholder="Nome completo do paciente" required
                                        value={bookingForm.name} onChange={e => setBookingForm({ ...bookingForm, name: e.target.value })}
                                        style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                                    />
                                    <input
                                        type="tel" placeholder="WhatsApp: (00) 00000-0000" required
                                        value={bookingForm.phone} onChange={handlePhoneChange}
                                        style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                                    />

                                    <button type="submit" style={{
                                        marginTop: '12px', padding: '16px', borderRadius: '14px', background: 'linear-gradient(135deg, #10b981, #059669)',
                                        color: 'white', fontWeight: '800', border: 'none', cursor: 'pointer', boxShadow: '0 10px 20px rgba(16,185,129,0.2)'
                                    }}>
                                        Confirmar Agendamento Online
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ==================== FOOTER ==================== */}
            <footer style={{ padding: '80px 24px 60px', textAlign: 'center', background: '#070b14', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px' }}>Bloom Psicologia</h3>
                    <p style={{ color: '#a78bfa', fontSize: '14px', fontWeight: '700', marginBottom: '24px' }}>Dra. Mayne Margadona | CRP 12/29287</p>
                    <p style={{ color: '#334155', fontSize: '11px' }}>© 2026 Bloom. Uso exclusivo para gestão clínica. Dados protegidos pela LGPD.</p>
                </div>
            </footer>

            <style>{`
                .spec-card:hover {
                    transform: translateY(-5px);
                    border-color: rgba(139,92,246,0.3) !important;
                    background: rgba(139,92,246,0.05) !important;
                }
                input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
                @media (max-width: 800px) { .booking-grid { grid-template-columns: 1fr !important; } }
                html { scroll-behavior: smooth; }
            `}</style>
        </div>
    );
};

export default LandingPage;
