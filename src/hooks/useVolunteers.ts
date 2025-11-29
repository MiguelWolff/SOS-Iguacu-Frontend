import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../services/api';
import type { Volunteer } from '../types';

export const useVolunteers = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVolunteers();
  }, []);

  const loadVolunteers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiGet<Volunteer[]>('api/voluntario');
      setVolunteers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar voluntários');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addVolunteer = async (volunteer: Omit<Volunteer, 'id'>) => {
    try {
      const saved = await apiPost<Volunteer>('api/voluntario', volunteer);
      setVolunteers(prev => [saved, ...prev]);
      return saved;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar voluntário';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    volunteers,
    loading,
    error,
    addVolunteer,
    reload: loadVolunteers,
  };
};

