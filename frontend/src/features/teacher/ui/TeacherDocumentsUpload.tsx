import {
  type AttachmentCategory,
  useAttachments,
  AttachmentUploadZone,
} from '@entities/attachment';
import { Badge, Spinner } from '@shared/ui';
import { useTranslation } from '@shared/lib';

const REQUIRED_CATEGORIES: AttachmentCategory[] = [
  'teacher_photo',
  'identity_document',
  'diploma',
  'criminal_record',
  'resume',
  'medical_certificate',
];

interface TeacherDocumentsUploadProps {
  teacherId: string;
}

export function TeacherDocumentsUpload({ teacherId }: TeacherDocumentsUploadProps) {
  const { t } = useTranslation();
  const { data: attachments, isLoading } = useAttachments({
    attachableType: 'teacher',
    attachableId: teacherId,
  });

  const getAttachmentByCategory = (category: AttachmentCategory) => {
    const matches = attachments?.filter((a) => a.category === category) ?? [];
    if (matches.length === 0) return undefined;
    return matches.reduce((latest, current) =>
      new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest,
    );
  };

  const getStatusBadge = (category: AttachmentCategory) => {
    const attachment = getAttachmentByCategory(category);

    if (!attachment) {
      return <Badge variant="outline">{t('dashboard.teachers.documents.missing')}</Badge>;
    }

    const statusConfig = {
      pending: {
        label: t('dashboard.teachers.documents.pending'),
        variant: 'outline' as const,
      },
      validated: {
        label: t('dashboard.teachers.documents.validated'),
        variant: 'success' as const,
      },
      rejected: {
        label: t('dashboard.teachers.documents.rejected'),
        variant: 'destructive' as const,
      },
    };

    const config = statusConfig[attachment.status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        <Spinner />
        {t('dashboard.teachers.documents.loading')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">{t('dashboard.teachers.documents.title')}</h2>

      <div className="space-y-4">
        {REQUIRED_CATEGORIES.map((category) => (
          <div key={category} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                {t(`dashboard.teachers.documents.categories.${category}`)}
              </label>
              {getStatusBadge(category)}
            </div>

            <AttachmentUploadZone
              attachableType="teacher"
              attachableId={teacherId}
              category={category}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
