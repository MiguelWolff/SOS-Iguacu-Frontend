import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiDelete } from '../services/api';
import type { Area } from '../types';

export const useAreas = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      setLoading(true);
      setError(null);

      // CORREÇÃO: rota correta
      const data = await apiGet<Area[]>('/api/regioes-afetadas/');
      setAreas(data);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar áreas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addArea = async (area: Omit<Area, 'id'>) => {
    try {
      // CORREÇÃO: rota correta
      const saved = await apiPost<Area>('/api/regioes-afetadas/', area);

      setAreas(prev => [saved, ...prev]);
      return saved;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar área';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteArea = async (id: number) => {
    try {
      await apiDelete(`/api/regioes-afetadas/${id}/`);

      setAreas(prev => prev.filter(a => Number(a.id) !== id));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir área';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    areas,
    loading,
    error,
    addArea,
    deleteArea,
    reload: loadAreas,
  };
};
