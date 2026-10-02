import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { useAuth } from './authContextValue'

export default function RegisterPage() {
  const { register, user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) return <Navigate to="/" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (password !== passwordConfirmation) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }

    setSubmitting(true)
    try {
      await register(fullName.trim(), email.trim(), password)
      navigate(location.state?.from || '/', { replace: true })
    } catch (registerError) {
      setError(registerError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <Link className="brand login-brand" to="/" aria-label="ClinicFlow"><span className="brand-mark">+</span><span>clinic<span>flow</span></span></Link>
        <div className="login-message"><span className="eyebrow">LES SOINS, ENSEMBLE</span><h1>Votre clinique,<br />bien organisée.</h1><p>Créez votre espace pour gérer les dossiers patients et le planning de votre équipe.</p></div>
        <div className="visual-note"><span>✳</span> Un espace pensé pour votre équipe médicale</div>
      </section>
      <section className="login-panel register-panel">
        <div className="login-form-wrap">
          <span className="eyebrow">REJOINDRE CLINICFLOW</span>
          <h2>Créer un compte</h2>
          <p className="login-subtitle">Inscrivez-vous pour accéder à votre espace clinique.</p>
          <form onSubmit={handleSubmit} className="login-form register-form">
            <label htmlFor="fullName">Nom complet</label>
            <input id="fullName" type="text" autoComplete="name" placeholder="Ex. Salma El Amrani" value={fullName} onChange={(event) => setFullName(event.target.value)} minLength="2" maxLength="120" required />
            <label htmlFor="registerEmail">Adresse e-mail</label>
            <input id="registerEmail" type="email" autoComplete="email" placeholder="nom@clinique.ma" value={email} onChange={(event) => setEmail(event.target.value)} maxLength="255" required />
            <label htmlFor="registerPassword">Mot de passe</label>
            <input id="registerPassword" type="password" autoComplete="new-password" placeholder="8 caractères minimum" value={password} onChange={(event) => setPassword(event.target.value)} minLength="8" maxLength="100" required />
            <label htmlFor="passwordConfirmation">Confirmer le mot de passe</label>
            <input id="passwordConfirmation" type="password" autoComplete="new-password" placeholder="Saisissez-le à nouveau" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} minLength="8" maxLength="100" required />
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-primary login-submit" type="submit" disabled={submitting || loading}>{submitting ? 'Création du compte…' : 'Créer mon compte'}<span aria-hidden="true">→</span></button>
          </form>
          <p className="auth-switch">Vous avez déjà un compte ? <Link to="/connexion">Se connecter</Link></p>
          <p className="registration-role-note">L’inscription crée un compte membre du staff.</p>
        </div>
        <span className="login-copyright">© 2026 ClinicFlow · Gestion de clinique</span>
      </section>
    </main>
  )
}
