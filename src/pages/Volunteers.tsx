import React, { useState } from 'react';
import { useVolunteers } from '../hooks/useVolunteers';
import { useAreas } from '../hooks/useAreas';
import { Input, Textarea, Select, Button } from '../components/ui';
import type { Volunteer } from '../types';

export const Volunteers: React.FC = () => {
  const { volunteers, addVolunteer } = useVolunteers();
  const { areas } = useAreas();

  // FORM STATES
  const [vNomeCompleto, setVNomeCompleto] = useState('');
  const [vDataNascimento, setVDataNascimento] = useState('');
  const [vEmail, setVEmail] = useState('');
  const [vTelefone, setVTelefone] = useState('');
  const [vDDD, setVDDD] = useState('');
  const [vCidade, setVCidade] = useState('');
  const [vEstado, setVEstado] = useState('');
  const [vHabilidadePrincipal, setVHabilidadePrincipal] = useState('');
  const [vDisponibilidade, setVDisponibilidade] = useState('');
  const [vArea, setVArea] = useState<string>('');

  const handleSubmit = async () => {
    if (!vNomeCompleto.trim()) {
      alert('Informe o nome do voluntário');
      return;
    }

    try {
      await addVolunteer({
        nome_completo: vNomeCompleto.trim(),
        data_nascimento: vDataNascimento.trim(),
        email: vEmail.trim(),
        telefone: vTelefone.trim(),
        ddd: vDDD.trim(),
        cidade: vCidade.trim(),
        estado: vEstado.trim(),
        habilidade_principal: vHabilidadePrincipal.trim(),
        disponibilidade: vDisponibilidade.trim(),
        regiao_afetada_atuacao: vArea === '' ? null : vArea,
      });

      // RESET
      setVNomeCompleto('');
      setVDataNascimento('');
      setVEmail('');
      setVTelefone('');
      setVDDD('');
      setVCidade('');
      setVEstado('');
      setVHabilidadePrincipal('');
      setVDisponibilidade('');
      setVArea('');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao salvar voluntário');
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
        <h4>Novo voluntário</h4>

        <Input label="Nome completo" value={vNomeCompleto} onChange={e => setVNomeCompleto(e.target.value)} />

        <Input label="Data de nascimento" type="date" value={vDataNascimento} onChange={e => setVDataNascimento(e.target.value)} />

        <Input label="E-mail" type="email" value={vEmail} onChange={e => setVEmail(e.target.value)} />

        <Input label="Telefone" value={vTelefone} onChange={e => setVTelefone(e.target.value)} />

        <Input label="DDD" value={vDDD} onChange={e => setVDDD(e.target.value)} />

        <Input label="Cidade" value={vCidade} onChange={e => setVCidade(e.target.value)} />

        <Input label="Estado" value={vEstado} onChange={e => setVEstado(e.target.value)} />

        <Input
          label="Habilidade principal"
          value={vHabilidadePrincipal}
          onChange={e => setVHabilidadePrincipal(e.target.value)}
        />

        <Input
          label="Disponibilidade"
          value={vDisponibilidade}
          onChange={e => setVDisponibilidade(e.target.value)}
        />

        <Select label="Área afetada" value={vArea} onChange={e => setVArea(e.target.value)} options={areaOptions} />

        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={handleSubmit}>Salvar</Button>
          <Button
            variant="secondary"
            onClick={() => {
              setVNomeCompleto('');
              setVDataNascimento('');
              setVEmail('');
              setVTelefone('');
              setVDDD('');
              setVCidade('');
              setVEstado('');
              setVHabilidadePrincipal('');
              setVDisponibilidade('');
              setVArea('');
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
          const area = areas.find(a => a.id === v.regiao_afetada_atuacao);
          return (
            <div
              key={v.id}
              style={{
                padding: '8px 0',
                borderBottom: '1px solid #f0f3f6',
              }}
            >
              <strong>{v.nome_completo}</strong>
              <div style={{ fontSize: 13, color: '#666' }}>
                {v.habilidade_principal} • {v.telefone} • {v.email} • Área: {area?.nome_identificacao || '—'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
