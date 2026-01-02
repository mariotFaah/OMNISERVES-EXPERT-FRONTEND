// src/modules/import-export/services/api.ts - VERSION COMPLÈTE
import axios from '../../../core/config/axios';
import type { 
  Commande, 
  CommandeFormData, 
  Expedition, 
  ExpeditionFormData, 
  CoutLogistiqueFormData,
  CalculMarge,
  Transporteur,
  Connaissement,
  ConnaissementFormData
} from '../types';

const API_BASE_URL = '/import-export';

// ✅ UTILISER les mêmes fonctions helper que dans api.ts
const extractData = (response: any): any[] => {
  console.log('📊 Structure de la réponse import-export:', response.data);
  
  if (response.data.success && Array.isArray(response.data.data)) {
    return response.data.data;
  } else if (response.data.success && Array.isArray(response.data.message)) {
    return response.data.message;
  } else if (Array.isArray(response.data)) {
    return response.data;
  }
  
  console.warn('⚠️ Aucune donnée valide trouvée dans la réponse import-export');
  return [];
};

// ✅ CORRECTION de la fonction extractObject
const extractObject = (response: any): any => {
  console.log('🔍 [DEBUG] Structure réponse import-export:', response.data);
  
  // ✅ CORRECTION : Vérifier d'abord si message est un objet (cas marge)
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

export const importExportApi = {
  // ---- Commandes API ----
  getCommandes: async (filters?: { type?: string; statut?: string; client_id?: number }): Promise<Commande[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/commandes`, { params: filters });
      return extractData(response);
    } catch (error: any) {
      console.error('❌ Erreur getCommandes:', error.response?.data || error.message);
      if (error.response?.status === 204) return [];
      throw error;
    }
  },

  getCommande: async (id: number): Promise<Commande> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/commandes/${id}`);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur getCommande:', error.response?.data || error.message);
      throw error;
    }
  },
// zah le manampy commentaire amzay maitsomaitso tsara lay github 
  createCommande: async (commandeData: CommandeFormData): Promise<Commande> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/commandes`, commandeData);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur createCommande:', error.response?.data || error.message);
      throw error;
    }
  },

  updateCommandeStatut: async (id: number, statut: string): Promise<Commande> => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/commandes/${id}/statut`, { statut });
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur updateCommandeStatut:', error.response?.data || error.message);
      throw error;
    }
  },

  // ---- Expéditions API ----
  updateExpedition: async (expeditionData: ExpeditionFormData): Promise<Commande> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/commandes/expedition`, expeditionData);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur updateExpedition:', error.response?.data || error.message);
      throw error;
    }
  },

  // ---- Coûts Logistiques API ----
  updateCoutsLogistiques: async (coutsData: CoutLogistiqueFormData): Promise<Commande> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/commandes/couts`, coutsData);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur updateCoutsLogistiques:', error.response?.data || error.message);
      throw error;
    }
  },

  // ---- Calcul de Marge API ----
  calculerMarge: async (commandeId: number): Promise<CalculMarge> => {
    try {
      console.log(`🔍 Appel API marge pour commande ${commandeId}`);
      const response = await axios.get(`${API_BASE_URL}/commandes/${commandeId}/marge`);
      
      console.log('🔍 Réponse brute marge:', response);
      console.log('🔍 response.data:', response.data);
      
      const margeData = extractObject(response);
      console.log('🔍 Données marge extraites:', margeData);
      
      return margeData;
    } catch (error: any) {
      console.error('❌ Erreur calculerMarge:', error.response?.data || error.message);
      throw error;
    }
  },

  // ---- TRANSPORTEURS API ----
  getTransporteurs: async (): Promise<Transporteur[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/transporteurs`);
      return extractData(response);
    } catch (error: any) {
      console.error('❌ Erreur getTransporteurs:', error.response?.data || error.message);
      throw error;
    }
  },

  searchTransporteurs: async (query: string): Promise<Transporteur[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/transporteurs/search?q=${encodeURIComponent(query)}`);
      return extractData(response);
    } catch (error: any) {
      console.error('❌ Erreur searchTransporteurs:', error.response?.data || error.message);
      throw error;
    }
  },

  getTransporteursByType: async (type: string): Promise<Transporteur[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/transporteurs/type/${type}`);
      return extractData(response);
    } catch (error: any) {
      console.error('❌ Erreur getTransporteursByType:', error.response?.data || error.message);
      throw error;
    }
  },

  getTransporteur: async (id: number): Promise<Transporteur> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/transporteurs/${id}`);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur getTransporteur:', error.response?.data || error.message);
      throw error;
    }
  },

  createTransporteur: async (transporteurData: Partial<Transporteur>): Promise<Transporteur> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/transporteurs`, transporteurData);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur createTransporteur:', error.response?.data || error.message);
      throw error;
    }
  },

  updateTransporteur: async (id: number, transporteurData: Partial<Transporteur>): Promise<Transporteur> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/transporteurs/${id}`, transporteurData);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur updateTransporteur:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteTransporteur: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/transporteurs/${id}`);
    } catch (error: any) {
      console.error('❌ Erreur deleteTransporteur:', error.response?.data || error.message);
      throw error;
    }
  },

  // ---- CONNAISSEMENTS API ----
  getConnaissements: async (): Promise<Connaissement[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/connaissements`);
      return extractData(response);
    } catch (error: any) {
      console.error('❌ Erreur getConnaissements:', error.response?.data || error.message);
      throw error;
    }
  },

  getConnaissement: async (id: number): Promise<Connaissement> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/connaissements/${id}`);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur getConnaissement:', error.response?.data || error.message);
      throw error;
    }
  },

  getConnaissementByNumero: async (numero: string): Promise<Connaissement> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/connaissements/numero/${numero}`);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur getConnaissementByNumero:', error.response?.data || error.message);
      throw error;
    }
  },

  getConnaissementByExpedition: async (expeditionId: number): Promise<Connaissement> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/connaissements/expedition/${expeditionId}`);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur getConnaissementByExpedition:', error.response?.data || error.message);
      throw error;
    }
  },

  getConnaissementsByStatut: async (statut: string): Promise<Connaissement[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/connaissements/statut/${statut}`);
      return extractData(response);
    } catch (error: any) {
      console.error('❌ Erreur getConnaissementsByStatut:', error.response?.data || error.message);
      throw error;
    }
  },
   getExpeditions: async (): Promise<Expedition[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/expeditions`);
      return extractData(response);
    } catch (error: any) {
      console.error('❌ Erreur getExpeditions:', error.response?.data || error.message);
      if (error.response?.status === 204) return [];
      throw error;
    }
  },

  createConnaissement: async (connaissementData: ConnaissementFormData): Promise<Connaissement> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/connaissements`, connaissementData);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur createConnaissement:', error.response?.data || error.message);
      throw error;
    }
  },

  updateConnaissement: async (id: number, connaissementData: Partial<Connaissement>): Promise<Connaissement> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/connaissements/${id}`, connaissementData);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur updateConnaissement:', error.response?.data || error.message);
      throw error;
    }
  },

  updateConnaissementStatut: async (id: number, statut: string): Promise<Connaissement> => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/connaissements/${id}/statut`, { statut });
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur updateConnaissementStatut:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteConnaissement: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/connaissements/${id}`);
    } catch (error: any) {
      console.error('❌ Erreur deleteConnaissement:', error.response?.data || error.message);
      throw error;
    }
  }
};