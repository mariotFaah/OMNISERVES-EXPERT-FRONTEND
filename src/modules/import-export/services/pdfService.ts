// /modules/import-export/services/pdfService.ts
import jsPDF from 'jspdf';
import type { Commande, CalculMarge } from '../types';

// Import et application d'autoTable
import autoTablePlugin from 'jspdf-autotable';

// Étendre jsPDF avec autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: {
      finalY: number;
    };
  }
}

// Initialiser autoTable
autoTablePlugin(jsPDF, {});

export const exportCommandePDF = async (commande: Commande, marge: CalculMarge | null = null) => {
  const doc = new jsPDF();
  
  // Variables pour les calculs (comme dans ton code)
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

  // Titre principal
  doc.setFontSize(20);
  doc.text('BON DE COMMANDE', 105, 20, { align: 'center' });
  
  // Numéro de commande
  doc.setFontSize(14);
  doc.text(`N°: ${commande.numero_commande}`, 14, 35);
  
  // Type et statut
  const typeText = commande.type === "import" ? "Commande d'Import" : "Commande d'Export";

  
  doc.setFontSize(10);
  const getStatutColor = (statut: string): [number, number, number] => {
  const colors: Record<string, [number, number, number]> = {
    brouillon: [108, 117, 125],
    confirmée: [23, 162, 184],
    expédiée: [0, 123, 255],
    livrée: [40, 167, 69],
    annulée: [220, 53, 69]
  };
  return colors[statut] || colors.brouillon;
};

// Utilisation (sans spread)
const [r, g, b] = getStatutColor(commande.statut);
doc.setTextColor(r, g, b);
  doc.text(`${typeText} - ${commande.statut.toUpperCase()}`, 14, 42);
  doc.setTextColor(0, 0, 0); // Retour noir
  
  // Date
  doc.text(`Date: ${new Date(commande.date_commande).toLocaleDateString('fr-FR')}`, 180, 35, { align: 'right' });

  // Informations principales
  const startY = 55;
  
  // Client et Fournisseur
  (doc as any).autoTable({
    startY: startY,
    head: [['CLIENT', 'FOURNISSEUR']],
    body: [[
      `Nom: ${commande.client?.nom || 'Non spécifié'}\nEmail: ${commande.client?.email || '-'}\nTél: ${commande.client?.telephone || '-'}\nAdresse: ${commande.client?.adresse || '-'}`,
      `Nom: ${commande.fournisseur?.nom || 'Non spécifié'}\nEmail: ${commande.fournisseur?.email || '-'}\nTél: ${commande.fournisseur?.telephone || '-'}`
    ]],
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [41, 128, 185] },
    columnStyles: {
      0: { cellWidth: 95 },
      1: { cellWidth: 95 }
    }
  });

  // Articles commandés
  const yAfterClient = (doc as any).lastAutoTable?.finalY || startY;
  doc.setFontSize(12);
  doc.text('ARTICLES COMMANDÉS', 14, yAfterClient + 15);
  
  if (commande.lignes && commande.lignes.length > 0) {
    (doc as any).autoTable({
      startY: yAfterClient + 20,
      head: [['Article', 'Description', 'Qté', 'Prix Unitaire', 'TVA', 'Montant HT']],
      body: commande.lignes.map(ligne => {
        const montantHT = ligne.quantite * parseFloat(ligne.prix_unitaire.toString());
        return [
          ligne.article_id?.toString() || '-',
          ligne.description || '-',
          ligne.quantite.toString(),
          new Intl.NumberFormat('fr-FR', { 
            style: 'currency', 
            currency: commande.devise 
          }).format(parseFloat(ligne.prix_unitaire.toString())),
          `${ligne.taux_tva}%`,
          new Intl.NumberFormat('fr-FR', { 
            style: 'currency', 
            currency: commande.devise 
          }).format(montantHT)
        ];
      }),
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [52, 152, 219], fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 20 }, // Article
        1: { cellWidth: 60 }, // Description
        2: { cellWidth: 15 }, // Qté
        3: { cellWidth: 30 }, // Prix
        4: { cellWidth: 20 }, // TVA
        5: { cellWidth: 35 }  // Montant HT
      }
    });
  }

  // Totaux
  const yAfterArticles = (doc as any).lastAutoTable?.finalY || yAfterClient + 20;
  
  (doc as any).autoTable({
    startY: yAfterArticles + 10,
    body: [
      ['Sous-total HT:', new Intl.NumberFormat('fr-FR', { style: 'currency', currency: commande.devise }).format(totalHT)],
      ['TVA:', new Intl.NumberFormat('fr-FR', { style: 'currency', currency: commande.devise }).format(totalTVA)],
      ['TOTAL TTC:', new Intl.NumberFormat('fr-FR', { style: 'currency', currency: commande.devise }).format(totalTTC)]
    ],
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 150 },
      1: { fontStyle: 'bold', cellWidth: 40, halign: 'right' }
    },
    margin: { left: 130 }
  });

  // Informations d'expédition si disponible
  if (commande.expedition) {
    const yAfterTotals = (doc as any).lastAutoTable?.finalY || yAfterArticles + 10;
    doc.setFontSize(12);
    doc.text('INFORMATIONS D\'EXPÉDITION', 14, yAfterTotals + 15);
    
    const getStatutText = (statut: string) => {
      const texts: Record<string, string> = {
        preparation: 'En préparation',
        'expédiée': 'Expédiée',
        transit: 'En transit',
        arrivée: 'Arrivée',
        livrée: 'Livrée'
      };
      return texts[statut] || statut;
    };
    
    (doc as any).autoTable({
      startY: yAfterTotals + 20,
      head: [['Information', 'Détail']],
      body: [
        ['Transporteur', commande.expedition.transporteur || 'Non spécifié'],
        ['Mode de transport', commande.expedition.mode_transport || 'Non spécifié'],
        ['Statut', getStatutText(commande.expedition.statut)],
        ['Date d\'expédition', commande.expedition.date_expedition 
          ? new Date(commande.expedition.date_expedition).toLocaleDateString('fr-FR')
          : 'Non planifiée'],
        ['Date d\'arrivée prévue', commande.expedition.date_arrivee_prevue
          ? new Date(commande.expedition.date_arrivee_prevue).toLocaleDateString('fr-FR')
          : 'Non spécifiée'],
        ['Numéro BL', commande.expedition.numero_bl || '-'],
        ['Numéro Connaissement', commande.expedition.numero_connaissement || '-'],
        ['Numéro Packing List', commande.expedition.numero_packing_list || '-']
      ],
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [155, 89, 182] }
    });
  }

  // Analyse de marge si disponible
  if (marge) {
    const yAfterExpedition = (doc as any).lastAutoTable?.finalY || 0;
    let yMarge = yAfterExpedition > 0 ? yAfterExpedition + 15 : yAfterArticles + 80;
    
    doc.setFontSize(12);
    doc.text('ANALYSE DE RENTABILITÉ', 14, yMarge);
    
    const getTauxMargeColor = (taux: number): number[] => {
      if (taux >= 20) return [40, 167, 69]; // Vert
      if (taux >= 10) return [255, 193, 7]; // Jaune
      return [220, 53, 69]; // Rouge
    };
    
    (doc as any).autoTable({
      startY: yMarge + 5,
      head: [['Métrique', 'Montant']],
      body: [
        ['Chiffre d\'affaires', new Intl.NumberFormat('fr-FR', { style: 'currency', currency: commande.devise }).format(marge.chiffre_affaires)],
        ['Coûts logistiques', new Intl.NumberFormat('fr-FR', { style: 'currency', currency: commande.devise }).format(marge.total_couts)],
        ['Marge brute', new Intl.NumberFormat('fr-FR', { style: 'currency', currency: commande.devise }).format(marge.marge_brute)],
        ['Taux de marge', `${marge.taux_marge.toFixed(1)}%`]
      ],
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [40, 167, 69] },
      bodyStyles: {
        3: { textColor: getTauxMargeColor(marge.taux_marge), fontStyle: 'bold' }
      }
    });
  }

  // Pied de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Page ${i} sur ${pageCount} - Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
      14,
      doc.internal.pageSize.height - 10
    );
    doc.setTextColor(0, 0, 0);
  }

  // Sauvegarde
  doc.save(`bon-commande-${commande.numero_commande}.pdf`);
};