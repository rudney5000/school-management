import {
    useCallback,
    useState
} from 'react'
import {
    AlertTriangle,
    Check,
    FileIcon,
    X
} from "lucide-react";
import {
    type AttachableType,
    type Attachment,
    type AttachmentCategory,
    useDeleteAttachment,
    useUploadAttachment
} from '@entities/attachment'
import {useTranslation} from "@shared/lib";
import {useAppSelector} from "@shared/store/hooks";

const PRIVILEGED_ROLES = ['admin', 'director', 'super_admin']
const OWNER_DELETABLE_STATUSES = ['pending', 'rejected']

interface AttachmentUploadZoneProps {
  attachableType: AttachableType
  attachableId: string
  category: AttachmentCategory
  existingAttachment?: Attachment
  onUploadSuccess?: (attachment: Attachment) => void
  onDeleteSuccess?: () => void
}

export function AttachmentUploadZone({
  attachableType,
  attachableId,
  existingAttachment,
  category,
  onUploadSuccess,
  onDeleteSuccess
}: AttachmentUploadZoneProps) {
    const { t } = useTranslation()
    const { upload, cancel, isUploading, uploadProgress } = useUploadAttachment()
    const deleteMutation = useDeleteAttachment()

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [confirmingDelete, setConfirmingDelete] = useState(false)

    const currentUserId = useAppSelector((state) => state.auth.userId)
    const role = useAppSelector((state) => state.auth.role)
    const isPrivileged = role ? PRIVILEGED_ROLES.includes(role) : false

    const resetLocalState = () => {
        setSelectedFile(null)
        setError(null)
        setConfirmingDelete(false)
    }

    const doUpload = useCallback(
        async (file: File) => {
            setSelectedFile(file)
            setError(null)

            const result = await upload({ file, attachableType, attachableId, category })

            if (result) {
                onUploadSuccess?.(result)
            }
        },
        [upload, attachableType, attachableId, category, onUploadSuccess]
    )

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            const file = e.dataTransfer.files[0]
            if (file) doUpload(file)
        },
        [doUpload]
    )

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (file) doUpload(file)
            e.target.value = ''
        },
        [doUpload]
    )

    if (isUploading || selectedFile) {
        return (
            <div className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-sm truncate">{selectedFile?.name}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            if (isUploading) cancel()
                            resetLocalState()
                        }}
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                        aria-label="Annuler l'upload"
                    >
                        <X className="h-4 w-4"/>
                    </button>
                </div>

                {isUploading && (
                    <div className="space-y-1">
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-150"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground text-right">{uploadProgress}%</p>
                    </div>
                )}

                {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
        )
    }

    if (existingAttachment) {
        const isOwner = existingAttachment.uploadedBy === currentUserId
        const isValidated = existingAttachment.status === 'validated'

        const canDelete = isPrivileged
            || (isOwner && OWNER_DELETABLE_STATUSES.includes(existingAttachment.status))

        const handleDeleteClick = () => {
            if (isValidated && isPrivileged) {
                setConfirmingDelete(true)
                return
            }
            deleteMutation.mutate(existingAttachment.id, {
                onSuccess: onDeleteSuccess,
            })
        }

        const handleConfirmDelete = () => {
            deleteMutation.mutate(existingAttachment.id, {
                onSuccess: () => {
                    setConfirmingDelete(false)
                    onDeleteSuccess?.()
                },
            })
        }

        if (confirmingDelete) {
            return (
                <div className="border border-destructive/40 rounded-lg p-3 space-y-2 bg-destructive/5">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
                        <p className="text-xs text-destructive">
                            Ce document est validé. Le supprimer invalidera la signature de
                            l'inscription (elle devra être re-signée).
                        </p>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button
                            type="button"
                            onClick={() => setConfirmingDelete(false)}
                            disabled={deleteMutation.isPending}
                            className="text-xs px-2 py-1 rounded border text-muted-foreground hover:bg-muted disabled:opacity-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmDelete}
                            disabled={deleteMutation.isPending}
                            className="text-xs px-2 py-1 rounded bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                        >
                            {deleteMutation.isPending ? 'Suppression...' : 'Confirmer la suppression'}
                        </button>
                    </div>
                </div>
            )
        }

        return (
            <div className="border rounded-lg p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    {isValidated
                        ? <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                        : <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    }
                    <span className="text-sm truncate">{existingAttachment.filename}</span>
                </div>

                {canDelete && (
                    <button
                        type="button"
                        onClick={handleDeleteClick}
                        disabled={deleteMutation.isPending}
                        className="shrink-0 text-muted-foreground hover:text-destructive disabled:opacity-50"
                        aria-label="Supprimer le fichier"
                        title={
                            isValidated
                                ? 'Document validé — la suppression invalidera la signature'
                                : 'Supprimer le fichier'
                        }
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        )
    }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
      />
      <label htmlFor="file-upload" className="cursor-pointer">
          {isUploading ? (
              <p className="text-sm text-muted-foreground">
                  {t("dashboard.enrollment.documents.upload.uploading")}
              </p>
          ) : (
              <>
                  <p className="text-sm font-medium text-foreground">
                      {t("dashboard.enrollment.documents.upload.drop")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                      {t("dashboard.enrollment.documents.upload.select")}
                  </p>
              </>
          )}
      </label>
    </div>
  )
}
