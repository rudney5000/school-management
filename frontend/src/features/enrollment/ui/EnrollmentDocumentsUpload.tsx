import { useAttachments } from '@entities/attachment'
import { AttachmentUploadZone } from '@entities/attachment/ui'
import { Badge } from '@shared/ui/badge'
import type {
  AttachmentCategory
} from '@entities/attachment/model/types'
import {useTranslation} from "@shared/lib";
import {Spinner} from "@shared/ui";

const REQUIRED_CATEGORIES: AttachmentCategory[] = [
  'birth_certificate',
  'medical_certificate',
  'previous_report',
  'student_photo',
  'parent_id',
]

interface EnrollmentDocumentsUploadProps {
  enrollmentId: string
}

export function EnrollmentDocumentsUpload({ enrollmentId }: EnrollmentDocumentsUploadProps) {
  const { t } = useTranslation()
  const { data: attachments, isLoading } = useAttachments({
    attachableType: 'enrollment',
    attachableId: enrollmentId,
  })

  const getAttachmentByCategory = (category: AttachmentCategory) => {
    const matches = attachments?.filter((a) => a.category === category) ?? []
    if (matches.length === 0) return undefined

    return matches.reduce((latest, current) =>
        new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
    )
  }

  const getStatusBadge = (category: AttachmentCategory) => {
    const attachment = getAttachmentByCategory(category)

    if (!attachment) {
      return (
          <Badge variant="outline">
            {t("dashboard.enrollment.documents.status.missing")}
          </Badge>
      )
    }

    const statusConfig = {
      pending: {
        label: t("dashboard.enrollment.documents.status.pending"),
        variant: 'outline' as const
      },
      validated: {
        label: t("dashboard.enrollment.documents.status.validated"),
        variant: 'success' as const
      },
      rejected: {
        label: t("dashboard.enrollment.documents.status.rejected"),
        variant: 'destructive' as const
      },
    }

    const config = statusConfig[attachment.status]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (isLoading) {
    return (
        <div className="text-sm text-muted-foreground">
          <Spinner/>
          {t("dashboard.enrollment.documents.loading")}
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">
        {t("dashboard.enrollment.documents.title")}
      </h2>
      
      <div className="space-y-4">
        {REQUIRED_CATEGORIES.map((category) => (
          <div key={category} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                {t(`dashboard.enrollment.documents.categories.${category}`)}
              </label>
              {getStatusBadge(category)}
            </div>
            
            <AttachmentUploadZone
              attachableType="enrollment"
              attachableId={enrollmentId}
              category={category}
              existingAttachment={getAttachmentByCategory(category)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
