// src/modules/comptabilite/services/deviseApi.ts - VERSION CORRIGÉE
import axios from '../../../core/config/axios';
import type { TauxChange, ConversionDevise } from '../types';

const API_BASE_URL = '/comptabilite';

// ✅ UTILISER les mêmes fonctions helper que dans api.ts
const extractData = (response: any): any[] => {
  console.log('📊 Structure de la réponse devises:', response.data);
  
  if (response.data.success && Array.isArray(response.data.data)) {
    return response.data.data;
  } else if (response.data.success && Array.isArray(response.data.message)) {
    return response.data.message;
  } else if (Array.isArray(response.data)) {
    return response.data;
  }
  
  console.warn('⚠️ Aucune donnée valide trouvée dans la réponse devises');
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

const parseTaux = (tauxChanges: any[]): TauxChange[] => {
  return tauxChanges.map(taux => ({
    ...taux,
    taux: parseFloat(taux.taux) || 0,
    actif: Boolean(taux.actif)
  }));
};

export interface TauxReelTime {
  USD: number;
  EUR: number;
  date: string;
  base: string;
}

export const deviseApi = {
  // Récupérer tous les taux
  async getTauxChange(): Promise<TauxChange[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/devises/taux`);
      const tauxChanges = extractData(response);
      return parseTaux(tauxChanges);
    } catch (error: any) {
      console.error('❌ Erreur getTauxChange:', error.response?.data || error.message);
      // ✅ GÉRER le cas 204 No Content
      if (error.response?.status === 204) {
        return [];
      }
      throw error;
    }
  },

  // Créer un nouveau taux
  async createTauxChange(tauxData: Omit<TauxChange, 'id_taux' | 'created_at' | 'updated_at'>): Promise<TauxChange> {
    try {
      const response = await axios.post(`${API_BASE_URL}/devises/taux`, tauxData);
      const taux = extractObject(response);
      return taux;
    } catch (error: any) {
      console.error('❌ Erreur createTauxChange:', error.response?.data || error.message);
      throw error;
    }
  },

  // Convertir un montant
  async convertirDevise(montant: number, source: string, cible: string): Promise<ConversionDevise> {
    try {
      const response = await axios.post(`${API_BASE_URL}/devises/convertir`, {
        montant,
        devise_source: source,
        devise_cible: cible
      });
      const conversion = extractObject(response);
      return conversion;
    } catch (error: any) {
      console.error('❌ Erreur convertirDevise:', error.response?.data || error.message);
      throw error;
    }
  },

  // NOUVELLE VERSION CORRIGÉE de getTauxReelTime
  async getTauxReelTime(): Promise<TauxReelTime> {
    try {
      // Utiliser ExchangeRate-API qui supporte MGA
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      
      if (!res.ok) {
        throw new Error(`Erreur API ExchangeRate: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Vérifier que MGA est disponible
      if (!data.rates || !data.rates.MGA) {
        throw new Error('Taux MGA non disponible');
      }
      
      // ExchangeRate-API retourne: 1 USD = X MGA
      const tauxUSDVersMGA = data.rates.MGA;  // 1 USD = 4484.87 MGA
      const tauxUSDVersEUR = data.rates.EUR;  // 1 USD = X EUR
      
      // Calcul des taux MGA depuis USD
      const tauxMGAVersUSD = 1 / tauxUSDVersMGA;  // 1 MGA = X USD
      const tauxMGAVersEUR = tauxUSDVersEUR / tauxUSDVersMGA;  // 1 MGA = X EUR
      
      console.log('📊 Taux réels récupérés:', {
        'USD→MGA': tauxUSDVersMGA,
        'USD→EUR': tauxUSDVersEUR,
        'MGA→USD': tauxMGAVersUSD,
        'MGA→EUR': tauxMGAVersEUR
      });
      
      return {
        USD: parseFloat(tauxMGAVersUSD.toFixed(6)),
        EUR: parseFloat(tauxMGAVersEUR.toFixed(6)),
        date: data.date || new Date().toISOString().split('T')[0],
        base: 'MGA'
      };
      
    } catch (error) {
      console.error('Erreur getTauxReelTime:', error);
      
      // Fallback avec des taux réalistes basés sur votre test
      return {
        USD: 0.000223,  // 1 MGA = 0.000223 USD (1/4484.87)
        EUR: 0.000205,  // Estimation basée sur EUR/USD
        date: new Date().toISOString().split('T')[0],
        base: 'MGA'
      };
    }
  },

  // NOUVEAU : Synchroniser avec les taux réels
  async syncWithReelTaux(): Promise<TauxReelTime> {
    try {
      const tauxReel = await this.getTauxReelTime();
      
      // Ici vous pourriez automatiquement mettre à jour votre base
      // ou juste retourner les taux pour comparaison
      return tauxReel;
    } catch (error) {
      console.error('Erreur syncWithReelTaux:', error);
      throw error;
    }
  },

  // Méthodes supplémentaires pour la gestion des devises
  async updateTauxChange(id: number, tauxData: Partial<TauxChange>): Promise<TauxChange> {
    try {
      const response = await axios.put(`${API_BASE_URL}/devises/taux/${id}`, tauxData);
      const taux = extractObject(response);
      return taux;
    } catch (error: any) {
      console.error('❌ Erreur updateTauxChange:', error.response?.data || error.message);
      throw error;
    }
  },

  async deleteTauxChange(id: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/devises/taux/${id}`);
    } catch (error: any) {
      console.error('❌ Erreur deleteTauxChange:', error.response?.data || error.message);
      throw error;
    }
  },

  // Récupérer les taux par devise
  async getTauxByDevise(devise: string): Promise<TauxChange[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/devises/taux/devise/${devise}`);
      const tauxChanges = extractData(response);
      return parseTaux(tauxChanges);
    } catch (error: any) {
      console.error('❌ Erreur getTauxByDevise:', error.response?.data || error.message);
      if (error.response?.status === 204) {
        return [];
      }
      throw error;
    }
  },

  // Activer/désactiver un taux
  async toggleTauxActif(id: number, actif: boolean): Promise<TauxChange> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/devises/taux/${id}/actif`, { actif });
      const taux = extractObject(response);
      return taux;
    } catch (error: any) {
      console.error('❌ Erreur toggleTauxActif:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default deviseApi;