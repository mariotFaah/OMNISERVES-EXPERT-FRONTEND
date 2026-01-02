// src/modules/crm/pages/ContratsListPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { crmApi } from '../services/api';
import type { Contrat, Client } from '../types';
import './ContratsListPage.css';

const ContratsListPage: React.FC = () => {
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<string>('');
  const [filtreClient, setFiltreClient] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      setError('');

      // Charger tous les clients pour le filtre
      const clientsData = await crmApi.getClients();
      setClients(clientsData);

      // Charger les contrats
      await chargerContrats();

    } catch (error) {
      console.error('Erreur chargement données:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const chargerContrats = async () => {
    try {
      const contratsData = await crmApi.getContrats();
      setContrats(contratsData);
    } catch (error) {
      console.error('Erreur chargement contrats:', error);
      throw error;
    }
  };

  const filtrerContrats = contrats.filter(contrat => {
    const matchesSearch = 
      contrat.numero_contrat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrat.client_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrat.type_contrat.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatut = filtreStatut ? contrat.statut === filtreStatut : true;
    const matchesClient = filtreClient ? contrat.tiers_id === filtreClient : true;

    return matchesSearch && matchesStatut && matchesClient;
  });

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'actif':
        return { label: 'Actif', class: 'ms-badge-success' };
      case 'inactif':
        return { label: 'Inactif', class: 'ms-badge-warning' };
      case 'resilie':
        return { label: 'Résilié', class: 'ms-badge-error' };
      case 'termine':
        return { label: 'Terminé', class: 'ms-badge-neutral' };
      default:
        return { label: statut, class: 'ms-badge-neutral' };
    }
  };

  const getPeriodiciteLabel = (periodicite: string) => {
    const labels: { [key: string]: string } = {
      'ponctuel': 'Ponctuel',
      'mensuel': 'Mensuel',
      'trimestriel': 'Trimestriel',
      'semestriel': 'Semestriel',
      'annuel': 'Annuel'
    };
    return labels[periodicite] || periodicite;
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

  const getJoursRestants = (dateFin?: string) => {
    if (!dateFin) return null;
    
    const aujourdhui = new Date();
    const fin = new Date(dateFin);
    const diffTime = fin.getTime() - aujourdhui.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  if (loading && contrats.length === 0) {
    return (
      <div className="ms-page-container">
        <div className="ms-loading">Chargement des contrats...</div>
      </div>
    );
  }

  return (
    <div className="ms-page-container">
      {/* Header de page */}
      <div className="ms-page-header">
        <div className="ms-header-left">
          <h1 className="ms-page-title">Contrats</h1>
          <div className="ms-page-subtitle">
            {filtrerContrats.length} contrat{filtrerContrats.length !== 1 ? 's' : ''} trouvé{filtrerContrats.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="ms-header-actions">
          <Link to="/crm/contrats/nouveau" className="ms-btn ms-btn-primary">
            Nouveau contrat
          </Link>
        </div>
      </div>

      {/* Barre d'outils */}
      <div className="ms-toolbar">
        <div className="ms-search-box">
          <input
            type="text"
            placeholder="Rechercher un contrat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ms-search-input"
          />
          <span className="ms-search-icon">🔍</span>
        </div>

        <div className="ms-filter-group">
          <select
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
            className="ms-filter-select"
          >
            <option value="">Tous les statuts</option>
            <option value="actif">Actifs</option>
            <option value="inactif">Inactifs</option>
            <option value="resilie">Résiliés</option>
            <option value="termine">Terminés</option>
          </select>

          <select
            value={filtreClient}
            onChange={(e) => setFiltreClient(parseInt(e.target.value))}
            className="ms-filter-select"
          >
            <option value={0}>Tous les clients</option>
            {clients.map(client => (
              <option key={client.id_tiers} value={client.id_tiers}>
                {client.raison_sociale || client.nom}
              </option>
            ))}
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

      {/* Liste des contrats */}
      <div className="ms-list-container">
        {filtrerContrats.length > 0 ? (
          <div className="ms-list">
            {filtrerContrats.map(contrat => {
              const statut = getStatutBadge(contrat.statut);
              const joursRestants = getJoursRestants(contrat.date_fin);
              
              return (
                <div key={contrat.id_contrat} className="ms-list-item">
                  <div className="ms-list-item-content">
                    <div className="ms-list-item-header">
                      <div className="ms-list-item-title-section">
                        <h3 className="ms-list-item-title">
                          {contrat.numero_contrat}
                        </h3>
                        <div className="ms-list-item-subtitle">
                          {contrat.client_nom || 'Client inconnu'}
                        </div>
                      </div>
                      <div className="ms-list-item-actions">
                        <span className="ms-list-item-montant">
                          {formatMontant(contrat.montant_ht)}
                        </span>
                        <button
                          onClick={() => navigate(`/crm/contrats/${contrat.id_contrat}`)}
                          className="ms-btn ms-btn-secondary ms-btn-sm"
                        >
                          Voir
                        </button>
                      </div>
                    </div>

                    <div className="ms-list-item-details">
                      <div className="ms-detail-row">
                        <div className="ms-detail-group">
                          <span className="ms-detail-label">Type</span>
                          <span className="ms-detail-value">{contrat.type_contrat}</span>
                        </div>
                        <div className="ms-detail-group">
                          <span className="ms-detail-label">Périodicité</span>
                          <span className="ms-detail-value">
                            {getPeriodiciteLabel(contrat.periodicite)}
                          </span>
                        </div>
                        <div className="ms-detail-group">
                          <span className="ms-detail-label">Date début</span>
                          <span className="ms-detail-value">
                            {formatDate(contrat.date_debut)}
                          </span>
                        </div>
                        {contrat.date_fin && (
                          <div className="ms-detail-group">
                            <span className="ms-detail-label">Date fin</span>
                            <span className="ms-detail-value">
                              {formatDate(contrat.date_fin)}
                              {joursRestants !== null && joursRestants > 0 && (
                                <span className="ms-jours-restants">
                                  ({joursRestants} jour{joursRestants !== 1 ? 's' : ''})
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="ms-detail-row">
                        <div className="ms-detail-group">
                          <span className="ms-detail-label">Statut</span>
                          <span className={`ms-badge ${statut.class}`}>
                            {statut.label}
                          </span>
                        </div>
                        <div className="ms-detail-group">
                          <span className="ms-detail-label">Dernière modification</span>
                          <span className="ms-detail-value">
                            {formatDate(contrat.updated_at)}
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
            <h3 className="ms-empty-title">Aucun contrat trouvé</h3>
            <p className="ms-empty-description">
              {searchTerm || filtreStatut || filtreClient !== 0 
                ? 'Aucun contrat ne correspond à vos critères de recherche.' 
                : 'Commencez par créer votre premier contrat.'
              }
            </p>
            {!searchTerm && !filtreStatut && filtreClient === 0 && (
              <Link to="/crm/contrats/nouveau" className="ms-btn ms-btn-primary">
                Créer un contrat
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContratsListPage;