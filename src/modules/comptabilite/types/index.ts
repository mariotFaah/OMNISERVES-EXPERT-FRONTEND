// src/modules/comptabilite/types/index.ts
import type { Tiers } from '../../../types/shared';
export type { Tiers };

export interface PaiementFlexibleConfig {
  type_paiement: 'comptant' | 'flexible' | 'acompte' | 'echeance';
  date_finale_paiement: string; 
  montant_minimum_paiement: number; 
  penalite_retard: number; 
  montant_acompte: number; 
  mode_paiement_acompte: string; 
}


export interface LigneFacture {
  id_ligne?: number;
  numero_facture?: number;
  id_tiers?:number;
  code_article: string;
  description: string;
  quantite: number;
  prix_unitaire: number;
  taux_tva: number;
  remise: number;
  montant_ht?: number;
  montant_tva?: number;
  montant_ttc?: number;
  article_description?: string;
  article_unite?: string;
}

/// src/modules/comptabilite/types.ts
export interface ArticleBackend {
  code_article: string;
  description: string;
  prix_unitaire: number;
  taux_tva: number;
  unite: string;
  devise?: string;
  actif?: boolean;
  quantite_stock?: number;
  seuil_alerte?: number; // Nom utilisé par le backend
  statut_stock?: 'disponible' | 'stock_faible' | 'rupture';
  created_at?: string;
  updated_at?: string;
}
export interface Article {
  code_article: string;
  description: string;
  prix_unitaire: number;
  taux_tva: number;
  unite: string;
  devise?: string;
  actif?: boolean;
  
  // CORRECTION: utiliser les noms exacts de la base de données
  quantite_stock?: number;
  seuil_alerte?: number; // Changé de seuil_alerte à seuil_alerte
  statut_stock?: 'disponible' | 'stock_faible' | 'rupture'; // Note: 'disponible' au lieu de 'en_stock'
  
  created_at?: string;
  updated_at?: string;
}

// Interface pour la mise à jour du stock
export interface UpdateStockRequest {
  quantite_stock: number;
  seuil_alerte?: number;
}

// Interface pour l'ajustement du stock
export interface AdjustStockRequest {
  quantite: number;
  raison?: string;
}

// Interface pour la réponse de disponibilité
export interface DisponibiliteResponse {
  disponible: boolean;
  quantite_disponible: number;
  quantite_demandee: number;
  suffisant: boolean;
  message?: string;
}

// Interface pour les alertes de stock
export interface StockAlerte {
  code_article: string;
  description: string;
  quantite_stock: number;
  seuil_alerte: number;
  statut_stock: string;
  priorite: 'faible' | 'rupture';
}


export interface Facture {
  numero_facture?: number;
  date: string;
  type_facture: 'facture' | 'proforma' | 'avoir';
  id_tiers: number;
  echeance: string;
  reglement: 'virement' | 'cheque' | 'espece' | 'carte';
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  statut: 'brouillon' | 'validee' | 'annulee' | 'payee' | 'partiellement_payee' | 'en_retard' | 'non_payee';
  nom_tiers?: string;
  adresse?: string;
  email?: string;
  telephone?: string;
  telephone_tiers?: string; 
  type_tiers?: 'client' | 'fournisseur';
  numero_tiers?: string;
  devise?: string;
  taux_change?: number;
  notes?: string;
  lignes: LigneFacture[];
  
  // NOUVELLES PROPRIÉTÉS PAIEMENT FLEXIBLE
  type_paiement?: 'comptant' | 'flexible' | 'acompte' | 'echeance';
  date_finale_paiement?: string;
  montant_minimum_paiement?: number;
  penalite_retard?: number;
  montant_acompte?: number;
  mode_paiement_acompte?: string;
  
  // STATUTS DE PAIEMENT - CORRIGÉ (avec deux 'e')
  montant_paye?: number;
  montant_restant?: number;
  statut_paiement?: 'non_payee' | 'partiellement_payee' | 'payee' | 'en_retard';
  
  created_at?: string;
  updated_at?: string;
}

