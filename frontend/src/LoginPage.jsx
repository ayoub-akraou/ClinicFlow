import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { useAuth } from './authContextValue'

export default function LoginPage() {
  const { login, user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) return <Navigate to={location.state?.from || '/'} replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate(location.state?.from || '/', { replace: true })
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <a className="brand login-brand" href="/" aria-label="ClinicFlow"><span className="brand-mark">+</span><span>clinic<span>flow</span></span></a>
        <div className="login-message"><span className="eyebrow">LES SOINS, ENSEMBLE</span><h1>Une clinique plus<br />simple à gérer.</h1><p>Les outils essentiels pour prendre soin de vos patients, au même endroit.</p></div>
        <div className="visual-note"><span>✳</span> Un espace pensé pour votre équipe médicale</div>
      </section>
      <section className="login-panel">
        <div className="login-form-wrap">
          <span className="eyebrow">BON RETOUR</span>
          <h2>Connectez-vous</h2>
          <p className="login-subtitle">Accédez à votre espace ClinicFlow.</p>
          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="email">Adresse e-mail</label>
            <input id="email" type="email" autoComplete="username" placeholder="nom@clinique.ma" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <label htmlFor="password">Mot de passe</label>
            <input id="password" type="password" autoComplete="current-password" placeholder="Votre mot de passe" value={password} onChange={(event) => setPassword(event.target.value)} required />
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-primary login-submit" type="submit" disabled={submitting || loading}>{submitting ? 'Connexion…' : 'Se connecter'}<span aria-hidden="true">→</span></button>
          </form>
          <p className="auth-switch">Vous n’avez pas encore de compte ? <Link to="/inscription">Créer un compte</Link></p>
          <p className="login-help">Besoin d’aide ? Contactez l’administrateur de votre clinique.</p>
        </div>
        <span className="login-copyright">© 2026 ClinicFlow · Gestion de clinique</span>
      </section>
    </main>
  )
}
