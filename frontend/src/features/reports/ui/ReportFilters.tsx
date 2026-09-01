import {
  Card,
  CardContent,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui';
import type { ReportFiltersDto } from '@entities/report';
import { useTranslation } from '@shared/lib';

interface ReportFiltersProps {
  filters: ReportFiltersDto;
  onFiltersChange: (filters: ReportFiltersDto) => void;
}

export const ReportFilters = ({ filters, onFiltersChange }: ReportFiltersProps) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">{t('dashboard.reports.filters.status')}</Label>
            <Select
              value={filters.status || ''}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, status: (value as any) || undefined })
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder={t('dashboard.reports.filters.allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('dashboard.reports.filters.all')}</SelectItem>
                <SelectItem value="new">{t('dashboard.reports.status.new')}</SelectItem>
                <SelectItem value="in_review">{t('dashboard.reports.status.in_review')}</SelectItem>
                <SelectItem value="resolved">{t('dashboard.reports.status.resolved')}</SelectItem>
                <SelectItem value="dismissed">{t('dashboard.reports.status.dismissed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">{t('dashboard.reports.filters.category')}</Label>
            <Select
              value={filters.category || ''}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, category: (value as any) || undefined })
              }
            >
              <SelectTrigger id="category">
                <SelectValue placeholder={t('dashboard.reports.filters.allCategories')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('dashboard.reports.filters.all')}</SelectItem>
                <SelectItem value="harassment">
                  {t('dashboard.reports.category.harassment')}
                </SelectItem>
                <SelectItem value="behavior">{t('dashboard.reports.category.behavior')}</SelectItem>
                <SelectItem value="material">{t('dashboard.reports.category.material')}</SelectItem>
                <SelectItem value="security">{t('dashboard.reports.category.security')}</SelectItem>
                <SelectItem value="teacher_absence">
                  {t('dashboard.reports.category.teacher_absence')}
                </SelectItem>
                <SelectItem value="other">{t('dashboard.reports.category.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateFrom">{t('dashboard.reports.filters.dateFrom')}</Label>
            <input
              id="dateFrom"
              type="date"
              className="w-full px-3 py-2 border rounded-md"
              value={filters.from ? new Date(filters.from).toISOString().split('T')[0] : ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  from: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
