import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import MapView from "../Map/MapView";
import type { Area } from "../../types/appTypes";
import { lookupCep } from "../../services/nominatim";

export default function AreasView() {
  const { areas, addArea } = useData();
  const [aName, setAName] = useState("");
  const [aCep, setACep] = useState("");
  const [aStatus, setAStatus] = useState("");
  const [tempCoords, setTempCoords] = useState<{ lat: number; lng: number } | null>(null);

  const handleMapClick = async (lat: number, lng: number) => {
    setTempCoords({ lat, lng });
    setAStatus("Consultando endereço (Nominatim)...");
    try {
      const res = await lookupCep({ lat, lon: lng }); // returns Nominatim json
      const addr = (res && res.address) ? res.address : null;
      setAStatus(
        addr
          ? `Endereço aprox: ${addr.road ?? addr.suburb ?? ""}, ${addr.city ?? addr.town ?? addr.village ?? ""} / ${addr.state ?? ""}`
          : "Endereço não identificado"
      );
    } catch (e) {
      setAStatus("Erro ao consultar Nominatim");
    }
  };

  const handleSave = async () => {
    if (!aName.trim() || !aCep.trim()) return alert("Preencha nome e CEP");
    setAStatus("Salvando área...");
    try {
      await addArea({ name: aName.trim(), cep: aCep.trim(), lat: tempCoords?.lat, lng: tempCoords?.lng });
      setAName("");
      setACep("");
      setTempCoords(null);
      setAStatus("");
    } catch (e) {
      console.error(e);
      setAStatus("Erro ao salvar");
    }
  };

  return (
    <div style={{ display: "flex", gap: 16 }}>
      <div style={{ flex: "0 0 420px" }}>
        <div style={{ marginBottom: 12 }}>
          <h4>Nova área atingida</h4>
          <div className="input"><label>Nome da área</label><input value={aName} onChange={e => setAName(e.target.value)} /></div>
          <div className="input"><label>CEP</label><input value={aCep} onChange={e => setACep(e.target.value)} placeholder="ex: 80010-000" /></div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={handleSave} style={{ padding: 10, borderRadius: 8, border: "none", background: "#2b6cb0", color: "#fff" }}>Salvar</button>
            <button onClick={() => { setAName(""); setACep(""); setTempCoords(null); setAStatus(""); }} style={{ padding: 10, borderRadius: 8 }}>Limpar</button>
          </div>
          {aStatus && <div className="small" style={{ marginTop: 8 }}>{aStatus}</div>}
          <div style={{ marginTop: 12 }}>
            <h4>Áreas encontradas</h4>
            <div className="table">
              {areas.length === 0 && <div className="small">Nenhuma área localizada</div>}
              {areas.map(a => (
                <div key={a.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f3f6' }}>
                  <strong>{a.name} • {a.cep}</strong>
                  <div className="small">{a.city || '—'} • {a.state || '—'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ height: 480 }}>
          <MapView areas={areas as Area[]} onMapClick={handleMapClick} height="100%" center={[-25.5163, -54.5854]} zoom={5} />
        </div>
        <div style={{ marginTop: 8 }}>
          {tempCoords ? (
            <div className="small">Coordenadas selecionadas: {tempCoords.lat.toFixed(6)} , {tempCoords.lng.toFixed(6)}</div>
          ) : (
            <div className="small">Clique no mapa para selecionar a coordenada aproximada.</div>
          )}
        </div>
      </div>
    </div>
  );
}
