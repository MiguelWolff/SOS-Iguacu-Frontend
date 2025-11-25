// vitest.setup.ts
import '@testing-library/jest-dom'
// Adicione mocks globais aqui, se necessário.
// Por exemplo, mockando o Leaflet:
global.L = {
  map: () => ({
    setView: () => {},
    eachLayer: (callback: any) => {
      // Simula remover camadas, para evitar erros no teste de mapa
      const mockLayer = { _icon: true };
      callback(mockLayer);
    },
    removeLayer: () => {},
    addTo: () => {},
  }),
  tileLayer: () => ({
    addTo: () => {},
  }),
  marker: () => ({
    addTo: () => ({
      bindPopup: () => {}
    }),
  }),
} as any;

// Mock localStorage para testes
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = String(value);
    },
    clear() {
      store = {};
    },
    removeItem(key: string) {
      delete store[key];
    }
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});