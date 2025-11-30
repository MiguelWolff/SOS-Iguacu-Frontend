import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_CENTER, MAP_ZOOM } from '../constants';
import type { Area } from '../types';

export const useMap = (areas: Area[]) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  // Inicializa mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current).setView(MAP_CENTER, MAP_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapRef.current);
  }, []);

  // Atualiza marcadores
  useEffect(() => {
    if (!mapRef.current) return;

    // Remover apenas marcadores existentes
    mapRef.current.eachLayer(layer => {
      if (layer instanceof L.Marker) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Criar novos
    areas.forEach(area => {
      if (typeof area.lat === 'number' && typeof area.lng === 'number') {
        const marker = L.marker([area.lat, area.lng]).addTo(mapRef.current!);
        marker.bindPopup(
          `
            <strong>${area.nome_identificacao}</strong><br/>
            CEP: ${area.cep}<br/>
            ${area.cidade || ''} - ${area.estado || ''}
          `
        );
      }
    });

  }, [areas]);

  return { mapContainerRef };
};
