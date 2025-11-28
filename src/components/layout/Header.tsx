import React from 'react';
import { Button } from '../ui/Button';
import type { ViewType, ExportType } from '../../types';

interface HeaderProps {
  view: ViewType;
  cepSearch: string;
  onCepSearchChange: (value: string) => void;
  onExportPDF: (type: ExportType) => void;
}

const viewTitles: Record<ViewType, string> = {
  dashboard: 'Dashboard',
  volunteers: 'Voluntários',
  areas: 'Áreas Atingidas',
  donations: 'Doações',
  reports: 'Relatórios',
  analytics: 'Analytics',
};

export const Header: React.FC<HeaderProps> = ({
  view,
  cepSearch,
  onCepSearchChange,
  onExportPDF,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
      }}
    >
      <h2 style={{ margin: 0 }}>{viewTitles[view]}</h2>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          placeholder="Buscar por CEP"
          value={cepSearch}
          onChange={e => onCepSearchChange(e.target.value)}
          style={{
            padding: 8,
            borderRadius: 6,
            border: '1px solid #e6edf3',
          }}
        />
        {view === 'reports' && (
          <Button onClick={() => onExportPDF('volunteers')} variant="primary">
            Export Volunteers (PDF)
          </Button>
        )}
      </div>
    </div>
  );
};

