// src/core/auth/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiShield,
  FiLock,
  FiMail,
} from 'react-icons/fi';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirection si déjà authentifié
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login({ email, password });
      // La redirection se fera automatiquement via l'useEffect
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Afficher le loading pendant la vérification initiale
  if (isLoading) {
    return (
      <div className="login-loading">
        <div className="spinner"></div>
        <p>Vérification de la session...</p>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Section Image d'import-export */}
        <div className="login-image-section">
          <div className="image-overlay">
            <div className="company-brand">
              <h1 className="company-name">OMNISERVE EXPERTS</h1>
              <p className="company-tagline">Gestion d'import-export</p>
            </div>
          </div>
        </div>

        {/* Section Formulaire */}
        <div className="login-form-section">
          <div className="form-container">
            <div className="login-header">
              <div className="logo-container">
                <div className="logo-icon">
                  <div className="logo-initials">OE</div>
                </div>
                <div className="logo-text">
                  <h2 className="login-title">Connexion</h2>
                  <p className="login-subtitle">Accédez à votre espace OMNISERVE EXPERTS</p>
                </div>
              </div>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              {error && (
                <div className="error-message">
                  <FiAlertCircle className="error-icon" />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <div className="input-with-icon">
                  <FiMail className="input-icon-left" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="form-input with-icon"
                    placeholder="Entrez votre email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Mot de passe
                </label>
                <div className="input-with-icon">
                  <FiLock className="input-icon-left" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="form-input with-icon"
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    tabIndex={-1}
                    disabled={isSubmitting}
                    title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isSubmitting}
                  />
                  <span className="remember-text">Se souvenir de moi</span>
                </label>
                <a href="#" className="forgot-password" onClick={(e) => {
                  e.preventDefault();
                  setError('Fonctionnalité de récupération à implémenter');
                }}>
                  Mot de passe oublié ?
                </a>
              </div>

              <button 
                type="submit" 
                className="login-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="button-spinner"></div>
                    Connexion...
                  </>
                ) : (
                  <span>Se connecter</span>
                )}
              </button>

              <div className="login-footer">
                <p className="version-info">Version 2.0 © 2025 OMNISERVE EXPERTS</p>
                <p className="security-info">
                  <FiShield className="security-icon" />
                  <span>Connexion sécurisée</span>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;