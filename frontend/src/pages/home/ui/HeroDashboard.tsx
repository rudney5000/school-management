import React from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';

interface HeroDashboardProps {
  title?: string;
  description?: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

export const HeroDashboard: React.FC<HeroDashboardProps> = ({
  title,
  description,
  ctaText,
  onCtaClick,
}) => {
  const { t } = useTranslation();
  
  const defaultTitle = title || t('home.dashboard.title');
  const defaultDescription = description || t('home.dashboard.description');
  const defaultCtaText = ctaText || t('home.dashboard.cta');
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white">
      <h1 className="text-4xl font-bold mb-4">{defaultTitle}</h1>
      <p className="text-lg mb-6 opacity-90">{defaultDescription}</p>
      <button
        onClick={onCtaClick}
        className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
      >
        {defaultCtaText}
      </button>
    </div>
  );
};
