// /modules/import-export/services/pdfService.ts
import jsPDF from 'jspdf';
import type { Commande } from '../types';

export const exportCommandePDF = async (commande: Commande) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 14;
  const marginRight = 14;
  const contentWidth = pageWidth - marginLeft - marginRight;
  
  // Variables pour les calculs
  const calculerTotauxLignes = () => {
    if (!commande?.lignes) return { totalHT: 0, totalTVA: 0, totalTTC: 0 };
    
    let totalHT = 0;
    let totalTVA = 0;
    let totalTTC = 0;

    commande.lignes.forEach(ligne => {
      const montantHT = ligne.quantite * parseFloat(ligne.prix_unitaire.toString());
      const montantTVA = montantHT * (ligne.taux_tva / 100);
      const montantTTC = montantHT + montantTVA;

      totalHT += montantHT;
      totalTVA += montantTVA;
      totalTTC += montantTTC;
    });

    return { totalHT, totalTVA, totalTTC };
  };

  const { totalHT, totalTVA, totalTTC } = calculerTotauxLignes();

  // Titre principal - Police plus grande
  doc.setFontSize(18);
  doc.text('BON DE COMMANDE', pageWidth / 2, 20, { align: 'center' });
  
  // Numéro de commande
  doc.setFontSize(12);
  doc.text(`N°: ${commande.numero_commande}`, marginLeft, 35);
  
  // Type et statut
  const typeText = commande.type === "import" ? "Commande d'Import" : "Commande d'Export";
  
  doc.setFontSize(9);
  doc.text(`${typeText} - ${commande.statut.toUpperCase()}`, marginLeft, 42);
  
  // Date
  doc.text(`Date: ${new Date(commande.date_commande).toLocaleDateString('fr-FR')}`, 
           pageWidth - marginRight, 35, { align: 'right' });

  // Informations principales
  let y = 55;
  
  // Client - Police plus petite
  doc.setFontSize(10);
  doc.text('CLIENT:', marginLeft, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${commande.client?.nom || 'Non spécifié'}`, marginLeft + 35, y);
  y += 6;
  doc.text(`Email: ${commande.client?.email || '-'}`, marginLeft + 35, y);
  y += 6;
  doc.text(`Tél: ${commande.client?.telephone || '-'}`, marginLeft + 35, y);
  y += 6;
  doc.text(`Adresse: ${commande.client?.adresse || '-'}`, marginLeft + 35, y);
  
  // Fournisseur
  const yStartFournisseur = 55;
  doc.setFontSize(10);
  doc.text('FOURNISSEUR:', pageWidth / 2, yStartFournisseur);
  doc.setFont('helvetica', 'normal');
  doc.text(`${commande.fournisseur?.nom || 'Non spécifié'}`, pageWidth / 2 + 35, yStartFournisseur);
  let yFournisseur = yStartFournisseur + 6;
  doc.text(`Email: ${commande.fournisseur?.email || '-'}`, pageWidth / 2 + 35, yFournisseur);
  yFournisseur += 6;
  doc.text(`Tél: ${commande.fournisseur?.telephone || '-'}`, pageWidth / 2 + 35, yFournisseur);
  
  // Déterminer la position de départ des articles
  const startYArticles = Math.max(y, yFournisseur) + 15;
  
  // Titre des articles
  doc.setFontSize(11);
  doc.text('ARTICLES COMMANDÉS', marginLeft, startYArticles);
  
  // En-tête du tableau - avec des colonnes mieux espacées
  y = startYArticles + 6;
  
  // Largeurs des colonnes (ajustées pour tenir dans la page)
  const colWidths = {
    article: 25,
    description: 60,
    quantity: 15,
    price: 35,
    tva: 20,
    total: 35
  };
  
  // Positions X de chaque colonne
  const colPositions = {
    article: marginLeft,
    description: marginLeft + colWidths.article,
    quantity: marginLeft + colWidths.article + colWidths.description,
    price: marginLeft + colWidths.article + colWidths.description + colWidths.quantity,
    tva: marginLeft + colWidths.article + colWidths.description + colWidths.quantity + colWidths.price,
    total: marginLeft + colWidths.article + colWidths.description + colWidths.quantity + colWidths.price + colWidths.tva
  };
  
  // Vérifier que le tableau tient dans la page
  const tableWidth = colWidths.article + colWidths.description + colWidths.quantity + 
                     colWidths.price + colWidths.tva + colWidths.total;
  
  if (tableWidth > contentWidth) {
    // Ajuster automatiquement la largeur de la description si nécessaire
    colWidths.description = contentWidth - (colWidths.article + colWidths.quantity + 
                                           colWidths.price + colWidths.tva + colWidths.total);
  }
  
  // Fond pour l'en-tête du tableau
  doc.setFillColor(240, 240, 240);
  doc.rect(marginLeft, y - 4, tableWidth, 6, 'F');
  
  // En-têtes des colonnes
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Article', colPositions.article, y);
  doc.text('Description', colPositions.description, y);
  doc.text('Qté', colPositions.quantity, y);
  doc.text('Prix unit.', colPositions.price, y);
  doc.text('TVA', colPositions.tva, y);
  doc.text('Total HT', colPositions.total, y);
  
  // Lignes d'articles
  if (commande.lignes && commande.lignes.length > 0) {
    commande.lignes.forEach((ligne) => {
      y += 6;
      const montantHT = ligne.quantite * parseFloat(ligne.prix_unitaire.toString());
      
      // Couleur de fond alternée pour les lignes
      if (commande.lignes && commande.lignes.indexOf(ligne) % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(marginLeft, y - 3, tableWidth, 6, 'F');
      }
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      
      // Article ID (tronqué si nécessaire)
      const articleId = ligne.article_id?.toString() || '-';
      if (articleId.length > 10) {
        doc.text(articleId.substring(0, 10) + '...', colPositions.article, y);
      } else {
        doc.text(articleId, colPositions.article, y);
      }
      
      // Description (tronquée si nécessaire)
      const description = ligne.description || '-';
      if (description.length > 40) {
        doc.text(description.substring(0, 40) + '...', colPositions.description, y);
      } else {
        doc.text(description, colPositions.description, y);
      }
      
      // Quantité
      doc.text(ligne.quantite.toString(), colPositions.quantity, y);
      
      // Prix unitaire
      doc.text(
        new Intl.NumberFormat('fr-FR', { 
          style: 'currency', 
          currency: commande.devise,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(parseFloat(ligne.prix_unitaire.toString())), 
        colPositions.price, y
      );
      
      // TVA
      doc.text(`${ligne.taux_tva}%`, colPositions.tva, y);
      
      // Total HT
      doc.text(
        new Intl.NumberFormat('fr-FR', { 
          style: 'currency', 
          currency: commande.devise,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(montantHT), 
        colPositions.total, y
      );
    });
  }
  
  // Totaux - alignés à droite
  y += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
  // Sous-total HT
  const sousTotalText = `SOUS-TOTAL HT:`;
  doc.text(sousTotalText, pageWidth - marginRight - 80, y);
  doc.text(
    new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: commande.devise,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(totalHT), 
    pageWidth - marginRight, y, 
    { align: 'right' }
  );
  
  y += 8;
  
  // TVA
  const tvaText = `TVA:`;
  doc.text(tvaText, pageWidth - marginRight - 80, y);
  doc.text(
    new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: commande.devise,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(totalTVA), 
    pageWidth - marginRight, y, 
    { align: 'right' }
  );
  
  y += 8;
  
  // Total TTC
  doc.setFontSize(12);
  const totalTTCText = `TOTAL TTC:`;
  doc.text(totalTTCText, pageWidth - marginRight - 80, y);
  doc.text(
    new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: commande.devise,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(totalTTC), 
    pageWidth - marginRight, y, 
    { align: 'right' }
  );

  // Pied de page
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
    marginLeft,
    doc.internal.pageSize.height - 10
  );
  
  doc.text(
    `Page 1/1`,
    pageWidth - marginRight,
    doc.internal.pageSize.height - 10,
    { align: 'right' }
  );
  
  doc.setTextColor(0, 0, 0);

  // Sauvegarde
  doc.save(`bon-commande-${commande.numero_commande}.pdf`);
};