// src/modules/comptabilite/pages/PaiementsListPage.tsx  
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Paiement, Facture } from '../types';
import { paiementApi } from '../services/paiementApi';
import { comptabiliteApi } from '../services/api';
import { useAlertDialog } from '../../../core/hooks/useAlertDialog';
import AlertDialog from '../../../core/components/AlertDialog/AlertDialog';
import './PaiementsListPage.css';

export const PaiementsListPage: React.FC = () => {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'validé' | 'en_attente' | 'annulé'>('all');

  // Utilisation du hook AlertDialog
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
      
      // Utilisation de l'AlertDialog au lieu de alert()
      alert('Erreur lors du chargement des paiements. Vérifiez que le backend est démarré.', {
        type: 'error',
        title: 'Erreur de connexion'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleValiderPaiement = async (idPaiement: number) => {
    // Confirmation avec AlertDialog
    alert('Êtes-vous sûr de vouloir valider ce paiement ?', {
      type: 'warning',
      title: 'Confirmation de validation',
      confirmText: 'Valider',
      cancelText: 'Annuler',
      onConfirm: async () => {
        try {
          await paiementApi.validerPaiement(idPaiement);
          // Recharger les données après validation
          await loadData();
          
          // Message de succès
          alert('Paiement validé avec succès', {
            type: 'success',
            title: 'Validé'
          });
        } catch (error) {
          console.error('Erreur validation paiement:', error);
          
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Erreur inconnue lors de la validation';
          
          alert(`Erreur lors de la validation du paiement: ${errorMessage}`, {
            type: 'error',
            title: 'Erreur'
          });
        }
      }
    });
  };

  const handleAnnulerPaiement = async (idPaiement: number) => {
    // Confirmation avec AlertDialog
    alert('Êtes-vous sûr de vouloir annuler ce paiement ?', {
      type: 'warning',
      title: 'Confirmation d\'annulation',
      confirmText: 'Annuler',
      cancelText: 'Retour',
      onConfirm: async () => {
        try {
          await paiementApi.annulerPaiement(idPaiement);
          // Recharger les données après annulation
          await loadData();
          
          // Message de succès
          alert('Paiement annulé avec succès', {
            type: 'success',
            title: 'Annulé'
          });
        } catch (error) {
          console.error('Erreur annulation paiement:', error);
          
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Erreur inconnue lors de l\'annulation';
          
          alert(`Erreur lors de l'annulation du paiement: ${errorMessage}`, {
            type: 'error',
            title: 'Erreur'
          });
        }
      }
    });
  };

  const filteredPaiements = paiements.filter(paiement => {
    if (filter === 'all') return true;
    return paiement.statut === filter;
  });

  const getStatutClass = (statut: string) => {
    const classes = {
      'validé': 'paiements-badge-valide',
      'en_attente': 'paiements-badge-attente',
      'annulé': 'paiements-badge-annule'
    };
    return `${classes[statut as keyof typeof classes] || 'paiements-badge-default'} paiements-badge`;
  };

  const getModePaiementClass = (mode: string) => {
    const classes = {
      'virement': 'paiements-badge-virement',
      'chèque': 'paiements-badge-cheque',
      'espèce': 'paiements-badge-espece',
      'carte': 'paiements-badge-carte'
    };
    return `${classes[mode as keyof typeof classes] || 'paiements-badge-default'} paiements-badge`;
  };

  const getNomClient = (numeroFacture: number): string => {
    const facture = factures.find(f => f.numero_facture === numeroFacture);
    return facture?.nom_tiers || `Facture #${numeroFacture}`;
  };

  if (loading) {
    return (
      <div className="paiements-loading">
        <div className="paiements-loading-text">Chargement des paiements...</div>
      </div>
    );
  }

  return (
    <div className="paiements-list-page">
      <div className="paiements-header">
        <div>
          <h1 className="paiements-title">Gestion des Paiements</h1>
          <p className="paiements-subtitle">Suivez et gérez tous vos paiements clients et fournisseurs</p>
        </div>
        <Link
          to="/comptabilite/paiements/nouveau"
          className="paiements-new-button"
        >
          + Nouveau Paiement
        </Link>
      </div>

      {/* Statistiques rapides */}
      <div className="paiements-stats">
        <div className="paiements-stat-card">
          <div className="paiements-stat-value">{paiements.length}</div>
          <div className="paiements-stat-label">Total Paiements</div>
        </div>
        <div className="paiements-stat-card">
          <div className="paiements-stat-value">
            {paiements.filter(p => p.statut === 'validé').length}
          </div>
          <div className="paiements-stat-label">Validés</div>
        </div>
        <div className="paiements-stat-card">
          <div className="paiements-stat-value">
            {paiements.filter(p => p.statut === 'en_attente').length}
          </div>
          <div className="paiements-stat-label">En Attente</div>
        </div>
        <div className="paiements-stat-card">
          <div className="paiements-stat-value">
            {paiements
              .filter(p => p.statut === 'validé')
              .reduce((sum, p) => sum + p.montant, 0)
              .toLocaleString('fr-FR')} Ar
          </div>
          <div className="paiements-stat-label">Montant Total</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="paiements-filters">
        <div className="paiements-filter-buttons">
          {[
            { key: 'all', label: 'Tous' },
            { key: 'validé', label: 'Validés' },
            { key: 'en_attente', label: 'En Attente' },
            { key: 'annulé', label: 'Annulés' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`paiements-filter-button ${filter === key ? 'active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau des paiements */}
      <div className="paiements-table-container">
        <table className="paiements-table">
          <thead>
            <tr>
              <th>Référence</th>
              <th>Facture/Client</th>
              <th>Date</th>
              <th>Montant</th>
              <th>Mode</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPaiements.map((paiement) => (
              <tr key={paiement.id_paiement}>
                <td>
                  <div className="paiements-cell-reference">
                    {paiement.reference || `PAY-${paiement.id_paiement}`}
                  </div>
                </td>
                <td>
                  <div className="paiements-cell-facture">
                    <div>Facture #{paiement.numero_facture}</div>
                    <div className="paiements-cell-client">
                      {getNomClient(paiement.numero_facture)}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="paiements-cell-date">
                    {new Date(paiement.date_paiement).toLocaleDateString('fr-FR')}
                  </div>
                </td>
                <td>
                  <div className="paiements-cell-amount">
                    {paiement.montant.toLocaleString('fr-FR')} {paiement.devise}
                  </div>
                </td>
                <td>
                  <span className={getModePaiementClass(paiement.mode_paiement)}>
                    {paiement.mode_paiement}
                  </span>
                </td>
                <td>
                  <span className={getStatutClass(paiement.statut)}>
                    {paiement.statut}
                  </span>
                </td>
                <td>
                  <div className="paiements-actions">
                    {paiement.statut === 'en_attente' && (
                      <>
                        <button 
                          className="paiements-action-valider"
                          onClick={() => handleValiderPaiement(paiement.id_paiement!)}
                          title="Valider le paiement"
                        >
                          ✅ Valider
                        </button>
                        <button 
                          className="paiements-action-annuler"
                          onClick={() => handleAnnulerPaiement(paiement.id_paiement!)}
                          title="Annuler le paiement"
                        >
                          ❌ Annuler
                        </button>
                      </>
                    )}
                    {paiement.statut !== 'en_attente' && (
                      <span className="paiements-action-none">
                        Aucune action
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPaiements.length === 0 && (
          <div className="paiements-empty">
            <div className="paiements-empty-text">
              {filter === 'all' 
                ? 'Aucun paiement enregistré' 
                : `Aucun paiement avec le statut "${filter}"`}
            </div>
            <Link
              to="/comptabilite/paiements/nouveau"
              className="paiements-empty-button"
            >
              Enregistrer votre premier paiement
            </Link>
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

export default PaiementsListPage;