import React, { useState } from "react";
import { DataProvider, useData } from "./context/DataContext";
import AreasView from "./components/Areas/AreasView";
import VolunteersView from "./components/Volunteers/VolunteersView";
import DonationsView from "./components/Donations/DonationsView";
import MapView from "./components/Map/MapView";

function AppInner() {
  const [view, setView] = useState<'dashboard'|'volunteers'|'areas'|'donations'|'reports'>('dashboard');
  const { volunteers, areas, donations, generateCSV } = useData();

  return (
    <div className='app'>
      <aside className='sidebar'>
        <div className='logo'>🌀 SOS Iguaçu</div>
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
            <input placeholder='Buscar por CEP' onChange={()=>{}} style={{padding:8,borderRadius:6,border:'1px solid #e6edf3'}} />
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
                <div style={{ height: 360 }}>
                  <MapView areas={areas} />
                </div>
              </div>
            </div>
          </>
        )}

        {view==='volunteers' && <VolunteersView />}
        {view==='areas' && <AreasView />}
        {view==='donations' && <DonationsView />}

        {view==='reports' && (
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
          </div>
        )}

      </main>
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppInner />
    </DataProvider>
  );
}
