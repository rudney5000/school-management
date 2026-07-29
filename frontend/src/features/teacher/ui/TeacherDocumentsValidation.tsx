import {
    useEffect,
    useState
} from 'react'
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
import {
    type TeacherContractPdfParams,
    useDownloadDocumentPdf,
    usePreviewDocumentPdf,
    useSignTeacherContract,
    useTeacherContractSignatureStatus
} from "@entities/document-signature";
import {Eye} from "lucide-react";
import {
    toPdfLocale
} from "@shared/config/i18n/locale-config";
import i18n from "@app/i18n/i18n";

const REQUIRED_CATEGORIES: AttachmentCategory[] = [
    'identity_document',
    'diploma',
    'criminal_record',
    'teacher_photo',
    'resume',
    'medical_certificate',
]

interface TeacherDocumentsValidationProps {
    attachments: Attachment[]
    teacherId: string
    subSchoolId: string
}

export function TeacherDocumentsValidation({
                                               attachments = [],
                                               teacherId,
                                               subSchoolId
}: TeacherDocumentsValidationProps) {
    const { t } = useTranslation()
    const [rejectDrawerOpen, setRejectDrawerOpen] = useState(false)
    const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')

    const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const pendingAttachments = attachments.filter((a) => a.status === 'pending')

    const validateMutation = useValidateAttachment()
    const rejectMutation = useRejectAttachment()
    const { data: signatureStatus } = useTeacherContractSignatureStatus({ subSchoolId, teacherId })
    const signMutation = useSignTeacherContract()
    const downloadPdf = useDownloadDocumentPdf()
    const previewPdf = usePreviewDocumentPdf()

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

    const handleSignContract = () => {
        signMutation.mutate({ subSchoolId, teacherId })
    }

    const handlePreviewPdf = () => {
        const params: TeacherContractPdfParams = { subSchoolId, teacherId, locale: toPdfLocale(i18n.language), preview: true }
        previewPdf.mutate({ documentType: 'teacher_contract', params })
    }

    useEffect(() => {
        if (!previewDrawerOpen && previewUrl) {
            URL.revokeObjectURL(previewUrl)
            setPreviewUrl(null)
        }
    }, [previewDrawerOpen])

    const handleDownloadPdf = () => {
        downloadPdf.mutate({
            documentType: 'teacher_contract',
            params: { subSchoolId, teacherId, locale: toPdfLocale(i18n.language) },
            filename: `contrat-${teacherId}.pdf`,
        })
    }

    const validatedCategories = new Set(
        attachments.filter((a) => a.status === 'validated').map((a) => a.category)
    )
    const allRequiredValidated = REQUIRED_CATEGORIES.every((c) => validatedCategories.has(c))

    const isSigned = signatureStatus?.isSigned === true
    const isStale = isSigned && signatureStatus.isStale
    const canSign = allRequiredValidated && (!isSigned || isStale)

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h2 className="text-lg font-semibold">
                    {t("dashboard.teachers.documents.validation.title")}
                </h2>

                <div className="flex items-center gap-2 flex-wrap">
                    {canSign && (
                        <Button onClick={handleSignContract} disabled={signMutation.isPending}>
                            {signMutation.isPending
                                ? t("dashboard.teachers.documents.validation.signingInProgress")
                                : isStale
                                    ? t("dashboard.teachers.documents.validation.resignContract")
                                    : t("dashboard.teachers.documents.validation.signContract")}
                        </Button>
                    )}
                    <Button
                        size="icon"
                        variant="outline"
                        onClick={handlePreviewPdf}
                        disabled={!allRequiredValidated || previewPdf.isPending}
                        title={
                            !allRequiredValidated
                                ? t("dashboard.teachers.documents.validation.previewDisabled")
                                : t("dashboard.teachers.documents.validation.preview")
                        }
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleDownloadPdf}
                        disabled={!isSigned || downloadPdf.isPending}
                        title={
                            !isSigned
                                ? t("dashboard.teachers.documents.validation.downloadDisabled")
                                : undefined
                        }
                    >
                        {downloadPdf.isPending
                            ? t("dashboard.teachers.documents.validation.downloading")
                            : t("dashboard.teachers.documents.validation.downloadContract")}
                    </Button>
                </div>

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

            <CustomDrawer
                isOpen={previewDrawerOpen}
                handleOpen={() => setPreviewDrawerOpen(false)}
                drawerTitle={t("dashboard.teachers.documents.validation.previewDrawerTitle")}
                drawerDescription={t("dashboard.teachers.documents.validation.previewDrawerDescription")}
            >
                {previewUrl && (
                    <iframe
                        src={previewUrl}
                        title={t("dashboard.teachers.documents.validation.previewIframeTitle")}
                        className="w-full h-[75vh] rounded-md border"
                    />
                )}
            </CustomDrawer>
        </div>
    )
}