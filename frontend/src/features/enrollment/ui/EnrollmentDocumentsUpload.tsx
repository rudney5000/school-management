import { useAttachments } from '@entities/attachment'
import { AttachmentUploadZone } from '@entities/attachment/ui'
import { Badge } from '@shared/ui/badge'
import type { AttachmentCategory } from '@entities/attachment/model/types'

const REQUIRED_CATEGORIES: AttachmentCategory[] = [
  'birth_certificate',
  'medical_certificate',
  'previous_report',
  'student_photo',
  'parent_id',
]

const categoryLabels: Record<AttachmentCategory, string> = {
  birth_certificate: 'Certificat de naissance',
  medical_certificate: 'Certificat médical',
  previous_report: 'Bulletin précédent',
  student_photo: 'Photo de l\'élève',
  parent_id: "Pièce d'identité du parent",
  payment_receipt: 'Reçu de paiement',
  other: 'Autre',
}

interface EnrollmentDocumentsUploadProps {
  enrollmentId: string
}

export function EnrollmentDocumentsUpload({ enrollmentId }: EnrollmentDocumentsUploadProps) {
  const { data: attachments, isLoading } = useAttachments({
    attachableType: 'enrollment',
    attachableId: enrollmentId,
  })

  const getAttachmentByCategory = (category: AttachmentCategory) => {
    return attachments?.find((a) => a.category === category)
  }

  const getStatusBadge = (category: AttachmentCategory) => {
    const attachment = getAttachmentByCategory(category)
    
    if (!attachment) {
      return <Badge variant="outline">Manquant</Badge>
    }

    const statusConfig = {
      pending: { label: 'En attente', variant: 'outline' as const },
      validated: { label: 'Validé', variant: 'success' as const },
      rejected: { label: 'Rejeté', variant: 'destructive' as const },
    }

    const config = statusConfig[attachment.status]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Documents requis</h2>
      
      <div className="space-y-4">
        {REQUIRED_CATEGORIES.map((category) => (
          <div key={category} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                {categoryLabels[category]}
              </label>
              {getStatusBadge(category)}
            </div>
            
            <AttachmentUploadZone
              attachableType="enrollment"
              attachableId={enrollmentId}
              category={category}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
