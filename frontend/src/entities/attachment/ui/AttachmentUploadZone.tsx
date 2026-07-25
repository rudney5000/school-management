import { useCallback } from 'react'
import { useUploadAttachment } from '../lib/useUploadAttachment'
import type { AttachableType, AttachmentCategory } from '../model/types'

interface AttachmentUploadZoneProps {
  attachableType: AttachableType
  attachableId: string
  category: AttachmentCategory
  onUploadSuccess?: (attachment: any) => void
}

export function AttachmentUploadZone({
  attachableType,
  attachableId,
  category,
  onUploadSuccess,
}: AttachmentUploadZoneProps) {
  const { upload, isUploading } = useUploadAttachment()

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (!file) return

      const result = await upload({
        file,
        attachableType,
        attachableId,
        category,
      })

      if (result && onUploadSuccess) {
        onUploadSuccess(result)
      }
    },
    [upload, attachableType, attachableId, category, onUploadSuccess]
  )

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const result = await upload({
        file,
        attachableType,
        attachableId,
        category,
      })

      if (result && onUploadSuccess) {
        onUploadSuccess(result)
      }
    },
    [upload, attachableType, attachableId, category, onUploadSuccess]
  )

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
          <p className="text-sm text-muted-foreground">Upload en cours...</p>
        ) : (
          <>
            <p className="text-sm font-medium text-foreground">
              Glissez-déposez un fichier ici
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ou cliquez pour sélectionner
            </p>
          </>
        )}
      </label>
    </div>
  )
}
