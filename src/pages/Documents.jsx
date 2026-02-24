import React, { useState, useEffect } from 'react';
import {
    FileText, Plus, Search, Download, Trash2,
    Eye, Shield, Lock, X, CheckCircle, Printer, Save
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';

const Documents = () => {
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedDocType, setSelectedDocType] = useState(null);
    const [form, setForm] = useState({
        patient_id: '',
        title: '',
        content: '',
        status: 'rascunho'
    });

    const documentTemplates = {
        consentimento: {
            title: 'Termo de Consentimento Livre e Esclarecido',
            content: `TERMO DE CONSENTIMENTO PARA TRATAMENTO PSICOLÓGICO\n\nEu, ________________________________________________, CPF ________________________, autorizo a realização do tratamento psicológico de (nome do paciente) ________________________________________________ com a Dra. Mayne Margadona (CRP 12/29287).\n\nDeclaro estar ciente de que:\n1. O atendimento é sigiloso conforme o Código de Ética do Psicólogo.\n2. O sigilo pode ser quebrado em situações de risco de vida.\n3. As faltas devem ser comunicadas com antecedência de 24 horas.\n\nData: ${new Date().toLocaleDateString('pt-BR')}\n\nAssinatura: ________________________________________________`
        },
        contrato: {
            title: 'Contrato de Prestação de Serviços Psicológicos',
            content: `CONTRATO TERAPÊUTICO\n\nPSICÓLOGA: Dra. Mayne Margadona (CRP 12/29287)\nPACIENTE: ________________________________________________\n\nCLÁUSULA 1 - HONORÁRIOS: O valor de cada sessão é de R$ __________, a ser pago via ________.\n\nCLÁUSULA 2 - FALTAS E CANCELAMENTOS: Cancelamentos devem ocorrer com no mínimo 24h de antecedência, caso contrário a sessão será cobrada.\n\nCLÁUSULA 3 - SIGILO: Todo o conteúdo das sessões é estritamente confidencial.\n\nData: ${new Date().toLocaleDateString('pt-BR')}\n\nAssinatura: ________________________________________________`
        },
        anamnese: {
            title: 'Anamnese Infantil e Adolescente',
            content: `ROTEIRO DE ANAMNESE CLÍNICA\n\n1. MOTIVO DA CONSULTA:\n\n2. HISTÓRICO DO DESENVOLVIMENTO:\n- Gestação e Parto:\n- Primeiros passos/falas:\n\n3. DINÂMICA FAMILIAR:\n- Relacionamento com pais:\n- Irmãos:\n\n4. VIDA ESCOLAR:\n- Comportamento em sala:\n- Notas:\n\n5. OBSERVAÇÕES CLÍNICAS:\n\nData: ${new Date().toLocaleDateString('pt-BR')}`
        },
        questionario: {
            title: 'Questionário de Avaliação para Pais',
            content: `QUESTIONÁRIO PARA RESPONSÁVEIS\n\nPrezados pais, por favor respondam honestamente sobre o comportamento do seu filho(a) nas últimas semanas.\n\nFrequência de irritabilidade (0-10): ____\nQualidade do sono: ____\nDificuldades na escola: ____\nAtividades de lazer: ____\n\nNotas adicionais:\n\nData: ${new Date().toLocaleDateString('pt-BR')}`
        }
    };

    useEffect(() => {
        if (user?.id) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [docs, pts] = await Promise.all([
                dataService.getDocuments(user.id),
                dataService.getPatients(user.id)
            ]);
            setDocuments(docs || []);
            setPatients(pts || []);
        } catch (err) {
            console.error("Erro ao carregar documentos:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleStartNew = (typeId) => {
        const template = documentTemplates[typeId];
        setSelectedDocType(typeId);
        setForm({
            patient_id: '',
            title: template.title,
            content: template.content,
            status: 'rascunho'
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await dataService.createDocument({
                ...form,
                psychologist_id: user.id,
                type: selectedDocType
            });
            setShowModal(false);
            loadData();
        } catch (err) {
            alert("Erro ao salvar documento.");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Excluir este documento permanentemente?")) return;
        try {
            await dataService.deleteDocument(id);
            loadData();
        } catch (err) {
            alert("Erro ao remover documento.");
        }
    };

    const handlePrint = (doc) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${doc.title}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 40px; line-height: 1.6; color: #333; }
                        .header { text-align: center; border-bottom: 2px solid #333; margin-bottom: 30px; padding-bottom: 20px; }
                        .crp { font-size: 12px; color: #666; }
                        .content { white-space: pre-wrap; font-size: 14px; }
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>${doc.title}</h2>
                        <p>Dra. Mayne Margadona</p>
                        <p class="crp">Psicóloga Clínica - CRP 12/29287</p>
                    </div>
                    <div class="content">${doc.content}</div>
                    <script>window.print();</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const inputStyle = {
        width: '100%', padding: '12px 14px', borderRadius: '10px',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        color: 'white', outline: 'none', fontSize: '14px'
    };

    const filteredDocs = documents.filter(doc => {
        const patientName = patients.find(p => p.id === doc.patient_id)?.name || '';
        return patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="documents-page animate-fade" style={{ padding: '24px 0' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', marginBottom: '6px' }}>Documentos Clínicos</h1>
                    <p className="text-muted">Gestão de termos, contratos e anamneses.</p>
                </div>
                <div style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '12px', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.5px' }}>
                    <Lock size={14} /> USO INTERNO E CONFIDENCIAL
                </div>
            </div>

            {/* Warning Box */}
            <div style={{
                padding: '18px 24px', borderRadius: '20px', background: 'rgba(139,92,246,0.05)',
                border: '1px solid rgba(139,92,246,0.15)', marginBottom: '32px',
                display: 'flex', gap: '18px', alignItems: 'center'
            }}>
                <div style={{ padding: '10px', background: 'rgba(139,92,246,0.1)', borderRadius: '14px', color: '#a78bfa' }}>
                    <Shield size={22} />
                </div>
                <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '2px' }}>Segurança de Dados</h3>
                    <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>
                        Documentos gerados pela Dra. Mayne Margadona são protegidos por sigilo ético absoluto.
                    </p>
                </div>
            </div>

            {/* Templates Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {[
                    { id: 'consentimento', title: 'Termo de Consentimento', icon: <Shield size={18} /> },
                    { id: 'contrato', title: 'Contrato Terapêutico', icon: <FileText size={18} /> },
                    { id: 'anamnese', title: 'Anamnese Marque-Infantil', icon: <Search size={18} /> },
                    { id: 'questionario', title: 'Questionário Pais', icon: <Plus size={18} /> },
                ].map(type => (
                    <div key={type.id} className="premium-card template-card" style={{ padding: '24px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(139,92,246,0.1)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                            {type.icon}
                        </div>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>{type.title}</h3>
                        <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '20px' }}>Usar modelo padrão pré-formatado.</p>
                        <button onClick={() => handleStartNew(type.id)} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '12px', borderRadius: '10px' }}>
                            <Plus size={14} /> Iniciar Novo
                        </button>
                    </div>
                ))}
            </div>

            {/* List Table */}
            <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Documentos Emitidos</h3>
                    <div style={{ position: 'relative', width: '280px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                        <input
                            placeholder="Buscar por paciente ou título..."
                            style={{ ...inputStyle, paddingLeft: '38px', height: '44px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.015)' }}>
                            <tr style={{ textAlign: 'left' }}>
                                <th style={{ padding: '16px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DOCUMENTO</th>
                                <th style={{ padding: '16px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PACIENTE</th>
                                <th style={{ padding: '16px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DATA</th>
                                <th style={{ padding: '16px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>STATUS</th>
                                <th style={{ padding: '16px 24px', width: '140px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Carregando documentos...</td></tr>
                            ) : filteredDocs.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Nenhum documento encontrado.</td></tr>
                            ) : filteredDocs.map(doc => (
                                <tr key={doc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }} className="doc-row">
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#e2e8f0' }}>{doc.title}</div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>ID: {doc.id.substring(0, 8)}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#94a3b8' }}>
                                        {patients.find(p => p.id === doc.patient_id)?.name || 'Paciente não encontrado'}
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#94a3b8' }}>
                                        {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            fontSize: '10px', padding: '4px 12px', borderRadius: '100px',
                                            background: doc.status === 'assinado' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                            color: doc.status === 'assinado' ? '#10b981' : '#f59e0b',
                                            fontWeight: '800', textTransform: 'uppercase'
                                        }}>
                                            {doc.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button onClick={() => handlePrint(doc)} title="Visualizar e Imprimir" style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><Printer size={16} /></button>
                                        <button onClick={() => handleDelete(doc.id)} title="Excluir" style={{ background: 'rgba(239,68,68,0.05)', border: 'none', color: '#ef4444', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ==================== CREATE DOCUMENT MODAL ==================== */}
            {showModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="premium-card modal-card animate-fade" style={{ maxWidth: '800px', width: '95%', padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '18px', fontWeight: '800' }}>Gerar {form.title}</h2>
                                <p style={{ fontSize: '12px', color: '#64748b' }}>Preencha os dados e revise o conteúdo.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSave} style={{ padding: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase' }}>Selecionar Paciente</label>
                                    <select
                                        required
                                        value={form.patient_id}
                                        onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                                        style={{ ...inputStyle, cursor: 'pointer' }}
                                    >
                                        <option value="">Escolha um paciente...</option>
                                        {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase' }}>Status do Documento</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                        style={{ ...inputStyle, cursor: 'pointer' }}
                                    >
                                        <option value="rascunho">Rascunho</option>
                                        <option value="assinado">Assinado</option>
                                        <option value="finalizado">Finalizado</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase' }}>Conteúdo do Documento</label>
                                <textarea
                                    value={form.content}
                                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                                    style={{ ...inputStyle, height: '350px', resize: 'none', lineHeight: '1.6', fontFamily: 'monospace' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '12px 24px', borderRadius: '12px', background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: '600' }}>Cancelar</button>
                                <button type="submit" className="btn-primary" style={{ padding: '12px 24px', borderRadius: '12px', gap: '10px' }}>
                                    <Save size={18} /> Salvar Documento
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .template-card:hover { transform: translateY(-5px); border-color: rgba(139,92,246,0.5) !important; background: rgba(139,92,246,0.03) !important; }
                .doc-row:hover { background: rgba(255,255,255,0.02); }
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; alignItems: center; justifyContent: center; z-index: 1000; }
            `}</style>
        </div>
    );
};

export default Documents;
