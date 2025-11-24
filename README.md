# Volunteer Dashboard (Vite + React + TypeScript)

Projeto demo para gerenciar voluntários, áreas afetadas e doações.

## Funcionalidades
- Cadastrar voluntários, áreas (consulta ViaCEP) e doações
- Dashboard com contadores e mapa (Leaflet)
- Busca por CEP das áreas
- Exportar CSV (voluntários, áreas, doações)
- Persistência local via localStorage

## Como rodar localmente

1. Instale dependências
```bash
npm install
# ou
# yarn
```

2. Rodar modo de desenvolvimento
```bash
npm run dev
```

3. O app abrirá em `http://localhost:5173` (padrão Vite)

## Observações e próximos passos
- A consulta de CEP usa `https://viacep.com.br/ws/{CEP}/json/`. Para obter latitude/longitude automaticamente, integre uma API de geocoding (Mapbox, Google Geocoding) — atualmente o projeto só salva cidade/UF vindos do ViaCEP.
- O mapa usa Leaflet; para mostrar marcadores com lat/lng, suba áreas com `lat` e `lng` preenchidos (p. ex. via geocoding).
- Este é um front-end demo; para salvar dados entre dispositivos é necessário adicionar um backend (Node/Express, Firebase, etc).

