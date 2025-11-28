import React from 'react';
import type { ViewType } from '../../types';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const menuItems: Array<{ view: ViewType; label: string }> = [
    { view: 'dashboard', label: 'Visão Geral' },
    { view: 'volunteers', label: 'Cadastrar voluntários' },
    { view: 'areas', label: 'Cadastrar áreas / CEP' },
    { view: 'donations', label: 'Cadastro de doações' },
    { view: 'reports', label: 'Relatórios' },
    { view: 'analytics', label: 'Análise' },
  ];

  return (
    <aside
      style={{
        width: 220,
        padding: 20,
        borderRight: '1px solid #e6edf3',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
        🌀 SOS Iguaçu
      </div>
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
        Painel de Voluntariado
      </div>

      <nav>
        {menuItems.map(item => (
          <button
            key={item.view}
            onClick={() => onViewChange(item.view)}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '8px 10px',
              borderRadius: 8,
              border: 'none',
              background: currentView === item.view ? '#eef2ff' : 'transparent',
              cursor: 'pointer',
              marginBottom: 6,
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', fontSize: 12, color: '#9ca3af' }}>
        Salvo localmente no navegador • versão demo
      </div>
    </aside>
  );
};

