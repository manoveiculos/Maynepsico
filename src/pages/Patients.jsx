import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { Plus, Search, User, ChevronRight, Filter, KeyRound } from 'lucide-react';
import PatientModal from '../components/PatientModal';
import { useAuth } from '../contexts/AuthContext';

const Patients = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!user?.id) return;
        loadPatients();
    }, [user]);

    async function loadPatients() {
        try {
            setLoading(true);
            const data = await dataService.getPatients(user?.id);
            setPatients(data || []);
        } catch (error) {
            console.error("Erro ao carregar pacientes:", error);
        } finally {
            setLoading(false);
        }
    }

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.responsible_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="patients-page animate-fade" style={{ padding: '24px 0' }}>
            {/* Header */}
            <div className="patients-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Pacientes</h1>
                    <p className="text-muted">Gestão estratégica de casos e responsáveis.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} /> Novo Paciente
                </button>
            </div>

            {/* Search & Filter */}
            <div className="patients-search-row" style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <div className="premium-card" style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 16px',
                    backgroundColor: 'var(--bloom-surface)'
                }}>
                    <Search size={18} color="var(--bloom-text-muted)" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou responsável..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%', padding: '12px 0', background: 'none', border: 'none',
                            color: 'white', outline: 'none', fontSize: '14px'
                        }}
                    />
                </div>
                <button className="premium-card" style={{ padding: '0 16px', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <Filter size={18} /> Filtrar
                </button>
            </div>

            {/* Content */}
            <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                        <div className="loader" style={{ marginBottom: '16px', fontSize: '32px' }}>⌛</div>
                        <p className="text-muted">Carregando seus pacientes...</p>
                    </div>
                ) : filteredPatients.length === 0 ? (
                    <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                        <User size={48} color="var(--bloom-text-muted)" style={{ marginBottom: '20px', opacity: 0.3 }} />
                        <p style={{ color: 'var(--bloom-text-muted)', fontSize: '18px' }}>Nenhum paciente encontrado.</p>
                        <button
                            className="text-link"
                            onClick={() => setIsModalOpen(true)}
                            style={{ marginTop: '16px', color: 'var(--bloom-lavender)', fontWeight: '600', border: 'none', background: 'none', fontSize: '15px' }}
                        >
                            Cadastrar primeiro paciente
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <table className="patient-table-desktop">
                            <thead>
                                <tr style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--bloom-text-muted)', fontWeight: '600' }}>PACIENTE</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--bloom-text-muted)', fontWeight: '600' }}>RESPONSÁVEL</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--bloom-text-muted)', fontWeight: '600' }}>DTA. NASC.</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--bloom-text-muted)', fontWeight: '600' }}>STATUS</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--bloom-text-muted)', fontWeight: '600' }}>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPatients.map((patient) => (
                                    <tr
                                        key={patient.id}
                                        onClick={() => navigate(`/evoluir/${patient.id}`)}
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'background 0.2s' }}
                                        className="patient-row-hover"
                                    >
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--bloom-lavender)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0
                                                }}>
                                                    {patient.name.charAt(0)}
                                                </div>
                                                <span style={{ fontWeight: '600' }}>{patient.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '14px' }}>{patient.responsible_name || '-'}</span>
                                                <span className="text-muted" style={{ fontSize: '12px' }}>{patient.responsible_phone || ''}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--bloom-text-muted)' }}>
                                            {patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('pt-BR') : '-'}
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{
                                                fontSize: '10px', padding: '4px 10px', borderRadius: '100px', fontWeight: '700',
                                                backgroundColor: patient.status === 'ativo' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.1)',
                                                color: patient.status === 'ativo' ? 'var(--bloom-mint)' : 'var(--bloom-text-muted)',
                                                textTransform: 'uppercase'
                                            }}>
                                                {patient.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <button onClick={(e) => { e.stopPropagation(); navigate(`/portais/${patient.id}`); }} style={{
                                                    background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)',
                                                    borderRadius: '8px', padding: '6px 10px', cursor: 'pointer',
                                                    color: '#a78bfa', fontSize: '11px', fontWeight: '600',
                                                    display: 'flex', alignItems: 'center', gap: '4px'
                                                }}>
                                                    <KeyRound size={13} /> Portais
                                                </button>
                                                <ChevronRight size={18} color="var(--bloom-text-muted)" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Mobile Card List */}
                        <div className="patient-cards-mobile">
                            {filteredPatients.map((patient) => (
                                <div
                                    key={patient.id}
                                    className="patient-card-mobile"
                                    onClick={() => navigate(`/evoluir/${patient.id}`)}
                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                >
                                    <div style={{
                                        width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'var(--bloom-lavender)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold',
                                        fontSize: '16px', flexShrink: 0
                                    }}>
                                        {patient.name.charAt(0)}
                                    </div>
                                    <div className="patient-card-info">
                                        <div className="patient-card-name">{patient.name}</div>
                                        <div className="patient-card-detail">
                                            {patient.responsible_name || 'Sem responsável'} • {patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('pt-BR') : ''}
                                        </div>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); navigate(`/portais/${patient.id}`); }} style={{
                                        background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)',
                                        borderRadius: '8px', padding: '6px 8px', cursor: 'pointer',
                                        color: '#a78bfa', flexShrink: 0
                                    }}>
                                        <KeyRound size={14} />
                                    </button>
                                    <ChevronRight size={18} color="var(--bloom-text-muted)" style={{ flexShrink: 0 }} />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <PatientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={loadPatients}
            />

            <style>{`
                .patient-row-hover:hover { background-color: rgba(255,255,255,0.02); }
            `}</style>
        </div>
    );
};

export default Patients;
