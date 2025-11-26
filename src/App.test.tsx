// src/App.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from './App'
import { vi } from 'vitest'

// --- MOCKS GLOBAIS ---
// Mock do fetch para simular API
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock do window.confirm
global.confirm = vi.fn(() => true)

// Mock do jsPDF para evitar erro em testes de PDF
vi.mock('jspdf', () => ({
  default: vi.fn(() => ({
    setFontSize: vi.fn(),
    text: vi.fn(),
    save: vi.fn(),
  })),
}))

// Mock do jspdf-autotable
vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}))

// Mock do URL e Blob para testes de CSV
const mockBlob = { type: 'text/csv;charset=utf-8;' } as Blob
const mockUrl = 'blob:mock-url'
global.Blob = vi.fn(() => mockBlob)
global.URL.createObjectURL = vi.fn(() => mockUrl)
global.URL.revokeObjectURL = vi.fn()
const mockAnchorClick = vi.fn()
global.document.createElement = vi.fn((tagName) => {
  if (tagName === 'a') {
    return {
      href: '',
      download: '',
      click: mockAnchorClick,
    }
  }
  return {}
}) as any


// --- DADOS DE TESTE MOCKADOS ---
const mockVolunteers = [{ id: 'v_1', name: 'Alice', areaId: 'a_1' }, { id: 'v_2', name: 'Bob', areaId: 'a_2' }, { id: 'v_3', name: 'Charlie', areaId: null }]
const mockAreas = [{ id: 'a_1', name: 'Area X', cep: '12345-000', city: 'CityX', state: 'CX', lat: -25, lng: -52 }, { id: 'a_2', name: 'Area Y', cep: '54321-000', city: 'CityY', state: 'CY' }]
const mockDonations = [{ id: 'd_1', description: 'Water', quantity: 10, areaId: 'a_1' }, { id: 'd_2', description: 'Blanket', quantity: 5, areaId: 'a_1' }, { id: 'd_3', description: 'Food', quantity: 20, areaId: null }]

// Configuração do mockFetch para respostas iniciais
const setupInitialMocks = () => {
  mockFetch.mockImplementation((url: string) => {
    if (url.includes('/volunteers')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockVolunteers) })
    }
    if (url.includes('/areas')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockAreas) })
    }
    if (url.includes('/donations')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockDonations) })
    }
    return Promise.reject(new Error('URL não mockada'))
  })
}

// Reseta o localStorage e mocks antes de cada teste
beforeEach(() => {
  localStorage.clear()
  mockFetch.mockClear()
  vi.clearAllMocks()
  setupInitialMocks()
})

// Função para buscar a função generateCSV, que não é exportada.
// Esta é uma técnica para testar funções não exportadas no mesmo arquivo.
// Neste caso, a função está no final do arquivo App.tsx e usa localStorage.
function generateCSVFromAppFile(type: 'volunteers' | 'areas' | 'donations', vols: any[], areas: any[], dons: any[]) {
  // Simula o salvamento no localStorage que a função generateCSV espera
  localStorage.setItem('vols', JSON.stringify(vols))
  localStorage.setItem('areas', JSON.stringify(areas))
  localStorage.setItem('dons', JSON.stringify(dons))

  // A função generateCSV não está exportada, então a simularemos aqui.
  // Você teria que exportá-la em um cenário de código real ou testá-la via integração,
  // mas para fins de cobertura, recriaremos a chamada com mocks.

  // O mock de 'jspdf' e 'Blob' já deve capturar o comportamento de download.
  const appModule = require('./App')
  appModule.generateCSV(type); // Assumindo que você a exportou no App.tsx
}

// ----------------------------------------------------
// ## Testes Unitários: Lógica de Dados e Utilitários
// ----------------------------------------------------

