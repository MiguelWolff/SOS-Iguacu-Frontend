import React, { useState } from 'react';
import { useDonations } from '../hooks/useDonations';
import { useAreas } from '../hooks/useAreas';
import { Input, Select, Button } from '../components/ui';
import type { Donation } from '../types';

export const Donations: React.FC = () => {
  const { donations, addDonation } = useDonations();
  const { areas } = useAreas();

  const [dProduto, setDProduto] = useState('');
  const [dTipo, setDTipo] = useState('');
  const [dQuantidade, setDQuantidade] = useState<number>(0);
  const [dUnidadeMedida, setDUnidadeMedida] = useState('');
  const [dQuantidadeVolume, setDQuantidadeVolume] = useState<number>(0);
  const [dSituacao, setDSituacao] = useState('');
  const [dArea, setDArea] = useState<string>('');
  const [dEntregue, setDEntregue] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!dProduto.trim() || dQuantidade <= 0) {
      alert('Informe o produto e quantidade');
      return;
    }

    const payload: Donation = {
      produto: dProduto.trim(),
      tipo: dTipo.trim(),
      quantidade: dQuantidade,
      unidade_medida: dUnidadeMedida.trim() || null,
      quantidade_por_volume: dQuantidadeVolume,
      situacao: dSituacao.trim(),
      destino: dArea === '' ? null : dArea,
      entregue: dEntregue,
    };

    try {
      await addDonation(payload);

      // reset
      setDProduto('');
      setDTipo('');
      setDQuantidade(0);
      setDUnidadeMedida('');
      setDQuantidadeVolume(0);
      setDSituacao('');
      setDArea('');
      setDEntregue(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao salvar doação');
    }
  };

  const areaOptions = [
    { value: '', label: '— Nenhuma —' },
    ...areas.map(a => ({
      value: String(a.id),
      label: `${a.nome_identificacao} • ${a.cep}`,
    })),
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
        <h4>Registrar doação</h4>

        <Input
          label="Produto"
          value={dProduto}
          onChange={e => setDProduto(e.target.value)}
        />

        <Select
          label="Tipo"
          value={dTipo}
          onChange={e => setDTipo(e.target.value)}
          options={[
            { value: '', label: 'Selecione o tipo da doação'},
            { value: 'AGUA', label: 'Água Potável' },
            { value: 'ALIMENTO', label: 'Alimento Não Perecível' },
            { value: 'ROUPA', label: 'Vestuário/Cama/Banho' },
            { value: 'HIGIENE', label: 'Itens de Higiene' },
            { value: 'MEDICAMENTO', label: 'Medicamentos' },
            { value: 'DINHEIRO', label: 'Aporte Financeiro' },
            { value: 'MATERIAL', label: 'Material para reforma' },
            { value: 'OUTRO', label: 'Outros' },
          ]}
        />

        <Input
          label="Quantidade"
          type="number"
          value={dQuantidade}
          onChange={e => setDQuantidade(Number(e.target.value))}
        />

        <Select
          label="Unidade de Medida"
          value={dUnidadeMedida}
          onChange={e => setDUnidadeMedida(e.target.value)}
          options={[
            { value: '', label: 'Selecione a unidade de medida da doação'},
            { value: 'KG', label: 'Quilogramas (Kg)' },
            { value: 'L', label: 'Litros (L)' },
            { value: 'UN', label: 'Unidades (Un)' },
            { value: 'CX', label: 'Caixas (Cx)' },
            { value: 'PCT', label: 'Pacotes (Pct)' },
            { value: 'FARDO', label: 'Fardos' },
            { value: 'PALLET', label: 'Pallets' },
            { value: 'OUTRO', label: 'Outro' },
          ]}
        />

        <Input
          label="Quantidade por Volume"
          type="number"
          value={dQuantidadeVolume}
          onChange={e => setDQuantidadeVolume(Number(e.target.value))}
        />

        <Select
          label="Situação"
          value={dSituacao}
          onChange={e => setDSituacao(e.target.value)}
          options={[
            { value: '', label: 'Selecione a situação da doação'},
            { value: 'DISPONIVEL', label: 'Disponível / Em Estoque' },
            { value: 'RESERVADO', label: 'Reservado para Região' },
            { value: 'EM_TRANSITO', label: 'Em Trânsito / Saiu para Entrega' },
            { value: 'ENTREGUE', label: 'Entregue ao Destino' },
          ]}
        />

        <Select label="Destino" value={dArea} onChange={e => setDArea(e.target.value)} options={areaOptions} />

        <Select
          label="Entregue?"
          value={dEntregue ? 'true' : 'false'}
          onChange={e => setDEntregue(e.target.value === 'true')}
          options={[
            { value: 'false', label: 'Não' },
            { value: 'true', label: 'Sim' },
          ]}
        />

        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={handleSubmit}>Salvar</Button>
        </div>
      </div>
        
      <div style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
        <h4>Doações registradas</h4>
        
        {donations.length === 0 && (
          <div style={{ fontSize: 13, color: '#666' }}>Nenhuma doação</div>
        )}

        {donations.map(d => (
          <div
            key={d.id}
            style={{
              padding: '8px 0',
              borderBottom: '1px solid #f0f3f6',
            }}
          >
            <strong>{d.produto}</strong>
            <div style={{ fontSize: 13, color: '#666' }}>
              {d.tipo} • Qtd: {d.quantidade} • Volume: {d.quantidade_por_volume} • Situação: {d.situacao} •
              Entregue: {d.entregue ? 'Sim' : 'Não'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
