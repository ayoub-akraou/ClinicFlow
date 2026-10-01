import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { apiRequest } from './api'
import { useAuth } from './authContextValue'

const statusLabels = { pending: 'En attente', confirmed: 'Confirmé', cancelled: 'Annulé' }

function formatDateTime(value) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function AppointmentForm({ patients, selectedPatientId, onClose, onSaved }) {
  const { token } = useAuth()
  const [form, setForm] = useState({ patientId: selectedPatientId, appointmentDate: '', status: 'pending', reason: '', notes: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await apiRequest('/appointments', {
        method: 'POST',
        token,
        body: JSON.stringify({ ...form, patientId: Number(form.patientId), appointmentDate: new Date(form.appointmentDate).toISOString() }),
      })
      onSaved()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="form-modal" role="dialog" aria-modal="true" aria-labelledby="appointment-form-title">
        <div className="modal-heading"><div><span className="eyebrow">PLANNING DE LA CLINIQUE</span><h2 id="appointment-form-title">Nouveau rendez-vous</h2></div><button className="close-button" type="button" onClick={onClose} aria-label="Fermer">×</button></div>
        <form className="patient-form" onSubmit={submit}>
          <label>Patient<select name="patientId" value={form.patientId} onChange={updateField} required><option value="">Sélectionner un patient</option>{patients.map((patient) => <option value={patient.id} key={patient.id}>{patient.fullName} · {patient.cin}</option>)}</select></label>
          <div className="form-row"><label>Date et heure<input type="datetime-local" name="appointmentDate" value={form.appointmentDate} onChange={updateField} required /></label><label>Statut initial<select name="status" value={form.status} onChange={updateField}><option value="pending">En attente</option><option value="confirmed">Confirmé</option></select></label></div>
          <label>Motif<input name="reason" value={form.reason} onChange={updateField} required minLength="2" maxLength="500" placeholder="Ex. Consultation de suivi" /></label>
          <label>Notes <span className="optional">(facultatif)</span><textarea name="notes" value={form.notes} onChange={updateField} rows="3" placeholder="Informations complémentaires…" /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions"><button className="button button-secondary" type="button" onClick={onClose}>Annuler</button><button className="button button-primary" type="submit" disabled={saving || !patients.length}>{saving ? 'Enregistrement…' : 'Créer le rendez-vous'}</button></div>
        </form>
      </section>
    </div>
  )
}

export default function AppointmentsPage() {
  const { token } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const patientFromUrl = searchParams.get('patientId') || ''
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 })
  const [date, setDate] = useState('')
  const [status, setStatus] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(Boolean(patientFromUrl))
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    let active = true
    apiRequest('/patients?page=1&limit=50', { token, withMeta: true })
      .then((result) => { if (active) setPatients(result.data) })
      .catch((loadError) => { if (active) setError(loadError.message) })
      .finally(() => { if (active) setLoadingPatients(false) })
    return () => { active = false }
  }, [token])

  useEffect(() => {
    let active = true
    const query = new URLSearchParams({ page: String(pagination.page), limit: String(pagination.limit) })
    if (date) query.set('date', date)
    if (status) query.set('status', status)
    apiRequest(`/appointments?${query}`, { token, withMeta: true })
      .then((result) => {
        if (!active) return
        setAppointments(result.data)
        setPagination(result.pagination)
        setError('')
      })
      .catch((loadError) => { if (active) setError(loadError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [token, pagination.page, pagination.limit, date, status, reloadKey])

  function closeForm() {
    setFormOpen(false)
    if (patientFromUrl) setSearchParams({}, { replace: true })
  }

  function refreshList() {
    closeForm()
    setLoading(true)
    setPagination((current) => ({ ...current, page: 1 }))
    setReloadKey((current) => current + 1)
  }

  async function updateStatus(appointmentId, nextStatus) {
    setUpdatingId(appointmentId)
    setError('')
    try {
      await apiRequest(`/appointments/${appointmentId}/status`, { method: 'PATCH', token, body: JSON.stringify({ status: nextStatus }) })
      setReloadKey((current) => current + 1)
    } catch (updateError) {
      setError(updateError.message)
    } finally {
      setUpdatingId(null)
    }
  }

  function changeFilter(setter, value) {
    setter(value)
    setLoading(true)
    setPagination((current) => ({ ...current, page: 1 }))
  }

  const firstResult = pagination.total ? (pagination.page - 1) * pagination.limit + 1 : 0
  const lastResult = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div className="appointments-page">
      <div className="page-heading"><div><span className="eyebrow">PLANNING DE LA CLINIQUE</span><h1>Rendez-vous</h1><p>Organisez et suivez les consultations de vos patients.</p></div><button className="button button-primary" type="button" onClick={() => setFormOpen(true)}><span aria-hidden="true">＋</span> Nouveau rendez-vous</button></div>
      {error && <div className="notice notice-error" role="alert"><span>{error}</span><button className="text-button" type="button" onClick={() => { setLoading(true); setReloadKey((current) => current + 1) }}>Réessayer</button></div>}
      <section className="panel appointment-list-panel">
        <div className="list-toolbar"><div><h2>Liste des rendez-vous</h2><p>{pagination.total} rendez-vous trouvé{pagination.total === 1 ? '' : 's'}</p></div><div className="appointment-filters"><label>Date<input type="date" value={date} onChange={(event) => changeFilter(setDate, event.target.value)} /></label><label>Statut<select value={status} onChange={(event) => changeFilter(setStatus, event.target.value)}><option value="">Tous les statuts</option><option value="pending">En attente</option><option value="confirmed">Confirmé</option><option value="cancelled">Annulé</option></select></label>{(date || status) && <button className="clear-filters" type="button" onClick={() => { setDate(''); setStatus(''); setLoading(true); setPagination((current) => ({ ...current, page: 1 })) }}>Effacer</button>}</div></div>
        <div className="table-scroll"><table className="appointment-table"><thead><tr><th>Date et heure</th><th>Patient</th><th>Motif</th><th>Créé par</th><th>Statut</th></tr></thead><tbody>
          {loading && <tr><td colSpan="5" className="table-message">Chargement des rendez-vous…</td></tr>}
          {!loading && !appointments.length && <tr><td colSpan="5" className="table-message">Aucun rendez-vous pour ces filtres.</td></tr>}
          {!loading && appointments.map((appointment) => <tr key={appointment.id}><td><strong className="appointment-time">{formatDateTime(appointment.appointmentDate)}</strong></td><td><Link className="appointment-patient" to={`/patients/${appointment.patient.id}`}><strong>{appointment.patient.fullName}</strong><small>{appointment.patient.cin} · {appointment.patient.phone}</small></Link></td><td className="reason-cell" title={appointment.reason}>{appointment.reason}</td><td>{appointment.creator?.fullName || '—'}</td><td><select className={`status-select ${appointment.status}`} aria-label={`Statut du rendez-vous de ${appointment.patient.fullName}`} value={appointment.status} disabled={updatingId === appointment.id} onChange={(event) => updateStatus(appointment.id, event.target.value)}>{Object.entries(statusLabels).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></td></tr>)}
        </tbody></table></div>
        <footer className="pagination-footer"><span>Affichage de <strong>{firstResult}–{lastResult}</strong> sur <strong>{pagination.total}</strong> rendez-vous</span><div className="pagination-controls"><button type="button" disabled={pagination.page <= 1 || loading} onClick={() => { setLoading(true); setPagination((current) => ({ ...current, page: current.page - 1 })) }}>← Précédent</button><span>Page {pagination.page} sur {Math.max(1, pagination.pages)}</span><button type="button" disabled={pagination.page >= pagination.pages || loading} onClick={() => { setLoading(true); setPagination((current) => ({ ...current, page: current.page + 1 })) }}>Suivant →</button></div></footer>
      </section>
      {formOpen && <AppointmentForm patients={patients} selectedPatientId={patientFromUrl} onClose={closeForm} onSaved={refreshList} />}
      {loadingPatients && <span className="loading-hint" aria-live="polite">Chargement des patients pour le formulaire…</span>}
    </div>
  )
}
