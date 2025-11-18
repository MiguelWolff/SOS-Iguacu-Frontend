import React, { useEffect, useState, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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

const uid = (p='id') => p + '_' + Math.random().toString(36).slice(2,9)

export default function App(): JSX.Element {
  const [view, setView] = useState<'dashboard'|'volunteers'|'areas'|'donations'|'reports'>('dashboard')

  const [volunteers, setVolunteers] = useState<Volunteer[]>(() => {
    try { return JSON.parse(localStorage.getItem('vols')||'[]') } catch { return [] }
  })
  const [areas, setAreas] = useState<Area[]>(() => {
    try { return JSON.parse(localStorage.getItem('areas')||'[]') } catch { return [] }
  })
  const [donations, setDonations] = useState<Donation[]>(() => {
    try { return JSON.parse(localStorage.getItem('dons')||'[]') } catch { return [] }
  })

  useEffect(()=>{ localStorage.setItem('vols', JSON.stringify(volunteers)) }, [volunteers])
  useEffect(()=>{ localStorage.setItem('areas', JSON.stringify(areas)) }, [areas])
  useEffect(()=>{ localStorage.setItem('dons', JSON.stringify(donations)) }, [donations])

  // volunteer form state
  const [vName, setVName] = useState('')
  const [vPhone, setVPhone] = useState('')
  const [vEmail, setVEmail] = useState('')
  const [vSkills, setVSkills] = useState('')
  const [vArea, setVArea] = useState<string|''>('')
  // area form state
  const [aName, setAName] = useState('')
  const [aCep, setACep] = useState('')
  const [aStatus, setAStatus] = useState('')
  // donation form state
  const [dDesc, setDDesc] = useState('')
  const [dQty, setDQty] = useState<number>(1)
  const [dArea, setDArea] = useState<string|''>('')
  // cep search
  const [cepSearch, setCepSearch] = useState('')

  const addVolunteer = () => {
    if (!vName.trim()) return alert('Informe o nome do voluntário')
    const newV: Volunteer = { id: uid('v'), name: vName.trim(), phone: vPhone.trim(), email: vEmail.trim(), skills: vSkills.trim(), areaId: vArea||null }
    setVolunteers(prev => [newV, ...prev])
    setVName(''); setVPhone(''); setVEmail(''); setVSkills(''); setVArea('')
  }

  // Use ViaCEP to lookup CEP data. If viaCEP fails, keep only CEP string.
  const lookupCep = async (cepRaw: string) => {
    const cep = cepRaw.replace(/[^0-9]/g,'')
    if (!cep) return null
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const json = await res.json()
      if (json.erro) return null
      return json
    } catch (e) {
      console.error('viaCEP failed', e)
      return null
    }
  }

  const addArea = async () => {
    if (!aName.trim() || !aCep.trim()) return alert('Preencha nome e CEP')
    setAStatus('Consultando CEP...')
    const data: any = await lookupCep(aCep)
    const newA: Area = { id: uid('a'), name: aName.trim(), cep: aCep.trim(), city: data?.localidade, state: data?.uf, lat: undefined, lng: undefined }
    // If lookup returns location, we keep city/state. For lat/lng, the project can integrate geocoding (Mapbox/Google) later.
    setAreas(prev => [newA, ...prev])
    setAName(''); setACep(''); setAStatus('')
  }

  const addDonation = () => {
    if (!dDesc.trim() || dQty <= 0) return alert('Informe a doação e quantidade')
    const newD: Donation = { id: uid('d'), description: dDesc.trim(), quantity: dQty, areaId: dArea||null }
    setDonations(prev => [newD, ...prev])
    setDDesc(''); setDQty(1); setDArea('')
  }

  const filteredAreas = cepSearch.trim() ? areas.filter(a => a.cep.replace(/[^0-9]/g,'').includes(cepSearch.replace(/[^0-9]/g,''))) : areas

  const generateCSV = (type: 'volunteers'|'areas'|'donations') => {
    let rows: string[][] = []
    if (type === 'volunteers') {
      rows = [['id','name','phone','email','skills','areaId'], ...volunteers.map(v => [v.id,v.name,v.phone||'',v.email||'',v.skills||'',v.areaId||''])]
    } else if (type === 'areas') {
      rows = [['id','name','cep','city','state','lat','lng'], ...areas.map(a => [a.id,a.name,a.cep,a.city||'',a.state||'',String(a.lat||''),String(a.lng||'')])]
    } else {
      rows = [['id','description','quantity','areaId'], ...donations.map(d => [d.id,d.description,String(d.quantity),d.areaId||''])]
    }
    const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g,'""') + '"').join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${type}_${new Date().toISOString().slice(0,10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  // Leaflet map setup
  const mapRef = useRef<L.Map|null>(null)
  const mapContainerRef = useRef<HTMLDivElement|null>(null)
  useEffect(()=>{
    if (!mapContainerRef.current) return
    if (mapRef.current) {
      // update markers later
      return
    }
    mapRef.current = L.map(mapContainerRef.current).setView([-15.78, -47.93], 4)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapRef.current)
  }, [mapContainerRef.current])

  // update markers when areas change
  useEffect(()=>{
    if (!mapRef.current) return
    // remove all marker layers (naive approach)
    mapRef.current.eachLayer((layer)=>{ if ((layer as any)._icon) mapRef.current!.removeLayer(layer) })
    areas.forEach(a => {
      if (a.lat && a.lng) {
        const marker = L.marker([a.lat, a.lng]).addTo(mapRef.current!)
        marker.bindPopup(`<strong>${a.name}</strong><br/>${a.cep} ${a.city||''} ${a.state||''}`)
      }
    })
  }, [areas])

  return (
    <div className='app'>
      <aside className='sidebar'>
        <div className='logo'>🌀 VolunteerDash</div>
        <div className='small' style={{marginTop:6}}>Painel de Voluntariado</div>
        <nav className='menu'>
          <button className={view==='dashboard'? 'active':''} onClick={()=>setView('dashboard')}>Dashboard</button>
          <button className={view==='volunteers'? 'active':''} onClick={()=>setView('volunteers')}>Cadastrar voluntários</button>
          <button className={view==='areas'? 'active':''} onClick={()=>setView('areas')}>Cadastrar áreas / CEP</button>
          <button className={view==='donations'? 'active':''} onClick={()=>setView('donations')}>Cadastro de doações</button>
          <button className={view==='reports'? 'active':''} onClick={()=>setView('reports')}>Relatórios</button>
        </nav>
        <div style={{marginTop:'auto',fontSize:12,color:'#777'}}>Salvo localmente no navegador • versão demo</div>
      </aside>

      <main className='content'>
        <div className='header'>
          <h2 style={{margin:0}}>{view === 'dashboard' ? 'Dashboard' : view === 'volunteers' ? 'Voluntários' : view === 'areas' ? 'Áreas Atingidas' : view === 'donations' ? 'Doações' : 'Relatórios'}</h2>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <input placeholder='Buscar por CEP' value={cepSearch} onChange={e=>setCepSearch(e.target.value)} style={{padding:8,borderRadius:6,border:'1px solid #e6edf3'}} />
            <button onClick={()=>generateCSV('volunteers')} style={{padding:'8px 10px',borderRadius:6,border:'none',background:'#2b6cb0',color:'#fff'}}>Export Volunteers</button>
          </div>
        </div>

        {view==='dashboard' && (
          <>
            <div className='card-row'>
              <div className='card'>
                <div className='small'>Voluntários cadastrados</div>
                <h3 style={{margin:'6px 0'}}>{volunteers.length}</h3>
                <div className='small'>Áreas registradas: {areas.length}</div>
                <div className='small'>Doações: {donations.length}</div>
              </div>
              <div className='card'>
                <div className='small'>Mapa (marcadores das áreas)</div>
                <div className='map' ref={mapContainerRef as any} />
              </div>
            </div>
          </>
        )}

        {view==='volunteers' && (
          <div className='forms'>
            <div className='form'>
              <h4>Novo voluntário</h4>
              <div className='input'><label>Nome</label><input value={vName} onChange={e=>setVName(e.target.value)} /></div>
              <div className='input'><label>Telefone</label><input value={vPhone} onChange={e=>setVPhone(e.target.value)} /></div>
              <div className='input'><label>E-mail</label><input value={vEmail} onChange={e=>setVEmail(e.target.value)} /></div>
              <div className='input'><label>Skills / Observações</label><textarea value={vSkills} onChange={e=>setVSkills(e.target.value)} /></div>
              <div className='input'><label>Vincular a área</label>
                <select value={vArea} onChange={e=>setVArea(e.target.value)}>
                  <option value=''>— Nenhuma —</option>
                  {areas.map(a => <option key={a.id} value={a.id}>{a.name} • {a.cep}</option>)}
                </select>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={addVolunteer} style={{padding:10,borderRadius:8,border:'none',background:'#2b6cb0',color:'#fff'}}>Salvar</button>
                <button onClick={()=>{setVName('');setVPhone('');setVEmail('');setVSkills('');}} style={{padding:10,borderRadius:8}}>Limpar</button>
              </div>
            </div>

            <div className='form'>
              <h4>Lista de voluntários</h4>
              <div className='table'>
                {volunteers.length===0 && <div className='small'>Nenhum voluntário</div>}
                {volunteers.map(v=> (
                  <div key={v.id} style={{padding:'8px 0',borderBottom:'1px solid #f0f3f6'}}>
                    <strong>{v.name}</strong>
                    <div className='small'>{v.skills} • {v.phone} • {v.email} • Área: {areas.find(a=>a.id===v.areaId)?.name || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view==='areas' && (
          <div className='forms'>
            <div className='form'>
              <h4>Nova área atingida</h4>
              <div className='input'><label>Nome da área</label><input value={aName} onChange={e=>setAName(e.target.value)} /></div>
              <div className='input'><label>CEP</label><input value={aCep} onChange={e=>setACep(e.target.value)} placeholder='ex: 80010-000' /></div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={addArea} style={{padding:10,borderRadius:8,border:'none',background:'#2b6cb0',color:'#fff'}}>Salvar</button>
                <button onClick={()=>{setAName('');setACep('');}} style={{padding:10,borderRadius:8}}>Limpar</button>
              </div>
              {aStatus && <div className='small' style={{marginTop:8}}>{aStatus}</div>}
            </div>

            <div className='form'>
              <h4>Áreas encontradas</h4>
              <div className='table'>
                {filteredAreas.length===0 && <div className='small'>Nenhuma área localizada</div>}
                {filteredAreas.map(a=> (
                  <div key={a.id} style={{padding:'8px 0',borderBottom:'1px solid #f0f3f6'}}>
                    <strong>{a.name} • {a.cep}</strong>
                    <div className='small'>{a.city||'—'} • {a.state||'—'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view==='donations' && (
          <div className='forms'>
            <div className='form'>
              <h4>Registrar doação</h4>
              <div className='input'><label>Descrição</label><input value={dDesc} onChange={e=>setDDesc(e.target.value)} /></div>
              <div className='input'><label>Quantidade</label><input type='number' value={dQty} onChange={e=>setDQty(Number(e.target.value))} /></div>
              <div className='input'><label>Vincular a área (opcional)</label>
                <select value={dArea} onChange={e=>setDArea(e.target.value)}>
                  <option value=''>— Nenhuma —</option>
                  {areas.map(a => <option key={a.id} value={a.id}>{a.name} • {a.cep}</option>)}
                </select>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={addDonation} style={{padding:10,borderRadius:8,border:'none',background:'#2b6cb0',color:'#fff'}}>Salvar</button>
              </div>
            </div>

            <div className='form'>
              <h4>Doações registradas</h4>
              <div className='table'>
                {donations.length===0 && <div className='small'>Nenhuma doação</div>}
                {donations.map(d=> (
                  <div key={d.id} style={{padding:'8px 0',borderBottom:'1px solid #f0f3f6'}}>
                    <strong>{d.description}</strong>
                    <div className='small'>Qtd: {d.quantity} • Área: {areas.find(a=>a.id===d.areaId)?.name || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view==='reports' && (
          <div>
            <div className='card-row'>
              <div className='card'>
                <h4>Relatórios</h4>
                <div className='small'>Gere CSVs com os registros para importação/compartilhamento</div>
                <div style={{marginTop:12,display:'flex',gap:8}}>
                  <button onClick={()=>generateCSV('volunteers')} style={{padding:10,borderRadius:8,border:'none',background:'#2b6cb0',color:'#fff'}}>Exportar voluntários</button>
                  <button onClick={()=>generateCSV('areas')} style={{padding:10,borderRadius:8,border:'none',background:'#333',color:'#fff'}}>Exportar áreas</button>
                  <button onClick={()=>generateCSV('donations')} style={{padding:10,borderRadius:8,border:'none',background:'#ff9900',color:'#fff'}}>Exportar doações</button>
                </div>
              </div>

              <div className='card'>
                <h4>Busca por CEP</h4>
                <div className='input'><label>CEP</label><input value={cepSearch} onChange={e=>setCepSearch(e.target.value)} placeholder='Ex: 80010-000' /></div>
                <div className='small'>Resultados:</div>
                <div style={{marginTop:8}}>
                  {filteredAreas.map(a => (
                    <div key={a.id} style={{padding:8,borderBottom:'1px solid #f0f3f6'}}>
                      <strong>{a.name}</strong>
                      <div className='small'>{a.cep} • {a.city || '-'} • {a.state || '-'}</div>
                    </div>
                  ))}
                  {filteredAreas.length===0 && <div className='small'>Nenhuma área encontrada</div>}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
