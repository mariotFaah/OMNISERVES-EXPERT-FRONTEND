import type { Facture, FactureAvecPaiement, RapportTVA, RapportTresorerie } from '../types';

export interface ExcelOptions {
  filename?: string;
  sheetName?: string;
  includeHeader?: boolean;
  includeFooter?: boolean;
}

class ExcelService {
  private async generateFactureExcel(facture: Facture | FactureAvecPaiement, options: ExcelOptions = {}) {
    const {
      filename = `facture_${facture.numero_facture}.xlsx`,
      sheetName = 'Facture',
      includeHeader = true
    } = options;

    // Importer la bibliothèque
    const { utils, writeFile } = await import('xlsx');

    // Créer un nouveau classeur
    const wb = utils.book_new();

    // Préparer les données
    const data = [];

    // En-tête
    if (includeHeader) {
      data.push(['OMNISERVE EXPERTS']);
      data.push(['2239 Ambodisaina Ivondro Tamatave']);
      data.push(['+261 32 77 531 69 | contact@omniserve.experts']);
      data.push([]);
      
      const typeLabels = {
        facture: 'FACTURE',
        proforma: 'PROFORMA',
        avoir: 'AVOIR'
      };
      
      data.push([`${typeLabels[facture.type_facture]} N° ${facture.numero_facture}`]);
      data.push([]);
    }

    // Informations client et facture
    data.push(['INFORMATIONS CLIENT', '', 'INFORMATIONS FACTURE']);
    data.push([
      facture.nom_tiers || '',
      '',
      `Date: ${new Date(facture.date).toLocaleDateString('fr-FR')}`
    ]);
    data.push([
      facture.adresse || '',
      '',
      `Échéance: ${new Date(facture.echeance).toLocaleDateString('fr-FR')}`
    ]);
    data.push([
      facture.telephone ? `Tél: ${facture.telephone}` : '',
      '',
      `Statut: ${this.getStatutLabel(facture.statut)}`
    ]);
    data.push([
      facture.email ? `Email: ${facture.email}` : '',
      '',
      `Mode règlement: ${facture.reglement}`
    ]);
    data.push([
      facture.type_tiers ? `Type: ${facture.type_tiers}` : '',
      '',
      `Devise: ${facture.devise || 'MGA'}`
    ]);
    
    if (facture.taux_change && facture.taux_change !== 1) {
      data.push([
        facture.numero_tiers ? `N°: ${facture.numero_tiers}` : '',
        '',
        `Taux change: 1 ${facture.devise} = ${this.safeToFixed(facture.taux_change, 4)} MGA`
      ]);
    } else {
      data.push([
        facture.numero_tiers ? `N°: ${facture.numero_tiers}` : '',
        '',
        ''
      ]);
    }

    data.push([]);
    data.push(['DÉTAIL DES ARTICLES']);
    data.push([]);

    // En-tête du tableau des articles
    data.push([
      'Référence',
      'Description',
      'Quantité',
      'Prix Unitaire',
      'Remise %',
      'TVA %',
      'Montant HT',
      'Montant TVA',
      'Montant TTC'
    ]);

    // Lignes de facture
    facture.lignes.forEach(ligne => {
      data.push([
        ligne.code_article || '',
        ligne.description || '',
        ligne.quantite,
        ligne.prix_unitaire,
        ligne.remise > 0 ? `${ligne.remise}%` : '-',
        `${ligne.taux_tva}%`,
        ligne.montant_ht || 0,
        ligne.montant_tva || 0,
        ligne.montant_ttc || 0
      ]);
    });

    data.push([]);

    // Totaux
    data.push(['', '', '', '', '', '', 'Total HT:', facture.total_ht]);
    data.push(['', '', '', '', '', '', 'Total TVA:', facture.total_tva]);
    data.push(['', '', '', '', '', '', 'Total TTC:', facture.total_ttc]);

    // Informations de paiement si existantes
    const montantPaye = 'montant_paye' in facture ? facture.montant_paye : 0;
    if (montantPaye && montantPaye > 0) {
      data.push([]);
      data.push(['INFORMATIONS DE PAIEMENT']);
      data.push(['Montant payé:', montantPaye]);
      data.push(['Montant restant:', (facture.montant_restant || facture.total_ttc)]);
      const progression = ((montantPaye / facture.total_ttc) * 100).toFixed(1);
      data.push(['Progression:', `${progression}%`]);
    }

    // Informations de paiement flexible
    if (facture.type_paiement && facture.type_paiement !== 'comptant') {
      data.push([]);
      data.push(['CONFIGURATION DU PAIEMENT']);
      data.push([`Type: ${this.getPaiementLabel(facture.type_paiement)}`]);
      
      if (facture.date_finale_paiement) {
        data.push([`Date finale: ${new Date(facture.date_finale_paiement).toLocaleDateString('fr-FR')}`]);
      }
      
      if (facture.montant_minimum_paiement && facture.montant_minimum_paiement > 0) {
        data.push([`Minimum par paiement: ${facture.montant_minimum_paiement}`]);
      }
      
      if (facture.montant_acompte && facture.montant_acompte > 0) {
        data.push([`Acompte: ${facture.montant_acompte}`]);
      }
      
      if (facture.penalite_retard && facture.penalite_retard > 0) {
        data.push([`Pénalité retard: ${facture.penalite_retard}%`]);
      }
    }

    // Pied de page
    data.push([]);
    data.push([`Document généré le ${new Date().toLocaleDateString('fr-FR')} - OMNISERVE EXPERTS`]);

    // Créer la feuille
    const ws = utils.aoa_to_sheet(data);

    // Ajouter la feuille au classeur
    utils.book_append_sheet(wb, ws, sheetName);

    // Sauvegarder le fichier
    writeFile(wb, filename);
  }

