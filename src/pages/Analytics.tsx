import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '../hooks/useAnalytics';
import { Card } from '../components/ui/Card';
import { COLORS } from '../constants';
import type { Volunteer, Area, Donation } from '../types';

interface AnalyticsProps {
  volunteers: Volunteer[];
  areas: Area[];
  donations: Donation[];
}

export const Analytics: React.FC<AnalyticsProps> = ({
  volunteers,
  areas,
  donations,
}) => {
  const { pieData, barData, areaRanking } = useAnalytics(
    volunteers,
    areas,
    donations
  );

  return (
    <>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <Card style={{ minWidth: 300 }}>
          <h4 style={{ marginTop: 0 }}>Voluntários por área (Pizza)</h4>
          {pieData.length === 0 ? (
            <div style={{ fontSize: 13, color: '#6b7280' }}>Nenhum dado</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={80}
                  label
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card style={{ minWidth: 420 }}>
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
        </Card>
      </div>

      <Card>
        <h4 style={{ marginTop: 0 }}>Top áreas (ranking)</h4>
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