describe('Lógica de Dados (useMemo) e Utilitários', () => {
  
  test('KPIs calculam as porcentagens corretamente', async () => {
    // Renderiza App para que a lógica useMemo seja executada
    render(<App />)

    // Aguarda o carregamento dos dados
    await waitFor(() => screen.getByText('Dashboard'))

    // Voluntários: 3 total. 2 com área (v_1, v_2).
    // Esperado: (2 / 3) * 100 = 66.66... -> 67% arredondado
    expect(screen.getByText('67%')).toBeInTheDocument() // kpiPercentVolWithArea

    // Áreas: 2 total. Area X (a_1) tem doações (d_1, d_2). Area Y (a_2) não tem.
    // Esperado: (1 / 2) * 100 = 50%
    expect(screen.getByText('50%')).toBeInTheDocument() // kpiPercentAreasWithDon

    // Doações: 3 total. 2 com área (d_1, d_2).
    // Esperado: (2 / 3) * 100 = 66.66... -> 67% arredondado
    expect(screen.getAllByText('67%')[1]).toBeInTheDocument() // kpiPercentDonationsLinked (pega o segundo 67% na tela)

    // Testa caso de lista vazia
    mockFetch.mockImplementation(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }))
    render(<App />)
    await waitFor(() => screen.getByText('Dashboard'))
    // Sem voluntários, áreas ou doações, todos os KPIs devem ser 0%
    expect(screen.getAllByText('0%')).toHaveLength(3) 
  })

  test('Ranking de áreas é calculado corretamente', async () => {
    render(<App />)
    await waitFor(() => screen.getByText('Ranking de áreas (voluntários + doações)'))

    // Area X (a_1): 1 voluntário (v_1) + 2 doações (d_1, d_2) = Total 3
    // Area Y (a_2): 1 voluntário (v_2) + 0 doações = Total 1
    // A lista deve mostrar Area X primeiro.
    const rankingItems = screen.getAllByText(/voluntários/i)
    
    // Verifica o primeiro item (Area X)
    expect(rankingItems[0]).toHaveTextContent('1 voluntários • 2 doações')
    expect(screen.getByText('Area X').nextElementSibling).toHaveTextContent('3')

    // Verifica o segundo item (Area Y)
    expect(rankingItems[1]).toHaveTextContent('1 voluntários • 0 doações')
    expect(screen.getByText('Area Y').nextElementSibling).toHaveTextContent('1')
  })
  
  test('A função generateCSV exporta dados corretamente para voluntários', () => {
    // Simula a chamada da função generateCSV diretamente (veja comentário acima)
    generateCSVFromAppFile('volunteers', mockVolunteers, mockAreas, mockDonations)

    // Espera que o Blob seja chamado com o conteúdo CSV correto
    // Voluntários (ID, Nome, Telefone, Email, Skills, Área)
    const expectedCSV = `"id","name","phone","email","skills","area"
"v_1","Alice","","","","Area X"
"v_2","Bob","","","","Area Y"
"v_3","Charlie","","","",""`
    
    // Verifica se o mock do Blob foi chamado com o conteúdo CSV
    expect(global.Blob).toHaveBeenCalledWith([expectedCSV], { type: 'text/csv;charset=utf-8;' })
    // Verifica se o download foi acionado
    expect(mockAnchorClick).toHaveBeenCalled()
  })

  test('A função generatePDF chama jspdf e jspdf-autotable corretamente', async () => {
    render(<App />)
    await waitFor(() => screen.getByText('Exportar áreas')) // Aguarda carregamento
    
    // Simula clique para gerar PDF de Áreas
    fireEvent.click(screen.getByText('Exportar áreas'))
    
    const jsPDF = (await import('jspdf')).default
    const autoTable = (await import('jspdf-autotable')).default
    
    // Verifica se o jsPDF foi instanciado
    expect(jsPDF).toHaveBeenCalled()
    
    // Verifica se o autoTable foi chamado com os dados corretos de Áreas
    expect(autoTable).toHaveBeenCalledWith(expect.anything(), {
      head: [['ID', 'Nome', 'CEP', 'Cidade', 'Estado']],
      body: mockAreas.map(a => [a.id, a.name, a.cep, a.city, a.state]),
      startY: 20
    })
  })
})

// ----------------------------------------------------
// ## Teste de Integração: Componente e Fluxo de Usuário
// ----------------------------------------------------

