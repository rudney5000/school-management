import React, {type ReactNode} from 'react';
import {Card} from "@shared/ui/card.tsx";
import {Layers3, LayoutGrid, Puzzle, Sparkles} from "lucide-react";
import { useTranslation } from '@/shared/lib/useTranslation';

interface Feature {
  icon: ReactNode;
  title: string;
  desc: string;
}

interface FeaturesSectionProps {
  features?: Feature[];
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features }) => {
  const { t } = useTranslation();
  
  const defaultFeatures: Feature[] = features || [
    {
      icon: <Layers3 className="h-5 w-5" />,
      title: t('home.features.multi_level_management'),
      desc: t('home.features.multi_level_description'),
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: t('home.features.modern_learning'),
      desc: t('home.features.modern_learning_description'),
    },
    {
      icon: <Puzzle className="h-5 w-5" />,
      title: t('home.features.fully_customizable'),
      desc: t('home.features.customizable_description'),
    },
    {
      icon: <LayoutGrid className="h-5 w-5" />,
      title: t('home.features.all_in_one'),
      desc: t('home.features.all_in_one_description'),
    },
  ];

  return (
      <section id="defaultFeatures" className="mx-auto max-w-7xl px-6 pb-10 lg:px-10">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {defaultFeatures.map((item) => (
              <Card key={item.title} className="rounded-3xl border-0 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
              </Card>
          ))}
        </div>
      </section>
  );
};
