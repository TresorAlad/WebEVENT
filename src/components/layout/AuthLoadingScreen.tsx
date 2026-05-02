/**
 * Écran de chargement professionnel
 * Centré, épuré et moderne.
 */
export default function AuthLoadingScreen() {
  return (
    <div className="pro-loading-screen" role="status" aria-live="polite" aria-busy="true" aria-label="Chargement de la console administrateur">
      <div className="pro-loading-content">
        <div className="pro-loading-logo-wrap">
          <img src="/logo.png" alt="EventHub" className="pro-loading-logo" />
        </div>
        
        <h1 className="pro-loading-title">
          EventHub <span className="pro-loading-badge">Admin</span>
        </h1>
        
        <div className="pro-loading-spinner-container">
          <div className="pro-loading-spinner" />
        </div>
        
        <p className="pro-loading-text">Initialisation de l'espace de travail...</p>
      </div>
    </div>
  )
}
