import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Facture } from '../types';
import { comptabiliteApi } from '../services/api';
import { useAlertDialog } from '../../../core/hooks/useAlertDialog';
import AlertDialog from '../../../core/components/AlertDialog/AlertDialog';
import {
  FiFileText,
  FiPlus,
  FiSearch,
  FiFilter,
  FiEye,
  FiEdit,
  FiCheck,
  FiX,
  FiDollarSign,
  FiClock,
  FiAlertCircle,
  FiFile,
  FiFilePlus,
  FiRefreshCw,
  FiCreditCard,
  FiCalendar,
  FiUser,
  FiType,
  FiPercent,
  FiTrendingUp,
  FiCheckCircle,
  FiXCircle,
  FiHash
} from 'react-icons/fi';
import './FacturesListPage.css';

export const FacturesListPage: React.FC = () => {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'validee' | 'brouillon' | 'annulee' | 'partiellement_payee' | 'payee' | 'en_retard'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'facture' | 'proforma' | 'avoir'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [annulationEnCours, setAnnulationEnCours] = useState<number | null>(null);

  const { isOpen, message, title, type, alert, close } = useAlertDialog();

  useEffect(() => {
    loadFactures();
  }, []);

  const loadFactures = async () => {
    try {
      setLoading(true);
      const data = await comptabiliteApi.getFactures();
      console.log('Factures chargées:', data);
      setFactures(data);
    } catch (error) {
      console.error('Erreur chargement factures:', error);
      setFactures([]);
      alert('Erreur lors du chargement des factures', {
        type: 'error',
        title: 'Erreur de chargement'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFactures = factures.filter(facture => {
    if (filter !== 'all' && facture.statut !== filter) {
      return false;
    }
    if (typeFilter !== 'all' && facture.type_facture !== typeFilter) {
      return false;
    }
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        facture.numero_facture?.toString().includes(searchLower) ||
        facture.numero_complet?.toLowerCase().includes(searchLower) || // AJOUT: recherche par numero_complet
        facture.nom_tiers?.toLowerCase().includes(searchLower) ||
        (facture as any).numero_tiers?.toString().includes(searchLower)
      );
    }
    return true;
  });

  const getStatutClass = (statut: string) => {
    const classes = {
      validee: 'ms-badge ms-badge-success',
      brouillon: 'ms-badge ms-badge-warning',
      annulee: 'ms-badge ms-badge-error',
      partiellement_payee: 'ms-badge ms-badge-info',
      payee: 'ms-badge ms-badge-success',
      en_retard: 'ms-badge ms-badge-error',
      non_payee: 'ms-badge ms-badge-warning'
    };
    return classes[statut as keyof typeof classes] || 'ms-badge ms-badge-default';
  };

  const getTypeClass = (type: string) => {
    const classes = {
      facture: 'ms-badge ms-badge-primary',
      proforma: 'ms-badge ms-badge-info',
      avoir: 'ms-badge ms-badge-warning'
    };
    return classes[type as keyof typeof classes] || 'ms-badge ms-badge-default';
  };

  const getStatutIcon = (statut: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      validee: <FiCheckCircle className="statut-icon" size={16} />,
      brouillon: <FiFile className="statut-icon" size={16} />,
      annulee: <FiXCircle className="statut-icon" size={16} />,
      partiellement_payee: <FiRefreshCw className="statut-icon" size={16} />,
      payee: <FiDollarSign className="statut-icon" size={16} />,
      en_retard: <FiClock className="statut-icon" size={16} />,
      non_payee: <FiCreditCard className="statut-icon" size={16} />
    };
    return icons[statut] || <FiFile className="statut-icon" size={16} />;
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      facture: <FiFileText className="type-icon" size={16} />,
      proforma: <FiFilePlus className="type-icon" size={16} />,
      avoir: <FiRefreshCw className="type-icon" size={16} />
    };
    return icons[type] || <FiFile className="type-icon" size={16} />;
  };

  const getStatutLabel = (statut: string) => {
    const labels: { [key: string]: string } = {
      validee: 'Validée',
      brouillon: 'Brouillon',
      annulee: 'Annulée',
      partiellement_payee: 'Partiellement payée',
      payee: 'Payée',
      en_retard: 'En retard',
      non_payee: 'Non payée'
    };
    return labels[statut] || statut;
  };

  const calculerProgressionPaiement = (facture: Facture) => {
    if (!facture.total_ttc || facture.total_ttc === 0) return 0;
    const paye = facture.montant_paye || 0;
    return Math.min(100, (paye / facture.total_ttc) * 100);
  };

  const estEnRetard = (facture: Facture): boolean => {
    if (!facture.date_finale_paiement || facture.statut === 'payee') return false;
    const dateFinale = new Date(facture.date_finale_paiement);
    const aujourdhui = new Date();
    return dateFinale < aujourdhui && (facture.montant_restant || 0) > 0;
  };

  const getJourRestant = (facture: Facture): number | null => {
    if (!facture.date_finale_paiement || facture.statut === 'payee') return null;
    const dateFinale = new Date(facture.date_finale_paiement);
    const aujourdhui = new Date();
    const diffTime = dateFinale.getTime() - aujourdhui.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleValiderFacture = async (numeroFacture: number) => {
    try {
      setLoading(true);
      await comptabiliteApi.validerFacture(numeroFacture);
      alert('Facture validée avec succès!', {
        type: 'success',
        title: 'Succès'
      });
      loadFactures();
    } catch (error: any) {
      alert(`Erreur lors de la validation: ${error.message}`, {
        type: 'error',
        title: 'Erreur'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnnulerFacture = async (numeroFacture: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette facture ? Cette action est irréversible.')) {
      return;
    }

    try {
      setAnnulationEnCours(numeroFacture);
      await comptabiliteApi.annulerFacture(numeroFacture);
      
      alert('Facture annulée avec succès!', {
        type: 'success',
        title: 'Succès'
      });
      
      loadFactures();
    } catch (error: any) {
      console.error('Erreur lors de l\'annulation:', error);
      alert(`Erreur lors de l'annulation: ${error.response?.data?.message || error.message || 'Erreur inconnue'}`, {
        type: 'error',
        title: 'Erreur'
      });
    } finally {
      setAnnulationEnCours(null);
    }
  };

  if (loading) {
    return (
      <div className="ms-crm-loading">
        <div className="ms-crm-spinner"></div>
        <span>Chargement des factures...</span>
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
              <FiFileText className="page-title-icon" />
              Factures
            </h1>
            <p className="ms-crm-subtitle">Gestion de votre facturation et suivi des paiements</p>
          </div>
        </div>
        
        <div className="ms-crm-header-actions">
          <Link 
            to="/comptabilite/factures/nouvelle"
            className="ms-crm-btn ms-crm-btn-primary"
          >
            <FiPlus className="ms-crm-icon" />
            Nouvelle facture
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
                placeholder="N° facture, numéro complet, client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ms-crm-search-input"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="ms-crm-filter-wrapper">
            <label className="ms-crm-filter-label">
              <FiFilter className="filter-label-icon" />
              Statut
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="ms-crm-filter-select"
            >
              <option value="all">Tous les statuts</option>
              <option value="brouillon">Brouillons</option>
              <option value="validee">Validées</option>
              <option value="annulee">Annulées</option>
              <option value="partiellement_payee">Partiellement payées</option>
              <option value="payee">Payées</option>
              <option value="en_retard">En retard</option>
            </select>
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
              <option value="facture">Factures</option>
              <option value="proforma">Proformas</option>
              <option value="avoir">Avoirs</option>
            </select>
          </div>

          {/* Stats */}
          <div className="ms-crm-stats">
            <span className="ms-crm-stat-badge">
              <FiTrendingUp className="stat-icon" />
              {filteredFactures.length} facture{filteredFactures.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Factures Grid */}
        <div className="ms-crm-card">
          <div className="ms-crm-table-container">
            {filteredFactures.length > 0 ? (
              <table className="ms-crm-table">
                <thead>
                  <tr>
                    <th className="ms-crm-table-header">
                      <FiHash className="table-header-icon" />
                      <span>Numéro complet</span>
                    </th>
                    <th className="ms-crm-table-header">
                      <FiUser className="table-header-icon" />
                      <span>Client/Fournisseur</span>
                    </th>
                    <th className="ms-crm-table-header">
                      <FiCalendar className="table-header-icon" />
                      <span>Date</span>
                    </th>
                    <th className="ms-crm-table-header">
                      <FiType className="table-header-icon" />
                      <span>Type</span>
                    </th>
                    <th className="ms-crm-table-header">
                      <FiDollarSign className="table-header-icon" />
                      <span>Montant TTC</span>
                    </th>
                    <th className="ms-crm-table-header">
                      <FiPercent className="table-header-icon" />
                      <span>Progression</span>
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
                  {filteredFactures.map((facture) => {
                    const progression = calculerProgressionPaiement(facture);
                    const enRetard = estEnRetard(facture);
                    const joursRestants = getJourRestant(facture);

                    return (
                      <tr key={facture.numero_facture} className={`ms-crm-table-row ${enRetard ? 'ms-crm-row-warning' : ''}`}>
                        <td className="ms-crm-table-cell">
                          <div className="ms-crm-facture-info">
                            {/* Numéro complet (format international) */}
                            <div className="ms-crm-facture-numero-complet">
                              {facture.numero_complet || `INV/XXXX/XXX`}
                            </div>
                            
                            {/* Référence simple */}
                            <div className="ms-crm-facture-reference">
                              Réf: #{facture.numero_facture}
                            </div>
                            
                            {/* Devise */}
                            <div className="ms-crm-facture-devise">
                              {facture.devise}
                            </div>
                          </div>
                        </td>
                        <td className="ms-crm-table-cell">
                          <div className="ms-crm-client-info">
                            <div className="ms-crm-client-name">
                              {facture.nom_tiers}
                            </div>
                            <div className="ms-crm-client-type">
                              {facture.type_tiers}
                            </div>
                            {facture.date_finale_paiement && (
                              <div className="ms-crm-echeance-info">
                                <span className="ms-crm-echeance-label">Échéance:</span>
                                <span className="ms-crm-echeance-date">
                                  {new Date(facture.date_finale_paiement).toLocaleDateString('fr-FR')}
                                </span>
                                {joursRestants !== null && (
                                  <span className={`ms-crm-jours-restants ${joursRestants < 0 ? 'ms-crm-retard' : joursRestants < 7 ? 'ms-crm-warning' : 'ms-crm-normal'}`}>
                                    {joursRestants < 0 ? `${Math.abs(joursRestants)}j retard` : `${joursRestants}j restant`}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="ms-crm-table-cell">
                          <div className="ms-crm-date">
                            {new Date(facture.date).toLocaleDateString('fr-FR')}
                          </div>
                        </td>
                        <td className="ms-crm-table-cell">
                          <div className="ms-crm-type-info">
                            <span className="ms-crm-type-icon">
                              {getTypeIcon(facture.type_facture)}
                            </span>
                            <span className={getTypeClass(facture.type_facture)}>
                              {facture.type_facture}
                            </span>
                          </div>
                        </td>
                        <td className="ms-crm-table-cell ms-crm-text-right">
                          <div className="ms-crm-financial-info">
                            <div className="ms-crm-amount">
                              {facture.total_ttc?.toLocaleString('fr-FR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })} {facture.devise}
                            </div>
                            {(facture.montant_paye || 0) > 0 && (
                              <div className="ms-crm-paye">
                                Payé: {(facture.montant_paye || 0).toLocaleString('fr-FR')} {facture.devise}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="ms-crm-table-cell">
                          <div className="ms-crm-progression">
                            <div className="ms-crm-progression-bar">
                              <div 
                                className={`ms-crm-progression-fill ${progression === 100 ? 'ms-crm-complete' : progression > 0 ? 'ms-crm-partial' : 'ms-crm-empty'}`}
                                style={{ width: `${progression}%` }}
                              />
                            </div>
                            <div className="ms-crm-progression-text">
                              {progression.toFixed(0)}%
                            </div>
                          </div>
                        </td>
                        <td className="ms-crm-table-cell">
                          <div className="ms-crm-statut-info">
                            <span className="ms-crm-statut-icon">
                              {getStatutIcon(facture.statut)}
                            </span>
                            <span className={getStatutClass(facture.statut)}>
                              {getStatutLabel(facture.statut)}
                            </span>
                          </div>
                        </td>
                        <td className="ms-crm-table-cell ms-crm-text-center">
                          <div className="ms-crm-actions-container">
                            <Link
                              to={`/comptabilite/factures/${facture.numero_facture}`}
                              className="ms-crm-btn ms-crm-btn-icon ms-crm-btn-view"
                              title="Voir la facture"
                            >
                              <FiEye className="action-icon" />
                            </Link>
                            {facture.statut === 'brouillon' && (
                              <>
                                <Link
                                  to={`/comptabilite/factures/${facture.numero_facture}/edit`}
                                  className="ms-crm-btn ms-crm-btn-icon ms-crm-btn-edit"
                                  title="Modifier la facture"
                                >
                                  <FiEdit className="action-icon" />
                                </Link>
                                <button
                                  onClick={() => facture.numero_facture && handleValiderFacture(facture.numero_facture)}
                                  className="ms-crm-btn ms-crm-btn-icon ms-crm-btn-success"
                                  title="Valider la facture"
                                >
                                  <FiCheck className="action-icon" />
                                </button>
                              </>
                            )}
                            {(facture.statut === 'validee' ) && (
                              <button
                                onClick={() => facture.numero_facture && handleAnnulerFacture(facture.numero_facture)}
                                className="ms-crm-btn ms-crm-btn-icon ms-crm-btn-danger"
                                title="Annuler la facture"
                                disabled={annulationEnCours === facture.numero_facture}
                              >
                                {annulationEnCours === facture.numero_facture ? (
                                  <div className="ms-crm-spinner-small"></div>
                                ) : (
                                  <FiX className="action-icon" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="ms-crm-empty-state">
                <div className="ms-crm-empty-icon">
                  <FiFileText size={48} />
                </div>
                <h3>Aucune facture trouvée</h3>
                <p>
                  {searchTerm || filter !== 'all' || typeFilter !== 'all'
                    ? 'Aucune facture ne correspond à vos critères de recherche.'
                    : 'Commencez par créer votre première facture.'
                  }
                </p>
                {!searchTerm && filter === 'all' && typeFilter === 'all' && (
                  <Link 
                    to="/comptabilite/factures/nouvelle"
                    className="ms-crm-btn ms-crm-btn-primary"
                  >
                    <FiPlus className="ms-crm-icon" />
                    Créer votre première facture
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog
        isOpen={isOpen}
        title={title}
        message={message}
        type={type}
        onClose={close}
      />
    </div>
  );
};

export default FacturesListPage;