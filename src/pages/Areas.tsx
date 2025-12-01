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
  const [aCity, setACity] = useState('');
  const [aState, setAState] = useState('');
  const [aBairro, setABairro] = useState('');
  const [aEndereco, setAEndereco] = useState('');
  const [aTipoDesastre, setATipoDesastre] = useState('');
  const [aPrioridade, setAPrioridade] = useState(1);
  const [aNecessidades, setANecessidades] = useState('');
  const [aStatusCep, setAStatusCep] = useState('');

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

    setAStatusCep('Consultando CEP...');
    try {
      const cepData = await lookupCep(aCep);

      const finalCity = aCity || cepData?.localidade || '';
      const finalState = aState || cepData?.uf || '';
      const finalBairro = aBairro || cepData?.bairro || '';
      const finalEndereco = aEndereco || cepData?.logradouro || '';

      const payloadBackend: Area = {
        nome_identificacao: aName.trim(),
        cep: aCep.replace(/\D/g, ''),
        cidade: finalCity,
        bairro: finalBairro,
        estado: finalState,
        endereco: finalEndereco,
        tipo_desastre: aTipoDesastre || '',
        nivel_prioridade: Number(aPrioridade),
        necessidades_imediatas: aNecessidades || '',
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

    } catch (error) {
      console.error(error);
      setAStatusCep('Erro ao consultar CEP');
      alert(error instanceof Error ? error.message : 'Erro ao salvar área');
    }
  };

  const handleDelete = async (id: string | null | undefined) => {
    if (!id) {
      alert('ID inválido');
      return;
    }

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

        <Input label="Nome da área" value={aName} onChange={e => setAName(e.target.value)} />

        <Input label="CEP" value={aCep} onChange={e => setACep(e.target.value)} placeholder="ex: 85340000" />

        <Input label="Cidade" value={aCity} onChange={e => setACity(e.target.value)} placeholder="Rio Bonito do Iguaçu" />

        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 12 }}>
          <label style={{ marginBottom: 4 }}>Estado</label>
          <select
            value={aState}
            onChange={e => setAState(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #ccc',
              fontSize: 14
            }}
          >
            <option value="" disabled>Selecione o estado</option>
            <option value="AC">Acre</option>
            <option value="AL">Alagoas</option>
            <option value="AP">Amapá</option>
            <option value="AM">Amazonas</option>
            <option value="BA">Bahia</option>
            <option value="CE">Ceará</option>
            <option value="DF">Distrito Federal</option>
            <option value="ES">Espírito Santo</option>
            <option value="GO">Goiás</option>
            <option value="MA">Maranhão</option>
            <option value="MT">Mato Grosso</option>
            <option value="MS">Mato Grosso do Sul</option>
            <option value="MG">Minas Gerais</option>
            <option value="PA">Pará</option>
            <option value="PB">Paraíba</option>
            <option value="PR">Paraná</option>
            <option value="PE">Pernambuco</option>
            <option value="PI">Piauí</option>
            <option value="RJ">Rio de Janeiro</option>
            <option value="RN">Rio Grande do Norte</option>
            <option value="RS">Rio Grande do Sul</option>
            <option value="RO">Rondônia</option>
            <option value="RR">Roraima</option>
            <option value="SC">Santa Catarina (SC)</option>
            <option value="SP">São Paulo</option>
            <option value="SE">Sergipe</option>
            <option value="TO">Tocantins</option>
          </select>
        </div>
          
        <Input label="Bairro" value={aBairro} onChange={e => setABairro(e.target.value)} placeholder="Centro" />
          
        <Input label="Endereço" value={aEndereco} onChange={e => setAEndereco(e.target.value)} placeholder="Av. Dom Pedro II, 563" />
          
        <Input label="Desastre" value={aTipoDesastre} onChange={e => setATipoDesastre(e.target.value)} placeholder="Tornado" />
          
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 12 }}>
          <label style={{ marginBottom: 4 }}>Prioridade</label>
          <select
            value={aPrioridade}
            onChange={e => setAPrioridade(Number(e.target.value))}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #ccc',
              fontSize: 14
            }}
          >
            <option value="" disabled>Selecione a prioridade</option>
            <option value={1}>Baixa - Monitoramento</option>
            <option value={2}>Média - Danos Materiais</option>
            <option value={3}>Alta - Desabrigados</option>
            <option value={4}>Crítica - Risco de Vida / Calamidade Pública</option>
          </select>
        </div>
          
        <Input
          label="Necessidades"
          value={aNecessidades}
          onChange={e => setANecessidades(e.target.value)}
          placeholder="Cobertores e água potável"
        />

        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={handleSubmit}>Salvar</Button>
          <Button variant="secondary" onClick={() => { setAName(''); setACep(''); }}>
            Limpar
          </Button>
        </div>
          
        {aStatusCep && (
          <div style={{ fontSize: 13, color: '#666', marginTop: 8 }}>
            {aStatusCep}
          </div>
        )}
      </div>
      
      <div style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
        <h4>Áreas encontradas</h4>
        {filteredAreas.length === 0 && (
          <div style={{ fontSize: 13, color: '#666' }}>
            Nenhuma área localizada
          </div>
        )}
        {filteredAreas.map(a => (
          <div
            key={a.id}
            style={{
              padding: '8px 0',
              borderBottom: '1px solid #f0f3f6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <strong>{a.nome_identificacao} • {a.cep}</strong>
              <div style={{ fontSize: 13, color: '#666' }}>
                {a.cidade || '—'} • {a.estado || '—'}
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
