import React, { useState } from "react";
import { useData } from "../../context/DataContext";

export default function VolunteersView() {
  const { areas, volunteers, addVolunteer } = useData();
  const [vName, setVName] = useState("");
  const [vPhone, setVPhone] = useState("");
  const [vEmail, setVEmail] = useState("");
  const [vSkills, setVSkills] = useState("");
  const [vArea, setVArea] = useState<string | "">("");

  const handleSave = () => {
    if (!vName.trim()) return alert("Informe o nome do voluntário");
    addVolunteer({ name: vName.trim(), phone: vPhone.trim(), email: vEmail.trim(), skills: vSkills.trim(), areaId: vArea || null });
    setVName(""); setVPhone(""); setVEmail(""); setVSkills(""); setVArea("");
  };

  return (
    <div style={{ display: "flex", gap: 16 }}>
      <div style={{ flex: "0 0 420px" }}>
        <div className="form">
          <h4>Novo voluntário</h4>
          <div className="input"><label>Nome</label><input value={vName} onChange={e => setVName(e.target.value)} /></div>
          <div className="input"><label>Telefone</label><input value={vPhone} onChange={e => setVPhone(e.target.value)} /></div>
          <div className="input"><label>E-mail</label><input value={vEmail} onChange={e => setVEmail(e.target.value)} /></div>
          <div className="input"><label>Skills / Observações</label><textarea value={vSkills} onChange={e => setVSkills(e.target.value)} /></div>
          <div className="input"><label>Vincular a área</label>
            <select value={vArea} onChange={e => setVArea(e.target.value)}>
              <option value=''>— Nenhuma —</option>
              {areas.map(a => <option key={a.id} value={a.id}>{a.name} • {a.cep}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ padding: 10, borderRadius: 8, border: 'none', background: '#2b6cb0', color: '#fff' }}>Salvar</button>
            <button onClick={() => { setVName(''); setVPhone(''); setVEmail(''); setVSkills(''); }} style={{ padding: 10, borderRadius: 8 }}>Limpar</button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div className="form">
          <h4>Lista de voluntários</h4>
          <div className="table">
            {volunteers.length === 0 && <div className="small">Nenhum voluntário</div>}
            {volunteers.map(v => (
              <div key={v.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f3f6' }}>
                <strong>{v.name}</strong>
                <div className="small">{v.skills} • {v.phone} • {v.email} • Área: {areas.find(a => a.id === v.areaId)?.name || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
