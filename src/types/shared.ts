// src/types/shared.ts
export interface Tiers {
  id_tiers: number;  // Identifiant principal
  nom: string;       // Nom obligatoire
  type_tiers: 'client' | 'fournisseur';  // Type obligatoire et typé
  numero: string;    // Numéro obligatoire (ex: SIRET, NIF...)
  adresse: string;   // Adresse obligatoire
  email?: string;    // Email optionnel
  telephone?: string; // Téléphone optionnel
  devise_preferee?: string; // Devise préférée optionnelle
  reference?: string; // Référence optionnelle
  
  // Nouveaux champs ajoutés
  siret?: string;                     // SIRET/NIF optionnel
  forme_juridique?: string;           // Forme juridique optionnelle
  secteur_activite?: string;          // Secteur d'activité optionnel
  categorie?: string;                 // Catégorie optionnelle
  chiffre_affaires_annuel?: string | number; // CA annuel optionnel
  effectif?: string | number;         // Effectif optionnel
  notes?: string;                     // Notes internes optionnelles
  site_web?: string;                  // Site web optionnel
  responsable_commercial?: string;    // Responsable commercial optionnel
  date_premier_contact?: string;      // Date premier contact optionnelle
  date_derniere_activite?: string;    // Date dernière activité optionnelle
  created_at?: string;                // Date de création
  updated_at?: string;                // Date de modification
}