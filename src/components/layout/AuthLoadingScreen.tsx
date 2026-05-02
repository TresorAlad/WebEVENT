import Skeleton from '../ui/Skeleton'

/**
 * Écran de chargement affiché pendant la résolution Firebase + profil admin.
 * Reproduit la structure de l’app (sidebar / topbar / zone contenu) pour une transition fluide.
 */
export default function AuthLoadingScreen() {
  return (
    <div
      className="auth-loading-shell"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement de la console administrateur"
    >
      <aside className="auth-loading-sidebar" aria-hidden="true">
        <div className="auth-loading-brand">
          <div className="auth-loading-logo-wrap">
            <img src="/logo.png" alt="" className="auth-loading-logo" />
          </div>
          <div className="auth-loading-brand-text">
            <span className="auth-loading-brand-name">EventHub</span>
            <span className="auth-loading-brand-role">Super Admin</span>
          </div>
        </div>
        <nav className="auth-loading-nav">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="auth-loading-nav-row">
              <Skeleton width={18} height={18} circle />
              <Skeleton height={12} className="auth-loading-nav-skel" />
            </div>
          ))}
        </nav>
        <div className="auth-loading-sidebar-foot">
          <Skeleton height={36} className="auth-loading-nav-skel" />
        </div>
      </aside>

      <div className="auth-loading-main">
        <header className="auth-loading-topbar">
          <Skeleton height={38} width="min(320px, 42%)" />
          <div className="auth-loading-topbar-right">
            <Skeleton width={36} height={36} circle />
            <Skeleton width={36} height={36} circle />
            <Skeleton width={140} height={40} />
          </div>
        </header>

        <main className="auth-loading-body">
          <div className="auth-loading-head">
            <Skeleton height={32} width="min(380px, 55%)" />
            <Skeleton height={14} width="min(280px, 40%)" className="mt-2" />
          </div>
          <div className="auth-loading-grid">
            <div className="auth-loading-stat">
              <Skeleton height={44} width={44} circle />
              <div className="auth-loading-stat-text">
                <Skeleton height={10} width={80} />
                <Skeleton height={28} width={100} className="mt-2" />
              </div>
            </div>
            <div className="auth-loading-stat">
              <Skeleton height={44} width={44} circle />
              <div className="auth-loading-stat-text">
                <Skeleton height={10} width={90} />
                <Skeleton height={28} width={88} className="mt-2" />
              </div>
            </div>
          </div>
          <div className="auth-loading-panels">
            <div className="auth-loading-panel">
              <Skeleton height={18} width="40%" className="mb-4" />
              <Skeleton height={120} />
              <div className="auth-loading-panel-row">
                <Skeleton height={12} width="70%" />
                <Skeleton height={12} width="20%" />
              </div>
            </div>
            <div className="auth-loading-panel">
              <Skeleton height={18} width="35%" className="mb-4" />
              <Skeleton height={120} />
              <div className="auth-loading-panel-row">
                <Skeleton height={12} width="65%" />
                <Skeleton height={12} width="25%" />
              </div>
            </div>
          </div>
        </main>
      </div>

      <div className="auth-loading-status" aria-hidden="true">
        <div className="auth-loading-spinner-wrap">
          <div className="auth-loading-spinner" />
        </div>
        <p className="auth-loading-title">Connexion sécurisée</p>
        <p className="auth-loading-caption">Vérification de votre session administrateur…</p>
      </div>

      <div className="auth-loading-progress-track" aria-hidden="true">
        <div className="auth-loading-progress-indeterminate" />
      </div>
    </div>
  )
}
