import React from 'react';
import { Link } from 'react-router-dom';
import type { Commande } from '../../types';
import StatutBadge from '../StatutBadge/StatutBadge';
import MargeIndicator from '../MargeIndicator/MargeIndicator';
import './CommandeCard.css';

interface CommandeCardProps {
  commande: Commande;
  showMarge?: boolean;
}

const CommandeCard: React.FC<CommandeCardProps> = ({ 
  commande, 
  showMarge = false 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: commande.devise,
    }).format(montant);
  };

  return (
    <div className="commande-card">
      <div className="commande-card-header">
        <div className="commande-info">
          <h3 className="commande-numero">
            <Link to={`/import-export/commandes/${commande.id}`}>
              {commande.numero_commande}
            </Link>
          </h3>
          <span className={`commande-type ${commande.type}`}>
            {commande.type === 'import' ? '📥 Import' : '📤 Export'}
          </span>
        </div>
        <StatutBadge statut={commande.statut} type="commande" />
      </div>

      <div className="commande-card-body">
        <div className="commande-parties">
          <div className="partie">
            <label>{commande.type === 'import' ? 'Fournisseur' : 'Client'}:</label>
            <span className="partie-nom">
              {commande.type === 'import' 
                ? commande.fournisseur?.nom 
                : commande.client?.nom
              }
            </span>
          </div>
        </div>

        <div className="commande-dates">
          <div className="date-info">
            <label>Date commande:</label>
            <span>{formatDate(commande.date_commande)}</span>
          </div>
          {commande.date_livraison_prevue && (
            <div className="date-info">
              <label>Livraison prévue:</label>
              <span>{formatDate(commande.date_livraison_prevue)}</span>
            </div>
          )}
        </div>

        <div className="commande-montants">
          <div className="montant-total">
            <label>Montant total:</label>
            <span className="montant">{formatMontant(commande.montant_total)}</span>
          </div>
          
          {showMarge && commande.couts_logistiques && (
            <MargeIndicator 
              margeBrute={commande.montant_total - (commande.couts_logistiques?.fret_maritime + commande.couts_logistiques?.fret_aerien + commande.couts_logistiques?.assurance + commande.couts_logistiques?.droits_douane + commande.couts_logistiques?.frais_transit + commande.couts_logistiques?.transport_local + commande.couts_logistiques?.autres_frais)}
              chiffreAffaires={commande.montant_total}
            />
          )}
        </div>

        {commande.expedition && (
          <div className="expedition-info">
            <label>Expédition:</label>
            <div className="expedition-details">
              <StatutBadge statut={commande.expedition.statut} type="expedition" />
              {commande.expedition.transporteur && (
                <span className="transporteur">{commande.expedition.transporteur}</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="commande-card-actions">
        <Link 
          to={`/import-export/commandes/${commande.id}`}
          className="btn btn-primary"
        >
          Voir détails
        </Link>
        <Link 
          to={`/import-export/commandes/${commande.id}/marge`}
          className="btn btn-secondary"
        >
          Calcul marge
        </Link>
      </div>
    </div>
  );
};

export default CommandeCard;