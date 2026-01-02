// Hook pour la gestion des commandes
import { useState, useEffect, useCallback } from 'react';
import type { Commande } from '../types';
import { importExportApi } from '../services/api';

interface UseCommandesReturn {
  commandes: Commande[];
  loading: boolean;
  error: string | null;
  filters: {
    type: string;
    statut: string;
    client_id?: number;
  };
  setFilters: (filters: Partial<{ type: string; statut: string; client_id?: number }>) => void;
  refreshCommandes: () => Promise<void>;
  getCommande: (id: number) => Promise<Commande>;
  updateStatut: (id: number, statut: string) => Promise<void>;
}

export const useCommandes = (initialFilters = {}): UseCommandesReturn => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    statut: '',
    client_id: undefined as number | undefined,
    ...initialFilters
  });

  const loadCommandes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await importExportApi.getCommandes(filters);
      setCommandes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des commandes');
      console.error('Erreur useCommandes:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refreshCommandes = useCallback(async () => {
    await loadCommandes();
  }, [loadCommandes]);

  const getCommande = useCallback(async (id: number): Promise<Commande> => {
    try {
      return await importExportApi.getCommande(id);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors du chargement de la commande');
    }
  }, []);

  const updateStatut = useCallback(async (id: number, statut: string) => {
    try {
      await importExportApi.updateCommandeStatut(id, statut);
      await refreshCommandes(); // Recharger la liste
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du statut');
    }
  }, [refreshCommandes]);

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  useEffect(() => {
    loadCommandes();
  }, [loadCommandes]);

  return {
    commandes,
    loading,
    error,
    filters,
    setFilters: updateFilters,
    refreshCommandes,
    getCommande,
    updateStatut,
  };
};