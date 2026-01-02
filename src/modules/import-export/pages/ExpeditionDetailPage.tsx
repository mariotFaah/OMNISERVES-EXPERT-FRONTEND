import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { importExportApi } from '../services/api';
import type { Commande } from '../types';
import './ExpeditionDetailPage.css';

const ExpeditionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [commande, setCommande] = useState<Commande | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommande();
  }, [id]);

  const loadCommande = async () => {
    try {
      const data = await importExportApi.getCommande(parseInt(id!));
      setCommande(data);
    } catch (error) {
      console.error('Erreur chargement commande:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut: string) => {
    const colors = {
      preparation: 'warning',
      'expédiée': 'info',
      transit: 'primary',
      arrivée: 'success',
      livrée: 'completed'
    };
    return colors[statut as keyof typeof colors] || 'default';
  };

  const getStatutText = (statut: string) => {
    const texts = {
      preparation: 'En préparation',
      'expédiée': 'Expédiée',
      transit: 'En transit',
      arrivée: 'Arrivée',
      livrée: 'Livrée'
    };
    return texts[statut as keyof typeof texts] || statut;
  };

  if (loading) {
    return (
      <div className="expedition-detail-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!commande || !commande.expedition) {
    return (
      <div className="expedition-detail-container">
        <div className="empty-state">
          <h2>Expédition non trouvée</h2>
          <p>Cette expédition n'existe pas ou n'a pas encore été créée.</p>
          <Link to="/import-export/expeditions" className="btn-primary">
            Retour aux expéditions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="expedition-detail-container">
      <div className="expedition-detail-content">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <h1>Détails de l'Expédition</h1>
            <div className="header-subtitle">
              <span className="commande-ref">{commande.numero_commande}</span>
              <span className="separator">•</span>
              <span className={`statut-badge statut-${getStatutColor(commande.expedition.statut)}`}>
                {getStatutText(commande.expedition.statut)}
              </span>
            </div>
          </div>
          <div className="header-actions">
            <Link 
              to={`/import-export/commandes/${commande.id}/expedition`}
              className="btn-primary"
            >
              ✏️ Modifier l'expédition
            </Link>
            <Link to="/import-export/expeditions" className="btn-secondary">
              ← Retour
            </Link>
          </div>
        </div>

        <div className="content-grid">
          {/* Informations principales */}
          <div className="info-card">
            <h3>Informations de l'Expédition</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Transporteur</label>
                <div className="info-value">
                  {commande.expedition.transporteur || 'Non spécifié'}
                </div>
              </div>
              <div className="info-item">
                <label>Mode de transport</label>
                <div className="info-value">
                  {commande.expedition.mode_transport || 'Non spécifié'}
                </div>
              </div>
              <div className="info-item">
                <label>Date d'expédition</label>
                <div className="info-value">
                  {commande.expedition.date_expedition 
                    ? new Date(commande.expedition.date_expedition).toLocaleDateString('fr-FR')
                    : 'Non planifiée'
                  }
                </div>
              </div>
              <div className="info-item">
                <label>Date d'arrivée prévue</label>
                <div className="info-value">
                  {commande.expedition.date_arrivee_prevue 
                    ? new Date(commande.expedition.date_arrivee_prevue).toLocaleDateString('fr-FR')
                    : 'Non spécifiée'
                  }
                </div>
              </div>
              <div className="info-item">
                <label>Date d'arrivée réelle</label>
                <div className="info-value">
                  {commande.expedition.date_arrivee_reelle 
                    ? new Date(commande.expedition.date_arrivee_reelle).toLocaleDateString('fr-FR')
                    : 'En attente'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="info-card">
            <h3>Documents d'Expédition</h3>
            <div className="documents-list">
              {commande.expedition.numero_bl ? (
                <div className="document-item">
                  <div className="doc-icon">📄</div>
                  <div className="doc-info">
                    <div className="doc-name">Bon de Livraison</div>
                    <div className="doc-number">{commande.expedition.numero_bl}</div>
                  </div>
                  <button className="btn-download" title="Télécharger">
                    ⬇️
                  </button>
                </div>
              ) : (
                <div className="document-missing">
                  <div className="doc-icon">❌</div>
                  <div className="doc-info">
                    <div className="doc-name">Bon de Livraison</div>
                    <div className="doc-status">Non généré</div>
                  </div>
                </div>
              )}

              {commande.expedition.numero_connaissement ? (
                <div className="document-item">
                  <div className="doc-icon">🧾</div>
                  <div className="doc-info">
                    <div className="doc-name">Connaissement</div>
                    <div className="doc-number">{commande.expedition.numero_connaissement}</div>
                  </div>
                  <button className="btn-download" title="Télécharger">
                    ⬇️
                  </button>
                </div>
              ) : (
                <div className="document-missing">
                  <div className="doc-icon">❌</div>
                  <div className="doc-info">
                    <div className="doc-name">Connaissement</div>
                    <div className="doc-status">Non généré</div>
                  </div>
                </div>
              )}

              {commande.expedition.numero_packing_list ? (
                <div className="document-item">
                  <div className="doc-icon">📦</div>
                  <div className="doc-info">
                    <div className="doc-name">Packing List</div>
                    <div className="doc-number">{commande.expedition.numero_packing_list}</div>
                  </div>
                  <button className="btn-download" title="Télécharger">
                    ⬇️
                  </button>
                </div>
              ) : (
                <div className="document-missing">
                  <div className="doc-icon">❌</div>
                  <div className="doc-info">
                    <div className="doc-name">Packing List</div>
                    <div className="doc-status">Non généré</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Informations commande */}
          <div className="info-card">
            <h3>Informations de la Commande</h3>
            <div className="commande-info">
              <div className="commande-item">
                <label>Numéro de commande</label>
                <div className="info-value">
                  <Link to={`/import-export/commandes/${commande.id}`}>
                    {commande.numero_commande}
                  </Link>
                </div>
              </div>
              <div className="commande-item">
                <label>Type</label>
                <div className="info-value">
                  {commande.type === 'import' ? '📥 Import' : '📤 Export'}
                </div>
              </div>
              <div className="commande-item">
                <label>Client</label>
                <div className="info-value">
                  <strong>{commande.client?.nom}</strong>
                  <div className="sub-info">{commande.client?.email}</div>
                </div>
              </div>
              <div className="commande-item">
                <label>Fournisseur</label>
                <div className="info-value">
                  <strong>{commande.fournisseur?.nom}</strong>
                  <div className="sub-info">{commande.fournisseur?.email}</div>
                </div>
              </div>
              <div className="commande-item">
                <label>Montant total</label>
                <div className="info-value amount">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: commande.devise
                  }).format(parseFloat(commande.montant_total.toString()))}
                </div>
              </div>
            </div>
          </div>

          {/* Instructions spéciales */}
          {commande.expedition.instructions_speciales && (
            <div className="info-card">
              <h3>Instructions Spéciales</h3>
              <div className="instructions-content">
                {commande.expedition.instructions_speciales}
              </div>
            </div>
          )}

          {/* Timeline de l'expédition */}
          <div className="info-card">
            <h3>Progression de l'Expédition</h3>
            <div className="timeline">
              <div className={`timeline-item ${['preparation', 'expédiée', 'transit', 'arrivée', 'livrée'].includes(commande.expedition.statut) ? 'completed' : ''}`}>
                <div className="timeline-marker">1</div>
                <div className="timeline-content">
                  <div className="timeline-title">En préparation</div>
                  <div className="timeline-desc">Préparation des marchandises</div>
                </div>
              </div>

              <div className={`timeline-item ${['expédiée', 'transit', 'arrivée', 'livrée'].includes(commande.expedition.statut) ? 'completed' : ''}`}>
                <div className="timeline-marker">2</div>
                <div className="timeline-content">
                  <div className="timeline-title">Expédiée</div>
                  <div className="timeline-desc">Départ de l'entrepôt</div>
                </div>
              </div>

              <div className={`timeline-item ${['transit', 'arrivée', 'livrée'].includes(commande.expedition.statut) ? 'completed' : ''}`}>
                <div className="timeline-marker">3</div>
                <div className="timeline-content">
                  <div className="timeline-title">En transit</div>
                  <div className="timeline-desc">Transport en cours</div>
                </div>
              </div>

              <div className={`timeline-item ${['arrivée', 'livrée'].includes(commande.expedition.statut) ? 'completed' : ''}`}>
                <div className="timeline-marker">4</div>
                <div className="timeline-content">
                  <div className="timeline-title">Arrivée</div>
                  <div className="timeline-desc">Marchandises arrivées</div>
                </div>
              </div>

              <div className={`timeline-item ${commande.expedition.statut === 'livrée' ? 'completed' : ''}`}>
                <div className="timeline-marker">5</div>
                <div className="timeline-content">
                  <div className="timeline-title">Livrée</div>
                  <div className="timeline-desc">Livraison finalisée</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpeditionDetailPage;
