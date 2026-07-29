import { useAttachments } from '@entities/attachment'
import { useAppSelector } from '@shared/store/hooks'
import {
    TeacherDocumentsUpload,
    TeacherDocumentsValidation
} from '@features/teacher'
import type { UserRole } from '@features/auth/model/dto/RegisterDto'
import {useTranslation} from "@shared/lib";
import {Spinner} from "@shared/ui";

const VALIDATOR_ROLES: UserRole[] = [
    'admin',
    'director',
    'super_admin'
]

interface TeacherDocumentsPanelProps {
    teacherId: string
    subSchoolId: string
}

export function TeacherDocumentsPanel({ teacherId, subSchoolId }: TeacherDocumentsPanelProps) {
    const { t } = useTranslation()
    const { data: attachments, isLoading } = useAttachments({ attachableType: 'teacher', attachableId: teacherId })
    const role = useAppSelector((state) => state.auth.role)
    const canValidate = role ? VALIDATOR_ROLES.includes(role) : false

    if (isLoading) {
        return <div className="text-sm text-muted-foreground">
            <Spinner/>
            {t("dashboard.teachers.documents.loading")}
        </div>
    }

    return (
        <div className="space-y-8">
            <TeacherDocumentsUpload teacherId={teacherId} />
            {canValidate && (
                <TeacherDocumentsValidation
                    attachments={attachments ?? []}
                    teacherId={teacherId}
                    subSchoolId={subSchoolId} />
            )}
        </div>
    )
}