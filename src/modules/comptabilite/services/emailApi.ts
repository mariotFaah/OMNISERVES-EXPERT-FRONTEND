// src/modules/comptabilite/services/emailApi.ts - VERSION CORRIGÉE
import axios from '../../../core/config/axios';
import type { Facture, RelanceData, RelanceResponse, RelancesGroupeesResponse } from '../types';

const API_BASE_URL = '/comptabilite';

// ✅ UTILISER les mêmes fonctions helper que dans api.ts
const extractObject = (response: any): any => {
  console.log('📊 Structure de la réponse email:', response.data);
  
  if (response.data.success && response.data.data) {
    return response.data.data;
  } else if (response.data.success && response.data.message && typeof response.data.message === 'object') {
    return response.data.message;
  } else if (response.data.data) {
    return response.data.data;
  }
  
  return response.data;
};

export const emailApi = {
  // Envoyer une relance pour une facture spécifique
  async envoyerRelance(facture: Facture, messagePersonnalise?: string): Promise<RelanceResponse> {
    try {
      // Le backend fournit maintenant directement l'email correct
      const emailCorrect = facture.email;

      if (!emailCorrect) {
        throw new Error('Aucun email disponible pour ce client');
      }

      const aujourdhui = new Date();
      const dateEcheance = facture.date_finale_paiement ? new Date(facture.date_finale_paiement) : aujourdhui;
      const joursRetard = Math.floor((aujourdhui.getTime() - dateEcheance.getTime()) / (1000 * 60 * 60 * 24));

      const relanceData: RelanceData = {
        numero_facture: facture.numero_facture ?? 0,
        email_client: emailCorrect,
        nom_client: facture.nom_tiers || 'Client',
        montant: facture.montant_restant || facture.total_ttc || 0,
        jours_retard: Math.max(joursRetard, 0),
        message_personnalise: messagePersonnalise
      };

      console.log('📧 Envoi relance AVEC EMAIL CORRECT:', relanceData);

      const response = await axios.post(`${API_BASE_URL}/email/relance`, relanceData);
      const result = extractObject(response);
      return result;

    } catch (error: any) {
      console.error('❌ Erreur API relance:', error.response?.data || error.message);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(errorMessage);
    }
  },

  // Envoyer des relances groupées
  async envoyerRelancesGroupees(factures: Facture[]): Promise<RelancesGroupeesResponse> {
    try {
      const relancesData = factures.map(facture => {
        const aujourdhui = new Date();
        const dateEcheance = facture.date_finale_paiement ? new Date(facture.date_finale_paiement) : aujourdhui;
        const joursRetard = Math.floor((aujourdhui.getTime() - dateEcheance.getTime()) / (1000 * 60 * 60 * 24));

        return {
          numero_facture: facture.numero_facture ?? 0,
          email_client: facture.email || 'client@example.com',
          nom_client: facture.nom_tiers || 'Client',
          montant: facture.montant_restant ?? facture.total_ttc ?? 0,
          jours_retard: Math.max(joursRetard, 0)
        };
      });

      console.log('📧 Envoi relances groupées:', relancesData.length, 'factures');

      const response = await axios.post(`${API_BASE_URL}/email/relances-groupees`, { 
        factures: relancesData 
      });
      const result = extractObject(response);
      return result;

    } catch (error: any) {
      console.error('❌ Erreur API relances groupées:', error.response?.data || error.message);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Impossible d\'envoyer les relances groupées';
      
      throw new Error(errorMessage);
    }
  },

  // Tester la configuration email
  async testerConfiguration(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/email/test-config`);
      const result = extractObject(response);
      return result;
    } catch (error: any) {
      console.error('❌ Erreur test configuration email:', error.response?.data || error.message);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Impossible de tester la configuration email';
      
      throw new Error(errorMessage);
    }
  }
};

export default emailApi;