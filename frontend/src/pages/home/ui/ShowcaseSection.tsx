import React from 'react';
import {Card} from "@shared/ui/card.tsx";
import {Badge} from "@shared/ui/badge.tsx";
import {Button} from "@shared/ui/button.tsx";
import { useTranslation } from '@/shared/lib/useTranslation';

interface ShowcaseItem {
  title: string;
  description: string;
  image?: string;
}

interface ShowcaseSectionProps {
  items?: ShowcaseItem[];
}

export const ShowcaseSection: React.FC<ShowcaseSectionProps> = ({ items }) => {
  const { t } = useTranslation();
  
  const defaultItems: ShowcaseItem[] = items || [
    {
      title: t('home.showcase.modern_dashboard'),
      description: t('home.showcase.modern_dashboard_description'),
    },
    {
      title: t('home.showcase.mobile_friendly'),
      description: t('home.showcase.mobile_friendly_description'),
    },
    {
      title: t('home.showcase.secure_reliable'),
      description: t('home.showcase.secure_reliable_description'),
    },
  ];

  return (
      <section id="showcase" className="mx-auto max-w-7xl px-6 pb-16 lg:px-10">
      <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-[2rem] border-0 bg-white p-8 shadow-sm">
              <h2 className="text-3xl font-semibold tracking-tight">
                  {t('home.showcase.designed_for_modern_education')}
              </h2>
              <p className="mt-4 text-slate-600">
                  {t('home.showcase.designed_description')}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                  <Badge variant="secondary" className="rounded-full px-4 py-2">
                      React
                  </Badge>
                  <Badge variant="secondary" className="rounded-full px-4 py-2">
                      TypeScript
                  </Badge>
                  <Badge variant="secondary" className="rounded-full px-4 py-2">
                      TailwindCSS
                  </Badge>
                  <Badge variant="secondary" className="rounded-full px-4 py-2">
                      shadcn/ui
                  </Badge>
              </div>
          </Card>

          <Card className="rounded-[2rem] border-0 bg-blue-600 p-8 text-white shadow-sm">
              <h2 className="text-3xl font-semibold tracking-tight">
                  {t('home.showcase.ready_to_transform')}
              </h2>
              <p className="mt-4 text-white/80">
                  {t('home.showcase.ready_description')}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                  <Button className="rounded-full bg-white px-6 text-blue-600 hover:bg-white/90">
                      {t('home.showcase.request_demo')}
                  </Button>
              </div>
          </Card>
      </div>
  </section>
  );
};
