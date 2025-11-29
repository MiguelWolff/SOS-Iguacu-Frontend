import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_CENTER, MAP_ZOOM } from '../constants';
import type { Area } from '../types';

export const useMap = (areas: Area[]) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current).setView(MAP_CENTER, MAP_ZOOM);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapRef.current);
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Remove marcadores existentes
    mapRef.current.eachLayer((layer) => {
      if ((layer as any)._icon) {
        mapRef.current!.removeLayer(layer);
      }
    });

    // Adiciona novos marcadores
    areas.forEach(area => {
      if (area.lat && area.lng) {
        const marker = L.marker([area.lat, area.lng]).addTo(mapRef.current!);
        marker.bindPopup(
          `<strong>${area.name}</strong><br/>${area.cep} ${area.city || ''} ${area.state || ''}`
        );
      }
    });
  }, [areas]);

  return { mapContainerRef };
};

