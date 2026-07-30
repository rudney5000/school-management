import { useState } from 'react'
import { FileCheck2 } from 'lucide-react'
import { useStudentEnrollment } from '@entities/enrollment'
import {
    useEnrollmentSignatureStatus
} from '@entities/document-signature'
import {
    Badge,
    Button, Spinner
} from '@shared/ui'
import CustomDrawer from '@shared/ui/custom-drawer/custom-drawer'
import { EnrollmentDocumentsPanel } from '@features/enrollment'
import { CreateEnrollmentForm } from '@features/enrollment'
import {useTranslation} from "@shared/lib";

interface StudentEnrollmentCardProps {
    studentId: string
    subSchoolId: string
}

export function StudentEnrollmentCard({ studentId, subSchoolId }: StudentEnrollmentCardProps) {
    const { t } = useTranslation()
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const { enrollment, isLoading } = useStudentEnrollment(studentId)
    const { data: signatureStatus } = useEnrollmentSignatureStatus(
        enrollment ? { subSchoolId, enrollmentId: enrollment.id, studentId } : undefined
    )

    if (isLoading) {
        return <div className="text-sm text-muted-foreground">
            <Spinner/>
            {t("dashboard.enrollment.students.loading")}
        </div>
    }

    const isSigned = signatureStatus?.isSigned === true
    const isStale = isSigned && signatureStatus.isStale

    return (
        <div className="rounded-2xl bg-white border border-zinc-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(23,85,236,0.04)] p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-[#1755EC]"/>
                    <h4 className="text-sm font-semibold text-zinc-900">
                        {t("dashboard.enrollment.students.title")}
                    </h4>
                </div>
                {enrollment ? (
                    <Badge variant={isSigned ? (isStale ? 'outline' : 'success') : 'outline'}>
                        {
                            isSigned
                                ? (
                                    isStale
                                        ? t("dashboard.enrollment.students.signedStale")
                                        : t("dashboard.enrollment.students.signed")
                                )
                                : enrollment.status === "complete"
                                    ? t("dashboard.enrollment.students.complete")
                                    : t("dashboard.enrollment.students.draft")
                        }
                    </Badge>
                ) : (
                    <Badge variant="outline">
                        {t("dashboard.enrollment.students.none")}
                    </Badge>
                )}
            </div>

            {enrollment ? (
                <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsDrawerOpen(true)}
                >
                    {t("dashboard.enrollment.students.manageDocuments")}
                </Button>
            ) : (
                <CreateEnrollmentForm
                    studentId={studentId}
                    subSchoolId={subSchoolId}
                />
            )}

            <CustomDrawer
                isOpen={isDrawerOpen}
                handleOpen={() => setIsDrawerOpen(!isDrawerOpen)}
                drawerTitle={t("dashboard.enrollment.students.drawerTitle")}
                drawerDescription={t("dashboard.enrollment.students.drawerDescription")}
            >
                {enrollment && (
                    <EnrollmentDocumentsPanel
                        enrollmentId={enrollment.id}
                        subSchoolId={subSchoolId}
                        studentId={studentId}
                    />
                )}
            </CustomDrawer>
        </div>
    )
}