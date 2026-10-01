import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { apiRequest } from './api'
import { useAuth } from './authContextValue'

const emptyPatient = { fullName: '', cin: '', phone: '', birthDate: '', address: '' }
const today = new Date().toISOString().slice(0, 10)

function formatDate(date) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date))
}

function PatientForm({ patient, onClose, onSaved }) {
  const { token } = useAuth()
  const [form, setForm] = useState(patient ? { ...patient, birthDate: patient.birthDate.slice(0, 10), address: patient.address || '' } : emptyPatient)
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
      await apiRequest(patient ? `/patients/${patient.id}` : '/patients', {
        method: patient ? 'PATCH' : 'POST',
        token,
        body: JSON.stringify(form),
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
      <section className="form-modal" role="dialog" aria-modal="true" aria-labelledby="patient-form-title">
        <div className="modal-heading"><div><span className="eyebrow">DOSSIER PATIENT</span><h2 id="patient-form-title">{patient ? 'Modifier le patient' : 'Ajouter un patient'}</h2></div><button className="close-button" type="button" onClick={onClose} aria-label="Fermer">×</button></div>
        <form className="patient-form" onSubmit={submit}>
          <label>Nom complet<input name="fullName" value={form.fullName} onChange={updateField} required minLength="2" maxLength="120" placeholder="Ex. Salma El Amrani" /></label>
          <div className="form-row"><label>CIN<input name="cin" value={form.cin} onChange={updateField} required minLength="2" maxLength="30" placeholder="Ex. AB123456" /></label><label>Téléphone<input name="phone" value={form.phone} onChange={updateField} required minLength="3" maxLength="30" placeholder="Ex. 06 12 34 56 78" /></label></div>
          <div className="form-row"><label>Date de naissance<input type="date" name="birthDate" value={form.birthDate} onChange={updateField} required max={today} /></label><label>Adresse <span className="optional">(facultatif)</span><input name="address" value={form.address} onChange={updateField} maxLength="255" placeholder="Ville, quartier…" /></label></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions"><button className="button button-secondary" type="button" onClick={onClose}>Annuler</button><button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Enregistrement…' : patient ? 'Enregistrer' : 'Ajouter le patient'}</button></div>
        </form>
      </section>
    </div>
  )
}

export default function PatientsPage() {
  const { token, user } = useAuth()
  const [patients, setPatients] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 })
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [formOpen, setFormOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 250)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    let active = true
    const query = new URLSearchParams({ page: String(pagination.page), limit: String(pagination.limit) })
    if (search) query.set('search', search)
    apiRequest(`/patients?${query}`, { token, withMeta: true })
      .then((result) => {
        if (!active) return
        setPatients(result.data)
        setPagination(result.pagination)
        setError('')
      })
      .catch((loadError) => { if (active) setError(loadError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [token, pagination.page, pagination.limit, search, reloadKey])

  function refreshList() {
    setFormOpen(false)
    setEditing(null)
    setPagination((current) => ({ ...current, page: 1 }))
    setLoading(true)
    setReloadKey((current) => current + 1)
  }

  async function deletePatient(patient) {
    if (!window.confirm(`Supprimer le dossier de ${patient.fullName} ?`)) return
    try {
      await apiRequest(`/patients/${patient.id}`, { method: 'DELETE', token })
      setPagination((current) => ({ ...current, page: 1 }))
      setLoading(true)
      setReloadKey((current) => current + 1)
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  const firstResult = pagination.total ? (pagination.page - 1) * pagination.limit + 1 : 0
  const lastResult = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div className="patients-page">
      <div className="page-heading"><div><span className="eyebrow">DOSSIERS MÉDICAUX</span><h1>Patients</h1><p>Consultez et gérez les dossiers de votre clinique.</p></div><button className="button button-primary" onClick={() => { setEditing(null); setFormOpen(true) }} type="button"><span aria-hidden="true">＋</span> Ajouter un patient</button></div>
      <section className="panel patient-list-panel">
        <div className="list-toolbar"><div><h2>Liste des patients</h2><p>{pagination.total} dossier{pagination.total === 1 ? '' : 's'} enregistré{pagination.total === 1 ? '' : 's'}</p></div><label className="search-field"><span aria-hidden="true">⌕</span><input value={searchInput} onChange={(event) => { setLoading(true); setSearchInput(event.target.value); setPagination((current) => ({ ...current, page: 1 })) }} placeholder="Rechercher par nom ou CIN" aria-label="Rechercher un patient par nom ou CIN" /><kbd>⌕</kbd></label></div>
        {error && <div className="notice notice-error" role="alert"><span>{error}</span><button className="text-button" onClick={() => { setLoading(true); setReloadKey((current) => current + 1) }} type="button">Réessayer</button></div>}
        <div className="table-scroll"><table className="patient-table"><thead><tr><th>Patient</th><th>CIN</th><th>Téléphone</th><th>Date de naissance</th><th>Adresse</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
          {loading && <tr><td colSpan="6" className="table-message">Chargement des patients…</td></tr>}
          {!loading && !patients.length && <tr><td colSpan="6" className="table-message">{search ? 'Aucun patient ne correspond à votre recherche.' : 'Aucun patient enregistré.'}</td></tr>}
          {!loading && patients.map((patient, index) => <tr key={patient.id}><td><Link className="patient-name-cell" to={`/patients/${patient.id}`}><span className={`patient-avatar color-${index % 5}`}>{patient.fullName.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span><span><strong>{patient.fullName}</strong><small>Patient ClinicFlow</small></span></Link></td><td><span className="cin-pill">{patient.cin}</span></td><td>{patient.phone}</td><td>{formatDate(patient.birthDate)}</td><td className="address-cell">{patient.address || '—'}</td><td><div className="row-actions"><Link className="row-action" to={`/patients/${patient.id}`} title="Voir le dossier" aria-label={`Voir le dossier de ${patient.fullName}`}>↗</Link><button className="row-action" type="button" onClick={() => { setEditing(patient); setFormOpen(true) }} title="Modifier" aria-label={`Modifier ${patient.fullName}`}>✎</button>{user?.role === 'admin' && <button className="row-action danger" type="button" onClick={() => deletePatient(patient)} title="Supprimer" aria-label={`Supprimer ${patient.fullName}`}>×</button>}</div></td></tr>)}
        </tbody></table></div>
        <footer className="pagination-footer"><span>Affichage de <strong>{firstResult}–{lastResult}</strong> sur <strong>{pagination.total}</strong> patients</span><div className="pagination-controls"><button type="button" disabled={pagination.page <= 1 || loading} onClick={() => { setLoading(true); setPagination((current) => ({ ...current, page: current.page - 1 })) }}>← Précédent</button><span>Page {pagination.page} sur {Math.max(1, pagination.pages)}</span><button type="button" disabled={pagination.page >= pagination.pages || loading} onClick={() => { setLoading(true); setPagination((current) => ({ ...current, page: current.page + 1 })) }}>Suivant →</button></div></footer>
      </section>
      {formOpen && <PatientForm patient={editing} onClose={() => { setFormOpen(false); setEditing(null) }} onSaved={refreshList} />}
    </div>
  )
}
