import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Ícone padrão do Leaflet (obrigatório no Vite)
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Componente responsável por capturar cliques e criar marcador
function LocationMarker({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onSelect(lat, lng);
    },
  });

  return position ? <Marker position={position} icon={markerIcon} /> : null;
}

export default function MapView() {
  const [address, setAddress] = useState<string>("Clique no mapa para localizar");

  const handleCoords = async (lat: number, lng: number) => {
    console.log("Coordenadas:", lat, lng);

    // 🔥 Requisição à API Nominatim
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "sos-iguacu-frontend",
        },
      });

      const data = await response.json();

      if (data && data.address) {
        const addr = data.address;

        const formatted = `
          ${addr.road ?? ""}, 
          ${addr.suburb ?? ""}, 
          ${addr.city ?? addr.town ?? addr.village ?? ""} - ${addr.state ?? ""}, 
          ${addr.country ?? ""}
        `.replace(/\s+/g, " ");

        setAddress(formatted.trim());
      } else {
        setAddress("Endereço não encontrado");
      }
    } catch (err) {
      console.error(err);
      setAddress("Erro ao consultar Nominatim");
    }
  };

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {/* Mapa */}
      <MapContainer
        center={[-25.5163, -54.5854]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <LocationMarker onSelect={handleCoords} />
      </MapContainer>

      {/* Caixa com o endereço */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          background: "#fff",
          padding: "12px 16px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          maxWidth: "300px",
          fontSize: "14px",
          fontFamily: "Arial",
        }}
      >
        <strong>Endereço:</strong>
        <br />
        {address}
      </div>
    </div>
  );
}
