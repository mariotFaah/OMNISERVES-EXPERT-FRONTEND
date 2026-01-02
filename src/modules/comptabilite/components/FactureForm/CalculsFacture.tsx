import * as React from 'react';
import './CalculsFacture.css';

// Dans CalculsFacture.tsx, ajoutez ces props
export interface CalculsFactureProps {
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  echeance: string;
  reglement: string;
  devise: string;
  taux_change: number;
  typePaiement?: 'comptant' | 'flexible' | 'acompte' | 'echeance';
  montantAcompte?: number;
  dateFinalePaiement?: string;
}

export const CalculsFacture: React.FC<CalculsFactureProps> = ({
  totalHT,
  totalTVA,
  totalTTC,
  echeance,
  reglement,
  devise = 'MGA',
  taux_change = 1.0
}) => {
  // Calculer les équivalents en MGA
  const totalHT_MGA = totalHT * taux_change;
  const totalTVA_MGA = totalTVA * taux_change;
  const totalTTC_MGA = totalTTC * taux_change;

  const getDeviseSymbol = (dev: string) => {
    const symbols: { [key: string]: string } = {
      'MGA': 'Ar',
      'USD': '$',
      'EUR': '€'
    };
    return symbols[dev] || dev;
  };

  const formatCurrency = (amount: number, devise: string): string => {
    return amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ` ${getDeviseSymbol(devise)}`;
  };

  const getReglementLabel = (reglement: string): string => {
    const labels: { [key: string]: string } = {
      virement: 'Virement Bancaire',
      cheque: 'Chèque',
      espece: 'Espèces',
      carte: 'Carte Bancaire'
    };
    return labels[reglement] || reglement;
  };

  return (
    <div className="calculs-facture">
      {/* Colonne de gauche - Informations */}
      <div className="calculs-info-column">
        <div className="calculs-field">
          <label className="calculs-label">Échéance</label>
          <div className="calculs-value">
            {new Date(echeance).toLocaleDateString('fr-FR')}
          </div>
        </div>
        
        <div className="calculs-field">
          <label className="calculs-label">Mode de règlement</label>
          <div className="calculs-value">
            {getReglementLabel(reglement)}
          </div>
        </div>

        {devise !== 'MGA' && (
          <div className="calculs-taux-change">
            <label className="calculs-label">Taux de change</label>
            <div className="calculs-value">
              1 {devise} = {taux_change} MGA
            </div>
          </div>
        )}
        
        <div className="calculs-thank-you">
          <p className="calculs-thank-you-text">
            "Nous vous remercions de votre confiance"
          </p>
          <p className="calculs-thank-you-text">
            "Cordialement"
          </p>
        </div>
      </div>

      {/* Colonne de droite - Totaux */}
      <div className="calculs-totals-column">
        <div className="calculs-total-row">
          <span className="calculs-total-label">Total HT:</span>
          <span className="calculs-total-value">
            {formatCurrency(totalHT, devise)}
            {devise !== 'MGA' && (
              <small className="calculs-conversion">
                ({formatCurrency(totalHT_MGA, 'MGA')})
              </small>
            )}
          </span>
        </div>
        
        <div className="calculs-total-row">
          <span className="calculs-total-label">Remise globale:</span>
          <span className="calculs-total-value">
            {formatCurrency(0, devise)}
          </span>
        </div>
        
        <div className="calculs-total-row">
          <span className="calculs-total-label">Total TVA:</span>
          <span className="calculs-total-value calculs-total-tva">
            {formatCurrency(totalTVA, devise)}
            {devise !== 'MGA' && (
              <small className="calculs-conversion">
                ({formatCurrency(totalTVA_MGA, 'MGA')})
              </small>
            )}
          </span>
        </div>
        
        <div className="calculs-total-ttc">
          <span className="calculs-total-ttc-label">Total TTC:</span>
          <span className="calculs-total-ttc-value">
            {formatCurrency(totalTTC, devise)}
            {devise !== 'MGA' && (
              <small className="calculs-conversion">
                ({formatCurrency(totalTTC_MGA, 'MGA')})
              </small>
            )}
          </span>
        </div>

        {/* Arrondi et Net à payer */}
        <div className="calculs-net-a-payer">
          <div className="calculs-net-row">
            <span className="calculs-net-label">Net à payer:</span>
            <span className="calculs-net-value">
              {formatCurrency(totalTTC, devise)}
              {devise !== 'MGA' && (
                <small className="calculs-conversion">
                  ({formatCurrency(totalTTC_MGA, 'MGA')})
                </small>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculsFacture;