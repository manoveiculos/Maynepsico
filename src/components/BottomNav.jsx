import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, FileText, DollarSign } from 'lucide-react';

const BottomNav = () => {
    const location = useLocation();

    const items = [
        { icon: <LayoutDashboard size={22} />, label: 'Início', path: '/dashboard' },
        { icon: <Users size={22} />, label: 'Pacientes', path: '/pacientes' },
        { icon: <Calendar size={22} />, label: 'Agenda', path: '/agenda' },
        { icon: <DollarSign size={22} />, label: 'Finanças', path: '/financeiro' },
    ];

    return (
        <nav className="bottom-nav">
            <div className="bottom-nav-inner">
                {items.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path));

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                            style={{ position: 'relative' }}
                        >
                            <span className="nav-icon" style={{
                                color: isActive ? 'var(--bloom-lavender)' : 'var(--bloom-text-muted)',
                                transition: 'color 0.2s ease, transform 0.2s ease',
                                transform: isActive ? 'scale(1.1)' : 'scale(1)'
                            }}>
                                {item.icon}
                            </span>
                            <span style={{
                                color: isActive ? 'var(--bloom-lavender)' : 'var(--bloom-text-muted)',
                                fontWeight: isActive ? '600' : '400',
                                transition: 'color 0.2s ease'
                            }}>
                                {item.label}
                            </span>

                            {/* Active indicator dot */}
                            {isActive && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '24px',
                                    height: '3px',
                                    backgroundColor: 'var(--bloom-lavender)',
                                    borderRadius: '0 0 4px 4px'
                                }} />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
