import React, { useState } from 'react';
import { X, User, Calendar, Phone, CheckCircle2, MapPin, FileText, Heart, Brain, AlertCircle } from 'lucide-react';
import { dataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';

const PatientModal = ({ isOpen, onClose, onSave }) => {
    const { user } = useAuth();
    const [step, setStep] = useState(1); // Multi-step form
    const [formData, setFormData] = useState({
        // Step 1 - Dados Pessoais
        name: '',
        birth_date: '',
        gender: '',
        cpf: '',
        // Step 2 - Responsável
        responsible_name: '',
        responsible_phone: '',
        responsible_email: '',
        responsible_relationship: 'mãe',
        // Step 3 - Dados Clínicos
        school_name: '',
        school_grade: '',
        referral_source: '',
        main_complaint: '',
        diagnosis: '',
        medications: '',
        session_frequency: 'semanal',
        session_day: '',
        session_time: '',
        health_insurance: '',
        session_value: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step < 3) {
            setStep(step + 1);
            return;
        }

        setLoading(true);
        setError('');
        try {
            await dataService.createPatient({
                ...formData,
                psychologist_id: user?.id
            });
            setSuccess(true);
            setTimeout(() => {
                onSave();
                onClose();
                setSuccess(false);
                setStep(1);
                setFormData({
                    name: '', birth_date: '', gender: '', cpf: '',
                    responsible_name: '', responsible_phone: '', responsible_email: '',
                    responsible_relationship: 'mãe',
                    school_name: '', school_grade: '', referral_source: '',
                    main_complaint: '', diagnosis: '', medications: '',
                    session_frequency: 'semanal', session_day: '', session_time: '',
                    health_insurance: '', session_value: '', notes: ''
                });
            }, 1500);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Erro ao salvar. Verifique a conexão com o banco.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '13px 14px', borderRadius: '12px',
        backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        color: 'white', outline: 'none', fontSize: '14px',
        transition: 'border-color 0.2s'
    };

    const inputWithIconStyle = {
        ...inputStyle,
        paddingLeft: '44px'
    };

    const labelStyle = {
        display: 'block', fontSize: '11px', color: '#94a3b8',
        marginBottom: '6px', fontWeight: '700', textTransform: 'uppercase',
        letterSpacing: '0.5px'
    };

    const iconStyle = {
        position: 'absolute', left: '14px', top: '50%',
        transform: 'translateY(-50%)', color: '#a78bfa'
    };

    const selectStyle = {
        ...inputStyle,
        cursor: 'pointer',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 14px center'
    };

    const stepIndicator = (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {[1, 2, 3].map(s => (
                <div key={s} style={{
                    flex: 1, height: '4px', borderRadius: '100px',
                    background: s <= step ? 'linear-gradient(90deg, #8b5cf6, #a78bfa)' : 'rgba(255,255,255,0.06)',
                    transition: 'background 0.3s'
                }} />
            ))}
        </div>
    );

    const stepLabels = ['Dados Pessoais', 'Responsável', 'Dados Clínicos'];

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="premium-card modal-card animate-fade" style={{
                width: '100%', maxWidth: '540px', padding: '28px',
                backgroundColor: 'var(--bloom-surface)',
                position: 'relative', maxHeight: '90vh', overflowY: 'auto'
            }}>
                {success ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div style={{
                            backgroundColor: 'rgba(16, 185, 129, 0.1)', width: '80px', height: '80px',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 24px'
                        }}>
                            <CheckCircle2 size={48} color="var(--bloom-mint)" />
                        </div>
                        <h2 style={{ marginBottom: '8px' }}>Paciente Cadastrado!</h2>
                        <p className="text-muted">Adicionando {formData.name} à sua lista...</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div>
                                <h2 style={{ fontSize: '22px', marginBottom: '4px' }}>Novo Paciente</h2>
                                <p className="text-muted" style={{ fontSize: '13px' }}>
                                    Etapa {step}/3 — {stepLabels[step - 1]}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'none', color: 'var(--bloom-text-muted)', border: 'none',
                                    cursor: 'pointer', padding: '8px', borderRadius: '8px'
                                }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {stepIndicator}

                        {/* Error */}
                        {error && (
                            <div style={{
                                padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
                                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                                display: 'flex', alignItems: 'center', gap: '10px',
                                color: '#f87171', fontSize: '13px'
                            }}>
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                            {/* ===== STEP 1: Dados Pessoais ===== */}
                            {step === 1 && (
                                <>
                                    <div>
                                        <label style={labelStyle}>Nome Completo da Criança *</label>
                                        <div style={{ position: 'relative' }}>
                                            <User size={18} style={iconStyle} />
                                            <input
                                                required
                                                type="text"
                                                placeholder="Ex: Camila Renata Cardoso"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                style={inputWithIconStyle}
                                            />
                                        </div>
                                    </div>

                                    <div className="modal-form-row">
                                        <div>
                                            <label style={labelStyle}>Data de Nascimento *</label>
                                            <div style={{ position: 'relative' }}>
                                                <Calendar size={18} style={iconStyle} />
                                                <input
                                                    required
                                                    type="date"
                                                    value={formData.birth_date}
                                                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                                    style={inputWithIconStyle}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Sexo</label>
                                            <select
                                                value={formData.gender}
                                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                style={selectStyle}
                                            >
                                                <option value="">Selecionar</option>
                                                <option value="masculino">Masculino</option>
                                                <option value="feminino">Feminino</option>
                                                <option value="outro">Outro</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={labelStyle}>CPF da Criança (opcional)</label>
                                        <input
                                            type="text"
                                            placeholder="000.000.000-00"
                                            value={formData.cpf}
                                            onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                </>
                            )}

                            {/* ===== STEP 2: Responsável ===== */}
                            {step === 2 && (
                                <>
                                    <div>
                                        <label style={labelStyle}>Nome do Responsável *</label>
                                        <div style={{ position: 'relative' }}>
                                            <Heart size={18} style={iconStyle} />
                                            <input
                                                required
                                                type="text"
                                                placeholder="Nome completo do responsável"
                                                value={formData.responsible_name}
                                                onChange={(e) => setFormData({ ...formData, responsible_name: e.target.value })}
                                                style={inputWithIconStyle}
                                            />
                                        </div>
                                    </div>

                                    <div className="modal-form-row">
                                        <div>
                                            <label style={labelStyle}>Parentesco</label>
                                            <select
                                                value={formData.responsible_relationship}
                                                onChange={(e) => setFormData({ ...formData, responsible_relationship: e.target.value })}
                                                style={selectStyle}
                                            >
                                                <option value="mãe">Mãe</option>
                                                <option value="pai">Pai</option>
                                                <option value="avó">Avó</option>
                                                <option value="avô">Avô</option>
                                                <option value="tio(a)">Tio(a)</option>
                                                <option value="responsável legal">Responsável Legal</option>
                                                <option value="outro">Outro</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>WhatsApp *</label>
                                            <div style={{ position: 'relative' }}>
                                                <Phone size={16} style={{ ...iconStyle, left: '12px' }} />
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="(00) 00000-0000"
                                                    value={formData.responsible_phone}
                                                    onChange={(e) => setFormData({ ...formData, responsible_phone: e.target.value })}
                                                    style={{ ...inputStyle, paddingLeft: '36px' }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={labelStyle}>E-mail do Responsável</label>
                                        <input
                                            type="email"
                                            placeholder="email@exemplo.com"
                                            value={formData.responsible_email}
                                            onChange={(e) => setFormData({ ...formData, responsible_email: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>

                                    <div className="modal-form-row">
                                        <div>
                                            <label style={labelStyle}>Escola</label>
                                            <div style={{ position: 'relative' }}>
                                                <MapPin size={16} style={{ ...iconStyle, left: '12px' }} />
                                                <input
                                                    type="text"
                                                    placeholder="Nome da escola"
                                                    value={formData.school_name}
                                                    onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                                                    style={{ ...inputStyle, paddingLeft: '36px' }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Série / Ano</label>
                                            <input
                                                type="text"
                                                placeholder="Ex: 3º ano"
                                                value={formData.school_grade}
                                                onChange={(e) => setFormData({ ...formData, school_grade: e.target.value })}
                                                style={inputStyle}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* ===== STEP 3: Dados Clínicos ===== */}
                            {step === 3 && (
                                <>
                                    <div>
                                        <label style={labelStyle}>Queixa Principal</label>
                                        <div style={{ position: 'relative' }}>
                                            <Brain size={18} style={iconStyle} />
                                            <textarea
                                                placeholder="Descreva o motivo principal do encaminhamento..."
                                                value={formData.main_complaint}
                                                onChange={(e) => setFormData({ ...formData, main_complaint: e.target.value })}
                                                rows={3}
                                                style={{ ...inputWithIconStyle, resize: 'none', paddingTop: '12px' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="modal-form-row">
                                        <div>
                                            <label style={labelStyle}>Diagnóstico / CID (se houver)</label>
                                            <input
                                                type="text"
                                                placeholder="Ex: TEA - F84.0"
                                                value={formData.diagnosis}
                                                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                                style={inputStyle}
                                            />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Medicações em uso</label>
                                            <input
                                                type="text"
                                                placeholder="Ex: Risperidona 1mg"
                                                value={formData.medications}
                                                onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                                                style={inputStyle}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={labelStyle}>Encaminhado por</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Dra. Ana - Neuropediatra"
                                            value={formData.referral_source}
                                            onChange={(e) => setFormData({ ...formData, referral_source: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>

                                    <div className="modal-form-row">
                                        <div>
                                            <label style={labelStyle}>Frequência</label>
                                            <select
                                                value={formData.session_frequency}
                                                onChange={(e) => setFormData({ ...formData, session_frequency: e.target.value })}
                                                style={selectStyle}
                                            >
                                                <option value="semanal">Semanal</option>
                                                <option value="quinzenal">Quinzenal</option>
                                                <option value="mensal">Mensal</option>
                                                <option value="2x_semana">2x por semana</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Dia</label>
                                            <select
                                                value={formData.session_day}
                                                onChange={(e) => setFormData({ ...formData, session_day: e.target.value })}
                                                style={selectStyle}
                                            >
                                                <option value="">Selecionar</option>
                                                <option value="segunda">Segunda</option>
                                                <option value="terca">Terça</option>
                                                <option value="quarta">Quarta</option>
                                                <option value="quinta">Quinta</option>
                                                <option value="sexta">Sexta</option>
                                                <option value="sabado">Sábado</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Horário</label>
                                            <input
                                                type="time"
                                                value={formData.session_time}
                                                onChange={(e) => setFormData({ ...formData, session_time: e.target.value })}
                                                style={inputStyle}
                                            />
                                        </div>
                                    </div>

                                    <div className="modal-form-row">
                                        <div>
                                            <label style={labelStyle}>Convênio / Plano</label>
                                            <input
                                                type="text"
                                                placeholder="Particular ou nome do plano"
                                                value={formData.health_insurance}
                                                onChange={(e) => setFormData({ ...formData, health_insurance: e.target.value })}
                                                style={inputStyle}
                                            />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Valor da Sessão (R$)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="0,00"
                                                value={formData.session_value}
                                                onChange={(e) => setFormData({ ...formData, session_value: e.target.value })}
                                                style={inputStyle}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={labelStyle}>Observações Gerais</label>
                                        <textarea
                                            placeholder="Anotações livres sobre o paciente..."
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            rows={2}
                                            style={{ ...inputStyle, resize: 'none' }}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Buttons */}
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                {step > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => setStep(step - 1)}
                                        style={{
                                            flex: 1, padding: '14px', borderRadius: '12px',
                                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                            color: '#94a3b8', fontWeight: '600', fontSize: '14px', cursor: 'pointer'
                                        }}
                                    >
                                        Voltar
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary"
                                    style={{
                                        flex: step > 1 ? 2 : 1,
                                        justifyContent: 'center',
                                        padding: '14px', fontSize: '14px',
                                        opacity: loading ? 0.6 : 1
                                    }}
                                >
                                    {loading ? 'Salvando...' : step < 3 ? 'Próximo →' : '✓ Finalizar Cadastro'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default PatientModal;
