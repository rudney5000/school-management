import React from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';

interface HeroStatsProps {
  stats?: Array<{
    label: string;
    value: string | number;
  }>;
}

export const HeroStats: React.FC<HeroStatsProps> = ({ stats }) => {
  const { t } = useTranslation();
  
  const defaultStats = stats || [
    { label: t('home.stats.students'), value: '10,000+' },
    { label: t('home.stats.teachers'), value: '500+' },
    { label: t('home.stats.schools'), value: '100+' },
    { label: t('home.stats.courses'), value: '1,000+' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {defaultStats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg p-6 shadow-md text-center"
        >
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {stat.value}
          </div>
          <div className="text-gray-600">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};
