import { useSelector, useDispatch } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shared/ui/dialog';
import { Button } from '@shared/ui/button';
import { Badge } from '@shared/ui/badge';
import { Textarea } from '@shared/ui/textarea';
import { Label } from '@shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select';
import { selectSelectedReportId, selectDetailModalOpen, setDetailModalOpen } from '@entities/report';
import { useReportById, useUpdateReportStatus } from '@entities/report';
import { useState } from 'react';
import { useTranslation } from '@shared/lib';

const statusColors: Record<string, string> = {
    new: 'bg-blue-500',
    in_review: 'bg-yellow-500',
    resolved: 'bg-green-500',
    dismissed: 'bg-gray-500',
};

export const ReportDetail = () => {
    const selectedId = useSelector(selectSelectedReportId);
    const isOpen = useSelector(selectDetailModalOpen);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [note, setNote] = useState('');
    const [newStatus, setNewStatus] = useState('');

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

    const { data: report, isLoading } = useReportById({ id: selectedId || '' }, isOpen);

    const updateStatusMutation = useUpdateReportStatus();

    const handleStatusUpdate = () => {
        if (!selectedId || !newStatus) return;
        updateStatusMutation.mutate(
            { id: selectedId, dto: { status: newStatus as any, note: note || undefined } },
            {
                onSuccess: () => {
                    setNote('');
                    setNewStatus('');
                    window.location.reload();
                },
            }
        );
    };

    if (!isOpen) return null;

    if (isLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={(open) => dispatch(setDetailModalOpen(open))}>
                <DialogContent>{t('dashboard.reports.detail.loading')}</DialogContent>
            </Dialog>
        );
    }

    if (!report) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => dispatch(setDetailModalOpen(open))}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>{t('dashboard.reports.detail.title')}</DialogTitle>
                        <Badge className={`${statusColors[report.status]} text-white`}>
                            {statusLabels[report.status] || report.status}
                        </Badge>
                    </div>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label className="text-sm text-gray-500">{t('dashboard.reports.detail.category')}</Label>
                        <p className="font-medium">{categoryLabels[report.category] || report.category}</p>
                    </div>

                    <div>
                        <Label className="text-sm text-gray-500">{t('dashboard.reports.detail.description')}</Label>
                        <p className="text-gray-700">{report.description}</p>
                    </div>

                    {report.involvedPersonName && (
                        <div>
                            <Label className="text-sm text-gray-500">{t('dashboard.reports.detail.involvedPerson')}</Label>
                            <p className="font-medium">{report.involvedPersonName}</p>
                            {report.involvedPersonRole && (
                                <p className="text-sm text-gray-500">{report.involvedPersonRole}</p>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm text-gray-500">{t('dashboard.reports.detail.createdAt')}</Label>
                            <p className="text-sm">{new Date(report.createdAt).toLocaleString('fr-FR')}</p>
                        </div>
                        <div>
                            <Label className="text-sm text-gray-500">{t('dashboard.reports.detail.isAnonymous')}</Label>
                            <p className="text-sm">{report.isAnonymous ? t('dashboard.reports.detail.yes') : t('dashboard.reports.detail.no')}</p>
                        </div>
                    </div>

                    {report.resolutionNote && (
                        <div>
                            <Label className="text-sm text-gray-500">{t('dashboard.reports.detail.resolutionNote')}</Label>
                            <p className="text-gray-700 bg-gray-50 p-3 rounded">{report.resolutionNote}</p>
                        </div>
                    )}

                    {report.resolvedAt && (
                        <div>
                            <Label className="text-sm text-gray-500">{t('dashboard.reports.detail.resolvedAt')}</Label>
                            <p className="text-sm">{new Date(report.resolvedAt).toLocaleString('fr-FR')}</p>
                        </div>
                    )}

                    <div className="border-t pt-4">
                        <Label className="text-sm text-gray-500 mb-2 block">{t('dashboard.reports.detail.updateStatus')}</Label>
                        <div className="space-y-2">
                            <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('dashboard.reports.detail.newStatusPlaceholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="new">{t('dashboard.reports.status.new')}</SelectItem>
                                    <SelectItem value="in_review">{t('dashboard.reports.status.in_review')}</SelectItem>
                                    <SelectItem value="resolved">{t('dashboard.reports.status.resolved')}</SelectItem>
                                    <SelectItem value="dismissed">{t('dashboard.reports.status.dismissed')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <Textarea
                                placeholder={t('dashboard.reports.detail.notePlaceholder')}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={3}
                            />
                            <Button
                                onClick={handleStatusUpdate}
                                disabled={!newStatus || updateStatusMutation.isPending}
                                className="w-full"
                            >
                                {updateStatusMutation.isPending ? t('dashboard.reports.detail.updating') : t('dashboard.reports.detail.update')}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