describe('Teste de Integração: Fluxo de Cadastro e Interação de UI', () => {
  
  test('Permite cadastrar um voluntário e atualiza a lista', async () => {
    // 1. Configurar mocks para a chamada POST
    const newVolunteer = { id: 'v_new', name: 'Zoe', areaId: 'a_1' }
    mockFetch.mockImplementation((url: string, options?: any) => {
      if (url.includes('/volunteers') && options?.method === 'POST') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(newVolunteer) })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(url.includes('volunteers') ? mockVolunteers : url.includes('areas') ? mockAreas : mockDonations) })
    })

    const { getByText, getByLabelText, getByRole, getByPlaceholderText } = render(<App />)

    // 2. Navegar para a tela de Voluntários
    fireEvent.click(getByText('Cadastrar voluntários'))
    await waitFor(() => getByText('Novo voluntário'))

    // 3. Preencher o formulário
    fireEvent.change(getByLabelText('Nome'), { target: { value: 'Zoe' } })
    fireEvent.change(getByLabelText('Skills / Observações'), { target: { value: 'Desenvolvedora' } })
    
    // 4. Selecionar uma área (a_1)
    fireEvent.change(getByLabelText('Área atingida'), { target: { value: 'a_1' } })

    // 5. Clicar em Salvar
    fireEvent.click(getByText('Salvar'))

    // 6. Verificar se a chamada POST foi feita corretamente
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/volunteers'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Zoe', phone: '', email: '', skills: 'Desenvolvedora', areaId: 'a_1' }),
      })
    )

    // 7. Verificar se o novo voluntário aparece na lista
    await waitFor(() => {
      expect(getByText('Zoe')).toBeInTheDocument()
      expect(getByText(/Desenvolvedora/i)).toBeInTheDocument()
    })
  })

  test('Permite pesquisar áreas por CEP', async () => {
    const { getByText, getByRole, getByPlaceholderText } = render(<App />)

    // 1. Navegar para a tela de Áreas
    fireEvent.click(getByText('Cadastrar áreas / CEP'))
    await waitFor(() => getByText('Áreas encontradas'))
    
    // 2. Voltar para o Dashboard (para usar a caixa de busca de CEP global)
    fireEvent.click(getByText('Visão Geral'))

    // 3. Digitar um CEP na caixa de busca global (CEP: 12345-000 da Area X)
    const cepInput = getByPlaceholderText('Buscar por CEP')
    fireEvent.change(cepInput, { target: { value: '12345' } })

    // 4. Navegar novamente para a tela de Áreas para ver a lista filtrada
    fireEvent.click(getByText('Cadastrar áreas / CEP'))
    
    // 5. Verificar se apenas a Área X está visível
    expect(getByText('Area X • 12345-000')).toBeInTheDocument()
    expect(screen.queryByText('Area Y • 54321-000')).not.toBeInTheDocument()

    // 6. Limpar o filtro
    fireEvent.click(getByText('Visão Geral'))
    fireEvent.change(cepInput, { target: { value: '' } })
    fireEvent.click(getByText('Cadastrar áreas / CEP'))

    // 7. Verificar se todas as áreas estão visíveis novamente
    expect(getByText('Area X • 12345-000')).toBeInTheDocument()
    expect(getByText('Area Y • 54321-000')).toBeInTheDocument()
  })

  test('Permite deletar uma área', async () => {
    const { getByText, getAllByText, queryByText } = render(<App />)

    // 1. Navegar para a tela de Áreas
    fireEvent.click(getByText('Cadastrar áreas / CEP'))
    await waitFor(() => getByText('Áreas encontradas'))
    
    // 2. Simular o mock da deleção para Area X (a_1)
    mockFetch.mockImplementation((url: string, options?: any) => {
      if (url.includes('/areas/a_1') && options?.method === 'DELETE') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(url.includes('volunteers') ? mockVolunteers : url.includes('areas') ? mockAreas.filter(a => a.id !== 'a_1') : mockDonations) })
    })

    // 3. Clicar no botão Excluir da Area X
    const deleteButtons = getAllByText('Excluir')
    fireEvent.click(deleteButtons[0]) 

    // 4. Confirmação do diálogo (mockado para 'true')

    // 5. Verificar se a chamada DELETE foi feita
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/areas/a_1'),
      expect.objectContaining({ method: 'DELETE' })
    )

    // 6. Verificar se a Area X foi removida da lista
    await waitFor(() => {
      expect(queryByText('Area X • 12345-000')).not.toBeInTheDocument()
      expect(getByText('Area Y • 54321-000')).toBeInTheDocument()
    })
  })
})