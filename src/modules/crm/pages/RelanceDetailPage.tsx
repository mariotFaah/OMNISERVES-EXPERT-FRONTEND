// src/modules/crm/pages/RelanceDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { crmApi } from '../services/api';
import type { Relance, Client } from '../types';
import './RelanceDetailPage.css';

const RelanceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [relance, setRelance] = useState<Relance | null>(null);
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    if (id) {
      loadRelanceData();
    }
  }, [id]);

  const loadRelanceData = async () => {
    try {
      setLoading(true);
      const relanceData = await crmApi.getRelance(parseInt(id!));
      setRelance(relanceData);

      // Charger les infos du client associé
      const clientData = await crmApi.getClient(relanceData.tiers_id);
      setClient(clientData);
      
    } catch (error) {
      console.error('Erreur chargement relance:', error);
      alert('Relance non trouvée');
      navigate('/crm/relances');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatut = async (nouveauStatut: Relance['statut']) => {
    if (!relance) return;

    try {
      await crmApi.updateRelanceStatut(relance.id_relance, nouveauStatut);
      alert(`Statut mis à jour: ${nouveauStatut}`);
      loadRelanceData(); // Recharger les données
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDelete = async () => {
    if (!relance || !window.confirm('Êtes-vous sûr de vouloir supprimer cette relance ?')) {
      return;
    }

    try {
      await crmApi.updateRelance(relance.id_relance, { statut: 'annulee' });
      alert('Relance annulée avec succès');
      navigate('/crm/relances');
    } catch (error) {
      console.error('Erreur suppression relance:', error);
      alert('Erreur lors de la suppression de la relance');
    }
  };

  const getStatutColor = (statut: Relance['statut']) => {
    switch (statut) {
      case 'en_attente': return '#ed8936';
      case 'envoyee': return '#4299e1';
      case 'traitee': return '#48bb78';
      case 'annulee': return '#e53e3e';
      default: return '#a0aec0';
    }
  };

  const getTypeIcon = (type: Relance['type_relance']) => {
    switch (type) {
      case 'paiement': return '💰';
      case 'contrat': return '📄';
      case 'echeance': return '⏰';
      case 'commerciale': return '📞';
      default: return '🔔';
    }
  };

  if (loading) {
    return (
      <div className="relance-detail-container">
        <div className="loading">Chargement de la relance...</div>
      </div>
    );
  }

  if (!relance) {
    return (
      <div className="relance-detail-container">
        <div className="error">Relance non trouvée</div>
      </div>
    );
  }

  return (
    <div className="relance-detail-container">
      {/* En-tête avec actions */}
      <div className="relance-header">
        <div className="header-content">
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/crm/relances')}
          >
            ← Retour aux relances
          </button>
          <h1>Détail de la Relance</h1>
        </div>
        <div className="header-actions">
          <Link 
            to={`/crm/relances/${relance.id_relance}/modifier`}
            className="btn btn-primary"
          >
            ✏️ Modifier
          </Link>
          <button 
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={relance.statut === 'annulee'}
          >
            🗑️ Annuler
          </button>
        </div>
      </div>

      <div className="relance-content">
        {/* Carte principale */}
        <div className="relance-card">
          <div className="relance-icon">
            {getTypeIcon(relance.type_relance)}
          </div>
          
          <div className="relance-info">
            <div className="relance-title-section">
              <h2 className="relance-objet">{relance.objet}</h2>
              <span 
                className="statut-badge"
                style={{ backgroundColor: getStatutColor(relance.statut) }}
              >
                {relance.statut}
              </span>
            </div>
            
            <div className="relance-meta">
              <div className="meta-item">
                <span className="meta-label">Type :</span>
                <span className="meta-value">{relance.type_relance}</span>
              </div>
              
              <div className="meta-item">
                <span className="meta-label">Canal :</span>
                <span className="meta-value">{relance.canal}</span>
              </div>
              
              {client && (
                <div className="meta-item">
                  <span className="meta-label">Client :</span>
                  <Link to={`/crm/clients/${client.id_tiers}`} className="meta-value link">
                    {client.nom}
                  </Link>
                </div>
              )}
            </div>

            <div className="relance-dates">
              <div className="date-item">
                <span className="date-label">Date de relance :</span>
                <span className="date-value">
                  {new Date(relance.date_relance).toLocaleDateString()}
                </span>
              </div>
              
              {relance.echeance && (
                <div className="date-item">
                  <span className="date-label">Échéance :</span>
                  <span className="date-value">
                    {new Date(relance.echeance).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              <div className="date-item">
                <span className="date-label">Créée le :</span>
                <span className="date-value">
                  {new Date(relance.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {relance.message && (
          <div className="info-section">
            <h3>Message</h3>
            <div className="message-content">
              {relance.message}
            </div>
          </div>
        )}

        {/* Références */}
        {(relance.facture_id || relance.contrat_id) && (
          <div className="info-section">
            <h3>Références</h3>
            <div className="references-grid">
              {relance.facture_id && (
                <div className="reference-item">
                  <div className="reference-icon">🧾</div>
                  <div className="reference-content">
                    <div className="reference-label">Facture</div>
                    <div className="reference-value">#{relance.facture_id}</div>
                  </div>
                </div>
              )}
              
              {relance.contrat_id && (
                <div className="reference-item">
                  <div className="reference-icon">📑</div>
                  <div className="reference-content">
                    <div className="reference-label">Contrat</div>
                    <div className="reference-value">#{relance.contrat_id}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gestion du statut */}
        <div className="info-section">
          <h3>Gestion du Statut</h3>
          <div className="statut-actions">
            {relance.statut === 'en_attente' && (
              <>
                <button 
                  className="btn btn-success"
                  onClick={() => handleUpdateStatut('envoyee')}
                >
                  📤 Marquer comme Envoyée
                </button>
                <button 
                  className="btn btn-warning"
                  onClick={() => handleUpdateStatut('annulee')}
                >
                  ❌ Annuler
                </button>
              </>
            )}
            
            {relance.statut === 'envoyee' && (
              <>
                <button 
                  className="btn btn-success"
                  onClick={() => handleUpdateStatut('traitee')}
                >
                  ✅ Marquer comme Traitée
                </button>
                <button 
                  className="btn btn-warning"
                  onClick={() => handleUpdateStatut('en_attente')}
                >
                  ↩️ Remettre en Attente
                </button>
              </>
            )}
            
            {relance.statut === 'traitee' && (
              <button 
                className="btn btn-warning"
                onClick={() => handleUpdateStatut('envoyee')}
              >
                ↩️ Remettre comme Envoyée
              </button>
            )}
            
            {relance.statut === 'annulee' && (
              <div className="annulee-message">
                Cette relance a été annulée et ne peut plus être modifiée.
              </div>
            )}
          </div>
        </div>

        {/* Historique des actions */}
        <div className="info-section">
          <h3>Historique</h3>
          <div className="history-timeline">
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div className="timeline-title">Relance créée</div>
                <div className="timeline-date">
                  {new Date(relance.created_at).toLocaleString()}
                </div>
              </div>
            </div>
            
            {relance.updated_at !== relance.created_at && (
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-title">Dernière modification</div>
                  <div className="timeline-date">
                    {new Date(relance.updated_at).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelanceDetailPage;