import { useState } from 'react'
import { useValidateAttachment, useRejectAttachment } from '@entities/attachment'
import { useEnrollmentSignatureStatus, useSignEnrollment } from '@entities/document-signature'
import { AttachmentCard } from '@entities/attachment/ui'
import { Badge } from '@shared/ui/badge'
import { Button } from '@shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@shared/ui/dialog'
import { Textarea } from '@shared/ui/textarea'
import { Label } from '@shared/ui/label'
import type { Attachment } from '@entities/attachment/model/types'

interface EnrollmentDocumentsValidationProps {
  pendingAttachments: Attachment[]
  enrollmentId: string
  subSchoolId: string
  studentId: string
}

export function EnrollmentDocumentsValidation({
  pendingAttachments,
  enrollmentId,
  subSchoolId,
  studentId,
}: EnrollmentDocumentsValidationProps) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const validateMutation = useValidateAttachment()
  const rejectMutation = useRejectAttachment()
  const { data: signatureStatus } = useEnrollmentSignatureStatus({
    subSchoolId,
    enrollmentId,
    studentId,
  })
  const signMutation = useSignEnrollment()

  const handleValidate = (attachmentId: string) => {
    validateMutation.mutate({ id: attachmentId })
  }

  const handleRejectClick = (attachment: Attachment) => {
    setSelectedAttachment(attachment)
    setRejectionReason('')
    setRejectDialogOpen(true)
  }

  const handleRejectConfirm = () => {
    if (!selectedAttachment) return

    rejectMutation.mutate(
      {
        id: selectedAttachment.id,
        reason: rejectionReason,
      },
      {
        onSuccess: () => {
          setRejectDialogOpen(false)
          setSelectedAttachment(null)
          setRejectionReason('')
        },
      }
    )
  }

  const handleSignEnrollment = () => {
    signMutation.mutate({
      subSchoolId,
      enrollmentId,
      studentId,
    })
  }

  const canSign = signatureStatus?.isSigned === false && pendingAttachments.length === 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Documents en attente de validation</h2>
        {canSign && (
          <Button onClick={handleSignEnrollment} disabled={signMutation.isPending}>
            {signMutation.isPending ? 'Signature en cours...' : 'Signer l\'inscription'}
          </Button>
        )}
      </div>

      {pendingAttachments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Aucun document en attente de validation
          </p>
          {signatureStatus?.isSigned && (
            <Badge variant="success" className="mt-2">
              Inscription signée
            </Badge>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pendingAttachments.map((attachment) => (
            <div key={attachment.id} className="space-y-2">
              <AttachmentCard attachment={attachment} />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleValidate(attachment.id)}
                  disabled={validateMutation.isPending}
                  className="flex-1"
                >
                  Valider
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRejectClick(attachment)}
                  disabled={rejectMutation.isPending}
                  className="flex-1"
                >
                  Rejeter
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter le document</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison du rejet de ce document.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Raison du rejet</Label>
              <Textarea
                id="reason"
                placeholder="Expliquez pourquoi ce document est rejeté..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!rejectionReason.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? 'Rejet en cours...' : 'Confirmer le rejet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
