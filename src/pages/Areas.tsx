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
  const [aCity, setACity] = useState('');
  const [aState, setAState] = useState('');
  const [aBairro, setABairro] = useState('');
  const [aEndereco, setAEndereco] = useState('');
  const [aTipoDesastre, setATipoDesastre] = useState('');
  const [aPrioridade, setAPrioridade] = useState(1);
  const [aNecessidades, setANecessidades] = useState('');

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

      const finalCity = aCity || cepData?.localidade || '';
      const finalState = aState || cepData?.uf || '';
      const finalBairro = aBairro || cepData?.bairro || '';
      const finalEndereco = aEndereco || cepData?.logradouro || '';
      
      const payloadBackend = {
        nome_identificacao: aName.trim(),
        cep: aCep.replace(/\D/g, ''),
        cidade: finalCity,
        bairro: finalBairro,
        estado: finalState,
        endereco: finalEndereco,
        tipo_desastre: aTipoDesastre,
        nivel_prioridade: Number(aPrioridade),
        necessidades_imediatas: aNecessidades,
      };

      await addArea(payloadBackend);

      setAName('');
      setACep('');
      setACity('');
      setAState('');
      setABairro('');
      setAEndereco('');
      setATipoDesastre('');
      setAPrioridade(1);
      setANecessidades('');
      setAStatus('');

    } catch (error) {
      console.error(error);
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
        <Input 
        label = "Cidade"
        value = {aCity}
        onChange={e => setACity(e.target.value)}
        placeholder='Rio Bonito do Iguaçu'
        />
        <Input 
        label='Estado'
        value={aState}
        onChange={e =>setAState(e.target.value)}
        placeholder='Paraná'
        />
        <Input
        label='Bairro'
        value={aBairro}
        onChange={e =>setABairro(e.target.value)}
        placeholder='Centro'
        />
        <Input
        label='Endereço'
        value={aEndereco}
        onChange={e => setAEndereco(e.target.value)}
        placeholder='Av. Dom Pedro II, 563'
        />
        <Input
        label='Desastre'
        value={aTipoDesastre}
        onChange={e => setATipoDesastre(e.target.value)}
        placeholder='Tornado'
        />
        <Input
        label='Prioridade'
        type='number'
        value={aPrioridade}
        onChange={e => setAPrioridade(Number(e.target.value))}
        min={1}
        max={4}
        />
        <Input
        label='Necessidades'
        value={aNecessidades}
        onChange={e => setANecessidades(e.target.value)}
        placeholder='Cobertores e água potável'
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
                {a.nome_identificacao} • {a.cep}
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

