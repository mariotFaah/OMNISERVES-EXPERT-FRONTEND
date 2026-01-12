import type { Facture, FactureAvecPaiement, RapportTVA, RapportTresorerie } from '../types';

export interface PDFOptions {
  title?: string;
  filename?: string;
  includeHeader?: boolean;
  includeFooter?: boolean;
  passwordProtected?: boolean;
}

class PDFService {
  private async generateFacturePDF(facture: Facture | FactureAvecPaiement, options: PDFOptions = {}) {
    const {
      filename = `facture_${facture.numero_facture}.pdf`,
      includeHeader = true,
      includeFooter = true
    } = options;

    // Créer un nouvel objet jsPDF
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    // Configuration
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - (2 * margin);
    let yPosition = margin;

    // En-tête du PDF
    if (includeHeader) {
      yPosition = this.addHeader(doc, facture, pageWidth, margin, yPosition);
    }

    // Informations de la facture
    yPosition = this.addFactureInfo(doc, facture, margin, contentWidth, yPosition);

    // Lignes de facture
    yPosition = this.addFactureLines(doc, facture, margin, contentWidth, yPosition);

    // Totaux
    yPosition = this.addTotals(doc, facture, margin, contentWidth, yPosition);

    // Informations de paiement
    if (facture.type_paiement && facture.type_paiement !== 'comptant') {
      yPosition = this.addPaymentInfo(doc, facture, margin, yPosition);
    }

    // Pied de page
    if (includeFooter) {
      this.addFooter(doc, pageWidth, pageHeight);
    }

    // Sauvegarder le PDF
    doc.save(filename);
  }

  private addHeader(doc: any, facture: Facture | FactureAvecPaiement, pageWidth: number, margin: number, yPosition: number): number {
    // Logo et informations entreprise
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('OMNISERVE EXPERTS', margin, yPosition);
    yPosition += 7;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    // Adresse de l'entreprise
    doc.text('2239 Ambodisaina Ivondro Tamatave', margin, yPosition);
    yPosition += 5;
    
    // Contact
    doc.text('+261 32 77 531 69 | contact@omniserve.experts', margin, yPosition);
    yPosition += 10;

    // Titre du document
    const typeLabels = {
      facture: 'FACTURE',
      proforma: 'PROFORMA',
      avoir: 'AVOIR'
    };

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const titre = `${typeLabels[facture.type_facture]} N° ${facture.numero_facture}`;
    const numero_complet = `${facture.numero_complet || ''}`;
    doc.text(numero_complet, margin, yPosition);
    doc.text(titre, pageWidth - margin, yPosition, { align: 'right' });

    yPosition += 15;

    // Ligne séparatrice
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 20;

    return yPosition;
  }

  private addFactureInfo(doc: any, facture: Facture | FactureAvecPaiement, margin: number, contentWidth: number, yPosition: number): number {
    const columnWidth = contentWidth / 2;

    // Informations client (colonne de gauche)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENT:', margin, yPosition);
    
    doc.setFont('helvetica', 'normal');
    let clientY = yPosition + 6;
    
    // Informations du client
    const clientInfo = [
      facture.nom_tiers || '',
      facture.adresse || '',
      facture.telephone ? `Tél: ${facture.telephone}` : '',
      facture.email ? `Email: ${facture.email}` : '',
      facture.type_tiers ? `Type: ${facture.type_tiers}` : '',
      facture.numero_tiers ? `N°: ${facture.numero_tiers}` : ''
    ].filter(Boolean);

    clientInfo.forEach(info => {
      const lines = this.splitText(doc, info, columnWidth - 15);
      lines.forEach(line => {
        doc.text(line, margin + 5, clientY);
        clientY += 4;
      });
      clientY += 1;
    });

    // Informations facture (colonne de droite) - AJUSTÉ POUR RAPPROCHER LES LABELS ET VALEURS
    const infoX = margin + columnWidth + 10;
    let infoY = yPosition;

    const factureInfo = [
      { label: 'Date:', value: new Date(facture.date).toLocaleDateString('fr-FR') },
      { label: 'Échéance:', value: new Date(facture.echeance).toLocaleDateString('fr-FR') },
      { label: 'Statut:', value: this.getStatutLabel(facture.statut) },
      { label: 'Mode règlement:', value: facture.reglement },
      { label: 'Devise:', value: facture.devise || 'MGA' }
    ];

    // CORRECTION: Vérifier que taux_change est un nombre avant d'utiliser toFixed
    if (facture.taux_change && facture.taux_change !== 1) {
      const tauxChangeNum = Number(facture.taux_change);
      if (!isNaN(tauxChangeNum)) {
        factureInfo.push({ 
          label: 'Taux change:', 
          value: `1 ${facture.devise} = ${tauxChangeNum.toFixed(4)} MGA` 
        });
      } else {
        // Si ce n'est pas un nombre, afficher la valeur telle quelle
        factureInfo.push({ 
          label: 'Taux change:', 
          value: `1 ${facture.devise} = ${facture.taux_change} MGA` 
        });
      }
    }

    doc.setFont('helvetica', 'bold');
    factureInfo.forEach(info => {
      doc.text(info.label, infoX, infoY);
      infoY += 6;
    });

    infoY = yPosition;
    doc.setFont('helvetica', 'normal');
    
    // RAPPROCHER LES VALEURS DES LABELS (40 → 35 pour être plus proche)
    factureInfo.forEach(info => {
      doc.text(info.value, infoX + 35, infoY); // Changé de 40 à 35
      infoY += 6;
    });

    // Retourner la position Y la plus basse
    return Math.max(clientY, infoY) + 15;
  }

