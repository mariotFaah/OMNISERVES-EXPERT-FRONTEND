import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaCheck, 
  FaTimes, 
  FaPrint, 
  FaEdit, 
  FaFilePdf, 

  FaBuilding,
  FaUser,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaCreditCard,
  FaPercentage,
  FaShoppingCart,
  FaCalculator,
  FaHistory,
  FaStickyNote,

  FaFileInvoiceDollar,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaBan,
  FaExchangeAlt,

  FaDollarSign
} from 'react-icons/fa';
import type { Facture } from '../types';
import { comptabiliteApi } from '../services/api';
import { useAlertDialog } from '../../../core/hooks/useAlertDialog';
import AlertDialog from '../../../core/components/AlertDialog/AlertDialog';
import { ExportPDFButton } from '../components/ExportPDFButton/ExportPDFButton';
import { ExportExcelButton } from '../components/ExportExcelButton/ExportExcelButton';
import './FactureDetailPage.css';

export const FactureDetailPage: React.FC = () => {
  const { numero } = useParams<{ numero: string }>();
  const [facture, setFacture] = useState<Facture | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Utilisation du hook AlertDialog
  const { isOpen, message, title, type, alert, close } = useAlertDialog();

  useEffect(() => {
    if (numero) {
      loadFacture();
    }
  }, [numero]);

  const loadFacture = async () => {
    try {
      setLoading(true);
      const data = await comptabiliteApi.getFacture(parseInt(numero!));
      setFacture(data);
    } catch (error) {
      console.error('Erreur chargement facture:', error);
      alert('Erreur lors du chargement de la facture', {
        type: 'error',
        title: 'Erreur de chargement'
      });
    } finally {
      setLoading(false);
    }
  };

  const validerFacture = async () => {
    if (!facture || !facture.numero_facture) return;

    try {
      setValidating(true);
      await comptabiliteApi.validerFacture(facture.numero_facture);
      
      alert('Facture validée avec succès!', {
        type: 'success',
        title: 'Succès'
      });
      
      // Recharger les données
      await loadFacture();
    } catch (error: any) {
      console.error('Erreur validation:', error);
      alert(`Erreur lors de la validation: ${error.message}`, {
        type: 'error',
        title: 'Erreur'
      });
    } finally {
      setValidating(false);
    }
  };

  const annulerFacture = async () => {
    if (!facture || !facture.numero_facture) return;

    // Utilisation de confirm natif pour la confirmation d'annulation
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette facture ? Cette action est irréversible.')) {
      return;
    }

    try {
      setCancelling(true);
      // Ici vous devriez avoir une fonction annulerFacture dans votre API
      // Pour l'instant, on va simuler avec updateFacture
      await comptabiliteApi.updateFacture(facture.numero_facture, {
        ...facture,
        statut: 'annulee'
      });
      
      alert('Facture annulée avec succès!', {
        type: 'success',
        title: 'Succès'
      });
      
      await loadFacture();
    } catch (error: any) {
      console.error('Erreur annulation:', error);
      alert(`Erreur lors de l'annulation: ${error.message}`, {
        type: 'error',
        title: 'Erreur'
      });
    } finally {
      setCancelling(false);
    }
  };

  const imprimerFacture = () => {
    window.print();
  };

  const getDeviseSymbol = (devise: string = 'MGA') => {
    const symbols: { [key: string]: string } = {
      'MGA': 'Ar',
      'USD': '$',
      'EUR': '€'
    };
    return symbols[devise] || devise;
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

  const getStatutIcon = (statut: string) => {
    const icons = {
      validee: FaCheckCircle,
      brouillon: FaClock,
      annulee: FaBan,
      partiellement_payee: FaPercentage,
      payee: FaCheckCircle,
      en_retard: FaExclamationTriangle,
      non_payee: FaClock
    };
    return icons[statut as keyof typeof icons] || FaClock;
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      facture: 'Facture',
      proforma: 'Proforma',
      avoir: 'Avoir'
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      facture: FaFileInvoiceDollar,
      proforma: FaFilePdf,
      avoir: FaFileInvoiceDollar
    };
    return icons[type as keyof typeof icons] || FaFileInvoiceDollar;
  };

  const getPaiementLabel = (typePaiement: string = 'comptant') => {
    const labels: { [key: string]: string } = {
      comptant: 'Comptant',
      flexible: 'Flexible',
      acompte: 'Acompte',
      echeance: 'Échéance'
    };
    return labels[typePaiement] || typePaiement;
  };

  const getPaiementIcon = (typePaiement: string = 'comptant') => {
    const icons = {
      comptant: FaCreditCard,
      flexible: FaMoneyBillWave,
      acompte: FaMoneyBillWave,
      echeance: FaCalendarAlt
    };
    return icons[typePaiement as keyof typeof icons] || FaCreditCard;
  };

  // Calculer la progression du paiement
  const calculerProgressionPaiement = () => {
    if (!facture?.total_ttc || facture.total_ttc === 0) return 0;
    const paye = facture.montant_paye || 0;
    return Math.min(100, (paye / facture.total_ttc) * 100);
  };

  // Calculer les jours restants
  const getJoursRestants = (): number | null => {
    if (!facture?.date_finale_paiement || facture.statut === 'payee') return null;
    const dateFinale = new Date(facture.date_finale_paiement);
    const aujourdhui = new Date();
    const diffTime = dateFinale.getTime() - aujourdhui.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="sage-detail-loading">
        <div className="sage-loading-spinner"></div>
        <div className="sage-loading-text">Chargement de la facture...</div>
      </div>
    );
  }

  if (!facture) {
    return (
      <div className="sage-detail-error">
        <div className="sage-error-icon">
          <FaTimes />
        </div>
        <div className="sage-error-title">Facture non trouvée</div>
        <p className="sage-error-description">
          La facture que vous recherchez n'existe pas ou a été supprimée.
        </p>
        <Link to="/comptabilite/factures" className="sage-button sage-button-secondary">
          <FaArrowLeft className="sage-button-icon" />
          Retour à la liste des factures
        </Link>
      </div>
    );
  }

  const ENTREPRISE_INFO = {
    nom: 'OMNISERVE EXPERTS',
    adresse: '2239 Ambodisaina Ivondro Tamatave',
    telephone: '+261 32 77 531 69',
    email: 'contact@omniserve.experts'
  };

  const progressionPaiement = calculerProgressionPaiement();
  const joursRestants = getJoursRestants();
  const deviseSymbol = getDeviseSymbol(facture.devise);
  const StatutIcon = getStatutIcon(facture.statut);
  const TypeIcon = getTypeIcon(facture.type_facture);
  const PaiementIcon = getPaiementIcon(facture.type_paiement);

  return (
    <div className="sage-detail-page">
      {/* En-tête de page */}
      <div className="sage-detail-header">
        <div className="sage-header-left">
          <FaFileInvoiceDollar className="sage-header-icon" />
          <div>
            <h1 className="sage-detail-title">
              {getTypeLabel(facture.type_facture)} #{facture.numero_facture}
            </h1>
            <p className="sage-detail-subtitle">
              Détail du document
            </p>
          </div>
        </div>
        
        <div className="sage-detail-actions">
          <Link
            to="/comptabilite/factures"
            className="sage-button sage-button-secondary"
          >
            <FaArrowLeft className="sage-button-icon" />
            Retour
          </Link>

          {/* Bouton d'export PDF */}
          <ExportPDFButton
            type="facture"
            data={facture}
            label="Exporter PDF"
            className="sage-button sage-button-export"
            options={{
              filename: `${facture.type_facture}_${facture.numero_facture}.pdf`,
              title: `${getTypeLabel(facture.type_facture)} ${facture.numero_facture}`,
              includeHeader: true,
              includeFooter: true
            }}
          />

          <ExportExcelButton
            type='facture'
            data={facture}
            label='Exporter Excel'
            className="sage-button sage-button-export"
            options={{
              filename: `${facture.type_facture}_${facture.numero_facture}.xlsx`,
              includeHeader: true
            }}
          />
          
          {facture.statut === 'brouillon' && (
            <button
              onClick={validerFacture}
              disabled={validating}
              className="sage-button sage-button-success"
            >
              {validating ? (
                <>
                  <div className="sage-button-spinner"></div>
                  Validation...
                </>
              ) : (
                <>
                  <FaCheck className="sage-button-icon" />
                  Valider
                </>
              )}
            </button>
          )}
          
          {(facture.statut === 'validee' || facture.statut === 'partiellement_payee') && (
            <button
              onClick={imprimerFacture}
              className="sage-button sage-button-secondary"
            >
              <FaPrint className="sage-button-icon" />
              Imprimer
            </button>
          )}
          
          {(facture.statut === 'validee' || facture.statut === 'brouillon') && (
            <button
              onClick={annulerFacture}
              disabled={cancelling}
              className="sage-button sage-button-danger"
            >
              {cancelling ? (
                <>
                  <div className="sage-button-spinner"></div>
                  Annulation...
                </>
              ) : (
                <>
                  <FaTimes className="sage-button-icon" />
                  Annuler
                </>
              )}
            </button>
          )}
          
          {facture.statut === 'brouillon' && (
            <Link
              to={`/comptabilite/factures/${facture.numero_facture}/edit`}
              className="sage-button sage-button-primary"
            >
              <FaEdit className="sage-button-icon" />
              Modifier
            </Link>
          )}
        </div>
      </div>

      {/* Informations principales */}
      <div className="sage-detail-grid">
        {/* Carte Entreprise */}
        <div className="sage-card sage-entreprise-card">
          <div className="sage-card-header">
            <FaBuilding className="sage-card-icon" />
            <h3 className="sage-card-title">Entreprise</h3>
          </div>
          <div className="sage-card-content">
            <div className="sage-entreprise-name">{ENTREPRISE_INFO.nom}</div>
            <div className="sage-entreprise-details">
              <div className="sage-detail-item">
                <FaBuilding className="sage-detail-icon" />
                <span>{ENTREPRISE_INFO.adresse}</span>
              </div>
              <div className="sage-detail-item">
                <FaCreditCard className="sage-detail-icon" />
                <span>{ENTREPRISE_INFO.telephone}</span>
              </div>
              <div className="sage-detail-item">
                <FaCreditCard className="sage-detail-icon" />
                <span>{ENTREPRISE_INFO.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Carte Client */}
        <div className="sage-card sage-client-card">
          <div className="sage-card-header">
            <FaUser className="sage-card-icon" />
            <h3 className="sage-card-title">{facture.nom_tiers}</h3>
          </div>
          <div className="sage-card-content">
            <div className="sage-client-type">
              <span className="sage-badge sage-badge-tiers">
                {facture.type_tiers}
              </span>
            </div>
            <div className="sage-client-details">
              <div className="sage-detail-item">
                <FaBuilding className="sage-detail-icon" />
                <span>{facture.adresse}</span>
              </div>
              <div className="sage-detail-item">
                <FaCreditCard className="sage-detail-icon" />
                <span>{facture.telephone}</span>
              </div>
              <div className="sage-detail-item">
                <FaCreditCard className="sage-detail-icon" />
                <span>{facture.email}</span>
              </div>
              {facture.devise && facture.devise !== 'MGA' && (
                <div className="sage-detail-item">
                  <FaDollarSign className="sage-detail-icon" />
                  <span>Devise: {facture.devise}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Carte Métadonnées */}
        <div className="sage-card sage-metadata-card">
          <div className="sage-card-header">
            <TypeIcon className="sage-card-icon" />
            <h3 className="sage-card-title">Informations du document</h3>
          </div>
          <div className="sage-card-content sage-metadata-grid">
            <div className="sage-metadata-item">
              <div className="sage-metadata-label">Numéro complet</div>
              <div className="sage-metadata-value sage-document-number-complet">
                {facture.numero_complet || `INV/${facture.numero_facture}/XXXX`}
              </div>
            </div>
            <div className="sage-metadata-item">
              <div className="sage-metadata-label">Numéro</div>
              <div className="sage-metadata-value sage-document-number">
                #{facture.numero_facture}
              </div>
            </div>
            <div className="sage-metadata-item">
              <div className="sage-metadata-label">Date</div>
              <div className="sage-metadata-value">
                <FaCalendarAlt className="sage-value-icon" />
                {new Date(facture.date).toLocaleDateString('fr-FR')}
              </div>
            </div>
            <div className="sage-metadata-item">
              <div className="sage-metadata-label">Échéance</div>
              <div className="sage-metadata-value">
                <FaCalendarAlt className="sage-value-icon" />
                {new Date(facture.echeance).toLocaleDateString('fr-FR')}
              </div>
            </div>
            <div className="sage-metadata-item">
              <div className="sage-metadata-label">Type</div>
              <div className="sage-metadata-value">
                <span className="sage-badge sage-badge-type">
                  <TypeIcon className="sage-badge-icon" />
                  {getTypeLabel(facture.type_facture)}
                </span>
              </div>
            </div>
            <div className="sage-metadata-item">
              <div className="sage-metadata-label">Statut</div>
              <div className="sage-metadata-value">
                <span className={`sage-badge sage-badge-${facture.statut}`}>
                  <StatutIcon className="sage-badge-icon" />
                  {getStatutLabel(facture.statut)}
                </span>
              </div>
            </div>
            <div className="sage-metadata-item">
              <div className="sage-metadata-label">Règlement</div>
              <div className="sage-metadata-value">
                <FaCreditCard className="sage-value-icon" />
                {facture.reglement}
              </div>
            </div>
            <div className="sage-metadata-item">
              <div className="sage-metadata-label">Type Paiement</div>
              <div className="sage-metadata-value">
                <span className={`sage-badge sage-badge-paiement-${facture.type_paiement}`}>
                  <PaiementIcon className="sage-badge-icon" />
                  {getPaiementLabel(facture.type_paiement)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Information Paiement */}
      {(facture.type_paiement && facture.type_paiement !== 'comptant') && (
        <div className="sage-card sage-paiement-section">
          <div className="sage-card-header">
            <FaMoneyBillWave className="sage-card-icon" />
            <h3 className="sage-card-title">Informations de Paiement</h3>
          </div>
          <div className="sage-card-content sage-paiement-content">
            <div className="sage-paiement-grid">
              <div className="sage-paiement-info">
                <div className="sage-paiement-item">
                  <div className="sage-paiement-label">
                    <PaiementIcon className="sage-paiement-icon" />
                    Type de paiement
                  </div>
                  <div className="sage-paiement-value">
                    {getPaiementLabel(facture.type_paiement)}
                  </div>
                </div>
                
                {facture.date_finale_paiement && (
                  <div className="sage-paiement-item">
                    <div className="sage-paiement-label">
                      <FaCalendarAlt className="sage-paiement-icon" />
                      Date finale
                    </div>
                    <div className="sage-paiement-value">
                      {new Date(facture.date_finale_paiement).toLocaleDateString('fr-FR')}
                      {joursRestants !== null && (
                        <span className={`sage-jours-restants ${joursRestants < 0 ? 'retard' : joursRestants < 7 ? 'warning' : 'normal'}`}>
                          {joursRestants < 0 ? `${Math.abs(joursRestants)}j de retard` : `${joursRestants}j restant`}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {facture.montant_minimum_paiement && facture.montant_minimum_paiement > 0 && (
                  <div className="sage-paiement-item">
                    <div className="sage-paiement-label">
                      <FaMoneyBillWave className="sage-paiement-icon" />
                      Minimum par paiement
                    </div>
                    <div className="sage-paiement-value">
                      {facture.montant_minimum_paiement.toLocaleString('fr-FR')} {deviseSymbol}
                    </div>
                  </div>
                )}

                {facture.montant_acompte && facture.montant_acompte > 0 && (
                  <div className="sage-paiement-item">
                    <div className="sage-paiement-label">
                      <FaPercentage className="sage-paiement-icon" />
                      Acompte
                    </div>
                    <div className="sage-paiement-value">
                      {facture.montant_acompte.toLocaleString('fr-FR')} {deviseSymbol}
                      {facture.total_ttc && (
                        <span className="sage-pourcentage">
                          ({(facture.montant_acompte / facture.total_ttc * 100).toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {facture.penalite_retard && facture.penalite_retard > 0 && (
                  <div className="sage-paiement-item">
                    <div className="sage-paiement-label">
                      <FaExclamationTriangle className="sage-paiement-icon" />
                      Pénalité retard
                    </div>
                    <div className="sage-paiement-value">
                      {facture.penalite_retard}%
                    </div>
                  </div>
                )}
              </div>

              {/* Barre de progression du paiement */}
              {(facture.montant_paye || 0) > 0 && (
                <div className="sage-progression-section">
                  <div className="sage-progression-header">
                    <span>Progression du paiement</span>
                    <span className="sage-progression-percentage">
                      {progressionPaiement.toFixed(0)}%
                    </span>
                  </div>
                  <div className="sage-progression-bar">
                    <div 
                      className={`sage-progression-fill ${progressionPaiement === 100 ? 'complete' : progressionPaiement > 0 ? 'partial' : 'empty'}`}
                      style={{ width: `${progressionPaiement}%` }}
                    />
                  </div>
                  <div className="sage-progression-details">
                    <div className="sage-progression-detail">
                      <span className="sage-detail-label">Payé:</span>
                      <span className="sage-detail-value paye">
                        {(facture.montant_paye || 0).toLocaleString('fr-FR')} {deviseSymbol}
                      </span>
                    </div>
                    <div className="sage-progression-detail">
                      <span className="sage-detail-label">Reste:</span>
                      <span className="sage-detail-value restant">
                        {(facture.montant_restant || facture.total_ttc || 0).toLocaleString('fr-FR')} {deviseSymbol}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Section Articles */}
      <div className="sage-card sage-articles-section">
        <div className="sage-card-header">
          <FaShoppingCart className="sage-card-icon" />
          <h3 className="sage-card-title">Articles et Services</h3>
        </div>
        <div className="sage-card-content">
          <div className="sage-table-container">
            <table className="sage-table">
              <thead>
                <tr>
                  <th className="sage-table-header">
                    <FaCreditCard className="sage-table-icon" />
                    Référence
                  </th>
                  <th className="sage-table-header">
                    <FaStickyNote className="sage-table-icon" />
                    Description
                  </th>
                  <th className="sage-table-header">
                    <FaCalculator className="sage-table-icon" />
                    Quantité
                  </th>
                  <th className="sage-table-header">
                    <FaDollarSign className="sage-table-icon" />
                    Prix Unitaire
                  </th>
                  <th className="sage-table-header">
                    <FaPercentage className="sage-table-icon" />
                    Remise
                  </th>
                  <th className="sage-table-header">
                    <FaPercentage className="sage-table-icon" />
                    TVA
                  </th>
                  <th className="sage-table-header">
                    <FaMoneyBillWave className="sage-table-icon" />
                    Montant HT
                  </th>
                  <th className="sage-table-header">
                    <FaMoneyBillWave className="sage-table-icon" />
                    Montant TVA
                  </th>
                  <th className="sage-table-header">
                    <FaMoneyBillWave className="sage-table-icon" />
                    Montant TTC
                  </th>
                </tr>
              </thead>
              <tbody>
                {facture.lignes && facture.lignes.length > 0 ? (
                  facture.lignes.map((ligne, index) => (
                    <tr key={index} className="sage-table-row">
                      <td className="sage-table-cell sage-cell-reference">
                        <code>{ligne.code_article}</code>
                      </td>
                      <td className="sage-table-cell sage-cell-description">
                        {ligne.description}
                      </td>
                      <td className="sage-table-cell sage-cell-quantity">
                        {ligne.quantite}
                      </td>
                      <td className="sage-table-cell sage-cell-price">
                        {ligne.prix_unitaire.toLocaleString('fr-FR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} {deviseSymbol}
                      </td>
                      <td className="sage-table-cell sage-cell-discount">
                        {ligne.remise > 0 ? (
                          <span className="sage-discount-badge">
                            {ligne.remise}%
                          </span>
                        ) : '-'}
                      </td>
                      <td className="sage-table-cell sage-cell-tva">
                        {ligne.taux_tva}%
                      </td>
                      <td className="sage-table-cell sage-cell-amount">
                        {ligne.montant_ht?.toLocaleString('fr-FR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} {deviseSymbol}
                      </td>
                      <td className="sage-table-cell sage-cell-amount">
                        {ligne.montant_tva?.toLocaleString('fr-FR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} {deviseSymbol}
                      </td>
                      <td className="sage-table-cell sage-cell-amount">
                        {ligne.montant_ttc?.toLocaleString('fr-FR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} {deviseSymbol}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="sage-table-empty">
                      <FaShoppingCart className="sage-empty-icon" />
                      Aucun article dans cette facture
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section Totaux */}
      <div className="sage-card sage-totals-section">
        <div className="sage-card-header">
          <FaCalculator className="sage-card-icon" />
          <h3 className="sage-card-title">Totaux</h3>
        </div>
        <div className="sage-card-content">
          <div className="sage-totals-grid">
            <div className="sage-totals-left">
              <div className="sage-total-group">
                <div className="sage-total-row">
                  <span className="sage-total-label">Total HT:</span>
                  <span className="sage-total-value">
                    {facture.total_ht?.toLocaleString('fr-FR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} {deviseSymbol}
                  </span>
                </div>
                <div className="sage-total-row">
                  <span className="sage-total-label">Total TVA:</span>
                  <span className="sage-total-value">
                    {facture.total_tva?.toLocaleString('fr-FR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} {deviseSymbol}
                  </span>
                </div>
                <div className="sage-total-row sage-total-ttc">
                  <span className="sage-total-label">Total TTC:</span>
                  <span className="sage-total-value">
                    {facture.total_ttc?.toLocaleString('fr-FR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} {deviseSymbol}
                  </span>
                </div>

                {(facture.montant_paye || 0) > 0 && (
                  <>
                    <div className="sage-total-row">
                      <span className="sage-total-label">Montant payé:</span>
                      <span className="sage-total-value sage-amount-paid">
                        {(facture.montant_paye || 0).toLocaleString('fr-FR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} {deviseSymbol}
                      </span>
                    </div>
                    <div className="sage-total-row">
                      <span className="sage-total-label">Montant restant:</span>
                      <span className="sage-total-value sage-amount-remaining">
                        {(facture.montant_restant || facture.total_ttc || 0).toLocaleString('fr-FR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} {deviseSymbol}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="sage-totals-right">
              <div className="sage-paiement-info">
                <div className="sage-paiement-summary">
                  <div className="sage-paiement-item">
                    <FaCreditCard className="sage-paiement-item-icon" />
                    <div>
                      <div className="sage-paiement-item-label">Mode de règlement</div>
                      <div className="sage-paiement-item-value">{facture.reglement}</div>
                    </div>
                  </div>
                  <div className="sage-paiement-item">
                    <PaiementIcon className="sage-paiement-item-icon" />
                    <div>
                      <div className="sage-paiement-item-label">Type de paiement</div>
                      <div className="sage-paiement-item-value">{getPaiementLabel(facture.type_paiement)}</div>
                    </div>
                  </div>
                  <div className="sage-paiement-item">
                    <FaCalendarAlt className="sage-paiement-item-icon" />
                    <div>
                      <div className="sage-paiement-item-label">Échéance</div>
                      <div className="sage-paiement-item-value">
                        {new Date(facture.echeance).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  {facture.devise && facture.devise !== 'MGA' && facture.taux_change && (
                    <div className="sage-paiement-item">
                      <FaExchangeAlt className="sage-paiement-item-icon" />
                      <div>
                        <div className="sage-paiement-item-label">Taux de change</div>
                        <div className="sage-paiement-item-value">
                          1 {facture.devise} = {facture.taux_change} MGA
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {facture.statut === 'validee' && (
                  <div className="sage-merci">
                    <div className="sage-merci-text">
                      <FaCheckCircle className="sage-merci-icon" />
                      <div>
                        <p className="sage-merci-title">Nous vous remercions de votre confiance</p>
                        <p className="sage-merci-subtitle">Cordialement</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informations supplémentaires */}
      <div className="sage-card sage-footer-section">
        <div className="sage-card-header">
          <FaHistory className="sage-card-icon" />
          <h3 className="sage-card-title">Informations supplémentaires</h3>
        </div>
        <div className="sage-card-content sage-footer-content">
          <div className="sage-footer-notes">
            <div className="sage-footer-item">
              <FaStickyNote className="sage-footer-icon" />
              <div>
                <div className="sage-footer-label">Notes</div>
                <div className="sage-footer-value">
                  {facture.notes || "Aucune note particulière"}
                </div>
              </div>
            </div>
          </div>
          
          <div className="sage-footer-timestamps">
            <div className="sage-timestamp">
              <div className="sage-timestamp-label">Créée le</div>
              <div className="sage-timestamp-value">
                {facture.created_at ? new Date(facture.created_at).toLocaleString('fr-FR') : 'N/A'}
              </div>
            </div>
            <div className="sage-timestamp">
              <div className="sage-timestamp-label">Modifiée le</div>
              <div className="sage-timestamp-value">
                {facture.updated_at ? new Date(facture.updated_at).toLocaleString('fr-FR') : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Composant AlertDialog */}
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

export default FactureDetailPage;