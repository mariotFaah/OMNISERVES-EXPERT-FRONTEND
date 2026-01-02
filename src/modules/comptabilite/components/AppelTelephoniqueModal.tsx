// src/modules/comptabilite/components/AppelTelephoniqueModal.tsx
import React, { useState } from 'react';
import { FiPhone, FiClock, FiMail, FiX } from 'react-icons/fi';
import './AppelTelephoniqueModal.css';

interface AppelTelephoniqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  numero: string;
  nomClient: string;
  numeroFacture: string;
  montantDu: number;
  onAppelReussi?: () => void;
  onPrendreRendezVous?: () => void;
}

export const AppelTelephoniqueModal: React.FC<AppelTelephoniqueModalProps> = ({
  isOpen,
  onClose,
  numero,
  nomClient,
  numeroFacture,
  montantDu,
  onAppelReussi,
  
}) => {
  const [enAppel, setEnAppel] = useState(false);
  const [appelTermine, setAppelTermine] = useState(false);
  const [resultatAppel, setResultatAppel] = useState<'reussi' | 'rate' | 'absent' | null>(null);
  const [notes, setNotes] = useState('');
  const [prochainRappel, setProchainRappel] = useState('');

  if (!isOpen) return null;

  const initierAppel = () => {
    // Ouvrir le client téléphonique
    const telLink = `tel:${numero.replace(/\s+/g, '')}`;
    window.open(telLink, '_blank');
    
    setEnAppel(true);
    setTimeout(() => {
      setEnAppel(false);
      setAppelTermine(true);
    }, 2000); // Simulation d'un délai d'appel
  };

  const terminerAppel = (resultat: 'reussi' | 'rate' | 'absent') => {
    setResultatAppel(resultat);
    setAppelTermine(false);
    
    if (resultat === 'reussi' && onAppelReussi) {
      onAppelReussi();
    }
  };

  const enregistrerAppel = () => {
    const appelData = {
      date: new Date().toISOString(),
      client: nomClient,
      numero,
      facture: numeroFacture,
      resultat: resultatAppel,
      notes,
      prochainRappel: prochainRappel || null
    };

    // Sauvegarder l'appel (à implémenter avec votre API)
    console.log('Appel enregistré:', appelData);
    
    onClose();
    // Réinitialiser l'état
    setAppelTermine(false);
    setResultatAppel(null);
    setNotes('');
    setProchainRappel('');
  };

  const formaterMontant = (montant: number) => {
    return montant.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="modal-overlay">
      <div className="appel-telephonique-modal">
        <div className="appel-modal-header">
          <div className="appel-modal-titre">
            <FiPhone className="appel-icone-titre" />
            <h3>Appel téléphonique</h3>
          </div>
          <button className="appel-modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="appel-modal-info">
          <div className="appel-info-client">
            <div className="appel-nom-client">{nomClient}</div>
            <div className="appel-details">
              <div className="appel-detail-item">
                <span className="appel-detail-label">Téléphone :</span>
                <span className="appel-detail-value">{numero}</span>
              </div>
              <div className="appel-detail-item">
                <span className="appel-detail-label">Facture :</span>
                <span className="appel-detail-value">#{numeroFacture}</span>
              </div>
              <div className="appel-detail-item">
                <span className="appel-detail-label">Montant dû :</span>
                <span className="appel-detail-value montant-du">{formaterMontant(montantDu)} MGA</span>
              </div>
            </div>
          </div>

          {!enAppel && !appelTermine && !resultatAppel && (
            <div className="appel-etat-init">
              <div className="appel-instructions">
                <p>Cliquez sur "Démarrer l'appel" pour composer le numéro.</p>
                <p>L'appel s'ouvrira dans votre application téléphonique.</p>
              </div>
              <div className="appel-actions">
                <button className="btn-appel-demarrer" onClick={initierAppel}>
                  <FiPhone className="btn-icone" />
                  Démarrer l'appel
                </button>
                <button className="btn-appel-annuler" onClick={onClose}>
                  Annuler
                </button>
              </div>
            </div>
          )}

          {enAppel && (
            <div className="appel-etat-en-cours">
              <div className="appel-animation">
                <div className="appel-animation-circle"></div>
                <div className="appel-animation-circle delay-1"></div>
                <div className="appel-animation-circle delay-2"></div>
              </div>
              <div className="appel-message-en-cours">
                Appel en cours vers {nomClient}...
              </div>
              <button className="btn-appel-terminer" onClick={() => setEnAppel(false)}>
                Terminer l'appel
              </button>
            </div>
          )}

          {appelTermine && !resultatAppel && (
            <div className="appel-etat-termine">
              <h4>Comment s'est passé l'appel ?</h4>
              <div className="resultat-appel-options">
                <button 
                  className="btn-resultat reussi" 
                  onClick={() => terminerAppel('reussi')}
                >
                  <FiPhone className="btn-resultat-icone" />
                  Appel réussi
                  <span className="btn-resultat-desc">Client a pris engagement</span>
                </button>
                <button 
                  className="btn-resultat rate" 
                  onClick={() => terminerAppel('rate')}
                >
                  <FiPhone className="btn-resultat-icone" />
                  Appel raté
                  <span className="btn-resultat-desc">Pas de réponse</span>
                </button>
                <button 
                  className="btn-resultat absent" 
                  onClick={() => terminerAppel('absent')}
                >
                  <FiMail className="btn-resultat-icone" />
                  Absent
                  <span className="btn-resultat-desc">Laisser message</span>
                </button>
              </div>
            </div>
          )}

          {resultatAppel && (
            <div className="appel-etat-suivi">
              <div className={`resultat-indicator ${resultatAppel}`}>
                {resultatAppel === 'reussi' && '✓ Appel réussi'}
                {resultatAppel === 'rate' && '✗ Appel raté'}
                {resultatAppel === 'absent' && '📧 Message laissé'}
              </div>
              
              <div className="appel-notes">
                <label htmlFor="appel-notes">Notes de l'appel :</label>
                <textarea
                  id="appel-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Décrivez ce qui s'est passé pendant l'appel..."
                  rows={4}
                />
              </div>

              <div className="appel-prochain-rappel">
                <label htmlFor="prochain-rappel">
                  <FiClock className="rappel-icone" />
                  Prochain rappel :
                </label>
                <input
                  type="datetime-local"
                  id="prochain-rappel"
                  value={prochainRappel}
                  onChange={(e) => setProchainRappel(e.target.value)}
                />
              </div>

              <div className="appel-actions-finales">
                <button className="btn-enregistrer" onClick={enregistrerAppel}>
                  Enregistrer l'appel
                </button>
                <button className="btn-annuler" onClick={onClose}>
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};