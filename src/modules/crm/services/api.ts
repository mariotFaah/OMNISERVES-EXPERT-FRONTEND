// src/modules/crm/services/api.ts - VERSION CORRIGÉE
import axios from '../../../core/config/axios';
import type { Client, Devis, Contact, Activite, Contrat, Relance } from '../types';

const API_BASE_URL = '/crm';

// ✅ UTILISER les mêmes fonctions helper que dans api.ts
const extractData = (response: any): any[] => {
  console.log('📊 Structure de la réponse CRM:', response.data);
  
  if (response.data.success && Array.isArray(response.data.data)) {
    return response.data.data;
  } else if (response.data.success && Array.isArray(response.data.message)) {
    return response.data.message;
  } else if (Array.isArray(response.data)) {
    return response.data;
  }
  
  console.warn('⚠️ Aucune donnée valide trouvée dans la réponse CRM');
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

export const crmApi = {
  // ---- Clients API ----
  getClients: async (): Promise<Client[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/clients`);
      return extractData(response);
    } catch (error: any) {
      console.error('❌ Erreur getClients:', error.response?.data || error.message);
      if (error.response?.status === 204) return [];
      throw error;
    }
  },

  getClient: async (id: number): Promise<Client> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/clients/${id}`);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur getClient:', error.response?.data || error.message);
      throw error;
    }
  },

  updateClientCRM: async (id: number, crmData: Partial<Client>): Promise<Client> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/clients/${id}/crm`, crmData);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur updateClientCRM:', error.response?.data || error.message);
      throw error;
    }
  },

  getClientsByCategorie: async (categorie: string): Promise<Client[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/clients/categorie/${categorie}`);
      return extractData(response);
    } catch (error: any) {
      console.error('❌ Erreur getClientsByCategorie:', error.response?.data || error.message);
      if (error.response?.status === 204) return [];
      throw error;
    }
  },

  getClientActivites: async (clientId: number): Promise<Activite[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/clients/${clientId}/activites`);
      return extractData(response);
    } catch (error: any) {
      console.error('❌ Erreur getClientActivites:', error.response?.data || error.message);
      if (error.response?.status === 204) return [];
      throw error;
    }
  },

  getClientDevis: async (clientId: number): Promise<Devis[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/clients/${clientId}/devis`);
      return extractData(response);
    } catch (error: any) {
      console.error('❌ Erreur getClientDevis:', error.response?.data || error.message);
      if (error.response?.status === 204) return [];
      throw error;
    }
  },

  getClientContrats: async (clientId: number): Promise<Contrat[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/clients/${clientId}/contrats`);
      return extractData(response);
    } catch (error: any) {
      console.error('❌ Erreur getClientContrats:', error.response?.data || error.message);
      if (error.response?.status === 204) return [];
      throw error;
    }
  },

  // ---- Devis API ----
  getDevis: async (): Promise<Devis[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/devis`);
      return extractData(response);
    } catch (error: any) {
      console.error('❌ Erreur getDevis:', error.response?.data || error.message);
      if (error.response?.status === 204) return [];
      throw error;
    }
  },

  getDevisById: async (id: number): Promise<Devis> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/devis/${id}`);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur getDevisById:', error.response?.data || error.message);
      throw error;
    }
  },

  createDevis: async (devisData: Partial<Devis>): Promise<Devis> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/devis`, devisData);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur createDevis:', error.response?.data || error.message);
      throw error;
    }
  },

  updateDevis: async (id: number, devisData: Partial<Devis>): Promise<Devis> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/devis/${id}`, devisData);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur updateDevis:', error.response?.data || error.message);
      throw error;
    }
  },

  updateDevisStatut: async (id: number, statut: string): Promise<Devis> => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/devis/${id}/statut`, { statut });
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur updateDevisStatut:', error.response?.data || error.message);
      throw error;
    }
  },

  getDevisStats: async (): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/devis/stats`);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur getDevisStats:', error.response?.data || error.message);
      throw error;
    }
  },

  getDevisByStatut: async (statut: string): Promise<Devis[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/devis/statut/${statut}`);
      return extractData(response);
    } catch (error: any) {
      console.error('❌ Erreur getDevisByStatut:', error.response?.data || error.message);
      if (error.response?.status === 204) return [];
      throw error;
    }
  },

  // ---- Contrats API ----
  getContrats: async (): Promise<Contrat[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/contrats`);
      return extractData(response);
    } catch (error: any) {
      console.error('❌ Erreur getContrats:', error.response?.data || error.message);
      if (error.response?.status === 204) return [];
      throw error;
    }
  },

  getContrat: async (id: number): Promise<Contrat> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/contrats/${id}`);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur getContrat:', error.response?.data || error.message);
      throw error;
    }
  },

  createContrat: async (contratData: Partial<Contrat>): Promise<Contrat> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/contrats`, contratData);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur createContrat:', error.response?.data || error.message);
      throw error;
    }
  },

  updateContrat: async (id: number, contratData: Partial<Contrat>): Promise<Contrat> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/contrats/${id}`, contratData);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur updateContrat:', error.response?.data || error.message);
      throw error;
    }
  },

  updateContratStatut: async (id: number, statut: string): Promise<Contrat> => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/contrats/${id}/statut`, { statut });
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur updateContratStatut:', error.response?.data || error.message);
      throw error;
    }
  },

  // ---- Activités API ----
  getActivites: async (): Promise<Activite[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/activites`);
      return extractData(response);
    } catch (error: any) {
      console.error('❌ Erreur getActivites:', error.response?.data || error.message);
      if (error.response?.status === 204) return [];
      throw error;
    }
  },

  getActivite: async (id: number): Promise<Activite> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/activites/${id}`);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur getActivite:', error.response?.data || error.message);
      throw error;
    }
  },

  createActivite: async (activiteData: Partial<Activite>): Promise<Activite> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/activites`, activiteData);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur createActivite:', error.response?.data || error.message);
      throw error;
    }
  },

  updateActivite: async (id: number, activiteData: Partial<Activite>): Promise<Activite> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/activites/${id}`, activiteData);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur updateActivite:', error.response?.data || error.message);
      throw error;
    }
  },

  updateActiviteStatut: async (id: number, statut: string): Promise<Activite> => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/activites/${id}/statut`, { statut });
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur updateActiviteStatut:', error.response?.data || error.message);
      throw error;
    }
  },

  // ---- Activités Consolidées ----
  getClientActivitesConsolidees: async (clientId: number): Promise<any[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/clients/${clientId}/activites-consolidees`);
      return extractData(response);
    } catch (error: any) {
      console.error('❌ Erreur getClientActivitesConsolidees:', error.response?.data || error.message);
      if (error.response?.status === 204) return [];
      throw error;
    }
  },

  // ---- Contacts API ----
  getContactsByClient: async (clientId: number): Promise<Contact[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/contacts/client/${clientId}`);
      return extractData(response);
    } catch (error: any) {
      console.error('❌ Erreur getContactsByClient:', error.response?.data || error.message);
      if (error.response?.status === 204) return [];
      throw error;
    }
  },

  getContact: async (id: number): Promise<Contact> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/contacts/${id}`);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur getContact:', error.response?.data || error.message);
      throw error;
    }
  },

  createContact: async (contactData: Partial<Contact>): Promise<Contact> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/contacts`, contactData);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur createContact:', error.response?.data || error.message);
      throw error;
    }
  },

  updateContact: async (id: number, contactData: Partial<Contact>): Promise<Contact> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/contacts/${id}`, contactData);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur updateContact:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteContact: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/contacts/${id}`);
    } catch (error: any) {
      console.error('❌ Erreur deleteContact:', error.response?.data || error.message);
      throw error;
    }
  },

  // ---- Relances API ----
  getRelances: async (): Promise<Relance[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/relances`);
      return extractData(response);
    } catch (error: any) {
      console.error('❌ Erreur getRelances:', error.response?.data || error.message);
      if (error.response?.status === 204) return [];
      throw error;
    }
  },

  getRelancesStats: async (): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/relances/stats`);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur getRelancesStats:', error.response?.data || error.message);
      throw error;
    }
  },

  getRelancesByClient: async (clientId: number): Promise<Relance[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/relances/client/${clientId}`);
      return extractData(response);
    } catch (error: any) {
      console.error('❌ Erreur getRelancesByClient:', error.response?.data || error.message);
      if (error.response?.status === 204) return [];
      throw error;
    }
  },

  getRelance: async (id: number): Promise<Relance> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/relances/${id}`);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur getRelance:', error.response?.data || error.message);
      throw error;
    }
  },

  createRelance: async (relanceData: Partial<Relance>): Promise<Relance> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/relances`, relanceData);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur createRelance:', error.response?.data || error.message);
      throw error;
    }
  },

  updateRelance: async (id: number, relanceData: Partial<Relance>): Promise<Relance> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/relances/${id}`, relanceData);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur updateRelance:', error.response?.data || error.message);
      throw error;
    }
  },

  updateRelanceStatut: async (id: number, statut: string): Promise<Relance> => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/relances/${id}/statut`, { statut });
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur updateRelanceStatut:', error.response?.data || error.message);
      throw error;
    }
  },

  genererRelancesAutomatiques: async (): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/relances/automatiques`);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur genererRelancesAutomatiques:', error.response?.data || error.message);
      throw error;
    }
  },

  // Relances par statut
  getRelancesByStatut: async (statut: string): Promise<Relance[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/relances/statut/${statut}`);
      return extractData(response);
    } catch (error: any) {
      console.error('❌ Erreur getRelancesByStatut:', error.response?.data || error.message);
      if (error.response?.status === 204) return [];
      throw error;
    }
  },

  // Contrats par statut
  getContratsByStatut: async (statut: string): Promise<Contrat[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/contrats/statut/${statut}`);
      return extractData(response);
    } catch (error: any) {
      console.error('❌ Erreur getContratsByStatut:', error.response?.data || error.message);
      if (error.response?.status === 204) return [];
      throw error;
    }
  },

  // ---- Clients API ----
  createClient: async (clientData: Partial<Client>): Promise<Client> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/clients`, clientData);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur createClient:', error.response?.data || error.message);
      throw error;
    }
  },

  updateClient: async (id: number, clientData: Partial<Client>): Promise<Client> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/clients/${id}`, clientData);
      return extractObject(response);
    } catch (error: any) {
      console.error('❌ Erreur updateClient:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default crmApi;