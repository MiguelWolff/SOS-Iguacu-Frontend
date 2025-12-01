import React, { useState } from 'react';
import { useDonations } from '../hooks/useDonations';
import { Input, Select, Button } from '../components/ui';
import type { Donation } from '../types';

export const Donations: React.FC = () => {
  const { donations, addDonation } = useDonations();

  const [dProduto, setDProduto] = useState('');
  const [dTipo, setDTipo] = useState('');
  const [dQuantidade, setDQuantidade] = useState<number>(0);
  const [dUnidadeMedida, setDUnidadeMedida] = useState('');
  const [dQuantidadeVolume, setDQuantidadeVolume] = useState<number>(0);
  const [dSituacao, setDSituacao] = useState('');
  const [dDestino, setDDestino] = useState('');
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
      destino: dDestino.trim() || null,
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
      setDDestino('');
      setDEntregue(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao salvar doação');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
        <h4>Registrar doação</h4>

        <Input label="Produto" value={dProduto} onChange={e => setDProduto(e.target.value)} />

        <Input label="Tipo" value={dTipo} onChange={e => setDTipo(e.target.value)} />

        <Input
          label="Quantidade"
          type="number"
          value={dQuantidade}
          onChange={e => setDQuantidade(Number(e.target.value))}
        />

        <Input
          label="Unidade de Medida"
          value={dUnidadeMedida}
          onChange={e => setDUnidadeMedida(e.target.value)}
        />

        <Input
          label="Quantidade por Volume"
          type="number"
          value={dQuantidadeVolume}
          onChange={e => setDQuantidadeVolume(Number(e.target.value))}
        />

        <Input
          label="Situação"
          value={dSituacao}
          onChange={e => setDSituacao(e.target.value)}
        />

        <Input
          label="Destino"
          value={dDestino}
          onChange={e => setDDestino(e.target.value)}
        />

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
              {d.tipo} • Qtd: {d.quantidade} • Volume: {d.quantidade_por_volume} • Situacao: {d.situacao} •
              Entregue: {d.entregue ? 'Sim' : 'Não'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
