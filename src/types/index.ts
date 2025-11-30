export type Volunteer = {
  id: number|null;
  nome_completo: string;
  cpf?: string;
  data_nascimento?: string;
  email?: string;
  telefone?: string;
  ddd: number;
  estado?: string;
  habilidade_principal?: string;
  disponibilidade?: string;
};

export type Area = {
  id?: number|null;
  nome_identificacao: string;
  cep: string;
  cidade?: string;
  estado?: string;
  endereco?: string;
  tipo_desastre?: string;
  nivel_prioridade: number;
  status?: string;
  necessidades_imediatas?: string;
};

export type Donation = {
  produto?: string;
  tipo: string;
  situacao?: string;
  quantidade: number;
  unidade_medida?: string;
  quantidade_por_volume: number;
  areaId?: string | null;
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

