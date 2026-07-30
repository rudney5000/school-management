import { useAttachments } from '@entities/attachment'
import { EnrollmentDocumentsUpload } from '@features/enrollment'
import { EnrollmentDocumentsValidation } from '@features/enrollment'
import {useAppSelector} from "@shared/store/hooks";
import {useTranslation} from "@shared/lib";

const VALIDATOR_ROLES = ['admin', 'director', 'super_admin']

interface EnrollmentDocumentsPanelProps {
    enrollmentId: string
    subSchoolId: string
    studentId: string
}

export function EnrollmentDocumentsPanel({ enrollmentId, subSchoolId, studentId }: EnrollmentDocumentsPanelProps) {
    const { t } = useTranslation()
    const { data: attachments, isLoading } = useAttachments({ attachableType: 'enrollment', attachableId: enrollmentId })
    const role = useAppSelector((state) => state.auth.role)
    const canValidate = role ? VALIDATOR_ROLES.includes(role) : false

    if (isLoading) {
        return <div className="text-sm text-muted-foreground">
            {t("dashboard.enrollment.documents.loadingDocuments")}
        </div>
    }

    return (
        <div className="space-y-8">
            <EnrollmentDocumentsUpload enrollmentId={enrollmentId} />
            {canValidate && (
                <EnrollmentDocumentsValidation
                    attachments={attachments ?? []}
                    enrollmentId={enrollmentId}
                    subSchoolId={subSchoolId}
                    studentId={studentId}
                />
            )}
        </div>
    )
}