  private addFactureLines(doc: any, facture: Facture | FactureAvecPaiement, margin: number, contentWidth: number, yPosition: number): number {
    // Vérifier si on a besoin d'une nouvelle page
    if (yPosition > 150) { // Réduit de 180 à 150 pour éviter les débordements
      doc.addPage();
      yPosition = 20;
    }

    // Titre de la section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DÉTAIL DES ARTICLES', margin, yPosition);
    yPosition += 8;

    // En-tête du tableau
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, contentWidth, 8, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    // Colonnes ajustées
    const cols = {
      reference: margin + 3,
      description: margin + 25,
      quantite: margin + 75,
      prix: margin + 90,
      remise: margin + 115,
      tva: margin + 135,
      total: margin + 155
    };

    doc.text('Réf.', cols.reference, yPosition + 5);
    doc.text('Description', cols.description, yPosition + 5);
    doc.text('Qté', cols.quantite, yPosition + 5);
    doc.text('Prix Unitaire', cols.prix, yPosition + 5);
    doc.text('Remise', cols.remise, yPosition + 5);
    doc.text('TVA', cols.tva, yPosition + 5);
    doc.text('Total', cols.total, yPosition + 5);

    yPosition += 12;

    // Lignes de facture
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    facture.lignes.forEach((ligne, index) => {
      // Vérifier si on a besoin d'une nouvelle page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
        
        // Ré-afficher l'en-tête du tableau sur la nouvelle page
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPosition, contentWidth, 8, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Réf.', cols.reference, yPosition + 5);
        doc.text('Description', cols.description, yPosition + 5);
        doc.text('Qté', cols.quantite, yPosition + 5);
        doc.text('Prix Unitaire', cols.prix, yPosition + 5);
        doc.text('Remise', cols.remise, yPosition + 5);
        doc.text('TVA', cols.tva, yPosition + 5);
        doc.text('Total', cols.total, yPosition + 5);
        yPosition += 12;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
      }

      // Référence
      doc.text(ligne.code_article || '-', cols.reference, yPosition);

      // Description avec gestion des lignes multiples
      const descriptionLines = this.splitText(doc, ligne.description || 'Sans description', 60);
      descriptionLines.forEach((line, lineIndex) => {
        doc.text(line, cols.description, yPosition + (lineIndex * 3));
      });

      // Autres colonnes
      doc.text(ligne.quantite.toString(), cols.quantite, yPosition);
      doc.text(this.formatMontant(ligne.prix_unitaire), cols.prix, yPosition);
      doc.text(ligne.remise > 0 ? `${ligne.remise}%` : '-', cols.remise, yPosition);
      doc.text(`${ligne.taux_tva}%`, cols.tva, yPosition);
      doc.text(this.formatMontant(ligne.montant_ttc || 0), cols.total, yPosition);

      // Calculer la hauteur de la ligne
      const ligneHeight = Math.max(6, descriptionLines.length * 3);

      // Ligne séparatrice entre les articles
      if (index < facture.lignes.length - 1) {
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, yPosition + ligneHeight + 2, margin + contentWidth, yPosition + ligneHeight + 2);
      }

      yPosition += ligneHeight + 4;
    });

    return yPosition + 10;
  }

  private addTotals(doc: any, facture: Facture | FactureAvecPaiement, margin: number, contentWidth: number, yPosition: number): number {
    // Vérifier si on a besoin d'une nouvelle page
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    const totalsX = margin + contentWidth - 100;

    // Ligne séparatrice
    doc.setDrawColor(200, 200, 200);
    doc.line(totalsX - 20, yPosition, margin + contentWidth, yPosition);
    yPosition += 8;

    // Totaux détaillés
    const totals = [
      { label: 'Total HT:', value: facture.total_ht, size: 10 },
      { label: 'Total TVA:', value: facture.total_tva, size: 10 },
      { label: 'Total TTC:', value: facture.total_ttc, size: 12, bold: true }
    ];

    totals.forEach(total => {
      doc.setFontSize(total.size);
      if (total.bold) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      
      doc.text(total.label, totalsX, yPosition);
      doc.text(this.formatMontant(total.value), margin + contentWidth, yPosition, { align: 'right' });
      yPosition += 6;
    });

    yPosition += 5;

    // Informations de paiement si existantes
    const montantPaye = 'montant_paye' in facture ? facture.montant_paye : 0;
    const montantRestant = 'montant_restant' in facture ? facture.montant_restant : facture.total_ttc;

    if (montantPaye && montantPaye > 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      const paymentInfo = [
        { label: 'Montant payé:', value: montantPaye },
        { label: 'Montant restant:', value: montantRestant || facture.total_ttc }
      ];

      paymentInfo.forEach(info => {
        doc.text(info.label, totalsX, yPosition);
        doc.text(this.formatMontant(info.value), margin + contentWidth, yPosition, { align: 'right' });
        yPosition += 5;
      });

      const progression = ((montantPaye / facture.total_ttc) * 100).toFixed(1);
      doc.text(`Progression: ${progression}%`, totalsX, yPosition);
      yPosition += 8;
    }

    return yPosition;
  }

  private addPaymentInfo(doc: any, facture: Facture | FactureAvecPaiement, margin: number, yPosition: number): number {
    // Vérifier si on a besoin d'une nouvelle page
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    const typePaiement = facture.type_paiement;
    const dateFinalePaiement = facture.date_finale_paiement;
    const montantMinimumPaiement = facture.montant_minimum_paiement;
    const montantAcompte = facture.montant_acompte;
    const penaliteRetard = facture.penalite_retard;

    if (!typePaiement || typePaiement === 'comptant') return yPosition;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('CONFIGURATION DU PAIEMENT', margin, yPosition);
    yPosition += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    const typePaiementLabels = {
      flexible: 'Paiement flexible',
      acompte: 'Acompte',
      echeance: 'Échéance'
    };

    const paymentInfo = [
      `Type: ${typePaiementLabels[typePaiement]}`,
      dateFinalePaiement ? `Date finale: ${new Date(dateFinalePaiement).toLocaleDateString('fr-FR')}` : null,
      montantMinimumPaiement && montantMinimumPaiement > 0 ? `Minimum par paiement: ${this.formatMontant(montantMinimumPaiement)}` : null,
      montantAcompte && montantAcompte > 0 ? `Acompte: ${this.formatMontant(montantAcompte)}` : null,
      penaliteRetard && penaliteRetard > 0 ? `Pénalité retard: ${penaliteRetard}%` : null
    ].filter(Boolean) as string[];

    paymentInfo.forEach(info => {
      // Vérifier si on a besoin d'une nouvelle page
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
        doc.setFontSize(9);
      }

      doc.text(info, margin, yPosition);
      yPosition += 5;
    });

    return yPosition + 10;
  }

  private addFooter(doc: any, pageWidth: number, pageHeight: number) {
    const footerY = pageHeight - 15;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    
    doc.text(
      `Document généré le ${new Date().toLocaleDateString('fr-FR')} - OMNISERVE EXPERTS`,
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );
  }

  // Méthode utilitaire pour diviser le texte en plusieurs lignes
  private splitText(doc: any, text: string, maxWidth: number): string[] {
    if (!text) return [''];
    
    const lines: string[] = [];
    let currentLine = '';

    const words = text.split(' ');
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = doc.getTextWidth(testLine);

      if (testWidth > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  private getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      validee: 'Validée',
      brouillon: 'Brouillon',
      annulee: 'Annulée',
      partiellement_payee: 'Partiellement payée',
      payee: 'Payée',
      en_retard: 'En retard',
      non_payee: 'Non payée'
    };
    return labels[statut] || statut;
  }

  private formatMontant(montant: number): string {
    if (isNaN(montant) || !isFinite(montant)) {
      return '0.00 Ar';
    }
    
    // Formater avec un espace comme séparateur de milliers
    const formatted = montant.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    // Remplacer le séparateur de milliers par un espace
    return formatted.replace(/\s/g, ' ') + ' Ar';
  }

  // Méthodes publiques
  async exportFacture(facture: Facture | FactureAvecPaiement, options?: PDFOptions) {
    await this.generateFacturePDF(facture, options);
  }

  async exportFactureList(factures: (Facture | FactureAvecPaiement)[], options?: PDFOptions) {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (2 * margin);
    let yPosition = 20;

    // En-tête
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('LISTE DES FACTURES', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, yPosition);
    yPosition += 15;

    // Tableau
    factures.forEach((facture) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont('helvetica', 'bold');
      const title = `Facture ${facture.numero_facture} - ${facture.nom_tiers}`;
      const titleLines = this.splitText(doc, title, contentWidth - 40);
      titleLines.forEach(line => {
        doc.text(line, margin, yPosition);
        yPosition += 5;
      });

      doc.setFont('helvetica', 'normal');
      const details = [
        `Date: ${new Date(facture.date).toLocaleDateString('fr-FR')}`,
        `Montant: ${this.formatMontant(facture.total_ttc)}`,
        `Statut: ${this.getStatutLabel(facture.statut)}`,
        `Type: ${facture.type_facture}`
      ];

      details.forEach(detail => {
        const detailLines = this.splitText(doc, detail, contentWidth);
        detailLines.forEach(line => {
          doc.text(line, margin + 10, yPosition);
          yPosition += 5;
        });
      });

      yPosition += 5;
    });

    const filename = options?.filename || `liste_factures_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  }

  async exportRapportTVA(rapport: RapportTVA, options?: PDFOptions) {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    const margin = 20;
    let yPosition = 20;

    // En-tête
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RAPPORT TVA', margin, yPosition);
    yPosition += 10;

    if (rapport.periode) {
      doc.setFontSize(12);
      doc.text(`Période: ${rapport.periode}`, margin, yPosition);
      yPosition += 8;
    }

    yPosition += 10;

    // Données TVA
    doc.setFontSize(12);
    doc.text(`TVA Collectée: ${this.formatMontant(rapport.tva_collectee)}`, margin, yPosition);
    yPosition += 8;

    doc.text(`TVA Déductible: ${this.formatMontant(rapport.tva_deductable)}`, margin, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'bold');
    doc.text(`TVA à Payer: ${this.formatMontant(rapport.tva_a_payer)}`, margin, yPosition);
    yPosition += 15;

    if (rapport.note) {
      const noteLines = this.splitText(doc, `Note: ${rapport.note}`, 150);
      noteLines.forEach(line => {
        doc.text(line, margin, yPosition);
        yPosition += 5;
      });
    }

    const filename = options?.filename || 'rapport_tva.pdf';
    doc.save(filename);
  }

  async exportRapportTresorerie(rapport: RapportTresorerie, options?: PDFOptions) {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    const margin = 20;
    let yPosition = 20;

    // En-tête
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RAPPORT TRÉSORERIE', margin, yPosition);
    yPosition += 10;

    if (rapport.periode) {
      doc.setFontSize(12);
      doc.text(`Période: ${rapport.periode}`, margin, yPosition);
      yPosition += 8;
    }

    yPosition += 10;

    // Données trésorerie
    doc.setFontSize(12);
    doc.text(`Entrées: ${this.formatMontant(rapport.entrees)}`, margin, yPosition);
    yPosition += 8;

    doc.text(`Sorties prévues: ${this.formatMontant(rapport.sorties_prevues)}`, margin, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'bold');
    doc.text(`Solde trésorerie: ${this.formatMontant(rapport.solde_tresorerie)}`, margin, yPosition);
    yPosition += 15;

    if (rapport.note) {
      const noteLines = this.splitText(doc, `Note: ${rapport.note}`, 150);
      noteLines.forEach(line => {
        doc.text(line, margin, yPosition);
        yPosition += 5;
      });
    }

    const filename = options?.filename || 'rapport_tresorerie.pdf';
    doc.save(filename);
  }
}

export const pdfService = new PDFService();
export default pdfService;