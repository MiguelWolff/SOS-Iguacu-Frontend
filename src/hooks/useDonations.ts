import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../services/api';
import type { Donation } from '../types';

export const useDonations = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiGet<Donation[]>('api/doacao');
      setDonations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar doações');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addDonation = async (donation: Omit<Donation, 'id'>) => {
    try {
      const saved = await apiPost<Donation>('api/doacao', donation);
      setDonations(prev => [saved, ...prev]);
      return saved;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar doação';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    donations,
    loading,
    error,
    addDonation,
    reload: loadDonations,
  };
};