export interface FactureAvecPaiement extends Omit<Facture, 'type_paiement' | 'statut_paiement' | 'montant_paye' | 'montant_restant'> {
  // CORRECTION : utiliser les mêmes noms que dans Facture (avec deux 'e')
  statut_paiement: 'non_payee' | 'partiellement_payee' | 'payee' | 'en_retard';
  type_paiement: 'comptant' | 'flexible' | 'acompte' | 'echeance';
  montant_paye: number;
  montant_restant: number;
  date_finale_paiement?: string;
  montant_minimum_paiement?: number;
  penalite_retard?: number;
  date_echeance: Date;
  historique_paiements?: {
    paiements: Paiement[];
    resume: {
      total_paye: number;
      nombre_paiements: number;
      premier_paiement: string | null;
      dernier_paiement: string | null;
    };
  };
}

export interface FactureFormData {
  facture: Omit<Facture, 'numero_facture' | 'lignes' | 'created_at' | 'updated_at'>;
  lignes: Omit<LigneFacture, 'id_ligne' | 'numero_facture' | 'montant_ht' | 'montant_tva' | 'montant_ttc'>[];
}

export interface Paiement {
  id_paiement?: number;
  numero_facture: number;
  date_paiement: string;
  montant: number;
  mode_paiement: 'espèce' | 'virement' | 'chèque' | 'carte';
  reference?: string;
  statut: 'validé' | 'en_attente' | 'annulé';
  devise: string;
  taux_change: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TauxChange {
  id_taux?: number;
  devise_source: string;
  devise_cible: string;
  taux: number;
  date_effet: string;
  actif: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EcritureComptable {
  id_ecriture?: number;
  numero_ecriture: string;
  date: string;
  journal: 'ventes' | 'achats' | 'banque' | 'caisse';
  compte: string;
  libelle: string;
  debit: number;
  credit: number;
  devise: string;
  taux_change: number;
  reference?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ConversionDevise {
  montant: number;
  devise_source: string;
  devise_cible: string;
  date?: string;
  taux: number;
}

// TYPES POUR LES RAPPORTS - AMÉLIORÉS AVEC DONNÉES RÉELLES
export interface RapportBilan {
  [compte: string]: {
    debit: number;
    credit: number;
    solde: number;
  };
}

export interface RapportCompteResultat {
  charges: number;
  produits: number;
  resultat_net: number;
  periode?: string;
}

export interface RapportTresorerie {
  entrees: number;
  sorties_prevues: number;
  solde_tresorerie: number;
  periode?: string;
  details?: {
    total_paiements: number;
    total_factures: number;
    date_generation?: string;
  };
  note?: string;
}

export interface RapportTVA {
  tva_collectee: number;
  tva_deductable: number;
  tva_a_payer: number;
  periode?: string;
  nombre_ecritures?: number;
  details?: {
    comptes_collectee: string[];
    comptes_deductible: string[];
    date_generation?: string;
  };
  note?: string;
}

// TYPES POUR LES RÉFÉRENTIELS DYNAMIQUES
export interface PlanComptable {
  numero_compte: string;
  libelle: string;
  type_compte: 'actif' | 'passif' | 'charge' | 'produit';
  categorie: string;
  actif?: boolean;
  type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TypeFacture {
  code: string;
  libelle: string;
  actif?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ModePaiement {
  code: string;
  libelle: string;
  actif?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TauxTVA {
  taux: number;
  libelle: string;
  actif?: boolean;
  created_at?: string;
  updated_at?: string;
}

// TYPES POUR LES STATISTIQUES
export interface IndicateursStats {
  total_clients: number;
  total_fournisseurs: number;
  total_factures: number;
  total_paiements: number;
  chiffre_affaire: number;
  factures_impayees: number;
  tresorerie: number;
}

export interface ChiffreAffaireStats {
  periode: string;
  montant: number;
  evolution?: number;
}

export interface TopClient {
  nom: string;
  chiffre_affaire: number;
  nombre_factures: number;
}

export interface TopProduit {
  code_article: string;
  description: string;
  quantite_vendue: number;
  chiffre_affaire: number;
}

// TYPES POUR LES ÉCHÉANCES
export interface Echeance {
  numero_facture: number;
  nom_tiers: string;
  date_echeance: string;
  montant: number;
  statut: 'payee' | 'en_retard' | 'a_venir';
  jours_restants?: number;
}

// TYPES POUR LES JOURNAUX COMPTABLES
export interface JournalComptable {
  journal: 'ventes' | 'achats' | 'banque' | 'caisse';
  ecritures: EcritureComptable[];
  total_debit: number;
  total_credit: number;
  solde: number;
}

// TYPES POUR LES ÉTATS FINANCIERS COMPLETS
export interface EtatFinancier {
  bilan: RapportBilan;
  compte_resultat: RapportCompteResultat;
  tva: RapportTVA;
  tresorerie: RapportTresorerie;
  periode: string;
  date_generation: string;
}

// TYPES POUR LES RÉPONSES API STANDARDISÉES
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  timestamp: string;
}

// TYPES POUR LES FILTRES
export interface FiltrePeriode {
  date_debut?: string;
  date_fin?: string;
}

export interface FiltreFactures extends FiltrePeriode {
  type_facture?: string;
  statut?: string;
  id_tiers?: number;
}

export interface FiltrePaiements extends FiltrePeriode {
  mode_paiement?: string;
  statut?: string;
}

// TYPES POUR LES DONNÉES D'IMPORT/EXPORT
export interface ExportData {
  format: 'pdf' | 'excel' | 'csv';
  data: any;
  options?: {
    periode?: string;
    include_details?: boolean;
    password_protected?: boolean;
  };
}

// TYPES POUR LES CALCULS FINANCIERS
export interface CalculTVA {
  montant_ht: number;
  taux_tva: number;
  montant_tva: number;
  montant_ttc: number;
}

export interface CalculDevise {
  montant_origine: number;
  devise_origine: string;
  montant_converti: number;
  devise_cible: string;
  taux_change: number;
  date_conversion: string;
}

// TYPES POUR LES ALERTES ET NOTIFICATIONS
export interface AlerteFinanciere {
  type: 'echeance' | 'tresorerie' | 'tva' | 'seuil';
  titre: string;
  message: string;
  severite: 'info' | 'warning' | 'error';
  date_creation: string;
  lue: boolean;
}


// Ajoutez cette interface dans votre fichier types
export interface TauxChange {
  id_taux?: number;
  devise_source: string;
  devise_cible: string;
  taux: number;
  date_effet: string;
  actif: boolean;
  created_at?: string;
  updated_at?: string;
}

// Si vous avez besoin de types pour la conversion
export interface ConversionDevise {
  montant_original: number;
  montant_converti: number;
  devise_source: string;
  devise_cible: string;
  taux_applique: number;
  date_conversion: string;
}

// Ajoutez ces interfaces
export interface TauxReelTime {
  USD: number;
  EUR: number;
  date: string;
  base: string;
}

export interface ComparisonData {
  paire: string;
  tauxLocal: number;
  tauxReel: number;
  ecart: number;
  pourcentageEcart: number;
}

// Types pour les relances email
export interface RelanceData {
  numero_facture: number;
  email_client: string;
  nom_client: string;
  montant: number;
  jours_retard: number;
  message_personnalise?: string;
}

export interface RelanceResponse {
  success: boolean;
  message: string;
  data?: {
    message_id: string;
    destinataire: string;
    timestamp: string;
  };
}

export interface RelancesGroupeesResponse {
  success: boolean;
  message: string;
  data?: {
    total: number;
    reussis: number;
    echecs: number;
    details: Array<{
      facture: number;
      client: string;
      success: boolean;
      message_id?: string;
      error?: string;
    }>;
  };
}

// TYPE UTILITAIRE POUR LES FORMULAIRES
export type FormMode = 'create' | 'edit' | 'view';

// TYPE POUR LES OPTIONS DE FILTRES
export interface FilterOptions {
  periodes: { value: string; label: string }[];
  types_facture: { value: string; label: string }[];
  statuts_facture: { value: string; label: string }[];
  modes_paiement: { value: string; label: string }[];
  statuts_paiement: { value: string; label: string }[];
}