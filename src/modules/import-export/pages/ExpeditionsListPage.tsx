import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { importExportApi } from '../services/api';
import type { Commande } from '../types';
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiFilter,
  FiRefreshCw,
  FiEye,
  FiEdit,
  FiDownload,
  FiSearch,
  FiAlertCircle,
  FiTrendingUp,
  FiCalendar,
  FiUser,
  FiBox,
  FiFileText,
  FiMapPin
} from 'react-icons/fi';
import './ExpeditionsListPage.css';

const ExpeditionsListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [filters, setFilters] = useState({
    statut: '',
    type: '',
    transporteur: ''
  });

  useEffect(() => {
    loadCommandes();
  }, []);

  const loadCommandes = async () => {
    try {
      console.log('🔄 Chargement des commandes depuis ExpeditionsListPage...');
      const data = await importExportApi.getCommandes();
      console.log('📦 Commandes chargées:', data.length);
      
      // Debug détaillé
      data.forEach((commande, index) => {
        console.log(`Commande ${index + 1}:`, {
          id: commande.id,
          numero: commande.numero_commande,
          hasExpedition: !!commande.expedition,
          expedition: commande.expedition
        });
      });
      
      const avecExpeditions = data.filter(c => c.expedition);
      console.log('🚚 Commandes avec expédition:', avecExpeditions.length);
      
      setCommandes(data);
    } catch (error) {
      console.error('❌ Erreur chargement commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatutClass = (statut: string) => {
    const classes = {
      preparation: 'ms-badge ms-badge-warning',
      'expédiée': 'ms-badge ms-badge-primary',
      transit: 'ms-badge ms-badge-info',
      arrivée: 'ms-badge ms-badge-success',
      livrée: 'ms-badge ms-badge-success'
    };
    return classes[statut as keyof typeof classes] || 'ms-badge ms-badge-default';
  };

  const getStatutIcon = (statut: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      preparation: <FiClock className="statut-icon" size={14} />,
      'expédiée': <FiTruck className="statut-icon" size={14} />,
      transit: <FiMapPin className="statut-icon" size={14} />,
      arrivée: <FiPackage className="statut-icon" size={14} />,
      livrée: <FiCheckCircle className="statut-icon" size={14} />
    };
    return icons[statut] || <FiClock className="statut-icon" size={14} />;
  };

  const getStatutLabel = (statut: string) => {
    const labels: { [key: string]: string } = {
      preparation: 'En préparation',
      'expédiée': 'Expédiée',
      transit: 'En transit',
      arrivée: 'Arrivée',
      livrée: 'Livrée'
    };
    return labels[statut] || statut;
  };

  // Commandes avec expédition
  const expeditionsAvecExpédition = commandes.filter(c => c.expedition);
  const commandesSansExpedition = commandes.filter(c => !c.expedition);

  const filteredExpeditions = expeditionsAvecExpédition.filter(commande => {
    if (filters.statut && commande.expedition?.statut !== filters.statut) return false;
    if (filters.type && commande.type !== filters.type) return false;
    if (filters.transporteur && 
        !commande.expedition?.transporteur?.toLowerCase().includes(filters.transporteur.toLowerCase())) 
      return false;
    return true;
  });

  console.log('📊 États actuels:', {
    totalCommandes: commandes.length,
    avecExpedition: expeditionsAvecExpédition.length,
    sansExpedition: commandesSansExpedition.length,
    filtered: filteredExpeditions.length,
    filters: filters
  });

  if (loading) {
    return (
      <div className="ms-crm-loading">
        <div className="ms-crm-spinner"></div>
        <span>Chargement des expéditions...</span>
      </div>
    );
  }

  return (
    <div className="ms-crm-container">
      {/* Header Microsoft Style */}
      <div className="ms-crm-header">
        <div className="ms-crm-header-left">
          <div className="ms-crm-title-section">
            <h1 className="ms-crm-page-title">
              <FiTruck className="page-title-icon" />
              Expéditions
            </h1>
            <p className="ms-crm-subtitle">Suivi logistique des commandes import/export</p>
          </div>
        </div>
        
        <div className="ms-crm-header-actions">
          <Link 
            to="/import-export/commandes"
            className="ms-crm-btn ms-crm-btn-secondary"
          >
            <FiBox className="ms-crm-icon" />
            Voir les commandes
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="ms-crm-content">
        
        {/* Alert pour commandes sans expédition */}
        {commandesSansExpedition.length > 0 && (
          <div className="ms-crm-alert ms-crm-alert-info">
            <div className="ms-crm-alert-icon">
              <FiAlertCircle size={20} />
            </div>
            <div className="ms-crm-alert-content">
              <strong>{commandesSansExpedition.length} commande(s) sans expédition</strong>
              <p>Créez des expéditions pour suivre la logistique de ces commandes.</p>
            </div>
            <Link to="/import-export/commandes" className="ms-crm-btn ms-crm-btn-primary">
              Gérer les commandes
            </Link>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="ms-crm-filters-bar">
          {/* Status Filter */}
          <div className="ms-crm-filter-wrapper">
            <label className="ms-crm-filter-label">
              <FiFilter className="filter-label-icon" />
              Statut
            </label>
            <select
              value={filters.statut}
              onChange={(e) => setFilters(prev => ({ ...prev, statut: e.target.value }))}
              className="ms-crm-filter-select"
            >
              <option value="">Tous les statuts</option>
              <option value="preparation">En préparation</option>
              <option value="expédiée">Expédiée</option>
              <option value="transit">En transit</option>
              <option value="arrivée">Arrivée</option>
              <option value="livrée">Livrée</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="ms-crm-filter-wrapper">
            <label className="ms-crm-filter-label">
              <FiPackage className="filter-label-icon" />
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="ms-crm-filter-select"
            >
              <option value="">Tous les types</option>
              <option value="import">Import</option>
              <option value="export">Export</option>
            </select>
          </div>

          {/* Transporteur Search */}
          <div className="ms-crm-search-wrapper">
            <label className="ms-crm-filter-label">
              <FiSearch className="filter-label-icon" />
              Transporteur
            </label>
            <div className="ms-crm-search-box">
              <input
                type="text"
                placeholder="Nom du transporteur..."
                value={filters.transporteur}
                onChange={(e) => setFilters(prev => ({ ...prev, transporteur: e.target.value }))}
                className="ms-crm-search-input"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="ms-crm-stats">
            <span className="ms-crm-stat-badge">
              <FiTrendingUp className="stat-icon" />
              {filteredExpeditions.length} expédition{filteredExpeditions.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Reset filters */}
          {(filters.statut || filters.type || filters.transporteur) && (
            <div className="ms-crm-filter-wrapper">
              <label className="ms-crm-filter-label">&nbsp;</label>
              <button 
                onClick={() => setFilters({statut: '', type: '', transporteur: ''})}
                className="ms-crm-btn ms-crm-btn-secondary"
                style={{ minWidth: '100px' }}
              >
                <FiRefreshCw className="ms-crm-icon" />
                Réinitialiser
              </button>
            </div>
          )}
        </div>

        {/* Statistiques Grid */}
        <div className="ms-crm-stats-grid">
          <div className="ms-crm-stat-card">
            <div className="ms-crm-stat-icon">
              <FiPackage size={24} />
            </div>
            <div className="ms-crm-stat-content">
              <div className="ms-crm-stat-value">{expeditionsAvecExpédition.length}</div>
              <div className="ms-crm-stat-label">Expéditions actives</div>
            </div>
          </div>

          <div className="ms-crm-stat-card">
            <div className="ms-crm-stat-icon">
              <FiAlertCircle size={24} />
            </div>
            <div className="ms-crm-stat-content">
              <div className="ms-crm-stat-value">{commandesSansExpedition.length}</div>
              <div className="ms-crm-stat-label">Sans expédition</div>
            </div>
          </div>

          <div className="ms-crm-stat-card">
            <div className="ms-crm-stat-icon">
              <FiClock size={24} />
            </div>
            <div className="ms-crm-stat-content">
              <div className="ms-crm-stat-value">
                {expeditionsAvecExpédition.filter(c => c.expedition?.statut === 'preparation').length}
              </div>
              <div className="ms-crm-stat-label">En préparation</div>
            </div>
          </div>

          <div className="ms-crm-stat-card">
            <div className="ms-crm-stat-icon">
              <FiCheckCircle size={24} />
            </div>
            <div className="ms-crm-stat-content">
              <div className="ms-crm-stat-value">
                {expeditionsAvecExpédition.filter(c => c.expedition?.statut === 'livrée').length}
              </div>
              <div className="ms-crm-stat-label">Livrées</div>
            </div>
          </div>
        </div>

        {/* Expéditions Grid */}
        <div className="ms-crm-card">
          <div className="ms-crm-table-container">
            {filteredExpeditions.length > 0 ? (
              <table className="ms-crm-table">
                <thead>
                  <tr>
                    <th className="ms-crm-table-header">
                      <FiFileText className="table-header-icon" />
                      <span>Commande</span>
                    </th>
                    <th className="ms-crm-table-header">
                      <FiUser className="table-header-icon" />
                      <span>Client</span>
                    </th>
                    <th className="ms-crm-table-header">
                      <FiTruck className="table-header-icon" />
                      <span>Transport</span>
                    </th>
                    <th className="ms-crm-table-header">
                      <FiCalendar className="table-header-icon" />
                      <span>Dates</span>
                    </th>
                    <th className="ms-crm-table-header">
                      <FiClock className="table-header-icon" />
                      <span>Statut</span>
                    </th>
                    <th className="ms-crm-table-header ms-crm-text-center">
                      <FiPackage className="table-header-icon" />
                      <span>Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpeditions.map((commande) => (
                    <tr key={commande.id} className="ms-crm-table-row">
                      <td className="ms-crm-table-cell">
                        <div className="ms-crm-commande-info">
                          <div className="ms-crm-commande-ref">
                            {commande.numero_commande}
                          </div>
                          <div className={`ms-crm-commande-type ${commande.type === 'import' ? 'ms-crm-type-import' : 'ms-crm-type-export'}`}>
                            {commande.type === 'import' ? 'Import' : 'Export'}
                          </div>
                        </div>
                      </td>
                      <td className="ms-crm-table-cell">
                        <div className="ms-crm-client-info">
                          <div className="ms-crm-client-name">
                            {commande.client?.nom || 'N/A'}
                          </div>
                          <div className="ms-crm-client-email">
                            {commande.client?.email}
                          </div>
                        </div>
                      </td>
                      <td className="ms-crm-table-cell">
                        <div className="ms-crm-transport-info">
                          <div className="ms-crm-transporteur">
                            {commande.expedition?.transporteur || 'Non spécifié'}
                          </div>
                          <div className="ms-crm-mode-transport">
                            {commande.expedition?.mode_transport || '-'}
                          </div>
                        </div>
                      </td>
                      <td className="ms-crm-table-cell">
                        <div className="ms-crm-dates-info">
                          <div className="ms-crm-date-item">
                            <span className="ms-crm-date-label">Expédition:</span>
                            <span className="ms-crm-date-value">
                              {commande.expedition?.date_expedition 
                                ? new Date(commande.expedition.date_expedition).toLocaleDateString('fr-FR')
                                : 'Non planifiée'
                              }
                            </span>
                          </div>
                          <div className="ms-crm-date-item">
                            <span className="ms-crm-date-label">Arrivée:</span>
                            <span className="ms-crm-date-value">
                              {commande.expedition?.date_arrivee_prevue 
                                ? new Date(commande.expedition.date_arrivee_prevue).toLocaleDateString('fr-FR')
                                : '-'
                              }
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="ms-crm-table-cell">
                        <div className="ms-crm-statut-info">
                          <span className="ms-crm-statut-icon">
                            {getStatutIcon(commande.expedition?.statut || '')}
                          </span>
                          <span className={getStatutClass(commande.expedition?.statut || '')}>
                            {getStatutLabel(commande.expedition?.statut || '')}
                          </span>
                        </div>
                      </td>
                      <td className="ms-crm-table-cell ms-crm-text-center">
                        <div className="ms-crm-actions-container">
                          <Link
                            to={`/import-export/commandes/${commande.id}`}
                            className="ms-crm-btn ms-crm-btn-icon ms-crm-btn-view"
                            title="Voir la commande"
                          >
                            <FiEye className="action-icon" />
                          </Link>
                          <Link
                            to={`/import-export/commandes/${commande.id}/expedition`}
                            className="ms-crm-btn ms-crm-btn-icon ms-crm-btn-edit"
                            title="Modifier l'expédition"
                          >
                            <FiEdit className="action-icon" />
                          </Link>
                          {commande.expedition?.numero_bl && (
                            <button
                              className="ms-crm-btn ms-crm-btn-icon ms-crm-btn-primary"
                              title="Télécharger le Bill of Lading"
                            >
                              <FiDownload className="action-icon" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="ms-crm-empty-state">
                <div className="ms-crm-empty-icon">
                  <FiTruck size={48} />
                </div>
                <h3>Aucune expédition trouvée</h3>
                <p>
                  {expeditionsAvecExpédition.length === 0
                    ? 'Commencez par créer des expéditions pour vos commandes existantes.'
                    : 'Aucune expédition ne correspond à vos critères de recherche.'
                  }
                </p>
                {expeditionsAvecExpédition.length === 0 ? (
                  <Link 
                    to="/import-export/commandes"
                    className="ms-crm-btn ms-crm-btn-primary"
                  >
                    <FiBox className="ms-crm-icon" />
                    Voir les commandes
                  </Link>
                ) : (
                  <button 
                    onClick={() => setFilters({statut: '', type: '', transporteur: ''})}
                    className="ms-crm-btn ms-crm-btn-primary"
                  >
                    <FiRefreshCw className="ms-crm-icon" />
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpeditionsListPage;