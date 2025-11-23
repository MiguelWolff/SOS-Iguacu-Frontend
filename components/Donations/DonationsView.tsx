import React, { useState } from "react";
import { useData } from "../../context/DataContext";

export default function DonationsView() {
  const { areas, donations, addDonation } = useData();
  const [dDesc, setDDesc] = useState("");
  const [dQty, setDQty] = useState<number>(1);
  const [dArea, setDArea] = useState<string | "">("");

  const handleSave = () => {
    if (!dDesc.trim() || dQty <= 0) return alert("Informe a doação e quantidade");
    addDonation({ description: dDesc.trim(), quantity: dQty, areaId: dArea || null });
    setDDesc(""); setDQty(1); setDArea("");
  };

  return (
    <div style={{ display: "flex", gap: 16 }}>
      <div style={{ flex: "0 0 420px" }}>
        <div className="form">
          <h4>Registrar doação</h4>
          <div className="input"><label>Descrição</label><input value={dDesc} onChange={e => setDDesc(e.target.value)} /></div>
          <div className="input"><label>Quantidade</label><input type="number" value={dQty} onChange={e => setDQty(Number(e.target.value))} /></div>
          <div className="input"><label>Vincular a área (opcional)</label>
            <select value={dArea} onChange={e => setDArea(e.target.value)}>
              <option value=''>— Nenhuma —</option>
              {areas.map(a => <option key={a.id} value={a.id}>{a.name} • {a.cep}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ padding: 10, borderRadius: 8, border: 'none', background: '#2b6cb0', color: '#fff' }}>Salvar</button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div className="form">
          <h4>Doações registradas</h4>
          <div className="table">
            {donations.length === 0 && <div className="small">Nenhuma doação</div>}
            {donations.map(d => (
              <div key={d.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f3f6' }}>
                <strong>{d.description}</strong>
                <div className="small">Qtd: {d.quantity} • Área: {areas.find(a => a.id === d.areaId)?.name || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
