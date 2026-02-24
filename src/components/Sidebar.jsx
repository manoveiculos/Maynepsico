import React from 'react';
import { LayoutDashboard, Users, Calendar, FileText, PlusCircle, LogOut, X, DollarSign } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/');
        } catch (err) {
            console.error('Erro ao sair:', err);
        }
    };

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
        { icon: <Users size={20} />, label: 'Pacientes', path: '/pacientes' },
        { icon: <Calendar size={20} />, label: 'Agenda', path: '/agenda' },
        { icon: <PlusCircle size={20} />, label: 'Agendamentos Site', path: '/validacao-site' },
        { icon: <DollarSign size={20} />, label: 'Financeiro', path: '/financeiro' },
        { icon: <FileText size={20} />, label: 'Documentos', path: '/documentos' },
        { icon: <FileText size={20} />, label: 'Relatórios', path: '/relatorios' },
    ];

    return (
        <aside className={`bloom-sidebar ${isOpen ? 'mobile-open' : ''}`}>
            {/* Close button - visible only on mobile */}
            <button
                className="mobile-sidebar-close"
                onClick={onClose}
                aria-label="Fechar menu"
                style={{
                    display: 'none',
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--bloom-text-muted)',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '8px',
                    zIndex: 101
                }}
            >
                <X size={24} />
            </button>

            <div
                className="logo-container"
                onClick={() => navigate('/')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '60px',
                    cursor: 'pointer',
                    padding: '0 4px'
                }}
            >
                <div style={{
                    width: '32px', height: '32px', backgroundColor: 'var(--bloom-lavender)',
                    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: '900', fontSize: '20px', flexShrink: 0
                }}>B</div>
                <span style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'Outfit' }}>Bloom</span>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        style={{
                            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '12px', borderRadius: '12px', transition: '0.2s',
                            color: location.pathname === item.path ? 'white' : 'var(--bloom-text-muted)',
                            backgroundColor: location.pathname === item.path ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                            overflow: 'hidden'
                        }}
                    >
                        <span style={{ color: location.pathname === item.path ? 'var(--bloom-lavender)' : 'inherit', display: 'flex', flexShrink: 0 }}>
                            {item.icon}
                        </span>
                        <span style={{ fontWeight: location.pathname === item.path ? '600' : '500', fontSize: '15px' }}>
                            {item.label}
                        </span>
                    </Link>
                ))}
            </nav>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button className="btn-primary" style={{
                    width: '100%', justifyContent: 'center', padding: '12px',
                    borderRadius: '12px', overflow: 'hidden'
                }}>
                    <PlusCircle size={20} style={{ flexShrink: 0 }} />
                    <span style={{ marginLeft: '10px' }}>Nova Sessão</span>
                </button>

                <div className="user-info-container" style={{
                    padding: '12px 4px', borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: '10px', overflow: 'hidden'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            backgroundColor: 'var(--bloom-surface-lighter)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '10px', fontWeight: 'bold', flexShrink: 0
                        }}>MM</div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="user-info" style={{ fontSize: '13px', fontWeight: '600' }}>Dra. Mayne</span>
                            <span style={{ fontSize: '10px', color: 'var(--bloom-text-muted)' }}>CRP 12/29287</span>
                        </div>
                    </div>
                    <LogOut
                        size={18}
                        color="var(--bloom-text-muted)"
                        style={{ cursor: 'pointer', flexShrink: 0 }}
                        onClick={handleLogout}
                    />
                </div>
            </div>

            <style>{`
                .nav-item:hover { color: white !important; background-color: rgba(255,255,255,0.03) !important; }
                .nav-item.active:hover { background-color: rgba(139, 92, 246, 0.15) !important; }
                @media (max-width: 768px) {
                    .mobile-sidebar-close { display: flex !important; }
                }
            `}</style>
        </aside>
    );
};

export default Sidebar;
