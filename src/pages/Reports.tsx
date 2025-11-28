import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { generatePDF, generateCSV } from '../utils/exports';
import type { Volunteer, Area, Donation, ExportType } from '../types';

interface ReportsProps {
  volunteers: Volunteer[];
  areas: Area[];
  donations: Donation[];
}

export const Reports: React.FC<ReportsProps> = ({
  volunteers,
  areas,
  donations,
}) => {
  const handleExportPDF = (type: ExportType) => {
    generatePDF(type, volunteers, areas, donations);
  };

  const handleExportCSV = (type: ExportType) => {
    generateCSV(type, volunteers, areas, donations);
  };

  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <Card>
        <h4>Relatórios em PDF</h4>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
          Gere PDFs com os registros para importação/compartilhamento
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button onClick={() => handleExportPDF('volunteers')}>
            Exportar voluntários
          </Button>
          <Button variant="dark" onClick={() => handleExportPDF('areas')}>
            Exportar áreas
          </Button>
          <Button variant="orange" onClick={() => handleExportPDF('donations')}>
            Exportar doações
          </Button>
        </div>
      </Card>

      <Card>
        <h4>Relatórios em CSV</h4>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
          Gere CSVs com os registros para importação
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button onClick={() => handleExportCSV('volunteers')}>
            Exportar voluntários
          </Button>
          <Button variant="dark" onClick={() => handleExportCSV('areas')}>
            Exportar áreas
          </Button>
          <Button variant="orange" onClick={() => handleExportCSV('donations')}>
            Exportar doações
          </Button>
        </div>
      </Card>
    </div>
  );
};

