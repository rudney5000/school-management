import { useState } from 'react'
import {
    useValidateAttachment,
    useRejectAttachment,
    AttachmentCard,
    type Attachment,
    type AttachmentCategory
} from '@entities/attachment'
import {
    Badge,
    Button,
    Label,
    Textarea
} from '@shared/ui'
import CustomDrawer from '@shared/ui/custom-drawer/custom-drawer'
import {useTranslation} from "@shared/lib";

const REQUIRED_CATEGORIES: AttachmentCategory[] = [
    'identity_document',
    'diploma',
    'criminal_record',
    'resume',
    'medical_certificate',
]

interface TeacherDocumentsValidationProps {
    attachments: Attachment[]
}

export function TeacherDocumentsValidation({ attachments = [] }: TeacherDocumentsValidationProps) {
    const { t } = useTranslation()
    const [rejectDrawerOpen, setRejectDrawerOpen] = useState(false)
    const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')

    const pendingAttachments = attachments.filter((a) => a.status === 'pending')

    const validateMutation = useValidateAttachment()
    const rejectMutation = useRejectAttachment()

    const handleValidate = (attachmentId: string) => {
        validateMutation.mutate({ id: attachmentId })
    }

    const handleRejectClick = (attachment: Attachment) => {
        setSelectedAttachment(attachment)
        setRejectionReason('')
        setRejectDrawerOpen(true)
    }

    const handleRejectConfirm = () => {
        if (!selectedAttachment) return
        rejectMutation.mutate(
            { id: selectedAttachment.id, reason: rejectionReason },
            {
                onSuccess: () => {
                    setRejectDrawerOpen(false)
                    setSelectedAttachment(null)
                    setRejectionReason('')
                },
            }
        )
    }

    const validatedCategories = new Set(
        attachments.filter((a) => a.status === 'validated').map((a) => a.category)
    )
    const allRequiredValidated = REQUIRED_CATEGORIES.every((c) => validatedCategories.has(c))

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h2 className="text-lg font-semibold">
                    {t("dashboard.teachers.documents.validation.title")}
                </h2>
                {allRequiredValidated && (
                    <Badge variant="success">
                        {t("dashboard.teachers.documents.validation.complete")}
                    </Badge>
                )}
            </div>

            {pendingAttachments.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                        {t("dashboard.teachers.documents.validation.empty")}
                    </p>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {pendingAttachments.map((attachment) => (
                        <div key={attachment.id} className="space-y-2">
                            <p className="text-sm font-medium text-zinc-700">
                                {t(`dashboard.teachers.documents.categories.${attachment.category}`)}
                            </p>
                            <AttachmentCard attachment={attachment}/>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleValidate(attachment.id)}
                                    disabled={validateMutation.isPending}
                                    className="flex-1"
                                >
                                    {t("dashboard.teachers.documents.validation.validate")}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRejectClick(attachment)}
                                    disabled={rejectMutation.isPending}
                                    className="flex-1"
                                >
                                    {t("dashboard.teachers.documents.validation.reject")}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CustomDrawer
                isOpen={rejectDrawerOpen}
                handleOpen={() => setRejectDrawerOpen(!rejectDrawerOpen)}
                drawerTitle={t("dashboard.teachers.documents.validation.rejectDrawerTitle")}
                drawerDescription={t("dashboard.teachers.documents.validation.rejectDrawerDescription")}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="reason">
                            {t("dashboard.teachers.documents.validation.rejectReason")}
                        </Label>
                        <Textarea
                            id="reason"
                            placeholder={t("dashboard.teachers.documents.validation.rejectPlaceholder")}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setRejectDrawerOpen(false)}
                        >
                            {t("dashboard.teachers.documents.validation.cancel")}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRejectConfirm}
                            disabled={!rejectionReason.trim() || rejectMutation.isPending}
                        >
                            {rejectMutation.isPending
                                ? t("dashboard.teachers.documents.validation.rejectInProgress")
                                : t("dashboard.teachers.documents.validation.confirmReject")}
                        </Button>
                    </div>
                </div>
            </CustomDrawer>
        </div>
    )
}