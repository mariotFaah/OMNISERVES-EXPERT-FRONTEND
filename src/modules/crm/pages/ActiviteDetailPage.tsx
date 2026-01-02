// src/modules/crm/pages/ActiviteDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import crmApi from '../services/api';
import './ActiviteDetailPage.css';

interface ActiviteDetail {
  id_activite: number;
  tiers_id: number;
  client_nom: string;
  type_activite: string;
  sujet: string;
  description?: string;
  date_activite: string;
  date_rappel?: string | null;
  statut: 'planifie' | 'realise' | 'annule';
  priorite: 'basse' | 'normal' | 'haute';
  duree?: number;
  lieu?: string;
  participants?: string;
  resultat?: string;
  created_at: string;
  updated_at: string;
}

const ActiviteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const [activite, setActivite] = useState<ActiviteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      chargerActivite(parseInt(id));
    }
  }, [id]);

  const chargerActivite = async (activiteId: number) => {
    const normalizePriorite = (p: string): ActiviteDetail['priorite'] => {
      switch (p) {
        case 'bas':
        case 'basse':
          return 'basse';
        case 'haut':
        case 'haute':
          return 'haute';
        case 'urgent':
          // treat 'urgent' as high priority
          return 'haute';
        case 'normal':
          return 'normal';
        default:
          return 'normal';
      }
    };

    try {
      setLoading(true);
      const data = await crmApi.getActivite(activiteId);
      // map/normalize API result to the ActiviteDetail shape expected by this component
      const mapped = { ...data, priorite: normalizePriorite((data as any).priorite) } as ActiviteDetail;
      setActivite(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const changerStatut = async (nouveauStatut: string) => {
    if (!activite) return;
    
    try {
      await crmApi.updateActiviteStatut(activite.id_activite, nouveauStatut);
      chargerActivite(activite.id_activite);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du changement de statut');
    }
  };

  const getPrioriteClass = (priorite: string) => {
    switch (priorite) {
      case 'haute': return 'priorite-haute';
      case 'normal': return 'priorite-normal';
      case 'basse': return 'priorite-basse';
      default: return '';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appel': return '📞 Appel téléphonique';
      case 'email': return '✉️ Email';
      case 'reunion': return '👥 Réunion';
      case 'visite': return '🏢 Visite';
      case 'facture': return '🧾 Facture';
      case 'commande': return '📦 Commande';
      default: return '📝 ' + type;
    }
  };

  if (loading) return <div className="loading">Chargement de l'activité...</div>;
  if (error) return <div className="error">Erreur: {error}</div>;
  if (!activite) return <div className="error">Activité non trouvée</div>;

  return (
    <div className="activite-detail-page">
      <div className="page-header">
        <div className="header-left">
          <Link to="/crm/activites" className="back-link">
            ← Retour aux activités
          </Link>
          <h1>{activite.sujet}</h1>
          <p className="client-name">{activite.client_nom}</p>
        </div>
        <div className="header-actions">
          <Link 
            to={`/crm/activites/${activite.id_activite}/modifier`}
            className="btn-secondary"
          >
            Modifier
          </Link>
          {activite.statut === 'planifie' && (
            <button 
              onClick={() => changerStatut('realise')}
              className="btn-success"
            >
              Marquer comme réalisé
            </button>
          )}
        </div>
      </div>

      <div className="activite-content">
        {/* En-tête */}
        <div className="activite-header">
          <div className="type-priorite">
            <div className="type-badge">
              {getTypeIcon(activite.type_activite)}
            </div>
            <div className={`priorite-badge ${getPrioriteClass(activite.priorite)}`}>
              Priorité: {activite.priorite}
            </div>
          </div>
          
          <div className={`statut-section ${activite.statut}`}>
            <span className="statut-label">Statut:</span>
            <span className="statut-value">{activite.statut}</span>
          </div>
        </div>

        {/* Informations principales */}
        <div className="info-grid">
          <div className="info-card">
            <h3>Détails de l'activité</h3>
            <div className="info-list">
              <div className="info-item">
                <label>Date et heure:</label>
                <span>{new Date(activite.date_activite).toLocaleString()}</span>
              </div>
              {activite.date_rappel && (
                <div className="info-item">
                  <label>Rappel programmé:</label>
                  <span>{new Date(activite.date_rappel).toLocaleString()}</span>
                </div>
              )}
              {activite.duree && (
                <div className="info-item">
                  <label>Durée:</label>
                  <span>{activite.duree} minutes</span>
                </div>
              )}
              {activite.lieu && (
                <div className="info-item">
                  <label>Lieu:</label>
                  <span>{activite.lieu}</span>
                </div>
              )}
              {activite.participants && (
                <div className="info-item">
                  <label>Participants:</label>
                  <span>{activite.participants}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="description-card">
            <h3>Description</h3>
            <p>{activite.description || 'Aucune description'}</p>
          </div>

          {/* Résultat */}
          {activite.resultat && (
            <div className="resultat-card">
              <h3>Résultat</h3>
              <p>{activite.resultat}</p>
            </div>
          )}

          {/* Actions rapides */}
          <div className="actions-card">
            <h3>Actions</h3>
            <div className="actions-list">
              {activite.statut === 'planifie' && (
                <>
                  <button 
                    onClick={() => changerStatut('realise')}
                    className="btn-action btn-success"
                  >
                    ✓ Marquer réalisé
                  </button>
                  <button 
                    onClick={() => changerStatut('annule')}
                    className="btn-action btn-warning"
                  >
                    ✗ Annuler
                  </button>
                </>
              )}
              {activite.statut === 'realise' && (
                <button 
                  onClick={() => changerStatut('planifie')}
                  className="btn-action btn-secondary"
                >
                  ↶ Replanifier
                </button>
              )}
              <Link 
                to={`/crm/clients/${activite.tiers_id}`}
                className="btn-action btn-info"
              >
                👤 Voir le client
              </Link>
            </div>
          </div>
        </div>

        {/* Métadonnées */}
        <div className="metadata">
          <div className="metadata-item">
            <strong>Créé le:</strong> 
            {new Date(activite.created_at).toLocaleString()}
          </div>
          <div className="metadata-item">
            <strong>Modifié le:</strong> 
            {new Date(activite.updated_at).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiviteDetailPage;