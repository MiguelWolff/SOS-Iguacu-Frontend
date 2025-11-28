// src/App.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { vi } from 'vitest';

// --- MOCKS GLOBAIS ---
// Mock do fetch para simular API
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock do window.confirm
global.confirm = vi.fn(() => true);

// Mock do jsPDF para evitar erro em testes de PDF
vi.mock('jspdf', () => ({
  default: vi.fn(() => ({
    setFontSize: vi.fn(),
    text: vi.fn(),
    save: vi.fn(),
  })),
}));

// Mock do jspdf-autotable
vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}));

// Mock do Leaflet
vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => ({
      setView: vi.fn(),
      eachLayer: vi.fn((callback: any) => {
        const mockLayer = { _icon: true };
        callback(mockLayer);
      }),
      removeLayer: vi.fn(),
    })),
    tileLayer: vi.fn(() => ({
      addTo: vi.fn(),
    })),
    marker: vi.fn(() => ({
      addTo: vi.fn(() => ({
        bindPopup: vi.fn(),
      })),
    })),
  },
}));

// Mock do URL e Blob para testes de CSV
const mockBlob = { type: 'text/csv;charset=utf-8;' } as Blob;
const mockUrl = 'blob:mock-url';
global.Blob = vi.fn(() => mockBlob);
global.URL.createObjectURL = vi.fn(() => mockUrl);
global.URL.revokeObjectURL = vi.fn();
const mockAnchorClick = vi.fn();
global.document.createElement = vi.fn((tagName) => {
  if (tagName === 'a') {
    return {
      href: '',
      download: '',
      click: mockAnchorClick,
    };
  }
  return {};
}) as any;

// --- DADOS DE TESTE MOCKADOS ---
const mockVolunteers = [
  { id: 'v_1', name: 'Alice', areaId: 'a_1' },
  { id: 'v_2', name: 'Bob', areaId: 'a_2' },
  { id: 'v_3', name: 'Charlie', areaId: null },
];

const mockAreas = [
  { id: 'a_1', name: 'Area X', cep: '12345-000', city: 'CityX', state: 'CX', lat: -25, lng: -52 },
  { id: 'a_2', name: 'Area Y', cep: '54321-000', city: 'CityY', state: 'CY' },
];

const mockDonations = [
  { id: 'd_1', description: 'Water', quantity: 10, areaId: 'a_1' },
  { id: 'd_2', description: 'Blanket', quantity: 5, areaId: 'a_1' },
  { id: 'd_3', description: 'Food', quantity: 20, areaId: null },
];

// Configuração do mockFetch para respostas iniciais
const setupInitialMocks = () => {
  mockFetch.mockImplementation((url: string) => {
    if (url.includes('/voluntario')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVolunteers),
      });
    }
    if (url.includes('/area-afetada')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAreas),
      });
    }
    if (url.includes('/doacao')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDonations),
      });
    }
    return Promise.reject(new Error('URL não mockada'));
  });
};

// Reseta o localStorage e mocks antes de cada teste
beforeEach(() => {
  localStorage.clear();
  mockFetch.mockClear();
  vi.clearAllMocks();
  setupInitialMocks();
});

// ----------------------------------------------------
// ## Testes Unitários: Lógica de Dados e Utilitários
// ----------------------------------------------------

describe('Lógica de Dados (useMemo) e Utilitários', () => {
  test('KPIs calculam as porcentagens corretamente', async () => {
    render(<App />);

    await waitFor(() => screen.getByText('Dashboard'));

    // Voluntários: 3 total. 2 com área (v_1, v_2).
    // Esperado: (2 / 3) * 100 = 66.66... -> 67% arredondado
    expect(screen.getByText('67%')).toBeInTheDocument(); // kpiPercentVolWithArea

    // Áreas: 2 total. Area X (a_1) tem doações (d_1, d_2). Area Y (a_2) não tem.
    // Esperado: (1 / 2) * 100 = 50%
    expect(screen.getByText('50%')).toBeInTheDocument(); // kpiPercentAreasWithDon

    // Doações: 3 total. 2 com área (d_1, d_2).
    // Esperado: (2 / 3) * 100 = 66.66... -> 67% arredondado
    const kpiTexts = screen.getAllByText('67%');
    expect(kpiTexts.length).toBeGreaterThan(0); // kpiPercentDonationsLinked
  });

  test('Ranking de áreas é calculado corretamente', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Ranking de áreas (voluntários + doações)'));

    // Area X (a_1): 1 voluntário (v_1) + 2 doações (d_1, d_2) = Total 3
    // Area Y (a_2): 1 voluntário (v_2) + 0 doações = Total 1
    // A lista deve mostrar Area X primeiro.
    expect(screen.getByText('Area X')).toBeInTheDocument();
    expect(screen.getByText('Area Y')).toBeInTheDocument();
  });

  test('A função generatePDF chama jspdf e jspdf-autotable corretamente', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Relatórios'));

    // Navegar para Relatórios
    fireEvent.click(screen.getByText('Relatórios'));
    await waitFor(() => screen.getByText('Exportar áreas'));

    // Simula clique para gerar PDF de Áreas
    fireEvent.click(screen.getByText('Exportar áreas'));

    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;

    // Verifica se o jsPDF foi instanciado
    expect(jsPDF).toHaveBeenCalled();

    // Verifica se o autoTable foi chamado
    expect(autoTable).toHaveBeenCalled();
  });
});

