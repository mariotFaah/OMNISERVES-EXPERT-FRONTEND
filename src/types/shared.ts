// src/types/shared.ts
export interface Tiers {
  // Champs de la table tiers (exactement comme dans la base)
  id_tiers?: number;  // AUTO_INCREMENT, optionnel à la création
  type_tiers: 'client' | 'fournisseur';
  nom: string;
  numero?: string | null;
  siret?: string | null;
  forme_juridique?: string | null;
  secteur_activite?: string | null;
  categorie?: 'prospect' | 'client' | 'fournisseur' | 'partenaire' | null;
  chiffre_affaires_annuel?: number | null;
  effectif?: number | null;
  notes?: string | null;
  site_web?: string | null;
  responsable_commercial?: string | null;
  date_premier_contact?: string | null; // Format: 'YYYY-MM-DD'
  date_derniere_activite?: string | null; // Format: 'YYYY-MM-DD'
  adresse?: string | null;
  email?: string | null;
  telephone?: string | null;
  created_at?: string; // Format: 'YYYY-MM-DD HH:MM:SS'
  updated_at?: string; // Format: 'YYYY-MM-DD HH:MM:SS'
  devise_preferee?: string; // DEFAULT 'MGA'
  
  // Champs optionnels du frontend (n'existent pas dans la base mais peuvent être utiles)
  reference?: string; // Utilisé dans le frontend mais pas dans la base
  selected?: boolean; // Pour la sélection dans l'UI
  loading?: boolean;  // Pour les états de chargement
}

// Interface pour la création (sans id_tiers et champs auto-générés)
export interface CreateTiersDTO {
  type_tiers: 'client' | 'fournisseur';
  nom: string;
  numero?: string | null;
  siret?: string | null;
  forme_juridique?: string | null;
  secteur_activite?: string | null;
  categorie?: 'prospect' | 'client' | 'fournisseur' | 'partenaire' | null;
  chiffre_affaires_annuel?: number | null;
  effectif?: number | null;
  notes?: string | null;
  site_web?: string | null;
  responsable_commercial?: string | null;
  date_premier_contact?: string | null;
  date_derniere_activite?: string | null;
  adresse?: string | null;
  email?: string | null;
  telephone?: string | null;
  devise_preferee?: string; // DEFAULT 'MGA'
  reference?: string; // Champ frontend seulement
}

// Interface pour la mise à jour (tous les champs optionnels)
export interface UpdateTiersDTO {
  type_tiers?: 'client' | 'fournisseur';
  nom?: string;
  numero?: string | null;
  siret?: string | null;
  forme_juridique?: string | null;
  secteur_activite?: string | null;
  categorie?: 'prospect' | 'client' | 'fournisseur' | 'partenaire' | null;
  chiffre_affaires_annuel?: number | null;
  effectif?: number | null;
  notes?: string | null;
  site_web?: string | null;
  responsable_commercial?: string | null;
  date_premier_contact?: string | null;
  date_derniere_activite?: string | null;
  adresse?: string | null;
  email?: string | null;
  telephone?: string | null;
  devise_preferee?: string;
  reference?: string; // Champ frontend seulement
}