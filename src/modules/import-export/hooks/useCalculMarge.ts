import { useState, useCallback } from 'react';
import type { CalculMarge } from '../types';
import { importExportApi } from '../services/api';

interface UseCalculMargeReturn {
  marge: CalculMarge | null;
  loading: boolean;
  error: string | null;
  calculerMarge: (commandeId: number) => Promise<void>;
  reset: () => void;
}

export const useCalculMarge = (): UseCalculMargeReturn => {
  const [marge, setMarge] = useState<CalculMarge | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculerMarge = useCallback(async (commandeId: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await importExportApi.calculerMarge(commandeId);
      setMarge(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du calcul de marge');
      console.error('Erreur useCalculMarge:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setMarge(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    marge,
    loading,
    error,
    calculerMarge,
    reset,
  };
};