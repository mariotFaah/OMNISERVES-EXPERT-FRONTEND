// src/modules/comptabilite/components/CompleterPaiementModal.tsx
import React, { useState, useEffect } from 'react';
import type { Facture, Paiement } from '../types';
import { paiementApi } from '../services/paiementApi';
import { useAlertDialog } from '../../../core/hooks/useAlertDialog';
import './CompleterPaiementModal.css';

interface CompleterPaiementModalProps {
  facture: Facture;
  isOpen: boolean;
  onClose: () => void;
  onPaiementComplete: () => void;
}

const validerDonneesFacture = (facture: Facture): facture is Facture & { numero_facture: number } => {
  return !!facture.numero_facture;
};

export const CompleterPaiementModal: React.FC<CompleterPaiementModalProps> = ({
  facture,
  isOpen,
  onClose,
  onPaiementComplete
}) => {
  const [montant, setMontant] = useState<string>('');
const [modePaiement, setModePaiement] = useState<Paiement['mode_paiement']>('virement');  const [reference, setReference] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const { alert } = useAlertDialog();

  useEffect(() => {
    if (isOpen && facture) {
      // Pré-remplir avec le montant restant par défaut
      const montantRestant = facture.montant_restant || 0;
      setMontant(montantRestant.toString());
      setReference(`COMPLETION-${facture.numero_facture}-${Date.now()}`);
    }
  }, [isOpen, facture]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validerDonneesFacture(facture)) {
    alert('Erreur: Données de facture incomplètes', {
        type: 'error',
        title: 'Données manquantes'
    });
    return;
    } 
    

    if (!montant || parseFloat(montant) <= 0) {
      alert('Veuillez saisir un montant valide', {
        type: 'error',
        title: 'Montant invalide'
      });
      return;
    }

    const montantNum = parseFloat(montant);
    const montantRestant = facture.montant_restant || 0;

    if (montantNum > montantRestant) {
      alert(`Le montant saisi (${montantNum} MGA) dépasse le montant restant (${montantRestant} MGA)`, {
        type: 'warning',
        title: 'Montant trop élevé'
      });
      return;
    }

    setLoading(true);

    try {
      await paiementApi.createPaiement({
        numero_facture: facture.numero_facture,
        date_paiement: new Date().toISOString().split('T')[0],
        montant: montantNum,
        mode_paiement: modePaiement,
        reference: reference || `COMPLETION-${facture.numero_facture}`,
        statut: 'validé',
        devise: facture.devise || 'MGA',
        taux_change: 1.0
      });

      // Message de succès
      alert(`Paiement de ${montantNum.toLocaleString()} MGA enregistré avec succès !`, {
        type: 'success',
        title: 'Paiement complété'
      });

      // Réinitialiser et fermer
      setMontant('');
      setReference('');
      onPaiementComplete();
      onClose();

    } catch (error) {
      console.error('Erreur enregistrement paiement:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      alert(`Erreur lors de l'enregistrement: ${errorMessage}`, {
        type: 'error',
        title: 'Erreur'
      });
    } finally {
      setLoading(false);
    }
  };

  const montantRestant = facture.montant_restant || 0;
  const pourcentageActuel = ((facture.montant_paye || 0) / (facture.total_ttc || 1)) * 100;
  const nouveauPourcentage = montant ? ((facture.montant_paye || 0) + parseFloat(montant)) / (facture.total_ttc || 1) * 100 : pourcentageActuel;

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="completer-paiement-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💳 Compléter le paiement</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Informations facture */}
          <div className="facture-info">
            <div className="facture-header">
              <h3>Facture #{facture.numero_facture}</h3>
              <span className="client-name">{facture.nom_tiers}</span>
            </div>
            
            <div className="montants-info">
              <div className="montant-item">
                <span>Total facture:</span>
                <strong>{(facture.total_ttc || 0).toLocaleString()} MGA</strong>
              </div>
              <div className="montant-item">
                <span>Déjà payé:</span>
                <span className="montant-paye">{(facture.montant_paye || 0).toLocaleString()} MGA</span>
              </div>
              <div className="montant-item">
                <span>Reste à payer:</span>
                <span className="montant-restant">{montantRestant.toLocaleString()} MGA</span>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="progression-section">
              <div className="progression-labels">
                <span>Progression actuelle: {pourcentageActuel.toFixed(1)}%</span>
                {montant && (
                  <span className="nouvelle-progression">
                    → {nouveauPourcentage.toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="barre-progression-complete">
                <div 
                  className="progression-actuelle"
                  style={{ width: `${pourcentageActuel}%` }}
                ></div>
                {montant && (
                  <div 
                    className="progression-additionnelle"
                    style={{ width: `${nouveauPourcentage - pourcentageActuel}%` }}
                  ></div>
                )}
              </div>
            </div>
          </div>

          {/* Formulaire de paiement */}
          <form onSubmit={handleSubmit} className="paiement-form">
            <div className="form-group">
              <label htmlFor="montant">Montant à payer *</label>
              <div className="input-with-suggestions">
                <input
                  type="number"
                  id="montant"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  placeholder="Saisir le montant"
                  min="0"
                  max={montantRestant}
                  step="0.01"
                  required
                />
                <div className="suggestions">
                  <button 
                    type="button"
                    className="suggestion-btn"
                    onClick={() => setMontant(montantRestant.toString())}
                  >
                    Solde complet ({montantRestant.toLocaleString()} MGA)
                  </button>
                  <button 
                    type="button"
                    className="suggestion-btn"
                    onClick={() => setMontant(Math.ceil(montantRestant / 2).toString())}
                  >
                    Moitié ({Math.ceil(montantRestant / 2).toLocaleString()} MGA)
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="modePaiement">Mode de paiement *</label>
              <select
                id="modePaiement"
                value={modePaiement}
                onChange={(e) => setModePaiement(e.target.value as Paiement['mode_paiement'])}
                required
              >
                <option value="virement">Virement bancaire</option>
                <option value="espèce">Espèces</option>
                <option value="chèque">Chèque</option>
                <option value="carte">Carte bancaire</option>
                <option value="mobile">Paiement mobile</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="reference">Référence du paiement</label>
              <input
                type="text"
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Référence unique du paiement"
              />
            </div>

            {/* Résumé du paiement */}
            {montant && (
              <div className="paiement-summary">
                <h4>Résumé du paiement</h4>
                <div className="summary-items">
                  <div className="summary-item">
                    <span>Montant payé:</span>
                    <span>{parseFloat(montant).toLocaleString()} MGA</span>
                  </div>
                  <div className="summary-item">
                    <span>Nouveau solde restant:</span>
                    <span>{(montantRestant - parseFloat(montant)).toLocaleString()} MGA</span>
                  </div>
                  <div className="summary-item">
                    <span>Nouvelle progression:</span>
                    <span>{nouveauPourcentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={onClose}
                disabled={loading}
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="btn-confirm"
                disabled={loading || !montant}
              >
                {loading ? 'Enregistrement...' : '💳 Confirmer le paiement'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};