import { BrowserRouter, Navigate, NavLink, Route, Routes, useLocation } from 'react-router'
import { AuthProvider } from './AuthContext'
import { useAuth } from './authContextValue'
import LoginPage from './LoginPage'
import DashboardPage from './DashboardPage'
import PatientsPage from './PatientsPage'
import PatientDetailsPage from './PatientDetailsPage'
import AppointmentsPage from './AppointmentsPage'
import './App.css'

const navigation = [
  { to: '/', label: 'Tableau de bord', icon: '◫', end: true },
  { to: '/patients', label: 'Patients', icon: '♙' },
  { to: '/rendez-vous', label: 'Rendez-vous', icon: '▦' },
]

function AppLayout() {
  const { user, logout } = useAuth()
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="ClinicFlow, accueil">
          <span className="brand-mark">+</span>
          <span>clinic<span>flow</span></span>
        </a>
        <div className="workspace-label">ESPACE CLINIQUE</div>
        <nav className="main-nav" aria-label="Navigation principale">
          {navigation.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>{item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="avatar avatar-small">CF</div>
          <div><strong>Équipe médicale</strong><span>Gestion de la clinique</span></div>
          <span className="online-dot" aria-label="En ligne" />
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs"><span>ClinicFlow</span><span className="crumb-divider">/</span><strong>Vue générale</strong></div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" aria-label="Notifications">♧<i /></button>
          <button className="topbar-user user-button" type="button" onClick={logout} title="Se déconnecter"><div className="avatar">{user?.fullName?.slice(0, 2).toUpperCase() || 'CF'}</div><div><strong>{user?.fullName || 'Utilisateur'}</strong><span>{user?.role === 'admin' ? 'Administrateur' : 'Équipe médicale'}</span></div><span className="chevron">↪</span></button>
          </div>
        </header>
        <div className="content-area">
          <Routes>
            <Route path="/connexion" element={<LoginPage />} />
            <Route path="/" element={<RequireAuth><DashboardPage /></RequireAuth>} />
            <Route path="/patients" element={<RequireAuth><PatientsPage /></RequireAuth>} />
            <Route path="/rendez-vous" element={<RequireAuth><AppointmentsPage /></RequireAuth>} />
            <Route path="/patients/:id" element={<RequireAuth><PatientDetailsPage /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="loading-screen">Chargement de votre espace…</div>
  if (!user) return <Navigate to="/connexion" state={{ from: location.pathname }} replace />
  return children
}

export default function App() {
  return <BrowserRouter><AuthProvider><Routes><Route path="/connexion" element={<LoginPage />} /><Route path="*" element={<AppLayout />} /></Routes></AuthProvider></BrowserRouter>
}
