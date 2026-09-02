import { useEffect, useState } from 'react';
import { useValidateAttachment, useRejectAttachment } from '@entities/attachment';
import {
  useEnrollmentSignatureStatus,
  useSignEnrollment,
  useDownloadDocumentPdf,
  usePreviewDocumentPdf,
} from '@entities/document-signature';
import { AttachmentCard } from '@entities/attachment/ui';
import type { Attachment, AttachmentCategory } from '@entities/attachment/model/types';
import { Badge, Button, Label, Textarea } from '@shared/ui';
import CustomDrawer from '@shared/ui/custom-drawer/custom-drawer';
import { useTranslation } from '@shared/lib';
import { Eye } from 'lucide-react';
import { toPdfLocale } from '@shared/config/i18n/locale-config';
import i18n from '@app/i18n/i18n';

const REQUIRED_CATEGORIES: AttachmentCategory[] = [
  'birth_certificate',
  'medical_certificate',
  'previous_report',
  'student_photo',
];

interface EnrollmentDocumentsValidationProps {
  attachments: Attachment[];
  enrollmentId: string;
  subSchoolId: string;
  studentId: string;
}

export function EnrollmentDocumentsValidation({
  attachments = [],
  enrollmentId,
  subSchoolId,
  studentId,
}: EnrollmentDocumentsValidationProps) {
  const { t } = useTranslation();
  const [rejectDrawerOpen, setRejectDrawerOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const pendingAttachments = attachments.filter((a) => a.status === 'pending');

  const validateMutation = useValidateAttachment();
  const rejectMutation = useRejectAttachment();
  const { data: signatureStatus } = useEnrollmentSignatureStatus({
    subSchoolId,
    enrollmentId,
    studentId,
  });
  const signMutation = useSignEnrollment();
  const downloadPdf = useDownloadDocumentPdf();
  const previewPdf = usePreviewDocumentPdf();

  const handleValidate = (attachmentId: string) => {
    validateMutation.mutate({ id: attachmentId });
  };

  const handleRejectClick = (attachment: Attachment) => {
    setSelectedAttachment(attachment);
    setRejectionReason('');
    setRejectDrawerOpen(true);
  };

  const handleRejectConfirm = () => {
    if (!selectedAttachment) return;

    rejectMutation.mutate(
      { id: selectedAttachment.id, reason: rejectionReason },
      {
        onSuccess: () => {
          setRejectDrawerOpen(false);
          setSelectedAttachment(null);
          setRejectionReason('');
        },
      },
    );
  };

  const handleSignEnrollment = () => {
    signMutation.mutate({ subSchoolId, enrollmentId, studentId });
  };

  const handlePreviewPdf = () => {
    previewPdf.mutate(
      {
        documentType: 'enrollment',
        params: {
          subSchoolId,
          enrollmentId,
          studentId,
          locale: toPdfLocale(i18n.language),
          preview: true,
        },
      },
      {
        onSuccess: (url) => {
          setPreviewUrl(url);
          setPreviewDrawerOpen(true);
        },
      },
    );
  };

  const handleClosePreview = () => {
    setPreviewDrawerOpen(false);
  };

  useEffect(() => {
    if (!previewDrawerOpen && previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewDrawerOpen]);

  const handleDownloadPdf = () => {
    downloadPdf.mutate({
      documentType: 'enrollment',
      params: { subSchoolId, enrollmentId, studentId, locale: toPdfLocale(i18n.language) },
      filename: `inscription-${studentId}.pdf`,
    });
  };

  const validatedCategories = new Set(
    attachments.filter((a) => a.status === 'validated').map((a) => a.category),
  );
  const allRequiredValidated = REQUIRED_CATEGORIES.every((c) => validatedCategories.has(c));

  const isSigned = signatureStatus?.isSigned === true;
  const isStale = isSigned && signatureStatus.isStale;
  const canSign = allRequiredValidated && (!isSigned || isStale);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          {t('dashboard.enrollment.documents.pendingValidation')}
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          {canSign && (
            <Button onClick={handleSignEnrollment} disabled={signMutation.isPending}>
              {signMutation.isPending
                ? t('dashboard.enrollment.documents.signing')
                : isStale
                  ? t('dashboard.enrollment.documents.resigning')
                  : t('dashboard.enrollment.documents.signEnrollment')}
            </Button>
          )}

          <Button
            size="icon"
            variant="outline"
            onClick={handlePreviewPdf}
            disabled={!allRequiredValidated || previewPdf.isPending}
            title={
              !allRequiredValidated
                ? t('dashboard.enrollment.documents.previewDisabled')
                : t('dashboard.enrollment.documents.preview')
            }
          >
            <Eye className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            onClick={handleDownloadPdf}
            disabled={!isSigned || downloadPdf.isPending}
            title={!isSigned ? t('dashboard.enrollment.documents.pdfUnavailable') : undefined}
          >
            {downloadPdf.isPending
              ? t('dashboard.enrollment.documents.downloading')
              : t('dashboard.enrollment.documents.downloadPdf')}
          </Button>
        </div>
      </div>
      {!allRequiredValidated && (
        <p className="text-sm text-muted-foreground">
          {t('dashboard.enrollment.documents.requiredValidation')}
        </p>
      )}

      {pendingAttachments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            {t('dashboard.enrollment.documents.noPendingDocuments')}
          </p>

          {isSigned && (
            <Badge variant={isStale ? 'outline' : 'success'} className="mt-2">
              {isStale
                ? t('dashboard.enrollment.documents.signedStale')
                : t('dashboard.enrollment.documents.signed')}
            </Badge>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pendingAttachments.map((attachment) => (
            <div key={attachment.id} className="space-y-2">
              <AttachmentCard attachment={attachment} />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleValidate(attachment.id)}
                  disabled={validateMutation.isPending}
                  className="flex-1"
                >
                  {t('dashboard.enrollment.documents.validate')}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRejectClick(attachment)}
                  disabled={rejectMutation.isPending}
                  className="flex-1"
                >
                  {t('dashboard.enrollment.documents.reject')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CustomDrawer
        isOpen={rejectDrawerOpen}
        handleOpen={() => setRejectDrawerOpen(!rejectDrawerOpen)}
        drawerTitle={t('dashboard.enrollment.documents.rejectTitle')}
        drawerDescription={t('dashboard.enrollment.documents.rejectDescription')}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">{t('dashboard.enrollment.documents.reasonLabel')}</Label>
            <Textarea
              id="reason"
              placeholder={t('dashboard.enrollment.documents.reasonPlaceholder')}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setRejectDrawerOpen(false)}>
              {t('dashboard.enrollment.documents.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!rejectionReason.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending
                ? t('dashboard.enrollment.documents.rejecting')
                : t('dashboard.enrollment.documents.confirmReject')}
            </Button>
          </div>
        </div>
      </CustomDrawer>

      <CustomDrawer
        isOpen={previewDrawerOpen}
        handleOpen={handleClosePreview}
        drawerTitle={t('dashboard.enrollment.documents.previewDrawerTitle')}
        drawerDescription={t('dashboard.enrollment.documents.previewDrawerDescription')}
      >
        {previewUrl && (
          <iframe
            src={previewUrl}
            title={t('dashboard.enrollment.documents.previewIframeTitle')}
            className="w-full h-[75vh] rounded-md border"
          />
        )}
      </CustomDrawer>
    </div>
  );
}
