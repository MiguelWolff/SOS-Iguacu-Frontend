import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { Volunteers } from './pages/Volunteers';
import { Areas } from './pages/Areas';
import { Donations } from './pages/Donations';
import { Reports } from './pages/Reports';
import { Analytics } from './pages/Analytics';
import { useVolunteers } from './hooks/useVolunteers';
import { useAreas } from './hooks/useAreas';
import { useDonations } from './hooks/useDonations';
import { generatePDF } from './utils/exports';
import type { ViewType, ExportType } from './types';
import './styles.css';

export default function App(): JSX.Element {
  const [view, setView] = useState<ViewType>('dashboard');
  const [cepSearch, setCepSearch] = useState('');

  const { volunteers } = useVolunteers();
  const { areas } = useAreas();
  const { donations } = useDonations();

  const handleExportPDF = (type: ExportType) => {
    generatePDF(type, volunteers, areas, donations);
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return (
          <Dashboard
            volunteers={volunteers}
            areas={areas}
            donations={donations}
          />
        );
      case 'volunteers':
        return <Volunteers />;
      case 'areas':
        return <Areas cepSearch={cepSearch} />;
      case 'donations':
        return <Donations />;
      case 'reports':
        return (
          <Reports
            volunteers={volunteers}
            areas={areas}
            donations={donations}
          />
        );
      case 'analytics':
        return (
          <Analytics
            volunteers={volunteers}
            areas={areas}
            donations={donations}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#f6f8fb',
        color: '#1f2937',
      }}
    >
      <Sidebar currentView={view} onViewChange={setView} />

      <main
        style={{
          flex: 1,
          padding: 20,
          overflow: 'auto',
        }}
      >
        <Header
          view={view}
          cepSearch={cepSearch}
          onCepSearchChange={setCepSearch}
          onExportPDF={handleExportPDF}
        />

        {renderView()}
      </main>
    </div>
  );
}
