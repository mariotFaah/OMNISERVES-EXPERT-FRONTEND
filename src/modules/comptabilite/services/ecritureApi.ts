// src/modules/comptabilite/services/ecritureApi.ts - VERSION CORRIGÉE
import axios from '../../../core/config/axios';
import type { EcritureComptable } from '../types';

const API_BASE_URL = '/comptabilite';

// ✅ UTILISER les mêmes fonctions helper que dans api.ts
const extractData = (response: any): any[] => {
  console.log('📊 Structure de la réponse écritures:', response.data);
  
  if (response.data.success && Array.isArray(response.data.data)) {
    return response.data.data;
  } else if (response.data.success && Array.isArray(response.data.message)) {
    return response.data.message;
  } else if (Array.isArray(response.data)) {
    return response.data;
  }
  
  console.warn('⚠️ Aucune donnée valide trouvée dans la réponse écritures');
  return [];
};

// ✅ FONCTION HELPER pour extraire un objet simple
const extractObject = (response: any): any => {
  if (response.data.success && response.data.data) {
    return response.data.data;
  } else if (response.data.success && response.data.message && typeof response.data.message === 'object') {
    return response.data.message;
  } else if (response.data.data) {
    return response.data.data;
  }
  
  return response.data;
};

// Fonction pour parser les montants string en number
const parseMontants = (ecritures: any[]): EcritureComptable[] => {
  return ecritures.map(ecriture => ({
    ...ecriture,
    debit: parseFloat(ecriture.debit) || 0,
    credit: parseFloat(ecriture.credit) || 0,
    taux_change: parseFloat(ecriture.taux_change) || 1
  }));
};

export const ecritureApi = {
  getEcrituresComptables: async (filters?: { 
    date_debut?: string; 
    date_fin?: string; 
    journal?: string 
  }): Promise<EcritureComptable[]> => {
    try {
      // ✅ CORRECTION : Mapping correct des paramètres
      const params: any = {};
      
      if (filters?.date_debut) params.debut = filters.date_debut;
      if (filters?.date_fin) params.fin = filters.date_fin;
      if (filters?.journal) params.journal = filters.journal;
      
      console.log(`🔄 Appel API écritures avec params:`, params);
      
      const response = await axios.get(`${API_BASE_URL}/ecritures`, { params });
      
      console.log('📊 Données brutes écritures reçues:', response.data);
      
      const ecritures = extractData(response);
      const ecrituresParsees = parseMontants(ecritures);
      
      console.log('✅ Écritures parsées:', ecrituresParsees.length, 'éléments');
      return ecrituresParsees;
    } catch (error: any) {
      console.error('❌ Erreur getEcrituresComptables:', error.response?.data || error.message);
      if (error.response?.status === 204) {
        return [];
      }
      throw error;
    }
  },

  // Méthodes supplémentaires pour la gestion des écritures comptables
  getEcritureById: async (id: number): Promise<EcritureComptable> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ecritures/${id}`);
      const ecriture = extractObject(response);
      
      return {
        ...ecriture,
        debit: parseFloat(ecriture.debit) || 0,
        credit: parseFloat(ecriture.credit) || 0,
        taux_change: parseFloat(ecriture.taux_change) || 1
      };
    } catch (error: any) {
      console.error('❌ Erreur getEcritureById:', error.response?.data || error.message);
      throw error;
    }
  },

  createEcriture: async (ecritureData: Omit<EcritureComptable, 'id_ecriture' | 'created_at' | 'updated_at'>): Promise<EcritureComptable> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/ecritures`, ecritureData);
      const ecriture = extractObject(response);
      
      return {
        ...ecriture,
        debit: parseFloat(ecriture.debit) || 0,
        credit: parseFloat(ecriture.credit) || 0,
        taux_change: parseFloat(ecriture.taux_change) || 1
      };
    } catch (error: any) {
      console.error('❌ Erreur createEcriture:', error.response?.data || error.message);
      throw error;
    }
  },

  updateEcriture: async (id: number, ecritureData: Partial<EcritureComptable>): Promise<EcritureComptable> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/ecritures/${id}`, ecritureData);
      const ecriture = extractObject(response);
      
      return {
        ...ecriture,
        debit: parseFloat(ecriture.debit) || 0,
        credit: parseFloat(ecriture.credit) || 0,
        taux_change: parseFloat(ecriture.taux_change) || 1
      };
    } catch (error: any) {
      console.error('❌ Erreur updateEcriture:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteEcriture: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/ecritures/${id}`);
    } catch (error: any) {
      console.error('❌ Erreur deleteEcriture:', error.response?.data || error.message);
      throw error;
    }
  },

  // Récupérer les écritures par compte
  getEcrituresByCompte: async (numeroCompte: string): Promise<EcritureComptable[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ecritures/compte/${numeroCompte}`);
      const ecritures = extractData(response);
      return parseMontants(ecritures);
    } catch (error: any) {
      console.error('❌ Erreur getEcrituresByCompte:', error.response?.data || error.message);
      if (error.response?.status === 204) {
        return [];
      }
      throw error;
    }
  },

  // Récupérer le solde d'un compte
  getSoldeCompte: async (numeroCompte: string): Promise<{ solde: number }> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ecritures/compte/${numeroCompte}/solde`);
      const soldeData = extractObject(response);
      
      return {
        solde: parseFloat(soldeData.solde) || 0
      };
    } catch (error: any) {
      console.error('❌ Erreur getSoldeCompte:', error.response?.data || error.message);
      throw error;
    }
  },

  // Valider une écriture
  validerEcriture: async (id: number): Promise<EcritureComptable> => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/ecritures/${id}/valider`);
      const ecriture = extractObject(response);
      
      return {
        ...ecriture,
        debit: parseFloat(ecriture.debit) || 0,
        credit: parseFloat(ecriture.credit) || 0,
        taux_change: parseFloat(ecriture.taux_change) || 1
      };
    } catch (error: any) {
      console.error('❌ Erreur validerEcriture:', error.response?.data || error.message);
      throw error;
    }
  },

  // Annuler une écriture
  annulerEcriture: async (id: number): Promise<EcritureComptable> => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/ecritures/${id}/annuler`);
      const ecriture = extractObject(response);
      
      return {
        ...ecriture,
        debit: parseFloat(ecriture.debit) || 0,
        credit: parseFloat(ecriture.credit) || 0,
        taux_change: parseFloat(ecriture.taux_change) || 1
      };
    } catch (error: any) {
      console.error('❌ Erreur annulerEcriture:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ NOUVELLE MÉTHODE : Récupérer les écritures par journal
  getEcrituresByJournal: async (journal: string): Promise<EcritureComptable[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ecritures/journal/${journal}`);
      const ecritures = extractData(response);
      return parseMontants(ecritures);
    } catch (error: any) {
      console.error('❌ Erreur getEcrituresByJournal:', error.response?.data || error.message);
      if (error.response?.status === 204) {
        return [];
      }
      throw error;
    }
  },

  getEcrituresByPeriode: async (debut: string, fin: string): Promise<EcritureComptable[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ecritures`, {
        params: { debut, fin }
      });
      const ecritures = extractData(response);
      return parseMontants(ecritures);
    } catch (error: any) {
      console.error('❌ Erreur getEcrituresByPeriode:', error.response?.data || error.message);
      if (error.response?.status === 204) {
        return [];
      }
      throw error;
    }
  }
};

export default ecritureApi;