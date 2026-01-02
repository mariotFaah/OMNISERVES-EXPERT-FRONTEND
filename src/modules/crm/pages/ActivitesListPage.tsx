// src/modules/crm/pages/ActivitesListPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { crmApi } from '../services/api';
import type { Activite, ActiviteConsolidee } from '../types';
import './ActivitesListPage.css';

const ActivitesListPage: React.FC = () => {
  const [activites, setActivites] = useState<Activite[]>([]);
  const [activitesConsolidees, setActivitesConsolidees] = useState<ActiviteConsolidee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtreType, setFiltreType] = useState<string>('tous');
  const [filtreStatut, setFiltreStatut] = useState<string>('tous');
  const [filtrePriorite, setFiltrePriorite] = useState<string>('tous');
  const [vue360, setVue360] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      setError('');

      if (vue360) {
        // Charger les activités consolidées pour la vue 360°
        const clients = await crmApi.getClients();
        const toutesActivites: ActiviteConsolidee[] = [];
        
        for (const client of clients.slice(0, 10)) { // Limiter pour les performances
          try {
            const activitesClient = await crmApi.getClientActivitesConsolidees(client.id_tiers);
            toutesActivites.push(...activitesClient.map(act => ({
              ...act,
              client_nom: client.raison_sociale || client.nom,
              client_id: client.id_tiers
            })));
          } catch (error) {
            console.error(`Erreur chargement activités client ${client.id_tiers}:`, error);
          }
        }
        
        setActivitesConsolidees(toutesActivites);
      } else {
        // Charger les activités CRM classiques
        const activitesData = await crmApi.getActivites();
        setActivites(activitesData);
      }

    } catch (error) {
      console.error('Erreur chargement données:', error);
      setError('Erreur lors du chargement des activités');
    } finally {
      setLoading(false);
    }
  };

  const getPrioriteBadge = (priorite?: string) => {
    if (!priorite) {
      return { label: 'Inconnue', class: 'ms-badge-neutral' };
    }
    switch (priorite) {
      case 'haut':
      case 'urgent':
      case 'haute':
        return { label: 'Haute', class: 'ms-badge-error' };
      case 'normal':
        return { label: 'Normale', class: 'ms-badge-warning' };
      case 'bas':
      case 'basse':
        return { label: 'Basse', class: 'ms-badge-success' };
      default:
        return { label: priorite, class: 'ms-badge-neutral' };
    }
  };

  const getStatutBadge = (statut?: string) => {
    if (!statut) {
      return { label: 'Inconnu', class: 'ms-badge-neutral' };
    }
    switch (statut) {
      case 'realise':
        return { label: 'Réalisé', class: 'ms-badge-success' };
      case 'planifie':
        return { label: 'Planifié', class: 'ms-badge-warning' };
      case 'annule':
        return { label: 'Annulé', class: 'ms-badge-error' };
      default:
        return { label: statut, class: 'ms-badge-neutral' };
    }
  };

  const getTypeIcon = (type?: string) => {
    if (!type) return '📝';
    switch (type) {
      case 'appel': return '📞';
      case 'email': return '✉️';
      case 'reunion': return '👥';
      case 'visite': return '🏢';
      case 'facture': return '🧾';
      case 'commande': return '📦';
      case 'paiement': return '💰';
      default: return '📝';
    }
  };

  const getTypeLabel = (type?: string) => {
    const labels: { [key: string]: string } = {
      'appel': 'Appel téléphonique',
      'email': 'Email',
      'reunion': 'Réunion',
      'visite': 'Visite',
      'facture': 'Facture',
      'commande': 'Commande',
      'paiement': 'Paiement'
    };
    if (!type) return 'Inconnu';
    return labels[type] || type;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrer les données selon les critères
  const dataSource = vue360 ? activitesConsolidees : activites;
  
  const filteredData = dataSource.filter(item => {
    const matchesSearch = 
      item.sujet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ('client_nom' in item ? (item as any).client_nom?.toLowerCase().includes(searchTerm.toLowerCase()) : false);

    const matchesType = filtreType === 'tous' || item.type_activite === filtreType;
    const matchesStatut = filtreStatut === 'tous' || item.statut === filtreStatut;
    const matchesPriorite = filtrePriorite === 'tous' || item.priorite === filtrePriorite;

    return matchesSearch && matchesType && matchesStatut && matchesPriorite;
  });

  if (loading && dataSource.length === 0) {
    return (
      <div className="ms-page-container">
        <div className="ms-loading">Chargement des activités...</div>
      </div>
    );
  }

  return (
    <div className="ms-page-container">
      {/* Header de page */}
      <div className="ms-page-header">
        <div className="ms-header-left">
          <h1 className="ms-page-title">
            Activités {vue360 ? '- Vue 360°' : 'CRM'}
          </h1>
          <div className="ms-page-subtitle">
            {filteredData.length} activité{filteredData.length !== 1 ? 's' : ''} trouvée{filteredData.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="ms-header-actions">
          <button 
            type="button"
            onClick={() => setVue360(!vue360)}
            className={`ms-btn ${vue360 ? 'ms-btn-primary' : 'ms-btn-secondary'}`}
          >
            {vue360 ? 'Vue CRM' : 'Vue 360°'}
          </button>
          <Link to="/crm/activites/nouvelle" className="ms-btn ms-btn-primary">
            Nouvelle activité
          </Link>
        </div>
      </div>

      {/* Barre d'outils */}
      <div className="ms-toolbar">
        <div className="ms-search-box">
          <input
            type="text"
            placeholder="Rechercher une activité..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ms-search-input"
          />
          <span className="ms-search-icon">🔍</span>
        </div>

        <div className="ms-filter-group">
          <select
            value={filtreType}
            onChange={(e) => setFiltreType(e.target.value)}
            className="ms-filter-select"
          >
            <option value="tous">Tous les types</option>
            <option value="appel">Appels</option>
            <option value="email">Emails</option>
            <option value="reunion">Réunions</option>
            <option value="visite">Visites</option>
            {vue360 && (
              <>
                <option value="facture">Factures</option>
                <option value="commande">Commandes</option>
                <option value="paiement">Paiements</option>
              </>
            )}
          </select>

          <select
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
            className="ms-filter-select"
          >
            <option value="tous">Tous les statuts</option>
            <option value="planifie">Planifiées</option>
            <option value="realise">Réalisées</option>
            <option value="annule">Annulées</option>
          </select>

          <select
            value={filtrePriorite}
            onChange={(e) => setFiltrePriorite(e.target.value)}
            className="ms-filter-select"
          >
            <option value="tous">Toutes priorités</option>
            <option value="haute">Haute</option>
            <option value="haut">Haute</option>
            <option value="normal">Normale</option>
            <option value="bas">Basse</option>
            <option value="basse">Basse</option>
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

      {/* Liste des activités */}
      <div className="ms-list-container">
        {filteredData.length > 0 ? (
          <div className="ms-list">
            {filteredData.map((activite) => {
              const priorite = getPrioriteBadge(activite.priorite);
              const statut = getStatutBadge(activite.statut);
              const clientNom = (activite as any).client_nom || 'Client inconnu';
              const moduleOrigine = (activite as ActiviteConsolidee).module_origine;

              return (
                <div key={activite.id_activite || `consolidee-${activite.id_activite}`} className="ms-list-item">
                  <div className="ms-list-item-content">
                    <div className="ms-list-item-header">
                      <div className="ms-list-item-icon">
                        {getTypeIcon(activite.type_activite)}
                      </div>
                      <div className="ms-list-item-title-section">
                        <h3 className="ms-list-item-title">
                          {activite.sujet}
                        </h3>
                        <div className="ms-list-item-subtitle">
                          {clientNom}
                          {moduleOrigine && (
                            <span className="ms-module-tag">
                              {moduleOrigine}
                            </span>
                          )}
                        </div>
                        {activite.description && (
                          <div className="ms-list-item-description">
                            {activite.description}
                          </div>
                        )}
                      </div>
                      <div className="ms-list-item-actions">
                        <div className="ms-badge-group">
                          <span className={`ms-badge ${priorite.class}`}>
                            {priorite.label}
                          </span>
                          <span className={`ms-badge ${statut.class}`}>
                            {statut.label}
                          </span>
                        </div>
                        <button
                          onClick={() => navigate(`/crm/activites/${activite.id_activite}`)}
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
                          <span className="ms-detail-value">
                            {getTypeLabel(activite.type_activite)}
                          </span>
                        </div>
                        <div className="ms-detail-group">
                          <span className="ms-detail-label">Date</span>
                          <span className="ms-detail-value">
                            {formatDate(activite.date_activite)}
                          </span>
                        </div>
                        {(activite as Activite).date_rappel && (
                          <div className="ms-detail-group">
                            <span className="ms-detail-label">Rappel</span>
                            <span className="ms-detail-value">
                              {formatDate((activite as Activite).date_rappel!)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="ms-empty-state">
            <div className="ms-empty-icon">📅</div>
            <h3 className="ms-empty-title">Aucune activité trouvée</h3>
            <p className="ms-empty-description">
              {searchTerm || filtreType !== 'tous' || filtreStatut !== 'tous' || filtrePriorite !== 'tous'
                ? 'Aucune activité ne correspond à vos critères de recherche.' 
                : 'Commencez par créer votre première activité.'
              }
            </p>
            {!searchTerm && filtreType === 'tous' && filtreStatut === 'tous' && filtrePriorite === 'tous' && (
              <Link to="/crm/activites/nouvelle" className="ms-btn ms-btn-primary">
                Créer une activité
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitesListPage;