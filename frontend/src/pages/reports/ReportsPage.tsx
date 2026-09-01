import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, Spinner } from '@/shared/ui';
import { useReports } from '@entities/report';
import { CreateReportForm, ReportList, ReportDetail, ReportFilters } from '@features/reports';
import { setCreateModalOpen, type ReportFiltersDto } from '@entities/report';
import { useDispatch } from 'react-redux';

import { useAppSelector } from '@shared/store/hooks';
import { useTranslation } from '@shared/lib';

export const ReportsPage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [filters, setFilters] = useState<ReportFiltersDto>({});

  const role = useAppSelector((s) => s.auth.role);
  const canCreate = ['student', 'parent', 'teacher'].includes(role || '');

  const { data: reports = [], isLoading } = useReports(filters);

  const handleOpenCreate = () => {
    dispatch(setCreateModalOpen(true));
  };

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="bg-background border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight shrink-0">
            {t('dashboard.reports.title')}
          </h1>
          <div className="flex-1" />
          {canCreate && (
            <Button size="sm" onClick={handleOpenCreate} className="gap-1.5 shrink-0">
              <Plus size={15} />
              <span className="hidden sm:inline">{t('dashboard.reports.newReport')}</span>
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6">
          <ReportFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {isLoading ? (
          <div className="text-center py-24 text-muted-foreground">
            <Spinner />
            <p>{t('dashboard.reports.loading')}</p>
          </div>
        ) : (
          <ReportList reports={reports} />
        )}
      </main>

      {canCreate && <CreateReportForm />}
      <ReportDetail />
    </div>
  );
};
