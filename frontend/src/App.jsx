import { BrowserRouter, NavLink, Route, Routes } from 'react-router'
import './App.css'

const navigation = [
  { to: '/', label: 'Tableau de bord', icon: '◫', end: true },
  { to: '/patients', label: 'Patients', icon: '♙' },
  { to: '/rendez-vous', label: 'Rendez-vous', icon: '▦' },
]

function PagePlaceholder({ title, description }) {
  return (
    <section className="page-placeholder">
      <span className="eyebrow">CLINICFLOW</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  )
}

function AppLayout() {
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
            <div className="topbar-user"><div className="avatar">AM</div><div><strong>Admin</strong><span>Administrateur</span></div><span className="chevron">⌄</span></div>
          </div>
        </header>
        <div className="content-area">
          <Routes>
            <Route path="/" element={<PagePlaceholder title="Bonjour 👋" description="Votre espace de gestion de la clinique est prêt." />} />
            <Route path="/patients" element={<PagePlaceholder title="Patients" description="Retrouvez et gérez les dossiers de vos patients." />} />
            <Route path="/rendez-vous" element={<PagePlaceholder title="Rendez-vous" description="Consultez et organisez les rendez-vous de la clinique." />} />
            <Route path="/patients/:id" element={<PagePlaceholder title="Dossier patient" description="Consultez les informations et les rendez-vous du patient." />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return <BrowserRouter><AppLayout /></BrowserRouter>
}
