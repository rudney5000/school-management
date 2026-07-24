import { useState } from 'react'
import { useBulletinSignatureStatus, useEnrollmentSignatureStatus } from '@entities/document-signature'
import { downloadDocumentPdf } from '@entities/document-signature/lib/downloadDocumentPdf'
import { SignatureBadge } from '@entities/document-signature/ui'
import { Button } from '@shared/ui/button'
import { Alert, AlertDescription } from '@shared/ui/alert'
import { DownloadIcon, AlertTriangleIcon } from 'lucide-react'
import type { DocumentType, PdfLocale, SignatureStatusResult } from '@entities/document-signature/model/types'
import type { BulletinSignDto, EnrollmentSignDto, CertificateSignDto } from '@entities/document-signature/model/createDocumentSignatureSchema'

interface DocumentDownloadButtonProps {
  documentType: DocumentType
  params: BulletinSignDto | EnrollmentSignDto | CertificateSignDto
  locale?: PdfLocale
  label?: string
}

export function DocumentDownloadButton({
  documentType,
  params,
  locale = 'fr',
  label = 'Télécharger le PDF',
}: DocumentDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  
  let signatureStatus: SignatureStatusResult | undefined
  let isLoading = false

  if (documentType === 'bulletin') {
    const result = useBulletinSignatureStatus(params as BulletinSignDto)
    signatureStatus = result.data
    isLoading = result.isLoading
  } else if (documentType === 'enrollment') {
    const result = useEnrollmentSignatureStatus(params as EnrollmentSignDto)
    signatureStatus = result.data
    isLoading = result.isLoading
  } else if (documentType === 'certificate') {
    // Certificate uses similar params to enrollment for now
    const result = useEnrollmentSignatureStatus(params as EnrollmentSignDto)
    signatureStatus = result.data
    isLoading = result.isLoading
  }

  const handleDownload = async () => {
    if (!signatureStatus?.isSigned || signatureStatus.isStale) return

    setIsDownloading(true)
    try {
      await downloadDocumentPdf(
        documentType,
        { ...params, locale },
        `${documentType}-${params.studentId}.pdf`
      )
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  if (isLoading) {
    return <Button disabled variant="outline">Chargement...</Button>
  }

  if (!signatureStatus?.isSigned) {
    return (
      <div className="space-y-2">
        <Button disabled variant="outline">
          <DownloadIcon className="mr-2 h-4 w-4" />
          {label}
        </Button>
        <p className="text-xs text-muted-foreground">
          Document non signé
        </p>
      </div>
    )
  }

  if (signatureStatus.isStale) {
    return (
      <Alert variant="destructive">
        <AlertTriangleIcon className="h-4 w-4" />
        <AlertDescription>
          La signature a expiré. Une re-signature est requise avant de télécharger le PDF.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleDownload}
        disabled={isDownloading}
        variant="default"
      >
        <DownloadIcon className="mr-2 h-4 w-4" />
        {isDownloading ? 'Téléchargement...' : label}
      </Button>
      <div className="flex items-center gap-2">
        <SignatureBadge status={signatureStatus} />
      </div>
    </div>
  )
}
