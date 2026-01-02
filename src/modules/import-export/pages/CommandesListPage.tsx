import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { importExportApi } from '../services/api';
import type { Commande } from '../types';
import { 
  FiDownload, 
  FiUpload, 
  FiEye, 
  FiEdit2, 
  FiTruck,
  FiPlus,
  FiSearch,
  FiUser,
  FiBriefcase,
  FiDollarSign,
  FiAlertCircle,
  FiClock,
  FiTrendingUp,
  FiFilter,
  FiType,
  FiCheckCircle,
  FiTruck as FiTruckIcon,
  FiPackage,
  FiXCircle,
  FiFileText
} from 'react-icons/fi';
import './CommandesListPage.css';

const CommandesListPage: React.FC = () => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'all' | 'import' | 'export'>('all');
  const [statutFilter, setStatutFilter] = useState<'all' | 'brouillon' | 'confirmée' | 'expédiée' | 'livrée' | 'annulée'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCommandes();
  }, [typeFilter, statutFilter]);

  const loadCommandes = async () => {
    try {
      setLoading(true);
      const filters = {
        type: typeFilter === 'all' ? '' : typeFilter,
        statut: statutFilter === 'all' ? '' : statutFilter
      };
      const data = await importExportApi.getCommandes(filters);
      setCommandes(data);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCommandes = commandes.filter(commande => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        commande.numero_commande?.toString().includes(searchLower) ||
        commande.client?.nom?.toLowerCase().includes(searchLower) ||
        commande.fournisseur?.nom?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getStatutClass = (statut: string) => {
    const classes = {
      brouillon: 'ms-badge ms-badge-warning',
      'confirmée': 'ms-badge ms-badge-info',
      expédiée: 'ms-badge ms-badge-primary',
      livrée: 'ms-badge ms-badge-success',
      annulée: 'ms-badge ms-badge-error'
    };
    return classes[statut as keyof typeof classes] || 'ms-badge ms-badge-default';
  };

  const getTypeClass = (type: string) => {
    const classes = {
      import: 'ms-badge ms-badge-info',
      export: 'ms-badge ms-badge-success'
    };
    return classes[type as keyof typeof classes] || 'ms-badge ms-badge-default';
  };

  const getStatutIcon = (statut: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      brouillon: <FiFileText className="statut-icon" size={16} />,
      'confirmée': <FiCheckCircle className="statut-icon" size={16} />,
      expédiée: <FiTruckIcon className="statut-icon" size={16} />,
      livrée: <FiPackage className="statut-icon" size={16} />,
      annulée: <FiXCircle className="statut-icon" size={16} />
    };
    return icons[statut] || <FiAlertCircle className="statut-icon" size={16} />;
  };

  const getTypeIcon = (type: string) => {
    return type === 'import' ? 
      <FiDownload className="type-icon" size={16} /> : 
      <FiUpload className="type-icon" size={16} />;
  };

  const getStatutLabel = (statut: string) => {
    const labels: { [key: string]: string } = {
      brouillon: 'Brouillon',
      'confirmée': 'Confirmée',
      expédiée: 'Expédiée',
      livrée: 'Livrée',
      annulée: 'Annulée'
    };
    return labels[statut] || statut;
  };

  if (loading) {
    return (
      <div className="ms-crm-loading">
        <div className="ms-crm-spinner"></div>
        <span>Chargement des commandes...</span>
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
              <FiBriefcase className="page-title-icon" />
              Commandes
            </h1>
            <p className="ms-crm-subtitle">Gestion des commandes d'import/export</p>
          </div>
        </div>
        
        <div className="ms-crm-header-actions">
          <Link 
            to="/import-export/commandes/nouvelle"
            className="ms-crm-btn ms-crm-btn-primary"
          >
            <FiPlus className="ms-crm-icon" />
            Nouvelle commande
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="ms-crm-content">
        
        {/* Filters and Search Bar */}
        <div className="ms-crm-filters-bar">
          {/* Search Box */}
          <div className="ms-crm-search-wrapper">
            <label className="ms-crm-filter-label">
              <FiSearch className="filter-label-icon" />
              Rechercher
            </label>
            <div className="ms-crm-search-box">
              <input
                type="text"
                placeholder="N° commande, client, fournisseur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ms-crm-search-input"
              />
            </div>
          </div>
          
          {/* Type Filter */}
          <div className="ms-crm-filter-wrapper">
            <label className="ms-crm-filter-label">
              <FiType className="filter-label-icon" />
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="ms-crm-filter-select"
            >
              <option value="all">Tous les types</option>
              <option value="import">Import</option>
              <option value="export">Export</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="ms-crm-filter-wrapper">
            <label className="ms-crm-filter-label">
              <FiFilter className="filter-label-icon" />
              Statut
            </label>
            <select
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value as any)}
              className="ms-crm-filter-select"
            >
              <option value="all">Tous les statuts</option>
              <option value="brouillon">Brouillons</option>
              <option value="confirmée">Confirmées</option>
              <option value="expédiée">Expédiées</option>
              <option value="livrée">Livrées</option>
              <option value="annulée">Annulées</option>
            </select>
          </div>

          {/* Stats */}
          <div className="ms-crm-stats">
            <span className="ms-crm-stat-badge">
              <FiTrendingUp className="stat-icon" />
              {filteredCommandes.length} commande{filteredCommandes.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Commandes Grid */}
        <div className="ms-crm-card">
          <div className="ms-crm-table-container">
            {filteredCommandes.length > 0 ? (
              <table className="ms-crm-table">
                <thead>
                  <tr>
                    <th className="ms-crm-table-header">
                      <FiBriefcase className="table-header-icon" />
                      <span>Commande</span>
                    </th>
                    <th className="ms-crm-table-header">
                      <FiUser className="table-header-icon" />
                      <span>Client</span>
                    </th>
                    <th className="ms-crm-table-header">
                      <FiBriefcase className="table-header-icon" />
                      <span>Fournisseur</span>
                    </th>
                    <th className="ms-crm-table-header">
                      <FiDollarSign className="table-header-icon" />
                      <span>Montant</span>
                    </th>
                    <th className="ms-crm-table-header">
                      <FiAlertCircle className="table-header-icon" />
                      <span>Statut</span>
                    </th>
                    <th className="ms-crm-table-header ms-crm-text-center">
                      <FiClock className="table-header-icon" />
                      <span>Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCommandes.map((commande) => (
                    <tr key={commande.id} className="ms-crm-table-row">
                      <td className="ms-crm-table-cell">
                        <div className="ms-crm-commande-info">
                          <div className="ms-crm-commande-type">
                            <span className="ms-crm-type-icon">
                              {getTypeIcon(commande.type)}
                            </span>
                            <span className={getTypeClass(commande.type)}>
                              {commande.type === 'import' ? 'Import' : 'Export'}
                            </span>
                          </div>
                          <div className="ms-crm-commande-number">
                            #{commande.numero_commande}
                          </div>
                          <div className="ms-crm-commande-date">
                            {commande.date_commande && new Date(commande.date_commande).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </td>
                      <td className="ms-crm-table-cell">
                        <div className="ms-crm-client-info">
                          <div className="ms-crm-client-name">
                            {commande.client?.nom || 'N/A'}
                          </div>
                          <div className="ms-crm-client-reference">
                            {commande.client?.reference}
                          </div>
                        </div>
                      </td>
                      <td className="ms-crm-table-cell">
                        <div className="ms-crm-fournisseur-info">
                          <div className="ms-crm-fournisseur-name">
                            {commande.fournisseur?.nom || 'N/A'}
                          </div>
                          <div className="ms-crm-fournisseur-reference">
                            {commande.fournisseur?.reference}
                          </div>
                        </div>
                      </td>
                      <td className="ms-crm-table-cell ms-crm-text-right">
                        <div className="ms-crm-financial-info">
                          <div className="ms-crm-amount">
                            {new Intl.NumberFormat('fr-FR', { 
                              style: 'currency', 
                              currency: commande.devise || 'EUR'
                            }).format(commande.montant_total || 0)}
                          </div>
                          {commande.devise && (
                            <div className="ms-crm-devise">
                              {commande.devise}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="ms-crm-table-cell">
                        <div className="ms-crm-statut-info">
                          <span className="ms-crm-statut-icon">
                            {getStatutIcon(commande.statut)}
                          </span>
                          <span className={getStatutClass(commande.statut)}>
                            {getStatutLabel(commande.statut)}
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
                            to={`/import-export/commandes/${commande.id}/edit`}
                            className="ms-crm-btn ms-crm-btn-icon ms-crm-btn-edit"
                            title="Modifier la commande"
                          >
                            <FiEdit2 className="action-icon" />
                          </Link>
                          <Link
                            to={`/import-export/commandes/${commande.id}/expedition`}
                            className="ms-crm-btn ms-crm-btn-icon ms-crm-btn-primary"
                            title="Gérer l'expédition"
                          >
                            <FiTruck className="action-icon" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="ms-crm-empty-state">
                <div className="ms-crm-empty-icon">
                  <FiBriefcase size={48} />
                </div>
                <h3>Aucune commande trouvée</h3>
                <p>
                  {searchTerm || typeFilter !== 'all' || statutFilter !== 'all'
                    ? 'Aucune commande ne correspond à vos critères de recherche.'
                    : 'Commencez par créer votre première commande.'
                  }
                </p>
                {!searchTerm && typeFilter === 'all' && statutFilter === 'all' && (
                  <Link 
                    to="/import-export/commandes/nouvelle"
                    className="ms-crm-btn ms-crm-btn-primary"
                  >
                    <FiPlus className="ms-crm-icon" />
                    Créer votre première commande
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandesListPage;