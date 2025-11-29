import React, { useState, useMemo } from 'react';
import { useAreas } from '../hooks/useAreas';
import { Input, Button } from '../components/ui';
import { lookupCep } from '../utils/cep';
import type { Area } from '../types';

interface AreasProps {
  cepSearch: string;
}

export const Areas: React.FC<AreasProps> = ({ cepSearch }) => {
  const { areas, addArea, deleteArea } = useAreas();

  const [aName, setAName] = useState('');
  const [aCep, setACep] = useState('');
  const [aStatus, setAStatus] = useState('');

  const filteredAreas = useMemo(() => {
    if (!cepSearch.trim()) return areas;
    const searchCep = cepSearch.replace(/[^0-9]/g, '');
    return areas.filter(a =>
      a.cep.replace(/[^0-9]/g, '').includes(searchCep)
    );
  }, [areas, cepSearch]);

  const handleSubmit = async () => {
    if (!aName.trim() || !aCep.trim()) {
      alert('Preencha nome e CEP');
      return;
    }

    setAStatus('Consultando CEP...');
    try {
      const cepData = await lookupCep(aCep);
      
      const newArea: Omit<Area, 'id'> = {
        name: aName.trim(),
        cep: aCep.trim(),
        city: cepData?.localidade,
        state: cepData?.uf,
        lat: undefined,
        lng: undefined,
      };

      await addArea(newArea);
      setAName('');
      setACep('');
      setAStatus('');
    } catch (error) {
      setAStatus('Erro ao consultar CEP');
      alert(error instanceof Error ? error.message : 'Erro ao salvar área');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta área?')) return;
    try {
      await deleteArea(id);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao excluir área');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
        <h4>Nova área atingida</h4>
        <Input
          label="Nome da área"
          value={aName}
          onChange={e => setAName(e.target.value)}
        />
        <Input
          label="CEP"
          value={aCep}
          onChange={e => setACep(e.target.value)}
          placeholder="ex: 85340-000"
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={handleSubmit}>Salvar</Button>
          <Button
            variant="secondary"
            onClick={() => {
              setAName('');
              setACep('');
            }}
          >
            Limpar
          </Button>
        </div>
        {aStatus && (
          <div style={{ fontSize: 13, color: '#666', marginTop: 8 }}>
            {aStatus}
          </div>
        )}
      </div>

      <div style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
        <h4>Áreas encontradas</h4>
        {filteredAreas.length === 0 && (
          <div style={{ fontSize: 13, color: '#666' }}>Nenhuma área localizada</div>
        )}
        {filteredAreas.map(a => (
          <div
            key={a.id}
            style={{
              padding: '8px 0',
              borderBottom: '1px solid #f0f3f6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <strong>
                {a.name} • {a.cep}
              </strong>
              <div style={{ fontSize: 13, color: '#666' }}>
                {a.city || '—'} • {a.state || '—'}
              </div>
            </div>
            <Button variant="danger" onClick={() => handleDelete(a.id)}>
              Excluir
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

