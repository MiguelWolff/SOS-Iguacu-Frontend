import React, { useEffect, useState, useRef, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// IMPORTS PARA PDF
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// IMPORTS PARA GRÁFICOS
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'

type Volunteer = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  skills?: string;
  areaId?: string | null;
};

type Area = {
  id: string;
  name: string;
  cep: string;
  city?: string;
  state?: string;
  lat?: number;
  lng?: number;
};

type Donation = {
  id: string;
  description: string;
  quantity: number;
  areaId?: string | null;
};

const uid = (p = 'id') => p + '_' + Math.random().toString(36).slice(2, 9)

export default function App(): JSX.Element {
  const [view, setView] = useState<'dashboard' | 'volunteers' | 'areas' | 'donations' | 'reports' | 'analytics'>('dashboard')

  const [volunteers, setVolunteers] = useState<Volunteer[]>(() => {
    try { return JSON.parse(localStorage.getItem('vols') || '[]') } catch { return [] }
  })
  const [areas, setAreas] = useState<Area[]>(() => {
    try { return JSON.parse(localStorage.getItem('areas') || '[]') } catch { return [] }
  })
  const [donations, setDonations] = useState<Donation[]>(() => {
    try { return JSON.parse(localStorage.getItem('dons') || '[]') } catch { return [] }
  })

  useEffect(() => { localStorage.setItem('vols', JSON.stringify(volunteers)) }, [volunteers])
  useEffect(() => { localStorage.setItem('areas', JSON.stringify(areas)) }, [areas])
  useEffect(() => { localStorage.setItem('dons', JSON.stringify(donations)) }, [donations])

  // volunteer form state
  const [vName, setVName] = useState('')
  const [vPhone, setVPhone] = useState('')
  const [vEmail, setVEmail] = useState('')
  const [vSkills, setVSkills] = useState('')
  const [vArea, setVArea] = useState<string | ''>('')
  // area form state
  const [aName, setAName] = useState('')
  const [aCep, setACep] = useState('')
  const [aStatus, setAStatus] = useState('')
  // donation form state
  const [dDesc, setDDesc] = useState('')
  const [dQty, setDQty] = useState<number>(1)
  const [dArea, setDArea] = useState<string | ''>('')
  // cep search
  const [cepSearch, setCepSearch] = useState('')

  const addVolunteer = () => {
    if (!vName.trim()) return alert('Informe o nome do voluntário')
    const newV: Volunteer = {
      id: uid('v'),
      name: vName.trim(),
      phone: vPhone.trim(),
      email: vEmail.trim(),
      skills: vSkills.trim(),
      areaId: vArea || null
    }
    setVolunteers(prev => [newV, ...prev])
    setVName(''); setVPhone(''); setVEmail(''); setVSkills(''); setVArea('')
  }

  const lookupCep = async (cepRaw: string) => {
    const cep = cepRaw.replace(/[^0-9]/g, '')
    if (!cep) return null
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const json = await res.json()
      if (json.erro) return null
      return json
    } catch {
      return null
    }
  }

  const addArea = async () => {
    if (!aName.trim() || !aCep.trim()) return alert('Preencha nome e CEP')
    setAStatus('Consultando CEP...')
    const data: any = await lookupCep(aCep)
    const newA: Area = {
      id: uid('a'),
      name: aName.trim(),
      cep: aCep.trim(),
      city: data?.localidade,
      state: data?.uf,
      lat: undefined,
      lng: undefined
    }
    setAreas(prev => [newA, ...prev])
    setAName(''); setACep(''); setAStatus('')
  }

  const deleteArea = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta área?')) return
    
    // 1. Remover a área
    setAreas(prev => prev.filter(a => a.id !== id))
    
    // 2. Remover vínculos em voluntários e doações
    setVolunteers(prev =>
      prev.map(v => (v.areaId === id ? { ...v, areaId: null } : v))
    )

    setDonations(prev =>
      prev.map(d => (d.areaId === id ? { ...d, areaId: null } : d))
    )
  }


  const addDonation = () => {
    if (!dDesc.trim() || dQty <= 0) return alert('Informe a doação e quantidade')
    const newD: Donation = {
      id: uid('d'),
      description: dDesc.trim(),
      quantity: dQty,
      areaId: dArea || null
    }
    setDonations(prev => [newD, ...prev])
    setDDesc(''); setDQty(1); setDArea('')
  }

  const filteredAreas = cepSearch.trim()
    ? areas.filter(a => a.cep.replace(/[^0-9]/g, '').includes(cepSearch.replace(/[^0-9]/g, '')))
    : areas

  // -------------------------------
  // 📌 FUNÇÃO PARA GERAR PDF
  // -------------------------------
  const generatePDF = (type: 'volunteers' | 'areas' | 'donations') => {
    const doc = new jsPDF()

    let title = ''
    let head: string[][] = []
    let body: any[][] = []

    if (type === 'volunteers') {
      title = 'Relatório de Voluntários'
      head = [['ID', 'Nome', 'Telefone', 'Email', 'Skills', 'Área']]
      body = volunteers.map(v => [
        v.id,
        v.name,
        v.phone || '',
        v.email || '',
        v.skills || '',
        areas.find(a => a.id === v.areaId)?.name || '—'
      ])
    }

    if (type === 'areas') {
      title = 'Relatório de Áreas'
      head = [['ID', 'Nome', 'CEP', 'Cidade', 'Estado']]
      body = areas.map(a => [
        a.id,
        a.name,
        a.cep,
        a.city || '',
        a.state || ''
      ])
    }

    if (type === 'donations') {
      title = 'Relatório de Doações'
      head = [['ID', 'Descrição', 'Quantidade', 'Área']]
      body = donations.map(d => [
        d.id,
        d.description,
        d.quantity,
        areas.find(a => a.id === d.areaId)?.name || '—'
      ])
    }

    doc.setFontSize(14)
    doc.text(title, 14, 16)

    autoTable(doc, {
      head,
      body,
      startY: 20
    })

    doc.save(`${type}_${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  // -------------------------------
  //  DADOS PARA GRÁFICOS E KPIs
  // -------------------------------

  // cores
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA46BE', '#FF6666', '#6C5CE7']

  // pieData: voluntários por área (remove áreas com zero)
  const pieData = useMemo(() => {
    return areas
      .map(area => ({
        name: area.name,
        value: volunteers.filter(v => v.areaId === area.id).length
      }))
      .filter(a => a.value > 0)
  }, [areas, volunteers])

  // barData: doações por área (para gráfico de barras)
  const barData = useMemo(() => {
    return areas.map(area => ({
      name: area.name,
      donationsCount: donations.filter(d => d.areaId === area.id).length,
      volunteersCount: volunteers.filter(v => v.areaId === area.id).length
    }))
  }, [areas, donations, volunteers])

  // ranking de áreas mais registradas (por número de voluntários + doações)
  const areaRanking = useMemo(() => {
    return areas
      .map(area => {
        const vols = volunteers.filter(v => v.areaId === area.id).length
        const dons = donations.filter(d => d.areaId === area.id).length
        return { id: area.id, name: area.name, vols, dons, total: vols + dons }
      })
      .sort((a, b) => b.total - a.total)
  }, [areas, volunteers, donations])

  // KPIs (porcentagens)
  const kpiPercentVolWithArea = useMemo(() => {
    if (volunteers.length === 0) return 0
    const withArea = volunteers.filter(v => v.areaId).length
    return Math.round((withArea / volunteers.length) * 100)
  }, [volunteers])

  const kpiPercentAreasWithDon = useMemo(() => {
    if (areas.length === 0) return 0
    const withDon = areas.filter(a => donations.some(d => d.areaId === a.id)).length
    return Math.round((withDon / areas.length) * 100)
  }, [areas, donations])

  const kpiPercentDonationsLinked = useMemo(() => {
    if (donations.length === 0) return 0
    const linked = donations.filter(d => d.areaId).length
    return Math.round((linked / donations.length) * 100)
  }, [donations])

  // -------------------------------
  //  MAPA (LEAFLET)
  // -------------------------------
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!mapContainerRef.current) return
    if (mapRef.current) return
    mapRef.current = L.map(mapContainerRef.current).setView([-25.4883, -52.5294], 14)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapRef.current)
  }, [mapContainerRef.current])

  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.eachLayer((layer) => {
      if ((layer as any)._icon) mapRef.current!.removeLayer(layer)
    })
    areas.forEach(a => {
      if (a.lat && a.lng) {
        const marker = L.marker([a.lat, a.lng]).addTo(mapRef.current!)
        marker.bindPopup(`<strong>${a.name}</strong><br/>${a.cep} ${a.city || ''} ${a.state || ''}`)
      }
    })
  }, [areas])

  // -------------------------------
  //  ESTILOS SIMPLES (clean, leve)
  // -------------------------------
  const styles: Record<string, React.CSSProperties> = {
    container: { display: 'flex', minHeight: '100vh', background: '#f6f8fb', color: '#1f2937' },
    sidebar: { width: 220, padding: 20, borderRight: '1px solid #e6edf3', background: '#fff' },
    logo: { fontSize: 18, fontWeight: 700, marginBottom: 6 },
    menuBtn: { display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', marginBottom: 6 },
    menuBtnActive: { background: '#eef2ff' },
    content: { flex: 1, padding: 20 },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    cardRow: { display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' },
    card: { background: '#fff', padding: 14, borderRadius: 10, boxShadow: '0 6px 18px rgba(15,23,42,0.06)', minWidth: 220 },
    small: { color: '#6b7280', fontSize: 13 },
    kpiCard: { flex: 1, minWidth: 160, textAlign: 'center' },
    mapCard: { flex: 1, minWidth: 360, height: 280 },
    chartsColumn: { width: 380, display: 'flex', flexDirection: 'column', gap: 16 },
    chartCard: { background: '#fff', padding: 12, borderRadius: 10, boxShadow: '0 6px 18px rgba(15,23,42,0.04)' },
    btn: { padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer' },
    btnBlue: { background: '#2b6cb0', color: '#fff' },
    btnDark: { background: '#333', color: '#fff' },
    btnOrange: { background: '#ff9900', color: '#fff' }
  }

  return (
    <div style={styles.container} className='app'>
      <aside style={styles.sidebar} className='sidebar'>
        <div style={styles.logo}>🌀 SOS Iguaçu</div>
        <div style={{ ...styles.small, marginBottom: 12 }}>Painel de Voluntariado</div>

        <nav>
          <button style={{ ...styles.menuBtn, ...(view === 'dashboard' ? styles.menuBtnActive : {}) }} onClick={() => setView('dashboard')}>Visão Geral</button>
          <button style={{ ...styles.menuBtn, ...(view === 'volunteers' ? styles.menuBtnActive : {}) }} onClick={() => setView('volunteers')}>Cadastrar voluntários</button>
          <button style={{ ...styles.menuBtn, ...(view === 'areas' ? styles.menuBtnActive : {}) }} onClick={() => setView('areas')}>Cadastrar áreas / CEP</button>
          <button style={{ ...styles.menuBtn, ...(view === 'donations' ? styles.menuBtnActive : {}) }} onClick={() => setView('donations')}>Cadastro de doações</button>
          <button style={{ ...styles.menuBtn, ...(view === 'reports' ? styles.menuBtnActive : {}) }} onClick={() => setView('reports')}>Relatórios</button>
          <button style={{ ...styles.menuBtn, ...(view === 'analytics' ? styles.menuBtnActive : {}) }} onClick={() => setView('analytics')}>Análise</button>
        </nav>

        <div style={{ marginTop: 'auto', fontSize: 12, color: '#9ca3af' }}>Salvo localmente no navegador • versão demo</div>
      </aside>

      <main style={styles.content} className='content'>
        <div style={styles.headerRow} className='header'>
          <h2 style={{ margin: 0 }}>
            {view === 'dashboard' ? 'Dashboard' : view === 'volunteers' ? 'Voluntários' : view === 'areas' ? 'Áreas Atingidas' : view === 'donations' ? 'Doações' : view === 'reports' ? 'Relatórios' : 'Analytics'}
          </h2>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input placeholder='Buscar por CEP' value={cepSearch} onChange={e => setCepSearch(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #e6edf3' }} />
            <button onClick={() => generatePDF('volunteers')} style={{ ...styles.btn, ...styles.btnBlue }}>Export Volunteers (PDF)</button>
          </div>
        </div>

        {/* ---------------- DASHBOARD ---------------- */}
        {view === 'dashboard' && (
          <>
            {/* KPI CARDS */}
            <div style={styles.cardRow} className='card-row'>
              <div style={{ ...styles.card, ...styles.kpiCard }}>
                <div style={styles.small}>Voluntários cadastrados</div>
                <h3 style={{ margin: '6px 0' }}>{volunteers.length}</h3>
                <div style={styles.small}>% com área vinculada</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{kpiPercentVolWithArea}%</div>
              </div>

              <div style={{ ...styles.card, ...styles.kpiCard }}>
                <div style={styles.small}>Áreas registradas</div>
                <h3 style={{ margin: '6px 0' }}>{areas.length}</h3>
                <div style={styles.small}>% áreas com doações</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{kpiPercentAreasWithDon}%</div>
              </div>

              <div style={{ ...styles.card, ...styles.kpiCard }}>
                <div style={styles.small}>Doações registradas</div>
                <h3 style={{ margin: '6px 0' }}>{donations.length}</h3>
                <div style={styles.small}>% doações vinculadas</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{kpiPercentDonationsLinked}%</div>
              </div>
            </div>

            {/* MAP + CHARTS SIDE-BY-SIDE */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
              {/* Mapa */}
              <div style={{ ...styles.card, ...styles.mapCard }}>
                <div className='small'>Mapa (marcadores das áreas)</div>
                <div className='map' ref={mapContainerRef as any} style={{ height: '220px', marginTop: 8 }} />
              </div>

              {/* Columna de charts ao lado do mapa */}
              <div style={styles.chartsColumn}>
                <div style={styles.chartCard}>
                  <h4 style={{ marginTop: 0 }}>Áreas mais atingidas (Voluntários)</h4>
                  {pieData.length === 0 ? <div style={styles.small}>Nenhum dado</div> : (
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={30} outerRadius={60} label={(entry) => `${entry.name} (${entry.value})`}>
                          {pieData.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div style={styles.chartCard}>
                  <h4 style={{ marginTop: 0 }}>Doações por área (ranking)</h4>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={barData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={120} />
                      <Tooltip />
                      <Bar dataKey="donationsCount" fill={COLORS[1]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* RANKING DE ÁREAS (lista) */}
            <div style={styles.card}>
              <h4 style={{ marginTop: 0 }}>Ranking de áreas (voluntários + doações)</h4>
              {areaRanking.length === 0 && <div style={styles.small}>Nenhuma área registrada</div>}
              {areaRanking.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <strong>{a.name}</strong>
                    <div style={styles.small}>{a.vols} voluntários • {a.dons} doações</div>
                  </div>
                  <div style={{ fontWeight: 700 }}>{a.total}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ------------- VOLUNTEERS / AREAS / DONATIONS / REPORTS (sem mudanças) ------------- */}
        {view === 'volunteers' && (
          <div className='forms'>
            <div className='form'>
              <h4>Novo voluntário</h4>
              <div className='input'><label>Nome</label><input value={vName} onChange={e => setVName(e.target.value)} /></div>
              <div className='input'><label>Telefone</label><input value={vPhone} onChange={e => setVPhone(e.target.value)} /></div>
              <div className='input'><label>E-mail</label><input value={vEmail} onChange={e => setVEmail(e.target.value)} /></div>
              <div className='input'><label>Skills / Observações</label><textarea value={vSkills} onChange={e => setVSkills(e.target.value)} /></div>
              <div className='input'><label>Área atingida</label>
                <select value={vArea} onChange={e => setVArea(e.target.value)}>
                  <option value=''>— Nenhuma —</option>
                  {areas.map(a => <option key={a.id} value={a.id}>{a.name} • {a.cep}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={addVolunteer} style={{ padding: 10, borderRadius: 8, border: 'none', background: '#2b6cb0', color: '#fff' }}>Salvar</button>
                <button onClick={() => { setVName(''); setVPhone(''); setVEmail(''); setVSkills(''); }} style={{ padding: 10, borderRadius: 8 }}>Limpar</button>
              </div>
            </div>

            <div className='form'>
              <h4>Lista de voluntários</h4>
              <div className='table'>
                {volunteers.length === 0 && <div className='small'>Nenhum voluntário</div>}
                {volunteers.map(v => (
                  <div key={v.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f3f6' }}>
                    <strong>{v.name}</strong>
                    <div className='small'>{v.skills} • {v.phone} • {v.email} • Área: {areas.find(a => a.id === v.areaId)?.name || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'areas' && (
          <div className='forms'>
            <div className='form'>
              <h4>Nova área atingida</h4>
              <div className='input'><label>Nome da área</label><input value={aName} onChange={e => setAName(e.target.value)} /></div>
              <div className='input'><label>CEP</label><input value={aCep} onChange={e => setACep(e.target.value)} placeholder='ex: 85340-000' /></div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={addArea} style={{ padding: 10, borderRadius: 8, border: 'none', background: '#2b6cb0', color: '#fff' }}>Salvar</button>
                <button onClick={() => { setAName(''); setACep(''); }} style={{ padding: 10, borderRadius: 8 }}>Limpar</button>
              </div>
              {aStatus && <div className='small' style={{ marginTop: 8 }}>{aStatus}</div>}
            </div>

            <div className='form'>
              <h4>Áreas encontradas</h4>
              <div className='table'>
                {filteredAreas.length === 0 && <div className='small'>Nenhuma área localizada</div>}
                {filteredAreas.map(a => (
                  <div key={a.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f3f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{a.name} • {a.cep}</strong>
                      <div className='small'>{a.city || '—'} • {a.state || '—'}</div>
                    </div>
                                
                    <button
                      onClick={() => deleteArea(a.id)}
                      style={{
                        padding: '6px 10px',
                        background: '#e63946',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer'
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'donations' && (
          <div className='forms'>
            <div className='form'>
              <h4>Registrar doação</h4>
              <div className='input'><label>Descrição</label><input value={dDesc} onChange={e => setDDesc(e.target.value)} /></div>
              <div className='input'><label>Quantidade</label><input type='number' value={dQty} onChange={e => setDQty(Number(e.target.value))} /></div>
              <div className='input'><label>Vincular a área (opcional)</label>
                <select value={dArea} onChange={e => setDArea(e.target.value)}>
                  <option value=''>— Nenhuma —</option>
                  {areas.map(a => <option key={a.id} value={a.id}>{a.name} • {a.cep}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={addDonation} style={{ padding: 10, borderRadius: 8, border: 'none', background: '#2b6cb0', color: '#fff' }}>Salvar</button>
              </div>
            </div>

            <div className='form'>
              <h4>Doações registradas</h4>
              <div className='table'>
                {donations.length === 0 && <div className='small'>Nenhuma doação</div>}
                {donations.map(d => (
                  <div key={d.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f3f6' }}>
                    <strong>{d.description}</strong>
                    <div className='small'>Qtd: {d.quantity} • Área: {areas.find(a => a.id === d.areaId)?.name || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------- REPORTS / ANALYTICS ------------- */}
        {view === 'reports' && (
          <div>
            <div className='card-row' style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>

              <div style={styles.card}>
                <h4>Relatórios em PDF</h4>
                <div className='small'>Gere PDFs com os registros para importação/compartilhamento</div>

                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => generatePDF('volunteers')}
                    style={{ padding: 10, borderRadius: 8, border: 'none', background: '#2b6cb0', color: '#fff' }}
                  >
                    Exportar voluntários
                  </button>

                  <button
                    onClick={() => generatePDF('areas')}
                    style={{ padding: 10, borderRadius: 8, border: 'none', background: '#333', color: '#fff' }}
                  >
                    Exportar áreas
                  </button>

                  <button
                    onClick={() => generatePDF('donations')}
                    style={{ padding: 10, borderRadius: 8, border: 'none', background: '#ff9900', color: '#fff' }}
                  >
                    Exportar doações
                  </button>
                </div>
              </div>

              <div style={styles.card}>
                <h4>Relatórios em CSV</h4>
                <div className='small'>Gere CSVs com os registros para importação</div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <button onClick={() => generateCSV('volunteers')} style={{ padding: 10, borderRadius: 8, border: 'none', background: '#2b6cb0', color: '#fff' }}>Exportar voluntários</button>
                  <button onClick={() => generateCSV('areas')} style={{ padding: 10, borderRadius: 8, border: 'none', background: '#333', color: '#fff' }}>Exportar áreas</button>
                  <button onClick={() => generateCSV('donations')} style={{ padding: 10, borderRadius: 8, border: 'none', background: '#ff9900', color: '#fff' }}>Exportar doações</button>
                </div>
              </div>

            </div>
          </div>
        )}

        {view === 'analytics' && (
          <div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ ...styles.card, minWidth: 300 }}>
                <h4 style={{ marginTop: 0 }}>Voluntários por área (Pizza)</h4>
                {pieData.length === 0 ? <div style={styles.small}>Nenhum dado</div> : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80} label>
                        {pieData.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div style={{ ...styles.card, minWidth: 420 }}>
                <h4 style={{ marginTop: 0 }}>Comparativo: Voluntários x Doações por área</h4>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="volunteersCount" name="Voluntários" fill={COLORS[0]} />
                    <Bar dataKey="donationsCount" name="Doações" fill={COLORS[2]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={styles.card}>
              <h4 style={{ marginTop: 0 }}>Top áreas (ranking)</h4>
              {areaRanking.length === 0 && <div style={styles.small}>Nenhuma área registrada</div>}
              {areaRanking.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <strong>{a.name}</strong>
                    <div style={styles.small}>{a.vols} voluntários • {a.dons} doações</div>
                  </div>
                  <div style={{ fontWeight: 700 }}>{a.total}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

/* -------------------------
   Função CSV
   ------------------------- */
function generateCSV(type: 'volunteers' | 'areas' | 'donations') {
  const vols = JSON.parse(localStorage.getItem('vols') || '[]')
  const areas = JSON.parse(localStorage.getItem('areas') || '[]')
  const dons = JSON.parse(localStorage.getItem('dons') || '[]')

  let rows: string[][] = []
  if (type === 'volunteers') {
    rows = [['id', 'name', 'phone', 'email', 'skills', 'area'], ...vols.map((v: any) => [v.id, v.name, v.phone || '', v.email || '', v.skills || '', areas.find((a: any) => a.id === v.areaId)?.name || ''])]
  } else if (type === 'areas') {
    rows = [['id', 'name', 'cep', 'city', 'state'], ...areas.map((a: any) => [a.id, a.name, a.cep, a.city || '', a.state || ''])]
  } else {
    rows = [['id', 'description', 'quantity', 'area'], ...dons.map((d: any) => [d.id, d.description, String(d.quantity), areas.find((a: any) => a.id === d.areaId)?.name || ''])]
  }
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `${type}_${new Date().toISOString().slice(0, 10)}.csv`; a.click()
  URL.revokeObjectURL(url)
}
