import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import EvolutionForm from './pages/EvolutionForm';
import Agenda from './pages/Agenda';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Financeiro from './pages/Financeiro';
import Documents from './pages/Documents'; // Nova página de documentos
import SiteBookings from './pages/SiteBookings'; // Validação de agendamentos do site
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import { withRetry, dataService } from './services/dataService';
import './App.css';

// Component to protect psychologist routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0a0e1a', color: 'white'
    }}>
      <div className="loader">⌛ Carregando...</div>
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/login" />;

  return children;
};

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const location = useLocation();
  const { profile, isAuthenticated } = useAuth();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        await dataService.checkConnection();
        setIsOffline(false);
      } catch (err) {
        setIsOffline(true);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const isPublicRoute = location.pathname === '/' || location.pathname === '/login';
  const isOldPortalRoute = location.pathname.startsWith('/portal') || location.pathname.startsWith('/portais');

  if (isPublicRoute || isOldPortalRoute) {
    return (
      <>
        {isOffline && (
          <div style={{
            background: '#ef4444', color: 'white', padding: '8px', textAlign: 'center',
            fontSize: '12px', fontWeight: '700', position: 'fixed', top: 0, width: '100%', zIndex: 9999
          }}>
            ⚠️ CONEXÃO INSTÁVEL: O sistema pode demorar para responder.
          </div>
        )}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </>
    );
  }

  return (
    <div className="bloom-app">
      {isOffline && (
        <div style={{
          background: '#ef4444', color: 'white', padding: '8px', textAlign: 'center',
          fontSize: '12px', fontWeight: '700', position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 9999
        }}>
          ⚠️ CONEXÃO PERDIDA: Tentando reconectar...
        </div>
      )}

      <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="bloom-main">
        <header className="bloom-topbar">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
            <div className="hamburger-icon">
              <span></span><span></span><span></span>
            </div>
          </button>

          <div className="search-bar">
            <span>🔍</span>
            <input type="text" placeholder="Buscar paciente..." />
          </div>

          <div className="user-profile">
            <span className="user-name">{profile?.full_name || 'Dra. Mayne Margadona'}</span>
            <div className="user-avatar">{profile?.full_name ? profile.full_name.charAt(0) : 'M'}</div>
          </div>
        </header>

        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/pacientes" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
          <Route path="/relatorios" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
          <Route path="/evoluir/:patientId" element={<ProtectedRoute><EvolutionForm /></ProtectedRoute>} />
          <Route path="/agenda" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
          <Route path="/validacao-site" element={<ProtectedRoute><SiteBookings /></ProtectedRoute>} />
          <Route path="/financeiro" element={<ProtectedRoute><Financeiro /></ProtectedRoute>} />
          <Route path="/documentos" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>

      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
