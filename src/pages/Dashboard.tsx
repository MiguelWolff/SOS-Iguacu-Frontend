import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useMap } from '../hooks/useMap';
import { useAnalytics } from '../hooks/useAnalytics';
import { Card } from '../components/ui/Card';
import { COLORS } from '../constants';
import type { Volunteer, Area, Donation } from '../types';

interface DashboardProps {
  volunteers: Volunteer[];
  areas: Area[];
  donations: Donation[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  volunteers,
  areas,
  donations,
}) => {
  const { mapContainerRef } = useMap(areas);
  const {
    pieData,
    barData,
    areaRanking,
    kpiPercentVolWithArea,
    kpiPercentAreasWithDon,
    kpiPercentDonationsLinked,
  } = useAnalytics(volunteers, areas, donations);

  return (
    <>
      {/* KPI CARDS */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <Card style={{ flex: 1, minWidth: 160, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#6b7280' }}>Voluntários cadastrados</div>
          <h3 style={{ margin: '6px 0' }}>{volunteers.length}</h3>
          <div style={{ fontSize: 13, color: '#6b7280' }}>% com área vinculada</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{kpiPercentVolWithArea}%</div>
        </Card>

        <Card style={{ flex: 1, minWidth: 160, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#6b7280' }}>Áreas registradas</div>
          <h3 style={{ margin: '6px 0' }}>{areas.length}</h3>
          <div style={{ fontSize: 13, color: '#6b7280' }}>% áreas com doações</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{kpiPercentAreasWithDon}%</div>
        </Card>

        <Card style={{ flex: 1, minWidth: 160, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#6b7280' }}>Doações registradas</div>
          <h3 style={{ margin: '6px 0' }}>{donations.length}</h3>
          <div style={{ fontSize: 13, color: '#6b7280' }}>% doações vinculadas</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{kpiPercentDonationsLinked}%</div>
        </Card>
      </div>

      {/* MAP + CHARTS SIDE-BY-SIDE */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'flex-start',
          marginBottom: 16,
        }}
      >
        {/* Mapa */}
        <Card style={{ flex: 1, minWidth: 360, height: 280 }}>
          <div style={{ fontSize: 13, color: '#6b7280' }}>Mapa (marcadores das áreas)</div>
          <div
            ref={mapContainerRef as any}
            style={{ height: '220px', marginTop: 8 }}
          />
        </Card>

        {/* Coluna de charts */}
        <div style={{ width: 380, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <h4 style={{ marginTop: 0 }}>Áreas mais atingidas (Voluntários)</h4>
            {pieData.length === 0 ? (
              <div style={{ fontSize: 13, color: '#6b7280' }}>Nenhum dado</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={30}
                    outerRadius={60}
                    label={(entry) => `${entry.name} (${entry.value})`}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card>
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
          </Card>
        </div>
      </div>

      {/* RANKING DE ÁREAS */}
      <Card>
        <h4 style={{ marginTop: 0 }}>Ranking de áreas (voluntários + doações)</h4>
        {areaRanking.length === 0 && (
          <div style={{ fontSize: 13, color: '#6b7280' }}>Nenhuma área registrada</div>
        )}
        {areaRanking.map(a => (
          <div
            key={a.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <div>
              <strong>{a.name}</strong>
              <div style={{ fontSize: 13, color: '#6b7280' }}>
                {a.vols} voluntários • {a.dons} doações
              </div>
            </div>
            <div style={{ fontWeight: 700 }}>{a.total}</div>
          </div>
        ))}
      </Card>
    </>
  );
};

