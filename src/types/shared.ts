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
  reference : string; // Référence optionnelle
}
