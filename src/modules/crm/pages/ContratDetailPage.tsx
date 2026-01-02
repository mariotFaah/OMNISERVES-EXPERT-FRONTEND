// src/modules/crm/pages/ContratDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import crmApi from '../services/api';
import './ContratDetailPage.css';
import type { Contrat } from '../types/index';

const ContratDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [contrat, setContrat] = useState<Contrat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      chargerContrat(parseInt(id));
    }
  }, [id]);

  const chargerContrat = async (contratId: number) => {
    try {
      setLoading(true);
      const data = await crmApi.getContrat(contratId);
      setContrat(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const changerStatut = async (nouveauStatut: string) => {
    if (!contrat) return;
    
    try {
      await crmApi.updateContratStatut(contrat.id_contrat, nouveauStatut);
      chargerContrat(contrat.id_contrat);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du changement de statut');
    }
  };

  const getJoursRestants = (dateFin?: string): number => {
    if (!dateFin) return 0;
    const fin = new Date(dateFin);
    const aujourdhui = new Date();
    const difference = fin.getTime() - aujourdhui.getTime();
    return Math.ceil(difference / (1000 * 3600 * 24));
  };

  const exporterPDF = () => {
    alert('Fonctionnalité d\'export PDF à implémenter');
  };

  if (loading) {
    return (
      <div className="ms-crm-loading">
        <div className="ms-crm-spinner"></div>
        <span>Chargement du contrat...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ms-crm-error-state">
        <div className="ms-crm-error-icon">⚠</div>
        <h2>Erreur</h2>
        <p>{error}</p>
        <Link to="/crm/contrats" className="ms-crm-btn ms-crm-btn-primary">
          Retour aux contrats
        </Link>
      </div>
    );
  }

  if (!contrat) {
    return (
      <div className="ms-crm-error-state">
        <div className="ms-crm-error-icon">❌</div>
        <h2>Contrat non trouvé</h2>
        <p>Le contrat demandé n'existe pas ou a été supprimé.</p>
        <Link to="/crm/contrats" className="ms-crm-btn ms-crm-btn-primary">
          Retour aux contrats
        </Link>
      </div>
    );
  }

  const joursRestants = getJoursRestants(contrat.date_fin);

  return (
    <div className="ms-crm-container">
      {/* Header Microsoft Style */}
      <div className="ms-crm-header">
        <div className="ms-crm-header-left">
          <Link to="/crm/contrats" className="ms-crm-back-button">
            <span className="ms-crm-back-icon">←</span>
            Retour aux contrats
          </Link>
          <div className="ms-crm-title-section">
            <h1 className="ms-crm-page-title">
              Contrat {contrat.numero_contrat}
            </h1>
            <p className="ms-crm-subtitle">{contrat.client_nom}</p>
          </div>
        </div>
        
        <div className="ms-crm-header-actions">
          <Link 
            to={`/crm/contrats/${contrat.id_contrat}/modifier`}
            className="ms-crm-btn ms-crm-btn-secondary"
          >
            Modifier
          </Link>
          <button 
            className="ms-crm-btn ms-crm-btn-primary"
            onClick={exporterPDF}
          >
            <span className="ms-crm-icon">📄</span>
            Exporter PDF
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ms-crm-content">
        <div className="ms-crm-detail-layout">
          
          {/* Left Column - Main Content */}
          <div className="ms-crm-detail-main">
            
            {/* Status and Quick Actions Card */}
            <div className="ms-crm-card">
              <div className="ms-crm-card-header">
                <h2 className="ms-crm-card-title">État du contrat</h2>
              </div>
              <div className="ms-crm-card-content">
                <div className="ms-crm-status-section">
                  <div className="ms-crm-status-badge-container">
                    <span className={`ms-crm-status-badge ms-crm-status-${contrat.statut}`}>
                      {contrat.statut}
                    </span>
                    {contrat.date_fin && (
                      <div className="ms-crm-days-remaining">
                        {joursRestants > 0 ? (
                          <span className="ms-crm-days-positive">
                            {joursRestants} jour{joursRestants > 1 ? 's' : ''} restant{joursRestants > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="ms-crm-days-negative">
                            Expiré depuis {Math.abs(joursRestants)} jour{Math.abs(joursRestants) > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="ms-crm-quick-actions">
                    <h3 className="ms-crm-section-title">Actions rapides</h3>
                    <div className="ms-crm-action-buttons">
                      {contrat.statut === 'actif' && (
                        <>
                          <button 
                            onClick={() => changerStatut('resilie')}
                            className="ms-crm-btn ms-crm-btn-warning"
                          >
                            Résilier le contrat
                          </button>
                          <button 
                            onClick={() => changerStatut('termine')}
                            className="ms-crm-btn ms-crm-btn-info"
                          >
                            Marquer comme terminé
                          </button>
                        </>
                      )}
                      {contrat.statut === 'inactif' && (
                        <button 
                          onClick={() => changerStatut('actif')}
                          className="ms-crm-btn ms-crm-btn-success"
                        >
                          Activer le contrat
                        </button>
                      )}
                      {(contrat.statut === 'resilie' || contrat.statut === 'termine') && (
                        <button 
                          onClick={() => changerStatut('actif')}
                          className="ms-crm-btn ms-crm-btn-success"
                        >
                          Réactiver le contrat
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Information Card */}
            <div className="ms-crm-card">
              <div className="ms-crm-card-header">
                <h2 className="ms-crm-card-title">Informations du contrat</h2>
              </div>
              <div className="ms-crm-card-content">
                <div className="ms-crm-info-grid">
                  <div className="ms-crm-info-group">
                    <label className="ms-crm-info-label">Type de contrat</label>
                    <span className="ms-crm-info-value">{contrat.type_contrat}</span>
                  </div>
                  <div className="ms-crm-info-group">
                    <label className="ms-crm-info-label">Date de début</label>
                    <span className="ms-crm-info-value">
                      {new Date(contrat.date_debut).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="ms-crm-info-group">
                    <label className="ms-crm-info-label">Date de fin</label>
                    <span className="ms-crm-info-value">
                      {contrat.date_fin 
                        ? new Date(contrat.date_fin).toLocaleDateString('fr-FR')
                        : 'Non définie'
                      }
                    </span>
                  </div>
                  <div className="ms-crm-info-group">
                    <label className="ms-crm-info-label">Périodicité</label>
                    <span className="ms-crm-info-value">{contrat.periodicite}</span>
                  </div>
                  <div className="ms-crm-info-group">
                    <label className="ms-crm-info-label">Montant HT</label>
                    <span className="ms-crm-info-value ms-crm-amount">
                      {contrat.montant_ht.toLocaleString('fr-FR')} €
                    </span>
                  </div>
                  <div className="ms-crm-info-group">
                    <label className="ms-crm-info-label">Montant TTC</label>
                    <span className="ms-crm-info-value ms-crm-amount ms-crm-ttc">
                      {(contrat.montant_ht * 1.2).toLocaleString('fr-FR')} €
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="ms-crm-card">
              <div className="ms-crm-card-header">
                <h2 className="ms-crm-card-title">Description</h2>
              </div>
              <div className="ms-crm-card-content">
                <div className="ms-crm-description">
                  {contrat.description || (
                    <span className="ms-crm-empty-state">Aucune description fournie</span>
                  )}
                </div>
              </div>
            </div>

            {/* Conditions Card */}
            {contrat.conditions && (
              <div className="ms-crm-card">
                <div className="ms-crm-card-header">
                  <h2 className="ms-crm-card-title">Conditions particulières</h2>
                </div>
                <div className="ms-crm-card-content">
                  <div className="ms-crm-conditions">
                    {contrat.conditions}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="ms-crm-detail-sidebar">
            
            {/* Associated Documents Card */}
            <div className="ms-crm-card">
              <div className="ms-crm-card-header">
                <h3 className="ms-crm-card-title">Documents associés</h3>
              </div>
              <div className="ms-crm-card-content">
                <div className="ms-crm-documents-list">
                  {contrat.devis_id && (
                    <Link 
                      to={`/crm/devis/${contrat.devis_id}`}
                      className="ms-crm-document-link"
                    >
                      <span className="ms-crm-document-icon">📋</span>
                      <div className="ms-crm-document-info">
                        <span className="ms-crm-document-title">Devis associé</span>
                        <span className="ms-crm-document-subtitle">Document source</span>
                      </div>
                    </Link>
                  )}
                  <button 
                    className="ms-crm-document-link"
                    onClick={() => alert('Fonctionnalité à implémenter')}
                  >
                    <span className="ms-crm-document-icon">🧾</span>
                    <div className="ms-crm-document-info">
                      <span className="ms-crm-document-title">Factures</span>
                      <span className="ms-crm-document-subtitle">Documents de paiement</span>
                    </div>
                  </button>
                  <button 
                    className="ms-crm-document-link"
                    onClick={() => alert('Fonctionnalité à implémenter')}
                  >
                    <span className="ms-crm-document-icon">📊</span>
                    <div className="ms-crm-document-info">
                      <span className="ms-crm-document-title">Rapports d'activité</span>
                      <span className="ms-crm-document-subtitle">Suivi des prestations</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Metadata Card */}
            <div className="ms-crm-card">
              <div className="ms-crm-card-header">
                <h3 className="ms-crm-card-title">Métadonnées</h3>
              </div>
              <div className="ms-crm-card-content">
                <div className="ms-crm-metadata">
                  <div className="ms-crm-metadata-item">
                    <label className="ms-crm-metadata-label">Créé le</label>
                    <span className="ms-crm-metadata-value">
                      {new Date(contrat.created_at).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <div className="ms-crm-metadata-item">
                    <label className="ms-crm-metadata-label">Modifié le</label>
                    <span className="ms-crm-metadata-value">
                      {new Date(contrat.updated_at).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <div className="ms-crm-metadata-item">
                    <label className="ms-crm-metadata-label">Référence</label>
                    <span className="ms-crm-metadata-value">{contrat.numero_contrat}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Client Information Card */}
            <div className="ms-crm-card">
              <div className="ms-crm-card-header">
                <h3 className="ms-crm-card-title">Client</h3>
              </div>
              <div className="ms-crm-card-content">
                <div className="ms-crm-client-info">
                  <div className="ms-crm-client-name">{contrat.client_nom}</div>
                  {contrat.client_email && (
                    <div className="ms-crm-client-email">{contrat.client_email}</div>
                  )}
                  <Link 
                    to={`/crm/clients/${contrat.tiers_id}`}
                    className="ms-crm-btn ms-crm-btn-secondary ms-crm-btn-small ms-crm-btn-block"
                  >
                    Voir la fiche client
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContratDetailPage;