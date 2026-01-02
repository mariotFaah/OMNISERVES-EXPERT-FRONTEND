// src/modules/comptabilite/pages/SuiviPaiementsPage.tsx
import React, { useState, useEffect } from 'react';
import type { Facture, Paiement } from '../types';
import { comptabiliteApi } from '../services/api';
import { paiementApi } from '../services/paiementApi';
import { useAlertDialog } from '../../../core/hooks/useAlertDialog';
import AlertDialog from '../../../core/components/AlertDialog/AlertDialog';
import './SuiviPaiementsPage.css';
import { CompleterPaiementModal } from '../components/CompleterPaiementModal';
import { AppelTelephoniqueModal } from '../components/AppelTelephoniqueModal';
import { emailApi } from '../services/emailApi';
import { 
  FiAlertCircle, 
  FiClock, 
  FiPieChart, 
  FiTrendingUp,
  FiCalendar,
  FiMail,
  FiPhone,
  FiCheckCircle,
  //FiDollarSign
} from 'react-icons/fi';
import { 
  MdOutlinePayment,
  MdOutlineSchedule,
  MdOutlineWarningAmber,
} from 'react-icons/md';

export const SuiviPaiementsPage: React.FC = () => {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);
  const [vueActive, setVueActive] = useState<'echeances' | 'partiels' | 'retards' | 'flexibles'>('echeances');
  const [periode, setPeriode] = useState<'7jours' | '30jours' | '90jours'>('7jours');
  const [modalPaiement, setModalPaiement] = useState<{
    isOpen: boolean;
    facture: Facture | null;
  }>({
    isOpen: false,
    facture: null
  });

  // État pour la modal d'appel téléphonique
  const [modalAppel, setModalAppel] = useState<{
    isOpen: boolean;
    facture: Facture | null;
  }>({
    isOpen: false,
    facture: null
  });

  const { isOpen, message, title, type, alert, close } = useAlertDialog();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [facturesData, paiementsData] = await Promise.all([
        comptabiliteApi.getFactures(),
        paiementApi.getPaiements()
      ]);
      
      setFactures(facturesData);
      setPaiements(paiementsData);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      alert('Erreur lors du chargement des données', {
        type: 'error',
        title: 'Erreur'
      });
    } finally {
      setLoading(false);
    }
  };

  // 🎯 FONCTIONS POUR LES BOUTONS - VERSION CORRIGÉE
  const handleRelancer = async (facture: Facture) => {
    try {
      const result = await emailApi.envoyerRelance(facture, 
        `Rappel concernant votre facture #${facture.numero_facture}. Merci de régulariser votre situation.`
      );
      
      alert(result.message, {
        type: 'success',
        title: 'Relance envoyée'
      });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erreur inconnue lors de l\'envoi de la relance';
      
      alert(`Erreur lors de l'envoi de la relance: ${errorMessage}`, {
        type: 'error',
        title: 'Erreur'
      });
    }
  };

  // 🎯 FONCTION APPEL TELEPHONIQUE
  const handleAppeler = (facture: Facture) => {
    setModalAppel({
      isOpen: true,
      facture
    });
  };

  // Fonction pour fermer la modal d'appel
  const fermerModalAppel = () => {
    setModalAppel({
      isOpen: false,
      facture: null
    });
  };

  // Fonction appelée quand l'appel est réussi
  const handleAppelReussi = () => {
    alert('Appel téléphonique enregistré avec succès !', {
      type: 'success',
      title: 'Appel réussi'
    });
  };

  const handleRappelFlexible = async (facture: Facture) => {
    try {
      const result = await emailApi.envoyerRelance(facture,
        `Rappel pour votre paiement flexible. Prochaine échéance: ${facture.date_finale_paiement ? new Date(facture.date_finale_paiement).toLocaleDateString('fr-FR') : 'Non définie'}. Montant minimum: ${formaterMontant(facture.montant_minimum_paiement)} MGA.`
      );
      
      alert(result.message, {
        type: 'success',
        title: 'Rappel flexible envoyé'
      });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erreur inconnue lors de l\'envoi du rappel';
      
      alert(`Erreur lors de l'envoi du rappel: ${errorMessage}`, {
        type: 'error',
        title: 'Erreur'
      });
    }
  };

  // 🎯 FONCTIONS MODAL
  const ouvrirModalPaiement = (facture: Facture) => {
    setModalPaiement({
      isOpen: true,
      facture
    });
  };

  const fermerModalPaiement = () => {
    setModalPaiement({
      isOpen: false,
      facture: null
    });
  };

  const handlePaiementComplete = () => {
    loadData();
  };

  // 🎯 CALCUL DES JOURS RESTANTS/RETARD
  const getJoursDifference = (dateLimite: string | null | undefined): number => {
    if (!dateLimite) return 999;
    const now = new Date();
    const limite = new Date(dateLimite);
    return Math.floor((limite.getTime() - now.getTime()) / (1000 * 3600 * 24));
  };

  // 🎯 FILTRES INTELLIGENTS
  const getFacturesAvecEcheance = () => {
    const aujourdhui = new Date();
    const periodeMs = {
      '7jours': 7 * 24 * 3600 * 1000,
      '30jours': 30 * 24 * 3600 * 1000,
      '90jours': 90 * 24 * 3600 * 1000
    }[periode];

    const dateLimite = new Date(aujourdhui.getTime() + periodeMs);

    return factures.filter(facture => {
      if (!facture.date_finale_paiement) return false;
      if (facture.statut_paiement === 'payee') return false;
      
      const dateEcheance = new Date(facture.date_finale_paiement);
      return dateEcheance <= dateLimite && dateEcheance >= aujourdhui;
    }).sort((a, b) => {
      const joursA = getJoursDifference(a.date_finale_paiement);
      const joursB = getJoursDifference(b.date_finale_paiement);
      return joursA - joursB;
    });
  };

  const getFacturesPartiellementPayees = () => {
    return factures.filter(facture => 
      facture.statut_paiement === 'partiellement_payee' &&
      (facture.montant_restant || 0) > 0
    ).sort((a, b) => {
      const ratioA = (a.montant_paye || 0) / (a.total_ttc || 1);
      const ratioB = (b.montant_paye || 0) / (b.total_ttc || 1);
      return ratioA - ratioB;
    });
  };

  const getFacturesEnRetard = () => {
    return factures.filter(facture => {
      const joursRestants = getJoursDifference(facture.date_finale_paiement);
      return joursRestants < 0 && facture.statut_paiement !== 'payee';
    }).sort((a, b) => {
      const retardA = getJoursDifference(a.date_finale_paiement);
      const retardB = getJoursDifference(b.date_finale_paiement);
      return retardA - retardB;
    });
  };

  // 🆕 SUIVI DES PAIEMENTS FLEXIBLES
  const getFacturesFlexiblesEnCours = () => {
    return factures.filter(facture => 
      facture.type_paiement === 'flexible' && 
      facture.statut_paiement !== 'payee' &&
      facture.date_finale_paiement
    ).sort((a, b) => {
      const joursA = getJoursDifference(a.date_finale_paiement);
      const joursB = getJoursDifference(b.date_finale_paiement);
      return joursA - joursB;
    });
  };

  // 🎯 CALCULS MÉTRIQUES
  /*const getMontantTotalEnRisque = () => {
    const facturesRisque = [...getFacturesAvecEcheance(), ...getFacturesEnRetard()];
    return facturesRisque.reduce((total, facture) => total + (facture.montant_restant || 0), 0);
  };*/

  const getProchainPaiement = () => {
    const echeances = getFacturesAvecEcheance();
    if (echeances.length === 0) return null;
    return echeances[0];
  };

  const getPlusGrosRetard = () => {
    const retards = getFacturesEnRetard();
    if (retards.length === 0) return null;
    return retards[0];
  };

  // 🆕 MÉTRIQUES FLEXIBLES
  const getPerformanceFlexible = () => {
    const flexibles = factures.filter(f => f.type_paiement === 'flexible');
    const flexiblesPayes = flexibles.filter(f => f.statut_paiement === 'payee');
    
    return {
      total: flexibles.length,
      payes: flexiblesPayes.length,
      tauxReussite: flexibles.length > 0 ? (flexiblesPayes.length / flexibles.length) * 100 : 0
    };
  };

  // 🎯 FONCTIONS D'AFFICHAGE
  const getCouleurUrgence = (jours: number) => {
    if (jours < 0) return 'urgence-critique';
    if (jours <= 3) return 'urgence-elevee';
    if (jours <= 7) return 'urgence-moyenne';
    return 'urgence-faible';
  };

  const getIconeStatut = (jours: number) => {
    if (jours < 0) return <MdOutlineWarningAmber className="icone-statut critique" />;
    if (jours <= 3) return <FiAlertCircle className="icone-statut eleve" />;
    if (jours <= 7) return <FiClock className="icone-statut moyen" />;
    return <FiCheckCircle className="icone-statut faible" />;
  };

  const getPourcentagePaye = (facture: Facture): number => {
    const total = facture.total_ttc || 1;
    const paye = facture.montant_paye || 0;
    return (paye / total) * 100;
  };

  const formaterMontant = (montant: number | undefined) => {
    return (montant || 0).toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // 🎯 RENDU CONDITIONNEL
  const renderTableauEcheances = () => {
    const facturesEcheance = getFacturesAvecEcheance();

    return (
      <div className="suivi-tableau">
        <div className="suivi-tableau-header">
          <h3>
            <FiCalendar className="tableau-icone" />
            Échéances à venir ({facturesEcheance.length})
          </h3>
          <div className="filtres-periode">
            {[
              { key: '7jours', label: '7 jours' },
              { key: '30jours', label: '30 jours' },
              { key: '90jours', label: '90 jours' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPeriode(key as any)}
                className={`periode-btn ${periode === key ? 'active' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <table className="suivi-table">
          <thead>
            <tr>
              <th>Échéance</th>
              <th>Facture/Client</th>
              <th>Montant dû</th>
              <th>Type Paiement</th>
              <th>Jours restants</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {facturesEcheance.map((facture) => {
              const joursRestants = getJoursDifference(facture.date_finale_paiement);
              
              return (
                <tr key={facture.numero_facture} className={getCouleurUrgence(joursRestants)}>
                  <td>
                    <div className="cell-echeance">
                      {getIconeStatut(joursRestants)}
                      <strong>
                        {facture.date_finale_paiement 
                          ? new Date(facture.date_finale_paiement).toLocaleDateString('fr-FR')
                          : 'Non définie'
                        }
                      </strong>
                    </div>
                  </td>
                  <td>
                    <div className="cell-client">
                      <div className="nom-client">{facture.nom_tiers || 'Client inconnu'}</div>
                      <div className="numero-facture">Facture #{facture.numero_facture}</div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-montant">
                      <strong>{formaterMontant(facture.montant_restant)} MGA</strong>
                      <div className="montant-total">
                        sur {formaterMontant(facture.total_ttc)} MGA
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge-type ${facture.type_paiement}`}>
                      {facture.type_paiement}
                    </span>
                  </td>
                  <td>
                    <div className={`cell-jours ${getCouleurUrgence(joursRestants)}`}>
                      {joursRestants < 0 ? `+${Math.abs(joursRestants)}j retard` : `${joursRestants}j`}
                    </div>
                  </td>
                  <td>
                    <div className="cell-actions">
                      <button 
                        onClick={() => ouvrirModalPaiement(facture)}
                        className="btn-completer"
                      >
                        <MdOutlinePayment className="btn-icone" />
                        Compléter
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {facturesEcheance.length === 0 && (
          <div className="aucune-donnee">
            Aucune échéance dans les {periode === '7jours' ? '7' : periode === '30jours' ? '30' : '90'} prochains jours
          </div>
        )}
      </div>
    );
  };

  const renderTableauPartiels = () => {
    const facturesPartielles = getFacturesPartiellementPayees();

    return (
      <div className="suivi-tableau">
        <h3>
          <FiPieChart className="tableau-icone" />
          Paiements partiels ({facturesPartielles.length})
        </h3>
        
        <table className="suivi-table">
          <thead>
            <tr>
              <th>Facture/Client</th>
              <th>Progression</th>
              <th>Montants</th>
              <th>Dernier paiement</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {facturesPartielles.map((facture) => {
              const pourcentage = getPourcentagePaye(facture);
              const dernierPaiement = paiements
                .filter(p => p.numero_facture === facture.numero_facture)
                .sort((a, b) => new Date(b.date_paiement).getTime() - new Date(a.date_paiement).getTime())[0];

              return (
                <tr key={facture.numero_facture}>
                  <td>
                    <div className="cell-client">
                      <div className="nom-client">{facture.nom_tiers || 'Client inconnu'}</div>
                      <div className="numero-facture">Facture #{facture.numero_facture}</div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-progression">
                      <div className="barre-progression">
                        <div 
                          className="progression-remplie"
                          style={{ width: `${pourcentage}%` }}
                        ></div>
                      </div>
                      <div className="pourcentage">{pourcentage.toFixed(1)}%</div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-montants">
                      <div className="montant-paye">
                        Payé: <strong>{formaterMontant(facture.montant_paye)} MGA</strong>
                      </div>
                      <div className="montant-restant">
                        Reste: <strong>{formaterMontant(facture.montant_restant)} MGA</strong>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-dernier-paiement">
                      {dernierPaiement ? (
                        <>
                          {new Date(dernierPaiement.date_paiement).toLocaleDateString('fr-FR')}
                          <div className="montant-paiement">
                            {formaterMontant(dernierPaiement.montant)} MGA
                          </div>
                        </>
                      ) : (
                        <span className="aucun-paiement">Aucun paiement</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="cell-actions">
                      <button 
                        onClick={() => ouvrirModalPaiement(facture)}
                        className="btn-completer"
                      >
                        <MdOutlinePayment className="btn-icone" />
                        Compléter
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {facturesPartielles.length === 0 && (
          <div className="aucune-donnee">
            Aucun paiement partiel en cours
          </div>
        )}
      </div>
    );
  };

  const renderTableauRetards = () => {
    const facturesRetard = getFacturesEnRetard();

    return (
      <div className="suivi-tableau">
        <h3>
          <MdOutlineWarningAmber className="tableau-icone" />
          Retards de paiement ({facturesRetard.length})
        </h3>
        
        <table className="suivi-table">
          <thead>
            <tr>
              <th>Facture/Client</th>
              <th>Retard</th>
              <th>Montant dû</th>
              <th>Dernier rappel</th>
              <th>Actions urgentes</th>
            </tr>
          </thead>
          <tbody>
            {facturesRetard.map((facture) => {
              const joursRetard = Math.abs(getJoursDifference(facture.date_finale_paiement));
              
              return (
                <tr key={facture.numero_facture} className="ligne-retard">
                  <td>
                    <div className="cell-client">
                      <div className="nom-client">{facture.nom_tiers || 'Client inconnu'}</div>
                      <div className="numero-facture">Facture #{facture.numero_facture}</div>
                      <div className="type-tiers">{facture.type_tiers}</div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-retard">
                      <div className={`niveau-retard ${joursRetard > 60 ? 'critique' : joursRetard > 30 ? 'eleve' : 'modere'}`}>
                        {joursRetard} jours
                      </div>
                      {joursRetard > 60 && <div className="alerte-critique">CRITIQUE</div>}
                    </div>
                  </td>
                  <td>
                    <div className="cell-montant-retard">
                      <strong>{formaterMontant(facture.montant_restant)} MGA</strong>
                      <div className="echeance-origine">
                        Échéance: {facture.date_finale_paiement 
                          ? new Date(facture.date_finale_paiement).toLocaleDateString('fr-FR')
                          : 'Non définie'
                        }
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-rappel">
                      <div className="dernier-rappel">Jamais relancé</div>
                      <button className="btn-relancer" onClick={() => handleRelancer(facture)}>
                        <FiMail className="btn-icone" />
                        Relancer
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="cell-actions-urgentes">
                      <button className="btn-appeler" onClick={() => handleAppeler(facture)}>
                        <FiPhone className="btn-icone" />
                        Appeler
                      </button>
                      <button 
                        onClick={() => ouvrirModalPaiement(facture)}
                        className="btn-completer"
                      >
                        <MdOutlinePayment className="btn-icone" />
                        Compléter
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {facturesRetard.length === 0 && (
          <div className="aucune-donnee succes">
            Aucun retard de paiement !
          </div>
        )}
      </div>
    );
  };

  // 🆕 TABLEAU DES PAIEMENTS FLEXIBLES
  const renderTableauFlexibles = () => {
    const facturesFlexibles = getFacturesFlexiblesEnCours();
    const performance = getPerformanceFlexible();

    return (
      <div className="suivi-tableau">
        <div className="suivi-tableau-header">
          <h3>
            <FiTrendingUp className="tableau-icone" />
            Paiements flexibles ({facturesFlexibles.length})
          </h3>
          <div className="stats-performance">
            <div className="performance-badge">
              <span className="performance-label">Taux de réussite:</span>
              <span className="performance-value">{performance.tauxReussite.toFixed(1)}%</span>
            </div>
            <div className="performance-badge">
              <span className="performance-label">Payés:</span>
              <span className="performance-value">{performance.payes}/{performance.total}</span>
            </div>
          </div>
        </div>

        <table className="suivi-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Progression</th>
              <th>Montants</th>
              <th>Date limite</th>
              <th>Paiement minimum</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {facturesFlexibles.map((facture) => {
              const pourcentage = getPourcentagePaye(facture);
              const joursRestants = getJoursDifference(facture.date_finale_paiement);
              const dernierPaiement = paiements
                .filter(p => p.numero_facture === facture.numero_facture)
                .sort((a, b) => new Date(b.date_paiement).getTime() - new Date(a.date_paiement).getTime())[0];

              return (
                <tr key={facture.numero_facture} className={getCouleurUrgence(joursRestants)}>
                  <td>
                    <div className="cell-client">
                      <div className="nom-client">{facture.nom_tiers || 'Client inconnu'}</div>
                      <div className="numero-facture">Facture #{facture.numero_facture}</div>
                      <div className="type-flexible">Flexible</div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-progression">
                      <div className="barre-progression">
                        <div 
                          className="progression-remplie"
                          style={{ width: `${pourcentage}%` }}
                        ></div>
                      </div>
                      <div className="pourcentage">{pourcentage.toFixed(1)}%</div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-montants">
                      <div className="montant-paye">
                        Payé: <strong>{formaterMontant(facture.montant_paye)} MGA</strong>
                      </div>
                      <div className="montant-restant">
                        Reste: <strong>{formaterMontant(facture.montant_restant)} MGA</strong>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={`cell-date-limite ${joursRestants <= 7 ? 'urgence-proche' : ''}`}>
                      {facture.date_finale_paiement 
                        ? new Date(facture.date_finale_paiement).toLocaleDateString('fr-FR')
                        : 'Non définie'
                      }
                      <div className="jours-restants">
                        {joursRestants < 0 ? `+${Math.abs(joursRestants)}j retard` : `${joursRestants}j restants`}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-minimum">
                      <strong>{formaterMontant(facture.montant_minimum_paiement)} MGA</strong>
                      {dernierPaiement && (
                        <div className="dernier-paiement-info">
                          Dernier: {formaterMontant(dernierPaiement.montant)} MGA
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="cell-actions">
                      <button 
                        onClick={() => ouvrirModalPaiement(facture)}
                        className="btn-completer"
                      >
                        <MdOutlinePayment className="btn-icone" />
                        Compléter
                      </button>
                      {joursRestants <= 7 && (
                        <button className="btn-rappel-flexible" onClick={() => handleRappelFlexible(facture)}>
                          <MdOutlineSchedule className="btn-icone" />
                          Rappel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {facturesFlexibles.length === 0 && (
          <div className="aucune-donnee">
            Aucun paiement flexible en cours
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="suivi-loading">
        <div className="loading-spinner"></div>
        <div>Chargement du suivi des paiements...</div>
      </div>
    );
  }

  const performanceFlexible = getPerformanceFlexible();

  return (
    <div className="suivi-paiements-page">
      {/* EN-TÊTE AVEC KPIs */}
      <div className="suivi-header">
        <div className="suivi-titre">
          <h1>Suivi des Paiements</h1>
        </div>
        
        <div className="suivi-kpis">
          <div className="kpi-card">
            <div className="kpi-icone">
              <FiCalendar />
            </div>
            <div className="kpi-valeur">{getFacturesAvecEcheance().length}</div>
            <div className="kpi-label">Échéances proches</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icone">
              <FiPieChart />
            </div>
            <div className="kpi-valeur">{getFacturesPartiellementPayees().length}</div>
            <div className="kpi-label">Paiements partiels</div>
          </div>
          <div className="kpi-card kpi-risque">
            <div className="kpi-icone">
              <MdOutlineWarningAmber />
            </div>
            <div className="kpi-valeur">{getFacturesEnRetard().length}</div>
            <div className="kpi-label">En retard</div>
          </div>
          <div className="kpi-card kpi-flexible">
            <div className="kpi-icone">
              <FiTrendingUp />
            </div>
            <div className="kpi-valeur">{getFacturesFlexiblesEnCours().length}</div>
            <div className="kpi-label">Flexibles en cours</div>
            <div className="kpi-sous-titre">
              {performanceFlexible.tauxReussite.toFixed(1)}% de réussite
            </div>
          </div>
          {/*<div className="kpi-card kpi-montant">
            <div className="kpi-icone">
              <FiDollarSign />
            </div>
            <div className="kpi-valeur">{formaterMontant(getMontantTotalEnRisque())}</div>
            <div className="kpi-label">MGA à risque</div>
          </div>*/}
        </div>
      </div>

      {/* SELECTION DE VUE */}
      <div className="suivi-vues">
        {[
          { key: 'echeances', label: 'Échéances', count: getFacturesAvecEcheance().length, icon: FiCalendar },
          { key: 'partiels', label: 'Paiements partiels', count: getFacturesPartiellementPayees().length, icon: FiPieChart },
          { key: 'retards', label: 'Retards', count: getFacturesEnRetard().length, icon: MdOutlineWarningAmber },
          { key: 'flexibles', label: 'Paiements flexibles', count: getFacturesFlexiblesEnCours().length, icon: FiTrendingUp }
        ].map(({ key, label, count, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setVueActive(key as any)}
            className={`vue-btn ${vueActive === key ? 'active' : ''}`}
          >
            <Icon className="vue-btn-icone" />
            {label} <span className="count-badge">{count}</span>
          </button>
        ))}
      </div>

      {/* TABLEAU DYNAMIQUE */}
      <div className="suivi-contenu">
        {vueActive === 'echeances' && renderTableauEcheances()}
        {vueActive === 'partiels' && renderTableauPartiels()}
        {vueActive === 'retards' && renderTableauRetards()}
        {vueActive === 'flexibles' && renderTableauFlexibles()}
      </div>

      {/* ALERTES URGENTES */}
      {(getFacturesEnRetard().length > 0 || getProchainPaiement()) && (
        <div className="alertes-urgentes">
          {getPlusGrosRetard() && (
            <div className="alerte alerte-urgence">
              <div className="alerte-icone">
                <MdOutlineWarningAmber />
              </div>
              <div className="alerte-contenu">
                <strong>Retard critique :</strong> {getPlusGrosRetard()?.nom_tiers} doit {formaterMontant(getPlusGrosRetard()?.montant_restant)} MGA depuis {Math.abs(getJoursDifference(getPlusGrosRetard()?.date_finale_paiement))} jours
              </div>
              <button 
                className="alerte-action"
                onClick={() => {
                  const plusGros = getPlusGrosRetard();
                  if (plusGros) handleAppeler(plusGros);
                }}
              >
                Appeler maintenant
              </button>
            </div>
          )}
          
          {getProchainPaiement() && (
            <div className="alerte alerte-info">
              <div className="alerte-icone">
                <FiClock />
              </div>
              <div className="alerte-contenu">
                <strong>Prochaine échéance :</strong> {getProchainPaiement()?.nom_tiers} - {formaterMontant(getProchainPaiement()?.montant_restant)} MGA dans {getJoursDifference(getProchainPaiement()?.date_finale_paiement)} jours
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de complétion de paiement */}
      {modalPaiement.facture && (
        <CompleterPaiementModal
          facture={modalPaiement.facture}
          isOpen={modalPaiement.isOpen}
          onClose={fermerModalPaiement}
          onPaiementComplete={handlePaiementComplete}
        />
      )}

      {/* Modal d'appel téléphonique */}
      {modalAppel.facture && (
        <AppelTelephoniqueModal
          isOpen={modalAppel.isOpen}
          onClose={fermerModalAppel}
          numero={modalAppel.facture.telephone_tiers || ''}
          nomClient={modalAppel.facture.nom_tiers || ''}
          numeroFacture={modalAppel.facture.numero_facture?.toString() ?? ''}
          montantDu={modalAppel.facture.montant_restant || 0}
          onAppelReussi={handleAppelReussi}
        />
      )}

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

export default SuiviPaiementsPage;