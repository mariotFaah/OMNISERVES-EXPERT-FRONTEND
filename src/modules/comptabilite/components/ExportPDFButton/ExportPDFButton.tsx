import React, { useState } from 'react';
import { pdfService } from '../../services/pdfService';
import type { Facture, FactureAvecPaiement, RapportTVA, RapportTresorerie } from '../../types';
import './ExportPDFButton.css';

interface ExportPDFButtonProps {
  type: 'facture' | 'facture-list' | 'tva-report' | 'tresorerie-report';
  data: Facture | FactureAvecPaiement | (Facture | FactureAvecPaiement)[] | RapportTVA | RapportTresorerie;
  label?: string;
  className?: string;
  disabled?: boolean;
  options?: {
    filename?: string;
    title?: string;
    includeHeader?: boolean;
    includeFooter?: boolean;
  };
}

export const ExportPDFButton: React.FC<ExportPDFButtonProps> = ({
  type,
  data,
  label,
  className = '',
  disabled = false,
  options = {}
}) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (disabled || exporting) return;

    setExporting(true);
    
    try {
      switch (type) {
        case 'facture':
          await pdfService.exportFacture(data as Facture | FactureAvecPaiement, options);
          break;
        
        case 'facture-list':
          await pdfService.exportFactureList(data as (Facture | FactureAvecPaiement)[], options);
          break;
        
        case 'tva-report':
          await pdfService.exportRapportTVA(data as RapportTVA, options);
          break;
        
        case 'tresorerie-report':
          await pdfService.exportRapportTresorerie(data as RapportTresorerie, options);
          break;
        
        default:
          console.warn('Type d\'export non supporté:', type);
      }
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setExporting(false);
    }
  };

  const getButtonLabel = () => {
    if (exporting) return 'Génération...';
    if (label) return label;
    
    const labels = {
      'facture': '📄 Exporter PDF',
      'facture-list': '📋 Exporter Liste',
      'tva-report': '🧾 Exporter TVA',
      'tresorerie-report': '💰 Exporter Trésorerie'
    };
    
    return labels[type] || 'Exporter PDF';
  };

  return (
    <button
      className={`export-pdf-button ${className} ${exporting ? 'exporting' : ''}`}
      onClick={handleExport}
      disabled={disabled || exporting}
      title={`Exporter en format PDF`}
    >
      {exporting ? (
        <>
          <div className="export-pdf-spinner"></div>
          {getButtonLabel()}
        </>
      ) : (
        getButtonLabel()
      )}
    </button>
  );
};

export default ExportPDFButton;