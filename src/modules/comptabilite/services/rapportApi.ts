// src/modules/comptabilite/services/rapportApi.ts - VERSION CORRIGÉE
import axios from '../../../core/config/axios';
import type { 
  RapportBilan, 
  RapportCompteResultat, 
  RapportTVA, 
  RapportTresorerie 
} from '../types';

const API_BASE_URL = '/comptabilite';


const extractObject = (response: any): any => {
  console.log('📊 Structure de la réponse rapports:', response.data);
  
  if (response.data.success && response.data.message && typeof response.data.message === 'object') {
    console.log('✅ Extraction depuis response.data.message');
    return response.data.message;
  }
  // Ensuite vérifier data
  else if (response.data.success && response.data.data) {
    console.log('✅ Extraction depuis response.data.data');
    return response.data.data;
  }
  // Sinon retourner data s'il existe
  else if (response.data.data) {
    console.log('✅ Extraction depuis response.data (fallback)');
    return response.data.data;
  }
  
  console.log('✅ Extraction depuis response.data (final)');
  return response.data;
};

export const rapportApi = {
  /**
   * Récupère le bilan comptable avec les données RÉELLES
   */
  getBilan: async (date?: string): Promise<RapportBilan> => {
    try {
      const params = date ? { date } : {};
      
      console.log('📊 Chargement bilan avec params:', params);
      
      const response = await axios.get(`${API_BASE_URL}/rapports/bilan`, { params });
      const bilan = extractObject(response);
      
      console.log('✅ Bilan chargé avec succès:', bilan);
      return bilan || {};
      
    } catch (error: any) {
      console.error('❌ Erreur dans getBilan:', error.response?.data || error.message);
      throw new Error(`Impossible de charger le bilan: ${error.message}`);
    }
  },

  /**
   * Récupère le compte de résultat avec les données RÉELLES
   */
  getCompteResultat: async (date_debut?: string, date_fin?: string): Promise<RapportCompteResultat> => {
    try {
      const params: any = {};
      if (date_debut) params.date_debut = date_debut;
      if (date_fin) params.date_fin = date_fin;
      
      console.log('📈 Chargement compte résultat avec params:', params);
      
      const response = await axios.get(`${API_BASE_URL}/rapports/compte-resultat`, { params });
      const compteResultat = extractObject(response);
      
      console.log('✅ Compte résultat chargé:', compteResultat);
      return compteResultat || { 
        charges: 0, 
        produits: 0, 
        resultat_net: 0, 
        periode: `${date_debut || '2024-01-01'} à ${date_fin || new Date().toISOString().split('T')[0]}` 
      };
      
    } catch (error: any) {
      console.error('❌ Erreur dans getCompteResultat:', error.response?.data || error.message);
      throw new Error(`Impossible de charger le compte de résultat: ${error.message}`);
    }
  },

  /**
   * Récupère l'état de trésorerie avec les données RÉELLES
   */
  getTresorerie: async (date_debut?: string, date_fin?: string): Promise<RapportTresorerie> => {
    try {
      const params: any = {};
      if (date_debut) params.date_debut = date_debut;
      if (date_fin) params.date_fin = date_fin;
      
      console.log('💰 Chargement trésorerie avec params:', params);
      
      const response = await axios.get(`${API_BASE_URL}/rapports/tresorerie`, { params });
      const tresorerie = extractObject(response);
      
      console.log('✅ Trésorerie chargée:', tresorerie);
      return tresorerie || { 
        entrees: 0, 
        sorties_prevues: 0, 
        solde_tresorerie: 0, 
        periode: `${date_debut || '2024-01-01'} à ${date_fin || new Date().toISOString().split('T')[0]}` 
      };
      
    } catch (error: any) {
      console.error('❌ Erreur dans getTresorerie:', error.response?.data || error.message);
      throw new Error(`Impossible de charger la trésorerie: ${error.message}`);
    }
  },

  /**
   * Récupère la déclaration TVA avec les données RÉELLES
   */
  getTVA: async (date_debut?: string, date_fin?: string): Promise<RapportTVA> => {
    try {
      const params: any = {};
      if (date_debut) params.date_debut = date_debut;
      if (date_fin) params.date_fin = date_fin;
      
      console.log('🧾 Chargement TVA avec params:', params);
      
      const response = await axios.get(`${API_BASE_URL}/rapports/tva`, { params });
      const tvaData = extractObject(response);
      
      console.log('✅ TVA chargée avec succès - Données BRUTES:', tvaData);
      
      const tva: RapportTVA = {
        tva_collectee: tvaData.tva_collectee || 0,
        tva_deductable: tvaData.tva_deductable || 0,
        tva_a_payer: tvaData.tva_a_payer || 0,
        periode: `${date_debut || '2024-01-01'} à ${date_fin || new Date().toISOString().split('T')[0]}`,
        nombre_ecritures: tvaData.nombre_ecritures || 0,
        details: tvaData.details,
        note: tvaData.note
      };
      
      console.log('✅ TVA transformée - Données FINALES:', tva);
      
      return tva;
      
    } catch (error: any) {
      console.error('❌ Erreur dans getTVA:', error.response?.data || error.message);
      throw new Error(`Impossible de charger la TVA: ${error.message}`);
    }
  }
};

export default rapportApi;