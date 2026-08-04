import { Badge } from '@shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/card';
import { Button } from '@shared/ui/button';
import { Calendar, User, AlertCircle } from 'lucide-react';
import type { Report } from '@entities/report/model/types';
import { setSelectedReportId, setDetailModalOpen } from '@entities/report';
import { useDispatch } from 'react-redux';
import { useTranslation } from '@shared/lib';

interface ReportListProps {
    reports: Report[];
}

const statusColors: Record<string, string> = {
    new: 'bg-blue-500',
    in_review: 'bg-yellow-500',
    resolved: 'bg-green-500',
    dismissed: 'bg-gray-500',
};

export const ReportList = ({ reports }: ReportListProps) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const statusLabels: Record<string, string> = {
        new: t('dashboard.reports.status.new'),
        in_review: t('dashboard.reports.status.in_review'),
        resolved: t('dashboard.reports.status.resolved'),
        dismissed: t('dashboard.reports.status.dismissed'),
    };

    const categoryLabels: Record<string, string> = {
        harassment: t('dashboard.reports.category.harassment'),
        behavior: t('dashboard.reports.category.behavior'),
        material: t('dashboard.reports.category.material'),
        security: t('dashboard.reports.category.security'),
        teacher_absence: t('dashboard.reports.category.teacher_absence'),
        other: t('dashboard.reports.category.other'),
    };

    const handleViewReport = (reportId: string) => {
        dispatch(setSelectedReportId(reportId));
        dispatch(setDetailModalOpen(true));
    };

    if (reports.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">{t('dashboard.reports.noReports')}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {reports.map((report) => (
                <Card key={report.id}>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <CardTitle className="text-lg mb-2">
                                    {categoryLabels[report.category] || report.category}
                                </CardTitle>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                                </div>
                            </div>
                            <Badge className={`${statusColors[report.status]} text-white`}>
                                {statusLabels[report.status] || report.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700 mb-4 line-clamp-2">{report.description}</p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <User className="h-4 w-4" />
                                {report.isAnonymous ? t('dashboard.reports.list.anonymous') : t('dashboard.reports.list.identified')}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewReport(report.id)}
                            >
                                {t('dashboard.reports.viewDetails')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
