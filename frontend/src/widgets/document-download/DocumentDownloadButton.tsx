import { useState } from 'react';
import { useTranslation } from '@shared/lib';
import {
  useBulletinSignatureStatus,
  useEnrollmentSignatureStatus,
  useCertificateSignatureStatus,
} from '@entities/document-signature';
import { downloadDocumentPdf } from '@entities/document-signature/lib/downloadDocumentPdf';
import { SignatureBadge } from '@entities/document-signature/ui';
import { Alert, AlertDescription, Button } from '@shared/ui';
import { DownloadIcon, AlertTriangleIcon } from 'lucide-react';
import type { DocumentType, PdfLocale, SignatureStatusResult } from '@entities/document-signature';
import type {
  BulletinSignDto,
  EnrollmentSignDto,
  CertificateSignDto,
} from '@entities/document-signature/model/createDocumentSignatureSchema';

interface DocumentDownloadButtonProps {
  documentType: DocumentType;
  params: BulletinSignDto | EnrollmentSignDto | CertificateSignDto;
  locale?: PdfLocale;
  label?: string;
}

export function DocumentDownloadButton({
  documentType,
  params,
  locale = 'fr',
  label,
}: DocumentDownloadButtonProps) {
  const { t } = useTranslation();
  const [isDownloading, setIsDownloading] = useState(false);

  const bulletinResult = useBulletinSignatureStatus(
    documentType === 'bulletin' ? (params as BulletinSignDto) : undefined,
  );
  const enrollmentResult = useEnrollmentSignatureStatus(
    documentType === 'enrollment' ? (params as EnrollmentSignDto) : undefined,
  );
  const certificateResult = useCertificateSignatureStatus(
    documentType === 'certificate' ? (params as CertificateSignDto) : undefined,
  );

  const { data: signatureStatus, isLoading }: { data?: SignatureStatusResult; isLoading: boolean } =
    documentType === 'bulletin'
      ? bulletinResult
      : documentType === 'enrollment'
        ? enrollmentResult
        : certificateResult;

  const resolvedLabel = label ?? t('documentSignature.downloadButton.label');

  const handleDownload = async () => {
    if (!signatureStatus?.isSigned || signatureStatus.isStale) return;

    setIsDownloading(true);
    try {
      await downloadDocumentPdf(
        documentType,
        { ...params, locale } as never, // le type exact dépend de documentType, voir note ci-dessous
        `${documentType}-${params.studentId}.pdf`,
      );
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <Button disabled variant="outline">
        {t('common.loading')}
      </Button>
    );
  }

  if (!signatureStatus?.isSigned) {
    return (
      <div className="space-y-2">
        <Button disabled variant="outline">
          <DownloadIcon className="mr-2 h-4 w-4" />
          {resolvedLabel}
        </Button>
        <p className="text-xs text-muted-foreground">
          {t('documentSignature.downloadButton.notSigned')}
        </p>
      </div>
    );
  }

  if (signatureStatus.isStale) {
    return (
      <Alert variant="destructive">
        <AlertTriangleIcon className="h-4 w-4" />
        <AlertDescription>{t('documentSignature.downloadButton.staleWarning')}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleDownload} disabled={isDownloading} variant="default">
        <DownloadIcon className="mr-2 h-4 w-4" />
        {isDownloading ? t('documentSignature.downloadButton.downloading') : resolvedLabel}
      </Button>
      <div className="flex items-center gap-2">
        <SignatureBadge
          status={signatureStatus}
          labels={{
            signed: t('documentSignature.badge.signed'),
            notSigned: t('documentSignature.badge.notSigned'),
            expired: t('documentSignature.badge.expired'),
          }}
        />
      </div>
    </div>
  );
}
