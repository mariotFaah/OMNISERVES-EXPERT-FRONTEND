// src/modules/crm/pages/DevisListPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { crmApi } from '../services/api';
import type { Devis, DevisStats } from '../types';
import './DevisListPage.css';

const DevisListPage: React.FC = () => {
  const [devis, setDevis] = useState<Devis[]>([]);
  const [stats, setStats] = useState<DevisStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statutFilter, setStatutFilter] = useState<string>('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadDevis();
    loadStats();
  }, [statutFilter]);

  const loadDevis = async () => {
    try {
      setLoading(true);
      let data: Devis[];
      
      if (statutFilter === 'tous') {
        data = await crmApi.getDevis();
      } else {
        // Implémentation temporaire - filtrer côté client
        const allDevis = await crmApi.getDevis();
        data = allDevis.filter(devis => devis.statut === statutFilter);
      }
      
      setDevis(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await crmApi.getDevisStats();
      setStats(data);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
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
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getJoursRestants = (dateValidite?: string) => {
    if (!dateValidite) return null;
    
    const aujourdhui = new Date();
    const validite = new Date(dateValidite);
    const diffTime = validite.getTime() - aujourdhui.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const filteredDevis = devis.filter(devis => {
    const matchesSearch = 
      devis.numero_devis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      devis.client_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      devis.objet?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (loading && devis.length === 0) {
    return (
      <div className="ms-page-container">
        <div className="ms-loading">Chargement des devis...</div>
      </div>
    );
  }

  return (
    <div className="ms-page-container">
      {/* Header de page */}
      <div className="ms-page-header">
        <div className="ms-header-left">
          <h1 className="ms-page-title">Devis</h1>
          <div className="ms-page-subtitle">
            {filteredDevis.length} devis{filteredDevis.length !== 1 ? 's' : ''} trouvé{filteredDevis.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="ms-header-actions">
          <Link to="/crm/devis/nouveau" className="ms-btn ms-btn-primary">
            Nouveau devis
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="ms-stats-grid">
        <div className="ms-stat-card">
          <div className="ms-stat-icon">📊</div>
          <div className="ms-stat-content">
            <div className="ms-stat-value">{devis.length}</div>
            <div className="ms-stat-label">Total devis</div>
          </div>
        </div>

        <div className="ms-stat-card">
          <div className="ms-stat-icon">✅</div>
          <div className="ms-stat-content">
            <div className="ms-stat-value ms-stat-success">
              {stats?.par_statut?.find(s => s.statut === 'accepte')?.count || 0}
            </div>
            <div className="ms-stat-label">Acceptés</div>
          </div>
        </div>

        <div className="ms-stat-card">
          <div className="ms-stat-icon">📤</div>
          <div className="ms-stat-content">
            <div className="ms-stat-value ms-stat-warning">
              {stats?.par_statut?.find(s => s.statut === 'envoye')?.count || 0}
            </div>
            <div className="ms-stat-label">Envoyés</div>
          </div>
        </div>

        <div className="ms-stat-card">
          <div className="ms-stat-icon">💰</div>
          <div className="ms-stat-content">
            <div className="ms-stat-value ms-stat-primary">
              {stats?.total_chiffre_affaires ? 
                formatMontant(stats.total_chiffre_affaires)
                : formatMontant(0)
              }
            </div>
            <div className="ms-stat-label">Chiffre d'affaires</div>
          </div>
        </div>
      </div>

      {/* Barre d'outils */}
      <div className="ms-toolbar">
        <div className="ms-search-box">
          <input
            type="text"
            placeholder="Rechercher un devis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ms-search-input"
          />
          <span className="ms-search-icon">🔍</span>
        </div>

        <div className="ms-filter-group">
          <select
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value)}
            className="ms-filter-select"
          >
            <option value="tous">Tous les statuts</option>
            <option value="brouillon">Brouillons</option>
            <option value="envoye">Envoyés</option>
            <option value="accepte">Acceptés</option>
            <option value="refuse">Refusés</option>
            <option value="expire">Expirés</option>
          </select>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="ms-error-message">
          <span className="ms-error-icon">⚠</span>
          {error}
        </div>
      )}

      {/* Liste des devis */}
      <div className="ms-list-container">
        {filteredDevis.length > 0 ? (
          <div className="ms-list">
            {filteredDevis.map((devis) => {
              const statut = getStatutBadge(devis.statut);
              const joursRestants = getJoursRestants(devis.date_validite);
              
              return (
                <div key={devis.id_devis} className="ms-list-item">
                  <div className="ms-list-item-content">
                    <div className="ms-list-item-header">
                      <div className="ms-list-item-title-section">
                        <h3 className="ms-list-item-title">
                          {devis.numero_devis}
                        </h3>
                        <div className="ms-list-item-subtitle">
                          {devis.client_nom || 'Client inconnu'}
                        </div>
                        {devis.objet && (
                          <div className="ms-list-item-description">
                            {devis.objet}
                          </div>
                        )}
                      </div>
                      <div className="ms-list-item-actions">
                        <span className="ms-list-item-montant">
                          {formatMontant(devis.montant_ht)}
                        </span>
                        <button
                          onClick={() => navigate(`/crm/devis/${devis.id_devis}`)}
                          className="ms-btn ms-btn-secondary ms-btn-sm"
                        >
                          Voir
                        </button>
                      </div>
                    </div>

                    <div className="ms-list-item-details">
                      <div className="ms-detail-row">
                        <div className="ms-detail-group">
                          <span className="ms-detail-label">Date</span>
                          <span className="ms-detail-value">
                            {formatDate(devis.date_devis)}
                          </span>
                        </div>
                        {devis.date_validite && (
                          <div className="ms-detail-group">
                            <span className="ms-detail-label">Validité</span>
                            <span className="ms-detail-value">
                              {formatDate(devis.date_validite)}
                              {joursRestants !== null && joursRestants > 0 && (
                                <span className="ms-jours-restants">
                                  ({joursRestants} jour{joursRestants !== 1 ? 's' : ''})
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                        <div className="ms-detail-group">
                          <span className="ms-detail-label">Statut</span>
                          <span className={`ms-badge ${statut.class}`}>
                            {statut.label}
                          </span>
                        </div>
                      </div>

                      <div className="ms-detail-row">
                        <div className="ms-detail-group">
                          <span className="ms-detail-label">Montant TTC</span>
                          <span className="ms-detail-value">
                            {formatMontant(devis.montant_ttc)}
                          </span>
                        </div>
                        <div className="ms-detail-group">
                          <span className="ms-detail-label">Dernière modification</span>
                          <span className="ms-detail-value">
                            {formatDate(devis.updated_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="ms-empty-state">
            <div className="ms-empty-icon">📄</div>
            <h3 className="ms-empty-title">Aucun devis trouvé</h3>
            <p className="ms-empty-description">
              {searchTerm || statutFilter !== 'tous' 
                ? 'Aucun devis ne correspond à vos critères de recherche.' 
                : 'Commencez par créer votre premier devis.'
              }
            </p>
            {!searchTerm && statutFilter === 'tous' && (
              <Link to="/crm/devis/nouveau" className="ms-btn ms-btn-primary">
                Créer un devis
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DevisListPage;