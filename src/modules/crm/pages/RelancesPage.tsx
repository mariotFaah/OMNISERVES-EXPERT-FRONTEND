// src/modules/crm/pages/RelancesPage.tsx
import React, { useState, useEffect } from 'react';
import crmApi from '../services/api';
import type { Relance } from '../types';
import './RelancesPage.css';

const RelancesPage: React.FC = () => {
  const [relances, setRelances] = useState<Relance[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadRelances();
    loadStats();
  }, []);

  const loadRelances = async () => {
    try {
      const data = await crmApi.getRelances();
      setRelances(data);
    } catch (error) {
      console.error('Erreur chargement relances:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await crmApi.getRelancesStats();
      setStats(data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const genererRelancesAuto = async () => {
    setGenerating(true);
    try {
      await crmApi.genererRelancesAutomatiques();
      await loadRelances(); // Recharger la liste
      await loadStats(); // Recharger les stats
    } catch (error) {
      console.error('Erreur génération relances:', error);
    } finally {
      setGenerating(false);
    }
  };

  const getCanalIcon = (canal: string) => {
    switch (canal) {
      case 'email': return '✉️';
      case 'telephone': return '📞';
      case 'courrier': return '📮';
      case 'sms': return '💬';
      default: return '📢';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'paiement': return '💰';
      case 'contrat': return '📑';
      case 'echeance': return '📅';
      case 'rapport': return '📊';
      default: return '🔔';
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        Chargement des relances...
      </div>
    );
  }

  return (
    <div className="relances-page">
      {/* En-tête */}
      <div className="relances-header">
        <div>
          <h1 className="relances-title">Relances et Rappels</h1>
          <p className="relances-subtitle">Gestion proactive des échéances</p>
        </div>
        <button 
          onClick={genererRelancesAuto}
          disabled={generating}
          className="btn-generer-relances"
        >
          {generating ? (
            <>
              <div className="loading-spinner"></div>
              Génération...
            </>
          ) : (
            '🔔 Générer Relances Auto'
          )}
        </button>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value total">{stats.total || 0}</div>
            <div className="stat-label">Total Relances</div>
          </div>
          <div className="stat-card">
            <div className="stat-value en-attente">{stats.par_statut?.en_attente || 0}</div>
            <div className="stat-label">En Attente</div>
          </div>
          <div className="stat-card">
            <div className="stat-value paiement">{stats.par_type?.paiement || 0}</div>
            <div className="stat-label">Relances Paiement</div>
          </div>
          <div className="stat-card">
            <div className="stat-value contrat">{stats.par_type?.contrat || 0}</div>
            <div className="stat-label">Relances Contrat</div>
          </div>
        </div>
      )}

      {/* Liste des relances */}
      <div className="relances-container">
        <div className="relances-container-header">
          <h2 className="relances-container-title">Relances en cours</h2>
        </div>
        
        <div className="relances-list">
          {relances.map((relance) => (
            <div key={relance.id_relance} className="relance-item">
              <div className="relance-content">
                <div className="relance-info">
                  <h3 className="relance-objet">
                    {getTypeIcon(relance.type_relance)} {relance.objet}
                  </h3>
                  <p className="relance-message">{relance.message}</p>
                  <div className="relance-meta">
                    <span className="relance-meta-item">
                      <strong>Type:</strong> {relance.type_relance}
                    </span>
                    <span className="relance-meta-item">
                      {getCanalIcon(relance.canal)} <strong>Canal:</strong> {relance.canal}
                    </span>
                    <span className="relance-meta-item">
                      <strong>Date:</strong> {new Date(relance.date_relance).toLocaleDateString('fr-FR')}
                    </span>
                    {relance.echeance && (
                      <span className="relance-meta-item">
                        <strong>Échéance:</strong> {new Date(relance.echeance).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="relance-status">
                  <span className={`status-badge status-${relance.statut}`}>
                    {relance.statut}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {relances.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">🔔</div>
              <p className="empty-state-text">Aucune relance en cours</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RelancesPage;