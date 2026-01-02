// src/modules/crm/pages/DevisDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { crmApi } from '../services/api';
import type { Devis } from '../types';
import './DevisDetailPage.css';

const DevisDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [devis, setDevis] = useState<Devis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      loadDevis();
    }
  }, [id]);

  const loadDevis = async () => {
    try {
      setLoading(true);
      const data = await crmApi.getDevisById(parseInt(id!));
      setDevis(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatut = async (nouveauStatut: string) => {
    if (!devis) return;

    try {
      setUpdating(true);
      await crmApi.updateDevisStatut(devis.id_devis, nouveauStatut);
      await loadDevis(); // Recharger les données
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'accepte':
        return { label: 'Accepté', class: 'ms-badge-success' };
      case 'envoye':
        return { label: 'Envoyé', class: 'ms-badge-warning' };
      case 'brouillon':
        return { label: 'Brouillon', class: 'ms-badge-neutral' };
      case 'refuse':
        return { label: 'Refusé', class: 'ms-badge-error' };
      case 'expire':
        return { label: 'Expiré', class: 'ms-badge-error' };
      default:
        return { label: statut, class: 'ms-badge-neutral' };
    }
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(montant);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getJoursRestants = (dateValidite?: string) => {
    if (!dateValidite) return null;
    
    const aujourdhui = new Date();
    const validite = new Date(dateValidite);
    const diffTime = validite.getTime() - aujourdhui.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  if (loading) {
    return (
      <div className="ms-page-container">
        <div className="ms-loading">Chargement du devis...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ms-page-container">
        <div className="ms-error-state">
          <div className="ms-error-icon">⚠</div>
          <h2>Erreur</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/crm/devis')}
            className="ms-btn ms-btn-primary"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  if (!devis) {
    return (
      <div className="ms-page-container">
        <div className="ms-error-state">
          <div className="ms-error-icon">📄</div>
          <h2>Devis non trouvé</h2>
          <p>Le devis demandé n'existe pas ou a été supprimé.</p>
          <button 
            onClick={() => navigate('/crm/devis')}
            className="ms-btn ms-btn-primary"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const statut = getStatutBadge(devis.statut);
  const joursRestants = getJoursRestants(devis.date_validite);
  const tva = devis.montant_ttc - devis.montant_ht;

  return (
    <div className="ms-page-container">
      {/* Header de page */}
      <div className="ms-page-header">
        <div className="ms-header-left">
          <button 
            onClick={() => navigate('/crm/devis')}
            className="ms-back-button"
          >
            ← Retour
          </button>
          <h1 className="ms-page-title">{devis.numero_devis}</h1>
          <div className="ms-page-subtitle">
            {devis.objet}
          </div>
        </div>
        <div className="ms-header-actions">
          <span className={`ms-badge ${statut.class}`}>
            {statut.label}
          </span>
          <button 
            onClick={() => navigate(`/crm/devis/${devis.id_devis}/modifier`)}
            className="ms-btn ms-btn-secondary"
          >
            Modifier
          </button>
        </div>
      </div>

      <div className="ms-detail-layout">
        {/* Contenu principal */}
        <div className="ms-detail-main">
          {/* Section Informations client */}
          <div className="ms-detail-section">
            <div className="ms-section-header">
              <h2 className="ms-section-title">Informations client</h2>
            </div>
            <div className="ms-section-content">
              <div className="ms-property-grid">
                <div className="ms-property">
                  <span className="ms-property-label">Client</span>
                  <span className="ms-property-value">
                    {devis.client_nom || 'Non spécifié'}
                  </span>
                </div>
                {devis.client?.email && (
                  <div className="ms-property">
                    <span className="ms-property-label">Email</span>
                    <a 
                      href={`mailto:${devis.client.email}`}
                      className="ms-property-value ms-link"
                    >
                      {devis.client.email}
                    </a>
                  </div>
                )}
                {devis.client?.telephone && (
                  <div className="ms-property">
                    <span className="ms-property-label">Téléphone</span>
                    <a 
                      href={`tel:${devis.client.telephone}`}
                      className="ms-property-value ms-link"
                    >
                      {devis.client.telephone}
                    </a>
                  </div>
                )}
                {devis.client?.adresse && (
                  <div className="ms-property">
                    <span className="ms-property-label">Adresse</span>
                    <span className="ms-property-value">
                      {devis.client.adresse}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section Détails du devis */}
          <div className="ms-detail-section">
            <div className="ms-section-header">
              <h2 className="ms-section-title">Détails du devis</h2>
            </div>
            <div className="ms-section-content">
              <div className="ms-property-grid">
                <div className="ms-property">
                  <span className="ms-property-label">Date d'émission</span>
                  <span className="ms-property-value">
                    {formatDate(devis.date_devis)}
                  </span>
                </div>
                {devis.date_validite && (
                  <div className="ms-property">
                    <span className="ms-property-label">Date de validité</span>
                    <span className="ms-property-value">
                      {formatDate(devis.date_validite)}
                      {joursRestants !== null && (
                        <span className="ms-jours-restants">
                          ({joursRestants > 0 ? `${joursRestants} jour${joursRestants !== 1 ? 's' : ''} restant${joursRestants !== 1 ? 's' : ''}` : 'Expiré'})
                        </span>
                      )}
                    </span>
                  </div>
                )}
                <div className="ms-property">
                  <span className="ms-property-label">Dernière modification</span>
                  <span className="ms-property-value">
                    {formatDate(devis.updated_at)}
                  </span>
                </div>
              </div>

              {devis.description && (
                <div className="ms-description-section">
                  <span className="ms-description-label">Description</span>
                  <p className="ms-description-content">{devis.description}</p>
                </div>
              )}

              {devis.conditions && (
                <div className="ms-description-section">
                  <span className="ms-description-label">Conditions</span>
                  <p className="ms-description-content">{devis.conditions}</p>
                </div>
              )}

              {devis.notes && (
                <div className="ms-description-section">
                  <span className="ms-description-label">Notes</span>
                  <p className="ms-description-content">{devis.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="ms-detail-sidebar">
          {/* Résumé financier */}
          <div className="ms-detail-section">
            <div className="ms-section-header">
              <h2 className="ms-section-title">Résumé financier</h2>
            </div>
            <div className="ms-section-content">
              <div className="ms-financial-summary">
                <div className="ms-financial-row">
                  <span className="ms-financial-label">Montant HT</span>
                  <span className="ms-financial-value">
                    {formatMontant(devis.montant_ht)}
                  </span>
                </div>
                <div className="ms-financial-row">
                  <span className="ms-financial-label">TVA (20%)</span>
                  <span className="ms-financial-value">
                    {formatMontant(tva)}
                  </span>
                </div>
                <div className="ms-financial-row ms-financial-total">
                  <span className="ms-financial-label">Montant TTC</span>
                  <span className="ms-financial-value">
                    {formatMontant(devis.montant_ttc)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="ms-detail-section">
            <div className="ms-section-header">
              <h2 className="ms-section-title">Actions</h2>
            </div>
            <div className="ms-section-content">
              <div className="ms-actions-grid">
                <button 
                  onClick={() => navigate(`/crm/devis/${devis.id_devis}/modifier`)}
                  className="ms-btn ms-btn-secondary"
                  disabled={updating}
                >
                  Modifier le devis
                </button>

                {devis.statut === 'brouillon' && (
                  <button 
                    onClick={() => handleUpdateStatut('envoye')}
                    className="ms-btn ms-btn-primary"
                    disabled={updating}
                  >
                    Envoyer au client
                  </button>
                )}

                {devis.statut === 'envoye' && (
                  <div className="ms-actions-group">
                    <button 
                      onClick={() => handleUpdateStatut('accepte')}
                      className="ms-btn ms-btn-success"
                      disabled={updating}
                    >
                      Marquer comme accepté
                    </button>
                    <button 
                      onClick={() => handleUpdateStatut('refuse')}
                      className="ms-btn ms-btn-danger"
                      disabled={updating}
                    >
                      Marquer comme refusé
                    </button>
                  </div>
                )}

                <button 
                  className="ms-btn ms-btn-secondary"
                  disabled={updating}
                >
                  Télécharger PDF
                </button>

                <button 
                  className="ms-btn ms-btn-danger ms-btn-outline"
                  disabled={updating}
                >
                  Supprimer le devis
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevisDetailPage;