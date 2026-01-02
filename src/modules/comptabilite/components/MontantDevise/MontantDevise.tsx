// src/modules/comptabilite/components/MontantDevise/MontantDevise.tsx
import React from 'react';
import './MontantDevise.css';

interface MontantDeviseProps {
  montant: number;
  devise: string;
  className?: string;
  showSymbol?: boolean;
}

export const MontantDevise: React.FC<MontantDeviseProps> = ({ 
  montant, 
  devise, 
  className = '',
  showSymbol = true 
}) => {
  const getDeviseSymbol = (devise: string) => {
    const symbols: { [key: string]: string } = {
      'MGA': 'Ar',
      'USD': '$',
      'EUR': '€'
    };
    return symbols[devise] || devise;
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(montant);
  };

  const symbol = showSymbol ? getDeviseSymbol(devise) : '';

  return (
    <span className={`montant-devise ${className}`}>
      {formatMontant(montant)} {symbol && <span className="devise-symbol">{symbol}</span>}
    </span>
  );
};

export default MontantDevise;