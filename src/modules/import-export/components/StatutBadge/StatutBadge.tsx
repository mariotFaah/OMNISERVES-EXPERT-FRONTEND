import React from 'react';
import './StatutBadge.css';

type CommandeStatut = 'brouillon' | 'confirmée' | 'expédiée' | 'livrée' | 'annulée';
type ExpeditionStatut = 'preparation' | 'expédiée' | 'transit' | 'arrivée' | 'livrée';

interface StatutBadgeProps {
  statut: CommandeStatut | ExpeditionStatut;
  type: 'commande' | 'expedition';
}

const StatutBadge: React.FC<StatutBadgeProps> = ({ statut, type }) => {
  const getConfig = () => {
    const configs = {
      commande: {
        brouillon: { label: 'Brouillon', color: 'gray', icon: '📝' },
        confirmée: { label: 'Confirmée', color: 'blue', icon: '✅' },
        expédiée: { label: 'Expédiée', color: 'orange', icon: '🚚' },
        livrée: { label: 'Livrée', color: 'green', icon: '📦' },
        annulée: { label: 'Annulée', color: 'red', icon: '❌' },
      },
      expedition: {
        preparation: { label: 'Préparation', color: 'gray', icon: '📦' },
        expédiée: { label: 'Expédiée', color: 'blue', icon: '✈️' },
        transit: { label: 'En transit', color: 'orange', icon: '🚢' },
        arrivée: { label: 'Arrivée', color: 'purple', icon: '🏁' },
        livrée: { label: 'Livrée', color: 'green', icon: '✅' },
      },
    };

    return configs[type][statut as keyof typeof configs[typeof type]];
  };

  const config = getConfig();

  return (
    <span className={`statut-badge statut-${config.color}`}>
      <span className="statut-icon">{config.icon}</span>
      {config.label}
    </span>
  );
};

export default StatutBadge;