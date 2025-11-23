import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Area } from "../../types/appTypes";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Props = {
  areas: Area[];
  onMapClick?: (lat: number, lng: number) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
};

function ClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapView({ areas, onMapClick, height = "100%", center = [-25.4860, -52.93], zoom = 13 }: Props) {
  return (
    <div style={{ height, width: "100%" }}>
      <MapContainer center={center as any} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <ClickHandler onMapClick={onMapClick} />
        {areas.map((a) => a.lat && a.lng ? (
          <Marker key={a.id} position={[a.lat!, a.lng!]} icon={markerIcon}>
            <Popup>
              <strong>{a.name}</strong>
              <div>{a.cep} {a.city || ""} {a.state || ""}</div>
            </Popup>
          </Marker>
        ) : null)}
      </MapContainer>
    </div>
  );
}
