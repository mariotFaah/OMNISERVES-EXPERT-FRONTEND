// src/modules/crm/pages/CRMPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CRMPage.css';
import { crmApi } from '../services/api';
import type { Client, Devis, Relance, DevisStats, RelanceStats, ActiviteConsolidee } from '../types';

const CRMPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [devis, setDevis] = useState<Devis[]>([]);
  const [relances, setRelances] = useState<Relance[]>([]);
  const [devisStats, setDevisStats] = useState<DevisStats>({ 
    par_statut: [], 
    total_chiffre_affaires: 0 
  });
  const [relanceStats, setRelanceStats] = useState<RelanceStats>({
    total: 0,
    par_statut: { en_attente: 0, envoyee: 0, traitee: 0, annulee: 0 },
    par_type: { paiement: 0, contrat: 0, echeance: 0, commerciale: 0 },
    par_canal: { email: 0, telephone: 0, courrier: 0, sms: 0 }
  });
  const [recentActivities, setRecentActivities] = useState<ActiviteConsolidee[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [clientsData, devisData, relancesData, devisStatsData, relanceStatsData] = await Promise.all([
        crmApi.getClients(),
        crmApi.getDevis(),
        crmApi.getRelances(),
        crmApi.getDevisStats(),
        crmApi.getRelancesStats()
      ]);

      setClients(clientsData);
      setDevis(devisData);
      setRelances(relancesData);
      setDevisStats(devisStatsData);
      setRelanceStats(relanceStatsData);

      // Charger les activités récentes pour le premier client
      if (clientsData.length > 0) {
        try {
          const activitiesData = await crmApi.getClientActivitesConsolidees(clientsData[0].id_tiers);
          setRecentActivities(activitiesData.slice(0, 5));
        } catch (error) {
          console.error('Erreur chargement activités:', error);
        }
      }
      
    } catch (error) {
      console.error('Erreur chargement dashboard CRM:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTopClients = (clients: Client[]): Client[] => {
    return clients
      .filter(client => client.stats && client.stats.total_devis > 0)
      .sort((a, b) => (b.stats?.total_devis || 0) - (a.stats?.total_devis || 0))
      .slice(0, 3);
  };

  const getDevisUrgents = (devis: Devis[]): Devis[] => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return devis.filter(devis => {
      if (!devis.date_validite || devis.statut !== 'envoye') return false;
      const validite = new Date(devis.date_validite);
      return validite <= nextWeek && validite >= today;
    });
  };

  const getRelancesPrioritaires = (relances: Relance[]): Relance[] => {
    return relances.filter(relance => 
      relance.statut === 'en_attente' && 
      relance.type_relance === 'paiement'
    ).slice(0, 3);
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(montant);
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'accepte':
        return { label: 'Accepté', class: 'ms-badge-success' };
      case 'envoye':
        return { label: 'Envoyé', class: 'ms-badge-warning' };
      case 'brouillon':
        return { label: 'Brouillon', class: 'ms-badge-neutral' };
      case 'realise':
        return { label: 'Réalisé', class: 'ms-badge-success' };
      case 'planifie':
        return { label: 'Planifié', class: 'ms-badge-warning' };
      case 'en_attente':
        return { label: 'En attente', class: 'ms-badge-warning' };
      default:
        return { label: statut, class: 'ms-badge-neutral' };
    }
  };

  const getTypeIcon = (type: string) => {
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

  if (loading) {
    return (
      <div className="ms-page-container">
        <div className="ms-loading">Chargement du tableau de bord...</div>
      </div>
    );
  }

  const topClients = getTopClients(clients);
  const devisUrgents = getDevisUrgents(devis);
  const relancesPrioritaires = getRelancesPrioritaires(relances);

  return (
    <div className="ms-page-container">
      {/* Header de page */}
      <div className="ms-page-header">
        <div className="ms-header-left">
          <h1 className="ms-page-title">Tableau de bord CRM</h1>
          <div className="ms-page-subtitle">
            Vue d'ensemble de votre relation client
          </div>
        </div>
        <div className="ms-header-actions">
          <Link to="/crm/devis/nouveau" className="ms-btn ms-btn-primary">
            Nouveau devis
          </Link>
          <Link to="/crm/clients/nouveau" className="ms-btn ms-btn-secondary">
            Nouveau client
          </Link>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="ms-stats-grid">
        <div className="ms-stat-card">
          <div className="ms-stat-icon">👥</div>
          <div className="ms-stat-content">
            <div className="ms-stat-value">{clients.length}</div>
            <div className="ms-stat-label">Clients actifs</div>
            <div className="ms-stat-detail">
              {clients.filter(c => c.categorie === 'client').length} clients
            </div>
          </div>
        </div>

        <div className="ms-stat-card">
          <div className="ms-stat-icon">📄</div>
          <div className="ms-stat-content">
            <div className="ms-stat-value">{devis.length}</div>
            <div className="ms-stat-label">Devis en cours</div>
            <div className="ms-stat-detail">
              {devisStats.par_statut?.find(s => s.statut === 'envoye')?.count || 0} envoyés
            </div>
          </div>
        </div>

        <div className="ms-stat-card">
          <div className="ms-stat-icon">🔔</div>
          <div className="ms-stat-content">
            <div className="ms-stat-value">{relances.length}</div>
            <div className="ms-stat-label">Relances</div>
            <div className="ms-stat-detail">
              {relanceStats.par_statut?.en_attente || 0} en attente
            </div>
          </div>
        </div>

        <div className="ms-stat-card">
          <div className="ms-stat-icon">💰</div>
          <div className="ms-stat-content">
            <div className="ms-stat-value ms-stat-primary">
              {formatMontant(devisStats.total_chiffre_affaires || 0)}
            </div>
            <div className="ms-stat-label">Chiffre d'affaires</div>
            <div className="ms-stat-detail">
              Devis acceptés
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="ms-dashboard-grid">
        {/* Activités récentes */}
        <div className="ms-dashboard-card">
          <div className="ms-card-header">
            <h2 className="ms-card-title">Activités récentes</h2>
            <Link to="/crm/activites" className="ms-card-link">
              Voir tout
            </Link>
          </div>
          <div className="ms-card-content">
            {recentActivities.length > 0 ? (
              <div className="ms-activities-list">
                {recentActivities.map((activity, index) => {
                  const statut = getStatutBadge(activity.statut);
                  return (
                    <div key={index} className="ms-activity-item">
                      <div className="ms-activity-icon">
                        {getTypeIcon(activity.type_activite)}
                      </div>
                      <div className="ms-activity-content">
                        <div className="ms-activity-title">{activity.sujet}</div>
                        <div className="ms-activity-meta">
                          <span className="ms-activity-type">{activity.type_activite}</span>
                          <span className="ms-activity-date">
                            {new Date(activity.date_activite).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                      <span className={`ms-badge ${statut.class}`}>
                        {statut.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="ms-empty-state">
                <p>Aucune activité récente</p>
              </div>
            )}
          </div>
        </div>

        {/* Clients importants */}
        <div className="ms-dashboard-card">
          <div className="ms-card-header">
            <h2 className="ms-card-title">Clients importants</h2>
            <Link to="/crm/clients" className="ms-card-link">
              Voir tout
            </Link>
          </div>
          <div className="ms-card-content">
            {topClients.length > 0 ? (
              <div className="ms-clients-list">
                {topClients.map((client) => (
                  <div 
                    key={client.id_tiers} 
                    className="ms-client-item"
                    onClick={() => navigate(`/crm/clients/${client.id_tiers}`)}
                  >
                    <div className="ms-client-avatar">
                      {client.nom.charAt(0).toUpperCase()}
                    </div>
                    <div className="ms-client-info">
                      <div className="ms-client-name">
                        {client.raison_sociale || client.nom}
                      </div>
                      <div className="ms-client-stats">
                        {client.stats?.total_devis || 0} devis • {client.stats?.total_contrats || 0} contrats
                      </div>
                    </div>
                    <div className="ms-client-ca">
                      {client.chiffre_affaires_annuel ? 
                        `${(client.chiffre_affaires_annuel / 1000).toFixed(0)}K` : 
                        '-'
                      }
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ms-empty-state">
                <p>Aucun client important</p>
              </div>
            )}
          </div>
        </div>

        {/* Devis urgents */}
        <div className="ms-dashboard-card ms-urgent-card">
          <div className="ms-card-header">
            <h2 className="ms-card-title">Devis à traiter</h2>
            <span className="ms-badge ms-badge-warning">
              {devisUrgents.length} urgents
            </span>
          </div>
          <div className="ms-card-content">
            {devisUrgents.length > 0 ? (
              <div className="ms-devis-list">
                {devisUrgents.map((devis) => (
                  <div 
                    key={devis.id_devis} 
                    className="ms-devis-item"
                    onClick={() => navigate(`/crm/devis/${devis.id_devis}`)}
                  >
                    <div className="ms-devis-info">
                      <div className="ms-devis-numero">{devis.numero_devis}</div>
                      <div className="ms-devis-client">{devis.client_nom}</div>
                      <div className="ms-devis-montant">
                        {formatMontant(devis.montant_ht)}
                      </div>
                    </div>
                    <div className="ms-devis-date">
                      Expire le {new Date(devis.date_validite!).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ms-empty-state">
                <p>Aucun devis urgent</p>
              </div>
            )}
          </div>
        </div>

        {/* Relances prioritaires */}
        <div className="ms-dashboard-card ms-urgent-card">
          <div className="ms-card-header">
            <h2 className="ms-card-title">Relances prioritaires</h2>
            <span className="ms-badge ms-badge-warning">
              {relancesPrioritaires.length} requises
            </span>
          </div>
          <div className="ms-card-content">
            {relancesPrioritaires.length > 0 ? (
              <div className="ms-relances-list">
                {relancesPrioritaires.map((relance) => (
                  <div key={relance.id_relance} className="ms-relance-item">
                    <div className="ms-relance-header">
                      <span className="ms-relance-type">{relance.type_relance}</span>
                      <span className="ms-relance-canal">{relance.canal}</span>
                    </div>
                    <div className="ms-relance-objet">{relance.objet}</div>
                    <div className="ms-relance-client">{relance.client?.nom}</div>
                    <div className="ms-relance-date">
                      {new Date(relance.date_relance).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ms-empty-state">
                <p>Aucune relance prioritaire</p>
              </div>
            )}
            <div className="ms-relance-actions">
              <button 
                className="ms-btn ms-btn-warning"
                onClick={async () => {
                  try {
                    await crmApi.genererRelancesAutomatiques();
                    loadDashboardData();
                  } catch (error) {
                    console.error('Erreur génération relances:', error);
                  }
                }}
              >
                Générer relances automatiques
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation rapide */}
      <div className="ms-dashboard-card">
        <div className="ms-card-header">
          <h2 className="ms-card-title">Navigation rapide</h2>
        </div>
        <div className="ms-card-content">
          <div className="ms-quick-nav-grid">
            <Link to="/crm/clients" className="ms-nav-card">
              <div className="ms-nav-icon">👥</div>
              <div className="ms-nav-content">
                <h3>Clients</h3>
                <p>Gestion des fiches clients</p>
              </div>
            </Link>

            <Link to="/crm/devis" className="ms-nav-card">
              <div className="ms-nav-icon">📄</div>
              <div className="ms-nav-content">
                <h3>Devis</h3>
                <p>Création et suivi des devis</p>
              </div>
            </Link>

            <Link to="/crm/contrats" className="ms-nav-card">
              <div className="ms-nav-icon">📑</div>
              <div className="ms-nav-content">
                <h3>Contrats</h3>
                <p>Gestion des contrats</p>
              </div>
            </Link>

            <Link to="/crm/relances" className="ms-nav-card">
              <div className="ms-nav-icon">🔔</div>
              <div className="ms-nav-content">
                <h3>Relances</h3>
                <p>Suivi des relances</p>
              </div>
            </Link>

            <Link to="/crm/activites" className="ms-nav-card">
              <div className="ms-nav-icon">📅</div>
              <div className="ms-nav-content">
                <h3>Activités</h3>
                <p>Historique des interactions</p>
              </div>
            </Link>

            <Link to="/crm/rapports" className="ms-nav-card">
              <div className="ms-nav-icon">📊</div>
              <div className="ms-nav-content">
                <h3>Rapports</h3>
                <p>Statistiques et analyses</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMPage;