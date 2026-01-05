// src/modules/comptabilite/services/api.ts 
/*
  Decommentena ilay api_base_url faharoa rehefa prod dia soloina amlay nihebergena anlay backend
  aveo commentena lay en local
*/
import axios from '../../../core/config/axios';
import type { Tiers, Article, Facture, Paiement, TauxChange, ArticleBackend, PaiementFlexibleConfig, FactureAvecPaiement } from '../types';

const API_BASE_URL = '/comptabilite';

// Interfaces pour la gestion de stock
export interface UpdateStockRequest {
  quantite_stock: number;
}

export interface AdjustStockRequest {
  quantite: number;
  raison?: string;
}

export interface DisponibiliteResponse {
  disponible: boolean;
  quantite_stock: number;
  quantite_demandee: number;
  statut: string;
  message: string;
}

export interface StockAlerte {
  code_article: string;
  description: string;
  quantite_stock: number;
  seuil_alerte: number;
  statut_stock: string;
  priorite: 'faible' | 'rupture';
}

// ✅ FONCTIONS HELPER AMÉLIORÉES
const extractObject = (response: any): any => {
  console.log('🔍 extractObject - Response structure:', {
    status: response.status,
    data: response.data,
    hasSuccess: response.data?.success,
    hasData: response.data?.data !== undefined,
    dataType: typeof response.data?.data,
    isArray: Array.isArray(response.data?.data)
  });
  
  // Priorité 1: response.data.data (standard)
  if (response.data?.data !== undefined) {
    console.log('✅ Extraction depuis response.data.data');
    return response.data.data;
  }
  
  // Priorité 2: response.data (fallback)
  console.log('⚠️ Extraction depuis response.data (fallback)');
  return response.data;
};

const extractData = (response: any): any[] => {
  console.log('🔍 extractData - Response structure:', {
    status: response.status,
    data: response.data,
    hasData: response.data?.data !== undefined,
    isDataArray: Array.isArray(response.data?.data)
  });
  
  // Priorité 1: response.data.data est un tableau
  if (response.data?.data !== undefined && Array.isArray(response.data.data)) {
    console.log(`✅ Extraction ${response.data.data.length} éléments depuis response.data.data`);
    return response.data.data;
  }
  
  // Priorité 2: response.data est un tableau
  if (Array.isArray(response.data)) {
    console.log(`✅ Extraction ${response.data.length} éléments depuis response.data`);
    return response.data;
  }
  
  // Priorité 3: response.data.message est un tableau
  if (response.data?.message !== undefined && Array.isArray(response.data.message)) {
    console.log(`✅ Extraction ${response.data.message.length} éléments depuis response.data.message`);
    return response.data.message;
  }
  
  console.warn('⚠️ Aucun tableau trouvé, retourne tableau vide');
  return [];
};

// ✅ Fonction pour logger les erreu

// ✅ FONCTION HELPER pour extraire les données de la réponse
/*
const extractData = (response: any): any[] => {
  console.log('📊 Structure de la réponse:', response.data);
  
  if (response.data.success && Array.isArray(response.data.data)) {
    return response.data.data;
  } else if (response.data.success && Array.isArray(response.data.message)) {
    return response.data.message; // ← CORRECTION: Les données sont dans "message"
  } else if (Array.isArray(response.data)) {
    return response.data;
  }
  
  console.warn('⚠️ Aucune donnée valide trouvée dans la réponse');
  return [];
};

// ✅ FONCTION HELPER pour extraire un objet simple
const extractObject = (response: any): any => {
  if (response.data.success && response.data.data) {
    return response.data.data;
  } else if (response.data.success && response.data.message && typeof response.data.message === 'object') {
    return response.data.message; // ← CORRECTION: Les données sont dans "message"
  } else if (response.data.data) {
    return response.data.data;
  }
  
  return response.data;
};
*/
export const comptabiliteApi = {
  // ---- Tiers API ----
  getTiers: async (): Promise<Tiers[]> => {
    const response = await axios.get(`${API_BASE_URL}/tiers`);
    return extractData(response);
  },

  createTiers: async (tiersData: Partial<Tiers>): Promise<Tiers> => {
    const response = await axios.post(`${API_BASE_URL}/tiers`, tiersData);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur lors de la création du tiers');
    }
    
    return extractObject(response);
  },

  updateTiers: async (id: number, tiersData: Partial<Tiers>): Promise<Tiers> => {
    const response = await axios.put(`${API_BASE_URL}/tiers/${id}`, tiersData);
    return extractObject(response);
  },

  deleteTiers: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/tiers/${id}`);
  },

  // ---- Articles API ----
  getArticles: async (): Promise<Article[]> => {
    const response = await axios.get(`${API_BASE_URL}/articles`);
    const articles = extractData(response);
    
    return articles
  },

  getArticle: async (code: string): Promise<Article> => {
    const response = await axios.get(`${API_BASE_URL}/articles/${code}`);
    const article = extractObject(response);
    
    return {
      ...article,
      seuil_alerte: article.seuil_alerte
    };
  },

  createArticle: async (articleData: Omit<Article, 'actif' | 'created_at' | 'updated_at'>): Promise<Article> => {
    try {
      console.log('📤 Données envoyées création article:', articleData);
      
      const response = await axios.post(`${API_BASE_URL}/articles`, articleData);
      
      console.log('✅ Article créé avec succès:', response.data);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur détaillée création article:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.response?.data?.message
      });
      
      if (error.response?.data?.message?.includes('existe déjà')) {
        throw new Error('Un article avec le code ' + articleData.code_article + ' existe déjà. Veuillez utiliser un code différent.');
      }
      
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de l\'article');
    }
  },

  updateArticle: async (code: string, articleData: Partial<Article>): Promise<Article> => {
    const backendData = { ...articleData };
    
    if (articleData.seuil_alerte !== undefined) {
      backendData.seuil_alerte = articleData.seuil_alerte;
      delete backendData.seuil_alerte;
    }
    
    const response = await axios.put(`${API_BASE_URL}/articles/${code}`, backendData);
    const article = extractObject(response);
    
    return {
      ...article,
      seuil_alerte: article.seuil_alerte
    };
  },

  deleteArticle: async (code: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/articles/${code}`);
  },

  // ---- Gestion de Stock API ----
  getArticlesByStatut: async (statut: string): Promise<Article[]> => {
    const response = await axios.get(`${API_BASE_URL}/articles/statut/${statut}`);
    const articles = extractData(response);
    
    return articles
  },  

  updateStock: async (code: string, stockData: UpdateStockRequest): Promise<Article> => {
    const response = await axios.put(`${API_BASE_URL}/articles/${code}/stock`, stockData);
    const article = extractObject(response);
    
    return {
      ...article,
      seuil_alerte: article.seuil_alerte
    };
  },

  adjustStock: async (code: string, adjustData: AdjustStockRequest): Promise<Article> => {
    const response = await axios.patch(`${API_BASE_URL}/articles/${code}/stock/adjust`, adjustData);
    const article = extractObject(response);
    
    return {
      ...article,
      seuil_alerte: article.seuil_alerte
    };
  },

  getStockAlerts: async (): Promise<StockAlerte[]> => {
    const response = await axios.get(`${API_BASE_URL}/articles/alertes/stock`);
    const alertesData = extractObject(response) || {};
    
    const alertes: StockAlerte[] = [];
    
    if (Array.isArray(alertesData.rupture_stock)) {
      alertes.push(...alertesData.rupture_stock.map((article: ArticleBackend) => ({
        code_article: article.code_article,
        description: article.description,
        quantite_stock: article.quantite_stock || 0,
        seuil_alerte: article.seuil_alerte || 0,
        statut_stock: article.statut_stock || 'rupture',
        priorite: 'rupture' as const
      })));
    }
    
    if (Array.isArray(alertesData.stock_faible)) {
      alertes.push(...alertesData.stock_faible.map((article: ArticleBackend) => ({
        code_article: article.code_article,
        description: article.description,
        quantite_stock: article.quantite_stock || 0,
        seuil_alerte: article.seuil_alerte || 0,
        statut_stock: article.statut_stock || 'stock_faible',
        priorite: 'faible' as const
      })));
    }
    
    return alertes;
  },

  checkAvailability: async (code: string, quantite: number): Promise<DisponibiliteResponse> => {
    const response = await axios.get(`${API_BASE_URL}/articles/${code}/disponibilite?quantite=${quantite}`);
    return extractObject(response);
  },

  // ---- Factures API ----
  getFactures: async (): Promise<FactureAvecPaiement[]> => {
    const response = await axios.get(`${API_BASE_URL}/factures`);
    const factures = extractData(response);
    
    return factures.map((facture: any) => ({
      ...facture,
      statut_paiement: facture.statut_paiement || 'non_paye',
      montant_paye: facture.montant_paye || 0,
      montant_restant: facture.montant_restant || facture.total_ttc || 0
    }));
  },

  getFacture: async (numero: number): Promise<Facture> => {
    const response = await axios.get(`${API_BASE_URL}/factures/${numero}`);
    return extractObject(response);
  },

  createFacture: async (factureData: any): Promise<FactureAvecPaiement> => {
    const response = await axios.post(`${API_BASE_URL}/factures`, factureData);
    return extractObject(response);
  },

  // ---- Paiements Flexibles API ----
  getFactureAvecPaiements: async (numero: number): Promise<FactureAvecPaiement> => {
    const response = await axios.get(`${API_BASE_URL}/factures/${numero}`);
    return extractObject(response);
  },

  enregistrerPaiement: async (paiementData: Partial<Paiement>): Promise<Paiement> => {
    const response = await axios.post(`${API_BASE_URL}/paiements`, paiementData);
    return extractObject(response);
  },

  getPaiementsFacture: async (numeroFacture: number): Promise<Paiement[]> => {
    const response = await axios.get(`${API_BASE_URL}/paiements/facture/${numeroFacture}`);
    return extractData(response);
  },

  createPaiementFacture: async (numeroFacture: number, paiementData: {
    montant: number;
    mode_paiement: string;
    reference?: string;
    date_paiement: string;
    statut?: string;
  }): Promise<Paiement> => {
    const response = await axios.post(`${API_BASE_URL}/paiements`, {
      ...paiementData,
      numero_facture: numeroFacture
    });
    return extractObject(response);
  },

  configurerPaiementFlexible: async (numeroFacture: number, config: PaiementFlexibleConfig): Promise<FactureAvecPaiement> => {
    const response = await axios.patch(`${API_BASE_URL}/factures/${numeroFacture}/config-paiement`, config);
    return extractObject(response);
  },

  calculerPenalites: async (numeroFacture: number): Promise<{ penalites: number }> => {
    const response = await axios.get(`${API_BASE_URL}/factures/${numeroFacture}/penalites`);
    return extractObject(response);
  },

  getFacturesParStatutPaiement: async (statut: string): Promise<FactureAvecPaiement[]> => {
    const response = await axios.get(`${API_BASE_URL}/factures/statut/${statut}`);
    return extractData(response);
  },

  // ---- Statistiques Paiements API ----
  getStatistiquesPaiements: async (): Promise<{
    total_factures: number;
    factures_payees: number;
    factures_en_retard: number;
    factures_partiellement_payees: number;
    taux_recouvrement: number;
    montant_total_attente: number;
  }> => {
    const response = await axios.get(`${API_BASE_URL}/stats/factures-en-attente`);
    return extractObject(response);
  },

  getFacturesEnRetard: async (): Promise<FactureAvecPaiement[]> => {
    const response = await axios.get(`${API_BASE_URL}/factures/statut/en_retard`);
    return extractData(response);
  },

  getFacturesPartiellementPayees: async (): Promise<FactureAvecPaiement[]> => {
    const response = await axios.get(`${API_BASE_URL}/factures/statut/partiellement_payee`);
    return extractData(response);
  },

  getFacturesNonPayees: async (): Promise<FactureAvecPaiement[]> => {
    const response = await axios.get(`${API_BASE_URL}/factures/statut/non_paye`);
    return extractData(response);
  },

  updateFacture: async (numero: number, factureData: Partial<Facture>): Promise<Facture> => {
    const response = await axios.put(`${API_BASE_URL}/factures/${numero}`, factureData);
    return extractObject(response);
  },

  validerFacture: async (numero: number): Promise<Facture> => {
    const response = await axios.patch(`${API_BASE_URL}/factures/${numero}/valider`);
    if (!response.data.success) throw new Error(response.data.message || 'Erreur validation facture');
    return extractObject(response);
  },

  annulerFacture: async (numeroFacture: number): Promise<Facture> => {
    const response = await axios.patch(`${API_BASE_URL}/factures/${numeroFacture}/annuler`);
    return extractObject(response);
  },

  deleteFacture: async (numero: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/factures/${numero}`);
  },

  // ---- Paiements API ----
  getPaiements: async (): Promise<Paiement[]> => {
    const response = await axios.get(`${API_BASE_URL}/paiements`);
    return extractData(response);
  },

  createPaiement: async (paiementData: Partial<Paiement>): Promise<Paiement> => {
    const response = await axios.post(`${API_BASE_URL}/paiements`, paiementData);
    return extractObject(response);
  },

  // ---- Devises API ----
  getTauxChange: async (): Promise<TauxChange[]> => {
    const response = await axios.get(`${API_BASE_URL}/devises/taux`);
    return extractData(response);
  },
};

// Export des services supplémentaires
export { paiementApi } from './paiementApi';
export { deviseApi } from './deviseApi';
export { default as rapportApi } from './rapportApi';