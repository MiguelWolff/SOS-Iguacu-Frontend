# SOS Iguaçu - Frontend

Dashboard de voluntariado para gerenciar voluntários, áreas afetadas e doações.

## 🏗️ Estrutura do Projeto

O projeto segue a organização padrão de projetos React modernos:

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes de UI básicos (Button, Card, Input, etc)
│   └── layout/         # Componentes de layout (Sidebar, Header)
├── pages/              # Páginas/Views principais
│   ├── Dashboard.tsx
│   ├── Volunteers.tsx
│   ├── Areas.tsx
│   ├── Donations.tsx
│   ├── Reports.tsx
│   └── Analytics.tsx
├── hooks/              # Custom hooks
│   ├── useVolunteers.ts
│   ├── useAreas.ts
│   ├── useDonations.ts
│   ├── useAnalytics.ts
│   └── useMap.ts
├── services/           # Serviços de API
│   └── api.ts
├── utils/              # Funções utilitárias
│   ├── uid.ts
│   ├── cep.ts
│   └── exports.ts
├── types/              # Definições de tipos TypeScript
│   └── index.ts
├── constants/          # Constantes e configurações
│   └── index.ts
├── App.tsx             # Componente principal
├── main.tsx            # Ponto de entrada
└── styles.css          # Estilos globais
```

## 📦 Tecnologias

- **React 18.2.0** + **TypeScript 5.1.6**
- **Vite 5.0.0** - Build tool
- **Vitest 4.0.13** - Framework de testes
- **Leaflet 1.9.4** - Mapas interativos
- **Recharts 3.4.1** - Gráficos e visualizações
- **jsPDF 3.0.4** + **jspdf-autotable 5.0.2** - Exportação PDF

## 🚀 Como rodar localmente

### 1. Instale as dependências

```bash
npm install
```

### 2. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

O app abrirá em `http://localhost:5173` (padrão Vite)

### 3. Build para produção

```bash
npm run build
```

### 4. Preview do build

```bash
npm run preview
```

## 🧪 Testes

### Rodar testes em modo watch (desenvolvimento)

```bash
npm test
```

Este comando roda os testes em modo watch, reexecutando automaticamente quando há mudanças nos arquivos.

### Rodar testes uma vez (CI/CD)

```bash
npm run test:run
```

### Rodar testes com interface gráfica

```bash
npm run test:ui
```

### Rodar testes com cobertura de código

```bash
npm run test:coverage
```

Este comando gera um relatório de cobertura em `coverage/` e verifica se os thresholds configurados (80% para branches, functions, lines e statements) foram atingidos.

### Comandos disponíveis

- `npm test` - Roda testes em modo watch
- `npm run test:run` - Roda testes uma vez e sai
- `npm run test:ui` - Abre interface gráfica do Vitest
- `npm run test:coverage` - Roda testes com relatório de cobertura

## 📋 Funcionalidades

### Dashboard
- KPIs (voluntários, áreas, doações)
- Mapa interativo com marcadores das áreas
- Gráficos de pizza e barras
- Ranking de áreas mais atingidas

### Cadastro de Voluntários
- Nome, telefone, email, skills
- Vinculação opcional a área afetada

### Cadastro de Áreas
- Consulta automática de CEP via ViaCEP
- Busca por CEP
- Exclusão de áreas

### Cadastro de Doações
- Descrição e quantidade
- Vinculação opcional a área

### Relatórios
- Exportação em PDF (voluntários, áreas, doações)
- Exportação em CSV (voluntários, áreas, doações)

### Analytics
- Gráficos comparativos
- Rankings detalhados
- Análises de distribuição

## 🔧 Configuração da API

O projeto está configurado para se conectar a uma API backend em:

```
http://127.0.0.1:8000/
```

Endpoints esperados:
- `GET /api/voluntario` - Lista voluntários
- `POST /api/voluntario` - Cria voluntário
- `GET /api/area-afetada` - Lista áreas
- `POST /api/area-afetada` - Cria área
- `DELETE /api/area-afetada/:id` - Exclui área
- `GET /api/doacao` - Lista doações
- `POST /api/doacao` - Cria doação

## 📝 Observações

- A consulta de CEP usa `https://viacep.com.br/ws/{CEP}/json/`. Para obter latitude/longitude automaticamente, integre uma API de geocoding (Mapbox, Google Geocoding).
- O mapa usa Leaflet; para mostrar marcadores, as áreas precisam ter `lat` e `lng` preenchidos.
- Este é um front-end; para salvar dados entre dispositivos é necessário um backend.

## 🎯 Próximos Passos

- [ ] Adicionar geocoding para obter coordenadas automaticamente
- [ ] Implementar autenticação/autorização
- [ ] Adicionar roteamento (React Router)
- [ ] Melhorar tratamento de erros com feedback visual
- [ ] Adicionar loading states
- [ ] Implementar PWA para uso offline
