export type Volunteer = {
  id: string | null;
  nome_completo: string;
  data_nascimento: string;
  email?: string | null;
  telefone: string;
  ddd: string;
  cidade: string;
  estado: string;

  habilidade_principal: string;
  disponibilidade: string;

  regiao_afetada_atuacao?: string | null;
};

export type Area = {
  id?: string | null;
  nome_identificacao: string;
  cep: string;
  estado: string;
  cidade: string;
  bairro: string;
  endereco: string;

  tipo_desastre: string;
  nivel_prioridade: number;

  necessidades_imediatas: string;

  lat?: number | null;
  lng?: number | null;
};

export type Donation = {
  id?: string | null;
  produto: string;
  tipo: string;
  quantidade: number;
  unidade_medida?: string | null;
  quantidade_por_volume: number;
  situacao: string;

  destino?: string | null;
  entregue?: boolean;
};

export type ViewType = 'dashboard' | 'volunteers' | 'areas' | 'donations' | 'reports' | 'analytics';

export type ExportType = 'volunteers' | 'areas' | 'donations';

export type ViaCepResponse = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
};

