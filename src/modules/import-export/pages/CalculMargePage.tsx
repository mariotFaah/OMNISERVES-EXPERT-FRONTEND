import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { importExportApi } from '../services/api';
import type { Commande } from '../types';
import MargeIndicator from '../components/MargeIndicator/MargeIndicator';
import StatutBadge from '../components/StatutBadge/StatutBadge';
import { useCalculMarge } from '../hooks/useCalculMarge';
import './CalculMargePage.css';

const CalculMargePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [commande, setCommande] = useState<Commande | null>(null);
  const { marge, loading, error, calculerMarge } = useCalculMarge();

  useEffect(() => {
    if (id) {
      loadDonnees();
    }
  }, [id]);

  const loadDonnees = async () => {
    try {
      const commandeData = await importExportApi.getCommande(Number(id));
      setCommande(commandeData);
      await calculerMarge(Number(id));
    } catch (err) {
      console.error('Erreur chargement données:', err);
    }
  };

  const getColorClass = (tauxMarge: number) => {
    if (tauxMarge >= 30) return 'positive';
    if (tauxMarge >= 15) return 'medium';
    return 'negative';
  };

  const getMargeStatus = (tauxMarge: number) => {
    if (tauxMarge >= 30) return 'Excellente';
    if (tauxMarge >= 20) return 'Bonne';
    if (tauxMarge >= 10) return 'Moyenne';
    return 'Faible';
  };

  if (loading) {
    return (
      <div className="calcul-marge-container">
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !commande || !marge) {
    return (
      <div className="calcul-marge-container">
        <div className="error-message">
          <h2>Erreur</h2>
          <p>{error || 'Données non disponibles'}</p>
          <Link to="/import-export/commandes" className="btn-primary">
            Retour aux commandes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="calcul-marge-container">
      <div className="calcul-marge-content">
        {/* En-tête */}
        <div className="calcul-marge-header">
          <div className="header-main">
            <h1 className="page-title">Analyse de Rentabilité</h1>
            <p className="page-subtitle">
              Commande {commande.numero_commande} - {commande.type === 'import' ? 'Import' : 'Export'}
            </p>
          </div>
          <div className="header-actions">
            <Link to={`/import-export/commandes/${commande.id}`} className="btn-secondary">
              Détails commande
            </Link>
            <Link to="/import-export/commandes" className="btn-secondary">
              Liste des commandes
            </Link>
          </div>
        </div>

        {/* Informations de base */}
        <div className="info-section">
          <h2 className="section-title">Informations de la Commande</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Client:</span>
              <span className="info-value">{commande.client?.nom || 'Non spécifié'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Fournisseur:</span>
              <span className="info-value">{commande.fournisseur?.nom || 'Non spécifié'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Date commande:</span>
              <span className="info-value">
                {new Date(commande.date_commande).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Statut:</span>
              <StatutBadge statut={commande.statut} type="commande" />
            </div>
          </div>
        </div>

        {/* NOUVEAU : Indicateur de marge amélioré */}
        {marge && (
          <div className="marge-overview-section">
            <h2 className="section-title">Aperçu de la Rentabilité</h2>
            <div className="marge-overview">
              <MargeIndicator 
                margeBrute={marge.marge_brute}
                chiffreAffaires={marge.chiffre_affaires}
                showTaux={true}
                size="lg"
              />
            </div>
          </div>
        )}

        {/* Indicateurs de performance */}
        <div className="kpi-section">
          <h2 className="section-title">Indicateurs de Performance</h2>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-header">
                <h3>Marge Brute</h3>
                <div className={`kpi-trend ${getColorClass(marge.taux_marge)}`}>
                  {getMargeStatus(marge.taux_marge)}
                </div>
              </div>
              <div className="kpi-value">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: commande.devise
                }).format(marge.marge_brute)}
              </div>
              <div className="kpi-label">Montant absolu</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <h3>Taux de Marge</h3>
                <div className={`kpi-percentage ${getColorClass(marge.taux_marge)}`}>
                  {marge.taux_marge.toFixed(2)}%
                </div>
              </div>
              <div className="kpi-progress">
                <div 
                  className={`progress-bar ${getColorClass(marge.taux_marge)}`}
                  style={{ width: `${Math.min(marge.taux_marge, 100)}%` }}
                ></div>
              </div>
              <div className="kpi-label">Pourcentage sur CA</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <h3>Chiffre d'Affaires</h3>
              </div>
              <div className="kpi-value revenue">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: commande.devise
                }).format(marge.chiffre_affaires)}
              </div>
              <div className="kpi-label">Total TTC</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <h3>Coûts Logistiques</h3>
              </div>
              <div className="kpi-value cost">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: commande.couts_logistiques?.devise_couts || commande.devise
                }).format(marge.total_couts)}
              </div>
              <div className="kpi-label">Total des coûts</div>
            </div>
          </div>
        </div>

        {/* Détail des calculs */}
        <div className="calcul-detail-section">
          <div className="calcul-grid">
            {/* Revenus */}
            <div className="calcul-column">
              <h3 className="column-title">Revenus</h3>
              <div className="calcul-item">
                <span className="calcul-label">Chiffre d'Affaires HT:</span>
                <span className="calcul-value">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: commande.devise
                  }).format(marge.chiffre_affaires / 1.2)}
                </span>
              </div>
              <div className="calcul-item">
                <span className="calcul-label">TVA:</span>
                <span className="calcul-value">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: commande.devise
                  }).format(marge.chiffre_affaires - (marge.chiffre_affaires / 1.2))}
                </span>
              </div>
              <div className="calcul-item total">
                <span className="calcul-label">Chiffre d'Affaires TTC:</span>
                <span className="calcul-value">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: commande.devise
                  }).format(marge.chiffre_affaires)}
                </span>
              </div>
            </div>

            {/* Coûts */}
            <div className="calcul-column">
              <h3 className="column-title">Coûts Logistiques</h3>
              {commande.couts_logistiques && (
                <>
                  {commande.couts_logistiques.fret_maritime > 0 && (
                    <div className="calcul-item">
                      <span className="calcul-label">Fret maritime:</span>
                      <span className="calcul-value">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: commande.couts_logistiques.devise_couts
                        }).format(commande.couts_logistiques.fret_maritime)}
                      </span>
                    </div>
                  )}
                  {commande.couts_logistiques.fret_aerien > 0 && (
                    <div className="calcul-item">
                      <span className="calcul-label">Fret aérien:</span>
                      <span className="calcul-value">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: commande.couts_logistiques.devise_couts
                        }).format(commande.couts_logistiques.fret_aerien)}
                      </span>
                    </div>
                  )}
                  {commande.couts_logistiques.assurance > 0 && (
                    <div className="calcul-item">
                      <span className="calcul-label">Assurance:</span>
                      <span className="calcul-value">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: commande.couts_logistiques.devise_couts
                        }).format(commande.couts_logistiques.assurance)}
                      </span>
                    </div>
                  )}
                  {commande.couts_logistiques.droits_douane > 0 && (
                    <div className="calcul-item">
                      <span className="calcul-label">Droits de douane:</span>
                      <span className="calcul-value">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: commande.couts_logistiques.devise_couts
                        }).format(commande.couts_logistiques.droits_douane)}
                      </span>
                    </div>
                  )}
                  {commande.couts_logistiques.autres_frais > 0 && (
                    <div className="calcul-item">
                      <span className="calcul-label">Autres frais:</span>
                      <span className="calcul-value">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: commande.couts_logistiques.devise_couts
                        }).format(commande.couts_logistiques.autres_frais)}
                      </span>
                    </div>
                  )}
                </>
              )}
              <div className="calcul-item total">
                <span className="calcul-label">Total coûts:</span>
                <span className="calcul-value">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: commande.couts_logistiques?.devise_couts || commande.devise
                  }).format(marge.total_couts)}
                </span>
              </div>
            </div>

            {/* Résultat */}
            <div className="calcul-column">
              <h3 className="column-title">Résultat</h3>
              <div className="calcul-item">
                <span className="calcul-label">Marge brute:</span>
                <span className="calcul-value positive">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: commande.devise
                  }).format(marge.marge_brute)}
                </span>
              </div>
              <div className="calcul-item">
                <span className="calcul-label">Taux de marge:</span>
                <span className={`calcul-value ${getColorClass(marge.taux_marge)}`}>
                  {marge.taux_marge.toFixed(2)}%
                </span>
              </div>
              <div className="calcul-item insight">
                <span className="calcul-label">Analyse:</span>
                <span className="calcul-value">
                  {marge.taux_marge >= 20 
                    ? '✅ Rentabilité élevée' 
                    : marge.taux_marge >= 10 
                    ? '⚠️ Rentabilité acceptable' 
                    : '❌ Rentabilité faible'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommandations */}
        {marge.taux_marge < 15 && (
          <div className="recommendation-section">
            <h3 className="section-title">Recommandations</h3>
            <div className="recommendation-content">
              <p>Pour améliorer la rentabilité de cette opération :</p>
              <ul>
                {marge.taux_marge < 10 && (
                  <li>Négocier les prix d'achat avec le fournisseur</li>
                )}
                <li>Optimiser les coûts logistiques (fret, assurance)</li>
                <li>Revoir la stratégie tarifaire de vente</li>
                <li>Étudier des modes de transport alternatifs</li>
              </ul>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="action-section">
          <Link to={`/import-export/commandes/${commande.id}/couts`} className="btn-primary">
            Modifier les coûts
          </Link>
          <button onClick={loadDonnees} className="btn-secondary">
            Actualiser
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalculMargePage;