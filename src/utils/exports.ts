import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Volunteer, Area, Donation, ExportType } from '../types';

export const generatePDF = (
  type: ExportType,
  volunteers: Volunteer[],
  areas: Area[],
  donations: Donation[]
): void => {
  const doc = new jsPDF();

  let title = '';
  let head: string[][] = [];
  let body: any[][] = [];

  if (type === 'volunteers') {
    title = 'Relatório de Voluntários';
    head = [['ID', 'Nome', 'Telefone', 'Email', 'Skills', 'Área']];
    body = volunteers.map(v => [
      v.id,
      v.name,
      v.phone || '',
      v.email || '',
      v.skills || '',
      areas.find(a => a.id === v.areaId)?.name || '—'
    ]);
  }

  if (type === 'areas') {
    title = 'Relatório de Áreas';
    head = [['ID', 'Nome', 'CEP', 'Cidade', 'Estado']];
    body = areas.map(a => [
      a.id,
      a.name,
      a.cep,
      a.city || '',
      a.state || ''
    ]);
  }

  if (type === 'donations') {
    title = 'Relatório de Doações';
    head = [['ID', 'Descrição', 'Quantidade', 'Área']];
    body = donations.map(d => [
      d.id,
      d.description,
      d.quantity,
      areas.find(a => a.id === d.areaId)?.name || '—'
    ]);
  }

  doc.setFontSize(14);
  doc.text(title, 14, 16);

  autoTable(doc, {
    head,
    body,
    startY: 20
  });

  doc.save(`${type}_${new Date().toISOString().slice(0, 10)}.pdf`);
};

export const generateCSV = (
  type: ExportType,
  volunteers: Volunteer[],
  areas: Area[],
  donations: Donation[]
): void => {
  let rows: string[][] = [];

  if (type === 'volunteers') {
    rows = [
      ['id', 'name', 'phone', 'email', 'skills', 'area'],
      ...volunteers.map(v => [
        v.id,
        v.name,
        v.phone || '',
        v.email || '',
        v.skills || '',
        areas.find(a => a.id === v.areaId)?.name || ''
      ])
    ];
  } else if (type === 'areas') {
    rows = [
      ['id', 'name', 'cep', 'city', 'state'],
      ...areas.map(a => [
        a.id,
        a.name,
        a.cep,
        a.city || '',
        a.state || ''
      ])
    ];
  } else {
    rows = [
      ['id', 'description', 'quantity', 'area'],
      ...donations.map(d => [
        d.id,
        d.description,
        String(d.quantity),
        areas.find(a => a.id === d.areaId)?.name || ''
      ])
    ];
  }

  const csv = rows
    .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${type}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

