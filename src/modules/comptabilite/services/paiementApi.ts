// src/modules/comptabilite/services/paiementApi.ts - VERSION CORRIGÉE
import axios from '../../../core/config/axios';
import type { Paiement } from '../types';

const API_BASE_URL = '/comptabilite';

const extractData = (response: any): any[] => {
  console.log('📊 Structure de la réponse paiements:', response.data);
  
  if (response.data.success && Array.isArray(response.data.data)) {
    return response.data.data;
  } else if (response.data.success && Array.isArray(response.data.message)) {
    return response.data.message;
  } else if (Array.isArray(response.data)) {
    return response.data;
  }
  
  console.warn('⚠️ Aucune donnée valide trouvée dans la réponse paiements');
  return [];
};

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

// Fonction utilitaire pour parser les montants
const parsePaiement = (paiement: any): Paiement => ({
  ...paiement,
  montant: parseFloat(paiement.montant) || 0,
  taux_change: parseFloat(paiement.taux_change) || 1
});

export const paiementApi = {
  // Récupérer tous les paiements
  getPaiements: async (): Promise<Paiement[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/paiements`);
      const paiements = extractData(response);
      return paiements.map(parsePaiement);
    } catch (error: any) {
      console.error('❌ Erreur getPaiements:', error.response?.data || error.message);
      if (error.response?.status === 204) {
        return [];
      }
      throw error;
    }
  },

  // Récupérer les paiements d'une facture
  getPaiementsByFacture: async (numero_facture: number): Promise<Paiement[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/paiements/facture/${numero_facture}`);
      const paiements = extractData(response);
      return paiements.map(parsePaiement);
    } catch (error: any) {
      console.error('❌ Erreur getPaiementsByFacture:', error.response?.data || error.message);
      if (error.response?.status === 204) {
        return [];
      }
      throw error;
    }
  },

  // Créer un paiement
  createPaiement: async (paiementData: Omit<Paiement, 'id_paiement' | 'created_at' | 'updated_at'>): Promise<Paiement> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/paiements`, paiementData);
      const paiement = extractObject(response);
      return parsePaiement(paiement);
    } catch (error: any) {
      console.error('❌ Erreur createPaiement:', error.response?.data || error.message);
      throw error;
    }
  },

  // Valider un paiement
  validerPaiement: async (id_paiement: number): Promise<Paiement> => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/paiements/${id_paiement}/valider`);
      const paiement = extractObject(response);
      return parsePaiement(paiement);
    } catch (error: any) {
      console.error('❌ Erreur validerPaiement:', error.response?.data || error.message);
      throw error;
    }
  },

  // Annuler un paiement
  annulerPaiement: async (id_paiement: number): Promise<Paiement> => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/paiements/${id_paiement}/annuler`);
      const paiement = extractObject(response);
      return parsePaiement(paiement);
    } catch (error: any) {
      console.error('❌ Erreur annulerPaiement:', error.response?.data || error.message);
      throw error;
    }
  },

  // Supprimer un paiement
  deletePaiement: async (id_paiement: number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/paiements/${id_paiement}`);
    } catch (error: any) {
      console.error('❌ Erreur deletePaiement:', error.response?.data || error.message);
      throw error;
    }
  }
};