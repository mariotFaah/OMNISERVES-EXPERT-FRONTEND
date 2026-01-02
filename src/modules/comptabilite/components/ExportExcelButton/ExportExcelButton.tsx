import React, { useState } from 'react';
import { excelService } from '../../services/excelService';
import type { Facture, FactureAvecPaiement, RapportTVA, RapportTresorerie } from '../../types';
import './ExportExcelButton.css';

interface ExportExcelButtonProps {
  type: 'facture' | 'facture-list' | 'tva-report' | 'tresorerie-report';
  data: Facture | FactureAvecPaiement | (Facture | FactureAvecPaiement)[] | RapportTVA | RapportTresorerie;
  label?: string;
  className?: string;
  disabled?: boolean;
  options?: {
    filename?: string;
    sheetName?: string;
    includeHeader?: boolean;
  };
}

export const ExportExcelButton: React.FC<ExportExcelButtonProps> = ({
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
          await excelService.exportFacture(data as Facture | FactureAvecPaiement, options);
          break;
        
        case 'facture-list':
          await excelService.exportFactureList(data as (Facture | FactureAvecPaiement)[], options);
          break;
        
        case 'tva-report':
          await excelService.exportRapportTVA(data as RapportTVA, options);
          break;
        
        case 'tresorerie-report':
          await excelService.exportRapportTresorerie(data as RapportTresorerie, options);
          break;
        
        default:
          console.warn('Type d\'export non supporté:', type);
      }
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      alert('Erreur lors de la génération du fichier Excel');
    } finally {
      setExporting(false);
    }
  };

  const getButtonLabel = () => {
    if (exporting) return 'Génération...';
    if (label) return label;
    
    const labels = {
      'facture': '📊 Exporter Excel',
      'facture-list': '📋 Exporter Liste Excel',
      'tva-report': '🧾 Exporter TVA Excel',
      'tresorerie-report': '💰 Exporter Trésorerie Excel'
    };
    
    return labels[type] || 'Exporter Excel';
  };

  return (
    <button
      className={`export-excel-button ${className} ${exporting ? 'exporting' : ''}`}
      onClick={handleExport}
      disabled={disabled || exporting}
      title={`Exporter en format Excel`}
    >
      {exporting ? (
        <>
          <div className="export-excel-spinner"></div>
          {getButtonLabel()}
        </>
      ) : (
        getButtonLabel()
      )}
    </button>
  );
};

export default ExportExcelButton;