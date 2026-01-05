import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Facture, Tiers } from '../types';
import { comptabiliteApi } from '../services/api';
import { emailApi } from '../services/emailApi';
import { useAlertDialog } from '../../../core/hooks/useAlertDialog';
import AlertDialog from '../../../core/components/AlertDialog/AlertDialog';
import './EcheancesPage.css';

export const EcheancesPage: React.FC = () => {
  const [echeances, setEcheances] = useState<Facture[]>([]);
  const [, setTiers] = useState<Tiers[]>([]);
  const [loading, setLoading] = useState(true);
  const [envoiEnCours, setEnvoiEnCours] = useState<number | null>(null);
  const [envoiGroupeEnCours, setEnvoiGroupeEnCours] = useState(false);
  const [messageConfirmation, setMessageConfirmation] = useState<string>('');

  // Utilisation du hook AlertDialog
  const { isOpen, message, title, type, alert, close } = useAlertDialog();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [facturesData, tiersData] = await Promise.all([
        comptabiliteApi.getFactures(),
        comptabiliteApi.getTiers()
      ]);
      
      // Fusionner les emails des tiers avec les factures
      const echeancesAvecEmails = facturesData.map(facture => {
  const tierCorrespondant = tiersData.find(t => t.nom === facture.nom_tiers);
  const email = tierCorrespondant?.email;
  
  return {
    ...facture,
    email: email === null ? undefined : email
  } as Facture; // Cast explicite
});
      
      const aujourdhui = new Date().toISOString().split('T')[0];
      const echeancesDepassees = echeancesAvecEmails.filter(facture => 
        facture.type_tiers === 'client' &&
        facture.statut === 'validee' && 
        facture.echeance < aujourdhui
      );
      
      setEcheances(echeancesDepassees);
      setTiers(tiersData);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      alert('Erreur lors du chargement des échéances', {
        type: 'error',
        title: 'Erreur de chargement'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculerJoursRetard = (dateEcheance: string): number => {
    const aujourdhui = new Date();
    const echeance = new Date(dateEcheance);
    return Math.floor((aujourdhui.getTime() - echeance.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getNiveauAlerte = (joursRetard: number): string => {
    if (joursRetard > 180) return 'critique';
    if (joursRetard > 90) return 'grave';
    if (joursRetard > 30) return 'eleve';
    return 'modere';
  };

  // FONCTION RELANCE INDIVIDUELLE - Confirmation
  const handleRelanceClient = async (facture: Facture) => {
    if (!facture.email) {
      alert(`Aucun email trouvé pour ${facture.nom_tiers}. Veuillez mettre à jour les contacts.`, {
        type: 'warning',
        title: 'Email manquant'
      });
      return;
    }

    alert(
      `Confirmez-vous l'envoi d'une relance à ${facture.nom_tiers} ?\n\n` +
      `📧 Email: ${facture.email}\n` +
      `💰 Montant: ${facture.total_ttc.toLocaleString('fr-FR')} ${facture.devise}\n` +
      `📅 Retard: ${calculerJoursRetard(facture.echeance)} jours`,
      {
        type: 'warning',
        title: 'Confirmation de relance',
        onConfirm: () => envoyerRelanceConfirmee(facture)
      }
    );
  };

  // Fonction appelée après confirmation
  const envoyerRelanceConfirmee = async (facture: Facture) => {
    setEnvoiEnCours(facture.numero_facture!);

    try {
      const result = await emailApi.envoyerRelance(facture);
      
      if (result.success) {
        // Afficher le message de confirmation
        setMessageConfirmation(`Rappel pour le client ${facture.nom_tiers} envoyé avec succès`);
        
        // Masquer le message après 3 secondes
        setTimeout(() => {
          setMessageConfirmation('');
        }, 3000);
      } else {
        alert(`Erreur lors de l'envoi: ${result.message}`, {
          type: 'error',
          title: 'Erreur d\'envoi'
        });
      }
    } catch (error: any) {
      alert(`Erreur lors de l'envoi de la relance: ${error.message}`, {
        type: 'error',
        title: 'Erreur'
      });
    } finally {
      setEnvoiEnCours(null);
    }
  };

  // FONCTION RELANCE GROUPÉE - Confirmation
  const handleRelanceGroupee = async () => {
    const facturesAvecEmail = echeances.filter(f => f.email);

    if (facturesAvecEmail.length === 0) {
      alert('Aucun client avec email trouvé. Impossible d\'envoyer des relances.', {
        type: 'warning',
        title: 'Aucun email disponible'
      });
      return;
    }

    // Préparer le message de confirmation détaillé
    let messageConfirmation = `Vous allez envoyer des relances à ${facturesAvecEmail.length} client(s).\n\n`;
    
    // Ajouter des statistiques
    const totalMontant = facturesAvecEmail.reduce((sum, f) => sum + f.total_ttc, 0);
    const retardsMoyens = Math.round(facturesAvecEmail.reduce((sum, f) => sum + calculerJoursRetard(f.echeance), 0) / facturesAvecEmail.length);
    const facturesSansEmail = echeances.filter(f => !f.email);
    
    messageConfirmation += `📊 Statistiques:\n`;
    messageConfirmation += `• Montant total: ${totalMontant.toLocaleString('fr-FR')} MGA\n`;
    messageConfirmation += `• Retard moyen: ${retardsMoyens} jours\n`;
    messageConfirmation += `• Clients sans email: ${facturesSansEmail.length}\n\n`;
    messageConfirmation += `Confirmez-vous l'envoi groupé ?`;

    alert(messageConfirmation, {
      type: 'warning',
      title: 'Relance groupée',
      onConfirm: () => envoyerRelancesGroupéesConfirmees(facturesAvecEmail)
    });
  };

  // Fonction appelée après confirmation groupée
  const envoyerRelancesGroupéesConfirmees = async (facturesAvecEmail: Facture[]) => {
    setEnvoiGroupeEnCours(true);

    try {
      const result = await emailApi.envoyerRelancesGroupees(facturesAvecEmail);
      
      if (result.success) {
        // Afficher le message de confirmation pour le groupe
        setMessageConfirmation(`${facturesAvecEmail.length} rappel(s) client(s) envoyé(s) avec succès !`);
        
        setTimeout(() => {
          setMessageConfirmation('');
        }, 5000);
      } else {
        alert(`Erreur lors de l'envoi groupé: ${result.message}`, {
          type: 'error',
          title: 'Erreur d\'envoi'
        });
      }
    } catch (error: any) {
      alert(`Erreur lors de l'envoi des relances groupées: ${error.message}`, {
        type: 'error',
        title: 'Erreur'
      });
    } finally {
      setEnvoiGroupeEnCours(false);
    }
  };

  const totalRetard = echeances.reduce((sum, facture) => sum + facture.total_ttc, 0);
  const facturesCritiques = echeances.filter(f => calculerJoursRetard(f.echeance) > 180).length;
  const clientsAvecEmail = echeances.filter(f => f.email).length;

  if (loading) {
    return (
      <div className="echeances-loading">
        <div className="echeances-loading-spinner"></div>
        <div className="echeances-loading-text">Chargement des échéances...</div>
      </div>
    );
  }

  return (
    <div className="echeances-page">
      <div className="page-header">
        <h1>Échéances Clients - Retards de Paiement</h1>
        <p>Suivi des factures clients avec échéances dépassées</p>
      </div>

      {/* Message de confirmation */}
      {messageConfirmation && (
        <div className="confirmation-message">
          <div className="confirmation-icon">✅</div>
          <div className="confirmation-text">{messageConfirmation}</div>
        </div>
      )}

      {/* Alertes critiques */}
      {facturesCritiques > 0 && (
        <div className="alerte-critique">
          <div className="alerte-icon">🚨</div>
          <div className="alerte-content">
            <h3>Action Requise Urgente</h3>
            <p>
              {facturesCritiques} facture(s) en retard depuis plus de 6 mois. 
              Montant total en souffrance : <strong>{totalRetard.toLocaleString('fr-FR')} MGA</strong>
            </p>
            <div className="stats-email">
              <span className="stat-email-ok">📧 {clientsAvecEmail} client(s) avec email</span>
              <span className="stat-email-ko">❌ {echeances.length - clientsAvecEmail} client(s) sans email</span>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="echeances-stats">
        <div className="stat-card warning">
          <div className="stat-value">{echeances.length}</div>
          <div className="stat-label">Factures en Retard</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-value">{facturesCritiques}</div>
          <div className="stat-label">Retard supérieur à 6 mois</div>
        </div>
        <div className="stat-card critical">
          <div className="stat-value">{totalRetard.toLocaleString('fr-FR')} MGA</div>
          <div className="stat-label">Montant Total Retard</div>
        </div>
        <div className="stat-card info">
          <div className="stat-value">{clientsAvecEmail}</div>
          <div className="stat-label">Clients avec email</div>
        </div>
      </div>

      {/* Tableau des échéances */}
      <div className="echeances-table-container">
        <table className="echeances-table">
          <thead>
            <tr>
              <th>Facture</th>
              <th>Client</th>
              <th>Date Échéance</th>
              <th>Jours Retard</th>
              <th>Montant TTC</th>
              <th>Email</th>
              <th>Niveau Alerte</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {echeances.map(facture => {
              const joursRetard = calculerJoursRetard(facture.echeance);
              const niveauAlerte = getNiveauAlerte(joursRetard);
              const aUnEmail = !!facture.email;
              
              return (
                <tr key={facture.numero_facture} className={`niveau-${niveauAlerte}`}>
                  <td>
                    <Link to={`/comptabilite/factures/${facture.numero_facture}`} className="facture-link">
                      #{facture.numero_facture}
                    </Link>
                  </td>
                  <td>
                    <div className="client-info">
                      <div className="client-nom">{facture.nom_tiers}</div>
                      <div className="client-type">{facture.type_tiers}</div>
                    </div>
                  </td>
                  <td>
                    <div className="date-echeance">
                      {new Date(facture.echeance).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td>
                    <span className={`retard-badge ${niveauAlerte}`}>
                      {joursRetard} jours
                    </span>
                  </td>
                  <td>
                    <div className="montant-retard">
                      {facture.total_ttc.toLocaleString('fr-FR')} {facture.devise}
                    </div>
                  </td>
                  <td>
                    <div className={`email-status ${aUnEmail ? 'avec-email' : 'sans-email'}`}>
                      {aUnEmail ? (
                        <span title={facture.email || ''}>📧 {facture.email}</span>
                      ) : (
                        <span className="pas-d-email">❌ Aucun email</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`alerte-badge ${niveauAlerte}`}>
                      {niveauAlerte === 'critique' ? '🚨 Critique' :
                       niveauAlerte === 'grave' ? '⚠️ Grave' :
                       niveauAlerte === 'eleve' ? '🔶 Élevé' : '🔶 Modéré'}
                    </span>
                  </td>
                  <td>
                    <div className="actions-echeances">
                      <button 
                        className={`btn-relance ${aUnEmail ? '' : 'disabled'}`} 
                        onClick={() => handleRelanceClient(facture)}
                        disabled={!aUnEmail || envoiEnCours === facture.numero_facture}
                        title={aUnEmail ? "Envoyer une relance par email" : "Client sans email"}
                      >
                        {envoiEnCours === facture.numero_facture ? (
                          <>
                            <div className="relance-spinner"></div>
                            Envoi...
                          </>
                        ) : (
                          '📧 Relancer'
                        )}
                      </button>
                      <button className="btn-details" title="Voir les paiements">
                        <Link to={`/comptabilite/paiements/facture/${facture.numero_facture}`}>
                          💳 Paiements
                        </Link>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {echeances.length === 0 && (
          <div className="no-echeances">
            <div className="success-icon">✅</div>
            <h3>Aucune facture client en retard de paiement</h3>
            <p>Toutes les échéances sont respectées</p>
          </div>
        )}
      </div>

      {/* Actions globales */}
      <div className="actions-globales">
        <h3>Actions de Relance Groupée</h3>
        <div className="boutons-actions">
          <button 
            className="btn-action-primaire" 
            onClick={handleRelanceGroupee}
            disabled={echeances.length === 0 || clientsAvecEmail === 0 || envoiGroupeEnCours}
          >
            {envoiGroupeEnCours ? (
              <>
                <div className="groupe-spinner"></div>
                Envoi en cours...
              </>
            ) : (
              `📧 Relancer Tous les Clients (${clientsAvecEmail})`
            )}
          </button>
          <button className="btn-action-secondaire">
            📊 Exporter Rapport Échéances
          </button>
          <Link to="/comptabilite/paiements" className="btn-action-tertiaire">
            💳 Voir Tous les Paiements
          </Link>
        </div>
        
        {echeances.length > 0 && clientsAvecEmail === 0 && (
          <div className="alerte-aucun-email">
            <div className="alerte-icon">⚠️</div>
            <div className="alerte-text">
              Aucun des clients en retard n'a d'email enregistré. 
              <Link to="/comptabilite/tiers" className="lien-tiers"> Mettre à jour les contacts clients</Link>
            </div>
          </div>
        )}
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

export default EcheancesPage;