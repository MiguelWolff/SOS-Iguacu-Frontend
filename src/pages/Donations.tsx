import React, { useState } from 'react';
import { useDonations } from '../hooks/useDonations';
import { useAreas } from '../hooks/useAreas';
import { Input, Select, Button } from '../components/ui';
import type { Donation } from '../types';

export const Donations: React.FC = () => {
  const { donations, addDonation } = useDonations();
  const { areas } = useAreas();

  const [dDesc, setDDesc] = useState('');
  const [dQty, setDQty] = useState<number>(1);
  const [dArea, setDArea] = useState<string>('');

  const handleSubmit = async () => {
    if (!dDesc.trim() || dQty <= 0) {
      alert('Informe a doação e quantidade');
      return;
    }

    try {
      await addDonation({
        description: dDesc.trim(),
        quantity: dQty,
        areaId: dArea || null,
      });

      setDDesc('');
      setDQty(1);
      setDArea('');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao salvar doação');
    }
  };

  const areaOptions = [
    { value: '', label: '— Nenhuma —' },
    ...areas.map(a => ({
      value: a.id,
      label: `${a.name} • ${a.cep}`,
    })),
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
        <h4>Registrar doação</h4>
        <Input
          label="Descrição"
          value={dDesc}
          onChange={e => setDDesc(e.target.value)}
        />
        <Input
          label="Quantidade"
          type="number"
          value={dQty}
          onChange={e => setDQty(Number(e.target.value))}
        />
        <Select
          label="Vincular a área (opcional)"
          value={dArea}
          onChange={e => setDArea(e.target.value)}
          options={areaOptions}
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
        {donations.map(d => {
          const area = areas.find(a => a.id === d.areaId);
          return (
            <div
              key={d.id}
              style={{
                padding: '8px 0',
                borderBottom: '1px solid #f0f3f6',
              }}
            >
              <strong>{d.description}</strong>
              <div style={{ fontSize: 13, color: '#666' }}>
                Qtd: {d.quantity} • Área: {area?.name || '—'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

