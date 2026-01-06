// Crée ce fichier : /modules/import-export/components/ExportPDFCommande/ExportPDFCommande.tsx
import React from 'react';
import type { Commande , CalculMarge} from '../../types';
import { exportCommandePDF } from '../../services/pdfService';
import './ExportPDFCommande.css';

interface Props {
  commande: Commande;
  className?: string;
    marge: CalculMarge | null;
}

const ExportPDFCommande: React.FC<Props> = ({ commande, className }) => {
  const handleExport = async () => {
    try {
      await exportCommandePDF(commande);
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      alert('Erreur lors de la génération du PDF');
    }
  };

  return (
    <button 
      onClick={handleExport}
      className={`btn-pdf-export ${className || ''}`}
      title="Exporter en PDF"
    >
      📄 Exporter en PDF
    </button>
  );
};

export default ExportPDFCommande;