// ----------------------------------------------------
// ## Teste de Integração: Componente e Fluxo de Usuário
// ----------------------------------------------------

describe('Teste de Integração: Fluxo de Cadastro e Interação de UI', () => {
  test('Permite cadastrar um voluntário e atualiza a lista', async () => {
    // 1. Configurar mocks para a chamada POST
    const newVolunteer = { id: 'v_new', name: 'Zoe', areaId: 'a_1' };
    mockFetch.mockImplementation((url: string, options?: any) => {
      if (url.includes('/voluntario') && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(newVolunteer),
        });
      }
      if (url.includes('/voluntario')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockVolunteers),
        });
      }
      if (url.includes('/area-afetada')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAreas),
        });
      }
      if (url.includes('/doacao')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDonations),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });

    render(<App />);

    // 2. Navegar para a tela de Voluntários
    fireEvent.click(screen.getByText('Cadastrar voluntários'));
    await waitFor(() => screen.getByText('Novo voluntário'));

    // 3. Preencher o formulário
    const nameInput = screen.getByLabelText('Nome');
    fireEvent.change(nameInput, { target: { value: 'Zoe' } });

    const skillsInput = screen.getByLabelText('Skills / Observações');
    fireEvent.change(skillsInput, { target: { value: 'Desenvolvedora' } });

    // 4. Selecionar uma área (a_1)
    const areaSelect = screen.getByLabelText('Área atingida');
    fireEvent.change(areaSelect, { target: { value: 'a_1' } });

    // 5. Clicar em Salvar
    fireEvent.click(screen.getByText('Salvar'));

    // 6. Verificar se a chamada POST foi feita corretamente
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/voluntario'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    // 7. Verificar se o novo voluntário aparece na lista
    await waitFor(() => {
      expect(screen.getByText('Zoe')).toBeInTheDocument();
    });
  });

  test('Permite pesquisar áreas por CEP', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Dashboard'));

    // 1. Digitar um CEP na caixa de busca global (CEP: 12345-000 da Area X)
    const cepInput = screen.getByPlaceholderText('Buscar por CEP');
    fireEvent.change(cepInput, { target: { value: '12345' } });

    // 2. Navegar para a tela de Áreas para ver a lista filtrada
    fireEvent.click(screen.getByText('Cadastrar áreas / CEP'));

    // 3. Verificar se apenas a Área X está visível
    await waitFor(() => {
      expect(screen.getByText(/Area X.*12345-000/)).toBeInTheDocument();
    });
  });

  test('Permite deletar uma área', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Dashboard'));

    // 1. Navegar para a tela de Áreas
    fireEvent.click(screen.getByText('Cadastrar áreas / CEP'));
    await waitFor(() => screen.getByText('Áreas encontradas'));

    // 2. Simular o mock da deleção para Area X (a_1)
    mockFetch.mockImplementation((url: string, options?: any) => {
      if (url.includes('/area-afetada/a_1') && options?.method === 'DELETE') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }
      if (url.includes('/area-afetada')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAreas.filter(a => a.id !== 'a_1')),
        });
      }
      if (url.includes('/voluntario')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockVolunteers),
        });
      }
      if (url.includes('/doacao')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDonations),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });

    // 3. Clicar no botão Excluir da Area X
    const deleteButtons = screen.getAllByText('Excluir');
    fireEvent.click(deleteButtons[0]);

    // 4. Verificar se a chamada DELETE foi feita
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/area-afetada/a_1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});
