import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { apiRequest } from './api'
import { useAuth } from './authContextValue'

function formatDateTime(value) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function formatDate(value) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(value))
}

const statusLabels = { pending: 'En attente', confirmed: 'Confirmé', cancelled: 'Annulé' }

export default function PatientDetailsPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    apiRequest(`/patients/${id}`, { token })
      .then((data) => { if (active) setPatient(data) })
      .catch((loadError) => { if (active) setError(loadError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id, token])

  if (loading) return <div className="loading-panel">Chargement du dossier patient…</div>
  if (error) return <div className="details-error"><p role="alert">{error}</p><Link className="button button-secondary" to="/patients">Retour aux patients</Link></div>
  if (!patient) return null

  const initials = patient.fullName.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  const appointments = patient.appointments || []

  return (
    <div className="patient-details-page">
      <Link className="back-link" to="/patients">← Retour à la liste des patients</Link>
      <div className="detail-heading"><div><span className="eyebrow">DOSSIER PATIENT</span><h1>Informations du patient</h1><p>Consultez le profil et l’historique des rendez-vous.</p></div><Link className="button button-primary" to={`/rendez-vous?patientId=${patient.id}`}>＋ Nouveau rendez-vous</Link></div>
      <section className="panel profile-card">
        <div className="profile-main"><span className="profile-avatar">{initials}</span><div><h2>{patient.fullName}</h2><span className="profile-meta">Patient · Dossier #{String(patient.id).padStart(4, '0')}</span></div></div>
        <span className="record-badge"><span />Dossier actif</span>
      </section>
      <section className="panel detail-info-panel">
        <div className="panel-heading"><div><h2>Informations personnelles</h2><p>Coordonnées et informations administratives</p></div><span className="panel-icon">♙</span></div>
        <div className="info-grid">
          <div className="info-item"><span>CIN</span><strong>{patient.cin}</strong></div>
          <div className="info-item"><span>Téléphone</span><strong>{patient.phone}</strong></div>
          <div className="info-item"><span>Date de naissance</span><strong>{formatDate(patient.birthDate)}</strong></div>
          <div className="info-item"><span>Adresse</span><strong>{patient.address || 'Non renseignée'}</strong></div>
        </div>
      </section>
      <section className="panel history-panel">
        <div className="panel-heading"><div><h2>Historique des rendez-vous</h2><p>{appointments.length} rendez-vous associé{appointments.length === 1 ? '' : 's'} à ce dossier</p></div><Link className="small-link" to={`/rendez-vous?patientId=${patient.id}`}>Gérer les rendez-vous →</Link></div>
        {!appointments.length ? <div className="empty-history"><span>▦</span><strong>Aucun rendez-vous pour le moment</strong><p>Les rendez-vous de ce patient apparaîtront ici.</p></div> : (
          <div className="table-scroll"><table className="history-table"><thead><tr><th>Date et heure</th><th>Motif</th><th>Statut</th><th>Créé par</th></tr></thead><tbody>{appointments.map((appointment) => <tr key={appointment.id}><td>{formatDateTime(appointment.appointmentDate)}</td><td>{appointment.reason}</td><td><span className={`status-badge ${appointment.status}`}>{statusLabels[appointment.status] || appointment.status}</span></td><td>{appointment.creator?.fullName || '—'}</td></tr>)}</tbody></table></div>
        )}
      </section>
    </div>
  )
}
