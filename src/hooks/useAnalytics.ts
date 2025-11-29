import { useMemo } from 'react';
import type { Volunteer, Area, Donation } from '../types';

export const useAnalytics = (
  volunteers: Volunteer[],
  areas: Area[],
  donations: Donation[]
) => {
  // Pie chart: voluntários por área
  const pieData = useMemo(() => {
    return areas
      .map(area => ({
        name: area.name,
        value: volunteers.filter(v => v.areaId === area.id).length
      }))
      .filter(a => a.value > 0);
  }, [areas, volunteers]);

  // Bar chart: doações e voluntários por área
  const barData = useMemo(() => {
    return areas.map(area => ({
      name: area.name,
      donationsCount: donations.filter(d => d.areaId === area.id).length,
      volunteersCount: volunteers.filter(v => v.areaId === area.id).length
    }));
  }, [areas, donations, volunteers]);

  // Ranking de áreas
  const areaRanking = useMemo(() => {
    return areas
      .map(area => {
        const vols = volunteers.filter(v => v.areaId === area.id).length;
        const dons = donations.filter(d => d.areaId === area.id).length;
        return {
          id: area.id,
          name: area.name,
          vols,
          dons,
          total: vols + dons
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [areas, volunteers, donations]);

  // KPIs
  const kpiPercentVolWithArea = useMemo(() => {
    if (volunteers.length === 0) return 0;
    const withArea = volunteers.filter(v => v.areaId).length;
    return Math.round((withArea / volunteers.length) * 100);
  }, [volunteers]);

  const kpiPercentAreasWithDon = useMemo(() => {
    if (areas.length === 0) return 0;
    const withDon = areas.filter(a => donations.some(d => d.areaId === a.id)).length;
    return Math.round((withDon / areas.length) * 100);
  }, [areas, donations]);

  const kpiPercentDonationsLinked = useMemo(() => {
    if (donations.length === 0) return 0;
    const linked = donations.filter(d => d.areaId).length;
    return Math.round((linked / donations.length) * 100);
  }, [donations]);

  return {
    pieData,
    barData,
    areaRanking,
    kpiPercentVolWithArea,
    kpiPercentAreasWithDon,
    kpiPercentDonationsLinked,
  };
};