  private async generateFactureListExcel(factures: (Facture | FactureAvecPaiement)[], options: ExcelOptions = {}) {
    const {
      filename = `liste_factures_${new Date().toISOString().split('T')[0]}.xlsx`,
      sheetName = 'Liste Factures',
      includeHeader = true
    } = options;

    const { utils, writeFile } = await import('xlsx');
    const wb = utils.book_new();

    const data = [];

    // En-tête
    if (includeHeader) {
      data.push(['LISTE DES FACTURES']);
      data.push([`Généré le ${new Date().toLocaleDateString('fr-FR')}`]);
      data.push([]);
    }

    // En-tête du tableau
    data.push([
      'N° Facture',
      'Client',
      'Date',
      'Type',
      'Statut',
      'Devise',
      'Total HT',
      'Total TVA',
      'Total TTC',
      'Montant Payé',
      'Montant Restant',
      'Progression %'
    ]);

    // Données des factures
    factures.forEach(facture => {
      const montantPaye = 'montant_paye' in facture ? facture.montant_paye ?? 0 : 0;
      const montantPayeNum = typeof montantPaye === 'number' ? montantPaye : Number(montantPaye) || 0;
      const totalTtcNum = Number(facture.total_ttc) || 0;
      const montantRestant = 'montant_restant' in facture ? facture.montant_restant ?? totalTtcNum : totalTtcNum;
      const progression = totalTtcNum > 0 ? ((montantPayeNum / totalTtcNum) * 100).toFixed(1) : '0.0';

      data.push([
        facture.numero_facture,
        facture.nom_tiers || '',
        new Date(facture.date).toLocaleDateString('fr-FR'),
        facture.type_facture,
        this.getStatutLabel(facture.statut),
        facture.devise || 'MGA',
        facture.total_ht,
        facture.total_tva,
        facture.total_ttc,
        montantPaye,
        montantRestant,
        progression
      ]);
    });

    const ws = utils.aoa_to_sheet(data);
    utils.book_append_sheet(wb, ws, sheetName);
    writeFile(wb, filename);
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

  private getPaiementLabel(typePaiement: string): string {
    const labels: { [key: string]: string } = {
      flexible: 'Paiement flexible',
      acompte: 'Acompte',
      echeance: 'Échéance',
      comptant: 'Comptant'
    };
    return labels[typePaiement] || typePaiement;
  }

  private safeToFixed(value: any, decimals: number = 4): string {
    if (value == null || value === '') return '0.0000';
    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) {
      return String(value);
    }
    return num.toFixed(decimals);
  }

  // Méthodes publiques
  async exportFacture(facture: Facture | FactureAvecPaiement, options?: ExcelOptions) {
    await this.generateFactureExcel(facture, options);
  }

  async exportFactureList(factures: (Facture | FactureAvecPaiement)[], options?: ExcelOptions) {
    await this.generateFactureListExcel(factures, options);
  }

  async exportRapportTVA(rapport: RapportTVA, options?: ExcelOptions) {
    const { utils, writeFile } = await import('xlsx');
    const wb = utils.book_new();

    const data = [
      ['RAPPORT TVA'],
      ['Période:', rapport.periode || 'Non spécifiée'],
      [],
      ['TVA Collectée:', rapport.tva_collectee],
      ['TVA Déductible:', rapport.tva_deductable],
      ['TVA à Payer:', rapport.tva_a_payer],
      [],
      ['Note:', rapport.note || 'Aucune note']
    ];

    const ws = utils.aoa_to_sheet(data);
    utils.book_append_sheet(wb, ws, 'Rapport TVA');
    writeFile(wb, options?.filename || 'rapport_tva.xlsx');
  }

  async exportRapportTresorerie(rapport: RapportTresorerie, options?: ExcelOptions) {
    const { utils, writeFile } = await import('xlsx');
    const wb = utils.book_new();

    const data = [
      ['RAPPORT TRÉSORERIE'],
      ['Période:', rapport.periode || 'Non spécifiée'],
      [],
      ['Entrées:', rapport.entrees],
      ['Sorties prévues:', rapport.sorties_prevues],
      ['Solde trésorerie:', rapport.solde_tresorerie],
      [],
      ['Note:', rapport.note || 'Aucune note']
    ];

    const ws = utils.aoa_to_sheet(data);
    utils.book_append_sheet(wb, ws, 'Rapport Trésorerie');
    writeFile(wb, options?.filename || 'rapport_tresorerie.xlsx');
  }
}

export const excelService = new ExcelService();
export default excelService;