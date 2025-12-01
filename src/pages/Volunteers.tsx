import React, { useState } from 'react';
import { useVolunteers } from '../hooks/useVolunteers';
import { useAreas } from '../hooks/useAreas';
import { Input, Textarea, Select, Button } from '../components/ui';
import type { Volunteer } from '../types';

export const Volunteers: React.FC = () => {
  const { volunteers, addVolunteer, deleteVolunteer } = useVolunteers();
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

  const handleDelete = async (id: string | null | undefined) => {
    if (!id) {
      alert('ID inválido');
      return;
    }

    if (!confirm('Tem certeza que deseja excluir esta área?')) return;

    try {
      await deleteVolunteer(id);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao excluir área');
    }
  };

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

        <Select
          label="Estado"
          value={vEstado}
          onChange={e => setVEstado(e.target.value)}
          options={[
            { value: '', label: 'Selecione o estado'},
            { value: 'AC', label: 'Acre' },
            { value: 'AL', label: 'Alagoas' },
            { value: 'AP', label: 'Amapá' },
            { value: 'AM', label: 'Amazonas' },
            { value: 'BA', label: 'Bahia' },
            { value: 'CE', label: 'Ceará' },
            { value: 'DF', label: 'Distrito Federal' },
            { value: 'ES', label: 'Espírito Santo' },
            { value: 'GO', label: 'Goiás' },
            { value: 'MA', label: 'Maranhão' },
            { value: 'MT', label: 'Mato Grosso' },
            { value: 'MS', label: 'Mato Grosso do Sul' },
            { value: 'MG', label: 'Minas Gerais' },
            { value: 'PA', label: 'Pará' },
            { value: 'PB', label: 'Paraíba' },
            { value: 'PR', label: 'Paraná' },
            { value: 'PE', label: 'Pernambuco' },
            { value: 'PI', label: 'Piauí' },
            { value: 'RJ', label: 'Rio de Janeiro' },
            { value: 'RN', label: 'Rio Grande do Norte' },
            { value: 'RS', label: 'Rio Grande do Sul' },
            { value: 'RO', label: 'Rondônia' },
            { value: 'RR', label: 'Roraima' },
            { value: 'SC', label: 'Santa Catarina' },
            { value: 'SP', label: 'São Paulo' },
            { value: 'SE', label: 'Sergipe' },
            { value: 'TO', label: 'Tocantins' },
          ]}
        />

        <Select
          label="Habilidade principal"
          value={vHabilidadePrincipal}
          onChange={e => setVHabilidadePrincipal(e.target.value)}
          options={[
            {value: '', label: 'Selecione sua habilidade conforme sua atuação profissional' },
            { value: 'SAUDE', label: 'Profissional de Saúde (Médico/Enfermeiro)' },
            { value: 'RESGATE', label: 'Busca e Resgate' },
            { value: 'LOGISTICA', label: 'Logística e Transporte' },
            { value: 'PSICO', label: 'Apoio Psicológico' },
            { value: 'GERAL', label: 'Serviços Gerais / Limpeza' },
            { value: 'COZINHA', label: 'Cozinha e Alimentação' },
          ]}
        />

        <Select
          label="Disponibilidade"
          value={vDisponibilidade}
          onChange={e => setVDisponibilidade(e.target.value)}
          options={[
            { value: '', label: 'Selecione a disponibilidade' },
            { value: 'MANHA', label: 'Manhã (08:00 - 12:00)' },
            { value: 'TARDE', label: 'Tarde (13:00 - 18:00)' },
            { value: 'NOITE', label: 'Noite (19:00 - 22:00)' },
            { value: 'MADRUGADA', label: 'Madrugada (22:00 - 08:00)' },
            { value: 'FIM_SEMANA', label: 'Finais de Semana' },
            { value: 'TOTAL', label: 'Disponibilidade Total' },
            { value: 'VARIAVEL', label: 'Horário Variável / A combinar' },
          ]}
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
              <div>
                <strong>{v.nome_completo}</strong>
                <div style={{ fontSize: 13, color: '#666' }}>
                  {v.habilidade_principal} • {v.telefone} • {v.email} • Área: {area?.nome_identificacao || '—'}
                </div>
              </div>
              <Button variant="danger" onClick={() => handleDelete(v.id)}>
                Excluir
              </Button>
            </div>
            
          );
        })}
      </div>
    </div>
  );
};
