// src/modules/crm/types/index.ts

// ==================== TYPES PRINCIPAUX ====================

export interface Client {
  // Données de base
  id_tiers: number;
  nom: string;
  type_tiers: string;
  raison_sociale?: string; 
  numero: string;
  adresse: string;
  email: string;
  telephone: string;
  created_at: string;
  updated_at: string;
  devise_preferee: string;

  // Données CRM étendues
  siret?: string;
  forme_juridique?: string;
  secteur_activite?: string;
  categorie?: 'prospect' | 'client' | 'fournisseur' | 'partenaire';
  chiffre_affaires_annuel?: number;
  effectif?: number;
  notes?: string;
  site_web?: string;
  responsable_commercial?: string;
  date_premier_contact?: string;
  date_derniere_activite?: string;

  // Relations
  contacts?: Contact[];
  devis?: Devis[];
  contrats?: Contrat[];
  activites?: Activite[];
  relances?: Relance[];
  stats?: ClientStats;
}

export interface Contact {
  id_contact: number;
  tiers_id: number;
  nom: string;
  prenom?: string;
  fonction?: string;
  email?: string;
  telephone?: string;
  principal: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Devis {
  id_devis: number;
  numero_devis: string;
  client_email: string;
  client_adresse: string;
  client_telephone: string;
  tiers_id: number;
  client_nom?: string;
  date_devis: string;
  date_validite?: string;
  statut: 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire';
  montant_ht: number;
  montant_ttc: number;
  objet?: string;
  description?: string;
  conditions?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  client?: {
    nom: string;
    numero: string;
    adresse: string;
    email: string;
    telephone: string;
  };
}

export interface Contrat {
  id_contrat: number;
  numero_contrat: string;
  client_email: string;
  tiers_id: number;
  devis_id?: number;
  type_contrat: string;
  date_debut: string;
  date_fin?: string;
  statut: 'actif' | 'inactif' | 'resilie' | 'termine';
  montant_ht: number;
  periodicite: string;
  description: string;
  conditions: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  client_nom?: string;
  devis_numero?: string;
}

export interface Activite {
  id_activite: number;
  tiers_id: number;
  type_activite: 'appel' | 'email' | 'reunion' | 'visite';
  sujet: string;
  description?: string;
  date_activite: string;
  date_rappel?: string;
  statut: 'planifie' | 'realise' | 'annule';
  priorite: 'bas' | 'normal' | 'haut' | 'urgent';
  utilisateur_id?: number;
  created_at: string;
  updated_at: string;
  
  // Relations
  client_nom?: string;
}

export interface Relance {
  id_relance: number;
  tiers_id: number;
  type_relance: 'paiement' | 'contrat' | 'echeance' | 'commerciale';
  objet: string;
  message?: string;
  date_relance: string;
  echeance?: string;
  statut: 'en_attente' | 'envoyee' | 'traitee' | 'annulee';
  canal: 'email' | 'telephone' | 'courrier' | 'sms';
  facture_id?: number;
  contrat_id?: number;
  created_at: string;
  updated_at: string;
  
  // Relations
  client?: {
    nom: string;
    email: string;
  };
  facture?: {
    numero_facture: number;
    total_ttc: number;
  };
  contrat?: {
    numero_contrat: string;
    type_contrat: string;
  };
}

// ==================== TYPES STATISTIQUES ====================

export interface ClientStats {
  id_tiers: number;
  total_devis: number;
  total_contrats: number;
  total_activites: number;
  ca_devis: number;
  ca_contrats: number;
  total_commandes?: number;
  commandes_en_cours?: number;
  commandes_terminees?: number;
  chiffre_affaires_import_export?: number;
  chiffre_affaires_comptabilite?: number;
}

export interface DevisStats {
  par_statut: Array<{
    statut: string;
    count: number;
  }>;
  total_chiffre_affaires: number;
}

export interface RelanceStats {
  total: number;
  par_statut: {
    en_attente: number;
    envoyee: number;
    traitee: number;
    annulee: number;
  };
  par_type: {
    paiement: number;
    contrat: number;
    echeance: number;
    commerciale: number;
  };
  par_canal: {
    email: number;
    telephone: number;
    courrier: number;
    sms: number;
  };
}

// ==================== VUE 360° ====================

export interface ActiviteConsolidee {
  id_activite?: number;
  type_activite: string;
  priorite?: string;
  sujet: string;
  description?: string;
  date_activite: string;
  statut: string;
  module_origine: 'crm' | 'comptabilite' | 'import-export';
  reference_id?: number;
  reference_type?: string;
  montant?: number;
  devise?: string;
  client_id?: number;
  client_nom?: string;
}

// ==================== FORMULAIRES ====================

export interface ClientCRMFormData {
  categorie: 'prospect' | 'client' | 'fournisseur' | 'partenaire';
  forme_juridique?: string;
  secteur_activite?: string;
  chiffre_affaires_annuel?: number;
  effectif?: number;
  responsable_commercial?: string;
  date_premier_contact?: string;
  site_web?: string;
  notes?: string;
}

export interface DevisFormData {
  tiers_id: number;
  date_devis: string;
  date_validite?: string;
  objet: string;
  description?: string;
  montant_ht: number;
  conditions?: string;
}

export interface ContactFormData {
  tiers_id: number;
  nom: string;
  prenom?: string;
  fonction?: string;
  email?: string;
  telephone?: string;
  principal: boolean;
  notes?: string;
}

export interface RelanceFormData {
  tiers_id: number;
  type_relance: 'paiement' | 'contrat' | 'echeance' | 'commerciale';
  objet: string;
  message?: string;
  date_relance: string;
  echeance?: string;
  canal: 'email' | 'telephone' | 'courrier' | 'sms';
  facture_id?: number;
  contrat_id?: number;
}

export interface ActiviteFormData {
  tiers_id: number;
  type_activite: 'appel' | 'email' | 'reunion' | 'visite';
  sujet: string;
  description?: string;
  date_activite: string;
  date_rappel?: string;
  priorite: 'bas' | 'normal' | 'haut' | 'urgent';
}