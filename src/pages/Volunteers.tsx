import React, { useState } from 'react';
import { useVolunteers } from '../hooks/useVolunteers';
import { useAreas } from '../hooks/useAreas';
import { Input, Textarea, Select, Button } from '../components/ui';
import type { Volunteer } from '../types';

export const Volunteers: React.FC = () => {
  const { volunteers, addVolunteer } = useVolunteers();
  const { areas } = useAreas();

  const [vName, setVName] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [vEmail, setVEmail] = useState('');
  const [vSkills, setVSkills] = useState('');
  const [vArea, setVArea] = useState<string>('');

  const handleSubmit = async () => {
    if (!vName.trim()) {
      alert('Informe o nome do voluntário');
      return;
    }

    try {
      await addVolunteer({
        name: vName.trim(),
        phone: vPhone.trim() || undefined,
        email: vEmail.trim() || undefined,
        skills: vSkills.trim() || undefined,
        areaId: vArea || null,
      });

      setVName('');
      setVPhone('');
      setVEmail('');
      setVSkills('');
      setVArea('');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao salvar voluntário');
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
        <h4>Novo voluntário</h4>
        <Input
          label="Nome"
          value={vName}
          onChange={e => setVName(e.target.value)}
        />
        <Input
          label="Telefone"
          value={vPhone}
          onChange={e => setVPhone(e.target.value)}
        />
        <Input
          label="E-mail"
          type="email"
          value={vEmail}
          onChange={e => setVEmail(e.target.value)}
        />
        <Textarea
          label="Skills / Observações"
          value={vSkills}
          onChange={e => setVSkills(e.target.value)}
        />
        <Select
          label="Área atingida"
          value={vArea}
          onChange={e => setVArea(e.target.value)}
          options={areaOptions}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={handleSubmit}>Salvar</Button>
          <Button
            variant="secondary"
            onClick={() => {
              setVName('');
              setVPhone('');
              setVEmail('');
              setVSkills('');
            }}
          >
            Limpar
          </Button>
        </div>
      </div>

      <div style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
        <h4>Lista de voluntários</h4>
        {volunteers.length === 0 && (
          <div style={{ fontSize: 13, color: '#666' }}>Nenhum voluntário</div>
        )}
        {volunteers.map(v => {
          const area = areas.find(a => a.id === v.areaId);
          return (
            <div
              key={v.id}
              style={{
                padding: '8px 0',
                borderBottom: '1px solid #f0f3f6',
              }}
            >
              <strong>{v.name}</strong>
              <div style={{ fontSize: 13, color: '#666' }}>
                {v.skills} • {v.phone} • {v.email} • Área: {area?.name || '—'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

