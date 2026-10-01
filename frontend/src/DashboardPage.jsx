import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { apiRequest } from './api'
import { useAuth } from './authContextValue'

const statusInfo = [
  { key: 'pending', label: 'En attente', dot: 'pending' },
  { key: 'confirmed', label: 'Confirmés', dot: 'confirmed' },
  { key: 'cancelled', label: 'Annulés', dot: 'cancelled' },
]
const todayLabel = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()).toLocaleUpperCase('fr-FR')

function StatCard({ title, value, hint, icon, tone }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`} aria-hidden="true">{icon}</div>
      <span className="stat-label">{title}</span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-hint">{hint}</span>
    </article>
  )
}

export default function DashboardPage() {
  const { token, user } = useAuth()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadStats() {
    try {
      setStats(await apiRequest('/dashboard', { token }))
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    apiRequest('/dashboard', { token })
      .then((data) => { if (active) setStats(data) })
      .catch((loadError) => { if (active) setError(loadError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [token])

  function retryLoadStats() {
    setLoading(true)
    setError('')
    loadStats()
  }

  const totalStatus = stats ? Object.values(stats.appointmentsByStatus).reduce((sum, count) => sum + count, 0) : 0
  const greetingName = user?.fullName?.split(' ')[0] || 'Bonjour'

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div><span className="eyebrow">{todayLabel} · ESPACE CLINIQUE</span><h1>Bonjour {greetingName} <span aria-hidden="true">✳</span></h1><p>Voici le résumé de l’activité de votre clinique.</p></div>
        <Link className="button button-primary" to="/rendez-vous"><span aria-hidden="true">＋</span> Nouveau rendez-vous</Link>
      </div>

      {error && <div className="notice notice-error" role="alert"><span>{error}</span><button className="text-button" onClick={retryLoadStats} type="button">Réessayer</button></div>}

      <div className="stats-grid" aria-live="polite">
        <StatCard title="Patients au total" value={loading ? '—' : stats?.totalPatients ?? '—'} hint="Dossiers enregistrés" icon="♙" tone="mint" />
        <StatCard title="Rendez-vous aujourd’hui" value={loading ? '—' : stats?.appointmentsToday ?? '—'} hint="Toutes les consultations" icon="▦" tone="blue" />
        <StatCard title="En attente" value={loading ? '—' : stats?.appointmentsByStatus?.pending ?? '—'} hint="À confirmer" icon="◷" tone="amber" />
        <StatCard title="Confirmés" value={loading ? '—' : stats?.appointmentsByStatus?.confirmed ?? '—'} hint="Prêts pour la consultation" icon="✓" tone="lilac" />
      </div>

      <div className="dashboard-panels">
        <section className="panel status-panel">
          <div className="panel-heading"><div><h2>État des rendez-vous</h2><p>Répartition de tous les rendez-vous</p></div><span className="panel-icon">◉</span></div>
          {loading ? <div className="skeleton-line" /> : (
            <>
              <div className="status-total"><strong>{totalStatus}</strong><span>rendez-vous au total</span></div>
              <div className="status-bar" aria-label="Répartition des rendez-vous">
                {statusInfo.map(({ key }) => <span key={key} className={`bar-segment ${key}`} style={{ width: `${totalStatus ? (stats.appointmentsByStatus[key] / totalStatus) * 100 : 0}%` }} />)}
              </div>
              <div className="status-list">
                {statusInfo.map(({ key, label, dot }) => <div className="status-row" key={key}><span className={`status-dot ${dot}`} /><span>{label}</span><strong>{loading ? '—' : stats?.appointmentsByStatus?.[key] ?? 0}</strong></div>)}
              </div>
            </>
          )}
        </section>
        <section className="panel quick-panel">
          <div className="panel-heading"><div><h2>Accès rapide</h2><p>Les actions les plus utilisées</p></div></div>
          <Link className="quick-link" to="/patients"><span className="quick-icon mint">♙</span><span><strong>Voir les patients</strong><small>Rechercher un dossier patient</small></span><b>→</b></Link>
          <Link className="quick-link" to="/rendez-vous"><span className="quick-icon blue">▦</span><span><strong>Gérer les rendez-vous</strong><small>Consulter et mettre à jour le planning</small></span><b>→</b></Link>
        </section>
      </div>
    </div>
  )
}
