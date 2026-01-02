import React from 'react';
import './MargeIndicator.css';

interface MargeIndicatorProps {
  margeBrute: number;
  chiffreAffaires: number;
  showTaux?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const MargeIndicator: React.FC<MargeIndicatorProps> = ({
  margeBrute,
  chiffreAffaires,
  showTaux = true,
  size = 'md'
}) => {
  const tauxMarge = chiffreAffaires > 0 ? (margeBrute / chiffreAffaires) * 100 : 0;
  
  const getMargeConfig = () => {
    if (margeBrute < 0) {
      return {
        color: 'red',
        icon: '🔴',
        label: 'Déficitaire',
        textColor: 'text-red-700'
      };
    } else if (tauxMarge < 10) {
      return {
        color: 'orange',
        icon: '🟡',
        label: 'Faible',
        textColor: 'text-orange-700'
      };
    } else if (tauxMarge < 25) {
      return {
        color: 'blue',
        icon: '🔵',
        label: 'Bonne',
        textColor: 'text-blue-700'
      };
    } else {
      return {
        color: 'green',
        icon: '🟢',
        label: 'Excellente',
        textColor: 'text-green-700'
      };
    }
  };

  const config = getMargeConfig();
  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(montant);
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`marge-indicator marge-${config.color} ${sizeClasses[size]}`}>
      <div className="marge-header">
        <span className="marge-icon">{config.icon}</span>
        <span className={`marge-label ${config.textColor}`}>
          Marge {config.label}
        </span>
      </div>
      
      <div className="marge-details">
        <div className="marge-montant">
          {formatMontant(margeBrute)}
        </div>
        
        {showTaux && (
          <div className="marge-taux">
            ({tauxMarge.toFixed(1)}%)
          </div>
        )}
      </div>
    </div>
  );
};

export default MargeIndicator;